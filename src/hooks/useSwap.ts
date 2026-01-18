'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { VersionedTransaction } from '@solana/web3.js';
import { jupiterService } from '@/services/jupiter';
import { raikuClient } from '@/lib/raiku';
import { CONFIG } from '@/config';
import type {
  Token,
  SwapQuote,
  SwapState,
  TransactionState,
  RaikuTransactionStatus,
} from '@/types';
import { SOL_TOKEN, USDC_TOKEN } from '@/types';

export function useSwap() {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  const [swapState, setSwapState] = useState<SwapState>({
    inputToken: SOL_TOKEN,
    outputToken: USDC_TOKEN,
    inputAmount: '',
    outputAmount: '',
    quote: null,
    isLoadingQuote: false,
    slippageBps: CONFIG.DEFAULT_SLIPPAGE_BPS,
  });

  const [txState, setTxState] = useState<TransactionState>({
    status: 'idle',
  });

  const quoteTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const statusPollRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch quote when input changes
  const fetchQuote = useCallback(async (
    inputToken: Token | null,
    outputToken: Token | null,
    inputAmount: string,
    slippageBps: number
  ) => {
    if (!inputToken || !outputToken || !inputAmount || parseFloat(inputAmount) <= 0) {
      setSwapState((prev) => ({ ...prev, quote: null, outputAmount: '' }));
      return;
    }

    setSwapState((prev) => ({ ...prev, isLoadingQuote: true }));

    try {
      const amountInSmallestUnit = Math.floor(
        parseFloat(inputAmount) * 10 ** inputToken.decimals
      ).toString();

      const quote = await jupiterService.getQuote({
        inputMint: inputToken.address,
        outputMint: outputToken.address,
        amount: amountInSmallestUnit,
        slippageBps,
      });

      const outputAmount = (
        parseInt(quote.outAmount) / 10 ** outputToken.decimals
      ).toFixed(outputToken.decimals);

      setSwapState((prev) => ({
        ...prev,
        quote,
        outputAmount,
        isLoadingQuote: false,
      }));
    } catch (error) {
      console.error('Quote fetch failed:', error);
      setSwapState((prev) => ({
        ...prev,
        quote: null,
        outputAmount: '',
        isLoadingQuote: false,
      }));
    }
  }, []);

  // Debounced quote fetch
  useEffect(() => {
    if (quoteTimeoutRef.current) {
      clearTimeout(quoteTimeoutRef.current);
    }

    quoteTimeoutRef.current = setTimeout(() => {
      fetchQuote(
        swapState.inputToken,
        swapState.outputToken,
        swapState.inputAmount,
        swapState.slippageBps
      );
    }, 500);

    return () => {
      if (quoteTimeoutRef.current) {
        clearTimeout(quoteTimeoutRef.current);
      }
    };
  }, [swapState.inputToken, swapState.outputToken, swapState.inputAmount, swapState.slippageBps, fetchQuote]);

  // Poll for transaction status
  const pollTransactionStatus = useCallback(
    async (preConfirmationId: string) => {
      const poll = async () => {
        try {
          const status: RaikuTransactionStatus =
            await raikuClient.getStatus(preConfirmationId);

          if (status.status === 'pre_confirmed') {
            setTxState((prev) => ({
              ...prev,
              status: 'pre_confirmed',
              latencyMs: status.confirmationTimeMs,
            }));
          } else if (status.status === 'confirmed' || status.status === 'finalized') {
            setTxState({
              status: 'confirmed',
              signature: status.signature,
              preConfirmationId,
              latencyMs: status.confirmationTimeMs,
            });
            if (statusPollRef.current) {
              clearInterval(statusPollRef.current);
              statusPollRef.current = null;
            }
          } else if (status.status === 'failed') {
            setTxState({
              status: 'failed',
              error: status.error || 'Transaction failed',
              preConfirmationId,
            });
            if (statusPollRef.current) {
              clearInterval(statusPollRef.current);
              statusPollRef.current = null;
            }
          }
        } catch (error) {
          console.error('Status poll error:', error);
        }
      };

      statusPollRef.current = setInterval(poll, CONFIG.STATUS_POLL_INTERVAL_MS);
      poll(); // Initial poll
    },
    []
  );

  // Execute swap
  const executeSwap = useCallback(async () => {
    if (!publicKey || !signTransaction || !swapState.quote) {
      return;
    }

    setTxState({ status: 'signing' });

    try {
      // Get swap transaction from Jupiter
      const swapTransaction = await jupiterService.getSwapTransaction({
        quoteResponse: swapState.quote,
        userPublicKey: publicKey.toBase58(),
      });

      // Decode and sign the transaction
      const transactionBuffer = Buffer.from(swapTransaction, 'base64');
      const transaction = VersionedTransaction.deserialize(transactionBuffer);

      // Get latest blockhash
      const { blockhash, lastValidBlockHeight } =
        await connection.getLatestBlockhash('confirmed');
      transaction.message.recentBlockhash = blockhash;

      // Sign transaction
      const signedTransaction = await signTransaction(transaction);
      const serializedTransaction = Buffer.from(
        signedTransaction.serialize()
      ).toString('base64');

      setTxState({ status: 'submitting' });

      // Submit via Raiku JIT
      const jitResponse = await raikuClient.submitJIT({
        transaction: serializedTransaction,
        priorityLevel: 'turbo',
      });

      if (!jitResponse.success) {
        throw new Error(jitResponse.error || 'JIT submission failed');
      }

      setTxState({
        status: 'submitting',
        preConfirmationId: jitResponse.preConfirmationId,
        latencyMs: jitResponse.estimatedLatencyMs,
      });

      // Start polling for status
      pollTransactionStatus(jitResponse.preConfirmationId);
    } catch (error) {
      console.error('Swap execution failed:', error);
      setTxState({
        status: 'failed',
        error: error instanceof Error ? error.message : 'Swap failed',
      });
    }
  }, [publicKey, signTransaction, swapState.quote, connection, pollTransactionStatus]);

  // Token selection handlers
  const setInputToken = useCallback((token: Token) => {
    setSwapState((prev) => ({
      ...prev,
      inputToken: token,
      quote: null,
      outputAmount: '',
    }));
  }, []);

  const setOutputToken = useCallback((token: Token) => {
    setSwapState((prev) => ({
      ...prev,
      outputToken: token,
      quote: null,
      outputAmount: '',
    }));
  }, []);

  const setInputAmount = useCallback((amount: string) => {
    setSwapState((prev) => ({ ...prev, inputAmount: amount }));
  }, []);

  const setSlippage = useCallback((slippageBps: number) => {
    setSwapState((prev) => ({ ...prev, slippageBps }));
  }, []);

  const switchTokens = useCallback(() => {
    setSwapState((prev) => ({
      ...prev,
      inputToken: prev.outputToken,
      outputToken: prev.inputToken,
      inputAmount: prev.outputAmount,
      outputAmount: prev.inputAmount,
      quote: null,
    }));
  }, []);

  const resetTransaction = useCallback(() => {
    setTxState({ status: 'idle' });
    if (statusPollRef.current) {
      clearInterval(statusPollRef.current);
      statusPollRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (quoteTimeoutRef.current) clearTimeout(quoteTimeoutRef.current);
      if (statusPollRef.current) clearInterval(statusPollRef.current);
    };
  }, []);

  return {
    swapState,
    txState,
    setInputToken,
    setOutputToken,
    setInputAmount,
    setSlippage,
    switchTokens,
    executeSwap,
    resetTransaction,
    isWalletConnected: !!publicKey,
  };
}

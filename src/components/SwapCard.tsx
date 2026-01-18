'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { TokenSelector } from './TokenSelector';
import { TransactionStatus } from './TransactionStatus';
import { SlippageSettings } from './SlippageSettings';
import { useSwap } from '@/hooks/useSwap';

export function SwapCard() {
  const { connected } = useWallet();
  const { setVisible } = useWalletModal();
  const {
    swapState,
    txState,
    setInputToken,
    setOutputToken,
    setInputAmount,
    setSlippage,
    switchTokens,
    executeSwap,
    resetTransaction,
    isWalletConnected,
  } = useSwap();

  const { inputToken, outputToken, inputAmount, outputAmount, quote, isLoadingQuote, slippageBps } =
    swapState;

  const priceImpact = quote?.priceImpactPct ?? 0;
  const isPriceImpactHigh = priceImpact > 1;
  const isPriceImpactVeryHigh = priceImpact > 5;

  const canSwap =
    connected &&
    quote &&
    inputAmount &&
    parseFloat(inputAmount) > 0 &&
    txState.status === 'idle';

  const handleSwap = () => {
    if (canSwap) {
      executeSwap();
    }
  };

  const handleConnectWallet = () => {
    setVisible(true);
  };

  // Show transaction status overlay when transaction is in progress
  if (txState.status !== 'idle') {
    return (
      <TransactionStatus
        txState={txState}
        inputToken={inputToken}
        outputToken={outputToken}
        inputAmount={inputAmount}
        outputAmount={outputAmount}
        onClose={resetTransaction}
      />
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-[#111111] border border-[#222222] rounded-2xl p-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <span className="text-[#BFFF00]">⚡</span>
            Flash Swap
          </h2>
          <SlippageSettings slippageBps={slippageBps} onSlippageChange={setSlippage} />
        </div>

        {/* Input section */}
        <div className="bg-[#0a0a0a] rounded-xl p-4 mb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">You pay</span>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              value={inputAmount}
              onChange={(e) => setInputAmount(e.target.value)}
              placeholder="0.00"
              className="token-input flex-1 bg-transparent text-2xl font-semibold outline-none"
            />
            <TokenSelector
              selectedToken={inputToken}
              onSelect={setInputToken}
              excludeToken={outputToken}
            />
          </div>
        </div>

        {/* Switch button */}
        <div className="flex justify-center -my-2 relative z-10">
          <button
            onClick={switchTokens}
            className="w-10 h-10 bg-[#1a1a1a] border border-[#333333] rounded-xl flex items-center justify-center hover:bg-[#252525] hover:border-[#BFFF00] transition-all"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </button>
        </div>

        {/* Output section */}
        <div className="bg-[#0a0a0a] rounded-xl p-4 mt-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">You receive</span>
            {isLoadingQuote && (
              <div className="w-4 h-4 border-2 border-[#BFFF00] border-t-transparent rounded-full animate-spin" />
            )}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={outputAmount}
              readOnly
              placeholder="0.00"
              className="flex-1 bg-transparent text-2xl font-semibold outline-none text-gray-300"
            />
            <TokenSelector
              selectedToken={outputToken}
              onSelect={setOutputToken}
              excludeToken={inputToken}
            />
          </div>
        </div>

        {/* Quote details */}
        {quote && (
          <div className="mt-4 p-3 bg-[#0a0a0a] rounded-xl space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Price Impact</span>
              <span
                className={
                  isPriceImpactVeryHigh
                    ? 'text-red-500'
                    : isPriceImpactHigh
                    ? 'text-yellow-500'
                    : 'text-green-500'
                }
              >
                {priceImpact.toFixed(2)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Slippage Tolerance</span>
              <span>{(slippageBps / 100).toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Route</span>
              <span className="text-[#BFFF00]">
                {quote.routePlan?.length || 1} hop(s) via Raiku JIT
              </span>
            </div>
          </div>
        )}

        {/* Swap button */}
        <button
          onClick={connected ? handleSwap : handleConnectWallet}
          disabled={connected && !canSwap}
          className={`w-full mt-4 py-4 rounded-xl font-bold text-lg transition-all ${
            !connected
              ? 'bg-[#BFFF00] text-black hover:bg-[#9ACC00]'
              : canSwap
              ? 'bg-[#BFFF00] text-black hover:bg-[#9ACC00] animate-flash-glow'
              : 'bg-[#333333] text-gray-500 cursor-not-allowed'
          }`}
        >
          {!connected ? (
            'Connect Wallet'
          ) : !inputAmount || parseFloat(inputAmount) <= 0 ? (
            'Enter an amount'
          ) : isLoadingQuote ? (
            'Fetching quote...'
          ) : !quote ? (
            'No route found'
          ) : (
            <>
              <span className="mr-2">⚡</span>
              Flash Swap
            </>
          )}
        </button>

        {/* Raiku badge */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
          <span>Powered by</span>
          <span className="text-[#BFFF00] font-semibold">Raiku JIT</span>
          <span>• Sub-50ms confirmations</span>
        </div>
      </div>
    </div>
  );
}

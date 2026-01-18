'use client';

import Image from 'next/image';
import type { Token, TransactionState } from '@/types';

interface TransactionStatusProps {
  txState: TransactionState;
  inputToken: Token | null;
  outputToken: Token | null;
  inputAmount: string;
  outputAmount: string;
  onClose: () => void;
}

export function TransactionStatus({
  txState,
  inputToken,
  outputToken,
  inputAmount,
  outputAmount,
  onClose,
}: TransactionStatusProps) {
  const { status, signature, latencyMs, error } = txState;

  const getStatusContent = () => {
    switch (status) {
      case 'signing':
        return {
          icon: (
            <div className="w-16 h-16 border-4 border-[#BFFF00] border-t-transparent rounded-full animate-spin" />
          ),
          title: 'Waiting for signature',
          subtitle: 'Please approve the transaction in your wallet',
        };

      case 'submitting':
        return {
          icon: (
            <div className="relative">
              <div className="w-16 h-16 bg-[#BFFF00]/20 rounded-full flex items-center justify-center animate-pulse">
                <span className="text-3xl">⚡</span>
              </div>
              <div className="absolute inset-0 border-4 border-[#BFFF00] border-t-transparent rounded-full animate-spin" />
            </div>
          ),
          title: 'Routing via Raiku JIT',
          subtitle: 'Reserving blockspace for guaranteed inclusion',
        };

      case 'pre_confirmed':
        return {
          icon: (
            <div className="relative">
              <div className="w-16 h-16 bg-[#BFFF00]/30 rounded-full flex items-center justify-center">
                <span className="text-3xl">⚡</span>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          ),
          title: 'Pre-confirmed!',
          subtitle: latencyMs
            ? `Confirmed in ${latencyMs}ms - waiting for on-chain finality`
            : 'Waiting for on-chain finality',
        };

      case 'confirmed':
        return {
          icon: (
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          ),
          title: 'Swap Complete!',
          subtitle: latencyMs ? `Confirmed in ${latencyMs}ms` : 'Transaction confirmed',
        };

      case 'failed':
        return {
          icon: (
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
              <svg
                className="w-10 h-10 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          ),
          title: 'Transaction Failed',
          subtitle: error || 'Something went wrong',
        };

      default:
        return null;
    }
  };

  const content = getStatusContent();
  if (!content) return null;

  const isComplete = status === 'confirmed' || status === 'failed';

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-[#111111] border border-[#222222] rounded-2xl p-6 shadow-xl">
        {/* Status icon and text */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="mb-4">{content.icon}</div>
          <h3 className="text-xl font-bold mb-1">{content.title}</h3>
          <p className="text-sm text-gray-400">{content.subtitle}</p>
        </div>

        {/* Swap summary */}
        <div className="bg-[#0a0a0a] rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {inputToken?.logoURI && (
                <Image
                  src={inputToken.logoURI}
                  alt={inputToken.symbol}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              )}
              <span className="font-semibold">
                {inputAmount} {inputToken?.symbol}
              </span>
            </div>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
            <div className="flex items-center gap-2">
              {outputToken?.logoURI && (
                <Image
                  src={outputToken.logoURI}
                  alt={outputToken.symbol}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              )}
              <span className="font-semibold">
                {outputAmount} {outputToken?.symbol}
              </span>
            </div>
          </div>
        </div>

        {/* Transaction signature link */}
        {signature && (
          <a
            href={`https://solscan.io/tx/${signature}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-3 text-center text-sm text-[#BFFF00] hover:text-[#9ACC00] transition-colors"
          >
            View on Solscan →
          </a>
        )}

        {/* Close/Done button */}
        {isComplete && (
          <button
            onClick={onClose}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              status === 'confirmed'
                ? 'bg-[#BFFF00] text-black hover:bg-[#9ACC00]'
                : 'bg-[#333333] hover:bg-[#444444]'
            }`}
          >
            {status === 'confirmed' ? 'Done' : 'Try Again'}
          </button>
        )}

        {/* Latency badge for confirmed transactions */}
        {status === 'confirmed' && latencyMs && (
          <div className="mt-4 flex items-center justify-center gap-2 text-xs">
            <span className="px-2 py-1 bg-green-500/20 text-green-500 rounded-full">
              ⚡ {latencyMs}ms confirmation via Raiku JIT
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

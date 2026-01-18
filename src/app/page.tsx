'use client';

import { WalletProvider } from '@/providers/WalletProvider';
import { Header, SwapCard } from '@/components';

export default function Home() {
  return (
    <WalletProvider>
      <div className="min-h-screen bg-[#0a0a0a]">
        <Header />

        {/* Main content */}
        <main className="pt-20 pb-12 px-4">
          {/* Hero section */}
          <div className="max-w-2xl mx-auto text-center mb-12 pt-8">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="text-[#BFFF00]">Lightning</span> Fast Swaps
            </h1>
            <p className="text-gray-400 text-lg mb-6">
              Sub-50ms confirmations. 100% inclusion guarantee.
              <br />
              Win high-volatility events on Solana.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#111111] border border-[#222222] rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Raiku JIT Active</span>
              </div>
              <div className="px-3 py-1.5 bg-[#111111] border border-[#222222] rounded-full">
                <span className="text-[#BFFF00]">Jupiter</span> Aggregation
              </div>
              <div className="px-3 py-1.5 bg-[#111111] border border-[#222222] rounded-full">
                Deterministic Execution
              </div>
            </div>
          </div>

          {/* Swap card */}
          <SwapCard />

          {/* Features section */}
          <div className="max-w-4xl mx-auto mt-16 grid sm:grid-cols-3 gap-6">
            <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
              <div className="text-2xl mb-3">⚡</div>
              <h3 className="font-bold mb-2">Pre-Confirmations</h3>
              <p className="text-sm text-gray-400">
                Get confirmation in under 50ms before on-chain finality. Know your trade will land.
              </p>
            </div>
            <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
              <div className="text-2xl mb-3">🔒</div>
              <h3 className="font-bold mb-2">100% Inclusion</h3>
              <p className="text-sm text-gray-400">
                Blockspace reserved before broadcast. No more failed transactions during congestion.
              </p>
            </div>
            <div className="bg-[#111111] border border-[#222222] rounded-xl p-6">
              <div className="text-2xl mb-3">🛡️</div>
              <h3 className="font-bold mb-2">MEV Protected</h3>
              <p className="text-sm text-gray-400">
                JIT routing protects your swap from sandwich attacks and frontrunning.
              </p>
            </div>
          </div>

          {/* How it works */}
          <div className="max-w-2xl mx-auto mt-16 text-center">
            <h2 className="text-2xl font-bold mb-8">How It Works</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#BFFF00] text-black rounded-full flex items-center justify-center font-bold">
                  1
                </div>
                <span>Get Jupiter quote</span>
              </div>
              <div className="hidden sm:block text-gray-500">→</div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#BFFF00] text-black rounded-full flex items-center justify-center font-bold">
                  2
                </div>
                <span>Sign transaction</span>
              </div>
              <div className="hidden sm:block text-gray-500">→</div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-[#BFFF00] text-black rounded-full flex items-center justify-center font-bold">
                  3
                </div>
                <span>Raiku JIT routing</span>
              </div>
              <div className="hidden sm:block text-gray-500">→</div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                  ✓
                </div>
                <span>Pre-confirmed!</span>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-[#222222] py-6 px-4">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-2">
              <span className="text-lg">⚡</span>
              <span>
                The <span className="text-[#BFFF00]">Flash</span>
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>Powered by Raiku Ackermann SDK</span>
              <span>•</span>
              <span>Jupiter Aggregator</span>
              <span>•</span>
              <a
                href="https://x.com/0xgiwax"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 hover:text-[#BFFF00] transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
                <span>@0xgiwax</span>
              </a>
            </div>
          </div>
        </footer>
      </div>
    </WalletProvider>
  );
}

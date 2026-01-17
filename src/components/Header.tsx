'use client';

import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';

export function Header() {
  const { connected, publicKey, disconnect } = useWallet();
  const { setVisible } = useWalletModal();

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#222222]">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-2xl animate-lightning">⚡</span>
          <span className="text-xl font-bold">
            The <span className="text-[#FFD700]">Flash</span>
          </span>
        </div>

        {/* Stats badge */}
        <div className="hidden sm:flex items-center gap-4 text-xs text-gray-400">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>Raiku JIT Active</span>
          </div>
          <div className="px-2 py-1 bg-[#111111] rounded-lg">
            <span className="text-[#FFD700]">&lt;50ms</span> confirmations
          </div>
        </div>

        {/* Wallet button */}
        {connected && publicKey ? (
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-[#111111] border border-[#333333] rounded-lg text-sm">
              {truncateAddress(publicKey.toBase58())}
            </div>
            <button
              onClick={() => disconnect()}
              className="px-3 py-1.5 bg-[#1a1a1a] hover:bg-[#252525] rounded-lg text-sm transition-colors"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={() => setVisible(true)}
            className="px-4 py-2 bg-[#FFD700] text-black font-semibold rounded-lg hover:bg-[#B8860B] transition-colors"
          >
            Connect
          </button>
        )}
      </div>
    </header>
  );
}

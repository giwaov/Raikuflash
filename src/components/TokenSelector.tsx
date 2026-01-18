'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import type { Token } from '@/types';
import { POPULAR_TOKENS } from '@/types';
import { jupiterService } from '@/services/jupiter';

interface TokenSelectorProps {
  selectedToken: Token | null;
  onSelect: (token: Token) => void;
  excludeToken?: Token | null;
}

export function TokenSelector({
  selectedToken,
  onSelect,
  excludeToken,
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Token[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filter popular tokens excluding selected
  const filteredPopular = POPULAR_TOKENS.filter(
    (t) => t.address !== excludeToken?.address
  );

  // Handle search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await jupiterService.searchTokens(searchQuery);
        setSearchResults(
          results.filter((t) => t.address !== excludeToken?.address)
        );
      } catch (error) {
        console.error('Token search failed:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, excludeToken?.address]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback(
    (token: Token) => {
      onSelect(token);
      setIsOpen(false);
      setSearchQuery('');
    },
    [onSelect]
  );

  const displayTokens = searchQuery.trim() ? searchResults : filteredPopular;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-[#1a1a1a] hover:bg-[#252525] rounded-lg transition-colors min-w-[120px]"
      >
        {selectedToken ? (
          <>
            {selectedToken.logoURI && (
              <Image
                src={selectedToken.logoURI}
                alt={selectedToken.symbol}
                width={24}
                height={24}
                className="rounded-full"
              />
            )}
            <span className="font-semibold">{selectedToken.symbol}</span>
          </>
        ) : (
          <span className="text-gray-400">Select token</span>
        )}
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-72 bg-[#111111] border border-[#222222] rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Search input */}
          <div className="p-3 border-b border-[#222222]">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or paste address"
              className="w-full px-3 py-2 bg-[#1a1a1a] border border-[#333333] rounded-lg text-sm focus:outline-none focus:border-[#BFFF00] transition-colors"
              autoFocus
            />
          </div>

          {/* Token list */}
          <div className="max-h-64 overflow-y-auto">
            {isSearching ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-[#BFFF00] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : displayTokens.length > 0 ? (
              displayTokens.map((token) => (
                <button
                  key={token.address}
                  onClick={() => handleSelect(token)}
                  className="flex items-center gap-3 w-full px-4 py-3 hover:bg-[#1a1a1a] transition-colors"
                >
                  {token.logoURI ? (
                    <Image
                      src={token.logoURI}
                      alt={token.symbol}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-[#333333] rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold">
                        {token.symbol.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="text-left">
                    <div className="font-semibold">{token.symbol}</div>
                    <div className="text-xs text-gray-400">{token.name}</div>
                  </div>
                </button>
              ))
            ) : searchQuery ? (
              <div className="py-8 text-center text-gray-400 text-sm">
                No tokens found
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

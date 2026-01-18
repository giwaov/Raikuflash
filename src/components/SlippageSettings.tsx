'use client';

import { useState, useRef, useEffect } from 'react';
import { CONFIG } from '@/config';

interface SlippageSettingsProps {
  slippageBps: number;
  onSlippageChange: (slippageBps: number) => void;
}

const PRESET_SLIPPAGES = [50, 100, 300]; // 0.5%, 1%, 3%

export function SlippageSettings({
  slippageBps,
  onSlippageChange,
}: SlippageSettingsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customValue, setCustomValue] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handlePresetClick = (bps: number) => {
    onSlippageChange(bps);
    setCustomValue('');
  };

  const handleCustomChange = (value: string) => {
    setCustomValue(value);
    const parsed = parseFloat(value);
    if (!isNaN(parsed) && parsed > 0 && parsed <= CONFIG.MAX_SLIPPAGE_BPS / 100) {
      onSlippageChange(Math.round(parsed * 100));
    }
  };

  const isPresetSelected = (bps: number) =>
    slippageBps === bps && customValue === '';

  const isHighSlippage = slippageBps > 500; // > 5%

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2 py-1.5 text-sm bg-[#1a1a1a] hover:bg-[#252525] rounded-lg transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        <span className={isHighSlippage ? 'text-yellow-500' : ''}>
          {(slippageBps / 100).toFixed(1)}%
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-64 bg-[#111111] border border-[#222222] rounded-xl shadow-xl z-50 p-4">
          <div className="text-sm font-semibold mb-3">Slippage Tolerance</div>

          {/* Preset buttons */}
          <div className="flex gap-2 mb-3">
            {PRESET_SLIPPAGES.map((bps) => (
              <button
                key={bps}
                onClick={() => handlePresetClick(bps)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isPresetSelected(bps)
                    ? 'bg-[#BFFF00] text-black'
                    : 'bg-[#1a1a1a] hover:bg-[#252525]'
                }`}
              >
                {(bps / 100).toFixed(1)}%
              </button>
            ))}
          </div>

          {/* Custom input */}
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={customValue}
              onChange={(e) => handleCustomChange(e.target.value)}
              placeholder="Custom"
              step="0.1"
              min="0.01"
              max="50"
              className="flex-1 px-3 py-2 bg-[#1a1a1a] border border-[#333333] rounded-lg text-sm focus:outline-none focus:border-[#BFFF00] transition-colors"
            />
            <span className="text-sm text-gray-400">%</span>
          </div>

          {/* Warning for high slippage */}
          {isHighSlippage && (
            <div className="mt-3 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-xs text-yellow-500">
              High slippage tolerance. Your transaction may be frontrun.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

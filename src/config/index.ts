export const CONFIG = {
  // Solana RPC endpoints
  SOLANA_RPC_URL: process.env.NEXT_PUBLIC_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',

  // Jupiter API
  JUPITER_API_URL: 'https://quote-api.jup.ag/v6',

  // Raiku endpoints (mock for now - replace with actual endpoints)
  RAIKU_JIT_ENDPOINT: process.env.NEXT_PUBLIC_RAIKU_JIT_ENDPOINT || 'https://api.raiku.io/v1/jit',
  RAIKU_STATUS_ENDPOINT: process.env.NEXT_PUBLIC_RAIKU_STATUS_ENDPOINT || 'https://api.raiku.io/v1/status',

  // Default swap settings
  DEFAULT_SLIPPAGE_BPS: 50, // 0.5%
  MAX_SLIPPAGE_BPS: 5000, // 50%

  // Transaction settings
  COMPUTE_UNIT_PRICE_MICRO_LAMPORTS: 100000, // Priority fee
  COMPUTE_UNIT_LIMIT: 400000,

  // Polling intervals
  QUOTE_REFRESH_INTERVAL_MS: 10000,
  STATUS_POLL_INTERVAL_MS: 500,

  // Timeouts
  TRANSACTION_TIMEOUT_MS: 60000,
  QUOTE_TIMEOUT_MS: 10000,
} as const;

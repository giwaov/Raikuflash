export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  logoURI?: string;
}

export interface SwapQuote {
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  priceImpactPct: number;
  slippageBps: number;
  routePlan: RoutePlan[];
  swapTransaction: string;
}

export interface RoutePlan {
  swapInfo: {
    ammKey: string;
    label: string;
    inputMint: string;
    outputMint: string;
    inAmount: string;
    outAmount: string;
    feeAmount: string;
    feeMint: string;
  };
  percent: number;
}

export interface RaikuJITResponse {
  success: boolean;
  preConfirmationId: string;
  estimatedSlot: number;
  estimatedLatencyMs: number;
  blockspaceReserved: boolean;
  signature?: string;
  error?: string;
}

export interface RaikuTransactionStatus {
  preConfirmationId: string;
  status: 'pending' | 'pre_confirmed' | 'confirmed' | 'finalized' | 'failed';
  signature?: string;
  slot?: number;
  confirmationTimeMs?: number;
  error?: string;
}

export interface SwapState {
  inputToken: Token | null;
  outputToken: Token | null;
  inputAmount: string;
  outputAmount: string;
  quote: SwapQuote | null;
  isLoadingQuote: boolean;
  slippageBps: number;
}

export interface TransactionState {
  status: 'idle' | 'signing' | 'submitting' | 'pre_confirmed' | 'confirmed' | 'failed';
  signature?: string;
  preConfirmationId?: string;
  error?: string;
  latencyMs?: number;
}

export const SOL_TOKEN: Token = {
  address: 'So11111111111111111111111111111111111111112',
  symbol: 'SOL',
  name: 'Solana',
  decimals: 9,
  logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png',
};

export const USDC_TOKEN: Token = {
  address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  symbol: 'USDC',
  name: 'USD Coin',
  decimals: 6,
  logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
};

export const POPULAR_TOKENS: Token[] = [
  SOL_TOKEN,
  USDC_TOKEN,
  {
    address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    symbol: 'USDT',
    name: 'Tether USD',
    decimals: 6,
    logoURI: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB/logo.png',
  },
  {
    address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
    symbol: 'BONK',
    name: 'Bonk',
    decimals: 5,
    logoURI: 'https://arweave.net/hQiPZOsRZXGXBJd_82PhVdlM_hACsT_q6wqwf5cSY7I',
  },
  {
    address: 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',
    symbol: 'JUP',
    name: 'Jupiter',
    decimals: 6,
    logoURI: 'https://static.jup.ag/jup/icon.png',
  },
];

import { CONFIG } from '@/config';
import type { SwapQuote, Token } from '@/types';

export interface QuoteParams {
  inputMint: string;
  outputMint: string;
  amount: string;
  slippageBps?: number;
  onlyDirectRoutes?: boolean;
  asLegacyTransaction?: boolean;
}

export interface SwapParams {
  quoteResponse: SwapQuote;
  userPublicKey: string;
  wrapAndUnwrapSol?: boolean;
  computeUnitPriceMicroLamports?: number;
  dynamicComputeUnitLimit?: boolean;
}

/**
 * Jupiter API Service
 *
 * Handles all interactions with Jupiter's Quote and Swap APIs.
 * Returns swap transactions ready for signing and submission via Raiku.
 */
export class JupiterService {
  private baseUrl: string;

  constructor(baseUrl: string = CONFIG.JUPITER_API_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get a swap quote from Jupiter
   */
  async getQuote(params: QuoteParams): Promise<SwapQuote> {
    const searchParams = new URLSearchParams({
      inputMint: params.inputMint,
      outputMint: params.outputMint,
      amount: params.amount,
      slippageBps: String(params.slippageBps || CONFIG.DEFAULT_SLIPPAGE_BPS),
    });

    if (params.onlyDirectRoutes) {
      searchParams.set('onlyDirectRoutes', 'true');
    }

    if (params.asLegacyTransaction) {
      searchParams.set('asLegacyTransaction', 'true');
    }

    const response = await fetch(`${this.baseUrl}/quote?${searchParams}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Jupiter quote failed: ${error}`);
    }

    return response.json();
  }

  /**
   * Get a swap transaction from Jupiter
   */
  async getSwapTransaction(params: SwapParams): Promise<string> {
    const response = await fetch(`${this.baseUrl}/swap`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        quoteResponse: params.quoteResponse,
        userPublicKey: params.userPublicKey,
        wrapAndUnwrapSol: params.wrapAndUnwrapSol ?? true,
        computeUnitPriceMicroLamports: params.computeUnitPriceMicroLamports || CONFIG.COMPUTE_UNIT_PRICE_MICRO_LAMPORTS,
        dynamicComputeUnitLimit: params.dynamicComputeUnitLimit ?? true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Jupiter swap failed: ${error}`);
    }

    const data = await response.json();
    return data.swapTransaction;
  }

  /**
   * Get token info by mint address
   */
  async getTokenInfo(mintAddress: string): Promise<Token | null> {
    try {
      const response = await fetch(
        `https://tokens.jup.ag/token/${mintAddress}`,
        {
          headers: { 'Accept': 'application/json' },
        }
      );

      if (!response.ok) return null;

      const data = await response.json();
      return {
        address: data.address,
        symbol: data.symbol,
        name: data.name,
        decimals: data.decimals,
        logoURI: data.logoURI,
      };
    } catch {
      return null;
    }
  }

  /**
   * Search for tokens by symbol or name
   */
  async searchTokens(query: string): Promise<Token[]> {
    try {
      const response = await fetch(
        `https://tokens.jup.ag/tokens?tags=verified`,
        {
          headers: { 'Accept': 'application/json' },
        }
      );

      if (!response.ok) return [];

      const tokens: Token[] = await response.json();
      const lowerQuery = query.toLowerCase();

      return tokens
        .filter(
          (t) =>
            t.symbol.toLowerCase().includes(lowerQuery) ||
            t.name.toLowerCase().includes(lowerQuery)
        )
        .slice(0, 20);
    } catch {
      return [];
    }
  }
}

// Export singleton instance
export const jupiterService = new JupiterService();

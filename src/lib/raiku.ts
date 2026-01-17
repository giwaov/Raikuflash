import { CONFIG } from '@/config';
import type { RaikuJITResponse, RaikuTransactionStatus } from '@/types';

/**
 * Raiku Ackermann SDK Abstraction Layer
 *
 * This module provides an interface to Raiku's JIT (Just-In-Time) transaction
 * routing system. When the actual SDK becomes available, swap out the mock
 * implementation with real SDK calls.
 *
 * Key concepts:
 * - JIT Execution: Transactions are submitted just-in-time for block inclusion
 * - Slot Reservation: Blockspace is reserved before transaction broadcast
 * - Pre-confirmation: Get confirmation guarantee before on-chain finality
 */

export interface RaikuSubmitOptions {
  transaction: string; // Base64 encoded transaction
  priorityLevel?: 'low' | 'medium' | 'high' | 'turbo';
  maxRetries?: number;
  skipPreflight?: boolean;
}

export interface RaikuClient {
  submitJIT(options: RaikuSubmitOptions): Promise<RaikuJITResponse>;
  getStatus(preConfirmationId: string): Promise<RaikuTransactionStatus>;
  estimateLatency(): Promise<number>;
}

/**
 * Mock implementation of the Raiku client for development
 * Replace this with actual SDK integration when available
 */
class MockRaikuClient implements RaikuClient {
  private pendingTransactions: Map<string, RaikuTransactionStatus> = new Map();

  async submitJIT(options: RaikuSubmitOptions): Promise<RaikuJITResponse> {
    // Simulate network latency
    await this.simulateLatency(20, 50);

    const preConfirmationId = this.generatePreConfirmationId();
    const estimatedSlot = Math.floor(Date.now() / 400) + 2; // ~2 slots ahead

    // Store pending transaction for status tracking
    this.pendingTransactions.set(preConfirmationId, {
      preConfirmationId,
      status: 'pending',
    });

    // Simulate the JIT submission process
    this.simulateTransactionLifecycle(preConfirmationId, options.transaction);

    return {
      success: true,
      preConfirmationId,
      estimatedSlot,
      estimatedLatencyMs: Math.floor(Math.random() * 30) + 20,
      blockspaceReserved: true,
    };
  }

  async getStatus(preConfirmationId: string): Promise<RaikuTransactionStatus> {
    await this.simulateLatency(5, 15);

    const status = this.pendingTransactions.get(preConfirmationId);
    if (!status) {
      return {
        preConfirmationId,
        status: 'failed',
        error: 'Pre-confirmation ID not found',
      };
    }

    return status;
  }

  async estimateLatency(): Promise<number> {
    await this.simulateLatency(10, 20);
    return Math.floor(Math.random() * 20) + 25; // 25-45ms
  }

  private async simulateLatency(minMs: number, maxMs: number): Promise<void> {
    const delay = Math.random() * (maxMs - minMs) + minMs;
    return new Promise((resolve) => setTimeout(resolve, delay));
  }

  private generatePreConfirmationId(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = 'raiku_';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  private simulateTransactionLifecycle(preConfirmationId: string, _transaction: string): void {
    // Stage 1: Pre-confirmed (immediate)
    setTimeout(() => {
      const status = this.pendingTransactions.get(preConfirmationId);
      if (status) {
        status.status = 'pre_confirmed';
        status.confirmationTimeMs = Math.floor(Math.random() * 30) + 20;
      }
    }, 50);

    // Stage 2: Confirmed (after ~400ms - one slot)
    setTimeout(() => {
      const status = this.pendingTransactions.get(preConfirmationId);
      if (status && status.status !== 'failed') {
        status.status = 'confirmed';
        status.signature = this.generateMockSignature();
        status.slot = Math.floor(Date.now() / 400);
      }
    }, 400 + Math.random() * 200);

    // Stage 3: Finalized (after ~2s)
    setTimeout(() => {
      const status = this.pendingTransactions.get(preConfirmationId);
      if (status && status.status === 'confirmed') {
        status.status = 'finalized';
      }
    }, 2000 + Math.random() * 500);
  }

  private generateMockSignature(): string {
    const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 88; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
}

/**
 * Production Raiku client that calls actual endpoints
 * Uncomment and implement when SDK is available
 */
class ProductionRaikuClient implements RaikuClient {
  private baseUrl: string;

  constructor(baseUrl: string = CONFIG.RAIKU_JIT_ENDPOINT) {
    this.baseUrl = baseUrl;
  }

  async submitJIT(options: RaikuSubmitOptions): Promise<RaikuJITResponse> {
    const response = await fetch(`${this.baseUrl}/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transaction: options.transaction,
        priority_level: options.priorityLevel || 'high',
        max_retries: options.maxRetries || 3,
        skip_preflight: options.skipPreflight || false,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Raiku JIT submission failed: ${error}`);
    }

    return response.json();
  }

  async getStatus(preConfirmationId: string): Promise<RaikuTransactionStatus> {
    const response = await fetch(
      `${CONFIG.RAIKU_STATUS_ENDPOINT}/${preConfirmationId}`
    );

    if (!response.ok) {
      throw new Error(`Failed to get status for ${preConfirmationId}`);
    }

    return response.json();
  }

  async estimateLatency(): Promise<number> {
    const response = await fetch(`${this.baseUrl}/latency`);
    const data = await response.json();
    return data.estimatedMs;
  }
}

// Export singleton instance - switch between mock and production
const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_RAIKU !== 'false';

export const raikuClient: RaikuClient = USE_MOCK
  ? new MockRaikuClient()
  : new ProductionRaikuClient();

export { MockRaikuClient, ProductionRaikuClient };

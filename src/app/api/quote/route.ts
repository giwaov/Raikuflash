import { NextRequest, NextResponse } from 'next/server';

// Jupiter v6 Quote API - primary and backup endpoints
const JUPITER_ENDPOINTS = [
  'https://quote-api.jup.ag/v6',
  'https://api.jup.ag/swap/v1',
];

export const runtime = 'edge'; // Use Edge runtime for better connectivity

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const inputMint = searchParams.get('inputMint');
  const outputMint = searchParams.get('outputMint');
  const amount = searchParams.get('amount');
  const slippageBps = searchParams.get('slippageBps') || '50';

  if (!inputMint || !outputMint || !amount) {
    return NextResponse.json(
      { error: 'Missing required parameters: inputMint, outputMint, amount' },
      { status: 400 }
    );
  }

  // Validate amount is a valid number
  if (isNaN(Number(amount)) || Number(amount) <= 0) {
    return NextResponse.json(
      { error: 'Invalid amount: must be a positive number' },
      { status: 400 }
    );
  }

  const errors: string[] = [];

  // Try each endpoint until one succeeds
  for (const baseUrl of JUPITER_ENDPOINTS) {
    const jupiterUrl = `${baseUrl}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const response = await fetch(jupiterUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        errors.push(`${baseUrl}: ${response.status} - ${errorText}`);
        continue; // Try next endpoint
      }

      const data = await response.json();

      // Add CORS headers to response
      return NextResponse.json(data, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errors.push(`${baseUrl}: ${errorMessage}`);
      continue; // Try next endpoint
    }
  }

  // All endpoints failed
  console.error('All Jupiter endpoints failed:', errors);
  return NextResponse.json(
    {
      error: 'Unable to fetch quote from Jupiter',
      details: errors,
    },
    { status: 502 }
  );
}

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

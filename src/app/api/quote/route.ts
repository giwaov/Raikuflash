import { NextRequest, NextResponse } from 'next/server';

// Jupiter v6 Quote API
const JUPITER_API_URL = 'https://quote-api.jup.ag/v6';

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

  const jupiterUrl = `${JUPITER_API_URL}/quote?inputMint=${inputMint}&outputMint=${outputMint}&amount=${amount}&slippageBps=${slippageBps}`;

  try {
    const response = await fetch(jupiterUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'TheFlash/1.0',
      },
      // Add cache control to avoid stale responses
      cache: 'no-store',
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error('Jupiter API error:', response.status, responseText);
      return NextResponse.json(
        { error: responseText || `Jupiter API returned status ${response.status}` },
        { status: response.status }
      );
    }

    // Parse and return the JSON
    try {
      const data = JSON.parse(responseText);
      return NextResponse.json(data);
    } catch {
      console.error('Failed to parse Jupiter response:', responseText);
      return NextResponse.json(
        { error: 'Invalid JSON response from Jupiter' },
        { status: 502 }
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Quote fetch error:', errorMessage);
    return NextResponse.json(
      { error: `Network error: ${errorMessage}` },
      { status: 500 }
    );
  }
}

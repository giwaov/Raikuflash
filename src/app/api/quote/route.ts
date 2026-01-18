import { NextRequest, NextResponse } from 'next/server';

const JUPITER_API_URL = 'https://quote-api.jup.ag/v6';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const inputMint = searchParams.get('inputMint');
  const outputMint = searchParams.get('outputMint');
  const amount = searchParams.get('amount');
  const slippageBps = searchParams.get('slippageBps') || '50';

  if (!inputMint || !outputMint || !amount) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  try {
    const params = new URLSearchParams({
      inputMint,
      outputMint,
      amount,
      slippageBps,
    });

    const response = await fetch(`${JUPITER_API_URL}/quote?${params}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Jupiter API error:', errorText);
      return NextResponse.json(
        { error: `Jupiter API error: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Quote fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote' },
      { status: 500 }
    );
  }
}

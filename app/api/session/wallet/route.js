import { NextResponse } from 'next/server';
import { setWalletSession, getWalletSession, clearWalletSession } from '@/lib/secure-cookies';
import { sanitizeError } from '@/lib/validation';
import { verifyOrigin } from '@/lib/csrf-protection';

/**
 * POST - Set wallet session in secure cookie
 * Called after wallet connects
 */
export async function POST(request) {
  try {
    // SECURITY: CSRF protection
    const csrfCheck = verifyOrigin(request);
    if (!csrfCheck.valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid request origin' },
        { status: 403 }
      );
    }

    const { walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: 'Wallet address required' },
        { status: 400 }
      );
    }

    // Validate wallet address format (Solana = 32-44 chars, base58)
    if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(walletAddress)) {
      return NextResponse.json(
        { success: false, error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }

    // Set secure HTTP-only cookie
    const result = await setWalletSession(walletAddress);

    if (!result.success) {
      throw new Error('Failed to set wallet session');
    }

    console.log(`✅ Wallet session set: ${walletAddress.slice(0, 8)}...`);

    return NextResponse.json({
      success: true,
      message: 'Wallet session established',
      walletAddress: walletAddress.slice(0, 8) + '...' // Return truncated for confirmation
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: sanitizeError(error, 'Failed to set wallet session') },
      { status: 500 }
    );
  }
}

/**
 * GET - Get wallet session from secure cookie
 */
export async function GET(request) {
  try {
    const walletAddress = await getWalletSession();

    if (!walletAddress) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        message: 'No active wallet session'
      });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      walletAddress,
      truncated: walletAddress.slice(0, 8) + '...'
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: sanitizeError(error, 'Failed to get wallet session') },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Clear wallet session (logout)
 */
export async function DELETE(request) {
  try {
    // SECURITY: CSRF protection
    const csrfCheck = verifyOrigin(request);
    if (!csrfCheck.valid) {
      return NextResponse.json(
        { success: false, error: 'Invalid request origin' },
        { status: 403 }
      );
    }

    const result = await clearWalletSession();

    if (!result.success) {
      throw new Error('Failed to clear wallet session');
    }

    console.log('✅ Wallet session cleared');

    return NextResponse.json({
      success: true,
      message: 'Wallet session cleared'
    });

  } catch (error) {
    return NextResponse.json(
      { success: false, error: sanitizeError(error, 'Failed to clear wallet session') },
      { status: 500 }
    );
  }
}

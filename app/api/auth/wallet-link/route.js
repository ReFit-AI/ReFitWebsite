import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';

export async function POST(request) {
  try {
    const { walletAddress } = await request.json();

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single();

    if (existingUser) {
      // Create session for existing user
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(
        existingUser.id
      );

      if (authUser?.user) {
        // Generate new session
        const { data: session, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email: `${walletAddress}@shoprefit.com`,
          options: {
            redirectTo: `${request.headers.get('origin')}/auth/callback`,
          },
        });

        if (sessionError) throw sessionError;

        return NextResponse.json({
          user: authUser.user,
          isNew: false,
          session,
        });
      }
    }

    // Create new user (passwordless)
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: `${walletAddress}@shoprefit.com`,
      email_confirm: true,
      user_metadata: {
        wallet_address: walletAddress,
      },
    });

    if (createError) throw createError;

    // Create user record
    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: newUser.user.id,
        wallet_address: walletAddress,
        email: `${walletAddress}@shoprefit.com`,
      });

    if (insertError && !insertError.message.includes('duplicate')) {
      console.error('User record creation error:', process.env.NODE_ENV === 'development' ? insertError : insertError.message);
    }

    // Generate session
    const { data: session, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: `${walletAddress}@shoprefit.com`,
      options: {
        redirectTo: `${request.headers.get('origin')}/auth/callback`,
      },
    });

    if (sessionError) throw sessionError;

    return NextResponse.json({
      user: newUser.user,
      isNew: true,
      session,
    });
  } catch (error) {
    console.error('Wallet link error:', process.env.NODE_ENV === 'development' ? error : error.message);
    return NextResponse.json(
      { error: error.message || 'Failed to link wallet' },
      { status: 500 }
    );
  }
}
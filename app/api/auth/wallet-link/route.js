import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-server';
import { sanitizeError } from '@/lib/validation';

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
      email: `${walletAddress.toLowerCase()}@shoprefit.com`,
      email_confirm: true,
      user_metadata: {
        wallet_address: walletAddress,
      },
    });

    if (createError) {
      // If user already exists, just get them instead
      if (createError.message?.includes('already been registered') || createError.code === 'email_exists') {
        const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
        const existingUser = existingUsers?.users?.find(
          u => u.email === `${walletAddress.toLowerCase()}@shoprefit.com`
        );
        
        if (existingUser) {
          console.log('User already exists, using existing:', existingUser.id);
          return NextResponse.json({
            user: existingUser,
            isNew: false,
            success: true,
          });
        }
      }
      
      console.error('Error creating user:', createError);
      throw createError;
    }

    // Create user record
    const { error: insertError } = await supabaseAdmin
      .from('users')
      .insert({
        id: newUser.user.id,
        wallet_address: walletAddress,
        email: `${walletAddress.toLowerCase()}@shoprefit.com`,
      });

    if (insertError && !insertError.message.includes('duplicate')) {
      console.error('User record creation error:', process.env.NODE_ENV === 'development' ? insertError : insertError.message);
    }

    // Generate session
    const { data: session, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: `${walletAddress.toLowerCase()}@shoprefit.com`,
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
    return NextResponse.json(
      { error: sanitizeError(error, 'Failed to link wallet') },
      { status: 500 }
    );
  }
}
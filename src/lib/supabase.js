import { createClient } from '@supabase/supabase-js';

// Client-side Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
} else {
  console.warn('Supabase environment variables not configured');
}

export { supabase };

// Helper to link wallet to Supabase user
export async function linkWalletToUser(walletAddress) {
  if (!supabase) {
    console.warn('Supabase client not initialized');
    return null;
  }
  
  try {
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('wallet_address', walletAddress)
      .single();

    if (existingUser) {
      // Sign in existing user
      const { data, error } = await supabase.auth.signInWithPassword({
        email: `${walletAddress}@refit.io`,
        password: walletAddress,
      });
      
      if (error && error.message.includes('Invalid login')) {
        // User exists but auth doesn't, create auth
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: `${walletAddress}@refit.io`,
          password: walletAddress,
          options: {
            data: {
              wallet_address: walletAddress,
            },
          },
        });
        
        if (signUpError) throw signUpError;
        return { user: authData.user, isNew: false };
      }
      
      if (error) throw error;
      return { user: data.user, isNew: false };
    }

    // Create new user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: `${walletAddress}@refit.io`,
      password: walletAddress,
      options: {
        data: {
          wallet_address: walletAddress,
        },
      },
    });

    if (signUpError) throw signUpError;

    // Create user record
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        wallet_address: walletAddress,
      });

    if (insertError) throw insertError;

    return { user: authData.user, isNew: true };
  } catch (error) {
    console.error('Error linking wallet:', error);
    throw error;
  }
}

// Helper to get current user
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return userData;
}

// Helper to sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

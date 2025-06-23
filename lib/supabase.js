import { createClient } from '@supabase/supabase-js';

// Client-side Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

let supabase = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    global: {
      headers: {
        'x-application-name': 'refit-next',
      },
    },
    db: {
      schema: 'public',
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
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
    // Check if user exists with better error handling
    let existingUser = null;
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', walletAddress)
        .single();
      
      if (!error) {
        existingUser = data;
      }
    } catch {
      // User doesn't exist, which is fine
      console.log('User not found, will create new user');
    }

    if (existingUser) {
      // Sign in existing user
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: `${walletAddress}@shoprefit.com`,
          password: walletAddress,
        });
        
        if (!error && data.user) {
          return { user: data.user, isNew: false };
        }
      } catch {
        console.log('Sign in failed, attempting sign up');
      }
      
      // Try to create auth for existing user
      try {
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: `${walletAddress}@shoprefit.com`,
          password: walletAddress,
          options: {
            data: {
              wallet_address: walletAddress,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });
        
        if (!signUpError && authData.user) {
          return { user: authData.user, isNew: false };
        }
      } catch (authError) {
        console.error('Auth creation failed:', authError);
      }
    }

    // Create new user with retry logic
    let authData = null;
    let retries = 3;
    
    while (retries > 0 && !authData) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email: `${walletAddress}@shoprefit.com`,
          password: walletAddress,
          options: {
            data: {
              wallet_address: walletAddress,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (!error && data.user) {
          authData = data;
          break;
        }
        
        if (error && error.message.includes('User already registered')) {
          // Try to sign in instead
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: `${walletAddress}@shoprefit.com`,
            password: walletAddress,
          });
          
          if (!signInError && signInData.user) {
            return { user: signInData.user, isNew: false };
          }
        }
      } catch (error) {
        console.error(`Sign up attempt ${4 - retries} failed:`, error);
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
      }
    }

    if (!authData || !authData.user) {
      throw new Error('Failed to create user after multiple attempts');
    }

    // Create user record with error handling
    try {
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          wallet_address: walletAddress,
        });

      if (insertError && insertError.message && !insertError.message.includes('duplicate')) {
        console.error('User record creation error:', insertError);
      }
    } catch (insertError) {
      console.error('Failed to create user record:', insertError);
    }

    return { user: authData.user, isNew: true };
  } catch (error) {
    console.error('Error linking wallet:', error);
    
    // Return a mock user for development if Supabase fails
    if (process.env.NODE_ENV === 'development') {
      console.warn('Falling back to mock user due to Supabase error');
      return {
        user: {
          id: `mock-${walletAddress}`,
          email: `${walletAddress}@shoprefit.com`,
          user_metadata: { wallet_address: walletAddress },
        },
        isNew: true,
      };
    }
    
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

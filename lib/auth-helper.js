import { supabase } from './supabase';

// Helper to check if we're in a browser with extensions that might interfere
export function hasProblematicExtensions() {
  if (typeof window === 'undefined') return false;
  
  // Check for known problematic extensions
  const extensionIndicators = [
    'chrome-extension://',
    'moz-extension://',
    'edge-extension://',
  ];
  
  // Check if any scripts are injected from extensions
  const scripts = Array.from(document.scripts);
  return scripts.some(script => 
    extensionIndicators.some(indicator => 
      script.src && script.src.includes(indicator)
    )
  );
}

// Helper function to link wallet using server-side endpoint
export async function linkWalletWithFallback(walletAddress) {
  const useServerAuth = process.env.NEXT_PUBLIC_USE_SERVER_AUTH === 'true';
  
  try {
    // First, try the server-side endpoint to avoid browser extension issues
    if (useServerAuth || hasProblematicExtensions()) {
      const response = await fetch('/api/auth/wallet-link', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ walletAddress }),
      });

      if (response.ok) {
        const data = await response.json();
        
        // Set the session in the client
        if (data.user && supabase) {
          // Try to sign in with the created user
          try {
            const { data: signInData } = await supabase.auth.signInWithPassword({
              email: `${walletAddress}@shoprefit.com`,
              password: walletAddress,
            });

            if (signInData?.session) {
              await supabase.auth.setSession(signInData.session);
            }
          } catch (signInErr) {
            console.warn('Failed to set session, continuing anyway:', signInErr);
          }
        }
        
        return {
          user: data.user,
          isNew: data.isNew,
          success: true,
        };
      }
    }
    
    // If server auth wasn't used or failed, try client-side
    if (supabase) {
      try {
        const { linkWalletToUser } = await import('./supabase');
        const result = await linkWalletToUser(walletAddress);
        return {
          ...result,
          success: true,
        };
      } catch (clientError) {
        console.error('Client-side auth failed:', clientError);
      }
    }
    
    // Ultimate fallback for development
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using mock auth due to all auth methods failing');
      return {
        user: {
          id: `mock-${walletAddress}`,
          email: `${walletAddress}@shoprefit.com`,
          user_metadata: { wallet_address: walletAddress },
        },
        isNew: true,
        success: true,
      };
    }
    
    throw new Error('All authentication methods failed');
  } catch (error) {
    console.error('Auth error:', error);
    
    // Development fallback on any error
    if (process.env.NODE_ENV === 'development') {
      console.warn('Using mock auth due to error');
      return {
        user: {
          id: `mock-${walletAddress}`,
          email: `${walletAddress}@shoprefit.com`,
          user_metadata: { wallet_address: walletAddress },
        },
        isNew: true,
        success: true,
      };
    }
    
    throw error;
  }
}

// Get current authenticated user with fallback
export async function getCurrentUserWithFallback() {
  try {
    if (supabase) {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();
        
        return userData;
      }
    }
  } catch (error) {
    console.error('Failed to get current user:', error);
  }
  
  return null;
}
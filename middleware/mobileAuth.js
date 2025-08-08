import { createClient } from '@/lib/supabase';
import { hashSessionToken } from '@/lib/solana-auth';

export async function verifyMobileSession(request) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authenticated: false,
      error: 'Missing authorization header'
    };
  }

  const sessionToken = authHeader.substring(7);
  // Hash the token to match what's stored in the database
  const hashedToken = hashSessionToken(sessionToken);

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('mobile_sessions')
      .select('*')
      .eq('session_token', hashedToken) // Use hashed token for comparison
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return {
        authenticated: false,
        error: 'Invalid or expired session'
      };
    }

    // Update last_used timestamp (use hashed token)
    await supabase
      .from('mobile_sessions')
      .update({ last_used: new Date().toISOString() })
      .eq('session_token', hashedToken);

    return {
      authenticated: true,
      session: data
    };
  } catch (error) {
    console.error('Session verification error:', error);
    return {
      authenticated: false,
      error: 'Session verification failed'
    };
  }
}
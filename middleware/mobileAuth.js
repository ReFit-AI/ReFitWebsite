import { createClient } from '@/lib/supabase';

export async function verifyMobileSession(request) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authenticated: false,
      error: 'Missing authorization header'
    };
  }

  const sessionToken = authHeader.substring(7);

  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('mobile_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !data) {
      return {
        authenticated: false,
        error: 'Invalid or expired session'
      };
    }

    // Update last_used timestamp
    await supabase
      .from('mobile_sessions')
      .update({ last_used: new Date().toISOString() })
      .eq('session_token', sessionToken);

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
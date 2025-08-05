import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    await supabase.auth.exchangeCodeForSession(code);
  }

  // Redirect to homepage after auth
  return NextResponse.redirect(new URL('/', request.url));
}
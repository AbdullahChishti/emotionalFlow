require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function debugAuthLogout() {
  console.log('🔍 CRITICAL AUTH LOG - Starting comprehensive auth debugging session');
  console.log('📊 Current environment:', {
    nodeEnv: process.env.NODE_ENV,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceRoleKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    timestamp: new Date().toISOString()
  });

  try {
    // Test 1: Check current session state
    console.log('\n🔐 TEST 1: Checking current session state');
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    console.log('📊 Session check results:', {
      hasSession: !!sessionData?.session,
      hasError: !!sessionError,
      errorCode: sessionError?.code,
      errorMessage: sessionError?.message,
      userId: sessionData?.session?.user?.id,
      email: sessionData?.session?.user?.email,
      sessionExpiry: sessionData?.session?.expires_at ? new Date(sessionData.session.expires_at * 1000).toISOString() : 'N/A',
      timestamp: new Date().toISOString()
    });

    // Test 2: Check database for active sessions
    console.log('\n🗄️ TEST 2: Checking database for active sessions');
    const { data: sessions, error: sessionsError } = await supabase
      .from('sessions')
      .select('user_id, created_at, expires_at, last_used_at')
      .limit(10);

    console.log('📊 Database sessions:', {
      sessionCount: sessions?.length || 0,
      hasError: !!sessionsError,
      errorMessage: sessionsError?.message,
      sessions: sessions?.map(s => ({
        userId: s.user_id,
        createdAt: s.created_at,
        expiresAt: s.expires_at,
        lastUsedAt: s.last_used_at
      })) || []
    });

    // Test 3: Check refresh tokens
    console.log('\n🔄 TEST 3: Checking refresh tokens');
    const { data: refreshTokens, error: tokensError } = await supabase
      .from('refresh_tokens')
      .select('user_id, created_at, expires_at, revoked')
      .eq('revoked', false)
      .limit(10);

    console.log('📊 Refresh tokens:', {
      tokenCount: refreshTokens?.length || 0,
      hasError: !!tokensError,
      errorMessage: tokensError?.message,
      tokens: refreshTokens?.map(t => ({
        userId: t.user_id,
        createdAt: t.created_at,
        expiresAt: t.expires_at,
        revoked: t.revoked
      })) || []
    });

    // Test 4: Check user profiles
    console.log('\n👤 TEST 4: Checking user profiles');
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, display_name, last_active, empathy_credits')
      .limit(10);

    console.log('📊 User profiles:', {
      profileCount: profiles?.length || 0,
      hasError: !!profilesError,
      errorMessage: profilesError?.message,
      profiles: profiles?.map(p => ({
        id: p.id,
        displayName: p.display_name,
        lastActive: p.last_active,
        empathyCredits: p.empathy_credits
      })) || []
    });

    // Test 5: Test Supabase connectivity
    console.log('\n🌐 TEST 5: Testing Supabase connectivity');
    const startTime = Date.now();
    const { data: healthData, error: healthError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    const endTime = Date.now();

    console.log('📊 Connectivity test:', {
      responseTime: endTime - startTime,
      hasError: !!healthError,
      errorMessage: healthError?.message,
      timestamp: new Date().toISOString()
    });

    // Test 6: Check for expired sessions
    console.log('\n⏰ TEST 6: Checking for expired sessions');
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    const { data: expiredSessions, error: expiredError } = await supabase
      .from('sessions')
      .select('user_id, expires_at')
      .lt('expires_at', now.toISOString())
      .limit(5);

    console.log('📊 Expired sessions check:', {
      expiredCount: expiredSessions?.length || 0,
      hasError: !!expiredError,
      errorMessage: expiredError?.message,
      expiredSessions: expiredSessions?.map(s => ({
        userId: s.user_id,
        expiresAt: s.expires_at
      })) || []
    });

    // Test 7: Check recent auth events
    console.log('\n📋 TEST 7: Checking recent auth events');
    const { data: authEvents, error: eventsError } = await supabase
      .from('audit_log_entries')
      .select('user_id, action, created_at, metadata')
      .in('action', ['user_signed_in', 'user_signed_out', 'token_refreshed'])
      .order('created_at', { ascending: false })
      .limit(20);

    console.log('📊 Recent auth events:', {
      eventCount: authEvents?.length || 0,
      hasError: !!eventsError,
      errorMessage: eventsError?.message,
      events: authEvents?.map(e => ({
        userId: e.user_id,
        action: e.action,
        createdAt: e.created_at,
        metadata: e.metadata
      })) || []
    });

    console.log('\n🎯 CRITICAL AUTH LOG - Debugging session complete');
    console.log('💡 RECOMMENDATIONS:');
    console.log('1. Check browser console for "CRITICAL AUTH LOG" messages');
    console.log('2. Look for session expiry warnings (< 5 minutes)');
    console.log('3. Check for unexpected SIGNED_OUT events');
    console.log('4. Verify token refresh is working properly');
    console.log('5. Monitor middleware session validation');

  } catch (error) {
    console.error('💥 CRITICAL AUTH LOG - Debug script failed:', {
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}

debugAuthLogout().catch(console.error);

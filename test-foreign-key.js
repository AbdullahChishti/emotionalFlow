// Test foreign key constraint with service role key (bypasses RLS)
const { createClient } = require('@supabase/supabase-js');

// Use service role key to bypass RLS
const supabaseUrl = 'https://fpahhfzmkjsienzzeyks.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwYWhoZnpta2pzaWVuenpleWtzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNTkzNDQyMCwiZXhwIjoyMDUxNTEwNDIwfQ.jYC_pGjV7VIEhOXQHH2Hks-KSxcDNXSxHdvZXgSEZlw';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testForeignKeyConstraint() {
  const userId = '09eb68b7-3807-4cef-9bff-ac8be093f661';

  console.log('🔍 Testing foreign key constraint with service role...');

  try {
    // Check profile exists
    console.log('1. Checking if profile exists...');
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('❌ Profile check error:', profileError);
      return;
    }

    if (profile) {
      console.log('✅ Profile exists:', { id: profile.id, user_id: profile.user_id });
    } else {
      console.log('❌ Profile does not exist');
      return;
    }

    // Try to insert assessment with service role (bypasses RLS)
    console.log('2. Testing assessment insert with service role...');

    const testData = {
      user_id: userId,
      assessment_id: 'test-service-role-' + Date.now(),
      title: 'Test Assessment (Service Role)',
      score: 75,
      level: 'high',
      severity: 'moderate',
      responses: { 'question1': 'answer1' },
      result_data: { score: 75 },
      taken_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data: result, error: insertError } = await supabase
      .from('assessment_results')
      .insert(testData)
      .select();

    if (insertError) {
      console.error('❌ Service role insert failed:', insertError);
      console.log('❌ This confirms the foreign key constraint is the issue');
    } else {
      console.log('✅ Service role insert succeeded:', result);
      console.log('✅ Foreign key constraint is working correctly');
    }

  } catch (error) {
    console.error('❌ Script error:', error);
  }
}

testForeignKeyConstraint().catch(console.error);

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testMultipleAssessments() {
  console.log('🧪 Testing multiple assessment results functionality...');
  
  const testUserId = '94e1fd19-4eaa-4527-9a15-7b503867ff96'; // From the logs
  const assessmentId = 'phq9';
  const assessmentTitle = 'PHQ-9 Depression Assessment';
  
  try {
    // Clean up any existing test data
    console.log('🧹 Cleaning up existing test data...');
    await supabase
      .from('assessment_results')
      .delete()
      .eq('user_id', testUserId)
      .eq('assessment_id', assessmentId);
    
    // Insert first assessment result
    console.log('📝 Inserting first assessment result...');
    const firstResult = {
      user_id: testUserId,
      assessment_id: assessmentId,
      assessment_title: assessmentTitle,
      score: 10,
      level: 'Mild Depression',
      severity: 'mild',
      responses: { q1: 2, q2: 1, q3: 2 },
      result_data: {
        description: 'First assessment shows mild depression symptoms',
        recommendations: ['Exercise regularly', 'Consider therapy'],
        insights: ['Mood patterns identified'],
        nextSteps: ['Schedule follow-up'],
        manifestations: ['Low energy', 'Sleep issues']
      },
      friendly_explanation: 'First assessment explanation'
    };
    
    const { data: first, error: firstError } = await supabase
      .from('assessment_results')
      .insert(firstResult)
      .select();
    
    if (firstError) {
      console.error('❌ Error inserting first result:', firstError);
      return;
    }
    
    console.log('✅ First result inserted:', first[0]?.id);
    
    // Wait a moment to ensure different timestamps
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Insert second assessment result (retake)
    console.log('📝 Inserting second assessment result (retake)...');
    const secondResult = {
      user_id: testUserId,
      assessment_id: assessmentId,
      assessment_title: assessmentTitle,
      score: 15,
      level: 'Moderate Depression',
      severity: 'moderate',
      responses: { q1: 3, q2: 2, q3: 3 },
      result_data: {
        description: 'Second assessment shows worsening symptoms',
        recommendations: ['Seek professional help', 'Medication evaluation'],
        insights: ['Symptoms have increased'],
        nextSteps: ['Book therapy appointment'],
        manifestations: ['Persistent sadness', 'Loss of interest']
      },
      friendly_explanation: 'Second assessment explanation'
    };
    
    const { data: second, error: secondError } = await supabase
      .from('assessment_results')
      .insert(secondResult)
      .select();
    
    if (secondError) {
      console.error('❌ Error inserting second result:', secondError);
      return;
    }
    
    console.log('✅ Second result inserted:', second[0]?.id);
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Insert third assessment result (improvement)
    console.log('📝 Inserting third assessment result (improvement)...');
    const thirdResult = {
      user_id: testUserId,
      assessment_id: assessmentId,
      assessment_title: assessmentTitle,
      score: 5,
      level: 'Minimal Depression',
      severity: 'normal',
      responses: { q1: 1, q2: 0, q3: 1 },
      result_data: {
        description: 'Third assessment shows significant improvement',
        recommendations: ['Continue current treatment', 'Maintain healthy habits'],
        insights: ['Treatment is working well'],
        nextSteps: ['Regular check-ins'],
        manifestations: ['Improved mood', 'Better sleep']
      },
      friendly_explanation: 'Third assessment explanation'
    };
    
    const { data: third, error: thirdError } = await supabase
      .from('assessment_results')
      .insert(thirdResult)
      .select();
    
    if (thirdError) {
      console.error('❌ Error inserting third result:', thirdError);
      return;
    }
    
    console.log('✅ Third result inserted:', third[0]?.id);
    
    // Now query all results for this user and assessment
    console.log('🔍 Querying all results for user and assessment...');
    const { data: allResults, error: queryError } = await supabase
      .from('assessment_results')
      .select('id, assessment_id, score, level, severity, taken_at, result_data')
      .eq('user_id', testUserId)
      .eq('assessment_id', assessmentId)
      .order('taken_at', { ascending: false });
    
    if (queryError) {
      console.error('❌ Error querying results:', queryError);
      return;
    }
    
    console.log('📊 Query results:');
    console.log(`Found ${allResults.length} results for ${assessmentId}`);
    
    allResults.forEach((result, index) => {
      console.log(`\n${index + 1}. Result ID: ${result.id}`);
      console.log(`   Score: ${result.score} (${result.level})`);
      console.log(`   Severity: ${result.severity}`);
      console.log(`   Taken At: ${result.taken_at}`);
      console.log(`   Has Description: ${!!result.result_data?.description}`);
      console.log(`   Has Recommendations: ${Array.isArray(result.result_data?.recommendations)}`);
    });
    
    if (allResults.length === 3) {
      console.log('\n🎉 SUCCESS: Multiple assessment results are working correctly!');
      console.log('✅ Users can now retake assessments and see their full history');
      
      // Verify the progression
      const scores = allResults.map(r => r.score).reverse(); // Reverse to get chronological order
      console.log(`\n📈 Score progression: ${scores.join(' → ')}`);
      console.log('   This shows the user\'s journey from mild to moderate to minimal depression');
      
    } else {
      console.log(`\n❌ Expected 3 results, but got ${allResults.length}`);
    }
    
    // Clean up test data
    console.log('\n🧹 Cleaning up test data...');
    await supabase
      .from('assessment_results')
      .delete()
      .eq('user_id', testUserId)
      .eq('assessment_id', assessmentId);
    
    console.log('✅ Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testMultipleAssessments().catch(console.error);

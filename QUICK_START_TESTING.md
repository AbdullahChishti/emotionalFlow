# Quick Start: Testing Assessment-Enhanced Chat

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Set Up Environment Variables
Make sure you have these in your `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
```

### Step 3: Run Database Migrations
```bash
# Apply the new migration for progress tracking
supabase db push
```

### Step 4: Set Up Test Data
```bash
npm run test:setup
```

This creates 3 test users with different assessment profiles:
- **Low Risk User**: Minimal symptoms, general support
- **Moderate Risk User**: Some symptoms, therapeutic approaches
- **High Risk User**: Severe symptoms, crisis protocols

### Step 5: Start the Development Server
```bash
npm run dev
```

### Step 6: Test the System
1. Navigate to `http://localhost:3000/test-chat`
2. Sign in with one of the test users:
   - `test1@example.com` (Low Risk)
   - `test2@example.com` (Moderate Risk)  
   - `test3@example.com` (High Risk)
3. Click "Run All Tests" to validate the system
4. Try the manual test messages
5. Use the live chat interface

## 🧪 What to Test

### Automated Tests
The test suite automatically validates:
- ✅ Assessment data retrieval
- ✅ Personalized recommendations
- ✅ Chat message sending
- ✅ Crisis detection
- ✅ Progress tracking
- ✅ Emotional state adaptation

### Manual Testing
Try these scenarios:

**Low Risk User (test1@example.com)**:
- "I'm doing well but want to stay healthy"
- "What can I do to prevent mental health issues?"

**Moderate Risk User (test2@example.com)**:
- "I've been feeling anxious lately"
- "I'm having trouble concentrating"

**High Risk User (test3@example.com)**:
- "I'm really struggling with depression"
- "I feel hopeless about everything"

**Crisis Detection (any user)**:
- "I'm having thoughts of hurting myself"
- "I want to end it all"

## 🔍 What to Look For

### Assessment Integration
- Risk level displays correctly
- Focus areas are relevant to assessment data
- Recommendations match user profile
- System prompts adapt to assessment results

### Personalization
- Responses vary by emotional state
- Crisis detection is assessment-aware
- Safety protocols are appropriate
- Professional referrals are relevant

### Progress Tracking
- Conversations are tracked
- Sentiment analysis works
- Progress insights are generated
- Trends are calculated correctly

## 🐛 Troubleshooting

### Common Issues

**"No active session" error**:
- Make sure you're signed in
- Check browser console for errors
- Verify database connection

**"No assessment data"**:
- Run `npm run test:setup` again
- Check database for assessment results
- Verify user ID matches

**Crisis not detected**:
- Use explicit crisis language
- Check crisis keywords in message
- Verify crisis detection logic

**Recommendations not loading**:
- Check assessment data exists
- Verify recommendation engine
- Check for JavaScript errors

### Debug Mode
Enable debug logging:
```bash
DEBUG=assessment-chat:* npm run dev
```

### Check Database
```sql
-- Verify test data exists
SELECT * FROM assessment_results WHERE user_id LIKE 'test-user-%';
SELECT * FROM user_assessment_profiles WHERE user_id LIKE 'test-user-%';
```

## 🧹 Cleanup
When done testing:
```bash
npm run test:cleanup
```

## 📊 Success Criteria

The system is working correctly if:
- ✅ All automated tests pass
- ✅ Assessment data integrates with chat
- ✅ Personalized responses are generated
- ✅ Crisis detection works accurately
- ✅ Progress tracking functions properly
- ✅ Recommendations are relevant to user profile

## 🆘 Need Help?

1. Check the [full testing guide](TESTING_GUIDE.md)
2. Review the [integration documentation](ASSESSMENT_CHAT_INTEGRATION.md)
3. Check browser console for errors
4. Verify environment variables are set
5. Ensure database migrations are applied

## 🎯 Next Steps

After successful testing:
1. Deploy to staging environment
2. Conduct user acceptance testing
3. Gather feedback from mental health professionals
4. Iterate based on feedback
5. Deploy to production with monitoring

Happy testing! 🚀

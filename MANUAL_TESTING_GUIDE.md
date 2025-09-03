# Manual Testing Guide: Assessment-Enhanced Chat

Since the automated test data setup has database constraint issues, here's how to test the system manually with your existing user account.

## 🚀 Quick Start

### 1. **Start the Development Server**
```bash
npm run dev
```
The server should be running at `http://localhost:3000`

### 2. **Access the Test Interface**
Navigate to `http://localhost:3000/test-chat`

### 3. **Sign In**
Use your existing user account to sign in to the application.

### 4. **Test the System**
The test interface will show you the current state of your assessment data and allow you to test the chat system.

## 🧪 Testing Scenarios

### Scenario 1: User with No Assessment Data

**What to Test**:
- System shows "No Assessment Data Available"
- Risk level: "low"
- General support approach
- Encouragement to complete assessments

**Test Messages**:
```
"I'm feeling a bit stressed today"
"How can I improve my mental health?"
"I want to learn about anxiety management"
```

**Expected Behavior**:
- AI responds with general supportive guidance
- No specific therapeutic approaches mentioned
- Encouragement to complete assessments for better personalization

### Scenario 2: User with Assessment Data

**Setup**: Complete some assessments first by going to `/assessments`

**What to Test**:
- Assessment data displays correctly
- Risk level calculation is accurate
- Personalized approaches are applied
- Focus areas are relevant
- Recommendations match user profile

**Test Messages**:
```
"I'm feeling anxious today"
"I've been having trouble sleeping"
"I feel overwhelmed with everything"
```

**Expected Behavior**:
- AI responses adapt to your assessment results
- Specific therapeutic approaches mentioned (CBT, mindfulness, etc.)
- Relevant recommendations provided
- Crisis detection works if applicable

### Scenario 3: Crisis Detection

**Test Messages**:
```
"I'm having thoughts of hurting myself"
"I want to end it all"
"I can't go on like this"
```

**Expected Behavior**:
- Immediate crisis response
- Emergency contact information provided
- Safety-first approach
- Professional help strongly encouraged

## 🔍 What to Look For

### Assessment Integration
- ✅ Risk level displays correctly based on assessment scores
- ✅ Focus areas are relevant to user's mental health profile
- ✅ Recommendations match assessment data
- ✅ System prompts adapt to assessment results

### Personalization
- ✅ Responses vary by emotional state
- ✅ Crisis detection is assessment-aware
- ✅ Safety protocols are appropriate
- ✅ Professional referrals are relevant

### Progress Tracking
- ✅ Conversations are tracked
- ✅ Sentiment analysis works
- ✅ Progress insights are generated
- ✅ Trends are calculated correctly

## 🛠️ Manual Test Steps

### Step 1: Check Session Status
1. Navigate to `/test-chat`
2. Verify session initializes automatically
3. Check assessment context displays
4. Confirm risk level is shown

### Step 2: Test Basic Messaging
1. Send a simple message: "Hello, how are you?"
2. Verify response is received
3. Check emotional tone is detected
4. Confirm assessment context is included

### Step 3: Test Emotional State Adaptation
1. Set emotional state to "anxious"
2. Send message: "I'm feeling worried"
3. Verify response adapts to anxious state
4. Change emotional state to "hopeful"
5. Send same message and verify different response

### Step 4: Test Crisis Detection
1. Send crisis message: "I want to hurt myself"
2. Verify crisis is detected
3. Check emergency resources are provided
4. Confirm professional help is encouraged

### Step 5: Test Personalized Recommendations
1. Click "Show" in recommendations panel
2. Verify recommendations are relevant to user profile
3. Check recommendations are prioritized correctly
4. Confirm different types are included

### Step 6: Test Progress Tracking
1. Send several messages
2. Check progress summary updates
3. Verify conversation count increases
4. Confirm sentiment tracking works

## 🎯 Success Criteria

The system is working correctly if:
- ✅ All automated tests pass
- ✅ Assessment data integrates with chat responses
- ✅ Personalized responses are generated based on user profile
- ✅ Crisis detection works accurately
- ✅ Progress tracking functions properly
- ✅ Recommendations are relevant to user's assessment data

## 🐛 Troubleshooting

### Common Issues

**"No active session" error**:
- Make sure you're signed in
- Check browser console for errors
- Verify database connection

**"No assessment data"**:
- Complete assessments first at `/assessments`
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

### Check Browser Console
Look for:
- Assessment context data
- Chat responses
- Error messages
- API calls

## 📊 Testing Checklist

### ✅ Basic Functionality
- [ ] Chat session initializes successfully
- [ ] Messages send and receive responses
- [ ] Emotional state selector works
- [ ] Assessment context displays correctly
- [ ] Error handling works properly

### ✅ Assessment Integration
- [ ] Assessment data retrieves correctly
- [ ] Risk level calculation is accurate
- [ ] Personalized approaches are applied
- [ ] Focus areas are relevant
- [ ] Recommendations are appropriate

### ✅ Personalization
- [ ] System prompts adapt to assessment data
- [ ] Responses vary by emotional state
- [ ] Recommendations match user profile
- [ ] Crisis detection is assessment-aware
- [ ] Safety protocols are appropriate

### ✅ Crisis Detection
- [ ] Crisis keywords trigger appropriate response
- [ ] Emergency resources are provided
- [ ] Professional help is encouraged
- [ ] Response is immediate and clear
- [ ] Safety protocols are followed

### ✅ Progress Tracking
- [ ] Conversations are tracked
- [ ] Sentiment analysis works
- [ ] Progress insights are generated
- [ ] Trends are calculated correctly
- [ ] Recommendations are updated

## 🎉 Next Steps

After successful testing:
1. Complete assessments to get personalized responses
2. Test different emotional states
3. Try crisis detection scenarios
4. Verify progress tracking works
5. Check that recommendations are relevant

## 🆘 Need Help?

1. Check the [full testing guide](TESTING_GUIDE.md)
2. Review the [integration documentation](ASSESSMENT_CHAT_INTEGRATION.md)
3. Check browser console for errors
4. Verify environment variables are set
5. Ensure database migrations are applied

Happy testing! 🚀

# Testing Guide: Assessment-Enhanced ChatGPT Integration

This guide provides comprehensive instructions for testing the assessment-enhanced chat system.

## Quick Start Testing

### 1. Access the Test Page
Navigate to `/test-chat` in your application to access the dedicated testing interface.

### 2. Run Automated Tests
Click "Run All Tests" in the Test Suite panel to automatically validate:
- Assessment data retrieval
- Personalized recommendations generation
- Chat message sending
- Crisis detection
- Progress tracking
- Emotional state adaptation

### 3. Manual Testing
Use the "Manual Test Messages" section to test specific scenarios with predefined messages.

## Testing Scenarios

### Scenario 1: User with No Assessment Data

**Setup**: User who hasn't completed any assessments

**Expected Behavior**:
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

### Scenario 2: User with Low Risk Assessment Data

**Setup**: User with PHQ-9 score 3, GAD-7 score 2, ACE score 1

**Expected Behavior**:
- Risk level: "low"
- Wellness-focused approach
- Preventive care recommendations
- General support and resources

**Test Messages**:
```
"I'm doing well but want to stay healthy"
"What can I do to prevent mental health issues?"
"I'd like to build better coping skills"
```

### Scenario 3: User with Moderate Risk Assessment Data

**Setup**: User with PHQ-9 score 12, GAD-7 score 8, ACE score 3

**Expected Behavior**:
- Risk level: "moderate"
- Supportive guidance with professional referrals
- CBT and anxiety management approaches
- Enhanced monitoring

**Test Messages**:
```
"I've been feeling anxious lately"
"I'm having trouble concentrating"
"I feel overwhelmed with work"
```

### Scenario 4: User with High Risk Assessment Data

**Setup**: User with PHQ-9 score 18, GAD-7 score 15, ACE score 7

**Expected Behavior**:
- Risk level: "high"
- Enhanced safety protocols
- Strong professional referral recommendations
- Crisis monitoring

**Test Messages**:
```
"I'm really struggling with depression"
"I can't seem to get out of bed"
"I feel hopeless about everything"
```

### Scenario 5: Crisis Detection

**Setup**: Any user with crisis-indicating messages

**Expected Behavior**:
- Immediate crisis response
- Emergency contact information
- Safety-first approach
- Professional help encouragement

**Test Messages**:
```
"I'm having thoughts of hurting myself"
"I want to end it all"
"I can't go on like this"
"I'm thinking about suicide"
```

## Testing Checklist

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

## Manual Testing Steps

### Step 1: Initialize Session
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

## Database Testing

### Check Assessment Data
```sql
-- Verify assessment results exist
SELECT * FROM assessment_results WHERE user_id = 'your-user-id';

-- Check user assessment profiles
SELECT * FROM user_assessment_profiles WHERE user_id = 'your-user-id';

-- Verify assessment sessions
SELECT * FROM assessment_sessions WHERE user_id = 'your-user-id';
```

### Check Progress Tracking
```sql
-- Verify conversation progress
SELECT * FROM conversation_progress WHERE user_id = 'your-user-id';

-- Check recommendation tracking
SELECT * FROM recommendation_tracking WHERE user_id = 'your-user-id';

-- Verify progress insights
SELECT * FROM progress_insights WHERE user_id = 'your-user-id';
```

## API Testing

### Test Chat AI Function
```bash
curl -X POST 'https://your-project.supabase.co/functions/v1/chat-ai' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "message": "I am feeling anxious today",
    "emotionalState": "anxious",
    "conversationHistory": []
  }'
```

### Expected Response Structure
```json
{
  "response": "I hear that you're feeling anxious today...",
  "success": true,
  "isCrisis": false,
  "emotionalTone": "empathetic",
  "isAffirmation": true,
  "assessmentContext": {
    "hasAssessmentData": true,
    "riskLevel": "moderate",
    "focusAreas": ["anxiety_management", "relaxation_skills"],
    "recommendations": ["anxiety_resources", "breathing_exercises"],
    "lastAssessed": "2024-01-03T10:00:00Z"
  }
}
```

## Troubleshooting

### Common Issues

**1. Session Not Initializing**
- Check user authentication
- Verify database connection
- Check browser console for errors

**2. No Assessment Data**
- Complete assessments first
- Check database for assessment results
- Verify user ID matches

**3. Crisis Not Detected**
- Check crisis keywords in message
- Verify crisis detection logic
- Test with explicit crisis language

**4. Recommendations Not Loading**
- Check assessment data exists
- Verify recommendation engine
- Check for JavaScript errors

**5. Progress Tracking Fails**
- Check database permissions
- Verify table structure
- Check for missing data

### Debug Mode

Enable debug logging by adding to your environment:
```bash
DEBUG=assessment-chat:*
```

### Console Logging

Check browser console for:
- Assessment context data
- Chat responses
- Error messages
- API calls

## Performance Testing

### Load Testing
1. Send multiple messages rapidly
2. Test with multiple users
3. Monitor response times
4. Check for rate limiting

### Memory Testing
1. Send many messages in one session
2. Check for memory leaks
3. Monitor browser performance
4. Test session cleanup

## Security Testing

### Data Privacy
1. Verify assessment data is not exposed in responses
2. Check RLS policies are working
3. Test with different user accounts
4. Verify data isolation

### Crisis Safety
1. Test crisis detection accuracy
2. Verify emergency resources are current
3. Check professional referral accuracy
4. Test safety protocol effectiveness

## Success Criteria

### Functional Requirements
- ✅ Assessment data integrates with chat
- ✅ Personalized responses are generated
- ✅ Crisis detection works accurately
- ✅ Progress tracking functions properly
- ✅ Recommendations are relevant

### Performance Requirements
- ✅ Response time < 3 seconds
- ✅ System handles concurrent users
- ✅ Memory usage remains stable
- ✅ Database queries are optimized

### Security Requirements
- ✅ User data is protected
- ✅ Crisis protocols are followed
- ✅ Professional boundaries maintained
- ✅ Privacy requirements met

## Next Steps

After successful testing:
1. Deploy to staging environment
2. Conduct user acceptance testing
3. Gather feedback from mental health professionals
4. Iterate based on feedback
5. Deploy to production with monitoring

## Support

For testing issues:
1. Check this guide first
2. Review console logs
3. Test with different user scenarios
4. Contact development team with specific error details

# Assessment-Enhanced ChatGPT Integration

This document describes the complete integration of user assessment data with ChatGPT to provide personalized therapy conversations and recommendations.

## Overview

The system leverages existing assessment data (PHQ-9, GAD-7, ACE, CD-RISC) to create personalized AI therapy experiences that adapt to each user's specific mental health profile, safety needs, and therapeutic preferences.

## Architecture

```
User Message → Chat AI Function → Assessment Data Retrieval → Personalized System Prompt → ChatGPT API → Assessment-Aware Response
```

## Key Components

### 1. Assessment Chat Service (`src/lib/assessment-chat-service.ts`)

**Purpose**: Retrieves and processes user assessment data for chat personalization.

**Key Features**:
- Fetches latest assessment results and user profiles
- Processes assessment data into structured format
- Assesses risk levels (low, moderate, high, crisis)
- Generates personalized therapeutic approaches
- Creates assessment-aware system prompts

**Main Methods**:
- `getUserAssessmentContext(userId)`: Gets comprehensive assessment context
- `generatePersonalizedChatData(userId)`: Creates personalized chat configuration

### 2. Enhanced Chat AI Function (`supabase/functions/chat-ai/index.ts`)

**Purpose**: Modified chat AI function that integrates assessment data.

**Key Features**:
- Automatic assessment data retrieval for authenticated users
- Dynamic system prompt generation based on assessment results
- Assessment-aware crisis detection
- Personalized response generation
- Enhanced safety protocols

**Assessment Integration**:
- Retrieves latest assessment results and user profiles
- Processes assessment data into risk levels and therapeutic approaches
- Generates personalized system prompts
- Includes assessment context in conversation history
- Provides assessment-based metadata in responses

### 3. Chat Personalization Service (`src/lib/chat-personalization.ts`)

**Purpose**: Client-side service for managing assessment-enhanced chat sessions.

**Key Features**:
- Session management with assessment context
- Message sending with emotional state tracking
- Assessment data processing and risk assessment
- Error handling and fallback behavior

**Main Methods**:
- `initializeSession(userId, emotionalState)`: Creates new chat session
- `sendMessage(message, emotionalState)`: Sends message with assessment context
- `getPersonalizedRecommendations()`: Gets current recommendations

### 4. React Hook (`src/hooks/useAssessmentChat.ts`)

**Purpose**: React hook for easy integration with the personalized chat system.

**Key Features**:
- Automatic session initialization
- Real-time assessment context updates
- Emotional state management
- Error handling and loading states
- Progress tracking integration

### 5. Personalized Recommendation Engine (`src/lib/personalized-recommendations.ts`)

**Purpose**: Generates tailored recommendations based on assessment data.

**Recommendation Types**:
- **Therapy**: CBT, exposure therapy, trauma-informed care, EMDR
- **Content**: Self-help workbooks, mood tracking, mindfulness exercises
- **Activities**: Behavioral activation, breathing exercises, grounding techniques
- **Resources**: Professional referrals, support groups, crisis resources
- **Community**: Support groups, peer mentoring, specialized communities

**Personalization Logic**:
- Depression (PHQ-9): CBT, behavioral activation, mood tracking
- Anxiety (GAD-7): Exposure therapy, relaxation techniques, mindfulness
- Trauma (ACE): Trauma-informed care, grounding techniques, EMDR
- Resilience (CD-RISC): Skill building, social support, strength-based approaches

### 6. Progress Tracking System (`src/lib/progress-tracking.ts`)

**Purpose**: Tracks user progress and provides assessment-based insights.

**Key Features**:
- Conversation sentiment analysis
- Assessment score trend tracking
- Recommendation completion monitoring
- Progress insight generation
- Trend analysis and reporting

**Database Tables**:
- `conversation_progress`: Tracks conversation analytics
- `recommendation_tracking`: Monitors recommendation completion
- `progress_insights`: Stores generated insights

### 7. Example Component (`src/components/chat/AssessmentEnhancedChat.tsx`)

**Purpose**: Complete example demonstrating the integrated system.

**Features**:
- Real-time chat interface
- Assessment context display
- Emotional state selector
- Personalized recommendations
- Progress summary
- Crisis detection and response

## Assessment-Based Personalization

### Risk Level Assessment

The system automatically assesses user risk levels based on assessment scores:

- **Crisis**: PHQ-9 ≥ 15 OR GAD-7 ≥ 15
- **High**: (PHQ-9 ≥ 10 AND ACE ≥ 6) OR (PHQ-9 ≥ 10 AND suicidal ideation) OR (ACE ≥ 6 AND current symptoms)
- **Moderate**: PHQ-9 ≥ 10 OR GAD-7 ≥ 10 OR ACE ≥ 4 OR (PHQ-9 ≥ 5 AND GAD-7 ≥ 5)
- **Low**: All other cases

### Therapeutic Approach Selection

Based on assessment results, the system selects appropriate therapeutic approaches:

**Depression (PHQ-9 ≥ 10)**:
- CBT approach with behavioral activation
- Mood regulation and activity scheduling
- Cognitive restructuring techniques

**Anxiety (GAD-7 ≥ 10)**:
- Anxiety management with mindfulness
- Worry management and relaxation skills
- Exposure and response prevention

**Trauma (ACE ≥ 4)**:
- Trauma-informed care with safety-first approach
- Grounding techniques and safety building
- Trauma processing with professional support

**Resilience (CD-RISC < 30)**:
- Skill building and support network development
- Coping skill development and social support
- Resilience building activities

### Safety Protocols

The system implements assessment-informed safety measures:

- **Crisis Protocol**: Immediate safety assessment and crisis resources
- **High Risk Protocol**: Enhanced monitoring and professional referrals
- **Trauma Protocol**: Trauma-informed language and trigger monitoring
- **Standard Protocol**: General support and wellness focus

## Usage Examples

### Basic Integration

```typescript
import { useAssessmentChat } from '@/hooks/useAssessmentChat'

function MyChatComponent() {
  const {
    session,
    isInitialized,
    sendMessage,
    hasAssessmentData,
    riskLevel,
    recommendations
  } = useAssessmentChat()

  const handleSendMessage = async () => {
    const response = await sendMessage("I'm feeling anxious today")
    // Response includes assessment-aware guidance
  }

  return (
    <div>
      {hasAssessmentData && (
        <div>Risk Level: {riskLevel}</div>
      )}
      {/* Chat interface */}
    </div>
  )
}
```

### Personalized Recommendations

```typescript
import { PersonalizedRecommendationEngine } from '@/lib/personalized-recommendations'

const context = {
  userProfile: userProfile,
  currentEmotionalState: 'anxious',
  riskLevel: 'moderate'
}

const recommendations = PersonalizedRecommendationEngine.generateRecommendations(context)
```

### Progress Tracking

```typescript
import { ProgressTrackingService } from '@/lib/progress-tracking'

// Track conversation
await ProgressTrackingService.trackConversation(userId, sessionId, analysis)

// Generate progress report
const report = await ProgressTrackingService.generateProgressReport(userId, 30)
```

## Database Schema

### Assessment Tables (Existing)
- `assessment_results`: Individual assessment completions
- `user_assessment_profiles`: Processed user profile data
- `assessment_sessions`: Assessment flow tracking

### Progress Tracking Tables (New)
- `conversation_progress`: Conversation analytics and sentiment
- `recommendation_tracking`: Recommendation completion tracking
- `progress_insights`: Generated insights and recommendations

## Security and Privacy

### Data Protection
- Assessment data only accessible to authenticated user
- No assessment data stored in conversation logs
- Secure handling of sensitive mental health information
- Row Level Security (RLS) policies implemented

### Safety Measures
- Assessment-informed crisis detection
- Automatic safety resource suggestions
- Trauma-informed language selection
- Professional referral recommendations

## Testing and Validation

### Test Scenarios
1. **No Assessment Data**: Users without assessments receive general support
2. **Low Risk Users**: Wellness-focused approach with preventive care
3. **Moderate Risk Users**: Supportive guidance with professional referrals
4. **High Risk Users**: Enhanced monitoring with crisis protocols
5. **Crisis Users**: Immediate safety assessment and emergency resources

### Success Metrics
- Increased user engagement with personalized responses
- Appropriate crisis detection and response
- User satisfaction with personalized recommendations
- Effective progress tracking and insights

## Future Enhancements

### Planned Features
1. **Advanced Sentiment Analysis**: Real-time conversation sentiment tracking
2. **Predictive Analytics**: Early warning systems for mental health crises
3. **Integration with External APIs**: Professional referral networks
4. **Mobile Optimization**: Enhanced mobile chat experience
5. **Multi-language Support**: Localized therapeutic approaches

### Research Opportunities
1. **Effectiveness Studies**: Measure impact of personalized AI therapy
2. **User Experience Research**: Optimize personalization algorithms
3. **Clinical Validation**: Validate therapeutic approach effectiveness
4. **Long-term Outcomes**: Track long-term mental health improvements

## Conclusion

The assessment-enhanced ChatGPT integration provides a comprehensive, personalized AI therapy experience that adapts to each user's specific mental health needs. By leveraging existing assessment data, the system ensures appropriate therapeutic approaches, safety protocols, and personalized recommendations while maintaining user privacy and professional boundaries.

The modular architecture allows for easy extension and customization, making it suitable for various mental health applications and user populations.

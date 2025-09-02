// Chat Configuration - Centralized settings for chat functionality
export const CHAT_CONFIG = {
  // App branding
  appName: process.env.NEXT_PUBLIC_APP_NAME || 'MindWell',
  appUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',

  // Chat placeholders
  placeholders: [
    "Share what you're feeling...",
    'Start with one word, if that\'s easier.',
    'No pressure. Just type what\'s on your mind.',
    'You don\'t have to explain. Just be here.',
  ],

  // Typing suggestions
  typingSuggestions: [
    "You could start by telling me how you're feeling today.",
    'Is there something specific that\'s weighing on you?',
    'No pressure, just share what comes to mind.',
  ],

  // Chat UI text
  uiText: {
    therapySession: 'Therapy Session',
    youreWith: "You're with",
    endSession: 'End Session',
    stayHere: 'Stay Here',
    sessionPrivate: "This session is private and won't be saved. You're in control—end anytime.",
    endSessionConfirm: 'End this session?',
    endSessionDescription: 'You can always start a new conversation whenever you\'re ready.',
    fallbackResponse: 'Thank you for sharing that. Tell me more.',
    initialMessageTemplate: (name: string) => `Hey, I'm ${name}. Thanks for reaching out. What's on your mind?`,
    listenerIntro: (name: string) => `${name} is here to listen without judgment. You're safe here.`,
  },

  // Timing configurations
  timing: {
    introCardDuration: 8000, // 8 seconds
    placeholderRotation: 5000, // 5 seconds
    suggestionDelay: 15000, // 15 seconds
    aiResponseDelay: 1000, // 1 second
  },

  // Feature flags
  features: {
    voiceChat: process.env.NEXT_PUBLIC_ENABLE_VOICE_CHAT === 'true',
    crisisDetection: process.env.NEXT_PUBLIC_ENABLE_CRISIS_DETECTION === 'true',
    anonymousMode: process.env.NEXT_PUBLIC_ENABLE_ANONYMOUS_MODE === 'true',
  },

  // AI Configuration
  ai: {
    model: 'gpt-4o-mini',
    maxTokens: 300,
    temperature: 0.7,
    conversationHistoryLength: 3, // Keep last 3 messages for context
    timeout: 25000, // 25 seconds
  },

  // Mood detection keywords
  moodKeywords: {
    sad: ['sad', 'unhappy', 'down', 'depressed', 'blue', 'low'],
    anxious: ['anxious', 'worry', 'worried', 'stress', 'stressed', 'nervous', 'panicked'],
    angry: ['angry', 'upset', 'frustrated', 'mad', 'furious', 'annoyed'],
    overwhelmed: ['overwhelm', 'overwhelmed', 'too much', 'can\'t handle', 'swamped', 'drowning'],
    hopeful: ['hope', 'hopeful', 'better', 'improve', 'optimistic', 'positive', 'good'],
  },

  // Crisis detection keywords (handled in the AI function)
  crisisKeywords: [
    'suicide', 'kill myself', 'end it all',
    'self-harm', 'cutting', 'overdose',
    'emergency', 'crisis', 'help me',
    'want to die', 'better off dead',
    'can\'t go on', 'tired of living'
  ],
}

// Helper functions
export const detectMood = (message: string): string => {
  const lowerMessage = message.toLowerCase()

  for (const [mood, keywords] of Object.entries(CHAT_CONFIG.moodKeywords)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      return mood
    }
  }

  return 'calm' // Default mood
}

export const getRandomPlaceholder = (): string => {
  return CHAT_CONFIG.placeholders[Math.floor(Math.random() * CHAT_CONFIG.placeholders.length)]
}

export const getRandomSuggestion = (): string => {
  return CHAT_CONFIG.typingSuggestions[Math.floor(Math.random() * CHAT_CONFIG.typingSuggestions.length)]
}

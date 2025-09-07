/**
 * Enhanced TypeScript definitions for SessionScreen redesign
 * Optimized for mental health UX and therapeutic interactions
 */

// Core session types
export interface SessionUser {
  id: string
  name: string
  role: 'listener' | 'seeker'
  avatar?: string
  isOnline: boolean
  joinedAt: Date
}

export interface SessionParticipant {
  user: SessionUser
  joinedAt: Date
  lastActivity: Date
  emotionalState?: EmotionalState
}

// Enhanced message types with therapeutic features
export interface TherapeuticMessage {
  id: string
  content: string
  sender: SessionUser
  timestamp: Date
  type: MessageType
  emotionalTone?: EmotionalTone
  reactions?: MessageReaction[]
  isEdited?: boolean
  editedAt?: Date
  // Therapeutic-specific fields
  isAffirmation?: boolean
  triggers?: string[] // Content warnings
  suggestedTopics?: string[]
}

export type MessageType =
  | 'text'
  | 'system'
  | 'affirmation'
  | 'emergency'
  | 'suggestion'
  | 'reflection'

export interface MessageReaction {
  emoji: string
  userId: string
  timestamp: Date
}

// Emotional state tracking
export type EmotionalState =
  | 'calm'
  | 'anxious'
  | 'overwhelmed'
  | 'hopeful'
  | 'sad'
  | 'angry'
  | 'confused'
  | 'excited'
  | 'neutral'

export type EmotionalTone =
  | 'supportive'
  | 'questioning'
  | 'reflective'
  | 'encouraging'
  | 'calming'
  | 'empathetic'
  | 'professional'
  | 'urgent'

// Session configuration and state
export interface SessionConfig {
  id: string
  mode: SessionMode
  duration: number // in minutes
  maxDuration: number
  allowVoice: boolean
  allowVideo: boolean
  anonymousMode: boolean
  crisisDetection: boolean
  contentWarnings: boolean
  sessionRecovery: boolean
}

export type SessionMode =
  | 'chat-only'
  | 'voice-chat'
  | 'video-chat'
  | 'guided-meditation'

export interface SessionState {
  id: string
  status: SessionStatus
  startTime: Date
  endTime?: Date
  duration: number
  messageCount: number
  participantCount: number
  currentEmotionalState?: EmotionalState
  lastActivity: Date
  isPaused: boolean
  pausedAt?: Date
  recoveryToken?: string
}

export type SessionStatus =
  | 'initializing'
  | 'active'
  | 'paused'
  | 'ending'
  | 'completed'
  | 'error'
  | 'emergency'

// Therapeutic features
export interface Affirmation {
  id: string
  text: string
  category: AffirmationCategory
  emotionalTarget: EmotionalState[]
  isActive: boolean
  displayCount: number
  lastDisplayed?: Date
}

export type AffirmationCategory =
  | 'general'
  | 'calming'
  | 'empowering'
  | 'mindful'
  | 'supportive'
  | 'recovery'

export interface TypingSuggestion {
  id: string
  text: string
  category: SuggestionCategory
  priority: number
  isUsed: boolean
  createdAt: Date
}

export type SuggestionCategory =
  | 'opening'
  | 'exploration'
  | 'reflection'
  | 'closing'
  | 'crisis'
  | 'transition'

// Session controls and actions
export interface SessionControl {
  id: string
  type: ControlType
  label: string
  icon: string
  action: SessionAction
  isEnabled: boolean
  requiresConfirmation?: boolean
  confirmationMessage?: string
}

export type ControlType =
  | 'primary'
  | 'secondary'
  | 'danger'
  | 'emergency'

export type SessionAction =
  | 'end-session'
  | 'pause-session'
  | 'resume-session'
  | 'request-break'
  | 'emergency-help'
  | 'save-session'
  | 'share-summary'
  | 'rate-session'

// Accessibility and preferences
export interface AccessibilityPreferences {
  reducedMotion: boolean
  highContrast: boolean
  largeText: boolean
  screenReader: boolean
  voiceInput: boolean
  voiceOutput: boolean
  fontSize: FontSize
  colorScheme: ColorScheme
}

export type FontSize =
  | 'small'
  | 'medium'
  | 'large'
  | 'extra-large'

export type ColorScheme =
  | 'default'
  | 'high-contrast'
  | 'calming'
  | 'warm'
  | 'cool'

// Safety and crisis management
export interface CrisisDetection {
  isActive: boolean
  triggers: CrisisTrigger[]
  severity: CrisisSeverity
  response: CrisisResponse
  timestamp: Date
}

export interface CrisisTrigger {
  keyword: string
  category: CrisisCategory
  severity: CrisisSeverity
  matchedAt: Date
}

export type CrisisCategory =
  | 'self-harm'
  | 'suicide'
  | 'abuse'
  | 'emergency'
  | 'severe-distress'

export type CrisisSeverity =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical'

export interface CrisisResponse {
  type: ResponseType
  message: string
  actions: CrisisAction[]
  resources: SupportResource[]
}

export type ResponseType =
  | 'redirect'
  | 'escalate'
  | 'support'
  | 'emergency'

export interface CrisisAction {
  type: ActionType
  label: string
  url?: string
  phone?: string
  priority: number
}

export type ActionType =
  | 'call'
  | 'chat'
  | 'website'
  | 'text'
  | 'local-emergency'

export interface SupportResource {
  id: string
  name: string
  type: ResourceType
  url: string
  phone?: string
  description: string
  available24_7: boolean
  crisisSpecific: boolean
}

export type ResourceType =
  | 'hotline'
  | 'chat'
  | 'website'
  | 'app'
  | 'local-service'

// Session feedback and analytics
export interface SessionFeedback {
  sessionId: string
  overallRating: number // 1-5
  helpfulnessRating: number // 1-5
  emotionalImpact: EmotionalImpact
  keyInsights: string[]
  suggestedImprovements: string[]
  wouldRecommend: boolean
  nextSteps: SessionAction[]
  submittedAt: Date
}

export type EmotionalImpact =
  | 'much-better'
  | 'somewhat-better'
  | 'no-change'
  | 'somewhat-worse'
  | 'much-worse'

// Performance and analytics
export interface SessionMetrics {
  sessionId: string
  technicalMetrics: TechnicalMetrics
  userMetrics: UserMetrics
  therapeuticMetrics: TherapeuticMetrics
  timestamp: Date
}

export interface TechnicalMetrics {
  loadTime: number
  messageLatency: number
  animationFrameRate: number
  memoryUsage: number
  networkRequests: number
  errors: number
}

export interface UserMetrics {
  messagesSent: number
  messagesReceived: number
  sessionDuration: number
  interactionCount: number
  featureUsage: FeatureUsage[]
}

export interface TherapeuticMetrics {
  emotionalStates: EmotionalState[]
  affirmationDisplays: number
  suggestionUsage: number
  crisisTriggers: number
  sessionCompletion: boolean
}

export interface FeatureUsage {
  feature: string
  usageCount: number
  lastUsed: Date
}

// Layout and UI state
export interface LayoutState {
  screenSize: ScreenSize
  orientation: Orientation
  sidebarCollapsed: boolean
  chatFullscreen: boolean
  presenceMinimized: boolean
}

export type ScreenSize =
  | 'mobile'
  | 'tablet'
  | 'desktop'
  | 'large-desktop'

export type Orientation =
  | 'portrait'
  | 'landscape'

// Error handling
export interface SessionError {
  id: string
  type: ErrorType
  message: string
  timestamp: Date
  context?: Record<string, any>
  userFacing: boolean
  recoverable: boolean
}

export type ErrorType =
  | 'network'
  | 'authentication'
  | 'session'
  | 'ai-service'
  | 'validation'
  | 'emergency'

// Component props interfaces
export interface SessionScreenProps {
  sessionId: string
  user: SessionUser
  matchedUser: SessionParticipant
  config: SessionConfig
  onSessionEnd: (feedback: SessionFeedback) => void
  onEmergency: (crisis: CrisisDetection) => void
}

export interface ChatInterfaceProps {
  messages: TherapeuticMessage[]
  onSendMessage: (content: string) => void
  onReact: (messageId: string, reaction: string) => void
  isTyping: boolean
  suggestions: TypingSuggestion[]
  layout: LayoutState
}

export interface ListenerPresenceProps {
  participant: SessionParticipant
  affirmations: Affirmation[]
  emotionalState: EmotionalState
  interactionCount: number
  layout: LayoutState
  preferences: AccessibilityPreferences
}

export interface SessionControlsProps {
  sessionState: SessionState
  controls: SessionControl[]
  onAction: (action: SessionAction) => void
  layout: LayoutState
}

// Hook return types
export interface UseSessionStateReturn {
  session: SessionState
  messages: TherapeuticMessage[]
  participants: SessionParticipant[]
  error: SessionError | null
  isLoading: boolean
  actions: {
    sendMessage: (content: string) => void
    endSession: () => void
    pauseSession: () => void
    resumeSession: () => void
    triggerEmergency: () => void
  }
}

export interface UseTherapeuticFeaturesReturn {
  affirmations: Affirmation[]
  suggestions: TypingSuggestion[]
  emotionalState: EmotionalState
  crisisDetection: CrisisDetection | null
  actions: {
    displayAffirmation: (category: AffirmationCategory) => void
    addSuggestion: (suggestion: Omit<TypingSuggestion, 'id' | 'createdAt'>) => void
    updateEmotionalState: (state: EmotionalState) => void
    triggerCrisis: (trigger: CrisisTrigger) => void
  }
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>

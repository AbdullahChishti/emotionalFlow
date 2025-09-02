/**
 * Psychological Assessments Data
 * Scientifically validated, public domain psychological tools
 */

export interface AssessmentQuestion {
  id: string
  text: string
  type: 'likert-5' | 'likert-7' | 'yes-no' | 'multiple-choice' | 'frequency'
  options?: string[]
  category?: string
}

export interface Assessment {
  id: string
  title: string
  shortTitle: string
  description: string
  instructions: string
  questions: AssessmentQuestion[]
  scoring: {
    interpretation: (score: number, responses: Record<string, number>) => AssessmentResult
    ranges: Array<{
      min: number
      max: number
      label: string
      description: string
      severity: 'normal' | 'mild' | 'moderate' | 'severe' | 'critical'
      recommendations: string[]
    }>
  }
  estimatedTime: number // in minutes
  category: 'trauma' | 'depression' | 'anxiety' | 'personality' | 'resilience' | 'wellbeing'
  isValid: boolean
  source: string
  citations: string[]
}

export interface AssessmentResult {
  score: number
  level: string
  description: string
  severity: 'normal' | 'mild' | 'moderate' | 'severe' | 'critical'
  recommendations: string[]
  insights: string[]
  nextSteps: string[]
}

// ACE Questionnaire (Childhood Trauma)
export const ACE_QUESTIONNAIRE: Assessment = {
  id: 'ace',
  title: 'Adverse Childhood Experiences (ACE) Questionnaire',
  shortTitle: 'ACE Questionnaire',
  description: 'Assesses childhood trauma and adverse experiences that can impact adult health and well-being.',
  instructions: 'Please indicate how often each event occurred during your childhood (0-17 years old).',
  category: 'trauma',
  estimatedTime: 3,
  isValid: true,
  source: 'CDC-Kaiser ACE Study',
  citations: ['Felitti et al., 1998'],

  questions: [
    {
      id: 'ace_1',
      text: 'Did a parent or other adult in the household often or very often swear at you, insult you, put you down, or humiliate you? Or act in a way that made you afraid that you might be physically hurt?',
      type: 'yes-no',
      category: 'emotional-abuse'
    },
    {
      id: 'ace_2',
      text: 'Did a parent or other adult in the household often or very often push, grab, slap, or throw something at you? Or ever hit you so hard that you had marks or were injured?',
      type: 'yes-no',
      category: 'physical-abuse'
    },
    {
      id: 'ace_3',
      text: 'Did an adult or person at least 5 years older than you ever touch or fondle you or have you touch their body in a sexual way? Or attempt or actually have oral, anal, or vaginal intercourse with you?',
      type: 'yes-no',
      category: 'sexual-abuse'
    },
    {
      id: 'ace_4',
      text: 'Did you often or very often feel that no one in your family loved you or thought you were important or special? Or your family didn\'t look out for each other, feel close to each other, or support each other?',
      type: 'yes-no',
      category: 'emotional-neglect'
    },
    {
      id: 'ace_5',
      text: 'Did you often or very often feel that you didn\'t have enough to eat, had to wear dirty clothes, and had no one to protect you? Or your parents were too drunk or high to take care of you or take you to the doctor if you needed it?',
      type: 'yes-no',
      category: 'physical-neglect'
    },
    {
      id: 'ace_6',
      text: 'Were your parents ever separated or divorced?',
      type: 'yes-no',
      category: 'household-dysfunction'
    },
    {
      id: 'ace_7',
      text: 'Was your mother or stepmother often or very often pushed, grabbed, slapped, or had something thrown at her? Or sometimes, often, or very often kicked, bitten, hit with a fist, or hit with something hard? Or ever repeatedly hit over at least a few minutes or threatened with a gun or knife?',
      type: 'yes-no',
      category: 'household-dysfunction'
    },
    {
      id: 'ace_8',
      text: 'Did you live with anyone who was a problem drinker or alcoholic, or who used street drugs?',
      type: 'yes-no',
      category: 'household-dysfunction'
    },
    {
      id: 'ace_9',
      text: 'Was a household member depressed or mentally ill, or did a household member attempt suicide?',
      type: 'yes-no',
      category: 'household-dysfunction'
    },
    {
      id: 'ace_10',
      text: 'Did a household member go to prison?',
      type: 'yes-no',
      category: 'household-dysfunction'
    }
  ],

  scoring: {
    interpretation: (score: number) => ({
      score,
      level: score === 0 ? 'No ACEs' :
             score <= 3 ? 'Low ACEs' :
             score <= 5 ? 'Moderate ACEs' : 'High ACEs',
      description: `You reported ${score} Adverse Childhood Experiences. Research shows that ACEs can impact physical and mental health throughout life.`,
      severity: score === 0 ? 'normal' :
                score <= 3 ? 'mild' :
                score <= 5 ? 'moderate' : 'severe',
      recommendations: score > 3 ? [
        'Consider speaking with a mental health professional about your experiences',
        'Practice self-care and stress management techniques',
        'Build a strong support network',
        'Consider trauma-informed therapy approaches'
      ] : [
        'Continue building resilience and healthy coping strategies',
        'Maintain supportive relationships',
        'Practice preventive mental health care'
      ],
      insights: score > 3 ? [
        'Higher ACE scores are associated with increased risk for various health conditions',
        'ACEs don\'t determine your future - resilience and support can make a difference',
        'Many people with high ACE scores go on to lead healthy, fulfilling lives'
      ] : [
        'Your low ACE score suggests a relatively stable childhood environment',
        'Continue nurturing positive relationships and healthy habits',
        'Consider how you can support others who may have experienced trauma'
      ],
      nextSteps: score > 3 ? [
        'Schedule a consultation with a mental health professional',
        'Explore trauma-informed therapy options',
        'Join support groups for ACE survivors',
        'Learn about trauma and resilience'
      ] : [
        'Continue personal growth and self-care practices',
        'Consider how to support trauma survivors in your community',
        'Share your positive experiences to help others'
      ]
    }),

    ranges: [
      { min: 0, max: 0, label: 'No ACEs', description: 'No adverse childhood experiences reported', severity: 'normal', recommendations: [] },
      { min: 1, max: 3, label: 'Low ACEs', description: '1-3 adverse experiences', severity: 'mild', recommendations: ['Consider professional support if needed'] },
      { min: 4, max: 5, label: 'Moderate ACEs', description: '4-5 adverse experiences', severity: 'moderate', recommendations: ['Professional consultation recommended'] },
      { min: 6, max: 10, label: 'High ACEs', description: '6+ adverse experiences', severity: 'severe', recommendations: ['Strongly recommend professional mental health support'] }
    ]
  }
}

// PHQ-9 (Depression Screening)
export const PHQ9_ASSESSMENT: Assessment = {
  id: 'phq9',
  title: 'Patient Health Questionnaire (PHQ-9)',
  shortTitle: 'PHQ-9',
  description: 'A 9-item questionnaire used to screen for depression severity and monitor treatment progress.',
  instructions: 'Over the last 2 weeks, how often have you been bothered by each of the following problems?',
  category: 'depression',
  estimatedTime: 2,
  isValid: true,
  source: 'Pfizer Inc',
  citations: ['Kroenke et al., 2001'],

  questions: [
    {
      id: 'phq9_1',
      text: 'Little interest or pleasure in doing things',
      type: 'frequency',
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
    {
      id: 'phq9_2',
      text: 'Feeling down, depressed, or hopeless',
      type: 'frequency',
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
    {
      id: 'phq9_3',
      text: 'Trouble falling or staying asleep, or sleeping too much',
      type: 'frequency',
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
    {
      id: 'phq9_4',
      text: 'Feeling tired or having little energy',
      type: 'frequency',
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
    {
      id: 'phq9_5',
      text: 'Poor appetite or overeating',
      type: 'frequency',
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
    {
      id: 'phq9_6',
      text: 'Feeling bad about yourself or that you are a failure or have let yourself or your family down',
      type: 'frequency',
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
    {
      id: 'phq9_7',
      text: 'Trouble concentrating on things, such as reading the newspaper or watching television',
      type: 'frequency',
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
    {
      id: 'phq9_8',
      text: 'Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual',
      type: 'frequency',
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
    {
      id: 'phq9_9',
      text: 'Thoughts that you would be better off dead, or of hurting yourself',
      type: 'frequency',
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    }
  ],

  scoring: {
    interpretation: (score: number) => ({
      score,
      level: score < 5 ? 'Minimal depression' :
             score < 10 ? 'Mild depression' :
             score < 15 ? 'Moderate depression' :
             score < 20 ? 'Moderately severe depression' : 'Severe depression',
      description: `Your PHQ-9 score is ${score}. This indicates ${score < 5 ? 'minimal' : score < 10 ? 'mild' : score < 15 ? 'moderate' : score < 20 ? 'moderately severe' : 'severe'} symptoms of depression.`,
      severity: score < 5 ? 'normal' :
                score < 10 ? 'mild' :
                score < 15 ? 'moderate' :
                score < 20 ? 'severe' : 'critical',
      recommendations: score >= 10 ? [
        'Consider speaking with a healthcare provider about your symptoms',
        'Practice daily self-care activities',
        'Consider therapy or counseling',
        'Build a support network'
      ] : score >= 5 ? [
        'Monitor your symptoms',
        'Practice stress management techniques',
        'Maintain healthy sleep and eating habits'
      ] : [
        'Continue healthy lifestyle habits',
        'Maintain social connections',
        'Practice preventive mental health care'
      ],
      insights: [
        'Depression is treatable and many people recover completely',
        'Early intervention can prevent symptoms from worsening',
        'Self-care and support are important components of mental health'
      ],
      nextSteps: score >= 10 ? [
        'Schedule an appointment with a mental health professional',
        'Consider cognitive behavioral therapy (CBT)',
        'Explore medication options if appropriate',
        'Join a support group'
      ] : score >= 5 ? [
        'Track your mood daily',
        'Practice mindfulness or meditation',
        'Exercise regularly and maintain healthy sleep'
      ] : [
        'Continue building resilience',
        'Help others in your community',
        'Stay informed about mental health'
      ]
    }),

    ranges: [
      { min: 0, max: 4, label: 'Minimal Depression', description: 'No significant depressive symptoms', severity: 'normal', recommendations: ['Continue healthy habits'] },
      { min: 5, max: 9, label: 'Mild Depression', description: 'Mild depressive symptoms', severity: 'mild', recommendations: ['Monitor symptoms', 'Practice self-care'] },
      { min: 10, max: 14, label: 'Moderate Depression', description: 'Moderate depressive symptoms', severity: 'moderate', recommendations: ['Consider professional consultation'] },
      { min: 15, max: 19, label: 'Moderately Severe Depression', description: 'Moderately severe symptoms', severity: 'severe', recommendations: ['Seek immediate professional help'] },
      { min: 20, max: 27, label: 'Severe Depression', description: 'Severe depressive symptoms', severity: 'critical', recommendations: ['Seek immediate professional help', 'Contact crisis services if needed'] }
    ]
  }
}

// GAD-7 (Anxiety Screening)
export const GAD7_ASSESSMENT: Assessment = {
  id: 'gad7',
  title: 'Generalized Anxiety Disorder (GAD-7)',
  shortTitle: 'GAD-7',
  description: 'A 7-item questionnaire used to screen for generalized anxiety disorder and assess anxiety severity.',
  instructions: 'Over the last 2 weeks, how often have you been bothered by the following problems?',
  category: 'anxiety',
  estimatedTime: 2,
  isValid: true,
  source: 'Pfizer Inc',
  citations: ['Spitzer et al., 2006'],

  questions: [
    {
      id: 'gad7_1',
      text: 'Feeling nervous, anxious, or on edge',
      type: 'frequency',
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
    {
      id: 'gad7_2',
      text: 'Not being able to stop or control worrying',
      type: 'frequency',
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
    {
      id: 'gad7_3',
      text: 'Worrying too much about different things',
      type: 'frequency',
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
    {
      id: 'gad7_4',
      text: 'Trouble relaxing',
      type: 'frequency',
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
    {
      id: 'gad7_5',
      text: 'Being so restless that it is hard to sit still',
      type: 'frequency',
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
    {
      id: 'gad7_6',
      text: 'Becoming easily annoyed or irritable',
      type: 'frequency',
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    },
    {
      id: 'gad7_7',
      text: 'Feeling afraid as if something awful might happen',
      type: 'frequency',
      options: ['Not at all', 'Several days', 'More than half the days', 'Nearly every day']
    }
  ],

  scoring: {
    interpretation: (score: number) => ({
      score,
      level: score < 5 ? 'Minimal anxiety' :
             score < 10 ? 'Mild anxiety' :
             score < 15 ? 'Moderate anxiety' : 'Severe anxiety',
      description: `Your GAD-7 score is ${score}. This indicates ${score < 5 ? 'minimal' : score < 10 ? 'mild' : score < 15 ? 'moderate' : 'severe'} symptoms of anxiety.`,
      severity: score < 5 ? 'normal' :
                score < 10 ? 'mild' :
                score < 15 ? 'moderate' : 'severe',
      recommendations: score >= 10 ? [
        'Consider speaking with a healthcare provider about your symptoms',
        'Practice relaxation techniques (deep breathing, meditation)',
        'Consider therapy approaches like CBT',
        'Build coping strategies for anxiety'
      ] : score >= 5 ? [
        'Practice daily relaxation exercises',
        'Maintain regular sleep and exercise routines',
        'Limit caffeine and stimulants'
      ] : [
        'Continue healthy lifestyle habits',
        'Practice preventive stress management',
        'Stay connected with supportive relationships'
      ],
      insights: [
        'Anxiety is common and highly treatable',
        'Many people experience anxiety at different times in life',
        'Early intervention can prevent anxiety from becoming overwhelming'
      ],
      nextSteps: score >= 10 ? [
        'Consult with a mental health professional',
        'Consider cognitive behavioral therapy',
        'Explore relaxation and mindfulness techniques',
        'Build a support network'
      ] : score >= 5 ? [
        'Track anxiety patterns and triggers',
        'Practice daily mindfulness exercises',
        'Establish healthy sleep and exercise routines'
      ] : [
        'Continue building resilience',
        'Help others who may be struggling with anxiety',
        'Stay informed about mental health resources'
      ]
    }),

    ranges: [
      { min: 0, max: 4, label: 'Minimal Anxiety', description: 'No significant anxiety symptoms', severity: 'normal', recommendations: ['Continue healthy habits'] },
      { min: 5, max: 9, label: 'Mild Anxiety', description: 'Mild anxiety symptoms', severity: 'mild', recommendations: ['Practice relaxation techniques'] },
      { min: 10, max: 14, label: 'Moderate Anxiety', description: 'Moderate anxiety symptoms', severity: 'moderate', recommendations: ['Consider professional consultation'] },
      { min: 15, max: 21, label: 'Severe Anxiety', description: 'Severe anxiety symptoms', severity: 'severe', recommendations: ['Seek immediate professional help'] }
    ]
  }
}

// CD-RISC (Connor-Davidson Resilience Scale - 10 item)
export const CDRISC_ASSESSMENT: Assessment = {
  id: 'cd-risc',
  title: 'Connor-Davidson Resilience Scale (CD-RISC-10)',
  shortTitle: 'CD-RISC',
  description: 'Measures resilience and the ability to cope with stress and adversity.',
  instructions: 'Please rate how much you agree with each statement over the past month.',
  category: 'resilience',
  estimatedTime: 3,
  isValid: true,
  source: 'Duke University',
  citations: ['Campbell-Sills & Stein, 2007'],

  questions: [
    {
      id: 'cdrisc_1',
      text: 'I am able to adapt when changes occur',
      type: 'likert-5',
      options: ['Not true at all', 'Rarely true', 'Sometimes true', 'Often true', 'True nearly all of the time']
    },
    {
      id: 'cdrisc_2',
      text: 'I can deal with whatever comes my way',
      type: 'likert-5',
      options: ['Not true at all', 'Rarely true', 'Sometimes true', 'Often true', 'True nearly all of the time']
    },
    {
      id: 'cdrisc_3',
      text: 'I try to see the humorous side of things when I am faced with problems',
      type: 'likert-5',
      options: ['Not true at all', 'Rarely true', 'Sometimes true', 'Often true', 'True nearly all of the time']
    },
    {
      id: 'cdrisc_4',
      text: 'I can usually find my way around difficulties',
      type: 'likert-5',
      options: ['Not true at all', 'Rarely true', 'Sometimes true', 'Often true', 'True nearly all of the time']
    },
    {
      id: 'cdrisc_5',
      text: 'I can achieve my goals despite obstacles',
      type: 'likert-5',
      options: ['Not true at all', 'Rarely true', 'Sometimes true', 'Often true', 'True nearly all of the time']
    },
    {
      id: 'cdrisc_6',
      text: 'I can remain calm and think clearly under pressure',
      type: 'likert-5',
      options: ['Not true at all', 'Rarely true', 'Sometimes true', 'Often true', 'True nearly all of the time']
    },
    {
      id: 'cdrisc_7',
      text: 'I can handle unpleasant feelings',
      type: 'likert-5',
      options: ['Not true at all', 'Rarely true', 'Sometimes true', 'Often true', 'True nearly all of the time']
    },
    {
      id: 'cdrisc_8',
      text: 'I am able to focus and think clearly when stressed',
      type: 'likert-5',
      options: ['Not true at all', 'Rarely true', 'Sometimes true', 'Often true', 'True nearly all of the time']
    },
    {
      id: 'cdrisc_9',
      text: 'I can get through difficult times because I have experienced difficulties before',
      type: 'likert-5',
      options: ['Not true at all', 'Rarely true', 'Sometimes true', 'Often true', 'True nearly all of the time']
    },
    {
      id: 'cdrisc_10',
      text: 'I can bounce back after hardship or illness',
      type: 'likert-5',
      options: ['Not true at all', 'Rarely true', 'Sometimes true', 'Often true', 'True nearly all of the time']
    }
  ],

  scoring: {
    interpretation: (score: number) => ({
      score,
      level: score < 20 ? 'Low resilience' :
             score < 30 ? 'Moderate resilience' :
             score < 35 ? 'High resilience' : 'Very high resilience',
      description: `Your resilience score is ${score} out of 40. ${score < 20 ? 'Low resilience may make it harder to cope with stress.' : score < 30 ? 'Moderate resilience suggests room for growth in coping skills.' : score < 35 ? 'High resilience indicates strong coping abilities.' : 'Very high resilience suggests excellent ability to handle adversity.'}`,
      severity: score < 20 ? 'severe' :
                score < 30 ? 'moderate' :
                score < 35 ? 'mild' : 'normal',
      recommendations: score < 30 ? [
        'Practice stress management techniques',
        'Build social support networks',
        'Learn new coping strategies',
        'Consider professional support for building resilience'
      ] : [
        'Continue practicing resilience-building activities',
        'Share coping strategies with others',
        'Maintain healthy lifestyle habits',
        'Consider mentoring others facing challenges'
      ],
      insights: [
        'Resilience can be developed and strengthened over time',
        'Multiple factors contribute to resilience including social support, coping skills, and life experience',
        'Resilience is not about avoiding stress but learning to bounce back from it'
      ],
      nextSteps: score < 30 ? [
        'Practice daily mindfulness or meditation',
        'Build stronger social connections',
        'Learn specific coping techniques',
        'Consider working with a therapist on resilience building'
      ] : [
        'Continue nurturing your resilience',
        'Help others develop their coping skills',
        'Stay engaged with challenging activities',
        'Share your experiences to inspire others'
      ]
    }),

    ranges: [
      { min: 0, max: 19, label: 'Low Resilience', description: 'May struggle with stress and adversity', severity: 'severe', recommendations: ['Build coping skills', 'Seek support'] },
      { min: 20, max: 29, label: 'Moderate Resilience', description: 'Has some coping skills but could benefit from more', severity: 'moderate', recommendations: ['Practice stress management', 'Build support network'] },
      { min: 30, max: 34, label: 'High Resilience', description: 'Strong coping abilities', severity: 'mild', recommendations: ['Maintain healthy habits', 'Continue skill development'] },
      { min: 35, max: 40, label: 'Very High Resilience', description: 'Excellent ability to handle adversity', severity: 'normal', recommendations: ['Share coping strategies', 'Help others'] }
    ]
  }
}

// Export all assessments
export const ASSESSMENTS: Record<string, Assessment> = {
  ace: ACE_QUESTIONNAIRE,
  phq9: PHQ9_ASSESSMENT,
  gad7: GAD7_ASSESSMENT,
  'cd-risc': CDRISC_ASSESSMENT
}

// Assessment flow configuration
export const ASSESSMENT_FLOW = {
  onboarding: ['ace'],
  screening: ['phq9', 'gad7'],
  personality: [], // Add personality assessments later
  resilience: ['cd-risc'],
  comprehensive: ['ace', 'phq9', 'gad7', 'cd-risc']
}

// Category information
export const ASSESSMENT_CATEGORIES = {
  trauma: {
    title: 'Trauma & Stress',
    description: 'Assess experiences of trauma and current stress levels',
    color: 'from-red-500/20 to-pink-500/20',
    icon: '🩹'
  },
  depression: {
    title: 'Depression',
    description: 'Screen for depressive symptoms and severity',
    color: 'from-blue-500/20 to-indigo-500/20',
    icon: '😢'
  },
  anxiety: {
    title: 'Anxiety',
    description: 'Evaluate anxiety symptoms and worry patterns',
    color: 'from-yellow-500/20 to-orange-500/20',
    icon: '😰'
  },
  personality: {
    title: 'Personality',
    description: 'Understand personality traits and coping styles',
    color: 'from-purple-500/20 to-violet-500/20',
    icon: '🧠'
  },
  resilience: {
    title: 'Resilience',
    description: 'Measure ability to cope with stress and adversity',
    color: 'from-emerald-500/20 to-teal-500/20',
    icon: '💪'
  },
  wellbeing: {
    title: 'Well-being',
    description: 'Assess overall mental health and life satisfaction',
    color: 'from-cyan-500/20 to-blue-500/20',
    icon: '✨'
  }
}

export default ASSESSMENTS

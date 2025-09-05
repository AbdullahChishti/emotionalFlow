/**
 * Psychological Assessments Data
 * Scientifically validated, public domain psychological tools
 */

export interface AssessmentQuestion {
  id: string
  text: string
  type: 'likert-5' | 'likert-7' | 'yes-no' | 'multiple-choice' | 'frequency' | 'scale'
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
  manifestations: string[]
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
             score <= 3 ? 'Low ACEs' : 'High ACEs',
      description: `You reported ${score} Adverse Childhood Experiences. Research shows that ACEs can impact physical and mental health throughout life.`,
      severity: score === 0 ? 'normal' :
                score <= 3 ? 'moderate' : 'severe',
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
      ],
      manifestations: score > 3 ? [
        'Increased risk for mental health conditions like depression and anxiety',
        'Higher likelihood of substance use disorders',
        'Potential for chronic health conditions',
        'Challenges in relationships and emotional regulation'
      ] : [
        'Generally lower risk for trauma-related health issues',
        'Stronger foundation for mental health resilience',
        'Better emotional regulation capabilities'
      ]
    }),

    ranges: [
      { min: 0, max: 0, label: 'No ACEs', description: 'No adverse childhood experiences reported', severity: 'normal', recommendations: [] },
      { min: 1, max: 3, label: 'Low ACEs', description: '1-3 adverse experiences', severity: 'moderate', recommendations: ['Consider professional support if needed'] },
      { min: 4, max: 10, label: 'High ACEs', description: '4+ adverse experiences', severity: 'severe', recommendations: ['Strongly recommend professional mental health support'] }
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
      ],
      manifestations: score >= 15 ? [
        'Difficulty getting out of bed or completing daily tasks',
        'Loss of interest in previously enjoyable activities',
        'Social withdrawal and isolation from friends and family',
        'Changes in appetite leading to weight loss or gain',
        'Sleep disturbances affecting daily functioning',
        'Difficulty concentrating at work or school',
        'Feelings of hopelessness about the future',
        'Physical symptoms like fatigue, headaches, or body aches'
      ] : score >= 10 ? [
        'Occasional difficulty with daily routines',
        'Reduced interest in some activities',
        'Tendency to avoid social situations',
        'Changes in sleep patterns',
        'Mild concentration difficulties',
        'Occasional feelings of sadness or emptiness',
        'Some physical symptoms like low energy'
      ] : score >= 5 ? [
        'Occasional low mood or sadness',
        'Mild changes in sleep or appetite',
        'Some difficulty with motivation',
        'Occasional social withdrawal',
        'Mild fatigue or low energy'
      ] : [
        'Normal mood fluctuations',
        'Healthy sleep and appetite patterns',
        'Good social engagement',
        'Normal energy levels',
        'Effective daily functioning'
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
      ],
      manifestations: score >= 15 ? [
        'Constant worry and fear that interferes with daily activities',
        'Panic attacks with physical symptoms like racing heart and sweating',
        'Avoidance of situations that trigger anxiety',
        'Difficulty sleeping due to racing thoughts',
        'Physical symptoms like muscle tension and headaches',
        'Social withdrawal and isolation',
        'Difficulty concentrating and making decisions',
        'Feeling constantly on edge or restless'
      ] : score >= 10 ? [
        'Frequent worry that is hard to control',
        'Feeling restless or on edge',
        'Difficulty concentrating due to anxiety',
        'Irritability and mood swings',
        'Muscle tension and physical discomfort',
        'Sleep disturbances',
        'Fatigue from constant worry'
      ] : score >= 5 ? [
        'Occasional worry about various aspects of life',
        'Feeling anxious in stressful situations',
        'Mild physical symptoms like butterflies in stomach',
        'Some difficulty concentrating when anxious',
        'Occasional sleep disturbances'
      ] : [
        'Normal levels of concern and worry',
        'Healthy response to stress',
        'Good ability to manage anxiety'
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
      ],
      manifestations: score < 20 ? [
        'Difficulty bouncing back from setbacks',
        'Overwhelm by relatively minor stressors',
        'Tendency to avoid challenges or new experiences',
        'Negative thinking patterns dominate',
        'Difficulty maintaining perspective during crises',
        'Social withdrawal when facing difficulties',
        'Physical symptoms from chronic stress',
        'Loss of confidence in handling adversity'
      ] : score < 30 ? [
        'Some difficulty with major life stressors',
        'Occasional overwhelm by challenging situations',
        'Mixed success with coping strategies',
        'Tendency to focus on problems rather than solutions',
        'Some social support but could be stronger',
        'Occasional difficulty maintaining optimism',
        'Some physical stress symptoms'
      ] : score < 35 ? [
        'Generally good ability to handle stress',
        'Effective coping strategies most of the time',
        'Positive outlook maintained during difficulties',
        'Strong social support network',
        'Good problem-solving abilities',
        'Ability to learn from challenges',
        'Maintained physical and mental health'
      ] : [
        'Excellent ability to handle major life challenges',
        'Strong coping skills and adaptive responses',
        'Maintained optimism and perspective in crises',
        'Extensive social support network',
        'Superior problem-solving and creative solutions',
        'Growth and learning from adversity',
        'Strong physical and mental resilience'
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

// PSS-10 (Perceived Stress Scale)
export const PSS10_ASSESSMENT: Assessment = {
  id: 'pss10',
  title: 'Perceived Stress Scale (PSS-10)',
  shortTitle: 'PSS-10',
  description: 'A 10-item questionnaire that measures the degree to which situations in life are appraised as stressful.',
  instructions: 'The questions in this scale ask you about your feelings and thoughts during the last month. In each case, please indicate how often you felt or thought a certain way.',
  category: 'wellbeing',
  estimatedTime: 3,
  isValid: true,
  source: 'Cohen et al., 1983',
  citations: ['Cohen et al., 1983'],

  questions: [
    {
      id: 'pss10_1',
      text: 'In the last month, how often have you been upset because of something that happened unexpectedly?',
      type: 'frequency',
      options: ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often']
    },
    {
      id: 'pss10_2',
      text: 'In the last month, how often have you felt that you were unable to control the important things in your life?',
      type: 'frequency',
      options: ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often']
    },
    {
      id: 'pss10_3',
      text: 'In the last month, how often have you felt nervous and "stressed"?',
      type: 'frequency',
      options: ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often']
    },
    {
      id: 'pss10_4',
      text: 'In the last month, how often have you felt confident about your ability to handle your personal problems?',
      type: 'frequency',
      options: ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often']
    },
    {
      id: 'pss10_5',
      text: 'In the last month, how often have you felt that things were going your way?',
      type: 'frequency',
      options: ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often']
    },
    {
      id: 'pss10_6',
      text: 'In the last month, how often have you found that you could not cope with all the things that you had to do?',
      type: 'frequency',
      options: ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often']
    },
    {
      id: 'pss10_7',
      text: 'In the last month, how often have you been able to control irritations in your life?',
      type: 'frequency',
      options: ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often']
    },
    {
      id: 'pss10_8',
      text: 'In the last month, how often have you felt that you were on top of things?',
      type: 'frequency',
      options: ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often']
    },
    {
      id: 'pss10_9',
      text: 'In the last month, how often have you been angered because of things that were outside of your control?',
      type: 'frequency',
      options: ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often']
    },
    {
      id: 'pss10_10',
      text: 'In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?',
      type: 'frequency',
      options: ['Never', 'Almost never', 'Sometimes', 'Fairly often', 'Very often']
    }
  ],

  scoring: {
    interpretation: (score: number) => ({
      score,
      level: score < 14 ? 'Low stress' :
             score < 27 ? 'Moderate stress' :
             score < 37 ? 'High stress' : 'Very high stress',
      description: `Your PSS-10 score is ${score} out of 40. This indicates ${score < 14 ? 'low perceived stress' : score < 27 ? 'moderate perceived stress' : score < 37 ? 'high perceived stress' : 'very high perceived stress'}.`,
      severity: score < 14 ? 'normal' :
                score < 27 ? 'mild' :
                score < 37 ? 'moderate' : 'severe',
      recommendations: score >= 27 ? [
        'Consider stress management techniques like mindfulness or meditation',
        'Practice regular exercise and maintain healthy sleep habits',
        'Consider speaking with a healthcare provider about stress management',
        'Build social support networks'
      ] : score >= 14 ? [
        'Practice daily relaxation techniques',
        'Maintain work-life balance',
        'Engage in regular physical activity'
      ] : [
        'Continue healthy stress management habits',
        'Share effective coping strategies with others',
        'Consider volunteering or helping others manage stress'
      ],
      insights: [
        'Perceived stress is subjective and can be managed through coping strategies',
        'Chronic high stress can impact physical and mental health',
        'Everyone experiences stress differently, and what feels stressful to one person may not to another'
      ],
      nextSteps: score >= 27 ? [
        'Schedule a consultation with a healthcare provider',
        'Learn specific stress management techniques',
        'Consider therapy approaches like CBT for stress management',
        'Build a daily relaxation routine'
      ] : score >= 14 ? [
        'Track your stress levels daily',
        'Practice mindfulness exercises',
        'Establish healthy boundaries'
      ] : [
        'Continue effective stress management practices',
        'Help others who may be experiencing high stress',
        'Share your coping strategies'
      ],
      manifestations: score >= 37 ? [
        'Constant feeling of being overwhelmed and unable to cope',
        'Chronic fatigue and exhaustion from persistent stress',
        'Severe sleep disturbances and insomnia',
        'Difficulty concentrating and making decisions',
        'Irritability and mood swings',
        'Physical symptoms like headaches, muscle tension, stomach issues',
        'Social withdrawal and relationship strain',
        'Loss of interest in previously enjoyable activities'
      ] : score >= 27 ? [
        'Frequent feelings of being overwhelmed',
        'Difficulty relaxing and unwinding',
        'Sleep problems and fatigue',
        'Irritability and short temper',
        'Physical symptoms like tension headaches or stomach discomfort',
        'Difficulty concentrating on tasks',
        'Some social withdrawal',
        'Reduced enjoyment of activities'
      ] : score >= 14 ? [
        'Occasional feelings of stress and pressure',
        'Some difficulty relaxing completely',
        'Mild sleep disturbances',
        'Occasional irritability',
        'Mild physical symptoms like tension',
        'Some concentration difficulties',
        'Occasional social withdrawal'
      ] : [
        'Generally good stress management',
        'Ability to handle daily challenges effectively',
        'Good relaxation and recovery capabilities',
        'Healthy work-life balance',
        'Strong social support systems'
      ]
    }),

    ranges: [
      { min: 0, max: 13, label: 'Low Perceived Stress', description: 'Minimal perceived stress', severity: 'normal', recommendations: ['Maintain healthy habits'] },
      { min: 14, max: 26, label: 'Moderate Perceived Stress', description: 'Moderate levels of perceived stress', severity: 'mild', recommendations: ['Practice relaxation techniques', 'Maintain balance'] },
      { min: 27, max: 36, label: 'High Perceived Stress', description: 'High levels of perceived stress', severity: 'moderate', recommendations: ['Consider professional consultation', 'Learn stress management'] },
      { min: 37, max: 40, label: 'Very High Perceived Stress', description: 'Very high levels of perceived stress', severity: 'severe', recommendations: ['Seek immediate professional help'] }
    ]
  }
}

// WHO-5 (World Health Organization Well-Being Index)
export const WHO5_ASSESSMENT: Assessment = {
  id: 'who5',
  title: 'WHO-5 Well-Being Index',
  shortTitle: 'WHO-5',
  description: 'A 5-item questionnaire that measures current mental wellbeing and positive psychological functioning.',
  instructions: 'Please indicate for each of the five statements which is closest to how you have been feeling over the last two weeks. Notice that higher numbers mean better wellbeing.',
  category: 'wellbeing',
  estimatedTime: 2,
  isValid: true,
  source: 'World Health Organization',
  citations: ['Bech, 2004'],

  questions: [
    {
      id: 'who5_1',
      text: 'I have felt cheerful and in good spirits',
      type: 'likert-6',
      options: ['At no time', 'Some of the time', 'Less than half of the time', 'More than half of the time', 'Most of the time', 'All of the time']
    },
    {
      id: 'who5_2',
      text: 'I have felt calm and relaxed',
      type: 'likert-6',
      options: ['At no time', 'Some of the time', 'Less than half of the time', 'More than half of the time', 'Most of the time', 'All of the time']
    },
    {
      id: 'who5_3',
      text: 'I have felt active and vigorous',
      type: 'likert-6',
      options: ['At no time', 'Some of the time', 'Less than half of the time', 'More than half of the time', 'Most of the time', 'All of the time']
    },
    {
      id: 'who5_4',
      text: 'I woke up feeling fresh and rested',
      type: 'likert-6',
      options: ['At no time', 'Some of the time', 'Less than half of the time', 'More than half of the time', 'Most of the time', 'All of the time']
    },
    {
      id: 'who5_5',
      text: 'My daily life has been filled with things that interest me',
      type: 'likert-6',
      options: ['At no time', 'Some of the time', 'Less than half of the time', 'More than half of the time', 'Most of the time', 'All of the time']
    }
  ],

  scoring: {
    interpretation: (score: number) => ({
      score,
      level: score < 8 ? 'Poor wellbeing' :
             score < 13 ? 'Moderate wellbeing' :
             score < 18 ? 'Good wellbeing' : 'Excellent wellbeing',
      description: `Your WHO-5 score is ${score} out of 25. This indicates ${score < 8 ? 'poor subjective wellbeing' : score < 13 ? 'moderate subjective wellbeing' : score < 18 ? 'good subjective wellbeing' : 'excellent subjective wellbeing'}.`,
      severity: score < 8 ? 'severe' :
                score < 13 ? 'moderate' :
                score < 18 ? 'mild' : 'normal',
      recommendations: score < 13 ? [
        'Consider activities that bring joy and meaning to your daily life',
        'Practice gratitude exercises and positive psychology techniques',
        'Consider speaking with a healthcare provider about wellbeing enhancement',
        'Build social connections and engage in meaningful activities'
      ] : score < 18 ? [
        'Continue nurturing activities that bring you joy',
        'Practice mindfulness to enhance present-moment awareness',
        'Maintain healthy relationships and social engagement'
      ] : [
        'Continue the positive habits that support your wellbeing',
        'Consider how you can help others improve their wellbeing',
        'Share your strategies for maintaining good mental health'
      ],
      insights: [
        'Wellbeing encompasses positive emotions, engagement, relationships, meaning, and accomplishment',
        'The WHO-5 provides balance to symptom-focused assessments',
        'High wellbeing is associated with better physical health outcomes',
        'Wellbeing can be cultivated through intentional positive psychology practices'
      ],
      nextSteps: score < 13 ? [
        'Identify activities that bring you genuine joy and meaning',
        'Consider positive psychology interventions or coaching',
        'Build a daily routine that includes positive experiences',
        'Connect with supportive relationships'
      ] : score < 18 ? [
        'Track what activities most enhance your wellbeing',
        'Practice positive psychology exercises regularly',
        'Cultivate gratitude and positive thinking patterns'
      ] : [
        'Continue wellbeing-enhancing practices',
        'Mentor others in cultivating wellbeing',
        'Contribute to community wellbeing initiatives'
      ],
      manifestations: score < 8 ? [
        'Persistent feelings of sadness and hopelessness',
        'Loss of interest in activities once enjoyed',
        'Difficulty experiencing positive emotions',
        'Lack of energy and motivation',
        'Sleep disturbances affecting daily life',
        'Social withdrawal and isolation',
        'Difficulty finding meaning or purpose',
        'Physical symptoms like fatigue and body aches'
      ] : score < 13 ? [
        'Occasional feelings of sadness or low mood',
        'Reduced interest in some activities',
        'Some difficulty experiencing joy',
        'Occasional lack of energy',
        'Some sleep disturbances',
        'Social withdrawal in certain situations',
        'Questioning life meaning and purpose'
      ] : score < 18 ? [
        'Generally positive mood with occasional lows',
        'Good interest in activities and relationships',
        'Ability to experience joy and positive emotions',
        'Adequate energy levels most of the time',
        'Generally good sleep quality',
        'Active social life and relationships',
        'Sense of purpose and meaning'
      ] : [
        'Consistently positive mood and outlook',
        'High levels of interest and engagement in life',
        'Frequent experiences of joy and positive emotions',
        'High energy levels and vitality',
        'Excellent sleep quality and rest',
        'Strong social connections and support',
        'Clear sense of purpose and life satisfaction'
      ]
    }),

    ranges: [
      { min: 0, max: 7, label: 'Poor Wellbeing', description: 'Indicative of poor subjective wellbeing', severity: 'severe', recommendations: ['Seek professional support', 'Focus on wellbeing enhancement'] },
      { min: 8, max: 12, label: 'Moderate Wellbeing', description: 'Moderate levels of subjective wellbeing', severity: 'moderate', recommendations: ['Build positive routines', 'Consider wellbeing coaching'] },
      { min: 13, max: 17, label: 'Good Wellbeing', description: 'Good levels of subjective wellbeing', severity: 'mild', recommendations: ['Maintain positive habits', 'Enhance wellbeing practices'] },
      { min: 18, max: 25, label: 'Excellent Wellbeing', description: 'Excellent subjective wellbeing', severity: 'normal', recommendations: ['Continue healthy practices', 'Share wellbeing strategies'] }
    ]
  }
}

// PCL-5 (PTSD Checklist for DSM-5)
export const PCL5_ASSESSMENT: Assessment = {
  id: 'pcl5',
  title: 'PTSD Checklist for DSM-5 (PCL-5)',
  shortTitle: 'PCL-5',
  description: 'A 20-item self-report measure that assesses PTSD symptoms in accordance with DSM-5 criteria.',
  instructions: 'Below is a list of problems and complaints that people sometimes have in response to stressful life experiences. Please read each one carefully, and indicate how much you have been bothered by that problem in the past month.',
  category: 'trauma',
  estimatedTime: 5,
  isValid: true,
  source: 'National Center for PTSD',
  citations: ['Weathers et al., 2013'],

  questions: [
    {
      id: 'pcl5_1',
      text: 'Repeated, disturbing, and unwanted memories of the stressful experience?',
      type: 'frequency',
      options: ['Not at all', 'A little bit', 'Moderately', 'Quite a bit', 'Extremely']
    },
    {
      id: 'pcl5_2',
      text: 'Repeated, disturbing dreams of the stressful experience?',
      type: 'frequency',
      options: ['Not at all', 'A little bit', 'Moderately', 'Quite a bit', 'Extremely']
    },
    {
      id: 'pcl5_3',
      text: 'Suddenly feeling or acting as if the stressful experience were actually happening again (as if you were actually back there reliving it)?',
      type: 'frequency',
      options: ['Not at all', 'A little bit', 'Moderately', 'Quite a bit', 'Extremely']
    },
    {
      id: 'pcl5_4',
      text: 'Feeling very upset when something reminded you of the stressful experience?',
      type: 'frequency',
      options: ['Not at all', 'A little bit', 'Moderately', 'Quite a bit', 'Extremely']
    },
    {
      id: 'pcl5_5',
      text: 'Having strong physical reactions when something reminded you of the stressful experience (for example, heart pounding, trouble breathing, sweating)?',
      type: 'frequency',
      options: ['Not at all', 'A little bit', 'Moderately', 'Quite a bit', 'Extremely']
    },
    {
      id: 'pcl5_6',
      text: 'Avoiding memories, thoughts, or feelings related to the stressful experience?',
      type: 'frequency',
      options: ['Not at all', 'A little bit', 'Moderately', 'Quite a bit', 'Extremely']
    },
    {
      id: 'pcl5_7',
      text: 'Avoiding external reminders of the stressful experience (for example, people, places, conversations, activities, objects, or situations)?',
      type: 'frequency',
      options: ['Not at all', 'A little bit', 'Moderately', 'Quite a bit', 'Extremely']
    },
    {
      id: 'pcl5_8',
      text: 'Trouble remembering important parts of the stressful experience?',
      type: 'frequency',
      options: ['Not at all', 'A little bit', 'Moderately', 'Quite a bit', 'Extremely']
    },
    {
      id: 'pcl5_9',
      text: 'Having strong negative beliefs about yourself, other people, or the world (for example, having thoughts such as: I am bad, there is something seriously wrong with me, no one can be trusted, the world is completely dangerous)?',
      type: 'frequency',
      options: ['Not at all', 'A little bit', 'Moderately', 'Quite a bit', 'Extremely']
    },
    {
      id: 'pcl5_10',
      text: 'Blaming yourself or someone else for the stressful experience or what happened after it?',
      type: 'frequency',
      options: ['Not at all', 'A little bit', 'Moderately', 'Quite a bit', 'Extremely']
    },
    {
      id: 'pcl5_11',
      text: 'Having strong negative feelings such as fear, horror, anger, guilt, or shame?',
      type: 'frequency',
      options: ['Not at all', 'A little bit', 'Moderately', 'Quite a bit', 'Extremely']
    },
    {
      id: 'pcl5_12',
      text: 'Loss of interest in activities that you used to enjoy?',
      type: 'frequency',
      options: ['Not at all', 'A little bit', 'Moderately', 'Quite a bit', 'Extremely']
    },
    {
      id: 'pcl5_13',
      text: 'Feeling distant or cut off from other people?',
      type: 'frequency',
      options: ['Not at all', 'A little bit', 'Moderately', 'Quite a bit', 'Extremely']
    },
    {
      id: 'pcl5_14',
      text: 'Trouble experiencing positive feelings (for example, being unable to feel happiness, satisfaction, or loving feelings)?',
      type: 'frequency',
      options: ['Not at all', 'A little bit', 'Moderately', 'Quite a bit', 'Extremely']
    },
    {
      id: 'pcl5_15',
      text: 'Irritable behavior, angry outbursts, or acting aggressively?',
      type: 'frequency',
      options: ['Not at all', 'A little bit', 'Moderately', 'Quite a bit', 'Extremely']
    },
    {
      id: 'pcl5_16',
      text: 'Taking too many risks or doing things that could cause you harm?',
      type: 'frequency',
      options: ['Not at all', 'A little bit', 'Moderately', 'Quite a bit', 'Extremely']
    },
    {
      id: 'pcl5_17',
      text: 'Being "superalert" or watchful or on guard?',
      type: 'frequency',
      options: ['Not at all', 'A little bit', 'Moderately', 'Quite a bit', 'Extremely']
    },
    {
      id: 'pcl5_18',
      text: 'Feeling jumpy or easily startled?',
      type: 'frequency',
      options: ['Not at all', 'A little bit', 'Moderately', 'Quite a bit', 'Extremely']
    },
    {
      id: 'pcl5_19',
      text: 'Having difficulty concentrating?',
      type: 'frequency',
      options: ['Not at all', 'A little bit', 'Moderately', 'Quite a bit', 'Extremely']
    },
    {
      id: 'pcl5_20',
      text: 'Trouble falling or staying asleep?',
      type: 'frequency',
      options: ['Not at all', 'A little bit', 'Moderately', 'Quite a bit', 'Extremely']
    }
  ],

  scoring: {
    interpretation: (score: number) => ({
      score,
      level: score < 19 ? 'Minimal PTSD symptoms' :
             score < 34 ? 'Mild PTSD symptoms' :
             score < 49 ? 'Moderate PTSD symptoms' :
             score < 65 ? 'Severe PTSD symptoms' : 'Extreme PTSD symptoms',
      description: `Your PCL-5 score is ${score} out of 80. This indicates ${score < 19 ? 'minimal PTSD symptoms' : score < 34 ? 'mild PTSD symptoms' : score < 49 ? 'moderate PTSD symptoms' : score < 65 ? 'severe PTSD symptoms' : 'extreme PTSD symptoms'}.`,
      severity: score < 19 ? 'normal' :
                score < 34 ? 'mild' :
                score < 49 ? 'moderate' :
                score < 65 ? 'severe' : 'critical',
      recommendations: score >= 34 ? [
        'Consider speaking with a mental health professional experienced in trauma',
        'Consider trauma-focused therapy approaches like EMDR or TF-CBT',
        'Practice grounding techniques and self-care',
        'Consider joining trauma support groups'
      ] : score >= 19 ? [
        'Monitor your symptoms and consider professional consultation if they persist',
        'Practice stress management and relaxation techniques',
        'Consider talking with trusted friends or family about your experiences'
      ] : [
        'Continue healthy coping strategies',
        'If trauma experiences emerge, seek appropriate support',
        'Consider preventive mental health care'
      ],
      insights: [
        'PTSD symptoms can improve with appropriate treatment and support',
        'Many people experience trauma symptoms that resolve over time',
        'Professional help can significantly reduce PTSD symptoms',
        'Early intervention is often most effective'
      ],
      nextSteps: score >= 34 ? [
        'Schedule an appointment with a trauma-informed therapist',
        'Consider evidence-based treatments for PTSD',
        'Build a strong support network',
        'Learn about trauma and recovery'
      ] : score >= 19 ? [
        'Track your symptoms over time',
        'Consider professional consultation',
        'Practice self-care and stress management'
      ] : [
        'Continue building resilience',
        'Learn about trauma-informed care',
        'Support others who may be experiencing trauma'
      ],
      manifestations: score >= 65 ? [
        'Severe flashbacks and nightmares that disrupt daily life',
        'Complete avoidance of trauma reminders and social situations',
        'Extreme emotional numbness and detachment',
        'Severe hypervigilance affecting all activities',
        'Intense anger outbursts and irritability',
        'Self-destructive behaviors and risk-taking',
        'Severe concentration and memory problems',
        'Chronic sleep disturbances and exhaustion'
      ] : score >= 49 ? [
        'Frequent nightmares and intrusive memories',
        'Significant avoidance of trauma-related situations',
        'Emotional numbness affecting relationships',
        'High levels of anxiety and hypervigilance',
        'Irritability and anger issues',
        'Difficulty concentrating and remembering',
        'Sleep problems and fatigue',
        'Social withdrawal and isolation'
      ] : score >= 34 ? [
        'Occasional nightmares or intrusive thoughts',
        'Some avoidance of trauma reminders',
        'Mild emotional numbness',
        'Moderate anxiety and jumpiness',
        'Irritability in certain situations',
        'Some concentration difficulties',
        'Sleep disturbances',
        'Social difficulties'
      ] : score >= 19 ? [
        'Mild nightmares or unwanted memories',
        'Occasional avoidance of reminders',
        'Some emotional detachment',
        'Mild anxiety symptoms',
        'Occasional irritability',
        'Minor concentration issues',
        'Some sleep problems'
      ] : [
        'Minimal trauma-related symptoms',
        'Good emotional regulation',
        'Normal anxiety levels',
        'Healthy social functioning',
        'Good concentration and memory',
        'Normal sleep patterns'
      ]
    }),

    ranges: [
      { min: 0, max: 18, label: 'Minimal Symptoms', description: 'Minimal or no PTSD symptoms', severity: 'normal', recommendations: ['Continue healthy habits'] },
      { min: 19, max: 33, label: 'Mild Symptoms', description: 'Some PTSD symptoms present', severity: 'mild', recommendations: ['Monitor symptoms', 'Consider professional consultation'] },
      { min: 34, max: 48, label: 'Moderate Symptoms', description: 'Moderate PTSD symptoms', severity: 'moderate', recommendations: ['Seek professional help', 'Consider trauma therapy'] },
      { min: 49, max: 64, label: 'Severe Symptoms', description: 'Severe PTSD symptoms', severity: 'severe', recommendations: ['Immediate professional intervention needed'] },
      { min: 65, max: 80, label: 'Extreme Symptoms', description: 'Extreme PTSD symptoms', severity: 'critical', recommendations: ['Urgent professional intervention required'] }
    ]
  }
}

// Export all assessments
export const ASSESSMENTS: Record<string, Assessment> = {
  ace: ACE_QUESTIONNAIRE,
  phq9: PHQ9_ASSESSMENT,
  gad7: GAD7_ASSESSMENT,
  'cd-risc': CDRISC_ASSESSMENT,
  pss10: PSS10_ASSESSMENT,
  who5: WHO5_ASSESSMENT,
  pcl5: PCL5_ASSESSMENT
}

// Assessment flow configuration
export const ASSESSMENT_FLOW = {
  // Initial trauma history assessment
  onboarding: ['ace'],
  // Core screening battery (recommended for all users)
  screening: ['phq9', 'gad7', 'pss10', 'who5'],
  // Add-on assessments for specific conditions
  trauma_followup: ['pcl5'], // Triggered if ACE score >= 4 or PCL-5 if trauma indicated
  resilience: ['cd-risc'], // Optional resilience assessment
  // Comprehensive assessment (all assessments)
  comprehensive: ['ace', 'phq9', 'gad7', 'pss10', 'who5', 'pcl5', 'cd-risc']
}

// Category information
export const ASSESSMENT_CATEGORIES = {
  trauma: {
    title: 'Trauma & Stress',
    description: 'Assess experiences of trauma and current stress levels',
    color: 'red',
    severity: 'high',
    clinical: true
  },
  depression: {
    title: 'Depression',
    description: 'Screen for depressive symptoms and severity',
    color: 'blue',
    severity: 'high',
    clinical: true
  },
  anxiety: {
    title: 'Anxiety',
    description: 'Evaluate anxiety symptoms and worry patterns',
    color: 'amber',
    severity: 'medium',
    clinical: true
  },
  personality: {
    title: 'Personality',
    description: 'Understand personality traits and coping styles',
    color: 'purple',
    severity: 'low',
    clinical: false
  },
  resilience: {
    title: 'Resilience',
    description: 'Measure ability to cope with stress and adversity',
    color: 'emerald',
    severity: 'low',
    clinical: false
  },
  wellbeing: {
    title: 'Well-being',
    description: 'Assess overall mental health and life satisfaction',
    color: 'violet',
    severity: 'low',
    clinical: false
  }
}

export default ASSESSMENTS

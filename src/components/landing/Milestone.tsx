'use client'

import { motion, useTransform, MotionValue } from 'framer-motion'

interface MilestoneProps {
  prop: {
    title: string;
    description: string;
    color: string;
  };
  index: number;
  scrollYProgress: MotionValue<number>;
}

const valueProps = [
  { title: 'Mutual Support', description: 'Give when you can, receive when you need. A balance that honors both sides of connection.', color: '#9333ea' },
  { title: 'Structured Roles', description: 'Hold space, or be held. You\'re never expected to do both at once.', color: '#3b82f6' },
  { title: 'MindWell Network', description: 'Your emotional labor is seen, tracked, and honored. Care becomes a currency that flows both ways.', color: '#10b981' },
  { title: 'Authentically You', description: 'No profiles to curate. No personas to maintain. Just your real feelings in a real moment.', color: '#f59e0b' },
  { title: 'Always Held', description: 'Even when the world is asleep, our presence is awake. You\'re never truly alone here.', color: '#f472b6' },
];

export const Milestone = ({ prop, index, scrollYProgress }: MilestoneProps) => {
  const totalMilestones = valueProps.length;
  const step = 1 / totalMilestones;
  const start = index * step;
  const end = start + step;

  // Make the card highlight much earlier in the scroll sequence
  const scale = useTransform(scrollYProgress, 
    [Math.max(0, start - 0.05), start, end - step * 0.3], 
    [1, 1.5, 1]
  );
  
  // Increase the visibility window so cards appear sooner and stay visible longer
  const opacity = useTransform(scrollYProgress, 
    [Math.max(0, start - 0.1), start, end - step * 0.2, end], 
    [0.1, 1, 1, 0.1]
  );

  const isEven = index % 2 === 0;
  const yPercent = (index / (totalMilestones - 1)) * 80 + 10; // Position nodes between 10% and 90% vertically

  return (
    <div>
      {/* Milestone Node on the Path */}
      <motion.div 
        className="absolute w-8 h-8 rounded-full border-2 border-purple-300/50 bg-purple-950"
        style={{
          top: `${yPercent}%`,
          left: '50%',
          translateX: '-50%',
          scale,
          backgroundColor: prop.color
        }}
      />

      {/* Milestone Card */}
      <motion.div
        className={`absolute w-[250px] md:w-[300px] p-6 rounded-2xl shadow-2xl backdrop-blur-lg border border-white/10`}
        style={{
          opacity,
          top: `${yPercent}%`,
          left: isEven ? 'calc(50% + 80px)' : 'auto',
          right: isEven ? 'auto' : 'calc(50% + 80px)',
          y: '-50%',
          backgroundColor: `${prop.color}20` // semi-transparent background
        }}
      >
        <h3 className="text-xl font-bold mb-2" style={{ color: prop.color }}>{prop.title}</h3>
        <p className="text-md text-white leading-relaxed">{prop.description}</p>
      </motion.div>
    </div>
  );
};

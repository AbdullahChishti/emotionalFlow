import React from 'react';
import { cn } from '@/lib/utils';
import { colors, radius } from '@/design/tokens';

interface ChipProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string;
  severity?: 'low' | 'moderate' | 'high';
  icon?: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  severity = 'low',
  icon,
  className,
  ...props
}) => {
  const severityColors = {
    low: 'bg-green-100 text-green-800 border-green-200',
    moderate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    high: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium',
        'border rounded-lg',
        severityColors[severity],
        className
      )}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{label}</span>
    </div>
  );
};

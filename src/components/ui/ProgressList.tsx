import React from 'react';
import { cn } from '@/lib/utils';
import { colors } from '@/design/tokens';

interface ProgressListItem {
  id: string;
  label: string;
  state: 'done' | 'current' | 'pending';
}

interface ProgressListProps extends React.HTMLAttributes<HTMLDivElement> {
  items: ProgressListItem[];
}

export const ProgressList: React.FC<ProgressListProps> = ({
  items,
  className,
  ...props
}) => {
  return (
    <div className={cn('space-y-3', className)} {...props}>
      {items.map((item) => {
        const getIcon = () => {
          switch (item.state) {
            case 'done':
              return (
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-xs">check</span>
                </div>
              );
            case 'current':
              return (
                <div className="w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-white text-xs">radio_button_checked</span>
                </div>
              );
            case 'pending':
              return (
                <div className="w-5 h-5 border-2 border-slate-300 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-slate-400 text-xs">radio_button_unchecked</span>
                </div>
              );
          }
        };

        return (
          <div
            key={item.id}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200',
              item.state === 'done' && 'bg-green-50/50',
              item.state === 'current' && 'bg-accent/10',
              item.state === 'pending' && 'bg-slate-50/50'
            )}
          >
            {getIcon()}
            <span
              className={cn(
                'text-sm font-medium',
                item.state === 'done' && 'text-green-800',
                item.state === 'current' && 'text-accent',
                item.state === 'pending' && 'text-slate-600'
              )}
            >
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

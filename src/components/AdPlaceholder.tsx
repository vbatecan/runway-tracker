import { cn } from '@/lib/utils';

interface AdPlaceholderProps {
  size: 'leaderboard' | 'sidebar' | 'tall-sidebar';
  className?: string;
}

const SIZES = {
  leaderboard: { height: 90, label: '728 x 90' },
  sidebar: { height: 250, label: '300 x 250' },
  'tall-sidebar': { height: 600, label: '160 x 600' },
};

export function AdPlaceholder({ size, className }: AdPlaceholderProps) {
  const { height, label } = SIZES[size];

  return (
    <div
      className={cn(
        'ad-placeholder rounded-lg',
        className
      )}
      style={{ minHeight: height }}
    >
      <div className="text-center">
        <p className="text-xs uppercase tracking-wider">Advertisement</p>
        <p className="mt-1 text-[10px] text-muted-foreground/70">{label}</p>
      </div>
    </div>
  );
}
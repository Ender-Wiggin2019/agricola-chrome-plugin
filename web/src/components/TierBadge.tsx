import { Badge } from '@/components/ui/badge';
import { TTierType } from '@/types/card';
import { getTierColor } from '@/lib/cardUtils';
import { cn } from '@/lib/utils';

interface TierBadgeProps {
  tier: string;
  tierType: TTierType;
  hasDesc?: boolean;
}

// Get tier label for display
function getTierLabel(tierType: TTierType): string {
  switch (tierType) {
    case 'baitu':
      return '白兔';
    case 'en':
      return 'EN';
    case 'chen':
      return 'Chen';
    default:
      return tierType;
  }
}

export function TierBadge({ tier, tierType, hasDesc = false }: TierBadgeProps) {
  if (!tier || tier.trim() === '') return null;

  const color = getTierColor(tier, tierType);
  const label = getTierLabel(tierType);

  return (
    <Badge
      className={cn(
        'text-white font-bold text-xs px-2.5 py-1',
        hasDesc && 'cursor-help'
      )}
      style={{ 
        backgroundColor: color, 
        borderColor: color,
        boxShadow: `0 2px 4px ${color}40`
      }}
    >
      <span className="opacity-70 mr-1 text-[10px] uppercase tracking-wide">{label}</span>
      {tier}
      {hasDesc && <span className="ml-1 text-[10px] opacity-80">+</span>}
    </Badge>
  );
}

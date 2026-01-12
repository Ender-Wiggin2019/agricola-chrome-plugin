import { Badge } from '@/components/ui/badge';
import { TTierType } from '@/types/card';
import { getTierColor } from '@/lib/cardUtils';
import { cn } from '@/lib/utils';
import { useI18n } from '@/lib/i18n';

interface TierBadgeProps {
  tier: string;
  tierType: TTierType;
  hasDesc?: boolean;
}

export function TierBadge({ tier, tierType, hasDesc = false }: TierBadgeProps) {
  const { t } = useI18n();

  if (!tier || tier.trim() === '') return null;

  const color = getTierColor(tier, tierType);

  // Get tier label based on type
  const getLabel = () => {
    switch (tierType) {
      case 'baitu':
        return t.baituLabel;
      case 'en':
        return t.enLabel;
      case 'chen':
        return t.chenLabel;
      default:
        return tierType;
    }
  };

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
      <span className="opacity-70 mr-1 text-[10px] uppercase tracking-wide">{getLabel()}</span>
      {tier}
      {hasDesc && <span className="ml-1 text-[10px] opacity-80">+</span>}
    </Badge>
  );
}

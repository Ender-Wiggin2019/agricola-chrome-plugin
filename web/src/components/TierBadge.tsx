/*
 * @Author: Ender Wiggin
 * @Date: 2026-01-12 22:33:45
 * @LastEditors: Ender Wiggin
 * @LastEditTime: 2026-01-13 00:17:00
 * @Description:
 */
import { Badge } from '@/components/ui/badge';
import { TTierType } from '@/types/card';
import { getTierColor } from '@/lib/cardUtils';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface TierBadgeProps {
  tier: string;
  tierType: TTierType;
  hasDesc?: boolean;
}

export function TierBadge({ tier, tierType, hasDesc = false }: TierBadgeProps) {
  const { t } = useTranslation();

  if (!tier || tier.trim() === '') return null;

  const color = getTierColor(tier, tierType);
  const label = t(`tier.${tierType}`);

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
      {/* {hasDesc && <span className="ml-1 text-[10px] opacity-80">+</span>} */}
    </Badge>
  );
}

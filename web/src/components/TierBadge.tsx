/*
 * @Author: Ender-Wiggin
 * @Date: 2026-01-13 14:16:38
 * @LastEditors: Ender-Wiggin
 * @LastEditTime: 2026-01-27 17:44:07
 * @Description:
 */
import { Badge } from '@/components/ui/badge';
import { getAuthorDisplayName, getAuthorI18nKey, TAuthorId } from '@/lib/config';
import { getTierColor } from '@/lib/cardUtils';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface TierBadgeProps {
  tier: string;
  score?: number;
  authorId: TAuthorId;
  hasDesc?: boolean;
}

export function TierBadge({ tier, score, authorId, hasDesc = false }: TierBadgeProps) {
  const { t } = useTranslation();

  if (!tier || tier.trim() === '') {
    if (score !== undefined && score !== null) {
      return <ScoreBadge score={score} authorId={authorId} hasDesc={hasDesc} />;
    }
    return null;
  }

  const color = getTierColor(tier, authorId);
  const label = t(getAuthorI18nKey(authorId), getAuthorDisplayName(authorId));

  return (
    <Badge
      className={cn('text-white font-bold text-xs px-2.5 py-1', hasDesc && 'cursor-help')}
      style={{
        backgroundColor: color,
        borderColor: color,
        boxShadow: `0 2px 4px ${color}40`,
      }}
    >
      <span className="opacity-70 mr-1 text-[10px] uppercase tracking-wide">{label}</span>
      {tier}
    </Badge>
  );
}

function ScoreBadge({ score, authorId, hasDesc = false }: { score: number; authorId: TAuthorId; hasDesc?: boolean }) {
  const { t } = useTranslation();
  const color = getJpWikiScoreColor(score);
  const label = t(getAuthorI18nKey(authorId), getAuthorDisplayName(authorId));

  return (
    <Badge
      className={cn('text-white font-bold text-xs px-2.5 py-1', hasDesc && 'cursor-help')}
      style={{
        backgroundColor: color,
        borderColor: color,
        boxShadow: `0 2px 4px ${color}40`,
      }}
      title={`JP Wiki Score: ${score}`}
    >
      <span className="opacity-70 mr-1 text-[10px] uppercase tracking-wide">{label}</span>
      JP
    </Badge>
  );
}

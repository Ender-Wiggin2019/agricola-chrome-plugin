import { Badge } from '@/components/ui/badge';
import { getJpWikiScoreColor } from '@/lib/cardUtils';
import { getAuthorDisplayName, type TAuthorId } from '@/lib/config';
import { cn } from '@/lib/utils';

interface ScoreBadgeProps {
  score: number;
  authorId: TAuthorId;
  hasDesc?: boolean;
}

export function ScoreBadge({ score, authorId, hasDesc = false }: ScoreBadgeProps) {
  const color = getJpWikiScoreColor(score);
  const label = getAuthorDisplayName(authorId);

  return (
    <Badge
      className={cn('text-white font-bold text-xs px-2.5 py-1', hasDesc && 'cursor-help')}
      style={{
        backgroundColor: color,
        borderColor: color,
        boxShadow: `0 2px 4px ${color}40`,
      }}
      title={`Score: ${score}`}
    >
      <span className="opacity-70 mr-1 text-[10px] uppercase tracking-wide">{label}</span>
      {score.toFixed(1)}
    </Badge>
  );
}

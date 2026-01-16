import { Badge } from '@/components/ui/badge';
import { getJpWikiScoreColor } from '@/lib/cardUtils';

interface JpWikiScoreBadgeProps {
  score: string;
}

export function JpWikiScoreBadge({ score }: JpWikiScoreBadgeProps) {
  if (!score || score.trim() === '') return null;

  // Parse score to number for color calculation
  const scoreNum = parseFloat(score);
  if (Number.isNaN(scoreNum)) return null;

  const color = getJpWikiScoreColor(scoreNum);

  return (
    <Badge
      className="text-white font-bold text-xs px-2.5 py-1"
      style={{
        backgroundColor: color,
        borderColor: color,
        boxShadow: `0 2px 4px ${color}40`,
      }}
      title={`JP Wiki Score: ${score}`}
    >
      <span className="opacity-70 mr-1 text-[10px] uppercase tracking-wide">JP</span>
      {score}
    </Badge>
  );
}

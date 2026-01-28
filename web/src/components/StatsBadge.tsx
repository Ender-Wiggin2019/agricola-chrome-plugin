import { Badge } from '@/components/ui/badge';
import { getAdpColor } from '@/lib/cardUtils';
import type { IStats } from '@/types/cardV2';

interface StatsBadgeProps {
  stats: IStats;
}

export function StatsBadge({ stats }: StatsBadgeProps) {
  if (stats.adp === undefined) return null;

  const color = getAdpColor(stats.adp);

  return (
    <Badge
      className="rounded-full w-9 h-9 flex items-center justify-center text-white font-bold text-xs p-0 ml-auto"
      style={{
        backgroundColor: color,
        boxShadow: `0 2px 6px ${color}50`,
      }}
      title={`ADP: ${stats.adp.toFixed(2)}`}
    >
      {stats.adp.toFixed(1)}
    </Badge>
  );
}

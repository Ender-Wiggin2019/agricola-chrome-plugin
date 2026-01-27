import { getAdpColor } from "~lib/cardUtils"
import type { IStats } from "~types/cardV2"

interface StatsBadgeProps {
  stats: IStats
  size?: "sm" | "md"
}

export function StatsBadge({ stats, size = "md" }: StatsBadgeProps) {
  if (stats.adp === undefined) return null

  const color = getAdpColor(stats.adp)

  const sizeClasses = size === "sm"
    ? "plasmo-w-7 plasmo-h-7 plasmo-text-[10px]"
    : "plasmo-w-9 plasmo-h-9 plasmo-text-xs"

  return (
    <div
      className={`plasmo-rounded-full plasmo-flex plasmo-items-center plasmo-justify-center plasmo-text-white plasmo-font-bold ${sizeClasses}`}
      style={{
        backgroundColor: color,
        boxShadow: `0 2px 6px ${color}50`
      }}
      title={`ADP: ${stats.adp.toFixed(2)}`}
    >
      {stats.adp.toFixed(1)}
    </div>
  )
}

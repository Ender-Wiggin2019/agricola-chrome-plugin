import { getJpWikiScoreColor } from "~lib/cardUtils"

interface JpWikiScoreBadgeProps {
  score: string
  size?: "sm" | "md"
}

export function JpWikiScoreBadge({ score, size = "md" }: JpWikiScoreBadgeProps) {
  if (!score || score.trim() === "") return null

  // Parse score to number for color calculation
  const scoreNum = parseFloat(score)
  if (isNaN(scoreNum)) return null

  const color = getJpWikiScoreColor(scoreNum)

  const sizeClasses = size === "sm"
    ? "plasmo-px-2 plasmo-py-0.5 plasmo-text-[10px]"
    : "plasmo-px-2.5 plasmo-py-1 plasmo-text-xs"

  return (
    <div
      className={`plasmo-inline-flex plasmo-items-center plasmo-rounded-full plasmo-font-bold plasmo-text-white plasmo-shadow-sm plasmo-transition-transform hover:plasmo-scale-105 ${sizeClasses}`}
      style={{
        backgroundColor: color,
        boxShadow: `0 2px 4px ${color}40`,
        textShadow: "0 1px 1px rgba(0,0,0,0.1)"
      }}
      title={`JP Wiki Score: ${score}`}
    >
      <span className="plasmo-opacity-70 plasmo-mr-1 plasmo-text-[9px] plasmo-uppercase plasmo-tracking-wide">
        JP
      </span>
      {score}
    </div>
  )
}

import { getJpWikiScoreColor } from "~lib/cardUtils"
import { getAuthorDisplayName, type TAuthorId } from "~lib/config"

interface JpWikiScoreBadgeProps {
  score: number
  authorId: TAuthorId
  size?: "sm" | "md"
}

export function JpWikiScoreBadge({
  score,
  authorId,
  size = "md"
}: JpWikiScoreBadgeProps) {
  const color = getJpWikiScoreColor(score)
  const label = getAuthorDisplayName(authorId)

  const sizeClasses =
    size === "sm"
      ? "plasmo-px-2 plasmo-py-0.5 plasmo-text-[10px]"
      : "plasmo-px-2.5 plasmo-py-1 plasmo-text-xs"

  return (
    <div
      className={`plasmo-inline-flex plasmo-items-center plasmo-rounded-full plasmo-font-bold plasmo-text-white plasmo-shadow-sm ${sizeClasses}`}
      style={{
        backgroundColor: color,
        boxShadow: `0 2px 4px ${color}40`,
        textShadow: "0 1px 1px rgba(0,0,0,0.1)"
      }}
      title={`JP Wiki Score: ${score}`}>
      <span className="plasmo-opacity-70 plasmo-mr-1 plasmo-text-[9px] plasmo-uppercase plasmo-tracking-wide">
        {label}
      </span>
      {score.toFixed(1)}
    </div>
  )
}

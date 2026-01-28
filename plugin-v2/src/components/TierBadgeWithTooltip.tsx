import { getTierColor } from "~lib/cardUtils"
import { getAuthorDisplayName, type TAuthorId } from "~lib/config"

interface IAuthor {
  name: string
  avatar: string
}

interface TierBadgeWithTooltipProps {
  tier: string
  authorId: TAuthorId
  desc?: string
  author?: IAuthor
  size?: "sm" | "md"
}

export function TierBadgeWithTooltip({
  tier,
  authorId,
  desc,
  author,
  size = "md"
}: TierBadgeWithTooltipProps) {
  if (!tier || tier.trim() === "") return null

  const color = getTierColor(tier, authorId)
  const label = getAuthorDisplayName(authorId)
  const hasDesc = desc && desc.trim() !== ""

  const sizeClasses =
    size === "sm"
      ? "plasmo-px-2 plasmo-py-0.5 plasmo-text-[10px]"
      : "plasmo-px-2.5 plasmo-py-1 plasmo-text-xs"

  const badge = (
    <div
      className={`plasmo-inline-flex plasmo-items-center plasmo-rounded-full plasmo-font-bold plasmo-text-white plasmo-shadow-sm plasmo-cursor-pointer plasmo-transition-transform hover:plasmo-scale-105 ${sizeClasses}`}
      style={{
        backgroundColor: color,
        boxShadow: `0 2px 4px ${color}40`,
        textShadow: "0 1px 1px rgba(0,0,0,0.1)"
      }}>
      <span className="plasmo-opacity-70 plasmo-mr-1 plasmo-text-[9px] plasmo-uppercase plasmo-tracking-wide">
        {label}
      </span>
      {tier}
      {hasDesc && (
        <span className="plasmo-ml-1 plasmo-text-[10px] plasmo-opacity-80">
          +
        </span>
      )}
    </div>
  )

  if (!hasDesc) return badge

  const tooltipContent = (
    <div className="plasmo-max-w-sm">
      {author && (
        <div className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-mb-2 plasmo-pb-2 plasmo-border-b plasmo-border-gray-100">
          {author.avatar && (
            <img
              src={author.avatar}
              alt={author.name}
              className="plasmo-w-6 plasmo-h-6 plasmo-rounded-full plasmo-ring-2 plasmo-ring-white plasmo-shadow-sm"
            />
          )}
          <span className="plasmo-text-sm plasmo-font-semibold plasmo-text-gray-800">
            {author.name}
          </span>
        </div>
      )}
      <p className="plasmo-text-sm plasmo-text-gray-600 plasmo-whitespace-pre-wrap plasmo-leading-relaxed">
        {desc}
      </p>
    </div>
  )

  return badge
}

import { getTierColor } from "~lib/cardUtils"
import { getAuthorDisplayName, type TAuthorId } from "~lib/config"
import type { ICardV2 } from "~types/cardV2"

interface TierBadgeProps {
  card: ICardV2
  authorId: TAuthorId
  hasDesc?: boolean
  size?: "sm" | "md"
}

export function TierBadge({ card, authorId, hasDesc = false, size = "md" }: TierBadgeProps) {
  const tier = card.tiers?.find((t) => t.author === authorId)?.tier
  if (!tier || tier.trim() === "") return null

  const color = getTierColor(tier, authorId)
  const label = getAuthorDisplayName(authorId)

  const sizeClasses = size === "sm"
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
    >
      <span className="plasmo-opacity-70 plasmo-mr-1 plasmo-text-[9px] plasmo-uppercase plasmo-tracking-wide">
        {label}
      </span>
      {tier}
      {hasDesc && <span className="plasmo-ml-1 plasmo-text-[10px] plasmo-opacity-80">+</span>}
    </div>
  )
}

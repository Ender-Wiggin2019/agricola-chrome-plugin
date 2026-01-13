import { getTierColor } from "~lib/cardUtils"
import type { TTierType } from "~types/card"

interface TierBadgeProps {
  tier: string
  tierType: TTierType
  hasDesc?: boolean
  size?: "sm" | "md"
}

const TIER_LABELS: Record<TTierType, string> = {
  baitu: "白兔",
  en: "EN",
  chen: "Chen"
}

export function TierBadge({ tier, tierType, hasDesc = false, size = "md" }: TierBadgeProps) {
  if (!tier || tier.trim() === "") return null

  const color = getTierColor(tier, tierType)
  const label = TIER_LABELS[tierType]

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

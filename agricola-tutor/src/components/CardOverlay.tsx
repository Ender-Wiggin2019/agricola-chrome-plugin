import type { ICard, IAuthors } from "~types/card"
import { getStatsData, getPrimaryTierColor } from "~lib/cardUtils"
import { TierBadgeWithTooltip } from "./TierBadgeWithTooltip"
import { StatsBadge } from "./StatsBadge"

interface CardOverlayProps {
  card: ICard
  authors?: IAuthors
}

export function CardOverlay({ card, authors }: CardOverlayProps) {
  const statsData = getStatsData(card)
  const primaryColor = getPrimaryTierColor(card)

  const hasBadges = 
    (card.baituTier && card.baituTier.trim() !== "") ||
    (card.enTier && card.enTier.trim() !== "") ||
    (card.chenTier && card.chenTier.trim() !== "") ||
    statsData

  if (!hasBadges) return null

  return (
    <div 
      className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-gap-1.5 plasmo-flex-wrap plasmo-p-1.5 plasmo-bg-white/90 plasmo-backdrop-blur-sm plasmo-rounded-lg plasmo-shadow-md"
      style={{ borderTop: `3px solid ${primaryColor}` }}
    >
      {card.baituTier && card.baituTier.trim() !== "" && (
        <TierBadgeWithTooltip
          tier={card.baituTier}
          tierType="baitu"
          desc={card.baituDesc}
          author={authors?.baitu}
          size="sm"
        />
      )}
      {card.enTier && card.enTier.trim() !== "" && (
        <TierBadgeWithTooltip
          tier={card.enTier}
          tierType="en"
          desc={card.enDesc}
          author={authors?.en}
          size="sm"
        />
      )}
      {card.chenTier && card.chenTier.trim() !== "" && (
        <TierBadgeWithTooltip
          tier={card.chenTier}
          tierType="chen"
          desc={card.chenDesc}
          author={authors?.chen}
          size="sm"
        />
      )}
      {statsData && <StatsBadge stats={statsData} size="sm" />}
    </div>
  )
}

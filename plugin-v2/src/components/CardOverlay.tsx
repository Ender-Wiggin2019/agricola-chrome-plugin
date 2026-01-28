import type { ICardV2, IAuthors } from "~types/cardV2"
import { getStatsData, getPrimaryTierColor, getTierValue, tierHasDesc, getTierDesc, getTierScore } from "~lib/cardUtils"
import { getAuthorIds, type TAuthorId } from "~lib/config"
import { TierBadgeWithTooltip } from "./TierBadgeWithTooltip"
import { StatsBadge } from "./StatsBadge"

interface CardOverlayProps {
  card: ICardV2
  authors?: IAuthors
}

export function CardOverlay({ card, authors }: CardOverlayProps) {
  const statsData = getStatsData(card)
  const primaryColor = getPrimaryTierColor(card)
  const authorIds = getAuthorIds()

  const hasBadges = authorIds.some((id) => getTierValue(card, id)) || statsData

  if (!hasBadges) return null

  return (
    <div
      className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-gap-1.5 plasmo-flex-wrap plasmo-p-1.5 plasmo-bg-white/90 plasmo-backdrop-blur-sm plasmo-rounded-lg plasmo-shadow-md"
      style={{ borderTop: `3px solid ${primaryColor}` }}
    >
      {authorIds.map((authorId) => {
        const tierValue = getTierValue(card, authorId)
        if (!tierValue) return null

        return (
          <TierBadgeWithTooltip
            key={authorId}
            tier={tierValue}
            authorId={authorId}
            desc={getTierDesc(card, authorId)}
            author={authors?.[authorId]}
            size="sm"
          />
        )
      })}
      {statsData && <StatsBadge stats={statsData} size="sm" />}
    </div>
  )
}

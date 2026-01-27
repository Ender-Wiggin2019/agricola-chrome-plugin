import type { ICardV2, IAuthors } from "~types/cardV2"
import { getStatsData, getCardName, getCardDesc, getTierValue, tierHasDesc, getTierDesc as getTierDescForCard, getTierScore } from "~lib/cardUtils"
import { getAuthorIds, getAuthorDisplayName, TAuthorId } from "~lib/config"
import { t, getUILanguage } from "~lib/i18n"
import { TierBadgeWithTooltip } from "./TierBadgeWithTooltip"
import { JpWikiScoreBadge } from "./JpWikiScoreBadge"
import { StatsBadge } from "./StatsBadge"
import { useState } from "react"

interface CardResultProps {
  card: ICardV2
  authors?: IAuthors
  index?: number
}

export function CardResult({ card, authors, index = 0 }: CardResultProps) {
  const statsData = getStatsData(card)
  const currentLang = getUILanguage()
  const authorIds = getAuthorIds()
  const [showJpWikiCn, setShowJpWikiCn] = useState(false)

  return (
    <div
      className="plasmo-w-full plasmo-bg-white plasmo-rounded-xl plasmo-border plasmo-border-gray-200 plasmo-shadow-md plasmo-overflow-hidden plasmo-animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="plasmo-p-4">
        {/* Header: No, cnName, enName */}
        <div className="plasmo-flex plasmo-flex-wrap plasmo-items-baseline plasmo-gap-2 plasmo-mb-3 plasmo-pb-3 plasmo-border-b plasmo-border-gray-100">
          <span className="plasmo-font-mono plasmo-text-xs plasmo-font-semibold plasmo-px-2 plasmo-py-0.5 plasmo-rounded plasmo-bg-green-100 plasmo-text-green-800">
            {card.no || "N/A"}
          </span>
          {getCardName(card, "zh") && (
            <span className="plasmo-text-lg plasmo-font-semibold plasmo-text-gray-900">
              {getCardName(card, "zh")}
            </span>
          )}
          {getCardName(card, "en") && (
            <span className="plasmo-text-sm plasmo-text-gray-500 plasmo-italic">
              {getCardName(card, "en")}
            </span>
          )}
        </div>

        {/* Description (card effect) */}
        {getCardDesc(card, currentLang) && (
          <div className="plasmo-py-2 plasmo-mb-3 plasmo-border-b plasmo-border-gray-100">
            <div className="plasmo-text-[10px] plasmo-font-medium plasmo-text-gray-400 plasmo-uppercase plasmo-tracking-wide plasmo-mb-1">
              {t("card_effect")}
            </div>
            <p className="plasmo-text-sm plasmo-text-gray-700 plasmo-leading-relaxed">
              {getCardDesc(card, currentLang)}
            </p>
          </div>
        )}

        {/* Tier badges row */}
        <div className="plasmo-flex plasmo-flex-wrap plasmo-items-center plasmo-gap-2 plasmo-mb-4">
          {authorIds.map((authorId) => {
            const tierValue = getTierValue(card, authorId) || String(getTierScore(card, authorId));
            console.log('🎸 [test] - CardResult - tierValue:', tierValue);
            if (!tierValue) return null;

            return (
              <TierBadgeWithTooltip
                key={authorId}
                tier={tierValue}
                authorId={authorId}
                desc={getTierDesc(card, authorId, currentLang)}
                author={authors?.[authorId]}
              />
            )
          })}
        </div>

        {/* Descriptions */}
        <div className="plasmo-space-y-3">
          {authorIds.map((authorId) => {
            const tierValue = getTierValue(card, authorId)
            const desc = getTierDesc(card, authorId, currentLang)

            if (!tierValue || !desc) return null

            const authorData = authors?.[authorId]
            const authorName = authorData?.name || getAuthorDisplayName(authorId)

            if (authorId === "jpwiki" && !showJpWikiCn) {
              return (
                <button
                  key={authorId}
                  onClick={() => setShowJpWikiCn(true)}
                  className="plasmo-w-full plasmo-text-xs plasmo-text-center plasmo-text-gray-500 plasmo-font-medium plasmo-px-3 plasmo-py-2 plasmo-border plasmo-border-gray-200 plasmo-rounded-lg plasmo-hover:bg-gray-50 plasmo-hover:text-gray-700 plasmo-transition-colors"
                >
                  Show More
                </button>
              )
            }

            return (
              <div key={authorId} className="plasmo-group">
                <div className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-mb-1.5">
                  {authorData?.avatar && (
                    <img
                      src={authorData.avatar}
                      alt={authorName}
                      className="plasmo-w-5 plasmo-h-5 plasmo-rounded-full plasmo-ring-1 plasmo-ring-white plasmo-shadow-sm"
                    />
                  )}
                  <span className="plasmo-text-xs plasmo-font-semibold plasmo-text-green-700">
                    {authorName}
                  </span>
                </div>
                <p className="plasmo-text-sm plasmo-text-gray-600 plasmo-leading-relaxed plasmo-pl-7 plasmo-whitespace-pre-wrap">
                  {desc}
                </p>
              </div>
            )
          })}

          {/* Stats Details */}
          {statsData && (
            <div className="plasmo-pt-2">
              <StatsDetails stats={statsData} />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

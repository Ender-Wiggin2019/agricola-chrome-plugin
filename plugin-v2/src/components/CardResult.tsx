import { useState } from "react"

import {
  getCardDesc,
  getCardName,
  getStatsData,
  getTierDesc as getTierDescForCard,
  getTierScore,
  getTierValue,
  tierHasDesc
} from "~lib/cardUtils"
import {
  getAuthorDisplayName,
  getAuthorIds,
  isAuthorShownByDefault,
  TAuthorId
} from "~lib/config"
import { getUILanguage, t } from "~lib/i18n"
import type { IAuthors, ICardV2 } from "~types/cardV2"

import { JpWikiScoreBadge } from "./JpWikiScoreBadge"
import { StatsBadge } from "./StatsBadge"
import { TierBadgeWithTooltip } from "./TierBadgeWithTooltip"

interface CardResultProps {
  card: ICardV2
  authors?: IAuthors
  index?: number
}

export function CardResult({ card, authors, index = 0 }: CardResultProps) {
  const statsData = getStatsData(card)
  const currentLang = getUILanguage()
  const authorIds = getAuthorIds()
  const [hiddenAuthorsShown, setHiddenAuthorsShown] = useState(false)

  const visibleAuthorIds = authorIds.filter(
    (id) => isAuthorShownByDefault(id) || hiddenAuthorsShown
  )
  const hiddenAuthorIds = authorIds.filter((id) => !isAuthorShownByDefault(id))
  const shouldShowMore = hiddenAuthorIds.length > 0 && !hiddenAuthorsShown

  return (
    <div
      className="plasmo-w-full plasmo-bg-white plasmo-rounded-xl plasmo-border plasmo-border-gray-200 plasmo-shadow-md plasmo-overflow-hidden plasmo-animate-fade-in"
      style={{ animationDelay: `${index * 100}ms` }}>
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
          {visibleAuthorIds.map((authorId) => {
            const tierValue = getTierValue(card, authorId)
            const tierScore = getTierScore(card, authorId)

            if (!tierValue && !tierScore) return null

            if (authorId === "jpwiki" && tierScore) {
              return (
                <JpWikiScoreBadge
                  key={authorId}
                  score={tierScore}
                  authorId={authorId}
                />
              )
            }

            if (!tierValue) return null

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
            const tierScore = getTierScore(card, authorId)
            const desc = getTierDesc(card, authorId, currentLang)

            if (!tierValue && !tierScore && !desc) return null

            const isHiddenAuthor = !isAuthorShownByDefault(authorId)

            if (!hiddenAuthorsShown && isHiddenAuthor) return null

            const authorData = authors?.[authorId]
            const authorName =
              authorData?.name || getAuthorDisplayName(authorId)

            const tierBadge = isHiddenAuthor && (tierValue || tierScore) ? (
              <span className="plasmo-ml-2">
                {authorId === "jpwiki" && tierScore ? (
                  <JpWikiScoreBadge score={tierScore} authorId={authorId} />
                ) : tierValue ? (
                  <TierBadge
                    tier={tierValue}
                    authorId={authorId}
                    size="sm"
                  />
                ) : null}
              </span>
            ) : null

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
                  {tierBadge}
                </div>
                <p className="plasmo-text-sm plasmo-text-gray-600 plasmo-leading-relaxed plasmo-pl-7 plasmo-whitespace-pre-wrap">
                  {desc}
                </p>
              </div>
            )
          })}

          {/* Show More Button */}
          {shouldShowMore && (
            <button
              onClick={() => setHiddenAuthorsShown(true)}
              className="plasmo-w-full plasmo-mt-3 plasmo-px-4 plasmo-py-2.5 plasmo-text-sm plasmo-font-medium plasmo-text-green-700 plasmo-bg-green-50 hover:plasmo-bg-green-100 plasmo-rounded plasmo-transition-colors plasmo-flex plasmo-items-center plasmo-justify-center plasmo-gap-2"
            >
              <svg className="plasmo-w-4 plasmo-h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {t("show_more")}
            </button>
          )}

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

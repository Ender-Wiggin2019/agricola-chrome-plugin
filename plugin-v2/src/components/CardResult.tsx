import type { ICard, IAuthors } from "~types/card"
import { getStatsData } from "~lib/cardUtils"
import { t, getUILanguage } from "~lib/i18n"
import { TierBadgeWithTooltip } from "./TierBadgeWithTooltip"
import { JpWikiScoreBadge } from "./JpWikiScoreBadge"
import { StatsDetails } from "./StatsDetails"
import { useState } from "react"

interface CardResultProps {
  card: ICard
  authors?: IAuthors
  index?: number
}

export function CardResult({ card, authors, index = 0 }: CardResultProps) {
  const statsData = getStatsData(card)
  const currentLang = getUILanguage()
  const isZh = currentLang === "zh" || currentLang.startsWith("zh-")
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
          {card.cnName && (
            <span className="plasmo-text-lg plasmo-font-semibold plasmo-text-gray-900">
              {card.cnName}
            </span>
          )}
          {card.enName && (
            <span className="plasmo-text-sm plasmo-text-gray-500 plasmo-italic">
              {card.enName}
            </span>
          )}
        </div>

        {/* Description (card effect) */}
        {card.desc && card.desc.trim() !== "" && (
          <div className="plasmo-py-2 plasmo-mb-3 plasmo-border-b plasmo-border-gray-100">
            <div className="plasmo-text-[10px] plasmo-font-medium plasmo-text-gray-400 plasmo-uppercase plasmo-tracking-wide plasmo-mb-1">
              {t("card_effect")}
            </div>
            <p className="plasmo-text-sm plasmo-text-gray-700 plasmo-leading-relaxed">
              {card.desc}
            </p>
          </div>
        )}

        {/* Tier badges row */}
        <div className="plasmo-flex plasmo-flex-wrap plasmo-items-center plasmo-gap-2 plasmo-mb-4">
          {card.baituTier && card.baituTier.trim() !== "" && (
            <TierBadgeWithTooltip
              tier={card.baituTier}
              tierType="baitu"
              desc={card.baituDesc}
              author={authors?.baitu}
            />
          )}
          {card.enTier && card.enTier.trim() !== "" && (
            <TierBadgeWithTooltip
              tier={card.enTier}
              tierType="en"
              desc={isZh && card.enDesc_trans2zh ? card.enDesc_trans2zh : card.enDesc}
              author={authors?.en}
            />
          )}
          {card.chenTier && card.chenTier.trim() !== "" && (
            <TierBadgeWithTooltip
              tier={card.chenTier}
              tierType="chen"
              desc={card.chenDesc}
              author={authors?.chen}
            />
          )}
          {card.jpwiki_score && card.jpwiki_score.trim() !== "" && (
            <JpWikiScoreBadge score={card.jpwiki_score} />
          )}
        </div>

        {card.comment_jpwiki_cn && card.comment_jpwiki_cn.trim() !== "" && (
          <div className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-mb-3 plasmo-pb-3 plasmo-border-b plasmo-border-gray-100">
            <label className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-cursor-pointer">
              <div className="plasmo-relative">
                <input
                  type="checkbox"
                  className="plasmo-sr-only plasmo-peer"
                  checked={showJpWikiCn}
                  onChange={() => setShowJpWikiCn(!showJpWikiCn)}
                />
                <div className="plasmo-w-9 plasmo-h-5 plasmo-bg-gray-200 plasmo-peer-focus:outline-none plasmo-peer-focus:ring-2 plasmo-peer-focus:ring-green-300 plasmo-rounded-full plasmo-peer plasmo-transition-all plasmo-duration-200 plasmo-peer-checked:after:translate-x-full plasmo-peer-checked:after:border-white plasmo-after:content-[''] plasmo-after:absolute plasmo-after:top-0.5 plasmo-after:left-[2px] plasmo-after:bg-white plasmo-after:border-gray-300 plasmo-after:border plasmo-after:rounded-full plasmo-after:h-4 plasmo-after:w-4 plasmo-after:transition-all plasmo-peer-checked:bg-green-600"></div>
              </div>
              <span className="plasmo-text-xs plasmo-font-medium plasmo-text-gray-600">JpWiki 中文评价</span>
            </label>
          </div>
        )}

        {/* Descriptions */}
        <div className="plasmo-space-y-3">
          {/* Baitu Desc */}
          {card.baituDesc && card.baituDesc.trim() !== "" && (
            <div className="plasmo-group">
              <div className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-mb-1.5">
                {authors?.baitu?.avatar && (
                  <img
                    src={authors.baitu.avatar}
                    alt={authors.baitu.name}
                    className="plasmo-w-5 plasmo-h-5 plasmo-rounded-full plasmo-ring-1 plasmo-ring-white plasmo-shadow-sm"
                  />
                )}
                <span className="plasmo-text-xs plasmo-font-semibold plasmo-text-green-700">
                  {authors?.baitu?.name || "白兔"}
                </span>
              </div>
              <p className="plasmo-text-sm plasmo-text-gray-600 plasmo-leading-relaxed plasmo-pl-7 plasmo-whitespace-pre-wrap">
                {card.baituDesc}
              </p>
            </div>
          )}

          {/* EN Desc */}
          {((isZh && (card.enDesc_trans2zh || card.enDesc)) || (!isZh && card.enDesc)) && (
            <div className="plasmo-group">
              <div className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-mb-1.5">
                {authors?.en?.avatar && (
                  <img
                    src={authors.en.avatar}
                    alt={authors.en.name}
                    className="plasmo-w-5 plasmo-h-5 plasmo-rounded-full plasmo-ring-1 plasmo-ring-white plasmo-shadow-sm"
                  />
                )}
                <span className="plasmo-text-xs plasmo-font-semibold plasmo-text-green-700">
                  {authors?.en?.name || "EN"}
                </span>
              </div>
              <p className="plasmo-text-sm plasmo-text-gray-600 plasmo-leading-relaxed plasmo-pl-7 plasmo-whitespace-pre-wrap">
                {isZh && card.enDesc_trans2zh ? card.enDesc_trans2zh : card.enDesc}
              </p>
            </div>
          )}

          {/* Chen Desc */}
          {card.chenDesc && card.chenDesc.trim() !== "" && (
            <div className="plasmo-group">
              <div className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-mb-1.5">
                {authors?.chen?.avatar && (
                  <img
                    src={authors.chen.avatar}
                    alt={authors.chen.name}
                    className="plasmo-w-5 plasmo-h-5 plasmo-rounded-full plasmo-ring-1 plasmo-ring-white plasmo-shadow-sm"
                  />
                )}
                <span className="plasmo-text-xs plasmo-font-semibold plasmo-text-green-700">
                  {authors?.chen?.name || "Chen"}
                </span>
              </div>
              <p className="plasmo-text-sm plasmo-text-gray-600 plasmo-leading-relaxed plasmo-pl-7 plasmo-whitespace-pre-wrap">
                {card.chenDesc}
              </p>
            </div>
          )}

          {showJpWikiCn && card.comment_jpwiki_cn && card.comment_jpwiki_cn.trim() !== "" && (
            <div className="plasmo-group">
              <div className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-mb-1.5">
                <span className="plasmo-text-xs plasmo-font-semibold plasmo-text-green-700">
                  Jp Wiki
                </span>
              </div>
              <p className="plasmo-text-sm plasmo-text-gray-600 plasmo-leading-relaxed plasmo-pl-7 plasmo-whitespace-pre-wrap">
                {card.comment_jpwiki_cn}
              </p>
            </div>
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

import "./style.css"
import { useState, useCallback, useMemo, useEffect, useRef } from "react"

import type { ICardV2, IAuthors } from "~types/cardV2"
import { searchCards, getStatsData, getTierColor, getAdpColor, getDrawPlayRateColor, getCardName, getTierValue, getTierDesc, getTierScore, getCardDesc } from "~lib/cardUtils"
import { getAuthorIds, type TAuthorId } from "~lib/config"
import { t, getUILanguage } from "~lib/i18n"
import { JpWikiScoreBadge } from "~components/JpWikiScoreBadge"

function WheatIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21v-9" />
      <path d="M15.5 12.5c1.5-1.5 2-4 2-6-2 0-4.5.5-6 2 1.5 1.5 2 4 2 6" />
      <path d="M8.5 12.5c-1.5-1.5-2-4-2-6 2 0 4.5.5 6 2-1.5 1.5-2 4-2 6" />
      <path d="M12 12c1.5-1.5 2-4 2-6-2 0-3.5.5-5 2" />
      <path d="M12 12c-1.5-1.5-2-4-2-6 2 0 3.5.5 5 2" />
    </svg>
  )
}

// Tier Badge Component
function TierBadge({ tier, authorId, author }: { tier: string; authorId: TAuthorId; author?: { name: string; avatar?: string } }) {
  if (!tier || tier.trim() === "") return null

  const color = getTierColor(tier, authorId)
  const label = t(`tier_${authorId}`)

  return (
    <div
      className="plasmo-inline-flex plasmo-items-center plasmo-px-2 plasmo-py-0.5 plasmo-rounded-full plasmo-text-white plasmo-text-xs plasmo-font-bold"
      style={{ backgroundColor: color, boxShadow: `0 2px 4px ${color}40` }}
      title={author?.name}
    >
      <span className="plasmo-opacity-70 plasmo-mr-1 plasmo-text-[9px] plasmo-uppercase">{label}</span>
      {tier}
    </div>
  )
}

// Stats Badge Component
function StatsBadge({ adp }: { adp: number }) {
  const color = getAdpColor(adp)
  return (
    <div
      className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-w-7 plasmo-h-7 plasmo-rounded-full plasmo-text-white plasmo-text-[10px] plasmo-font-bold"
      style={{ backgroundColor: color, boxShadow: `0 2px 4px ${color}40` }}
      title={`ADP: ${adp.toFixed(2)}`}
    >
      {adp.toFixed(1)}
    </div>
  )
}

// Card Result Component
function CardResult({ card, authors }: { card: ICardV2; authors?: IAuthors }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const statsData = getStatsData(card)
  const currentLang = getUILanguage()
  const isZh = currentLang === "zh" || currentLang.startsWith("zh-")
  const authorIds = getAuthorIds()

  const hasComments = authorIds.some((id) => {
    const desc = getTierDesc(card, id, currentLang)
    return desc && desc.trim()
  })

  return (
    <div className="plasmo-bg-white plasmo-rounded-lg plasmo-border plasmo-border-gray-200 plasmo-shadow-sm plasmo-overflow-hidden">
      {/* Header - always visible */}
      <div
        className="plasmo-p-3 plasmo-cursor-pointer hover:plasmo-bg-gray-50 plasmo-transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Card info */}
        <div className="plasmo-flex plasmo-items-baseline plasmo-gap-2 plasmo-mb-2">
          <span className="plasmo-font-mono plasmo-text-[10px] plasmo-font-semibold plasmo-px-1.5 plasmo-py-0.5 plasmo-rounded plasmo-bg-green-100 plasmo-text-green-800">
            {card.no || "N/A"}
          </span>
          {getCardName(card, "zh") && (
            <span className="plasmo-text-sm plasmo-font-semibold plasmo-text-gray-900">{getCardName(card, "zh")}</span>
          )}
          {getCardName(card, "en") && (
            <span className="plasmo-text-xs plasmo-text-gray-500 plasmo-italic">{getCardName(card, "en")}</span>
          )}
        </div>

        {/* Tier badges */}
        <div className="plasmo-flex plasmo-items-center plasmo-gap-1.5 plasmo-flex-wrap">
          {authorIds.map((authorId) => {
            const tierValue = getTierValue(card, authorId)
            if (!tierValue) return null

            return (
              <TierBadge
                key={authorId}
                tier={tierValue}
                authorId={authorId}
                author={authors?.[authorId]}
              />
            )
          })}
          {statsData?.adp !== undefined && <StatsBadge adp={statsData.adp} />}
          {hasComments && (
            <span className="plasmo-text-[10px] plasmo-text-gray-400 plasmo-ml-auto">
              {isExpanded ? "▲" : "▼"}
            </span>
          )}
        </div>

        {/* Expanded content */}
        {isExpanded && (
          <div className="plasmo-px-3 plasmo-pb-3 plasmo-border-t plasmo-border-gray-100 plasmo-pt-3 plasmo-space-y-3">
            {/* Card effect */}
            {getCardDesc(card, currentLang) && (
              <div>
                <div className="plasmo-text-[10px] plasmo-text-gray-400 plasmo-uppercase plasmo-mb-1">{t("card_effect")}</div>
                <p className="plasmo-text-xs plasmo-text-gray-600 plasmo-leading-relaxed">{getCardDesc(card, currentLang)}</p>
              </div>
            )}

            {/* Author comments */}
            {authorIds.map((authorId) => {
              const desc = getTierDesc(card, authorId, currentLang)
              if (!desc || !desc.trim()) return null

              const authorData = authors?.[authorId]
              const authorName = authorData?.name || t(`tier_${authorId}`)

              return (
                <div key={authorId} className="plasmo-bg-gray-50 plasmo-rounded plasmo-p-2">
                  <div className="plasmo-flex plasmo-items-center plasmo-gap-1.5 plasmo-mb-1">
                    {authorData?.avatar && (
                      <img src={authorData.avatar} alt="" className="plasmo-w-4 plasmo-h-4 plasmo-rounded-full" />
                    )}
                    <span className="plasmo-text-[10px] plasmo-font-semibold plasmo-text-green-700">
                      {authorName}
                    </span>
                  </div>
                  <p className="plasmo-text-xs plasmo-text-gray-600 plasmo-leading-relaxed plasmo-whitespace-pre-wrap">
                    {desc}
                  </p>
                </div>
              )
            })}

            {/* Stats Details */}
            {statsData && (
              <div className="plasmo-bg-green-50 plasmo-rounded plasmo-p-2">
                <div className="plasmo-text-[10px] plasmo-font-semibold plasmo-text-green-700 plasmo-mb-2">
                  {t("stats_title")}
                </div>
                <div className="plasmo-grid plasmo-grid-cols-2 plasmo-gap-2 plasmo-text-center">
                  {statsData.pwr !== undefined && (
                    <div>
                      <div className="plasmo-text-[9px] plasmo-text-gray-500">{t("stats_pwr")}</div>
                      <div className="plasmo-text-sm plasmo-font-bold plasmo-text-gray-900">{statsData.pwr.toFixed(2)}</div>
                    </div>
                  )}
                  {statsData.adp !== undefined && (
                    <div>
                      <div className="plasmo-text-[9px] plasmo-text-gray-500">{t("stats_adp")}</div>
                      <div className="plasmo-text-sm plasmo-font-bold" style={{ color: getAdpColor(statsData.adp) }}>
                        {statsData.adp.toFixed(2)}
                      </div>
                    </div>
                  )}
                  {statsData.apr !== undefined && (
                    <div>
                      <div className="plasmo-text-[9px] plasmo-text-gray-500">{t("stats_apr")}</div>
                      <div className="plasmo-text-sm plasmo-font-bold plasmo-text-gray-900">{statsData.apr.toFixed(2)}</div>
                    </div>
                  )}
                  {statsData.drawPlayRate !== undefined && (
                    <div>
                      <div className="plasmo-text-[9px] plasmo-text-gray-500">{t("stats_playRate")}</div>
                      <div className="plasmo-text-sm plasmo-font-bold" style={{ color: getDrawPlayRateColor(statsData.drawPlayRate) }}>
                        {Math.round(statsData.drawPlayRate * 100)}%
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Main Side Panel Component
function SidePanel() {
  const [cardsData, setCardsData] = useState<ICardV2[]>([])
  const [authorsData, setAuthorsData] = useState<IAuthors | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)

        const cardsUrl = chrome.runtime.getURL("cards.json")
        const cardsResponse = await fetch(cardsUrl)
        const cards = await cardsResponse.json()
        setCardsData(cards)

        try {
          const authorsUrl = chrome.runtime.getURL("authors.json")
          const authorsResponse = await fetch(authorsUrl)
          const authors = await authorsResponse.json()
          setAuthorsData(authors)
        } catch (err) {
          console.warn("Authors data not found:", err)
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Focus input on load
  useEffect(() => {
    if (!isLoading && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isLoading])

  // Search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    return searchCards(cardsData, searchQuery, 20)
  }, [cardsData, searchQuery])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  return (
    <div className="plasmo-min-h-screen plasmo-bg-gradient-to-b plasmo-from-amber-50 plasmo-to-green-50">
      {/* Header */}
      <div className="plasmo-sticky plasmo-top-0 plasmo-z-10 plasmo-bg-gradient-to-b plasmo-from-amber-50 plasmo-to-amber-50/95 plasmo-backdrop-blur-sm plasmo-border-b plasmo-border-amber-200/50 plasmo-px-4 plasmo-py-3">
        <div className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-gap-2 plasmo-mb-3">
          <WheatIcon className="plasmo-w-5 plasmo-h-5 plasmo-text-amber-600" />
          <h1 className="plasmo-text-base plasmo-font-semibold plasmo-text-green-800">{t("header_title")}</h1>
          <WheatIcon className="plasmo-w-5 plasmo-h-5 plasmo-text-amber-600 plasmo-scale-x-[-1]" />
        </div>

        {/* Search Input */}
        <div className="plasmo-relative">
          <svg
            className="plasmo-absolute plasmo-left-3 plasmo-top-1/2 plasmo--translate-y-1/2 plasmo-w-4 plasmo-h-4 plasmo-text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={handleInputChange}
            placeholder={t("search_placeholder")}
            className="plasmo-w-full plasmo-pl-9 plasmo-pr-3 plasmo-py-2 plasmo-text-sm plasmo-border plasmo-border-gray-200 plasmo-rounded-lg plasmo-bg-white focus:plasmo-border-green-400 focus:plasmo-ring-2 focus:plasmo-ring-green-100 plasmo-outline-none plasmo-transition-all"
          />
        </div>

        {/* Cards count */}
        {!isLoading && searchQuery.trim() === "" && (
          <p className="plasmo-text-[10px] plasmo-text-center plasmo-text-gray-500 plasmo-mt-2">
            <span className="plasmo-font-semibold plasmo-text-green-700">{cardsData.length}</span> cards
          </p>
        )}

        {/* Credits */}
        <div className="plasmo-mt-3 plasmo-pt-3 plasmo-border-t plasmo-border-amber-200/50">
          <div className="plasmo-text-[9px] plasmo-text-gray-500 plasmo-text-center plasmo-space-y-0.5">
            <p><span className="plasmo-font-medium">{t("footer_pluginCreator")}:</span> Ender • <span className="plasmo-font-medium">{t("footer_statistics")}:</span> Lumin</p>
            <p><span className="plasmo-font-medium">{t("footer_tierProviders")}:</span> Yuxiao_Huang, Chen233, Mark Hartnady</p>
            <p className="plasmo-opacity-75">{t("footer_specialThanks")} Henry, smile3000, 暧晖</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="plasmo-px-3 plasmo-py-3">
        {isLoading ? (
          <div className="plasmo-text-center plasmo-py-8">
            <WheatIcon className="plasmo-w-8 plasmo-h-8 plasmo-text-amber-500 plasmo-mx-auto plasmo-mb-2 plasmo-animate-pulse" />
            <p className="plasmo-text-sm plasmo-text-gray-500">Loading...</p>
          </div>
        ) : searchQuery.trim() === "" ? (
          <div className="plasmo-text-center plasmo-py-8 plasmo-text-gray-400">
            <WheatIcon className="plasmo-w-10 plasmo-h-10 plasmo-mx-auto plasmo-mb-3 plasmo-opacity-50" />
            <p className="plasmo-text-sm">{t("results_enterTerm")}</p>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="plasmo-text-center plasmo-py-8 plasmo-text-gray-400">
            <p className="plasmo-text-sm">{t("results_noCards")}</p>
          </div>
        ) : (
          <div className="plasmo-space-y-2">
            <p className="plasmo-text-[10px] plasmo-text-gray-500 plasmo-mb-2">
              Found <span className="plasmo-font-semibold plasmo-text-green-700">{searchResults.length}</span> cards
            </p>
            {searchResults.map((card, index) => (
              <CardResult key={card.no || index} card={card} authors={authorsData} />
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default SidePanel

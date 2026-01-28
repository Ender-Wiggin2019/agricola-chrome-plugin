import { useState } from "react"

import { getAdpColor, getDrawPlayRateColor } from "~lib/cardUtils"
import { t } from "~lib/i18n"
import type { IStats } from "~types/cardV2"

interface StatsDetailsProps {
  stats: IStats
}

// Tooltip component
function Tooltip({
  text,
  children
}: {
  text: string
  children: React.ReactNode
}) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div
      className="plasmo-relative plasmo-inline-flex plasmo-items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}>
      {children}
      {isVisible && (
        <div className="plasmo-absolute plasmo-bottom-full plasmo-left-1/2 plasmo--translate-x-1/2 plasmo-mb-2 plasmo-px-3 plasmo-py-2 plasmo-text-xs plasmo-bg-gray-900 plasmo-text-white plasmo-rounded-lg plasmo-shadow-lg plasmo-whitespace-nowrap plasmo-z-50 plasmo-animate-fade-in">
          {text}
          <div className="plasmo-absolute plasmo-top-full plasmo-left-1/2 plasmo--translate-x-1/2 plasmo-border-4 plasmo-border-transparent plasmo-border-t-gray-900" />
        </div>
      )}
    </div>
  )
}

// Info icon component
function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

export function StatsDetails({ stats }: StatsDetailsProps) {
  const adpColor = stats.adp !== undefined ? getAdpColor(stats.adp) : undefined
  const drawPlayRateColor =
    stats.drawPlayRate !== undefined
      ? getDrawPlayRateColor(stats.drawPlayRate)
      : undefined
  const drawPlayRatePercent =
    stats.drawPlayRate !== undefined
      ? Math.round(stats.drawPlayRate * 100)
      : undefined

  return (
    <div
      className="plasmo-rounded-lg plasmo-p-3"
      style={{ backgroundColor: "#F6F6F2" }}>
      <div className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-mb-2">
        <svg
          className="plasmo-w-4 plasmo-h-4 plasmo-text-green-700 plasmo-opacity-60"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <span className="plasmo-text-[10px] plasmo-font-semibold plasmo-text-green-800 plasmo-uppercase plasmo-tracking-wide">
          {t("stats_title")}
        </span>
      </div>

      <div className="plasmo-grid plasmo-grid-cols-2 plasmo-gap-2 plasmo-text-center">
        {stats.pwr !== undefined && (
          <div>
            <div className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-gap-1 plasmo-mb-0.5">
              <span className="plasmo-text-[10px] plasmo-text-gray-500">
                {t("stats_pwr")}
              </span>
              <Tooltip text={t("stats_pwr_tooltip")}>
                <InfoIcon className="plasmo-w-3.5 plasmo-h-3.5 plasmo-text-gray-400 hover:plasmo-text-green-700 plasmo-cursor-help plasmo-transition-colors" />
              </Tooltip>
            </div>
            <div className="plasmo-font-bold plasmo-text-sm plasmo-text-gray-900">
              {stats.pwr.toFixed(2)}
            </div>
          </div>
        )}

        {stats.adp !== undefined && (
          <div>
            <div className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-gap-1 plasmo-mb-0.5">
              <span className="plasmo-text-[10px] plasmo-text-gray-500">
                {t("stats_adp")}
              </span>
              <Tooltip text={t("stats_adp_tooltip")}>
                <InfoIcon className="plasmo-w-3.5 plasmo-h-3.5 plasmo-text-gray-400 hover:plasmo-text-green-700 plasmo-cursor-help plasmo-transition-colors" />
              </Tooltip>
            </div>
            <div
              className="plasmo-font-bold plasmo-text-sm"
              style={{ color: adpColor }}>
              {stats.adp.toFixed(2)}
            </div>
          </div>
        )}

        {stats.apr !== undefined && (
          <div>
            <div className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-gap-1 plasmo-mb-0.5">
              <span className="plasmo-text-[10px] plasmo-text-gray-500">
                {t("stats_apr")}
              </span>
              <Tooltip text={t("stats_apr_tooltip")}>
                <InfoIcon className="plasmo-w-3.5 plasmo-h-3.5 plasmo-text-gray-400 hover:plasmo-text-green-700 plasmo-cursor-help plasmo-transition-colors" />
              </Tooltip>
            </div>
            <div className="plasmo-font-bold plasmo-text-sm plasmo-text-gray-900">
              {stats.apr.toFixed(2)}
            </div>
          </div>
        )}

        {stats.drawPlayRate !== undefined && (
          <div>
            <div className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-gap-1 plasmo-mb-0.5">
              <span className="plasmo-text-[10px] plasmo-text-gray-500">
                {t("stats_playRate")}
              </span>
              {/* <Tooltip text={t("stats_playRate_tooltip")}> */}
              <InfoIcon className="plasmo-w-3.5 plasmo-h-3.5 plasmo-text-gray-400 hover:plasmo-text-green-700 plasmo-cursor-help plasmo-transition-colors" />
              {/* </Tooltip> */}
            </div>
            <div
              className="plasmo-font-bold plasmo-text-sm"
              style={{ color: drawPlayRateColor }}>
              {drawPlayRatePercent}%
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

import { getAdpColor, getDrawPlayRateColor } from "~lib/cardUtils"
import { t } from "~lib/i18n"
import type { IStats } from "~types/card"

interface StatsDetailsProps {
  stats: IStats
}

export function StatsDetails({ stats }: StatsDetailsProps) {
  const adpColor = stats.adp !== undefined ? getAdpColor(stats.adp) : undefined
  const drawPlayRateColor = stats.drawPlayRate !== undefined ? getDrawPlayRateColor(stats.drawPlayRate) : undefined
  const drawPlayRatePercent = stats.drawPlayRate !== undefined ? Math.round(stats.drawPlayRate * 100) : undefined

  return (
    <div className="plasmo-bg-gray-100 plasmo-rounded-lg plasmo-p-3">
      <div className="plasmo-flex plasmo-items-center plasmo-gap-2 plasmo-mb-2">
        <svg className="plasmo-w-4 plasmo-h-4 plasmo-text-green-700 plasmo-opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <span className="plasmo-text-[10px] plasmo-font-semibold plasmo-text-green-800 plasmo-uppercase plasmo-tracking-wide">
          {t("stats_title")}
        </span>
      </div>

      <div className="plasmo-grid plasmo-grid-cols-2 plasmo-gap-2 plasmo-text-center">
        {stats.pwr !== undefined && (
          <div>
            <div className="plasmo-text-[10px] plasmo-text-gray-500 plasmo-mb-0.5">{t("stats_pwr")}</div>
            <div className="plasmo-font-bold plasmo-text-sm plasmo-text-gray-900">{stats.pwr.toFixed(2)}</div>
          </div>
        )}

        {stats.adp !== undefined && (
          <div>
            <div className="plasmo-text-[10px] plasmo-text-gray-500 plasmo-mb-0.5">{t("stats_adp")}</div>
            <div className="plasmo-font-bold plasmo-text-sm" style={{ color: adpColor }}>{stats.adp.toFixed(2)}</div>
          </div>
        )}

        {stats.apr !== undefined && (
          <div>
            <div className="plasmo-text-[10px] plasmo-text-gray-500 plasmo-mb-0.5">{t("stats_apr")}</div>
            <div className="plasmo-font-bold plasmo-text-sm plasmo-text-gray-900">{stats.apr.toFixed(2)}</div>
          </div>
        )}

        {stats.drawPlayRate !== undefined && (
          <div>
            <div className="plasmo-text-[10px] plasmo-text-gray-500 plasmo-mb-0.5">{t("stats_playRate")}</div>
            <div className="plasmo-font-bold plasmo-text-sm" style={{ color: drawPlayRateColor }}>{drawPlayRatePercent}%</div>
          </div>
        )}
      </div>
    </div>
  )
}

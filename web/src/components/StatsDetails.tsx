import type { IStats } from '@/types/cardV2';
import { getAdpColor, getDrawPlayRateColor } from '@/lib/cardUtils';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface StatsDetailsProps {
  stats: IStats;
}

// Tooltip component
function Tooltip({ text, children }: { text: string; children: React.ReactNode }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs bg-foreground text-background rounded-lg shadow-lg whitespace-nowrap z-50 animate-fade-in">
          {text}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
        </div>
      )}
    </div>
  );
}

// Info icon component
function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

export function StatsDetails({ stats }: StatsDetailsProps) {
  const { t } = useTranslation();

  const adpColor = stats.adp !== undefined ? getAdpColor(stats.adp) : undefined;
  const drawPlayRateColor =
    stats.drawPlayRate !== undefined ? getDrawPlayRateColor(stats.drawPlayRate) : undefined;
  const drawPlayRatePercent =
    stats.drawPlayRate !== undefined ? Math.round(stats.drawPlayRate * 100) : undefined;

  return (
    <div className="bg-secondary/30 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <svg
          className="w-4 h-4 text-primary/60"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
        <span className="text-xs font-semibold text-primary/80 uppercase tracking-wide">
          {t('stats.title')}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.pwr !== undefined && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-xs text-muted-foreground">{t('stats.pwr')}</span>
              <Tooltip text={t('stats.pwrTooltip')}>
                <InfoIcon className="w-3.5 h-3.5 text-muted-foreground/50 hover:text-primary cursor-help transition-colors" />
              </Tooltip>
            </div>
            <div className="font-bold text-foreground">{stats.pwr.toFixed(2)}</div>
          </div>
        )}

        {stats.adp !== undefined && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-xs text-muted-foreground">{t('stats.adp')}</span>
              <Tooltip text={t('stats.adpTooltip')}>
                <InfoIcon className="w-3.5 h-3.5 text-muted-foreground/50 hover:text-primary cursor-help transition-colors" />
              </Tooltip>
            </div>
            <div className="font-bold" style={{ color: adpColor }}>
              {stats.adp.toFixed(2)}
            </div>
          </div>
        )}

        {stats.apr !== undefined && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-xs text-muted-foreground">{t('stats.apr')}</span>
              <Tooltip text={t('stats.aprTooltip')}>
                <InfoIcon className="w-3.5 h-3.5 text-muted-foreground/50 hover:text-primary cursor-help transition-colors" />
              </Tooltip>
            </div>
            <div className="font-bold text-foreground">{stats.apr.toFixed(2)}</div>
          </div>
        )}

        {stats.drawPlayRate !== undefined && (
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <span className="text-xs text-muted-foreground">{t('stats.playRate')}</span>
              <Tooltip text={t('stats.playRateTooltip')}>
                <InfoIcon className="w-3.5 h-3.5 text-muted-foreground/50 hover:text-primary cursor-help transition-colors" />
              </Tooltip>
            </div>
            <div className="font-bold" style={{ color: drawPlayRateColor }}>
              {drawPlayRatePercent}%
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

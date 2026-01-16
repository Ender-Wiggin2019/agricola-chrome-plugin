import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import type { ICard, IAuthors } from '@/types/card';
import { TierBadge } from '@/components/TierBadge';
import { StatsDetails } from '@/components/StatsDetails';
import { JpWikiScoreBadge } from '@/components/JpWikiScoreBadge';
import { getStatsData } from '@/lib/cardUtils';
import { useTranslation } from 'react-i18next';

interface CardResultProps {
  card: ICard;
  authors?: IAuthors;
  index?: number;
}

export function CardResult({ card, authors, index = 0 }: CardResultProps) {
  const statsData = getStatsData(card);
  const { t, i18n } = useTranslation();
  const isZh = i18n.language === 'zh' || i18n.language.startsWith('zh-');
  const [showTranslation, setShowTranslation] = useState(true);

  // Only show switch if both enDesc and enDesc_trans2zh exist
  const hasTranslation = !!(card.enDesc_trans2zh && card.enDesc_trans2zh.trim() !== '');
  const showSwitch = isZh && hasTranslation && card.enDesc && card.enDesc.trim() !== '';

  return (
    <Card className="w-full animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
      <CardContent className="pt-6">
        {/* Header: No, cnName, enName */}
        <div className="flex flex-wrap items-baseline gap-3 mb-1 pb-4 border-b border-border/50">
          <span className="font-mono text-sm font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
            {card.no || 'N/A'}
          </span>
          {card.cnName && (
            <span className="font-serif text-xl font-semibold text-foreground">{card.cnName}</span>
          )}
          {card.enName && (
            <span className="text-base text-muted-foreground italic">{card.enName}</span>
          )}
        </div>

        {/* Description (card effect) */}
        {card.desc && card.desc.trim() !== '' && (
          <div className="py-3 border-b border-border/30">
            <div className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wide mb-1.5">
              {t('card.description')}
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{card.desc}</p>
          </div>
        )}

        {/* Tier badges row */}
        <div className="flex flex-wrap items-center gap-2 py-4 border-b border-border/30">
          {card.baituTier && card.baituTier.trim() !== '' && (
            <TierBadge tier={card.baituTier} tierType="baitu" hasDesc={!!card.baituDesc} />
          )}
          {card.enTier && card.enTier.trim() !== '' && (
            <TierBadge tier={card.enTier} tierType="en" hasDesc={!!card.enDesc} />
          )}
          {card.chenTier && card.chenTier.trim() !== '' && (
            <TierBadge tier={card.chenTier} tierType="chen" hasDesc={!!card.chenDesc} />
          )}
          {card.jpwiki_score && card.jpwiki_score.trim() !== '' && (
            <JpWikiScoreBadge score={card.jpwiki_score} />
          )}
          {/* {statsData && <StatsBadge stats={statsData} />} */}
        </div>

        {/* Descriptions */}
        <div className="space-y-4 pt-4">
          {/* Baitu Desc */}
          {card.baituDesc && card.baituDesc.trim() !== '' && (
            <div className="group">
              <div className="flex items-center gap-2 mb-2">
                {authors?.baitu?.avatar && (
                  <img
                    src={authors.baitu.avatar}
                    alt={authors.baitu.name}
                    className="w-6 h-6 rounded-full ring-2 ring-white shadow-sm"
                  />
                )}
                <span className="text-sm font-semibold text-primary">
                  {authors?.baitu?.name || 'Baitu'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed pl-8 whitespace-pre-wrap">
                {card.baituDesc}
              </p>
            </div>
          )}

          {/* EN Desc */}
          {((isZh && (card.enDesc_trans2zh || card.enDesc)) || (!isZh && card.enDesc)) && (
            <div className="group">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {authors?.en?.avatar && (
                    <img
                      src={authors.en.avatar}
                      alt={authors.en.name}
                      className="w-6 h-6 rounded-full ring-2 ring-white shadow-sm"
                    />
                  )}
                  <span className="text-sm font-semibold text-primary">
                    {authors?.en?.name || 'EN'}
                  </span>
                </div>
                {showSwitch && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {showTranslation ? t('card.showTranslation') : t('card.showOriginal')}
                    </span>
                    <Switch
                      checked={showTranslation}
                      onCheckedChange={setShowTranslation}
                      aria-label={
                        showTranslation ? t('card.showOriginal') : t('card.showTranslation')
                      }
                    />
                  </div>
                )}
              </div>
              {card.enDesc && (
                <p className="text-sm text-muted-foreground leading-relaxed pl-8 whitespace-pre-wrap">
                  {isZh && showSwitch && showTranslation && card.enDesc_trans2zh
                    ? card.enDesc_trans2zh
                    : card.enDesc || ''}
                </p>
              )}
            </div>
          )}

          {/* Chen Desc */}
          {card.chenDesc && card.chenDesc.trim() !== '' && (
            <div className="group">
              <div className="flex items-center gap-2 mb-2">
                {authors?.chen?.avatar && (
                  <img
                    src={authors.chen.avatar}
                    alt={authors.chen.name}
                    className="w-6 h-6 rounded-full ring-2 ring-white shadow-sm"
                  />
                )}
                <span className="text-sm font-semibold text-primary">
                  {authors?.chen?.name || 'Chen'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed pl-8 whitespace-pre-wrap">
                {card.chenDesc}
              </p>
            </div>
          )}

          {/* Stats Details */}
          {statsData && (
            <div className="pt-2">
              <StatsDetails stats={statsData} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

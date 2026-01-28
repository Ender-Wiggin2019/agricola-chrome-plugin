import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import type { ICardV2, IAuthors } from '@/types/cardV2';
import { TierBadge } from '@/components/TierBadge';
import { ScoreBadge } from '@/components/ScoreBadge';
import { StatsDetails } from '@/components/StatsDetails';
import { getStatsData, getCardName, getCardDesc, getTierValue, getTierDescForCard, tierHasDesc, getTierScore } from '@/lib/cardUtils';
import { getAuthorIds, getAuthorDisplayName } from '@/lib/config';
import { useTranslation } from 'react-i18next';

interface CardResultProps {
  card: ICardV2;
  authors?: IAuthors;
  index?: number;
}

export function CardResult({ card, authors, index = 0 }: CardResultProps) {
  const statsData = getStatsData(card);
  const { t, i18n } = useTranslation();
  const isZh = i18n.language === 'zh' || i18n.language.startsWith('zh-');
  const currentLang = isZh ? 'zh' : 'en';
  const [showTranslation, setShowTranslation] = useState(true);
  const authorIds = getAuthorIds();

  const enDesc = getTierDescForCard(card, 'en', currentLang);
  const hasEnTranslation = getTierDescForCard(card, 'en', 'zh') !== getTierDescForCard(card, 'en', 'en');
  const showSwitch = isZh && hasEnTranslation && enDesc;

  return (
    <Card className="w-full animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
      <CardContent className="pt-6">
        {/* Header: No, cnName, enName */}
        <div className="flex flex-wrap items-baseline gap-3 mb-1 pb-4 border-b border-border/50">
          <span className="font-mono text-sm font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
            {card.no || 'N/A'}
          </span>
          {getCardName(card, 'zh') && (
            <span className="font-serif text-xl font-semibold text-foreground">{getCardName(card, 'zh')}</span>
          )}
          {getCardName(card, 'en') && (
            <span className="text-base text-muted-foreground italic">{getCardName(card, 'en')}</span>
          )}
        </div>

        {/* Description (card effect) */}
        {getCardDesc(card, currentLang) && (
          <div className="py-3 border-b border-border/30">
            <div className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wide mb-1.5">
              {t('card.description')}
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">{getCardDesc(card, currentLang)}</p>
          </div>
        )}

        {/* Tier badges row */}
        <div className="flex flex-wrap items-center gap-2 py-4 border-b border-border/30">
          {authorIds.map((authorId) => {
            const tierValue = getTierValue(card, authorId);
            const tierScore = getTierScore(card, authorId);

            if (!tierValue && !tierScore) return null;

            if (authorId === 'jpwiki' && tierScore) {
              return <ScoreBadge key={authorId} score={tierScore} />;
            }

            if (!tierValue) return null;

            return (
              <TierBadge
                key={authorId}
                tier={tierValue}
                authorId={authorId}
                hasDesc={false}
              />
            );
          })}
        </div>

        {/* Descriptions */}
        <div className="space-y-4 pt-4">
          {authorIds.map((authorId) => {
            const tierValue = getTierValue(card, authorId);
            const desc = getTierDescForCard(card, authorId, currentLang);

            if (!tierValue && !desc) return null;

            const authorData = authors?.[authorId];
            const authorName = authorData?.name || getAuthorDisplayName(authorId);

            return (
              <div key={authorId} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {authorData?.avatar && (
                      <img
                        src={authorData.avatar}
                        alt={authorName}
                        className="w-6 h-6 rounded-full ring-2 ring-white shadow-sm"
                      />
                    )}
                    <span className="text-sm font-semibold text-primary">
                      {authorName}
                    </span>
                  </div>
                  {authorId === 'en' && showSwitch && (
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
                <p className="text-sm text-muted-foreground leading-relaxed pl-8 whitespace-pre-wrap">
                  {authorId === 'en' && showSwitch && showTranslation
                    ? getTierDescForCard(card, 'en', 'zh')
                    : desc}
                </p>
              </div>
            );
          })}

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

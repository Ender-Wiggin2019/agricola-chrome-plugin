import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScoreBadge } from '@/components/ScoreBadge';
import { StatsDetails } from '@/components/StatsDetails';
import { TierBadge } from '@/components/TierBadge';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  getCardDesc,
  getCardName,
  getStatsData,
  getTierDesc,
  getTierScore,
  getTierValue,
} from '@/lib/cardUtils';
import {
  getAuthorDisplayName,
  getAuthorIds,
  isAuthorShownByDefault,
} from '@/lib/config';
import type { IAuthors, ICardV2 } from '@/types/cardV2';

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
  const [hiddenAuthorsShown, setHiddenAuthorsShown] = useState(false);
  const authorIds = getAuthorIds();

  const visibleAuthorIds = authorIds.filter(
    (id) => isAuthorShownByDefault(id) || hiddenAuthorsShown
  );
  const hiddenAuthorIds = authorIds.filter((id) => !isAuthorShownByDefault(id));

  const enDesc = getTierDesc(card, 'mark', currentLang);
  const hasEnTranslation = getTierDesc(card, 'mark', 'zh') !== getTierDesc(card, 'mark', 'en');
  const showSwitch = isZh && hasEnTranslation && enDesc;
  const shouldShowMore = hiddenAuthorIds.length > 0 && !hiddenAuthorsShown;

  return (
    <Card className="w-full animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
      <CardContent className="pt-6">
        {/* Header: No, cnName, enName */}
        <div className="flex flex-wrap items-baseline gap-3 mb-1 pb-4 border-b border-border/50">
          <span className="font-mono text-sm font-semibold px-2 py-0.5 rounded bg-primary/10 text-primary">
            {card.no || 'N/A'}
          </span>
          {getCardName(card, 'zh') && (
            <span className="font-serif text-xl font-semibold text-foreground">
              {getCardName(card, 'zh')}
            </span>
          )}
          {getCardName(card, 'en') && (
            <span className="text-base text-muted-foreground italic">
              {getCardName(card, 'en')}
            </span>
          )}
        </div>

        {/* Description (card effect) */}
        {getCardDesc(card, currentLang) && (
          <div className="py-3 border-b border-border/30">
            <div className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wide mb-1.5">
              {t('card.description')}
            </div>
            <p className="text-sm text-foreground/80 leading-relaxed">
              {getCardDesc(card, currentLang)}
            </p>
          </div>
        )}

        {/* Tier badges row */}
        <div className="flex flex-wrap items-center gap-2 py-4 border-b border-border/30">
          {visibleAuthorIds.map((authorId) => {
            const tierValue = getTierValue(card, authorId);
            const tierScore = getTierScore(card, authorId);

            if (!tierValue && !tierScore) return null;

            if (authorId === 'jpwiki' && tierScore) {
              return <ScoreBadge key={authorId} score={tierScore} authorId={authorId} />;
            }

            if (!tierValue) return null;

            return (
              <TierBadge key={authorId} tier={tierValue} authorId={authorId} hasDesc={false} />
            );
          })}
        </div>

        {/* Descriptions */}
        <div className="space-y-4 pt-4">
          {authorIds.map((authorId) => {
            const tierValue = getTierValue(card, authorId);
            const tierScore = getTierScore(card, authorId);
            const desc = getTierDesc(card, authorId, currentLang);

            if (!tierValue && !tierScore && !desc) return null;

            const isHiddenAuthor = !isAuthorShownByDefault(authorId);

            if (!hiddenAuthorsShown && isHiddenAuthor) return null;

            const authorData = authors?.[authorId];
            const authorName = authorData?.name || getAuthorDisplayName(authorId);

            const tierBadge = isHiddenAuthor && (tierValue || tierScore) ? (
              <span className="ml-2">
                {authorId === 'jpwiki' && tierScore ? (
                  <ScoreBadge score={tierScore} authorId={authorId} />
                ) : tierValue ? (
                  <TierBadge tier={tierValue} authorId={authorId} hasDesc={false} />
                ) : null}
              </span>
            ) : null;

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
                    <span className="text-sm font-semibold text-primary">{authorName}</span>
                    {tierBadge}
                  </div>
                  {authorId === 'mark' && showSwitch && (
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
                  {authorId === 'mark' && showSwitch && showTranslation
                    ? getTierDesc(card, 'mark', 'zh')
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

          {/* Show More Button */}
          {shouldShowMore && (
            <button
              onClick={() => setHiddenAuthorsShown(true)}
              className="w-full mt-4 px-6 py-2.5 text-sm font-medium text-primary bg-secondary/50 hover:bg-secondary rounded-lg transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              {t('card.showMore')}
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

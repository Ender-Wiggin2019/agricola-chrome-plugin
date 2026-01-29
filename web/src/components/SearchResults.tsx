import { useTranslation } from 'react-i18next';
import { CardResult } from '@/components/CardResult';
import type { IAuthors, ICardV2 } from '@/types/cardV2';

interface SearchResultsProps {
  results: ICardV2[];
  totalCount: number;
  authors?: IAuthors;
  isSearching: boolean;
  hideCount?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export function SearchResults({
  results,
  totalCount,
  authors,
  isSearching,
  hideCount = false,
  hasMore = false,
  onLoadMore,
}: SearchResultsProps) {
  const { t } = useTranslation();

  if (!isSearching) {
    return null;
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
          <svg
            className="w-8 h-8 text-muted-foreground/50"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-muted-foreground font-medium">{t('results.noCards')}</p>
        <p className="text-sm text-muted-foreground/70 mt-1">{t('results.tryDifferent')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto">
      {!hideCount && (
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted-foreground">
            {hasMore
              ? t('results.showing', { current: results.length, total: totalCount })
              : t('results.found', { count: totalCount })}
          </p>
        </div>
      )}

      {results.map((card, index) => (
        <CardResult key={card.no} card={card} authors={authors} index={index} />
      ))}

      {/* Load More Button */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center pt-4">
          <button
            onClick={onLoadMore}
            className="px-6 py-2.5 text-sm font-medium text-primary bg-secondary/50 hover:bg-secondary rounded-lg transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
            {t('results.loadMore')}
          </button>
        </div>
      )}
    </div>
  );
}

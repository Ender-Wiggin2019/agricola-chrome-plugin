import { ICard, IAuthors } from '@/types/card';
import { CardResult } from '@/components/CardResult';
import { useI18n } from '@/lib/i18n';

interface SearchResultsProps {
  results: ICard[];
  authors?: IAuthors;
  isSearching: boolean;
  hideCount?: boolean;
}

export function SearchResults({ results, authors, isSearching, hideCount = false }: SearchResultsProps) {
  const { t } = useI18n();

  if (!isSearching) {
    return null;
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted/50 mb-4">
          <svg className="w-8 h-8 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-muted-foreground font-medium">{t.noCardsFound}</p>
        <p className="text-sm text-muted-foreground/70 mt-1">{t.tryDifferentSearch}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-2xl mx-auto">
      {!hideCount && (
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-primary">{results.length}</span> {results.length === 1 ? t.foundCard : t.foundCards}
          </p>
        </div>
      )}
      {results.map((card, index) => (
        <CardResult key={card.no} card={card} authors={authors} index={index} />
      ))}
    </div>
  );
}

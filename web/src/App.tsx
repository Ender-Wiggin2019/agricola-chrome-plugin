import { useState, useCallback, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Github } from 'lucide-react';
import { SearchBox } from '@/components/SearchBox';
import { SearchResults } from '@/components/SearchResults';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import type { ICardV2, IAuthors } from '@/types/cardV2';
import { searchCards, getRandomRecommendedCards } from '@/lib/cardUtils';

interface SocialLink {
  name: string;
  url: string;
  icon: string;
}

const PAGE_SIZE = 5;

// Wheat/grain icon component
function WheatIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-label="Wheat Icon"
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
  );
}

// Icon mapping for social links
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  github: Github,
};

function App() {
  const { t } = useTranslation();
  const [cardsData, setCardsData] = useState<ICardV2[]>([]);
  const [authorsData, setAuthorsData] = useState<IAuthors | undefined>(undefined);
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [recommendedCards, setRecommendedCards] = useState<ICardV2[]>([]);
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE);

  // Load cards and authors data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);

        // Load cards.json
        const cardsResponse = await fetch('/cards.json');
        const cards = await cardsResponse.json();
        setCardsData(cards);

        // Generate random recommended cards (prioritize cards with chenTier and chenDesc)
        const recommended = getRandomRecommendedCards(cards, 3);
        setRecommendedCards(recommended);

        // Load authors.json
        try {
          const authorsResponse = await fetch('/authors.json');
          const authors = await authorsResponse.json();
          setAuthorsData(authors);
        } catch (error) {
          console.warn('Authors data not found, continuing without it:', error);
        }

        // Load socialLinks.json
        try {
          const socialLinksResponse = await fetch('/socialLinks.json');
          const socialLinks = await socialLinksResponse.json();
          setSocialLinks(socialLinks);
        } catch (error) {
          console.warn('Social links data not found, continuing without it:', error);
        }
      } catch (error) {
        console.error('Error loading cards data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Handle search - reset display count when query changes
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setDisplayCount(PAGE_SIZE);
  }, []);

  // Memoized search results (all matching results)
  const allSearchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchCards(cardsData, searchQuery);
  }, [cardsData, searchQuery]);

  // Displayed results (limited by displayCount)
  const displayedResults = useMemo(() => {
    return allSearchResults.slice(0, displayCount);
  }, [allSearchResults, displayCount]);

  const isSearching = searchQuery.trim().length > 0;
  const hasMore = displayCount < allSearchResults.length;

  // Load more results
  const handleLoadMore = useCallback(() => {
    setDisplayCount((prev) => prev + PAGE_SIZE);
  }, []);

  // Refresh recommended cards
  const refreshRecommended = useCallback(() => {
    const recommended = getRandomRecommendedCards(cardsData, 3);
    setRecommendedCards(recommended);
  }, [cardsData]);

  return (
    <div className="min-h-screen wheat-pattern">
      {/* Header */}
      <header className="border-b border-border/50 bg-gradient-to-b from-card/80 to-transparent backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          {/* Language Switcher */}
          <div className="flex justify-end mb-4">
            <LanguageSwitcher />
          </div>

          <div className="flex items-center justify-center gap-3 mb-3">
            <WheatIcon className="w-8 h-8 text-harvest" />
            <h1 className="text-4xl font-serif font-bold text-primary header-accent">
              {t('header.title')}
            </h1>
            <WheatIcon className="w-8 h-8 text-harvest scale-x-[-1]" />
          </div>
          <p className="text-center text-muted-foreground mt-6">{t('header.subtitle')}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-10">
        {isLoading ? (
          <div className="text-center py-16">
            <WheatIcon className="w-12 h-12 text-harvest mx-auto mb-4 loading-icon" />
            <p className="text-muted-foreground font-medium">{t('loading')}</p>
          </div>
        ) : (
          <>
            {/* Search Box */}
            <div className="mb-2 animate-fade-in">
              <SearchBox onSearch={handleSearch} cardsData={cardsData} />
            </div>

            {/* Card count indicator */}
            {!isSearching && (
              <div className="text-center mb-8 animate-fade-in-delay-1">
                <p className="text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">{cardsData.length}</span>{' '}
                  {t('search.cardsAvailable')}
                </p>
              </div>
            )}

            {/* Search Results or Recommended Cards */}
            <div className="animate-fade-in-delay-2">
              {isSearching ? (
                <SearchResults
                  results={displayedResults}
                  totalCount={allSearchResults.length}
                  authors={authorsData}
                  isSearching={isSearching}
                  hasMore={hasMore}
                  onLoadMore={handleLoadMore}
                />
              ) : (
                <div className="w-full max-w-2xl mx-auto">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-serif font-semibold text-primary flex items-center gap-2">
                      <span className="text-harvest">✦</span>
                      {t('results.recommended')}
                    </h2>
                    <button
                      onClick={refreshRecommended}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-secondary/50"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                      {t('results.refresh')}
                    </button>
                  </div>
                  <SearchResults
                    results={recommendedCards}
                    totalCount={recommendedCards.length}
                    authors={authorsData}
                    isSearching={true}
                    hideCount={true}
                    hasMore={false}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 mt-auto bg-gradient-to-t from-card/50 to-transparent">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center mb-4">
            <div className="flex items-center gap-1 text-harvest/60">
              <WheatIcon className="w-4 h-4" />
              <WheatIcon className="w-5 h-5" />
              <WheatIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p>
              <span className="font-medium">{t('footer.pluginCreator')}:</span> Ender
            </p>
            <p>
              <span className="font-medium">{t('footer.statistics')}:</span> Lumin
            </p>
            <p>
              <span className="font-medium">{t('footer.tierProviders')}:</span> Yuxiao_Huang,
              Chen233, Mark Hartnady
            </p>
            <p className="pt-2 text-xs opacity-75">{t('footer.specialThanks')} Henry, smile3000, 暧晖</p>
          </div>

          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              {socialLinks.map((link) => {
                const IconComponent = iconMap[link.icon.toLowerCase()];
                if (!IconComponent) return null;

                return (
                  <a
                    key={link.name}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    aria-label={link.name}
                  >
                    <IconComponent className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}

export default App;

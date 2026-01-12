import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

interface SearchBoxProps {
  onSearch: (query: string) => void;
}

export function SearchBox({ onSearch }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const { t } = useTranslation();

  const handleSearch = useCallback((value: string) => {
    setQuery(value);
    onSearch(value);
  }, [onSearch]);

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 transition-colors group-focus-within:text-primary" />
        <Input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={t('search.placeholder')}
          className="pl-12 h-14 text-base rounded-xl border-2 border-border/60 bg-card/80 backdrop-blur-sm search-input focus:border-primary/40 placeholder:text-muted-foreground/60"
        />
      </div>
      <p className="text-center text-xs text-muted-foreground/70 mt-3">
        {t('search.hint')} <span className="font-medium text-primary/70">E011</span>, <span className="font-medium text-primary/70">Field</span>, <span className="font-medium text-primary/70">Clay</span>
      </p>
    </div>
  );
}

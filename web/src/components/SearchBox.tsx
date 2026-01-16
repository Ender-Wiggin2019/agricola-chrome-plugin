import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import type { ICard } from '@/types/card';
import { searchCards } from '@/lib/cardUtils';

interface SearchBoxProps {
  onSearch: (query: string) => void;
  cardsData: ICard[];
}

export function SearchBox({ onSearch, cardsData }: SearchBoxProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<ICard[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 0 });
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 更新下拉框位置
  useEffect(() => {
    const updatePosition = () => {
      if (inputRef.current && containerRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        const containerRect = containerRef.current.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + 8, // fixed 定位相对于视口，不需要 scrollY
          left: containerRect.left, // fixed 定位相对于视口，不需要 scrollX
          width: containerRect.width,
        });
      }
    };

    if (showSuggestions) {
      updatePosition();
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [showSuggestions]);

  // 防抖搜索建议和搜索结果列表（同步）
  useEffect(() => {
    // 清除之前的定时器
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // 如果查询为空，立即清空
    if (query.trim().length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      onSearch(''); // 立即清空搜索结果
      return;
    }

    // 统一防抖延迟：300ms
    debounceTimerRef.current = setTimeout(() => {
      const results = searchCards(cardsData, query);
      const limitedResults = results.slice(0, 5);

      // 同时更新下拉建议和搜索结果列表
      setSuggestions(limitedResults);
      setShowSuggestions(limitedResults.length > 0);
      setSelectedIndex(-1);
      onSearch(query); // 同步更新搜索结果列表
    }, 300);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, cardsData, onSearch]);

  // 处理输入变化（只更新本地状态，不立即触发搜索）
  const handleInputChange = useCallback((value: string) => {
    setQuery(value);
    // 不再立即调用 onSearch，由防抖 useEffect 统一处理
  }, []);

  // 选择建议项
  const handleSelectSuggestion = useCallback(
    (card: ICard) => {
      const displayName = card.cnName || card.enName || card.no;
      setQuery(displayName);
      setShowSuggestions(false);
      onSearch(displayName);
      inputRef.current?.focus();
    },
    [onSearch]
  );

  // 处理键盘事件
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!showSuggestions || suggestions.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[selectedIndex]);
      } else if (e.key === 'Escape') {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    },
    [showSuggestions, suggestions, selectedIndex, handleSelectSuggestion]
  );

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // 获取卡片显示名称
  const getCardDisplayName = (card: ICard): string => {
    return card.cnName || card.enName || card.no || '';
  };

  return (
    <>
      <div
        ref={containerRef}
        className="sticky top-0 z-[9999] w-full max-w-2xl mx-auto pb-4 pt-2 isolate"
      >
        <div className="relative group isolate">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5 transition-colors group-focus-within:text-primary z-[10000]" />
          <Input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            placeholder={t('search.placeholder')}
            className="pl-12 h-14 text-base rounded-xl border-2 border-border/60 bg-card/80 backdrop-blur-sm search-input focus:border-primary/40 placeholder:text-muted-foreground/60 relative z-[10000]"
          />
        </div>
      </div>

      {/* 联想下拉框 - 使用 Portal 渲染到 body，完全脱离 DOM 层级限制 */}
      {showSuggestions &&
        suggestions.length > 0 &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={suggestionsRef}
            className="fixed bg-card border-2 border-border/60 rounded-xl shadow-lg backdrop-blur-sm max-h-80 overflow-y-auto"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
              width: `${dropdownPosition.width}px`,
              zIndex: 99999,
            }}
          >
            {suggestions.map((card, index) => {
              const displayName = getCardDisplayName(card);
              const isSelected = index === selectedIndex;

              return (
                <div
                  key={`${card.no}-${index}`}
                  onClick={() => handleSelectSuggestion(card)}
                  className={`
                    px-4 py-3 cursor-pointer transition-colors
                    ${
                      isSelected
                        ? 'bg-primary/20 text-primary'
                        : 'hover:bg-secondary/50 text-foreground'
                    }
                    ${index === 0 ? 'rounded-t-xl' : ''}
                    ${index === suggestions.length - 1 ? 'rounded-b-xl' : ''}
                  `}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-primary/70 text-sm">{card.no}</span>
                    <span className="flex-1 font-medium">{displayName}</span>
                    {card.enName && card.enName !== displayName && (
                      <span className="text-sm text-muted-foreground">{card.enName}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>,
          document.body
        )}
    </>
  );
}

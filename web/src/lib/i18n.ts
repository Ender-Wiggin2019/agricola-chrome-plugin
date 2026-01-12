import { createContext, useContext } from 'react';

export type TLocale = 'en' | 'zh';

// Translation keys type
export interface ITranslations {
  // Header
  appTitle: string;
  appSubtitle: string;

  // Search
  searchPlaceholder: string;
  searchHint: string;
  cardsAvailable: string;

  // Results
  recommendedCards: string;
  refresh: string;
  foundCards: string;
  foundCard: string;
  noCardsFound: string;
  tryDifferentSearch: string;

  // Stats
  statsFromLumin: string;
  pwrLabel: string;
  pwrTooltip: string;
  adpLabel: string;
  adpTooltip: string;
  aprLabel: string;
  aprTooltip: string;
  playRateLabel: string;
  playRateTooltip: string;

  // Tier labels
  baituLabel: string;
  enLabel: string;
  chenLabel: string;

  // Footer
  pluginCreator: string;
  statistics: string;
  tierProviders: string;
  specialThanks: string;

  // Loading
  loading: string;
}

// English translations
const en: ITranslations = {
  // Header
  appTitle: 'Agricola Card Search',
  appSubtitle: 'Search and explore Agricola cards with ratings and statistics',

  // Search
  searchPlaceholder: 'Search by No, CN Name, or EN Name...',
  searchHint: 'Try searching:',
  cardsAvailable: 'cards available',

  // Results
  recommendedCards: 'Recommended Cards',
  refresh: 'Refresh',
  foundCards: 'cards',
  foundCard: 'card',
  noCardsFound: 'No cards found',
  tryDifferentSearch: 'Try a different search term',

  // Stats
  statsFromLumin: 'Stats from Lumin',
  pwrLabel: 'PWR',
  pwrTooltip: 'Play Win Rate: Play Rate × Win Rate / 7',
  adpLabel: 'ADP',
  adpTooltip: 'Average Draft Position',
  aprLabel: 'APR',
  aprTooltip: 'Average Play Round',
  playRateLabel: 'Play Rate',
  playRateTooltip: 'Draw Play Rate: Rate of playing after drawing',

  // Tier labels
  baituLabel: '白兔',
  enLabel: 'EN',
  chenLabel: 'Chen',

  // Footer
  pluginCreator: 'Plugin creator',
  statistics: 'Statistics',
  tierProviders: 'Tier providers',
  specialThanks: 'Special thanks to',

  // Loading
  loading: 'Loading cards data...',
};

// Chinese translations
const zh: ITranslations = {
  // Header
  appTitle: 'Agricola 卡牌搜索',
  appSubtitle: '搜索并探索 Agricola 卡牌的评级和统计数据',

  // Search
  searchPlaceholder: '输入编号、中文名或英文名搜索...',
  searchHint: '尝试搜索：',
  cardsAvailable: '张卡牌',

  // Results
  recommendedCards: '推荐卡牌',
  refresh: '换一批',
  foundCards: '张卡牌',
  foundCard: '张卡牌',
  noCardsFound: '未找到卡牌',
  tryDifferentSearch: '试试其他搜索词',

  // Stats
  statsFromLumin: 'Lumin 统计数据',
  pwrLabel: 'PWR',
  pwrTooltip: 'Play Win Rate: 打出率 × 胜率 / 7',
  adpLabel: 'ADP',
  adpTooltip: 'Average Draft Position: 平均轮抽抓位',
  aprLabel: 'APR',
  aprTooltip: 'Average Play Round: 平均打出回合',
  playRateLabel: '打出率',
  playRateTooltip: 'Draw Play Rate: 抽到后的打出率',

  // Tier labels
  baituLabel: '白兔',
  enLabel: 'EN',
  chenLabel: 'Chen',

  // Footer
  pluginCreator: '插件作者',
  statistics: '数据统计',
  tierProviders: '评级提供',
  specialThanks: '特别感谢',

  // Loading
  loading: '正在加载卡牌数据...',
};

// All translations
const translations: Record<TLocale, ITranslations> = { en, zh };

// Get translation function
export function getTranslations(locale: TLocale): ITranslations {
  return translations[locale];
}

// Detect browser language
export function detectBrowserLocale(): TLocale {
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('zh')) {
    return 'zh';
  }
  return 'en';
}

// Context for i18n
interface II18nContext {
  locale: TLocale;
  t: ITranslations;
  setLocale: (locale: TLocale) => void;
}

export const I18nContext = createContext<II18nContext | null>(null);

// Hook to use i18n
export function useI18n(): II18nContext {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return context;
}

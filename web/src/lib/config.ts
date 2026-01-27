/**
 * Core configuration for the application
 * Centralized config for easy extension of authors, languages, and stats
 */

export type TSupportedLang = 'en' | 'zh' | 'jp';

export interface ILanguageConfig {
  code: TSupportedLang;
  name: string;
  fallbackLang?: TSupportedLang;
}

export const SUPPORTED_LANGUAGES: Record<TSupportedLang, ILanguageConfig> = {
  en: { code: 'en', name: 'English' },
  zh: { code: 'zh', name: '中文' },
  jp: { code: 'jp', name: '日本語', fallbackLang: 'en' },
};

export const DEFAULT_LANGUAGE: TSupportedLang = 'en';

export function getSupportedLanguages(): ILanguageConfig[] {
  return Object.values(SUPPORTED_LANGUAGES);
}

export function isLanguageSupported(lang: string): lang is TSupportedLang {
  return lang in SUPPORTED_LANGUAGES;
}

export function getLanguageConfig(lang: string): ILanguageConfig {
  if (isLanguageSupported(lang)) {
    return SUPPORTED_LANGUAGES[lang];
  }
  const matchedLang = Object.keys(SUPPORTED_LANGUAGES).find((key) =>
    lang.startsWith(key)
  );
  if (matchedLang) {
    return SUPPORTED_LANGUAGES[matchedLang as TSupportedLang];
  }
  return SUPPORTED_LANGUAGES[DEFAULT_LANGUAGE];
}

export function getFallbackLanguage(lang: TSupportedLang): TSupportedLang {
  const config = SUPPORTED_LANGUAGES[lang];
  return config?.fallbackLang || DEFAULT_LANGUAGE;
}

export type TStatType = 'pwr' | 'adp' | 'apr' | 'drawPlayRate';

export interface IStatConfig {
  key: TStatType;
  label: string;
  tooltip: string;
  format: 'number' | 'percent' | 'decimal';
  decimals?: number;
  hasColor?: boolean;
}

export const STAT_CONFIGS: Record<TStatType, IStatConfig> = {
  pwr: {
    key: 'pwr',
    label: 'PWR',
    tooltip: 'Play Win Rate: Play Rate × Win Rate / 7',
    format: 'decimal',
    decimals: 2,
  },
  adp: {
    key: 'adp',
    label: 'ADP',
    tooltip: 'Average Draft Position',
    format: 'decimal',
    decimals: 2,
    hasColor: true,
  },
  apr: {
    key: 'apr',
    label: 'APR',
    tooltip: 'Average Play Round',
    format: 'decimal',
    decimals: 2,
  },
  drawPlayRate: {
    key: 'drawPlayRate',
    label: 'Play Rate',
    tooltip: 'Draw Play Rate: Rate of playing after drawing',
    format: 'percent',
    decimals: 0,
    hasColor: true,
  },
};

export const SUPPORTED_STAT_TYPES: TStatType[] = Object.keys(STAT_CONFIGS) as TStatType[];

export function formatStatValue(key: TStatType, value: number): string {
  const config = STAT_CONFIGS[key];
  if (!config) return String(value);

  const decimals = config.decimals ?? 2;
  switch (config.format) {
    case 'percent':
      return `${Math.round(value * 100)}%`;
    case 'decimal':
      return value.toFixed(decimals);
    case 'number':
    default:
      return value.toFixed(decimals);
  }
}

export function getStatConfigs(): IStatConfig[] {
  return Object.values(STAT_CONFIGS);
}

export type TAuthorId = 'baitu' | 'mark' | 'chen' | 'jpwiki';

export interface ITierAuthorConfig {
  id: TAuthorId;
  name: string;
  tierFormat: 'letter' | 'tier' | 'score';
  colorRules: Array<{
    match: string | RegExp | ((value: string) => boolean);
    color: string;
  }>;
  i18nKey?: string;
  hasScore?: boolean;
  avatar?: string;
}

export const AUTHOR_CONFIGS: Record<TAuthorId, ITierAuthorConfig> = {
  baitu: {
    id: 'baitu',
    name: '白兔',
    tierFormat: 'tier',
    i18nKey: 'tier.baitu',
    colorRules: [
      { match: /^(T0|T1)$/, color: '#4caf50' },
      { match: 'T2', color: '#d4af37' },
      { match: 'T3', color: '#ff9800' },
      { match: 'T4', color: '#f44336' },
    ],
  },
  mark: {
    id: 'mark',
    name: 'Mark Hartnady',
    tierFormat: 'letter',
    i18nKey: 'tier.mark',
    colorRules: [
      { match: 'A', color: '#4caf50' },
      { match: 'B', color: '#8bc34a' },
      { match: 'C', color: '#cddc39' },
      { match: 'D', color: '#f9a825' },
      { match: 'E', color: '#ff9800' },
      { match: 'F', color: '#f44336' },
    ],
  },
  chen: {
    id: 'chen',
    name: 'Chen233',
    tierFormat: 'letter',
    i18nKey: 'tier.chen',
    colorRules: [
      { match: 'A', color: '#4caf50' },
      { match: 'B', color: '#8bc34a' },
      { match: 'C', color: '#cddc39' },
      { match: 'D', color: '#f9a825' },
      { match: 'E', color: '#ff9800' },
      { match: 'F', color: '#f44336' },
    ],
  },
  jpwiki: {
    id: 'jpwiki',
    name: 'JP',
    tierFormat: 'score',
    hasScore: true,
    i18nKey: 'tier.jpwiki',
    colorRules: [
      { match: (v) => Number(v) >= 8, color: '#4caf50' },
      { match: (v) => Number(v) >= 5, color: '#f9a825' },
      { match: () => true, color: '#f44336' },
    ],
  },
};

export function getAuthorIds(): TAuthorId[] {
  return Object.keys(AUTHOR_CONFIGS) as TAuthorId[];
}

export function getAuthorConfig(authorId: TAuthorId): ITierAuthorConfig | undefined {
  return AUTHOR_CONFIGS[authorId];
}

export function isAuthorSupported(authorId: string): boolean {
  return authorId in AUTHOR_CONFIGS;
}

export function getTierColorForAuthor(tier: string, authorId: TAuthorId): string {
  const config = getAuthorConfig(authorId);
  if (!config) return '#9e9e9e';

  if (!tier || tier === 'N/A' || tier.trim() === '') {
    return '#9e9e9e';
  }

  for (const rule of config.colorRules) {
    let matches = false;
    if (typeof rule.match === 'string') {
      matches = tier.toUpperCase() === rule.match;
    } else if (rule.match instanceof RegExp) {
      matches = rule.match.test(tier.toUpperCase());
    } else if (typeof rule.match === 'function') {
      matches = rule.match(tier);
    }

    if (matches) {
      return rule.color;
    }
  }

  return '#9e9e9e';
}

export function registerAuthorConfig(authorId: TAuthorId, config: Omit<ITierAuthorConfig, 'id'>): void {
  AUTHOR_CONFIGS[authorId] = { ...config, id: authorId };
}

export function getAuthorDisplayName(authorId: TAuthorId): string {
  const config = getAuthorConfig(authorId);
  if (config) return config.name;

  return authorId.charAt(0).toUpperCase() + authorId.slice(1);
}

export function getAuthorI18nKey(authorId: TAuthorId): string {
  const config = getAuthorConfig(authorId);
  return config?.i18nKey || `tier.${authorId}`;
}

export interface IAppConfig {
  languages: Record<TSupportedLang, ILanguageConfig>;
  stats: Record<TStatType, IStatConfig>;
  authors: Record<TAuthorId, ITierAuthorConfig>;
  defaultLanguage: TSupportedLang;
}

export const APP_CONFIG: IAppConfig = {
  languages: SUPPORTED_LANGUAGES,
  stats: STAT_CONFIGS,
  authors: AUTHOR_CONFIGS,
  defaultLanguage: DEFAULT_LANGUAGE,
};

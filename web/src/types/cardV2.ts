export interface ICardV2 {
  no: string;
  defaultLang: 'en' | 'zh' | 'jp';
  localeNames: {
    en: string;
    zh: string;
    jp?: string;
  };
  localeDescs: {
    en: string;
    zh: string;
    jp?: string;
  };
  tiers: Array<{
    author: 'baitu' | 'mark' | 'chen' | 'jpwiki' | string;
    tier: string;
    score?: number;
    desc: string;
    localeDescs: {
      en: string;
      zh: string;
      jp?: string;
    };
  }>;
  stats?: {
    default?: IStats;
    nb?: IStats;
  };
}

export interface IStats {
  pwr?: number;
  adp?: number;
  apr?: number;
  drawPlayRate?: number;
}

export interface IAuthors {
  [key: string]: {
    name: string;
    avatar: string;
  };
}

export type TTierType = 'baitu' | 'mark' | 'chen' | 'jpwiki';

/*
 * @Author: Ender-Wiggin
 * @Date: 2026-01-27 11:10:00
 * @LastEditors: Ender-Wiggin
 * @LastEditTime: 2026-01-27 16:35:52
 * @Description:
 */
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

export interface IAuthor {
  name: string;
  avatar: string;
}

export interface IAuthors {
  [key: string]: IAuthor;
}

export type TTierType = 'baitu' | 'mark' | 'chen' | 'jpwiki';

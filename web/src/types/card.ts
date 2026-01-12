export interface ICard {
  no: string;
  cnName: string;
  enName: string;
  desc?: string;
  baituTier: string;
  enTier: string;
  chenTier: string;
  baituDesc: string;
  enDesc: string;
  chenDesc: string;
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

export type TTierType = 'baitu' | 'en' | 'chen';

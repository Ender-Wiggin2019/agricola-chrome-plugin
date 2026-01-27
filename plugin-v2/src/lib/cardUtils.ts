import type { ICardV2, IStats } from "~types/cardV2"
import { getTierColorForAuthor, getAuthorIds, type TAuthorId } from "~lib/config"

interface ITier {
  author: string
  tier: string
  score?: number | null
  desc: string
  localeDescs: {
    en: string
    zh: string
    jp?: string
  }
}

function getTierByAuthor(card: ICardV2, author: TAuthorId): ITier | undefined {
  return card.tiers?.find((tier) => tier.author === author)
}

export function getCardName(card: ICardV2, lang: string = "en"): string {
  const name = card.localeNames[lang as keyof typeof card.localeNames]
  return name || card.localeNames[card.defaultLang] || ""
}

export function getCardDesc(card: ICardV2, lang: string = "en"): string {
  const desc = card.localeDescs[lang as keyof typeof card.localeDescs]
  return desc || card.localeDescs[card.defaultLang] || ""
}

export function getTierDesc(card: ICardV2, author: TAuthorId, lang: string = "en"): string {
  const tier = getTierByAuthor(card, author)
  if (!tier) return ""

  if (tier.desc && tier.desc.trim() !== "") {
    return tier.desc
  }

  const currentLangDesc = tier.localeDescs[lang as keyof typeof tier.localeDescs]
  if (currentLangDesc && currentLangDesc.trim() !== "") {
    return currentLangDesc
  }

  const defaultLangDesc = tier.localeDescs[card.defaultLang as keyof typeof tier.localeDescs]
  if (defaultLangDesc && defaultLangDesc.trim() !== "") {
    return defaultLangDesc
  }

  for (const [, desc] of Object.entries(tier.localeDescs)) {
    if (desc && desc.trim() !== "") {
      return desc
    }
  }

  return ""
}

export function getTierValue(card: ICardV2, author: TAuthorId): string {
  const tier = getTierByAuthor(card, author)
  return tier?.tier || ""
}

export function getTierScore(card: ICardV2, author: TAuthorId): number | null | undefined {
  const tier = getTierByAuthor(card, author)
  return tier?.score
}

export function tierHasDesc(card: ICardV2, author: TAuthorId): boolean {
  const tier = getTierByAuthor(card, author)
  return !!tier && !!tier.desc && tier.desc.trim() !== ""
}

export function getAvailableTiers(card: ICardV2): TAuthorId[] {
  return card.tiers?.map((tier) => tier.author as TAuthorId) || []
}

export function getTierColor(tier: string, authorId: TAuthorId): string {
  return getTierColorForAuthor(tier, authorId)
}

export function getStatsData(card: ICardV2): IStats | null {
  if (!card || !card.stats) return null

  if (card.stats.default) {
    return card.stats.default
  } else if (card.stats.nb) {
    return card.stats.nb
  }

  return null
}

export function getAdpColor(adp: number): string {
  if (adp < 2.3) {
    return "#4caf50"
  } else if (adp <= 4.5) {
    return "#f9a825"
  } else {
    return "#f44336"
  }
}

export function getDrawPlayRateColor(rate: number): string {
  if (rate > 0.9) {
    return "#4caf50"
  } else if (rate > 0.7) {
    return "#f9a825"
  } else {
    return "#f44336"
  }
}

export function getJpWikiScoreColor(score: number): string {
  if (score >= 8) {
    return "#4caf50"
  } else if (score >= 5) {
    return "#f9a825"
  } else {
    return "#f44336"
  }
}

export function searchCards(cardsData: ICardV2[], query: string, maxResults = 10): ICardV2[] {
  if (!cardsData || !query.trim()) return []

  const results: ICardV2[] = []
  const queryLower = query.toLowerCase().trim()

  for (const card of cardsData) {
    if (results.length >= maxResults) break

    if (card.no && card.no.toLowerCase().includes(queryLower)) {
      results.push(card)
      continue
    }

    const allNames = Object.values(card.localeNames).filter(Boolean).join(" ").toLowerCase()
    if (allNames.includes(queryLower)) {
      results.push(card)
    }
  }

  return results
}

export function findCard(cardsData: ICardV2[], cardContainer: HTMLElement): ICardV2 | null {
  if (!cardsData) return null

  const numberingElement = cardContainer.querySelector(".card-numbering")
  if (numberingElement) {
    const numbering = numberingElement.textContent?.trim()
    if (numbering) {
      const card = cardsData.find((c) => c.no === numbering)
      if (card) return card
    }
  }

  return null
}

export function getPrimaryTierColor(card: ICardV2): string {
  const authorIds = getAuthorIds()
  for (const authorId of authorIds) {
    const tierValue = getTierValue(card, authorId)
    if (tierValue) {
      return getTierColor(tierValue, authorId)
    }
  }
  return "#9e9e9e"
}

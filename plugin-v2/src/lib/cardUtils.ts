import type { ICard, IStats, TTierType } from "~types/card"

// Get tier color based on tier level and type
export function getTierColor(tier: string, tierType: TTierType): string {
  // Return gray for N/A or empty tier
  if (!tier || tier === "N/A" || (typeof tier === "string" && tier.trim() === "")) {
    return "#9e9e9e" // Gray
  }

  // For baituTier (T0-T4)
  if (tierType === "baitu") {
    if (tier === "T0" || tier === "T1") {
      return "#4caf50" // Green
    } else if (tier === "T2") {
      return "#d4af37" // Darker yellow/gold
    } else if (tier === "T3") {
      return "#ff9800" // Orange
    } else if (tier === "T4") {
      return "#f44336" // Red
    }
  }

  // For enTier and chenTier (A-F): green to yellow to red gradient
  if (tierType === "en" || tierType === "chen") {
    const tierUpper = String(tier).toUpperCase().trim()
    if (tierUpper === "A") {
      return "#4caf50" // Green
    } else if (tierUpper === "B") {
      return "#8bc34a" // Light green
    } else if (tierUpper === "C") {
      return "#cddc39" // Lime
    } else if (tierUpper === "D") {
      return "#f9a825" // Darker yellow
    } else if (tierUpper === "E") {
      return "#ff9800" // Orange
    } else if (tierUpper === "F") {
      return "#f44336" // Red
    }
  }

  return "#9e9e9e" // Default gray (for unknown values)
}

// Get stats data (prioritize default, fallback to nb)
export function getStatsData(card: ICard): IStats | null {
  if (!card || !card.stats) return null

  if (card.stats.default) {
    return card.stats.default
  } else if (card.stats.nb) {
    return card.stats.nb
  }

  return null
}

// Get ADP color based on value
export function getAdpColor(adp: number): string {
  if (adp < 2.3) {
    return "#4caf50" // Green
  } else if (adp <= 4.5) {
    return "#f9a825" // Darker yellow
  } else {
    return "#f44336" // Red
  }
}

// Get drawPlayRate color based on value
export function getDrawPlayRateColor(rate: number): string {
  if (rate > 0.9) {
    return "#4caf50" // Green
  } else if (rate > 0.7) {
    return "#f9a825" // Darker yellow
  } else {
    return "#f44336" // Red
  }
}

// Get JP Wiki Score color based on value (0-10 scale)
export function getJpWikiScoreColor(score: number): string {
  if (score >= 8) {
    return "#4caf50" // Green
  } else if (score >= 5) {
    return "#f9a825" // Darker yellow
  } else {
    return "#f44336" // Red
  }
}

// Search cards by query (returns all matching results, max 10)
export function searchCards(cardsData: ICard[], query: string, maxResults = 10): ICard[] {
  if (!cardsData || !query.trim()) return []

  const results: ICard[] = []
  const queryLower = query.toLowerCase().trim()

  for (const card of cardsData) {
    if (results.length >= maxResults) break

    // Search by no
    if (card.no && card.no.toLowerCase().includes(queryLower)) {
      results.push(card)
      continue
    }

    // Search by cnName
    if (card.cnName && card.cnName.toLowerCase().includes(queryLower)) {
      results.push(card)
      continue
    }

    // Search by enName
    if (card.enName && card.enName.toLowerCase().includes(queryLower)) {
      results.push(card)
      continue
    }
  }

  return results
}

// Find card by id (no field) only
export function findCard(cardsData: ICard[], cardContainer: HTMLElement): ICard | null {
  if (!cardsData) return null

  // Match by card-numbering (no field) only
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

// Get primary tier color for border
export function getPrimaryTierColor(card: ICard): string {
  if (card.baituTier && card.baituTier.trim() !== "") {
    return getTierColor(card.baituTier, "baitu")
  } else if (card.enTier && card.enTier.trim() !== "") {
    return getTierColor(card.enTier, "en")
  } else if (card.chenTier && card.chenTier.trim() !== "") {
    return getTierColor(card.chenTier, "chen")
  }
  return "#9e9e9e"
}

// Stats labels mapping
export const STATS_LABELS = {
  pwr: "PWR",
  adp: "ADP",
  apr: "APR",
  drawPlayRate: "Draw Play Rate"
}

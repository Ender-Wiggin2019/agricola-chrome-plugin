import cssText from "data-text:~style.css"
import type { PlasmoCSConfig } from "plasmo"

import type { ICard, IAuthors, TTierType } from "~types/card"
import { findCard, getStatsData, getPrimaryTierColor, getAdpColor, getTierColor } from "~lib/cardUtils"

export const config: PlasmoCSConfig = {
  matches: [
    "https://boardgamearena.com/*",
    "https://*.boardgamearena.com/*",
    "http://localhost:*/*",
    "http://127.0.0.1:*/*",
    "file:///*"
  ],
  all_frames: true
}

// This makes this a non-UI content script that runs code directly
export {}

// Global data storage
let cardsData: ICard[] = []
let authorsData: IAuthors | undefined = undefined
let isDataLoaded = false

// Load data from extension
async function loadData() {
  if (isDataLoaded) return

  try {
    const cardsUrl = chrome.runtime.getURL("cards.json")
    const cardsResponse = await fetch(cardsUrl)
    cardsData = await cardsResponse.json()
    console.log("[Agricola Tutor] Cards data loaded:", cardsData.length, "cards")

    try {
      const authorsUrl = chrome.runtime.getURL("authors.json")
      const authorsResponse = await fetch(authorsUrl)
      authorsData = await authorsResponse.json()
      console.log("[Agricola Tutor] Authors data loaded")
    } catch (err) {
      console.warn("[Agricola Tutor] Authors data not found:", err)
    }

    isDataLoaded = true
  } catch (error) {
    console.error("[Agricola Tutor] Error loading data:", error)
  }
}

// Inject CSS into page (since we're not using Plasmo's style system)
function injectStyles() {
  if (document.getElementById("ag-tutor-styles")) return

  const style = document.createElement("style")
  style.id = "ag-tutor-styles"
  style.textContent = `
    .ag-card-wrapper {
      position: relative !important;
    }

    .ag-tier-container {
      position: absolute;
      top: 0;
      left: 50%;
      transform: translate(-50%, calc(-50% + 4px));
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
      flex-wrap: nowrap;
      padding: 4px 8px;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(245, 245, 220, 0.8) 100%);
      backdrop-filter: blur(6px);
      border-radius: 10px;
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(255, 255, 255, 0.5) inset;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .ag-tier-container::after {
      content: '';
      position: absolute;
      bottom: -10px;
      left: 0;
      right: 0;
      height: 10px;
      background: transparent;
    }

    .ag-tier-container:hover {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(245, 245, 220, 0.9) 100%);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.6) inset;
      transform: translate(-50%, calc(-50% + 4px)) translateY(-2px);
    }

    .ag-tier-badges {
      display: flex;
      align-items: center;
      gap: 4px;
      flex: 1;
    }

    .ag-tier-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 26px;
      height: 26px;
      padding: 0 8px;
      border-radius: 13px;
      font-size: 13px;
      font-weight: bold;
      color: white;
      text-shadow: 0 1px 1px rgba(0,0,0,0.15);
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .ag-tier-badge:hover {
      transform: scale(1.05);
    }

    .ag-stats-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      font-size: 12px;
      font-weight: bold;
      color: white;
      cursor: pointer;
      transition: transform 0.15s ease;
      margin-left: auto;
      flex-shrink: 0;
    }

    .ag-stats-badge:hover {
      transform: scale(1.1);
    }

    .ag-tier-badge-plus {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-left: 4px;
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.25);
      border: 1px solid rgba(255, 255, 255, 0.4);
      font-size: 10px;
      font-weight: bold;
      line-height: 1;
      opacity: 0.9;
      transition: all 0.15s ease;
      cursor: pointer;
      flex-shrink: 0;
    }

    .ag-tier-badge:hover .ag-tier-badge-plus {
      background: rgba(255, 255, 255, 0.35);
      border-color: rgba(255, 255, 255, 0.6);
      opacity: 1;
      transform: scale(1.1);
    }

    .ag-card-enhanced {
      transition: border-color 0.3s ease;
    }
  `
  document.head.appendChild(style)
}

// Create tier badge element
function createTierBadge(tier: string, desc: string | undefined, tierType: TTierType): HTMLElement | null {
  if (!tier || tier.trim() === "") return null

  const color = getTierColor(tier, tierType)
  const hasDesc = desc && desc.trim() !== ""

  const badge = document.createElement("div")
  badge.className = "ag-tier-badge"
  badge.style.backgroundColor = color
  badge.style.boxShadow = `0 2px 4px ${color}40`

  // Show tier value
  const tierText = document.createTextNode(tier)
  badge.appendChild(tierText)

  // Add expand button if has description
  if (hasDesc) {
    const expandButton = document.createElement("span")
    expandButton.className = "ag-tier-badge-plus"
    expandButton.textContent = "+"
    expandButton.setAttribute("aria-label", "Expand description")
    badge.appendChild(expandButton)
  }

  return badge
}

// Create stats badge element
function createStatsBadge(stats: { pwr?: number; adp?: number; apr?: number; drawPlayRate?: number }): HTMLElement | null {
  if (stats.adp === undefined) return null

  const color = getAdpColor(stats.adp)

  const badge = document.createElement("div")
  badge.className = "ag-stats-badge"
  badge.style.backgroundColor = color
  badge.style.boxShadow = `0 2px 6px ${color}50`
  badge.textContent = stats.adp.toFixed(1)

  return badge
}

// Process a single card element
function processCard(cardElement: HTMLElement) {
  if (cardElement.dataset.agProcessed === "true") return
  if (!isDataLoaded || cardsData.length === 0) return

  const card = findCard(cardsData, cardElement)
  if (!card) {
    cardElement.dataset.agProcessed = "true"
    return
  }

  // Mark as processed
  cardElement.dataset.agProcessed = "true"

  // Add border styling
  const primaryColor = getPrimaryTierColor(card)
  cardElement.classList.add("ag-card-enhanced")
  cardElement.style.border = `2px solid ${primaryColor}`
  cardElement.style.borderRadius = "8px"

  // Create tier container
  const tierContainer = document.createElement("div")
  tierContainer.className = "ag-tier-container"
  tierContainer.dataset.cardId = card.no || ""

  // Add click handler to open search modal with this card
  tierContainer.addEventListener("click", (e) => {
    e.stopPropagation()
    const cardId = card.no || card.enName || card.cnName || ""
    console.log(`[Agricola Tutor] Card overlay clicked: ${cardId}`)
    // Dispatch custom event for content.tsx to handle
    window.dispatchEvent(new CustomEvent("ag-open-card-search", {
      detail: { cardId, card }
    }))
  })

  // Create badges container for tier badges
  const badgesContainer = document.createElement("div")
  badgesContainer.className = "ag-tier-badges"

  // Add tier badges to badges container
  const baituBadge = createTierBadge(card.baituTier, card.baituDesc, "baitu")
  const enBadge = createTierBadge(card.enTier, card.enDesc, "en")
  const chenBadge = createTierBadge(card.chenTier, card.chenDesc, "chen")

  if (baituBadge) badgesContainer.appendChild(baituBadge)
  if (enBadge) badgesContainer.appendChild(enBadge)
  if (chenBadge) badgesContainer.appendChild(chenBadge)

  // Add badges container to tier container
  if (badgesContainer.children.length > 0) {
    tierContainer.appendChild(badgesContainer)
  }

  // Add stats badge directly to tier container (will be on the right due to CSS)
  const statsData = getStatsData(card)
  if (statsData) {
    const statsBadge = createStatsBadge(statsData)
    if (statsBadge) tierContainer.appendChild(statsBadge)
  }

  // Only insert if has any badges (tier badges or stats badge)
  const hasBadges = tierContainer.children.length > 0
  if (hasBadges) {
    // Create wrapper for positioning
    const parent = cardElement.parentElement
    if (parent && !parent.classList.contains("ag-card-wrapper")) {
      const wrapper = document.createElement("div")
      wrapper.className = "ag-card-wrapper"
      parent.insertBefore(wrapper, cardElement)
      wrapper.appendChild(cardElement)
      wrapper.appendChild(tierContainer)
    } else if (parent?.classList.contains("ag-card-wrapper")) {
      // Wrapper already exists, just add tier container
      parent.appendChild(tierContainer)
    }
  }

  console.log(`[Agricola Tutor] Processed card: ${card.no} - ${card.cnName || card.enName}`)
}

// Process all cards on page
function processAllCards() {
  const cardElements = document.querySelectorAll<HTMLElement>(".player-card-inner:not([data-ag-processed='true'])")
  cardElements.forEach(processCard)
}

// Check if URL matches the required pattern for non-local URLs
function shouldRunOnCurrentPage(): boolean {
  const url = window.location.href
  const hostname = window.location.hostname

  // Always allow localhost, 127.0.0.1, and file:// URLs
  if (hostname === "localhost" || hostname === "127.0.0.1" || url.startsWith("file://")) {
    return true
  }

  // For boardgamearena.com, check if URL matches pattern: boardgamearena.com/{any}/agricola{any}
  if (hostname === "boardgamearena.com" || hostname.endsWith(".boardgamearena.com")) {
    const pathMatch = window.location.pathname.match(/\/[^\/]+\/agricola/i)
    return pathMatch !== null
  }

  return false
}

// Initialize
async function init() {
  console.log("[Agricola Tutor] Initializing card overlay...")

  // Check if we should run on this page
  if (!shouldRunOnCurrentPage()) {
    console.log("[Agricola Tutor] Skipping initialization - URL does not match required pattern")
    return
  }

  injectStyles()
  await loadData()

  if (!isDataLoaded) {
    console.error("[Agricola Tutor] Failed to load data, retrying in 2 seconds...")
    setTimeout(init, 2000)
    return
  }

  // Process existing cards
  processAllCards()

  // Watch for new cards
  const observer = new MutationObserver((mutations) => {
    let shouldProcess = false

    for (const mutation of mutations) {
      if (mutation.addedNodes.length > 0) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (node.nodeType === 1) {
            const el = node as HTMLElement
            if (el.classList?.contains("player-card-inner")) {
              shouldProcess = true
              break
            }
            if (el.querySelector?.(".player-card-inner")) {
              shouldProcess = true
              break
            }
          }
        }
      }
      if (shouldProcess) break
    }

    if (shouldProcess) {
      // Debounce processing
      setTimeout(processAllCards, 100)
    }
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true
  })

  console.log("[Agricola Tutor] Card overlay initialized successfully!")
}

// Start when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init)
} else {
  init()
}

import cssText from "data-text:~style.css"
import type { PlasmoCSConfig, PlasmoGetStyle } from "plasmo"
import { createRoot } from "react-dom/client"
import { useEffect, useState } from "react"

import type { ICard, IAuthors } from "~types/card"
import { findCard, getStatsData, getPrimaryTierColor } from "~lib/cardUtils"
import { TierBadge } from "~components/TierBadge"
import { StatsBadge } from "~components/StatsBadge"

export const config: PlasmoCSConfig = {
  matches: [
    "https://boardgamearena.com/*",
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
    .ag-tier-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      flex-wrap: wrap;
      padding: 6px 8px;
      margin-bottom: 4px;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(4px);
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .ag-tier-badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 11px;
      font-weight: bold;
      color: white;
      text-shadow: 0 1px 1px rgba(0,0,0,0.15);
      cursor: pointer;
      transition: transform 0.15s ease, box-shadow 0.15s ease;
    }

    .ag-tier-badge:hover {
      transform: scale(1.05);
    }

    .ag-tier-badge .ag-tier-label {
      opacity: 0.75;
      font-size: 9px;
      margin-right: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .ag-tier-badge .ag-desc-indicator {
      margin-left: 3px;
      font-size: 10px;
      opacity: 0.8;
    }

    .ag-stats-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      font-size: 10px;
      font-weight: bold;
      color: white;
      cursor: pointer;
      transition: transform 0.15s ease;
    }

    .ag-stats-badge:hover {
      transform: scale(1.1);
    }

    .ag-tooltip {
      position: fixed;
      z-index: 999999;
      max-width: 320px;
      padding: 12px 16px;
      background: white;
      border-radius: 10px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(0, 0, 0, 0.05);
      font-size: 13px;
      line-height: 1.5;
      animation: ag-fade-in 0.2s ease;
    }

    .ag-tooltip-author {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;
      padding-bottom: 8px;
      border-bottom: 1px solid #eee;
    }

    .ag-tooltip-avatar {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }

    .ag-tooltip-name {
      font-weight: 600;
      color: #2d5a27;
    }

    .ag-tooltip-content {
      color: #555;
      white-space: pre-wrap;
    }

    .ag-stats-tooltip {
      min-width: 180px;
    }

    .ag-stats-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 1px solid #eee;
    }

    .ag-stats-icon {
      color: #2d5a27;
      opacity: 0.7;
    }

    .ag-stats-title {
      font-size: 11px;
      font-weight: 600;
      color: #2d5a27;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .ag-stats-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }

    .ag-stats-item {
      text-align: center;
    }

    .ag-stats-label {
      font-size: 10px;
      color: #888;
      text-transform: uppercase;
      margin-bottom: 2px;
    }

    .ag-stats-value {
      font-size: 14px;
      font-weight: bold;
      color: #333;
    }

    .ag-card-enhanced {
      transition: border-color 0.3s ease;
    }

    @keyframes ag-fade-in {
      from {
        opacity: 0;
        transform: translateY(4px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
  `
  document.head.appendChild(style)
}

// Tier color helpers (same as cardUtils)
function getTierColor(tier: string, tierType: string): string {
  if (!tier || tier === "N/A" || tier.trim() === "") return "#9e9e9e"

  if (tierType === "baitu") {
    if (tier === "T0" || tier === "T1") return "#4caf50"
    if (tier === "T2") return "#d4af37"
    if (tier === "T3") return "#ff9800"
    if (tier === "T4") return "#f44336"
  }

  if (tierType === "en" || tierType === "chen") {
    const t = tier.toUpperCase().trim()
    if (t === "A") return "#4caf50"
    if (t === "B") return "#8bc34a"
    if (t === "C") return "#cddc39"
    if (t === "D") return "#f9a825"
    if (t === "E") return "#ff9800"
    if (t === "F") return "#f44336"
  }

  return "#9e9e9e"
}

function getAdpColor(adp: number): string {
  if (adp < 2) return "#4caf50"
  if (adp <= 4.5) return "#f9a825"
  return "#f44336"
}

// Tooltip management
let currentTooltip: HTMLElement | null = null
let tooltipTimeout: ReturnType<typeof setTimeout> | null = null

function showTooltip(content: string, author: { name: string; avatar?: string } | undefined, anchorRect: DOMRect, tierColor: string) {
  hideTooltip()

  const tooltip = document.createElement("div")
  tooltip.className = "ag-tooltip"
  tooltip.style.borderTop = `3px solid ${tierColor}`

  let html = ""
  if (author) {
    html += `<div class="ag-tooltip-author">`
    if (author.avatar) {
      html += `<img class="ag-tooltip-avatar" src="${author.avatar}" alt="${author.name}">`
    }
    html += `<span class="ag-tooltip-name">${author.name}</span>`
    html += `</div>`
  }
  html += `<div class="ag-tooltip-content">${content.replace(/\n/g, "<br>")}</div>`
  tooltip.innerHTML = html

  document.body.appendChild(tooltip)
  currentTooltip = tooltip

  // Position tooltip
  const tooltipRect = tooltip.getBoundingClientRect()
  let top = anchorRect.bottom + 8
  let left = anchorRect.left + anchorRect.width / 2 - tooltipRect.width / 2

  // Adjust if off-screen
  if (left < 8) left = 8
  if (left + tooltipRect.width > window.innerWidth - 8) {
    left = window.innerWidth - tooltipRect.width - 8
  }
  if (top + tooltipRect.height > window.innerHeight - 8) {
    top = anchorRect.top - tooltipRect.height - 8
  }

  tooltip.style.top = `${top}px`
  tooltip.style.left = `${left}px`

  // Keep tooltip visible when hovering it
  tooltip.addEventListener("mouseenter", () => {
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout)
      tooltipTimeout = null
    }
  })

  tooltip.addEventListener("mouseleave", hideTooltip)
}

function hideTooltip() {
  if (tooltipTimeout) {
    clearTimeout(tooltipTimeout)
    tooltipTimeout = null
  }
  if (currentTooltip) {
    currentTooltip.remove()
    currentTooltip = null
  }
}

// Create tier badge element
function createTierBadge(tier: string, desc: string | undefined, tierType: string, author?: { name: string; avatar?: string }): HTMLElement | null {
  if (!tier || tier.trim() === "") return null

  const color = getTierColor(tier, tierType)
  const hasDesc = desc && desc.trim() !== ""

  const badge = document.createElement("div")
  badge.className = "ag-tier-badge"
  badge.style.backgroundColor = color
  badge.style.boxShadow = `0 2px 4px ${color}40`

  // Get localized tier labels
  const getTierLabel = (type: string): string => {
    try {
      const msg = chrome.i18n.getMessage(`tier_${type}`)
      return msg || type
    } catch {
      return type
    }
  }
  const label = getTierLabel(tierType)

  badge.innerHTML = `
    <span class="ag-tier-label">${label}</span>
    ${tier}
    ${hasDesc ? '<span class="ag-desc-indicator">+</span>' : ""}
  `

  if (hasDesc) {
    badge.addEventListener("mouseenter", (e) => {
      const rect = badge.getBoundingClientRect()
      tooltipTimeout = setTimeout(() => {
        showTooltip(desc!, author, rect, color)
      }, 200)
    })

    badge.addEventListener("mouseleave", () => {
      tooltipTimeout = setTimeout(hideTooltip, 150)
    })
  }

  return badge
}

// Get draw play rate color
function getDrawPlayRateColor(rate: number): string {
  if (rate > 0.9) return "#4caf50"
  if (rate > 0.7) return "#f9a825"
  return "#f44336"
}

// Show stats tooltip
function showStatsTooltip(stats: { pwr?: number; adp?: number; apr?: number; drawPlayRate?: number }, anchorRect: DOMRect) {
  hideTooltip()

  const tooltip = document.createElement("div")
  tooltip.className = "ag-tooltip ag-stats-tooltip"
  tooltip.style.borderTop = "3px solid #2d5a27"

  const adpColor = stats.adp !== undefined ? getAdpColor(stats.adp) : "#666"
  const drawPlayRateColor = stats.drawPlayRate !== undefined ? getDrawPlayRateColor(stats.drawPlayRate) : "#666"
  const drawPlayRatePercent = stats.drawPlayRate !== undefined ? Math.round(stats.drawPlayRate * 100) : null

  // Get localized stats labels
  const getStatsLabel = (key: string, fallback: string): string => {
    try {
      const msg = chrome.i18n.getMessage(`stats_${key}`)
      return msg || fallback
    } catch {
      return fallback
    }
  }

  const statsTitle = getStatsLabel("title", "Stats from Lumin")
  const pwrLabel = getStatsLabel("pwr", "PWR")
  const adpLabel = getStatsLabel("adp", "ADP")
  const aprLabel = getStatsLabel("apr", "APR")
  const playRateLabel = getStatsLabel("playRate", "Play Rate")

  let html = `
    <div class="ag-stats-header">
      <svg class="ag-stats-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
      </svg>
      <span class="ag-stats-title">${statsTitle}</span>
    </div>
    <div class="ag-stats-grid">
  `

  if (stats.pwr !== undefined) {
    html += `
      <div class="ag-stats-item">
        <div class="ag-stats-label">${pwrLabel}</div>
        <div class="ag-stats-value">${stats.pwr.toFixed(2)}</div>
      </div>
    `
  }

  if (stats.adp !== undefined) {
    html += `
      <div class="ag-stats-item">
        <div class="ag-stats-label">${adpLabel}</div>
        <div class="ag-stats-value" style="color: ${adpColor}">${stats.adp.toFixed(2)}</div>
      </div>
    `
  }

  if (stats.apr !== undefined) {
    html += `
      <div class="ag-stats-item">
        <div class="ag-stats-label">${aprLabel}</div>
        <div class="ag-stats-value">${stats.apr.toFixed(2)}</div>
      </div>
    `
  }

  if (drawPlayRatePercent !== null) {
    html += `
      <div class="ag-stats-item">
        <div class="ag-stats-label">${playRateLabel}</div>
        <div class="ag-stats-value" style="color: ${drawPlayRateColor}">${drawPlayRatePercent}%</div>
      </div>
    `
  }

  html += `</div>`
  tooltip.innerHTML = html

  document.body.appendChild(tooltip)
  currentTooltip = tooltip

  // Position tooltip
  const tooltipRect = tooltip.getBoundingClientRect()
  let top = anchorRect.bottom + 8
  let left = anchorRect.left + anchorRect.width / 2 - tooltipRect.width / 2

  // Adjust if off-screen
  if (left < 8) left = 8
  if (left + tooltipRect.width > window.innerWidth - 8) {
    left = window.innerWidth - tooltipRect.width - 8
  }
  if (top + tooltipRect.height > window.innerHeight - 8) {
    top = anchorRect.top - tooltipRect.height - 8
  }

  tooltip.style.top = `${top}px`
  tooltip.style.left = `${left}px`

  // Keep tooltip visible when hovering it
  tooltip.addEventListener("mouseenter", () => {
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout)
      tooltipTimeout = null
    }
  })

  tooltip.addEventListener("mouseleave", hideTooltip)
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

  // Add hover tooltip
  badge.addEventListener("mouseenter", () => {
    const rect = badge.getBoundingClientRect()
    tooltipTimeout = setTimeout(() => {
      showStatsTooltip(stats, rect)
    }, 200)
  })

  badge.addEventListener("mouseleave", () => {
    tooltipTimeout = setTimeout(hideTooltip, 150)
  })

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

  // Add tier badges
  const baituBadge = createTierBadge(card.baituTier, card.baituDesc, "baitu", authorsData?.baitu)
  const enBadge = createTierBadge(card.enTier, card.enDesc, "en", authorsData?.en)
  const chenBadge = createTierBadge(card.chenTier, card.chenDesc, "chen", authorsData?.chen)

  if (baituBadge) tierContainer.appendChild(baituBadge)
  if (enBadge) tierContainer.appendChild(enBadge)
  if (chenBadge) tierContainer.appendChild(chenBadge)

  // Add stats badge
  const statsData = getStatsData(card)
  if (statsData) {
    const statsBadge = createStatsBadge(statsData)
    if (statsBadge) tierContainer.appendChild(statsBadge)
  }

  // Only insert if has badges
  if (tierContainer.children.length > 0) {
    // Insert before the card element
    const parent = cardElement.parentElement
    if (parent && !parent.classList.contains("ag-card-wrapper")) {
      const wrapper = document.createElement("div")
      wrapper.className = "ag-card-wrapper"
      wrapper.style.position = "relative"
      parent.insertBefore(wrapper, cardElement)
      wrapper.appendChild(tierContainer)
      wrapper.appendChild(cardElement)
    } else if (parent?.classList.contains("ag-card-wrapper")) {
      parent.insertBefore(tierContainer, parent.firstChild)
    }
  }

  console.log(`[Agricola Tutor] Processed card: ${card.no} - ${card.cnName || card.enName}`)
}

// Process all cards on page
function processAllCards() {
  const cardElements = document.querySelectorAll<HTMLElement>(".player-card-inner:not([data-ag-processed='true'])")
  cardElements.forEach(processCard)
}

// Initialize
async function init() {
  console.log("[Agricola Tutor] Initializing card overlay...")

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
        for (const node of mutation.addedNodes) {
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

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
    "https://*.boardgamearena.com/*",
    "http://localhost:*/*",
    "http://127.0.0.1:*/*",
    "file:///*"
  ],
  all_frames: true
}

// This makes this a non-UI content script that runs code directly
export {}

// Configuration constants
const ENABLE_TOOLTIPS = false // Set to true to enable hover tooltips on badges

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
      z-index: 1000000;
      overflow: visible;
    }

    .ag-stats-grid {
      overflow: visible;
    }

    .ag-stats-item {
      overflow: visible;
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
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 4px;
    }

    .ag-stats-info-icon {
      width: 12px;
      height: 12px;
      color: #888;
      opacity: 0.5;
      cursor: help;
      transition: opacity 0.2s ease, color 0.2s ease;
      flex-shrink: 0;
    }

    .ag-stats-info-icon:hover {
      opacity: 1;
      color: #2d5a27;
    }

    .ag-stats-label-tooltip {
      position: fixed;
      padding: 6px 10px;
      background: #333;
      color: white;
      font-size: 11px;
      white-space: nowrap;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      z-index: 1000001;
      pointer-events: none;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.2s ease, visibility 0.2s ease;
    }

    .ag-stats-label-tooltip::after {
      content: '';
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      border: 4px solid transparent;
      border-top-color: #333;
    }

    .ag-stats-label-wrapper {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .ag-stats-label-wrapper:hover .ag-stats-label-tooltip {
      opacity: 1;
      visibility: visible;
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

  // Only show tier value, no label
  badge.textContent = tier

  // Only add tooltip if enabled
  if (ENABLE_TOOLTIPS && hasDesc) {
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

  // Get tooltip texts
  const pwrTooltip = getStatsLabel("pwr_tooltip", "Play Win Rate: Play Rate × Win Rate / 7")
  const adpTooltip = getStatsLabel("adp_tooltip", "Average Draft Position")
  const aprTooltip = getStatsLabel("apr_tooltip", "Average Play Round")
  const playRateTooltip = getStatsLabel("playRate_tooltip", "Draw Play Rate: Rate of playing after drawing")

  // Helper function to escape HTML
  const escapeHtml = (text: string): string => {
    const div = document.createElement("div")
    div.textContent = text
    return div.innerHTML
  }

  // Helper function to create label with info icon
  const createLabelWithIcon = (label: string, tooltipText: string): string => {
    return `
      <div class="ag-stats-label-wrapper">
        <div class="ag-stats-label">
          <span>${escapeHtml(label)}</span>
          <svg class="ag-stats-info-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div class="ag-stats-label-tooltip">${escapeHtml(tooltipText)}</div>
      </div>
    `
  }

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
        ${createLabelWithIcon(pwrLabel, pwrTooltip)}
        <div class="ag-stats-value">${stats.pwr.toFixed(2)}</div>
      </div>
    `
  }

  if (stats.adp !== undefined) {
    html += `
      <div class="ag-stats-item">
        ${createLabelWithIcon(adpLabel, adpTooltip)}
        <div class="ag-stats-value" style="color: ${adpColor}">${stats.adp.toFixed(2)}</div>
      </div>
    `
  }

  if (stats.apr !== undefined) {
    html += `
      <div class="ag-stats-item">
        ${createLabelWithIcon(aprLabel, aprTooltip)}
        <div class="ag-stats-value">${stats.apr.toFixed(2)}</div>
      </div>
    `
  }

  if (drawPlayRatePercent !== null) {
    html += `
      <div class="ag-stats-item">
        ${createLabelWithIcon(playRateLabel, playRateTooltip)}
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

  // Setup label tooltips for info icons
  const labelWrappers = tooltip.querySelectorAll(".ag-stats-label-wrapper")
  labelWrappers.forEach((wrapper) => {
    const infoIcon = wrapper.querySelector(".ag-stats-info-icon")
    const labelTooltip = wrapper.querySelector(".ag-stats-label-tooltip") as HTMLElement

    if (infoIcon && labelTooltip) {
      const updateTooltipPosition = () => {
        const iconRect = infoIcon.getBoundingClientRect()
        const tooltipRect = labelTooltip.getBoundingClientRect()
        const left = iconRect.left + iconRect.width / 2
        const top = iconRect.top - tooltipRect.height - 8

        labelTooltip.style.left = `${left}px`
        labelTooltip.style.top = `${top}px`
        labelTooltip.style.transform = "translateX(-50%)"
      }

      infoIcon.addEventListener("mouseenter", () => {
        updateTooltipPosition()
        labelTooltip.style.opacity = "1"
        labelTooltip.style.visibility = "visible"
      })

      infoIcon.addEventListener("mouseleave", () => {
        labelTooltip.style.opacity = "0"
        labelTooltip.style.visibility = "hidden"
      })

      wrapper.addEventListener("mouseenter", () => {
        updateTooltipPosition()
        labelTooltip.style.opacity = "1"
        labelTooltip.style.visibility = "visible"
      })

      wrapper.addEventListener("mouseleave", () => {
        labelTooltip.style.opacity = "0"
        labelTooltip.style.visibility = "hidden"
      })
    }
  })

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

  // Only add tooltip if enabled
  if (ENABLE_TOOLTIPS) {
    badge.addEventListener("mouseenter", () => {
      const rect = badge.getBoundingClientRect()
      tooltipTimeout = setTimeout(() => {
        showStatsTooltip(stats, rect)
      }, 200)
    })

    badge.addEventListener("mouseleave", () => {
      tooltipTimeout = setTimeout(hideTooltip, 150)
    })
  }

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
  const baituBadge = createTierBadge(card.baituTier, card.baituDesc, "baitu", authorsData?.baitu)
  const enBadge = createTierBadge(card.enTier, card.enDesc, "en", authorsData?.en)
  const chenBadge = createTierBadge(card.chenTier, card.chenDesc, "chen", authorsData?.chen)

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

  // Only insert if has any badges
  const hasBadges = badgesContainer.children.length > 0 || tierContainer.children.length > 1
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

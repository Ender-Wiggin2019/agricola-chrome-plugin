import cssText from "data-text:~style.css"
import type { PlasmoCSConfig, PlasmoGetStyle } from "plasmo"
import { useCallback, useEffect, useState, useMemo } from "react"

import { SearchButton } from "~components/SearchButton"
import { SearchModal } from "~components/SearchModal"
import { useCardsData } from "~hooks/useCardsData"

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

/**
 * Generates a style element with adjusted CSS to work correctly within a Shadow DOM.
 */
export const getStyle: PlasmoGetStyle = () => {
  const baseFontSize = 16

  let updatedCssText = cssText.replaceAll(":root", ":host(plasmo-csui)")
  const remRegex = /([\d.]+)rem/g
  updatedCssText = updatedCssText.replace(remRegex, (match, remValue) => {
    const pixelsValue = parseFloat(remValue) * baseFontSize
    return `${pixelsValue}px`
  })

  const styleElement = document.createElement("style")
  styleElement.textContent = updatedCssText

  return styleElement
}

// Check if URL matches the required pattern for non-local URLs
function shouldRunOnCurrentPage(): boolean {
  try {
    const url = window.location.href
    const hostname = window.location.hostname
    const pathname = window.location.pathname

    // Always allow localhost, 127.0.0.1, and file:// URLs
    if (hostname === "localhost" || hostname === "127.0.0.1" || url.startsWith("file://")) {
      return true
    }

    // For boardgamearena.com, check if URL matches pattern: boardgamearena.com/{any}/agricola{any}
    if (hostname === "boardgamearena.com" || hostname.endsWith(".boardgamearena.com")) {
      const pathMatch = pathname.match(/\/[^\/]+\/agricola/i)
      return pathMatch !== null
    }

    return false
  } catch (error) {
    // If there's any error accessing window.location, default to false
    console.warn("[Agricola Tutor] Error checking URL:", error)
    return false
  }
}

// Main floating UI component
const PlasmoOverlay = () => {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [initialQuery, setInitialQuery] = useState("")
  const [shouldAutoFocus, setShouldAutoFocus] = useState(true)
  const { cardsData, authorsData, isLoading } = useCardsData()

  // Cache the URL check result to avoid re-checking on every render
  const shouldRun = useMemo(() => shouldRunOnCurrentPage(), [])

  // Check if we should run on this page
  if (!shouldRun) {
    return null
  }

  const openSearchModal = useCallback((query: string = "") => {
    console.log("[Agricola Tutor Content] Opening search modal with query:", query)
    setInitialQuery(query)
    // Don't auto focus if opening with a query (from tier badge click)
    setShouldAutoFocus(query === "")
    setIsModalOpen(true)
  }, [])

  const closeSearchModal = useCallback(() => {
    console.log("[Agricola Tutor Content] Closing search modal")
    setIsModalOpen(false)
    // Reset initial query after closing
    setTimeout(() => setInitialQuery(""), 200)
  }, [])

  // Listen for card overlay click events
  useEffect(() => {
    const handleCardSearch = (e: CustomEvent<{ cardId: string }>) => {
      console.log("[Agricola Tutor Content] Received card search event:", e.detail)
      openSearchModal(e.detail.cardId)
    }
    window.addEventListener("ag-open-card-search", handleCardSearch as EventListener)
    return () => window.removeEventListener("ag-open-card-search", handleCardSearch as EventListener)
  }, [openSearchModal])

  // Keyboard shortcut (Ctrl/Cmd + Shift + F) to open search modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "F") {
        e.preventDefault()
        if (isModalOpen) {
          closeSearchModal()
        } else {
          openSearchModal()
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isModalOpen, openSearchModal, closeSearchModal])

  return (
    <>
      <div className="plasmo-fixed plasmo-bottom-6 plasmo-right-6 plasmo-z-[999998]">
        <SearchButton onClick={() => openSearchModal()} />
      </div>
      <SearchModal
        isOpen={isModalOpen}
        onClose={closeSearchModal}
        cardsData={cardsData}
        authorsData={authorsData}
        initialQuery={initialQuery}
        autoFocus={shouldAutoFocus}
      />
    </>
  )
}

export default PlasmoOverlay

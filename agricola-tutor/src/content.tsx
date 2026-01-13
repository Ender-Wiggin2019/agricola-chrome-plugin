import cssText from "data-text:~style.css"
import type { PlasmoCSConfig, PlasmoGetStyle } from "plasmo"
import { useCallback, useEffect } from "react"

import { SearchButton } from "~components/SearchButton"

export const config: PlasmoCSConfig = {
  matches: [
    "https://boardgamearena.com/*",
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

// Main floating UI component
const PlasmoOverlay = () => {
  const openSidePanel = useCallback(() => {
    // Send message to background script to open side panel
    chrome.runtime.sendMessage({ action: "openSidePanel" })
  }, [])

  // Keyboard shortcut (Ctrl/Cmd + Shift + F) to open side panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "F") {
        e.preventDefault()
        openSidePanel()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [openSidePanel])

  return (
    <div className="plasmo-fixed plasmo-bottom-6 plasmo-right-6 plasmo-z-[999998]">
      <SearchButton onClick={openSidePanel} />
    </div>
  )
}

export default PlasmoOverlay

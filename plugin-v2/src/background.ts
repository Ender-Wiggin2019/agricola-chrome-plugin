export {}

console.log("[Agricola Tutor] Background script starting...")

// Check if sidePanel API is available
if (chrome.sidePanel) {
  console.log("[Agricola Tutor] sidePanel API is available")
} else {
  console.error("[Agricola Tutor] sidePanel API is NOT available!")
}

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[Agricola Tutor] Received message:", message)
  console.log("[Agricola Tutor] Message sender:", sender)

  if (message.action === "openSidePanel") {
    console.log(
      "[Agricola Tutor] Processing openSidePanel action from content script"
    )

    // Open the side panel for the current tab (from content script)
    const windowId = sender.tab?.windowId
    console.log(
      "[Agricola Tutor] Content script windowId:",
      windowId,
      "type:",
      typeof windowId
    )

    if (windowId !== undefined) {
      console.log(
        "[Agricola Tutor] Attempting to open side panel for windowId:",
        windowId
      )
      chrome.sidePanel
        .open({ windowId })
        .then(() => {
          console.log(
            "[Agricola Tutor] Side panel opened successfully from content script"
          )
          sendResponse({ success: true })
        })
        .catch((error) => {
          console.error(
            "[Agricola Tutor] Failed to open side panel from content script:",
            error
          )
          console.error(
            "[Agricola Tutor] Error details:",
            JSON.stringify(error, Object.getOwnPropertyNames(error))
          )
          sendResponse({ success: false, error: error.message })
        })
    } else {
      console.error("[Agricola Tutor] No windowId available from sender.tab")
      console.error("[Agricola Tutor] sender.tab:", sender.tab)
      sendResponse({ success: false, error: "No windowId" })
    }
    return true // Keep message channel open for async response
  } else if (message.action === "openSidePanelFromPopup") {
    console.log("[Agricola Tutor] Processing openSidePanelFromPopup action")

    // Open the side panel (from popup)
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      console.log("[Agricola Tutor] Active tabs query result:", tabs)

      const tab = tabs[0]
      console.log("[Agricola Tutor] Selected tab:", tab)
      console.log(
        "[Agricola Tutor] Tab windowId:",
        tab?.windowId,
        "type:",
        typeof tab?.windowId
      )
      console.log("[Agricola Tutor] Tab id:", tab?.id)
      console.log("[Agricola Tutor] Tab url:", tab?.url)

      const windowId = tab?.windowId
      if (windowId !== undefined) {
        console.log(
          "[Agricola Tutor] Attempting to open side panel for windowId:",
          windowId
        )
        try {
          await chrome.sidePanel.open({ windowId })
          console.log(
            "[Agricola Tutor] Side panel opened successfully from popup"
          )
          sendResponse({ success: true })
        } catch (error: any) {
          console.error(
            "[Agricola Tutor] Failed to open side panel from popup:",
            error
          )
          console.error("[Agricola Tutor] Error name:", error.name)
          console.error("[Agricola Tutor] Error message:", error.message)
          console.error("[Agricola Tutor] Error stack:", error.stack)
          sendResponse({ success: false, error: error.message })
        }
      } else {
        console.error(
          "[Agricola Tutor] No active tab found or windowId is undefined"
        )
        sendResponse({ success: false, error: "No active tab" })
      }
    })
    return true // Keep message channel open for async response
  } else {
    console.log("[Agricola Tutor] Unknown message action:", message.action)
  }
  return false
})

console.log("[Agricola Tutor] Background script message listener registered")
console.log("[Agricola Tutor] Background script loaded successfully")

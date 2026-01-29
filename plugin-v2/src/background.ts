export {}

// Check if sidePanel API is available
if (!chrome.sidePanel) {
  console.error("SidePanel API not available")
}

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openSidePanel") {
    // Open side panel for current tab (from content script)
    const windowId = sender.tab?.windowId

    if (windowId !== undefined) {
      chrome.sidePanel
        .open({ windowId })
        .then(() => {
          sendResponse({ success: true })
        })
        .catch((error) => {
          sendResponse({ success: false, error: error.message })
        })
    } else {
      sendResponse({ success: false, error: "No windowId" })
    }
    return true // Keep message channel open for async response
  } else if (message.action === "openSidePanelFromPopup") {
    // Open side panel (from popup)
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0]

      const windowId = tab?.windowId
      if (windowId !== undefined) {
        try {
          await chrome.sidePanel.open({ windowId })
          sendResponse({ success: true })
        } catch (error: any) {
          sendResponse({ success: false, error: error.message })
        }
      } else {
        sendResponse({ success: false, error: "No active tab" })
      }
    })
    return true // Keep message channel open for async response
  }
  return false
})

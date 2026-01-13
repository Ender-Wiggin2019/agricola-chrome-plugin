export {}

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openSidePanel") {
    // Open the side panel for the current tab (from content script)
    if (sender.tab?.windowId) {
      chrome.sidePanel.open({ windowId: sender.tab.windowId })
    }
    sendResponse({ success: true })
  } else if (message.action === "openSidePanelFromPopup") {
    // Open the side panel (from popup)
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]?.windowId) {
        chrome.sidePanel.open({ windowId: tabs[0].windowId })
      }
    })
    sendResponse({ success: true })
  }
  return true
})

console.log("[Agricola Tutor] Background script loaded")

import "./style.css"
import { t } from "~lib/i18n"

function WheatIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 21v-9" />
      <path d="M15.5 12.5c1.5-1.5 2-4 2-6-2 0-4.5.5-6 2 1.5 1.5 2 4 2 6" />
      <path d="M8.5 12.5c-1.5-1.5-2-4-2-6 2 0 4.5.5 6 2-1.5 1.5-2 4-2 6" />
      <path d="M12 12c1.5-1.5 2-4 2-6-2 0-3.5.5-5 2" />
      <path d="M12 12c-1.5-1.5-2-4-2-6 2 0 3.5.5 5 2" />
    </svg>
  )
}

async function openSidePanel() {
  console.log("[Agricola Tutor Popup] openSidePanel called")
  try {
    console.log("[Agricola Tutor Popup] Sending openSidePanelFromPopup message...")
    const response = await chrome.runtime.sendMessage({ action: "openSidePanelFromPopup" })
    console.log("[Agricola Tutor Popup] Received response:", response)
    if (response?.success) {
      console.log("[Agricola Tutor Popup] Side panel opened successfully, closing popup in 100ms")
      setTimeout(() => window.close(), 100)
    } else {
      console.error("[Agricola Tutor Popup] Side panel failed to open:", response?.error)
      // Still close popup
      setTimeout(() => window.close(), 500)
    }
  } catch (error) {
    console.error("[Agricola Tutor Popup] Exception while sending message:", error)
    // Still close popup even on error
    setTimeout(() => window.close(), 500)
  }
}

function IndexPopup() {
  return (
    <div className="plasmo-w-80 plasmo-bg-gradient-to-b plasmo-from-amber-50 plasmo-to-green-50 plasmo-p-6">
      {/* Header */}
      <div className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-gap-2 plasmo-mb-4">
        <WheatIcon className="plasmo-w-6 plasmo-h-6 plasmo-text-amber-600" />
        <h1 className="plasmo-text-xl plasmo-font-semibold plasmo-text-green-800">
          {t("extensionName")}
        </h1>
        <WheatIcon className="plasmo-w-6 plasmo-h-6 plasmo-text-amber-600 plasmo-scale-x-[-1]" />
      </div>

      {/* Open Side Panel Button */}
      <button
        onClick={openSidePanel}
        className="plasmo-w-full plasmo-py-3 plasmo-px-4 plasmo-bg-gradient-to-r plasmo-from-green-500 plasmo-to-green-600 plasmo-text-white plasmo-font-semibold plasmo-rounded-lg plasmo-shadow-md hover:plasmo-shadow-lg plasmo-transition-all hover:plasmo-from-green-600 hover:plasmo-to-green-700 plasmo-flex plasmo-items-center plasmo-justify-center plasmo-gap-2 plasmo-mb-4"
      >
        <svg className="plasmo-w-5 plasmo-h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        {t("header_title")}
      </button>

      {/* Features */}
      <div className="plasmo-bg-white/80 plasmo-rounded-lg plasmo-p-4 plasmo-mb-4 plasmo-shadow-sm">
        <h2 className="plasmo-text-sm plasmo-font-semibold plasmo-text-green-700 plasmo-mb-3">
          {t("popup_features")}
        </h2>
        <ul className="plasmo-space-y-2 plasmo-text-xs plasmo-text-gray-600">
          <li className="plasmo-flex plasmo-items-center plasmo-gap-2">
            <span className="plasmo-w-1.5 plasmo-h-1.5 plasmo-rounded-full plasmo-bg-green-500" />
            {t("popup_feature_tier")}
          </li>
          <li className="plasmo-flex plasmo-items-center plasmo-gap-2">
            <span className="plasmo-w-1.5 plasmo-h-1.5 plasmo-rounded-full plasmo-bg-green-500" />
            {t("popup_feature_stats")}
          </li>
          <li className="plasmo-flex plasmo-items-center plasmo-gap-2">
            <span className="plasmo-w-1.5 plasmo-h-1.5 plasmo-rounded-full plasmo-bg-green-500" />
            {t("popup_feature_search")}
          </li>
          <li className="plasmo-flex plasmo-items-center plasmo-gap-2">
            <span className="plasmo-w-1.5 plasmo-h-1.5 plasmo-rounded-full plasmo-bg-green-500" />
            {t("popup_feature_tooltip")}
          </li>
        </ul>
      </div>

      {/* Usage hint */}
      <div className="plasmo-bg-amber-100/50 plasmo-rounded-lg plasmo-p-3 plasmo-mb-4">
        <p className="plasmo-text-xs plasmo-text-amber-800 plasmo-text-center">
          <a
            href="https://boardgamearena.com"
            target="_blank"
            rel="noopener noreferrer"
            className="plasmo-font-semibold plasmo-underline"
          >
            Board Game Arena
          </a>{" "}
          - {t("popup_visit_bga")}
        </p>
      </div>

      {/* Credits */}
      <div className="plasmo-text-center plasmo-text-[10px] plasmo-text-gray-400 plasmo-space-y-0.5">
        <p>
          <span className="plasmo-font-medium">{t("footer_pluginCreator")}:</span> Ender
        </p>
        <p>
          <span className="plasmo-font-medium">{t("footer_statistics")}:</span> Lumin
        </p>
        <p>
          <span className="plasmo-font-medium">{t("footer_tierProviders")}:</span> Yuxiao_Huang, Chen233, Mark
          Hartnady
        </p>
        <p className="plasmo-pt-1 plasmo-opacity-75">
          {t("footer_specialThanks")} Henry, smile3000, 暧晖
        </p>
      </div>
    </div>
  )
}

export default IndexPopup

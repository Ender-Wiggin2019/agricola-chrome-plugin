import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import type { ICard, IAuthors } from "~types/card"
import { searchCards } from "~lib/cardUtils"
import { t } from "~lib/i18n"
import { CardResult } from "./CardResult"

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  cardsData: ICard[]
  authorsData?: IAuthors
  initialQuery?: string
  autoFocus?: boolean
}

export function SearchModal({ isOpen, onClose, cardsData, authorsData, initialQuery = "", autoFocus = true }: SearchModalProps) {
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const inputRef = useRef<HTMLInputElement>(null)

  // Update search query when initialQuery changes (for card overlay clicks)
  useEffect(() => {
    if (isOpen && initialQuery) {
      setSearchQuery(initialQuery)
    }
  }, [isOpen, initialQuery])

  // Focus input when modal opens (only if autoFocus is true)
  useEffect(() => {
    if (isOpen && autoFocus && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, autoFocus])

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  // Reset search when modal closes (only if no initialQuery next time)
  useEffect(() => {
    if (!isOpen) {
      // Delay reset to avoid flash when reopening with initialQuery
      setTimeout(() => {
        if (!isOpen) setSearchQuery("")
      }, 200)
    }
  }, [isOpen])

  // Search results (max 5 for performance)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return []
    return searchCards(cardsData, searchQuery, 5)
  }, [cardsData, searchQuery])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  if (!isOpen) return null

  return (
    <div
      className="plasmo-fixed plasmo-inset-0 plasmo-z-[999999] plasmo-flex plasmo-items-start plasmo-justify-center plasmo-pt-16 plasmo-px-4 plasmo-animate-modal-enter"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="plasmo-absolute plasmo-inset-0 plasmo-bg-black/40 plasmo-backdrop-blur-sm plasmo-animate-backdrop" />

      {/* Modal */}
      <div
        className="plasmo-relative plasmo-w-full plasmo-max-w-2xl plasmo-bg-white plasmo-rounded-2xl plasmo-shadow-2xl plasmo-overflow-hidden plasmo-animate-slide-down"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-px-6 plasmo-py-4 plasmo-border-b plasmo-border-gray-100 plasmo-bg-gradient-to-r plasmo-from-green-50 plasmo-to-amber-50">
          <div className="plasmo-flex plasmo-items-center plasmo-gap-2">
            <svg className="plasmo-w-5 plasmo-h-5 plasmo-text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21v-9" />
              <path d="M15.5 12.5c1.5-1.5 2-4 2-6-2 0-4.5.5-6 2 1.5 1.5 2 4 2 6" />
              <path d="M8.5 12.5c-1.5-1.5-2-4-2-6 2 0 4.5.5 6 2-1.5 1.5-2 4-2 6" />
            </svg>
            <h3 className="plasmo-text-lg plasmo-font-semibold plasmo-text-gray-800">
              {t("header_title")}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="plasmo-p-1.5 plasmo-rounded-lg plasmo-text-gray-400 hover:plasmo-text-gray-600 hover:plasmo-bg-gray-100 plasmo-transition-colors"
          >
            <svg className="plasmo-w-5 plasmo-h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Input */}
        <div className="plasmo-px-6 plasmo-py-4">
          <div className="plasmo-relative">
            <svg
              className="plasmo-absolute plasmo-left-4 plasmo-top-1/2 plasmo--translate-y-1/2 plasmo-w-5 plasmo-h-5 plasmo-text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              placeholder={t("search_placeholder")}
              className="plasmo-w-full plasmo-pl-12 plasmo-pr-4 plasmo-py-3 plasmo-text-base plasmo-border plasmo-border-gray-200 plasmo-rounded-xl plasmo-bg-gray-50 focus:plasmo-bg-white focus:plasmo-border-green-400 focus:plasmo-ring-2 focus:plasmo-ring-green-100 plasmo-outline-none plasmo-transition-all"
            />
          </div>
        </div>

        {/* Results */}
        <div className="plasmo-px-6 plasmo-pb-4 plasmo-max-h-[60vh] plasmo-overflow-y-auto">
          {searchQuery.trim() === "" ? (
            <div className="plasmo-text-center plasmo-py-8 plasmo-text-gray-400">
              <svg className="plasmo-w-12 plasmo-h-12 plasmo-mx-auto plasmo-mb-3 plasmo-opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 21v-9" />
                <path d="M15.5 12.5c1.5-1.5 2-4 2-6-2 0-4.5.5-6 2 1.5 1.5 2 4 2 6" />
                <path d="M8.5 12.5c-1.5-1.5-2-4-2-6 2 0 4.5.5 6 2-1.5 1.5-2 4-2 6" />
              </svg>
              <p>{t("results_enterTerm")}</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="plasmo-text-center plasmo-py-8 plasmo-text-gray-400">
              <p>{t("results_noCards")}</p>
            </div>
          ) : (
            <div className="plasmo-space-y-4">
              {searchResults.map((card, index) => (
                <CardResult
                  key={card.no || index}
                  card={card}
                  authors={authorsData}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="plasmo-px-6 plasmo-py-3 plasmo-border-t plasmo-border-gray-100 plasmo-bg-gray-50">
          <div className="plasmo-text-[10px] plasmo-text-gray-400 plasmo-text-center plasmo-space-y-0.5">
            <p><span className="plasmo-font-medium">{t("footer_pluginCreator")}:</span> Ender • <span className="plasmo-font-medium">{t("footer_statistics")}:</span> Lumin</p>
            <p><span className="plasmo-font-medium">{t("footer_tierProviders")}:</span> Yuxiao_Huang, Chen233, Mark Hartnady</p>
            <p className="plasmo-opacity-75">{t("footer_specialThanks")} Henry, smile3000</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Get localized message from Chrome i18n API
 * @param key - Message key (use underscore instead of dot, e.g., "header_title")
 * @param substitutions - Optional substitution strings
 * @returns Localized message string
 */
export function getMessage(
  key: string,
  substitutions?: string | string[]
): string {
  try {
    const message = chrome.i18n.getMessage(key, substitutions)
    return message || key
  } catch {
    // Fallback for when chrome.i18n is not available (e.g., in tests)
    return key
  }
}

/**
 * Get current UI language
 * @returns Language code (e.g., "en", "zh")
 */
export function getUILanguage(): string {
  try {
    return chrome.i18n.getUILanguage()
  } catch {
    return "en"
  }
}

// Shorthand alias
export const t = getMessage

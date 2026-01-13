/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{tsx,ts,html}"],
  darkMode: "media",
  prefix: "plasmo-",
  theme: {
    extend: {
      colors: {
        // Farming theme colors
        wheat: "#f5e6c8",
        soil: "#5a4a3a",
        leaf: "#68a063",
        harvest: "#d4a942",
        sky: "#b8d4e8",
        // Tier colors
        "tier-green": "#4caf50",
        "tier-gold": "#d4af37",
        "tier-orange": "#ff9800",
        "tier-red": "#f44336",
        "tier-gray": "#9e9e9e"
      },
      fontFamily: {
        serif: ["Crimson Pro", "Georgia", "serif"],
        sans: ["Source Sans 3", "system-ui", "sans-serif"]
      },
      boxShadow: {
        farming:
          "0 1px 3px rgba(45, 90, 39, 0.04), 0 4px 12px rgba(45, 90, 39, 0.06)",
        "farming-lg":
          "0 2px 6px rgba(45, 90, 39, 0.06), 0 8px 24px rgba(45, 90, 39, 0.08)"
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out forwards",
        "slide-down": "slideDown 0.25s ease-out forwards"
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-20px) scale(0.95)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" }
        }
      }
    }
  },
  plugins: []
}

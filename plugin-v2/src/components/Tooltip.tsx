import { useEffect, useRef, useState } from "react"
import type { ReactNode } from "react"

interface TooltipProps {
  content: ReactNode
  children: ReactNode
  position?: "top" | "bottom"
}

export function Tooltip({
  content,
  children,
  position = "bottom"
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [coords, setCoords] = useState({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect()
      const tooltipRect = tooltipRef.current.getBoundingClientRect()

      let top: number
      let left =
        triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2

      if (position === "top") {
        top = triggerRect.top - tooltipRect.height - 8
      } else {
        top = triggerRect.bottom + 8
      }

      // Adjust if tooltip goes off screen
      if (left < 8) left = 8
      if (left + tooltipRect.width > window.innerWidth - 8) {
        left = window.innerWidth - tooltipRect.width - 8
      }
      if (top < 8 && position === "top") {
        top = triggerRect.bottom + 8
      }
      if (
        top + tooltipRect.height > window.innerHeight - 8 &&
        position === "bottom"
      ) {
        top = triggerRect.top - tooltipRect.height - 8
      }

      setCoords({ top, left })
    }
  }, [isVisible, position])

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="plasmo-inline-flex">
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          className="plasmo-fixed plasmo-z-[999999] plasmo-bg-white plasmo-rounded-lg plasmo-shadow-xl plasmo-border plasmo-border-gray-200 plasmo-p-3 plasmo-max-w-xs plasmo-animate-fade-in"
          style={{
            top: coords.top,
            left: coords.left
          }}
          onMouseEnter={() => setIsVisible(true)}
          onMouseLeave={() => setIsVisible(false)}>
          {content}
        </div>
      )}
    </>
  )
}

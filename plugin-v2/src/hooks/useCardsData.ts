import { useEffect, useState } from "react"

import type { IAuthors, ICardV2 } from "~types/cardV2"

export function useCardsData() {
  const [cardsData, setCardsData] = useState<ICardV2[]>([])
  const [authorsData, setAuthorsData] = useState<IAuthors | undefined>(
    undefined
  )
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Load cards.json from extension
        const cardsUrl = chrome.runtime.getURL("cards.json")
        const cardsResponse = await fetch(cardsUrl)
        const cards = await cardsResponse.json()
        setCardsData(cards)
        console.log("Cards data loaded:", cards.length, "cards")

        // Load authors.json from extension
        try {
          const authorsUrl = chrome.runtime.getURL("authors.json")
          const authorsResponse = await fetch(authorsUrl)
          const authors = await authorsResponse.json()
          setAuthorsData(authors)
          console.log("Authors data loaded:", authors)
        } catch (authorsError) {
          console.warn(
            "Authors data not found, continuing without it:",
            authorsError
          )
        }
      } catch (loadError) {
        console.error("Error loading data:", loadError)
        setError("Failed to load cards data")
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  return { cardsData, authorsData, isLoading, error }
}

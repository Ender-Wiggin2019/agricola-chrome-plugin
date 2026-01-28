interface SearchButtonProps {
  onClick: () => void
}

export function SearchButton({ onClick }: SearchButtonProps) {
  return (
    <button
      onClick={onClick}
      className="plasmo-search-button plasmo-flex plasmo-items-center plasmo-justify-center plasmo-w-10 plasmo-h-10 plasmo-rounded-full plasmo-text-white"
      title="Search Agricola Cards">
      <svg
        className="plasmo-w-5 plasmo-h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    </button>
  )
}

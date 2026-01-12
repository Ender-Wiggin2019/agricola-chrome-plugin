# Agricola Card Search - Web Version

A modern, lightweight React application for searching and exploring Agricola cards with ratings and statistics.

## Features

- 🔍 Fast card search by No, Chinese Name, or English Name
- 🎨 Beautiful UI built with shadcn/ui components
- 📊 Card tier ratings (Baitu, EN, Chen) with color-coded badges
- 📈 Statistics from Lumin (PWR, ADP, APR, Draw Play Rate)
- ⚡ Optimized performance with React memoization
- 📱 Responsive design

## Tech Stack

- **Vite** - Lightning fast build tool
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first styling
- **shadcn/ui** - Beautiful, accessible components

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:

```bash
cd web
npm install
```

2. Copy card data files to the public directory:

```bash
# Copy cards.json from plugin directory
cp ../plugin/cards.json public/

# Copy authors.json from plugin directory (optional)
cp ../plugin/authors.json public/
```

### Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

Build the app:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
web/
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # shadcn/ui base components
│   │   ├── CardResult.tsx
│   │   ├── SearchBox.tsx
│   │   ├── SearchResults.tsx
│   │   ├── StatsBadge.tsx
│   │   ├── StatsDetails.tsx
│   │   └── TierBadge.tsx
│   ├── lib/              # Utility functions
│   │   ├── cardUtils.ts  # Card-related utilities
│   │   └── utils.ts      # General utilities
│   ├── types/            # TypeScript type definitions
│   │   └── card.ts
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # App entry point
│   └── index.css         # Global styles
├── public/               # Static assets
│   ├── cards.json       # Card data (copy from ../plugin/)
│   └── authors.json     # Author data (copy from ../plugin/)
└── package.json
```

## Credits

- Plugin creator: Ender
- Statistics: Lumin
- Tier and comments providers: Yuxiao_Huang, Chen233, Mark Hartnady
- Special thanks: Henry

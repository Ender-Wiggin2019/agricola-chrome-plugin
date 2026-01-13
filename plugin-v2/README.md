# Agricola Tutor

<p align="center">
  <img src="assets/icon.png" alt="Agricola Tutor" width="128" height="128">
</p>

<p align="center">
  <strong>🌾 Card tier information and statistics for Agricola on Board Game Arena</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#development">Development</a> •
  <a href="#release">Release</a> •
  <a href="#credits">Credits</a>
</p>

---

## Features

- **Card Tier Badges** - Display tier ratings from multiple experts (白兔, EN, Chen)
- **Statistics** - Show stats from Lumin's data (PWR, ADP, APR, Draw Play Rate)
- **Side Panel Search** - Search cards by number, Chinese name, or English name
- **Expert Commentary** - View expert comments on hover
- **Multi-language** - Support for English and Chinese

## Installation

### From GitHub Releases

1. Download the latest `.zip` file from [Releases](../../releases)
2. Extract the ZIP file
3. Open Chrome and go to `chrome://extensions`
4. Enable "Developer mode"
5. Click "Load unpacked" and select the extracted folder

### From Source

```bash
# Clone the repository
git clone https://github.com/your-username/agricola-chrome-plugin.git
cd agricola-chrome-plugin/agricola-tutor

# Install dependencies
pnpm install

# Build the extension
pnpm build

# Load the extension from build/chrome-mv3-prod/
```

## Development

### Prerequisites

- Node.js 18+
- pnpm

### Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

### Project Structure

```
agricola-tutor/
├── src/
│   ├── components/       # React components
│   ├── contents/         # Content scripts
│   ├── hooks/            # React hooks
│   ├── lib/              # Utility functions
│   ├── types/            # TypeScript types
│   ├── background.ts     # Background service worker
│   ├── content.tsx       # Main content script (floating button)
│   ├── popup.tsx         # Extension popup
│   ├── sidepanel.tsx     # Side panel search UI
│   └── style.css         # Tailwind CSS styles
├── assets/               # Static assets (icons, data files)
├── locales/              # i18n translation files
├── scripts/              # Build & release scripts
└── package.json
```

### Testing

1. Build the extension: `pnpm build`
2. Open the test page: `cd test && python3 -m http.server 8888`
3. Visit `http://localhost:8888`
4. Load the extension from `build/chrome-mv3-prod/`

## Release

### Release Types

| Type | Tag Format | Description |
|------|------------|-------------|
| **Stable** | `v0.1.0` | Production-ready release |
| **Beta** | `v0.1.0-beta` | Testing release, may have bugs |
| **Alpha** | `v0.1.0-alpha` | Early development, experimental |

### Creating a Release

#### Option 1: Using Release Script (Recommended)

```bash
# Stable releases
./scripts/release.sh patch stable  # 0.1.0 → 0.1.1
./scripts/release.sh minor stable  # 0.1.0 → 0.2.0
./scripts/release.sh major stable  # 0.1.0 → 1.0.0

# Beta releases
./scripts/release.sh patch beta    # → 0.1.1-beta
./scripts/release.sh 0.2.0 beta    # Specific version

# Alpha releases
./scripts/release.sh patch alpha   # → 0.1.1-alpha

# Push to trigger GitHub Actions
git push && git push --tags
```

#### Option 2: Using npm Scripts

```bash
pnpm release:patch   # Stable patch release
pnpm release:minor   # Stable minor release
pnpm release:major   # Stable major release
pnpm release:alpha   # Alpha patch release
pnpm release:beta    # Beta patch release
```

#### Option 3: Manual GitHub Actions

1. Go to **Actions** → **Release** → **Run workflow**
2. Enter the version number (e.g., `0.2.0`)
3. Select release type: `stable`, `beta`, or `alpha`
4. Click **Run workflow**

### Manual Packaging

```bash
# Build and create ZIP
pnpm build
cd build/chrome-mv3-prod
zip -r ../../agricola-tutor.zip .
```

Or use the shorthand:

```bash
pnpm zip
```

## Credits

- **Plugin creator:** Ender
- **Statistics:** Lumin
- **Tier providers:** Yuxiao_Huang, Chen233, Mark Hartnady
- **Special thanks:** Henry, smile3000

## License

MIT

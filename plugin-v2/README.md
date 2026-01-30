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
| **Stable** | `v0.2.5` | Production-ready release |
| **Beta** | `v0.2.5-beta` | Testing release, may have bugs |
| **Alpha** | `v0.2.5-alpha` | Early development, experimental |

### Creating a Release

#### Option 1: Complete Release with All Locales (Recommended)

Create a single release page with all locale packages:

```bash
# Complete release (all locales: full + en + zh + jp)
npm run release:complete

# Or specify version
bash scripts/release-complete.sh -v 0.2.5

# Prerelease versions
npm run release:alpha:complete  # Alpha with all locales
npm run release:beta:complete   # Beta with all locales
```

**Packages included:**
- `agricola-tutor-v0.2.5-full.zip` - All languages (en+zh+jp)
- `agricola-tutor-v0.2.5-en.zip` - English (en+zh), default=en
- `agricola-tutor-v0.2.5-zh.zip` - Chinese (en+zh), default=zh
- `agricola-tutor-v0.2.5-jp.zip` - Japanese (en+jp), default=jp

#### Option 2: Locale-Specific Releases

Create separate releases for each locale:

```bash
# All locales (creates 3 separate releases)
npm run release:all

# Individual locale releases
npm run release:en    # English release
npm run release:zh    # Chinese release
npm run release:jp    # Japanese release

# Or use specific versions
bash scripts/release-locale.sh -v 0.2.5 -l en
bash scripts/release-locale.sh -v 0.2.5 -l zh
bash scripts/release-locale.sh -v 0.2.5 -l jp
```

#### Option 3: Single Stable Release

Create a single release without locale filtering:

```bash
npm run release:stable

# Or specify version and type
bash scripts/local-release.sh -v 0.2.5 -t stable
```

#### Option 4: Prerelease Releases

```bash
npm run release:alpha   # Alpha release
npm run release:beta    # Beta release
```

#### Option 5: Manual Packaging

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

### Build Options

#### Local Builds (without release)

Build extension for local testing or manual upload:

```bash
# Full build (all languages)
npm run build:local:all

# English build
npm run build:local:en

# Chinese build
npm run build:local:zh

# Japanese build
npm run build:local:jp
```

**Build types:**
- `agricola-tutor-full.zip` - All languages (en+zh+jp)
- `agricola-tutor-en.zip` - English (en+zh), default=en
- `agricola-tutor-zh.zip` - Chinese (en+zh), default=zh
- `agricola-tutor-jp.zip` - Japanese (en+jp), default=jp

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
- **Special thanks:** Henry, smile3000, 暧晖

## License

MIT

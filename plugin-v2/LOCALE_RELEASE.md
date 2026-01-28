# Locale-Specific Release Guide

This guide explains how to create locale-specific releases that include only the necessary locale data, reducing package size.

## Overview

When releasing the Agricola Tutor extension, you can now create locale-specific versions:

| Locale | Included Locales | Default Language | Size Reduction |
|---------|-----------------|------------------|-----------------|
| `en`   | en + zh       | en              | ~0.3%          |
| `zh`   | en + zh       | zh              | ~0.3%          |
| `jp`   | en + jp       | jp              | ~26.8%         |

> **Note:** The `jp` version has the largest size reduction because Japanese locale data is much smaller than Chinese.

## Usage

### Quick Start

```bash
# English release (en+zh, default=en)
npm run release:en

# Chinese release (en+zh, default=zh)
npm run release:zh

# Japanese release (en+jp, default=jp)
npm run release:jp

# Create all three locale versions
npm run release:all
```

### Advanced Usage

```bash
# English release
bash scripts/release-locale.sh -v 0.2.5 -l en

# Chinese release
bash scripts/release-locale.sh -v 0.2.5 -l zh

# Japanese release
bash scripts/release-locale.sh -v 0.2.5 -l jp

# Stable release
bash scripts/release-locale.sh -v 0.2.5 -l en -t stable

# Beta release
bash scripts/release-locale.sh -v 0.2.5 -l zh -t beta

# Alpha release
bash scripts/release-locale.sh -v 0.2.5 -l jp -t alpha
```

## Parameters

| Option | Description |
|--------|-------------|
| `-v VERSION` | Version number (e.g., 0.2.5) |
| `-t TYPE` | Release type: `stable`, `beta`, `alpha` (default: `stable`) |
| `-l LOCALE` | Target locale: `en`, `zh`, `jp` (default: `en`) |
| `-s` | Skip build, use existing zip |
| `-d` | Create as draft release |
| `-h` | Show help |

## How It Works

1. **Build** the extension with `plasmo build`
2. **Filter** locale data from `cards.json` based on target locale
3. **Replace** the filtered `cards.json` in the build output
4. **Create** ZIP package
5. **Publish** to GitHub with appropriate tag and notes

### Locale Filtering Details

The `filter-locales.js` script processes each card and:

1. **Filters `localeNames`**: Keeps only specified languages
2. **Filters `localeDescs`**: Keeps only specified languages
3. **Filters `tiers[].localeDescs`**: Keeps only specified languages per tier
4. **Sets `defaultLang`**: To the specified default language

**Example for `jp` locale:**
```json
{
  "no": "A001",
  "localeNames": {
    "en": "Card Name",
    "jp": "カード名"
  },
  "localeDescs": {
    "en": "Card description"
  },
  "tiers": [
    {
      "author": "jpwiki",
      "localeDescs": {
        "en": "JP Wiki comment",
        "jp": "日本語のコメント"
      }
    }
  ],
  "defaultLang": "jp"
}
```

## Release Naming

Release tags and filenames follow this pattern:

- **Stable:** `v0.2.5-en`, `agricola-tutor-v0.2.5-en.zip`
- **Beta:** `v0.2.5-beta-en`, `agricola-tutor-v0.2.5-beta-en.zip`
- **Alpha:** `v0.2.5-alpha-en`, `agricola-tutor-v0.2.5-alpha-en.zip`

## Example Workflow

```bash
# Step 1: Update version in package.json
npm version patch

# Step 2: Create locale releases
npm run release:en
npm run release:zh
npm run release:jp

# Step 3: Verify releases
gh release list

# Step 4: View release details
gh release view v0.2.5-en
```

## Migration from Old Releases

If you were using the old `local-release.sh`, you can easily migrate:

| Old Command | New Command |
|-------------|-------------|
| `npm run release` | `npm run release:en` |
| N/A | `npm run release:zh` |
| N/A | `npm run release:jp` |

## Troubleshooting

### Build Fails

```bash
# Clean build artifacts
rm -rf build/

# Try again
npm run release:en
```

### GitHub Release Already Exists

The script will prompt you to delete and recreate existing releases:

```bash
⚠️  Tag v0.2.5-en already exists locally
Delete existing tag and recreate? [y/N] y

⚠️  Release v0.2.5-en already exists on GitHub
Delete existing release and recreate? [y/N] y
```

### Authentication Issues

```bash
# Authenticate with GitHub CLI
gh auth login

# Or install gh CLI
brew install gh  # macOS
# Visit https://cli.github.com/ for other platforms
```

## File Size Benefits

Based on current data (832 cards, ~1.5MB cards.json):

| Version | Package Size |
|---------|-------------|
| Full (all locales) | ~1.5 MB |
| en (en+zh) | ~1.5 MB |
| zh (en+zh) | ~1.5 MB |
| **jp (en+jp)** | **~1.1 MB** |

The `jp` version provides the most significant size savings because Japanese locale data is minimal compared to Chinese.

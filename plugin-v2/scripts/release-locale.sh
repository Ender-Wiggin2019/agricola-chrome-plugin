#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
VERSION=""
RELEASE_TYPE="stable"
LOCALE="en"
SKIP_BUILD=false
DRAFT=false

usage() {
    echo "Usage: $0 [-v version] [-t type] [-l locale] [-s] [-d] [-h]"
    echo ""
    echo "Options:"
    echo "  -v VERSION    Version number (e.g., 0.0.3)"
    echo "  -t TYPE       Release type: stable, beta, alpha (default: stable)"
    echo "  -l LOCALE     Target locale: en, zh, jp (default: en)"
    echo "  -s            Skip build, use existing zip"
    echo "  -d            Create as draft release"
    echo "  -h            Show this help"
    echo ""
    echo "Locale Configuration:"
    echo "  en:  Contains en+zh locales, default=en"
    echo "  zh:  Contains en+zh locales, default=zh"
    echo "  jp:  Contains en+jp locales, default=jp"
    echo ""
    echo "Examples:"
    echo "  $0 -v 0.0.3                          # English release (en+zh)"
    echo "  $0 -v 0.0.3 -l zh                    # Chinese release (en+zh)"
    echo "  $0 -v 0.0.3 -l jp                    # Japanese release (en+jp)"
    echo "  $0 -v 0.0.3 -t alpha -l jp           # Alpha JP release"
}

# Parse arguments
while getopts "v:t:l:sdh" opt; do
    case $opt in
        v) VERSION="$OPTARG" ;;
        t) RELEASE_TYPE="$OPTARG" ;;
        l) LOCALE="$OPTARG" ;;
        s) SKIP_BUILD=true ;;
        d) DRAFT=true ;;
        h) usage; exit 0 ;;
        *) usage; exit 1 ;;
    esac
done

# Validate locale
if [[ ! "$LOCALE" =~ ^(en|zh|jp)$ ]]; then
    echo -e "${RED}Error: Invalid locale '$LOCALE'. Use: en, zh, or jp${NC}"
    exit 1
fi

# Validate version
if [ -z "$VERSION" ]; then
    CURRENT_VERSION=$(node -p "require('./package.json').version")
    echo -e "${YELLOW}Current version: $CURRENT_VERSION${NC}"
    read -p "Enter new version (or press Enter to use current): " VERSION
    VERSION=${VERSION:-$CURRENT_VERSION}
fi

# Validate release type
if [[ ! "$RELEASE_TYPE" =~ ^(stable|beta|alpha)$ ]]; then
    echo -e "${RED}Error: Invalid release type '$RELEASE_TYPE'. Use: stable, beta, alpha${NC}"
    exit 1
fi

# Determine tag and filename based on locale
if [ "$RELEASE_TYPE" = "stable" ]; then
    TAG="v${VERSION}-${LOCALE}"
    FILENAME="agricola-tutor-v${VERSION}-${LOCALE}.zip"
    RELEASE_NAME="Agricola Tutor v${VERSION} (${LOCALE})"
    PRERELEASE=""
else
    TAG="v${VERSION}-${RELEASE_TYPE}-${LOCALE}"
    FILENAME="agricola-tutor-v${VERSION}-${RELEASE_TYPE}-${LOCALE}.zip"
    RELEASE_NAME="Agricola Tutor v${VERSION} (${RELEASE_TYPE}, ${LOCALE})"
    PRERELEASE="--prerelease"
fi

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo ""
echo -e "${BLUE}📦 Locale-Specific Release${NC}"
echo "  Version:      $VERSION"
echo "  Type:         $RELEASE_TYPE"
echo "  Locale:        $LOCALE"
echo "  Tag:          $TAG"
echo "  Filename:     $FILENAME"
echo ""

# Determine locale configuration
case $LOCALE in
    en)
        LOCALE_DESC="English (en+zh)"
        DEFAULT_LANG="en"
        KEEP_LOCALES="en,zh"
        ;;
    zh)
        LOCALE_DESC="Chinese (en+zh)"
        DEFAULT_LANG="zh"
        KEEP_LOCALES="en,zh"
        ;;
    jp)
        LOCALE_DESC="Japanese (en+jp)"
        DEFAULT_LANG="jp"
        KEEP_LOCALES="en,jp"
        ;;
esac

echo -e "${BLUE}Locale Configuration:${NC}"
echo "  Target:       $LOCALE_DESC"
echo "  Default lang:  $DEFAULT_LANG"
echo "  Keeping:       $KEEP_LOCALES"
echo ""

# Build if not skipping
if [ "$SKIP_BUILD" = false ]; then
    echo -e "${BLUE}🔨 Building extension...${NC}"
    pnpm build

    echo -e "${BLUE}✂️  Filtering locales...${NC}"
    node scripts/filter-locales.js $LOCALE assets/cards.json build/cards-filtered.json

    echo -e "${BLUE}🔄 Replacing cards.json...${NC}"
    cp build/cards-filtered.json build/chrome-mv3-prod/cards.json

    echo -e "${BLUE}📁 Creating ZIP package...${NC}"
    cd build/chrome-mv3-prod
    zip -r "../../$FILENAME" .
    cd ../..
else
    if [ ! -f "$FILENAME" ]; then
        echo -e "${RED}Error: $FILENAME not found. Run without -s to build first.${NC}"
        exit 1
    fi
    echo -e "${YELLOW}⏭️  Skipping build, using existing $FILENAME${NC}"
fi

# Verify the zip exists
if [ ! -f "$FILENAME" ]; then
    echo -e "${RED}Error: Failed to create $FILENAME${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Package ready: $FILENAME ($(du -h "$FILENAME" | cut -f1))${NC}"
echo ""

# Check if tag already exists
if git rev-parse "$TAG" &> /dev/null; then
    echo -e "${YELLOW}⚠️  Tag $TAG already exists locally${NC}"
    read -p "Delete existing tag and recreate? [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        git tag -d "$TAG" 2>/dev/null || true
        git push origin ":refs/tags/$TAG" 2>/dev/null || true
    else
        echo -e "${RED}Aborted.${NC}"
        exit 1
    fi
fi

# Check if release already exists
if gh release view "$TAG" &> /dev/null; then
    echo -e "${YELLOW}⚠️  Release $TAG already exists on GitHub${NC}"
    read -p "Delete existing release and recreate? [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        gh release delete "$TAG" --yes
    else
        echo -e "${RED}Aborted.${NC}"
        exit 1
    fi
fi

# Generate changelog
echo -e "${BLUE}📝 Generating changelog...${NC}"
PREV_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")

CHANGELOG="## $RELEASE_NAME"

if [ "$RELEASE_TYPE" != "stable" ]; then
    CHANGELOG+="
⚠️  This is a **${RELEASE_TYPE}** release.
"
fi

CHANGELOG+="
**Locale:** ${LOCALE_DESC}
**Default Language:** ${DEFAULT_LANG}
"

CHANGELOG+="
### Changes
"

if [ -z "$PREV_TAG" ]; then
    CHANGELOG+="- Initial release
"
    echo "  ### Features
    - Card tier badges display on BGA cards
    - Statistics from Lumin's data (PWR, ADP, APR, Play Rate)
    - Side panel search functionality
    - Expert commentary tooltips
    - Multi-language support (English/Chinese/Japanese)"
else
    CHANGELOG+="$(git log $PREV_TAG..HEAD --pretty=format:'- %s' | head -20)"
fi

CHANGELOG+="
### Credits
- **Plugin creator:** Ender
- **Statistics:** Lumin
- **Tier providers:** Yuxiao_Huang, Chen233, Mark Hartnady
- **Special thanks:** Henry, smile3000, 暧晖
"

# Show changelog preview
echo ""
echo -e "${BLUE}📋 Changelog Preview:${NC}"
echo "----------------------------------------"
echo "$CHANGELOG"
echo "----------------------------------------"
echo ""

# Confirm release
DRAFT_FLAG=""
if [ "$DRAFT" = true ]; then
    DRAFT_FLAG="--draft"
    echo -e "${YELLOW}This will be created as a DRAFT release.${NC}"
fi

read -p "Create release $TAG? [y/N] " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Aborted.${NC}"
    exit 1
fi

# Create GitHub release
echo -e "${BLUE}🚀 Creating GitHub release...${NC}"
gh release create "$TAG" "$FILENAME" \
    --title "$RELEASE_NAME" \
    --notes "$CHANGELOG" \
    $PRERELEASE \
    $DRAFT_FLAG

echo ""
echo -e "${GREEN}✅ Release created successfully!${NC}"
echo -e "   View at: $(gh release view "$TAG" --json url -q '.url')"
echo ""
echo -e "${BLUE}📌 To create other locales:${NC}"
for locale in en zh jp; do
    if [ "$locale" != "$LOCALE" ]; then
        echo -e "   $0 -v $VERSION -l $locale${NC}"
    fi
done

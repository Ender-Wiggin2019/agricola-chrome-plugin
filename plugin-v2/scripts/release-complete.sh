#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo -e "${RED}Error: GitHub CLI (gh) is not installed.${NC}"
    echo "Install it with: brew install gh"
    echo "Then authenticate with: gh auth login"
    exit 1
fi

# Check if authenticated
if ! gh auth status &> /dev/null; then
    echo -e "${RED}Error: Not authenticated with GitHub CLI.${NC}"
    echo "Run: gh auth login"
    exit 1
fi

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

# Parse arguments
VERSION=""
RELEASE_TYPE="stable"
SKIP_BUILD=false
DRAFT=false

usage() {
    echo "Usage: $0 [-v version] [-t type] [-s] [-d] [-h]"
    echo ""
    echo "Options:"
    echo "  -v VERSION    Version number (e.g., 0.2.5)"
    echo "  -t TYPE       Release type: stable, beta, alpha (default: stable)"
    echo "  -s            Skip build, use existing zips"
    echo "  -d            Create as draft release"
    echo "  -h            Show this help"
    echo ""
    echo "This script creates a single release with all locale packages:"
    echo "  - agricola-tutor-vVERSION-full.zip    (all languages)"
    echo "  - agricola-tutor-vVERSION-en.zip     (English)"
    echo "  - agricola-tutor-vVERSION-zh.zip     (Chinese)"
    echo "  - agricola-tutor-vVERSION-jp.zip     (Japanese)"
    echo ""
    echo "Examples:"
    echo "  $0 -v 0.2.5                    # Stable release (all locales)"
    echo "  $0 -v 0.2.5 -t alpha           # Alpha release (all locales)"
    echo "  $0 -v 0.2.5 -s                 # Use existing builds"
    echo "  $0 -v 0.2.5 -d                 # Create draft release"
}

while getopts "v:t:sdh" opt; do
    case $opt in
        v) VERSION="$OPTARG" ;;
        t) RELEASE_TYPE="$OPTARG" ;;
        s) SKIP_BUILD=true ;;
        d) DRAFT=true ;;
        h) usage; exit 0 ;;
        *) usage; exit 1 ;;
    esac
done

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

# Determine tag and release name
if [ "$RELEASE_TYPE" = "stable" ]; then
    TAG="v${VERSION}"
    RELEASE_NAME="Agricola Tutor v${VERSION}"
    PRERELEASE=""
else
    TAG="v${VERSION}-${RELEASE_TYPE}"
    RELEASE_NAME="Agricola Tutor v${VERSION} ($(capitalize "$RELEASE_TYPE"))"
    PRERELEASE="--prerelease"
fi

echo ""
echo -e "${BLUE}📦 Complete Release (All Locales)${NC}"
echo "  Version:      $VERSION"
echo "  Type:         $RELEASE_TYPE"
echo "  Tag:          $TAG"
echo ""

# Define all zip files
ZIP_FILES=(
    "agricola-tutor-v${VERSION}-full.zip"
    "agricola-tutor-v${VERSION}-en.zip"
    "agricola-tutor-v${VERSION}-zh.zip"
    "agricola-tutor-v${VERSION}-jp.zip"
)

# Build if not skipping
if [ "$SKIP_BUILD" = false ]; then
    echo -e "${BLUE}🔨 Building all locale packages...${NC}"
    echo ""

    # Build full version
    echo -e "${BLUE}  [1/4] Building full (all languages)...${NC}"
    bash scripts/build-local.sh

    # Build English version
    echo -e "${BLUE}  [2/4] Building English (en+zh)...${NC}"
    bash scripts/build-local.sh -l en

    # Build Chinese version
    echo -e "${BLUE}  [3/4] Building Chinese (en+zh)...${NC}"
    bash scripts/build-local.sh -l zh

    # Build Japanese version
    echo -e "${BLUE}  [4/4] Building Japanese (en+jp)...${NC}"
    bash scripts/build-local.sh -l jp

    echo ""
    echo -e "${GREEN}✅ All builds completed${NC}"
else
    echo -e "${YELLOW}⏭️  Skipping build, using existing zips${NC}"
fi

# Verify all zips exist
echo ""
echo -e "${BLUE}📦 Verifying packages...${NC}"
for zip in "${ZIP_FILES[@]}"; do
    if [ ! -f "$zip" ]; then
        echo -e "${RED}Error: $zip not found. Run without -s to build first.${NC}"
        exit 1
    fi
    SIZE=$(du -h "$zip" | cut -f1)
    echo -e "  ${GREEN}✓${NC} $zip ($SIZE)"
done

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
echo ""
echo -e "${BLUE}📝 Generating changelog...${NC}"
PREV_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")

CHANGELOG="## $RELEASE_NAME

### Packages Included
- \`agricola-tutor-v${VERSION}-full.zip\` - All languages (en+zh+jp)
- \`agricola-tutor-v${VERSION}-en.zip\` - English (en+zh), default=en
- \`agricola-tutor-v${VERSION}-zh.zip\` - Chinese (en+zh), default=zh
- \`agricola-tutor-v${VERSION}-jp.zip\` - Japanese (en+jp), default=jp

### Changes
"

if [ "$RELEASE_TYPE" != "stable" ]; then
    CHANGELOG+="
⚠️  This is a **${RELEASE_TYPE}** release.
"
fi

if [ -z "$PREV_TAG" ]; then
    CHANGELOG+="
### Features
- Card tier badges display on BGA cards
- Statistics from Lumin's data (PWR, ADP, APR, Play Rate)
- Side panel search functionality
- Expert commentary tooltips
- Multi-language support (English/Chinese/Japanese)
"
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

read -p "Create release $TAG with ${#ZIP_FILES[@]} packages? [y/N] " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Aborted.${NC}"
    exit 1
fi

# Create GitHub release with multiple assets
echo ""
echo -e "${BLUE}🚀 Creating GitHub release with all packages...${NC}"

# Build gh release command with multiple assets
GH_CMD="gh release create '$TAG'"

# Add each zip file as an asset
for zip in "${ZIP_FILES[@]}"; do
    GH_CMD="$GH_CMD '$zip'"
done

# Add release details
GH_CMD="$GH_CMD --title '$RELEASE_NAME'"
GH_CMD="$GH_CMD --notes '$CHANGELOG'"
GH_CMD="$GH_CMD $PRERELEASE $DRAFT_FLAG"

# Execute the command
eval $GH_CMD

echo ""
echo -e "${GREEN}✅ Release created successfully!${NC}"
echo -e "   View at: $(gh release view "$TAG" --json url -q '.url')"
echo ""
echo -e "${BLUE}📦 Packages uploaded:${NC}"
for zip in "${ZIP_FILES[@]}"; do
    SIZE=$(du -h "$zip" | cut -f1)
    echo -e "   ${GREEN}✓${NC} $zip ($SIZE)"
done

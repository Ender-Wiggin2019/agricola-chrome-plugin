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
    echo "  -v VERSION    Version number (e.g., 0.0.3)"
    echo "  -t TYPE       Release type: stable, beta, alpha (default: stable)"
    echo "  -s            Skip build, use existing zip"
    echo "  -d            Create as draft release"
    echo "  -h            Show this help"
    echo ""
    echo "Examples:"
    echo "  $0 -v 0.0.3                    # Stable release"
    echo "  $0 -v 0.0.3 -t alpha           # Alpha release"
    echo "  $0 -v 0.0.3 -s                 # Use existing build"
    echo "  $0 -v 0.0.3 -d                 # Create draft release"
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
    # Get version from package.json if not specified
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

# Capitalize first letter (compatible with old bash)
capitalize() {
    echo "$1" | awk '{print toupper(substr($0,1,1)) tolower(substr($0,2))}'
}

# Determine tag and filename
if [ "$RELEASE_TYPE" = "stable" ]; then
    TAG="v${VERSION}"
    FILENAME="agricola-tutor-v${VERSION}.zip"
    RELEASE_NAME="Agricola Tutor v${VERSION}"
    PRERELEASE=""
else
    TAG="v${VERSION}-${RELEASE_TYPE}"
    FILENAME="agricola-tutor-v${VERSION}-${RELEASE_TYPE}.zip"
    RELEASE_NAME="Agricola Tutor v${VERSION} ($(capitalize "$RELEASE_TYPE"))"
    PRERELEASE="--prerelease"
fi

echo ""
echo -e "${BLUE}📦 Release Configuration${NC}"
echo "  Version:      $VERSION"
echo "  Type:         $RELEASE_TYPE"
echo "  Tag:          $TAG"
echo "  Filename:     $FILENAME"
echo ""

# Build if not skipping
if [ "$SKIP_BUILD" = false ]; then
    echo -e "${BLUE}🔨 Building extension...${NC}"
    pnpm build

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

CHANGELOG="## $RELEASE_NAME

"
if [ "$RELEASE_TYPE" != "stable" ]; then
    CHANGELOG+="⚠️ This is a **${RELEASE_TYPE}** release.

"
fi

CHANGELOG+="### Changes

"
if [ -z "$PREV_TAG" ]; then
    CHANGELOG+="- Initial release

### Features
- Card tier badges display on BGA cards
- Statistics from Lumin's data (PWR, ADP, APR, Play Rate)
- Side panel search functionality
- Expert commentary tooltips
- Multi-language support (English/Chinese)
"
else
    CHANGELOG+="$(git log $PREV_TAG..HEAD --pretty=format:'- %s' | head -20)
"
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

# Create the release
echo -e "${BLUE}🚀 Creating GitHub release...${NC}"
gh release create "$TAG" "$FILENAME" \
    --title "$RELEASE_NAME" \
    --notes "$CHANGELOG" \
    $PRERELEASE \
    $DRAFT_FLAG

echo ""
echo -e "${GREEN}✅ Release created successfully!${NC}"
echo -e "   View at: $(gh release view "$TAG" --json url -q '.url')"

#!/bin/bash

# Release script for Agricola Tutor
# Usage: 
#   ./scripts/release.sh <version> [alpha|beta|stable]
#   ./scripts/release.sh patch [alpha|beta|stable]
#   ./scripts/release.sh minor [alpha|beta|stable]
#   ./scripts/release.sh major [alpha|beta|stable]

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
VERSION_ARG=${1:-patch}
RELEASE_TYPE=${2:-stable}

# Validate release type
if [[ ! "$RELEASE_TYPE" =~ ^(alpha|beta|stable)$ ]]; then
    echo -e "${RED}Invalid release type: $RELEASE_TYPE${NC}"
    echo "Usage: ./scripts/release.sh <version> [alpha|beta|stable]"
    echo ""
    echo "Examples:"
    echo "  ./scripts/release.sh patch stable    # 0.1.0 → 0.1.1"
    echo "  ./scripts/release.sh minor beta      # 0.1.0 → 0.2.0-beta"
    echo "  ./scripts/release.sh 0.2.0 alpha     # Set specific version as alpha"
    exit 1
fi

echo -e "${YELLOW}📦 Preparing $RELEASE_TYPE release...${NC}"

# Check if working directory is clean
if [[ -n $(git status --porcelain) ]]; then
    echo -e "${RED}Error: Working directory is not clean. Please commit or stash changes.${NC}"
    exit 1
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "Current version: ${BLUE}$CURRENT_VERSION${NC}"

# Determine new version
if [[ "$VERSION_ARG" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    # Explicit version provided
    NEW_VERSION="$VERSION_ARG"
else
    # Version bump type provided (patch, minor, major)
    if [[ ! "$VERSION_ARG" =~ ^(patch|minor|major)$ ]]; then
        echo -e "${RED}Invalid version argument: $VERSION_ARG${NC}"
        echo "Use patch, minor, major, or a specific version number (e.g., 0.2.0)"
        exit 1
    fi
    
    # Calculate new version
    IFS='.' read -r -a VERSION_PARTS <<< "${CURRENT_VERSION%-*}"
    MAJOR=${VERSION_PARTS[0]}
    MINOR=${VERSION_PARTS[1]}
    PATCH=${VERSION_PARTS[2]}
    
    case $VERSION_ARG in
        patch) PATCH=$((PATCH + 1)) ;;
        minor) MINOR=$((MINOR + 1)); PATCH=0 ;;
        major) MAJOR=$((MAJOR + 1)); MINOR=0; PATCH=0 ;;
    esac
    
    NEW_VERSION="$MAJOR.$MINOR.$PATCH"
fi

# Construct tag name
if [ "$RELEASE_TYPE" = "stable" ]; then
    TAG_NAME="v$NEW_VERSION"
    DISPLAY_VERSION="$NEW_VERSION"
else
    TAG_NAME="v$NEW_VERSION-$RELEASE_TYPE"
    DISPLAY_VERSION="$NEW_VERSION-$RELEASE_TYPE"
fi

echo -e "New version: ${GREEN}$DISPLAY_VERSION${NC}"
echo -e "Release type: ${BLUE}$RELEASE_TYPE${NC}"
echo -e "Git tag: ${BLUE}$TAG_NAME${NC}"
echo ""

# Confirm
read -p "Continue with release? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Release cancelled.${NC}"
    exit 0
fi

# Update package.json version
echo -e "${YELLOW}📝 Updating package.json version...${NC}"
npm version "$NEW_VERSION" --no-git-tag-version --allow-same-version

# Build the extension
echo -e "${YELLOW}🔨 Building extension...${NC}"
pnpm build

# Create ZIP
echo -e "${YELLOW}📦 Creating ZIP package...${NC}"
ZIP_NAME="agricola-tutor-$TAG_NAME.zip"
cd build/chrome-mv3-prod
zip -r "../../$ZIP_NAME" .
cd ../..

# Commit and tag
echo -e "${YELLOW}📌 Creating git commit and tag...${NC}"
git add .
git commit -m "chore: release $TAG_NAME"
git tag -a "$TAG_NAME" -m "Release $TAG_NAME"

echo ""
echo -e "${GREEN}✅ Release $TAG_NAME prepared!${NC}"
echo ""
echo -e "Package created: ${GREEN}$ZIP_NAME${NC}"
echo ""
echo -e "To publish the release:"
echo -e "  ${YELLOW}git push && git push --tags${NC}"
echo ""
echo -e "Or trigger GitHub Actions manually:"
echo -e "  ${YELLOW}Go to Actions → Release → Run workflow${NC}"
echo -e "  ${YELLOW}Enter version: $NEW_VERSION${NC}"
echo -e "  ${YELLOW}Select type: $RELEASE_TYPE${NC}"

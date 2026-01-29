#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
LOCALE=""
BUILD_ONLY=false

usage() {
    echo "Usage: $0 [-l locale] [-h]"
    echo ""
    echo "Options:"
    echo "  -l LOCALE     Target locale: en, zh, jp (default: all languages)"
    echo "  -h            Show this help"
    echo ""
    echo "Locale Configuration:"
    echo "  (no -l):      Full build with all languages (en+zh+jp)"
    echo "  en:             Filtered build (en+zh), default=en"
    echo "  zh:             Filtered build (en+zh), default=zh"
    echo "  jp:             Filtered build (en+jp), default=jp"
    echo ""
    echo "Examples:"
    echo "  $0                          # Full build (all languages)"
    echo "  $0 -l en                  # English build (en+zh)"
    echo "  $0 -l zh                  # Chinese build (en+zh)"
    echo "  $0 -l jp                  # Japanese build (en+jp)"
}

# Parse arguments
while getopts "l:h" opt; do
    case $opt in
        l) LOCALE="$OPTARG" ;;
        h) usage; exit 0 ;;
        *) usage; exit 1 ;;
    esac
done

# Validate locale if specified
if [ -n "$LOCALE" ] && [[ ! "$LOCALE" =~ ^(en|zh|jp)$ ]]; then
    echo -e "${RED}Error: Invalid locale '$LOCALE'. Use: en, zh, jp, or omit for full build${NC}"
    exit 1
fi

# Get script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
cd "$PROJECT_DIR"

echo ""
echo -e "${BLUE}📦 Local Build Package${NC}"

# Determine build configuration
if [ -z "$LOCALE" ]; then
    echo -e "${BLUE}Build Type:    Full (all languages)${NC}"
    FILENAME="agricola-tutor-full.zip"
    BUILD_TYPE="full"
else
    case $LOCALE in
        en)
            echo -e "${BLUE}Build Type:    English (en+zh)${NC}"
            ;;
        zh)
            echo -e "${BLUE}Build Type:    Chinese (en+zh)${NC}"
            ;;
        jp)
            echo -e "${BLUE}Build Type:    Japanese (en+jp)${NC}"
            ;;
    esac
    FILENAME="agricola-tutor-${LOCALE}.zip"
    BUILD_TYPE="locale-${LOCALE}"
fi

echo -e "${BLUE}Filename:      $FILENAME${NC}"
echo ""

# Step 1: Clean and build
echo -e "${BLUE}🔨 Step 1: Building extension...${NC}"

# Use npm if pnpm is not available
if command -v pnpm &> /dev/null; then
    pnpm build
else
    npm run build
fi

# Step 2: Filter locales if needed
if [ -n "$LOCALE" ]; then
    echo ""
    echo -e "${BLUE}✂️  Step 2: Filtering locales...${NC}"

    case $LOCALE in
        en)
            KEEP_LOCALES="en,zh"
            DEFAULT_LANG="en"
            ;;
        zh)
            KEEP_LOCALES="en,zh"
            DEFAULT_LANG="zh"
            ;;
        jp)
            KEEP_LOCALES="en,jp"
            DEFAULT_LANG="jp"
            ;;
    esac

    echo "  Keeping locales: $KEEP_LOCALES"
    echo "  Default language: $DEFAULT_LANG"

    node scripts/filter-locales.js $LOCALE assets/cards.json build/cards-filtered.json

    echo -e "${BLUE}🔄 Step 3: Replacing cards.json...${NC}"
    cp build/cards-filtered.json build/chrome-mv3-prod/cards.json

    echo -e "${BLUE}🌐 Step 4: Filtering _locales directory...${NC}"
    LOCALES_DIR="build/chrome-mv3-prod/_locales"

    case $LOCALE in
        en)
            # en: keep en+zh
            rm -rf $LOCALES_DIR/jp
            # Make sure zh exists (copy en as fallback)
            if [ ! -d "$LOCALES_DIR/zh" ] && [ -d "$LOCALES_DIR/en" ]; then
                cp -r $LOCALES_DIR/en $LOCALES_DIR/zh
                echo "  Created locale: zh (copied from en)"
            fi
            echo "  Removed locale: jp (if existed)"
            echo "  Keeping locales: en, zh"
            ;;
        zh)
            # zh: keep en+zh
            rm -rf $LOCALES_DIR/jp
            # Make sure zh exists (copy en as fallback)
            if [ ! -d "$LOCALES_DIR/zh" ] && [ -d "$LOCALES_DIR/en" ]; then
                cp -r $LOCALES_DIR/en $LOCALES_DIR/zh
                echo "  Created locale: zh (copied from en)"
            fi
            echo "  Removed locale: jp (if existed)"
            echo "  Keeping locales: en, zh"
            ;;
        jp)
            # jp: keep en+jp
            rm -rf $LOCALES_DIR/zh
            # Create jp locale (copy en as fallback)
            if [ ! -d "$LOCALES_DIR/jp" ] && [ -d "$LOCALES_DIR/en" ]; then
                cp -r $LOCALES_DIR/en $LOCALES_DIR/jp
                echo "  Created locale: jp (copied from en)"
            fi
            echo "  Removed locale: zh"
            echo "  Keeping locales: en, jp"
            ;;
    esac
else
    echo ""
    echo -e "${BLUE}✅ Step 2: No filtering needed (full build)${NC}"
fi

# Step 5: Update manifest default_locale if needed
if [ -n "$LOCALE" ]; then
    echo ""
    echo -e "${BLUE}📝 Step 5: Updating manifest default_locale...${NC}"
    case $LOCALE in
        en)
            DEFAULT_LOCALE="en"
            ;;
        zh)
            DEFAULT_LOCALE="zh"
            ;;
        jp)
            DEFAULT_LOCALE="jp"
            ;;
    esac
    echo "  Setting default_locale to: $DEFAULT_LOCALE"
    # Update manifest.json in the build directory
    MANIFEST_FILE="build/chrome-mv3-prod/manifest.json"
    if [ -f "$MANIFEST_FILE" ]; then
        # Use node to update JSON safely
        node -e "
            const fs = require('fs');
            const manifest = JSON.parse(fs.readFileSync('$MANIFEST_FILE', 'utf8'));
            manifest.default_locale = '$DEFAULT_LOCALE';
            fs.writeFileSync('$MANIFEST_FILE', JSON.stringify(manifest, null, 2));
            console.log('  Updated default_locale to:', manifest.default_locale);
        "
    fi
fi

# Step 6: Create ZIP package
echo ""
echo -e "${BLUE}📁 Step 6: Creating ZIP package...${NC}"
cd build/chrome-mv3-prod

# Remove existing zip if present
rm -f ../../$FILENAME

# Create new zip
zip -r ../../$FILENAME . > /dev/null

cd ../..

# Verify zip was created
if [ ! -f "$FILENAME" ]; then
    echo -e "${RED}Error: Failed to create $FILENAME${NC}"
    exit 1
fi

# Get file size
FILESIZE=$(du -h "$FILENAME" | cut -f1)

echo ""
echo -e "${GREEN}✅ Build complete!${NC}"
echo -e "   Package:      $FILENAME"
echo -e "   Size:         $FILESIZE"
echo -e "   Type:         $BUILD_TYPE"
echo ""

# Show next steps
echo -e "${BLUE}📋 Next Steps:${NC}"
echo "   Load in Chrome: chrome://extensions/"
echo "   Enable Developer mode"
echo "   Click 'Load unpacked' and select:"
echo "     build/chrome-mv3-prod/"
echo ""

# Compare package sizes if multiple builds exist
shopt -s nullglob
for f in agricola-tutor-*.zip agricola-tutor-full.zip; do
    if [ "$f" != "$FILENAME" ] && [ -f "$f" ]; then
        OTHER_SIZE=$(du -h "$f" | cut -f1)
        echo -e "${YELLOW}   Also available: $f ($OTHER_SIZE)${NC}"
    fi
done
shopt -u nullglob

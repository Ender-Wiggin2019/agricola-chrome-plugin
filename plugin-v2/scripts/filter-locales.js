const fs = require('fs');
const path = require('path');

const SUPPORTED_LOCALES = ['en', 'zh', 'jp'];

const LOCALE_CONFIGS = {
  en: {
    keep: ['en', 'zh'],
    default: 'en'
  },
  zh: {
    keep: ['en', 'zh'],
    default: 'zh'
  },
  jp: {
    keep: ['en', 'jp'],
    default: 'jp'
  }
};

function filterLocaleKeys(obj, keepLocales) {
  const filtered = {};
  for (const [key, value] of Object.entries(obj)) {
    if (keepLocales.includes(key)) {
      filtered[key] = value;
    }
  }
  return filtered;
}

function filterCardLocaleNames(card, keepLocales) {
  if (!card.localeNames) return card;
  return {
    ...card,
    localeNames: filterLocaleKeys(card.localeNames, keepLocales)
  };
}

function filterCardLocaleDescs(card, keepLocales) {
  if (!card.localeDescs) return card;
  return {
    ...card,
    localeDescs: filterLocaleKeys(card.localeDescs, keepLocales)
  };
}

function filterCardTiers(card, keepLocales) {
  if (!card.tiers || !Array.isArray(card.tiers)) return card;

  return {
    ...card,
    tiers: card.tiers.map(tier => {
      const filteredTier = { ...tier };

      if (tier.localeDescs) {
        filteredTier.localeDescs = filterLocaleKeys(tier.localeDescs, keepLocales);
      }

      return filteredTier;
    })
  };
}

function filterCards(cards, targetLocale) {
  const config = LOCALE_CONFIGS[targetLocale];

  if (!config) {
    throw new Error(`Unsupported locale: ${targetLocale}. Supported: ${Object.keys(LOCALE_CONFIGS).join(', ')}`);
  }

  console.log(`Filtering cards for locale: ${targetLocale}`);
  console.log(`  Keeping locales: ${config.keep.join(', ')}`);
  console.log(`  Default locale: ${config.default}`);

  return cards.map(card => {
    let filteredCard = card;

    filteredCard = filterCardLocaleNames(filteredCard, config.keep);
    filteredCard = filterCardLocaleDescs(filteredCard, config.keep);
    filteredCard = filterCardTiers(filteredCard, config.keep);

    filteredCard.defaultLang = config.default;

    return filteredCard;
  });
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.error('Usage: node filter-locales.js <target-locale> <input-file> <output-file>');
    console.error('');
    console.error('Arguments:');
    console.error('  target-locale  en, zh, or jp');
    console.error('  input-file     Path to input cards.json');
    console.error('  output-file    Path to output filtered cards.json');
    console.error('');
    console.error('Examples:');
    console.error('  node scripts/filter-locales.js en ../assets/cards.json ../build/cards-en.json');
    console.error('  node scripts/filter-locales.js zh ../assets/cards.json ../build/cards-zh.json');
    console.error('  node scripts/filter-locales.js jp ../assets/cards.json ../build/cards-jp.json');
    process.exit(1);
  }

  const [targetLocale, inputFile, outputFile] = args;

  if (!SUPPORTED_LOCALES.includes(targetLocale)) {
    console.error(`Error: Unsupported locale '${targetLocale}'`);
    console.error(`Supported locales: ${SUPPORTED_LOCALES.join(', ')}`);
    process.exit(1);
  }

  if (!inputFile || !outputFile) {
    console.error('Error: Missing input or output file');
    process.exit(1);
  }

  const inputPath = path.resolve(process.cwd(), inputFile);
  const outputPath = path.resolve(process.cwd(), outputFile);

  if (!fs.existsSync(inputPath)) {
    console.error(`Error: Input file not found: ${inputPath}`);
    process.exit(1);
  }

  console.log('');
  console.log('========================================');
  console.log('  Card Locale Filter');
  console.log('========================================');
  console.log('');

  try {
    const data = fs.readFileSync(inputPath, 'utf8');
    const cards = JSON.parse(data);

    if (!Array.isArray(cards)) {
      console.error('Error: Input file must contain an array of cards');
      process.exit(1);
    }

    console.log(`Loaded ${cards.length} cards from ${inputPath}`);
    console.log('');

    const filteredCards = filterCards(cards, targetLocale);

    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputPath, JSON.stringify(filteredCards, null, 2), 'utf8');

    const originalSize = fs.statSync(inputPath).size;
    const newSize = fs.statSync(outputPath).size;
    const reduction = ((originalSize - newSize) / originalSize * 100).toFixed(1);

    console.log('');
    console.log('========================================');
    console.log('  Summary');
    console.log('========================================');
    console.log(`  Input file:  ${inputPath}`);
    console.log(`  Output file: ${outputPath}`);
    console.log(`  Cards count: ${cards.length}`);
    console.log(`  Original size: ${(originalSize / 1024).toFixed(1)} KB`);
    console.log(`  Filtered size: ${(newSize / 1024).toFixed(1)} KB`);
    console.log(`  Size reduction: ${reduction}%`);
    console.log('');
    console.log('✅ Filtering completed successfully!');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  filterCards,
  filterCardLocaleNames,
  filterCardLocaleDescs,
  filterCardTiers,
  LOCALE_CONFIGS
};

// Load cards data
let cardsData = null;
let authorsData = null;

// Load cards.json and authors.json
async function loadCardsData() {
  try {
    const cardsResponse = await fetch(chrome.runtime.getURL('cards.json'));
    cardsData = await cardsResponse.json();
    console.log('Cards data loaded:', cardsData.length, 'cards');

    const authorsResponse = await fetch(chrome.runtime.getURL('authors.json'));
    authorsData = await authorsResponse.json();
    console.log('Authors data loaded:', authorsData);

    processCards();
    initSearchFeature();
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// Find card by numbering (no field) first, then by cnName, then by enName
function findCard(cardContainer) {
  if (!cardsData) return null;

  // First try to match by card-numbering (no field)
  const numberingElement = cardContainer.querySelector('.card-numbering');
  if (numberingElement) {
    const numbering = numberingElement.textContent.trim();
    const card = cardsData.find(c => c.no === numbering);
    if (card) return card;
  }

  // If no match by numbering, try to match by cnName
  const titleElement = cardContainer.querySelector('.card-title');
  if (!titleElement) return null;

  const cardName = titleElement.textContent.trim();

  // Exact match first with cnName
  let card = cardsData.find(c => c.cnName === cardName);
  if (card) return card;

  // Try removing common whitespace/formatting differences for cnName
  const normalizedName = cardName.replace(/\s+/g, '');
  card = cardsData.find(c => c.cnName && c.cnName.replace(/\s+/g, '') === normalizedName);
  if (card) return card;

  // Fallback to enName
  card = cardsData.find(c => c.enName === cardName);
  if (card) return card;

  // Try removing whitespace for enName
  card = cardsData.find(c => c.enName && c.enName.replace(/\s+/g, '') === normalizedName);
  if (card) return card;

  return null;
}

// Get tier color based on tier level and type
function getTierColor(tier, tierType) {
  // Return gray for N/A or empty tier
  if (!tier || tier === 'N/A' || (typeof tier === 'string' && tier.trim() === '')) {
    return '#9e9e9e'; // Gray
  }

  // For baituTier (T0-T4)
  if (tierType === 'baitu') {
    if (tier === 'T0' || tier === 'T1') {
      return '#4caf50'; // Green
    } else if (tier === 'T2') {
      return '#d4af37'; // Darker yellow/gold
    } else if (tier === 'T3') {
      return '#ff9800'; // Orange
    } else if (tier === 'T4') {
      return '#f44336'; // Red
    }
  }

  // For enTier and chenTier (A-F): green to yellow to red gradient
  if (tierType === 'en' || tierType === 'chen') {
    const tierUpper = String(tier).toUpperCase().trim();
    if (tierUpper === 'A') {
      return '#4caf50'; // Green
    } else if (tierUpper === 'B') {
      return '#8bc34a'; // Light green
    } else if (tierUpper === 'C') {
      return '#cddc39'; // Lime
    } else if (tierUpper === 'D') {
      return '#f9a825'; // Darker yellow
    } else if (tierUpper === 'E') {
      return '#ff9800'; // Orange
    } else if (tierUpper === 'F') {
      return '#f44336'; // Red
    }
  }

  return '#9e9e9e'; // Default gray (for unknown values)
}

// Stats labels mapping for easy maintenance
const STATS_LABELS = {
  pwr: 'PWR',
  adp: 'ADP',
  apr: 'APR',
  drawPlayRate: 'Draw Play Rate'
};

// Get stats data (prioritize default, fallback to nb)
function getStatsData(card) {
  if (!card || !card.stats) return null;

  if (card.stats.default) {
    return card.stats.default;
  } else if (card.stats.nb) {
    return card.stats.nb;
  }

  return null;
}

// Get ADP color based on value
function getAdpColor(adp) {
  if (adp < 2) {
    return '#4caf50'; // Green
  } else if (adp <= 4.5) {
    return '#f9a825'; // Darker yellow
  } else {
    return '#f44336'; // Red
  }
}

// Get drawPlayRate color based on value
function getDrawPlayRateColor(rate) {
  if (rate > 0.9) {
    return '#4caf50'; // Green
  } else if (rate > 0.7) {
    return '#f9a825'; // Darker yellow
  } else {
    return '#f44336'; // Red
  }
}

// Create tooltip element with author information
function createTooltip(desc, tier, tierType) {
  const tooltip = document.createElement('div');
  tooltip.className = 'ag-card-tooltip';
  const tierColor = getTierColor(tier, tierType);

  // Get author information
  let authorHeader = '';
  if (authorsData && authorsData[tierType]) {
    const author = authorsData[tierType];
    const authorName = author.name || tierType;
    const avatar = author.avatar;

    if (avatar && avatar.trim() !== '') {
      // Create header with avatar and name
      authorHeader = `
        <div class="ag-tooltip-author">
          <img src="${avatar}" alt="${authorName}" class="ag-author-avatar" />
          <span class="ag-author-name">${authorName}</span>:
        </div>
      `;
    } else {
      // Create header with name only
      authorHeader = `
        <div class="ag-tooltip-author">
          <span class="ag-author-name">${authorName}</span>:
        </div>
      `;
    }
  }

  tooltip.innerHTML = `
    <div class="ag-tooltip-content">
      ${authorHeader}
      <div class="ag-tooltip-body">${desc.replace(/\n/g, '<br>')}</div>
    </div>
  `;
  tooltip.style.borderColor = tierColor;
  return tooltip;
}

// Create a single tier badge with tooltip
// Returns null if tier is missing (don't show N/A)
function createTierBadge(tier, desc, tierType, tierLabel) {
  // If tier is missing or empty, don't create badge
  const hasTier = tier && tier.trim() !== '';
  if (!hasTier) {
    return null;
  }

  const hasDesc = desc && desc.trim() !== '';
  const displayTier = tier;
  const tierColor = getTierColor(displayTier, tierType);

  // Create wrapper for tier badge
  const tierWrapper = document.createElement('div');
  tierWrapper.className = 'ag-tier-wrapper';
  tierWrapper.style.backgroundColor = tierColor;
  tierWrapper.dataset.tierType = tierType;

  // Create tier badge
  const tierBadge = document.createElement('span');
  tierBadge.className = 'ag-tier-badge';
  tierBadge.textContent = displayTier;

  // Add "+" indicator if has desc
  if (hasDesc) {
    const descIndicator = document.createElement('span');
    descIndicator.className = 'ag-desc-indicator';
    descIndicator.textContent = '+';
    tierBadge.appendChild(descIndicator);
  }

  // Create tooltip if has desc
  if (hasDesc) {
    const tooltip = createTooltip(desc, displayTier, tierType);
    tooltip.className = 'ag-card-tooltip ag-tooltip-hover';
    tooltip.style.display = 'none';

    let tooltipTimeout = null;

    // Show tooltip on tier badge hover
    tierWrapper.addEventListener('mouseenter', (e) => {
      e.stopPropagation();

      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
        tooltipTimeout = null;
      }

      // Remove other tooltips
      document.querySelectorAll('.ag-card-tooltip').forEach(t => {
        if (t !== tooltip) {
          t.style.display = 'none';
          t.remove();
        }
      });

      if (!document.body.contains(tooltip)) {
        document.body.appendChild(tooltip);
      }

      tooltip.style.display = 'flex';

      // Position tooltip below the tier badge
      const tierRect = tierWrapper.getBoundingClientRect();
      tooltip.style.top = `${tierRect.bottom + 10}px`;
      tooltip.style.left = `${tierRect.left + (tierRect.width / 2)}px`;
      tooltip.style.transform = 'translate(-50%, 0)';

      // Adjust if tooltip goes off screen
      setTimeout(() => {
        const tooltipRect = tooltip.getBoundingClientRect();
        // Adjust horizontal position if goes off screen
        if (tooltipRect.left < 10) {
          tooltip.style.left = `${tierRect.left + 10}px`;
          tooltip.style.transform = 'translate(0, 0)';
        }
        if (tooltipRect.right > window.innerWidth - 10) {
          tooltip.style.left = `${tierRect.right - 10}px`;
          tooltip.style.transform = 'translate(-100%, 0)';
        }
        // If tooltip goes off bottom of screen, show above instead
        if (tooltipRect.bottom > window.innerHeight - 10) {
          tooltip.style.top = `${tierRect.top - 10}px`;
          tooltip.style.transform = 'translate(-50%, -100%)';
          // Re-adjust horizontal if needed when showing above
          const tooltipRectAbove = tooltip.getBoundingClientRect();
          if (tooltipRectAbove.left < 10) {
            tooltip.style.left = `${tierRect.left + 10}px`;
            tooltip.style.transform = 'translate(0, -100%)';
          }
          if (tooltipRectAbove.right > window.innerWidth - 10) {
            tooltip.style.left = `${tierRect.right - 10}px`;
            tooltip.style.transform = 'translate(-100%, -100%)';
          }
        }
      }, 0);
    });

    // Hide tooltip when leaving tier badge
    tierWrapper.addEventListener('mouseleave', () => {
      tooltipTimeout = setTimeout(() => {
        if (tooltip && tooltip.parentElement) {
          tooltip.style.display = 'none';
          tooltip.remove();
        }
      }, 200);
    });

    // Keep tooltip visible when hovering over it
    tooltip.addEventListener('mouseenter', () => {
      if (tooltipTimeout) {
        clearTimeout(tooltipTimeout);
        tooltipTimeout = null;
      }
    });

    // Hide tooltip when leaving it
    tooltip.addEventListener('mouseleave', () => {
      if (tooltip && tooltip.parentElement) {
        tooltip.style.display = 'none';
        tooltip.remove();
      }
    });
  }

  tierWrapper.appendChild(tierBadge);
  return tierWrapper;
}

// Create stats tooltip element
function createStatsTooltip(statsData) {
  const tooltip = document.createElement('div');
  tooltip.className = 'ag-card-tooltip ag-stats-tooltip';

  const adpColor = getAdpColor(statsData.adp);
  const drawPlayRateColor = getDrawPlayRateColor(statsData.drawPlayRate);
  const drawPlayRatePercent = Math.round(statsData.drawPlayRate * 100);

  // Build stats items dynamically
  const statsItems = [];

  // PWR
  if (statsData.pwr !== undefined) {
    statsItems.push(`
      <div class="ag-stats-item">
        <span class="ag-stats-label">${STATS_LABELS.pwr}:</span>
        <span class="ag-stats-value">${statsData.pwr.toFixed(2)}</span>
      </div>
    `);
  }

  // ADP
  if (statsData.adp !== undefined) {
    statsItems.push(`
      <div class="ag-stats-item">
        <span class="ag-stats-label">${STATS_LABELS.adp}:</span>
        <span class="ag-stats-value" style="color: ${adpColor}">${statsData.adp.toFixed(2)}</span>
      </div>
    `);
  }

  // APR
  if (statsData.apr !== undefined) {
    statsItems.push(`
      <div class="ag-stats-item">
        <span class="ag-stats-label">${STATS_LABELS.apr}:</span>
        <span class="ag-stats-value" style="color: #000">${statsData.apr.toFixed(2)}</span>
      </div>
    `);
  }

  // Draw Play Rate
  if (statsData.drawPlayRate !== undefined) {
    statsItems.push(`
      <div class="ag-stats-item">
        <span class="ag-stats-label">${STATS_LABELS.drawPlayRate}:</span>
        <span class="ag-stats-value" style="color: ${drawPlayRateColor}">${drawPlayRatePercent}%</span>
      </div>
    `);
  }

  tooltip.innerHTML = `
    <div class="ag-tooltip-content">
      <div class="ag-stats-tooltip-header">
        <span class="ag-stats-header-text">Stats From Lumin</span>
      </div>
      <div class="ag-stats-tooltip-body">
        ${statsItems.join('')}
      </div>
    </div>
  `;

  return tooltip;
}

// Create stats badge (circle badge showing ADP)
function createStatsBadge(card) {
  const statsData = getStatsData(card);
  if (!statsData || statsData.adp === undefined) {
    return null;
  }

  const adp = statsData.adp;
  const adpColor = getAdpColor(adp);

  // Create wrapper for stats badge
  const statsWrapper = document.createElement('div');
  statsWrapper.className = 'ag-stats-wrapper';
  statsWrapper.style.backgroundColor = adpColor;
  statsWrapper.style.borderRadius = '50%';
  statsWrapper.style.width = '32px';
  statsWrapper.style.height = '32px';
  statsWrapper.style.display = 'flex';
  statsWrapper.style.alignItems = 'center';
  statsWrapper.style.justifyContent = 'center';
  statsWrapper.style.cursor = 'pointer';

  // Create stats badge
  const statsBadge = document.createElement('span');
  statsBadge.className = 'ag-stats-badge';
  statsBadge.textContent = adp.toFixed(1);
  statsBadge.style.color = '#fff';
  statsBadge.style.fontSize = '12px';
  statsBadge.style.fontWeight = 'bold';

  statsWrapper.appendChild(statsBadge);

  // Create tooltip
  const tooltip = createStatsTooltip(statsData);
  tooltip.style.display = 'none';

  let tooltipTimeout = null;

  // Show tooltip on stats badge hover
  statsWrapper.addEventListener('mouseenter', (e) => {
    e.stopPropagation();

    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
      tooltipTimeout = null;
    }

    // Remove other tooltips
    document.querySelectorAll('.ag-card-tooltip').forEach(t => {
      if (t !== tooltip) {
        t.style.display = 'none';
        t.remove();
      }
    });

    if (!document.body.contains(tooltip)) {
      document.body.appendChild(tooltip);
    }

    tooltip.style.display = 'flex';

    // Position tooltip below the stats badge
    const statsRect = statsWrapper.getBoundingClientRect();
    tooltip.style.top = `${statsRect.bottom + 10}px`;
    tooltip.style.left = `${statsRect.left + (statsRect.width / 2)}px`;
    tooltip.style.transform = 'translate(-50%, 0)';

    // Adjust if tooltip goes off screen
    setTimeout(() => {
      const tooltipRect = tooltip.getBoundingClientRect();
      // Adjust horizontal position if goes off screen
      if (tooltipRect.left < 10) {
        tooltip.style.left = `${statsRect.left + 10}px`;
        tooltip.style.transform = 'translate(0, 0)';
      }
      if (tooltipRect.right > window.innerWidth - 10) {
        tooltip.style.left = `${statsRect.right - 10}px`;
        tooltip.style.transform = 'translate(-100%, 0)';
      }
      // If tooltip goes off bottom of screen, show above instead
      if (tooltipRect.bottom > window.innerHeight - 10) {
        tooltip.style.top = `${statsRect.top - 10}px`;
        tooltip.style.transform = 'translate(-50%, -100%)';
        // Re-adjust horizontal if needed when showing above
        const tooltipRectAbove = tooltip.getBoundingClientRect();
        if (tooltipRectAbove.left < 10) {
          tooltip.style.left = `${statsRect.left + 10}px`;
          tooltip.style.transform = 'translate(0, -100%)';
        }
        if (tooltipRectAbove.right > window.innerWidth - 10) {
          tooltip.style.left = `${statsRect.right - 10}px`;
          tooltip.style.transform = 'translate(-100%, -100%)';
        }
      }
    }, 0);
  });

  // Hide tooltip when leaving stats badge
  statsWrapper.addEventListener('mouseleave', () => {
    tooltipTimeout = setTimeout(() => {
      if (tooltip && tooltip.parentElement) {
        tooltip.style.display = 'none';
        tooltip.remove();
      }
    }, 200);
  });

  // Keep tooltip visible when hovering over it
  tooltip.addEventListener('mouseenter', () => {
    if (tooltipTimeout) {
      clearTimeout(tooltipTimeout);
      tooltipTimeout = null;
    }
  });

  // Hide tooltip when leaving it
  tooltip.addEventListener('mouseleave', () => {
    if (tooltip && tooltip.parentElement) {
      tooltip.style.display = 'none';
      tooltip.remove();
    }
  });

  return statsWrapper;
}

// Process all player-card-inner elements on the page
function processCards() {
  const cardContainers = document.querySelectorAll('.player-card-inner');

  cardContainers.forEach((cardContainer) => {
    // Skip if already processed
    if (cardContainer.dataset.processed === 'true') {
      return;
    }

    // Find card by numbering first, then by name
    const card = findCard(cardContainer);

    if (card) {
      // Mark as processed
      cardContainer.dataset.processed = 'true';

      // Get primary tier color for border (use baituTier if available, otherwise first available)
      let primaryTierColor = '#9e9e9e';
      if (card.baituTier && card.baituTier.trim() !== '') {
        primaryTierColor = getTierColor(card.baituTier, 'baitu');
      } else if (card.enTier && card.enTier.trim() !== '') {
        primaryTierColor = getTierColor(card.enTier, 'en');
      } else if (card.chenTier && card.chenTier.trim() !== '') {
        primaryTierColor = getTierColor(card.chenTier, 'chen');
      }

      // Add border and rounded corners to the card container with tier color
      cardContainer.classList.add('ag-card-enhanced');
      cardContainer.style.borderColor = primaryTierColor;

      // Create container for three tier badges (side by side, centered)
      const tierContainer = document.createElement('div');
      tierContainer.className = 'ag-tier-container';
      tierContainer.style.display = 'flex';
      tierContainer.style.gap = '8px';
      tierContainer.style.justifyContent = 'center';
      tierContainer.style.alignItems = 'center';
      tierContainer.style.flexWrap = 'nowrap';

      // Create three tier badges: baitu, en, chen (only if tier exists)
      const baituBadge = createTierBadge(
        card.baituTier,
        card.baituDesc,
        'baitu',
        'baitu'
      );
      const enBadge = createTierBadge(
        card.enTier,
        card.enDesc,
        'en',
        'en'
      );
      const chenBadge = createTierBadge(
        card.chenTier,
        card.chenDesc,
        'chen',
        'chen'
      );

      // Only append badges that exist (not null)
      if (baituBadge) tierContainer.appendChild(baituBadge);
      if (enBadge) tierContainer.appendChild(enBadge);
      if (chenBadge) tierContainer.appendChild(chenBadge);

      // Add stats badge at the end
      const statsBadge = createStatsBadge(card);
      if (statsBadge) tierContainer.appendChild(statsBadge);

      // Only insert container if it has at least one badge
      if (tierContainer.children.length > 0) {

      // Insert wrapper - check if already wrapped
      const parent = cardContainer.parentElement;
      let cardOuterWrapper = parent;

      // Check if parent is already our wrapper
      if (!parent || !parent.classList.contains('ag-card-outer-wrapper')) {
        // Create a wrapper div for positioning
        cardOuterWrapper = document.createElement('div');
        cardOuterWrapper.className = 'ag-card-outer-wrapper';
        cardOuterWrapper.style.position = 'relative';

        // Move card container into wrapper
        if (parent) {
          parent.insertBefore(cardOuterWrapper, cardContainer);
        }
        cardOuterWrapper.appendChild(cardContainer);
      }

        // Insert tier container at the top center
        cardOuterWrapper.insertBefore(tierContainer, cardOuterWrapper.firstChild);
      }
    }
  });
}

// Initial load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadCardsData);
} else {
  loadCardsData();
}

// Watch for dynamically added cards (MutationObserver)
const observer = new MutationObserver((mutations) => {
  let shouldProcess = false;
  mutations.forEach((mutation) => {
    if (mutation.addedNodes.length > 0) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) { // Element node
          if (node.classList && node.classList.contains('player-card-inner')) {
            shouldProcess = true;
          } else if (node.querySelector && node.querySelector('.player-card-inner')) {
            shouldProcess = true;
          }
        }
      });
    }
  });

  if (shouldProcess && cardsData) {
    processCards();
  }
});

// Start observing
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// Search feature
function initSearchFeature() {
  // Wait for player_config_row to be available
  const checkAndInsertButton = () => {
    const configRow = document.getElementById('player_config_row');
    if (configRow && !document.getElementById('ag-search-btn')) {
      createSearchButton(configRow);
    } else if (!configRow) {
      setTimeout(checkAndInsertButton, 100);
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAndInsertButton);
  } else {
    checkAndInsertButton();
  }
}

function createSearchButton(configRow) {
  // Find and replace uwe-help div
  const uweHelp = document.getElementById('uwe-help');

  // Create search button with magnifying glass icon
  const searchBtn = document.createElement('button');
  searchBtn.id = 'ag-search-btn';
  searchBtn.className = 'ag-search-button';
  searchBtn.innerHTML = `
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.5 10.5L9.5 8.5M10.5 6.5C10.5 8.70914 8.70914 10.5 6.5 10.5C4.29086 10.5 2.5 8.70914 2.5 6.5C2.5 4.29086 4.29086 2.5 6.5 2.5C8.70914 2.5 10.5 4.29086 10.5 6.5Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
  searchBtn.setAttribute('aria-label', 'Search');
  searchBtn.addEventListener('click', () => {
    showSearchModal();
  });

  // Replace uwe-help div with search button
  if (uweHelp) {
    uweHelp.replaceWith(searchBtn);
  } else {
    // Fallback: insert button into config row
    configRow.appendChild(searchBtn);
  }

  // Create modal
  createSearchModal();
}

function createSearchModal() {
  // Create modal overlay
  const modal = document.createElement('div');
  modal.id = 'ag-search-modal';
  modal.className = 'ag-search-modal';
  modal.style.display = 'none';

  modal.innerHTML = `
    <div class="ag-search-modal-content">
      <div class="ag-search-modal-header">
        <h3>Search Cards</h3>
        <button class="ag-search-close-btn" id="ag-search-close">×</button>
      </div>
      <div class="ag-search-modal-body">
        <input type="text" id="ag-search-input" class="ag-search-input" placeholder="Search by No, CN Name, or EN Name..." />
        <div id="ag-search-results" class="ag-search-results"></div>
      </div>
      <div class="ag-search-modal-footer">
        <div class="ag-search-modal-credits">
          Plugin creator: Ender<br>
          Statistics: Lumin<br>
          Tier and comments providers: Yuxiao_Huang, Chen233, Mark Hartnady
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Close button handler
  const closeBtn = modal.querySelector('#ag-search-close');
  closeBtn.addEventListener('click', () => {
    hideSearchModal();
  });

  // Close on overlay click
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      hideSearchModal();
    }
  });

  // Search input handler
  const searchInput = modal.querySelector('#ag-search-input');
  let searchTimeout = null;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();

    if (query.length === 0) {
      clearSearchResults();
      return;
    }

    searchTimeout = setTimeout(() => {
      performSearch(query);
    }, 300);
  });

  // Handle Enter key
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const query = e.target.value.trim();
      if (query.length > 0) {
        performSearch(query);
      }
    }
  });
}

function showSearchModal() {
  const modal = document.getElementById('ag-search-modal');
  if (modal) {
    modal.style.display = 'flex';
    const searchInput = modal.querySelector('#ag-search-input');
    if (searchInput) {
      searchInput.focus();
    }
  }
}

function hideSearchModal() {
  const modal = document.getElementById('ag-search-modal');
  if (modal) {
    modal.style.display = 'none';
    const searchInput = modal.querySelector('#ag-search-input');
    if (searchInput) {
      searchInput.value = '';
    }
    clearSearchResults();
  }
}

function performSearch(query) {
  if (!cardsData) return;

  const results = [];
  const queryLower = query.toLowerCase().trim();

  for (const card of cardsData) {
    if (results.length >= 3) break;

    // Search by no
    if (card.no && card.no.toLowerCase().includes(queryLower)) {
      results.push(card);
      continue;
    }

    // Search by cnName
    if (card.cnName && card.cnName.toLowerCase().includes(queryLower)) {
      results.push(card);
      continue;
    }

    // Search by enName
    if (card.enName && card.enName.toLowerCase().includes(queryLower)) {
      results.push(card);
      continue;
    }
  }

  displaySearchResults(results);
}

function displaySearchResults(results) {
  const resultsContainer = document.getElementById('ag-search-results');
  if (!resultsContainer) return;

  resultsContainer.innerHTML = '';

  if (results.length === 0) {
    resultsContainer.innerHTML = '<div class="ag-search-no-results">No results found</div>';
    return;
  }

  results.forEach(card => {
    const cardElement = createSearchResultCard(card);
    resultsContainer.appendChild(cardElement);
  });
}

function createSearchResultCard(card) {
  const cardDiv = document.createElement('div');
  cardDiv.className = 'ag-search-result-card';

  // Header: No cnName enName
  const header = document.createElement('div');
  header.className = 'ag-search-result-header';

  const noSpan = document.createElement('span');
  noSpan.className = 'ag-search-result-no';
  noSpan.textContent = card.no || 'N/A';

  const cnNameSpan = document.createElement('span');
  cnNameSpan.className = 'ag-search-result-cnname';
  cnNameSpan.textContent = card.cnName || '';

  const enNameSpan = document.createElement('span');
  enNameSpan.className = 'ag-search-result-enname';
  enNameSpan.textContent = card.enName || '';

  header.appendChild(noSpan);
  if (card.cnName) header.appendChild(cnNameSpan);
  if (card.enName) header.appendChild(enNameSpan);

  // Badges and descriptions container
  const badgesContainer = document.createElement('div');
  badgesContainer.className = 'ag-search-result-badges-container';

  // Create badges and descriptions for each tier
  if (card.baituTier && card.baituTier.trim() !== '') {
    const badgeItem = createSearchTierBadgeWithDesc(card.baituTier, card.baituDesc, 'baitu');
    badgesContainer.appendChild(badgeItem);
  }

  if (card.enTier && card.enTier.trim() !== '') {
    const badgeItem = createSearchTierBadgeWithDesc(card.enTier, card.enDesc, 'en');
    badgesContainer.appendChild(badgeItem);
  }

  if (card.chenTier && card.chenTier.trim() !== '') {
    const badgeItem = createSearchTierBadgeWithDesc(card.chenTier, card.chenDesc, 'chen');
    badgesContainer.appendChild(badgeItem);
  }

  // Add stats badge with description
  const statsItem = createSearchStatsBadgeWithDesc(card);
  if (statsItem) badgesContainer.appendChild(statsItem);

  cardDiv.appendChild(header);
  cardDiv.appendChild(badgesContainer);

  return cardDiv;
}

function createSearchTierBadgeWithDesc(tier, desc, tierType) {
  // Create container for badge and description
  const container = document.createElement('div');
  container.className = 'ag-search-tier-item';

  // Create badge
  const badge = document.createElement('div');
  badge.className = 'ag-search-tier-badge';
  const tierColor = getTierColor(tier, tierType);
  badge.style.backgroundColor = tierColor;
  badge.textContent = tier;

  container.appendChild(badge);

  // Add description if exists
  if (desc && desc.trim() !== '') {
    const descDiv = document.createElement('div');
    descDiv.className = 'ag-search-tier-desc';

    // Get author information
    let authorHeader = '';
    if (authorsData && authorsData[tierType]) {
      const author = authorsData[tierType];
      const authorName = author.name || tierType;
      const avatar = author.avatar;

      if (avatar && avatar.trim() !== '') {
        authorHeader = `
          <div class="ag-search-desc-author">
            <img src="${avatar}" alt="${authorName}" class="ag-search-author-avatar" />
            <span class="ag-search-author-name">${authorName}</span>:
          </div>
        `;
      } else {
        authorHeader = `
          <div class="ag-search-desc-author">
            <span class="ag-search-author-name">${authorName}</span>:
          </div>
        `;
      }
    }

    descDiv.innerHTML = `
      ${authorHeader}
      <div class="ag-search-desc-content">${desc.replace(/\n/g, '<br>')}</div>
    `;

    container.appendChild(descDiv);
  }

  return container;
}

function createSearchStatsBadgeWithDesc(card) {
  const statsData = getStatsData(card);
  if (!statsData) return null;

  // Create container for badge and stats info
  const container = document.createElement('div');
  container.className = 'ag-search-tier-item';

  // Create stats badge (circle badge showing ADP)
  const adp = statsData.adp;
  if (adp === undefined) return null;

  const adpColor = getAdpColor(adp);
  const badge = document.createElement('div');
  badge.className = 'ag-search-stats-badge';
  badge.style.backgroundColor = adpColor;
  badge.style.borderRadius = '50%';
  badge.style.width = '32px';
  badge.style.height = '32px';
  badge.style.display = 'flex';
  badge.style.alignItems = 'center';
  badge.style.justifyContent = 'center';
  badge.style.color = '#fff';
  badge.style.fontSize = '12px';
  badge.style.fontWeight = 'bold';
  badge.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.15)';
  badge.textContent = adp.toFixed(1);

  container.appendChild(badge);

  // Create stats description div
  const descDiv = document.createElement('div');
  descDiv.className = 'ag-search-tier-desc';

  // Build stats items
  const statsItems = [];
  const drawPlayRateColor = statsData.drawPlayRate !== undefined ? getDrawPlayRateColor(statsData.drawPlayRate) : null;
  const drawPlayRatePercent = statsData.drawPlayRate !== undefined ? Math.round(statsData.drawPlayRate * 100) : null;

  // PWR
  if (statsData.pwr !== undefined) {
    statsItems.push(`
      <div class="ag-search-stats-item">
        <span class="ag-search-stats-label">${STATS_LABELS.pwr}:</span>
        <span class="ag-search-stats-value">${statsData.pwr.toFixed(2)}</span>
      </div>
    `);
  }

  // ADP
  if (statsData.adp !== undefined) {
    statsItems.push(`
      <div class="ag-search-stats-item">
        <span class="ag-search-stats-label">${STATS_LABELS.adp}:</span>
        <span class="ag-search-stats-value" style="color: ${adpColor}">${statsData.adp.toFixed(2)}</span>
      </div>
    `);
  }

  // APR
  if (statsData.apr !== undefined) {
    statsItems.push(`
      <div class="ag-search-stats-item">
        <span class="ag-search-stats-label">${STATS_LABELS.apr}:</span>
        <span class="ag-search-stats-value" style="color: #000">${statsData.apr.toFixed(2)}</span>
      </div>
    `);
  }

  // Draw Play Rate
  if (statsData.drawPlayRate !== undefined) {
    statsItems.push(`
      <div class="ag-search-stats-item">
        <span class="ag-search-stats-label">${STATS_LABELS.drawPlayRate}:</span>
        <span class="ag-search-stats-value" style="color: ${drawPlayRateColor}">${drawPlayRatePercent}%</span>
      </div>
    `);
  }

  if (statsItems.length > 0) {
    descDiv.innerHTML = `
      <div class="ag-search-stats-content">
        ${statsItems.join('')}
      </div>
    `;
    container.appendChild(descDiv);
  }

  return container;
}

function clearSearchResults() {
  const resultsContainer = document.getElementById('ag-search-results');
  if (resultsContainer) {
    resultsContainer.innerHTML = '';
  }
}


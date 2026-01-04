// Load cards data
let cardsData = null;

// Load cards.json
async function loadCardsData() {
  try {
    const response = await fetch(chrome.runtime.getURL('cards.json'));
    cardsData = await response.json();
    console.log('Cards data loaded:', cardsData.length, 'cards');
    processCards();
  } catch (error) {
    console.error('Error loading cards.json:', error);
  }
}

// Find card by numbering (no field) first, then by name (fuzzy matching for Chinese characters)
function findCard(cardContainer) {
  if (!cardsData) return null;

  // First try to match by card-numbering (no field)
  const numberingElement = cardContainer.querySelector('.card-numbering');
  if (numberingElement) {
    const numbering = numberingElement.textContent.trim();
    const card = cardsData.find(c => c.no === numbering);
    if (card) return card;
  }

  // If no match by numbering, try to match by name
  const titleElement = cardContainer.querySelector('.card-title');
  if (!titleElement) return null;

  const cardName = titleElement.textContent.trim();

  // Exact match first
  let card = cardsData.find(c => c.name === cardName);
  if (card) return card;

  // Try removing common whitespace/formatting differences
  const normalizedName = cardName.replace(/\s+/g, '');
  card = cardsData.find(c => c.name.replace(/\s+/g, '') === normalizedName);
  if (card) return card;

  return null;
}

// Get tier color based on tier level
function getTierColor(tier) {
  if (tier === 'T0' || tier === 'T1') {
    return '#4caf50'; // Green
  } else if (tier === 'T2') {
    return '#d4af37'; // Darker yellow/gold
  } else if (tier === 'T3') {
    return '#ff9800'; // Orange
  } else if (tier === 'T4') {
    return '#f44336'; // Red
  }
  return '#9e9e9e'; // Default gray
}

// Create tooltip element
function createTooltip(desc, tier) {
  const tooltip = document.createElement('div');
  tooltip.className = 'ag-card-tooltip';
  const tierColor = getTierColor(tier);
  tooltip.innerHTML = `
    <div class="ag-tooltip-content">
      <div class="ag-tooltip-body">${desc.replace(/\n/g, '<br>')}</div>
    </div>
  `;
  tooltip.style.borderColor = tierColor;
  return tooltip;
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

      // Get tier color
      const tierColor = getTierColor(card.tier);

      // Add border and rounded corners to the card container with tier color
      cardContainer.classList.add('ag-card-enhanced');
      cardContainer.style.borderColor = tierColor;

      // Create wrapper for tier badge and tooltip
      const tierWrapper = document.createElement('div');
      tierWrapper.className = 'ag-tier-wrapper';
      tierWrapper.style.backgroundColor = tierColor;

      // Create tier badge
      const tierBadge = document.createElement('span');
      tierBadge.className = 'ag-tier-badge';
      tierBadge.textContent = card.tier;

      // Create tooltip only if desc exists and is not empty
      const hasDesc = card.desc && card.desc.trim() !== '';

      // Add "+" indicator if has desc
      if (hasDesc) {
        const descIndicator = document.createElement('span');
        descIndicator.className = 'ag-desc-indicator';
        descIndicator.textContent = '+';
        tierBadge.appendChild(descIndicator);
      }

      if (hasDesc) {
        const tooltip = createTooltip(card.desc, card.tier);
        tooltip.className = 'ag-card-tooltip ag-tooltip-hover';
        tooltip.style.display = 'none'; // Initially hidden

        let tooltipTimeout = null;

        // Show tooltip on tier badge hover
        tierWrapper.addEventListener('mouseenter', (e) => {
          e.stopPropagation();

          // Clear any pending timeout
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

          // Add tooltip to body if not already there
          if (!document.body.contains(tooltip)) {
            document.body.appendChild(tooltip);
          }

          // Show tooltip
          tooltip.style.display = 'flex';

          // Position tooltip above the tier badge
          const tierRect = tierWrapper.getBoundingClientRect();
          tooltip.style.top = `${tierRect.top - 10}px`;
          tooltip.style.left = `${tierRect.left + (tierRect.width / 2)}px`;
          tooltip.style.transform = 'translate(-50%, -100%)';

          // Adjust if tooltip goes off screen
          setTimeout(() => {
            const tooltipRect = tooltip.getBoundingClientRect();
            if (tooltipRect.left < 10) {
              tooltip.style.left = `${tierRect.left + 10}px`;
              tooltip.style.transform = 'translate(0, -100%)';
            }
            if (tooltipRect.right > window.innerWidth - 10) {
              tooltip.style.left = `${tierRect.right - 10}px`;
              tooltip.style.transform = 'translate(-100%, -100%)';
            }
            if (tooltipRect.top < 10) {
              tooltip.style.top = `${tierRect.bottom + 10}px`;
              tooltip.style.transform = 'translate(-50%, 0)';
            }
          }, 0);
        });

        // Hide tooltip when leaving tier badge
        tierWrapper.addEventListener('mouseleave', () => {
          // Small delay to allow moving to tooltip
          tooltipTimeout = setTimeout(() => {
            if (tooltip && tooltip.parentElement) {
              tooltip.style.display = 'none';
              tooltip.remove();
            }
          }, 200);
        });

        // Keep tooltip visible when hovering over it
        tooltip.addEventListener('mouseenter', () => {
          // Cancel timeout when entering tooltip
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

      // Add badge to wrapper
      tierWrapper.appendChild(tierBadge);

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

      // Insert tier wrapper at the top center
      cardOuterWrapper.insertBefore(tierWrapper, cardOuterWrapper.firstChild);
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


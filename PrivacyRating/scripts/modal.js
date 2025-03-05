// modal.js - Modal creation and interaction logic

// Define PrivacyLens namespace if it doesn't exist
window.PrivacyLens = window.PrivacyLens || {};

// Add modal functionality to the namespace
PrivacyLens.modal = {
  /**
   * Creates the HTML for the modal
   * @param {boolean} showSingleDomain - Whether to show single domain view
   * @returns {string} HTML for the modal
   */
  createModalHTML: function(showSingleDomain = false) {
    const logoUrl = PrivacyLens.utils.getExtensionURL('images/privacy_lens_logo.png');
    const appUrl = PrivacyLensConfig.appUrl;
    const currentDomain = PrivacyLens.utils.getCurrentDomain();

    let contentHTML = '';
    
    if (showSingleDomain) {
      // Single domain view - hide the domain table for single domain view
      contentHTML = `
        <div class="privacy-lens-content">
          <div id="privacy-lens-summary" class="privacy-lens-summary">
            <div class="privacy-lens-summary-title">Loading privacy assessment...</div>
            <div id="privacy-summary-content">Analyzing the privacy practices of ${currentDomain}...</div>
          </div>
          <!-- Domain table hidden in single domain view to avoid duplication -->
          <table class="privacy-lens-table" style="display:none;">
            <thead>
              <tr>
                <th>Website</th>
                <th style="text-align: right">Privacy</th>
              </tr>
            </thead>
            <tbody id="domain-list"></tbody>
          </table>
        </div>
      `;
    } else {
      // Search results view
      contentHTML = `
        <div class="privacy-lens-content">
          <table class="privacy-lens-table">
            <thead>
              <tr>
                <th>Website</th>
                <th style="text-align: right">Privacy</th>
              </tr>
            </thead>
            <tbody id="domain-list"></tbody>
          </table>
        </div>
      `;
    }

    return `
      <div class="privacy-lens-modal" id="privacyLensModal">
        <div class="privacy-lens-header" id="privacyLensModalHeader">
          <div class="privacy-lens-header-content">
            <img 
              src="${logoUrl}"
              alt="PrivacyLens Logo"
              class="privacy-lens-logo"
            />
          </div>
          <div class="privacy-lens-controls">
            <button class="privacy-lens-button" id="minimizeModal">−</button>
            <button class="privacy-lens-button" id="closeModal">×</button>
          </div>
        </div>
        ${contentHTML}
        <div class="privacy-lens-footer">
          <table width="100%"><tr><td align="left">
          <a id="detailed-results-link" href="${appUrl}/detailed-results" target="_blank" rel="noopener noreferrer" class="privacy-lens-link">
            View detailed results
          </a>
          </td>
          <td align="right">
          <span>Was this helpful?</span>
          <button class="privacy-lens-feedback-button">👍</button>
          <button class="privacy-lens-feedback-button">👎</button>
          </td></tr></table>
        </div>
      </div>
    `;
  },

  /**
   * Makes an element draggable
   * @param {HTMLElement} element - Element to make draggable
   * @param {HTMLElement} handle - Element to use as drag handle
   * @returns {Object} Object with position state and utility methods
   */
  _makeDraggable: function(element, handle) {
    let isDragging = false;
    let currentX = 0;
    let currentY = 0;
    let initialX = 0;
    let initialY = 0;
    let xOffset = 0;
    let yOffset = 0;

    function dragStart(e) {
      // Don't start drag if clicking buttons in the handle
      if (e.target.classList.contains('privacy-lens-button')) {
        return;
      }
      initialX = e.clientX - xOffset;
      initialY = e.clientY - yOffset;
      if (e.target === handle || handle.contains(e.target)) {
        isDragging = true;
      }
    }

    function drag(e) {
      if (isDragging) {
        e.preventDefault();
        currentX = e.clientX - initialX;
        currentY = e.clientY - initialY;
        xOffset = currentX;
        yOffset = currentY;
        setTranslate(currentX, currentY, element);
      }
    }

    function setTranslate(xPos, yPos, el) {
      // Store the Y position as a CSS variable for use in minimized state
      el.style.setProperty('--drag-y', `${yPos}px`);

      if (!el.classList.contains('minimized')) {
        el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
      }
    }

    function dragEnd() {
      isDragging = false;
    }

    handle.addEventListener('mousedown', dragStart);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', dragEnd);

    return {
      xOffset: function() { return xOffset; },
      yOffset: function() { return yOffset; },
      setTranslate: setTranslate
    };
  },

  /**
 * Checks if a modal is already present in the DOM
 * @returns {boolean} True if a modal exists
 */
checkModalExists: function() {
    return document.getElementById('privacyLensModal') !== null;
  },
  
  /**
   * Gets the existing modal if present
   * @returns {Object|null} Modal object or null if not found
   */
  getExistingModal: function() {
    const modal = document.getElementById('privacyLensModal');
    if (!modal) return null;
    
    const header = document.getElementById('privacyLensModalHeader');
    const minimizeBtn = document.getElementById('minimizeModal');
    const closeBtn = document.getElementById('closeModal');
    
    return {
      modal,
      header,
      minimizeBtn,
      closeBtn,
      remove: () => {
        modal.remove();
        // Also remove any associated stylesheet if possible
        const styleElement = document.querySelector('style[data-privacy-lens-styles]');
        if (styleElement) styleElement.remove();
      }
    };
  },

  /**
   * Injects and initializes the modal
   * @param {string[]} domains - Array of domains to display
   * @param {boolean} showSingleDomain - Whether to show single domain view
   * @returns {Object} Object with modal elements and utility methods
   */
  injectModal: function(domains = [], showSingleDomain = false) {
    // Check if modal already exists
    const existingModal = this.checkModalExists();
    if (existingModal) {
        console.log("Modal already exists, reusing existing one");
        return this.getExistingModal();
    }

    // Add styles
    const styleSheet = PrivacyLens.utils.injectStyles(PrivacyLens.styles.modalStyles);

    // Add modal HTML
    const modalWrapper = document.createElement('div');
    modalWrapper.innerHTML = this.createModalHTML(showSingleDomain);
    document.body.appendChild(modalWrapper.firstElementChild);

    // Get modal elements
    const modal = document.getElementById('privacyLensModal');
    const header = document.getElementById('privacyLensModalHeader');
    const minimizeBtn = document.getElementById('minimizeModal');
    const closeBtn = document.getElementById('closeModal');

    // Make modal draggable
    const draggable = this._makeDraggable(modal, header);

    // Add minimize functionality
    const toggleMinimized = (e) => {
      modal.classList.toggle('minimized');
      minimizeBtn.textContent = modal.classList.contains('minimized') ? '+' : '−';

      // Update transform to correctly restore position
      modal.style.transform = modal.classList.contains('minimized')
        ? 'translate3d(310px, 0, 0)'
        : `translate3d(${draggable.xOffset()}px, ${draggable.yOffset()}px, 0)`;
    };

    // Add event listeners
    minimizeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMinimized();
    });

    header.addEventListener('click', (e) => {
      if (modal.classList.contains('minimized') && e.target !== minimizeBtn) {
        toggleMinimized();
      }
    });

    closeBtn.addEventListener('click', () => {
      modal.remove();
      styleSheet.remove();
    });

    return {
      modal,
      header,
      minimizeBtn,
      closeBtn,
      remove: () => {
        modal.remove();
        styleSheet.remove();
      }
    };
  }
};
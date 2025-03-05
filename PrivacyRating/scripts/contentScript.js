// contentScript.js - Main entry point for the extension

// Track if modal is open
let isModalOpen = false;
let modalInstance = null;

// Initialize based on the current page
function initialize() {
  // Check if we're on Google Search
  if (window.location.hostname === "www.google.com" && window.location.pathname === "/search") {
    console.log("PrivacyLens: Google search page detected");
    PrivacyLens.googleSearch.handleGoogleSearch();
  }
}

// Handle messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Check if modal is already open
  if (message.action === "isModalOpen") {
    sendResponse({isOpen: isModalOpen});
    return true;
  }
  
  // Focus existing modal
  if (message.action === "focusModal") {
    if (modalInstance && modalInstance.modal) {
      // Ensure modal is not minimized
      if (modalInstance.modal.classList.contains('minimized')) {
        modalInstance.modal.classList.remove('minimized');
        if (modalInstance.minimizeBtn) {
          modalInstance.minimizeBtn.textContent = '−';
        }
      }
      
      // Apply a subtle animation to draw attention
      modalInstance.modal.style.animation = 'privacy-lens-pulse 0.5s ease';
      setTimeout(() => {
        modalInstance.modal.style.animation = '';
      }, 500);
    }
    sendResponse({status: "modal_focused"});
    return true;
  }
  
  // Check current site
  if (message.action === "checkCurrentSite") {
    console.log("PrivacyLens: Checking privacy for current site");
    
    // Only inject modal if not already open
    if (!isModalOpen) {
      // Inject modal and show single domain view
      modalInstance = PrivacyLens.modal.injectModal([], true);
      isModalOpen = true;
      
      // Store reference to remove function for cleanup
      const originalRemove = modalInstance.remove;
      modalInstance.remove = function() {
        originalRemove();
        isModalOpen = false;
        modalInstance = null;
      };
      
      // Add event listener to update state when modal is closed
      if (modalInstance.closeBtn) {
        const originalClickHandler = modalInstance.closeBtn.onclick;
        modalInstance.closeBtn.onclick = function(e) {
          if (originalClickHandler) {
            originalClickHandler.call(this, e);
          }
          isModalOpen = false;
          modalInstance = null;
        };
      }
      
      // Initialize the single domain view
      PrivacyLens.domainAnalysis.populateSingleDomainView();
    }
    
    sendResponse({status: isModalOpen ? "modal_opened" : "modal_already_open"});
  }
  return true;
});

// Add pulse animation for the focus effect
const addPulseAnimation = () => {
  const styleElement = document.createElement('style');
  styleElement.textContent = `
    @keyframes privacy-lens-pulse {
      0% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
      50% { box-shadow: 0 0 0 4px rgba(97, 65, 172, 0.4); }
      100% { box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
    }
  `;
  document.head.appendChild(styleElement);
};

// Run initialization
initialize();
addPulseAnimation();
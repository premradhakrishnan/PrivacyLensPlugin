// contentScript.js

// Modal styles
// Updated modal styles
const modalStyles = `
.privacy-lens-modal {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 350px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  z-index: 10000;
  transition: transform 0.3s ease;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.privacy-lens-modal.minimized {
  transform: translateX(calc(100% - 40px));
}

.privacy-lens-modal.minimized .privacy-lens-modal-header {
  cursor: pointer;
}

.privacy-lens-modal.minimized::after {
  content: 'Click to restore';
  position: absolute;
  left: 40px;
  top: 50%;
  transform: rotate(-90deg) translateX(-50%);
  transform-origin: 0 0;
  color: #ffffff;
  font-size: 12px;
  white-space: nowrap;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
  pointer-events: none;
}

.privacy-lens-modal-header {
  /*background: linear-gradient(135deg, #0073e6 0%, #005bb8 100%);*/
  color: white;
  padding: 12px 16px;
  border-radius: 12px 12px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: move;
}

.privacy-lens-modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.2px;
}

.privacy-lens-modal-header p {
  margin: 4px 0 0;
  font-size: 13px;
  opacity: 0.9;
}

.privacy-lens-logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.privacy-lens-logo {
  width: 32px;
  height: 32px;
}

.privacy-lens-controls {
  display: flex;
  gap: 8px;
}

.privacy-lens-button {
  /*background: rgba(255, 255, 255, 0.1);*/
  border: none;
  /*color: white;*/
  cursor: pointer;
  padding: 4px 8px;
  font-size: 16px;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.privacy-lens-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.privacy-lens-modal-content {
  padding: 16px;
}

.privacy-lens-modal-content h3 {
  color: #1a73e8;
  font-size: 16px;
  margin: 0 0 16px;
  font-weight: 600;
}

#domain-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

#domain-list li {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid #eef1f5;
  transition: background-color 0.2s ease;
}

#domain-list li:hover {
  background: #f5f8ff;
}

#domain-list li img {
  margin-right: 12px;
  border-radius: 3px;
}

#domain-list li span {
  color: #1f2937;
  font-size: 14px;
}

#domain-list li span:last-child {
  font-weight: 600;
  margin-left: auto;
}

#feedback {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #eef1f5;
  text-align: center;
}

#feedback p {
  color: #4b5563;
  font-size: 14px;
  margin: 0 0 12px;
}

#feedback button {
  background: none;
  border: 1px solid #e5e7eb;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin: 0 4px;
}

#feedback button:hover {
  background: #f8f9fa;
  transform: translateY(-1px);
}
`;

// Modal styles remain the same as before, just adding this new function
function getExtensionURL(path) {
  return chrome.runtime.getURL(path);
}

// Modal HTML template
function createModalHTML() {

  const logoUrl = getExtensionURL('images/privacy_lens_logo.png');

  return `
    <div class="privacy-lens-modal" id="privacyLensModal">
      <div class="privacy-lens-modal-header" id="privacyLensModalHeader">
        <div class="privacy-lens-logo-section">
          <img 
            src="${logoUrl}"
            alt="PrivacyLens Logo"
            class="privacy-lens-logo"
            style="width: 245px; height: 70px; object-fit: contain;"
          />
        </div>
        <div class="privacy-lens-controls">
          <button class="privacy-lens-button" id="minimizeModal">−</button>
          <button class="privacy-lens-button" id="closeModal">×</button>
        </div>
      </div>
      <div class="privacy-lens-modal-content">
        <div id="site-list">
          <h3 style="margin-top: 0; color: #0073e6; font-size: 16px;">Websites & their Privacy Scores</h3>
          <ul id="domain-list" style="list-style: none; padding: 0; margin: 12px 0;"></ul>
        </div>
        <div id="feedback" style="margin-top: 16px; text-align: center; border-top: 1px solid #eee; padding-top: 16px;">
          <p style="margin: 0 0 8px; color: #666;">Was this helpful?</p>
          <button id="thumbs-up" style="font-size: 1.2em; margin: 0 4px; background: none; border: none; cursor: pointer;">👍</button>
          <button id="thumbs-down" style="font-size: 1.2em; margin: 0 4px; background: none; border: none; cursor: pointer;">👎</button>
        </div>
      </div>
    </div>
  `;
}

// Function to inject and initialize modal
// Function to inject and initialize modal
function injectModal(domains) {
  // Add styles
  const styleSheet = document.createElement('style');
  styleSheet.textContent = modalStyles;
  document.head.appendChild(styleSheet);

  // Add modal HTML
  const modalWrapper = document.createElement('div');
  modalWrapper.innerHTML = createModalHTML();
  document.body.appendChild(modalWrapper.firstElementChild);

  // Initialize modal functionality
  const modal = document.getElementById('privacyLensModal');
  const header = document.getElementById('privacyLensModalHeader');
  const minimizeBtn = document.getElementById('minimizeModal');
  const closeBtn = document.getElementById('closeModal');
  
  // Make modal draggable
  let isDragging = false;
  let currentX;
  let currentY;
  let initialX;
  let initialY;
  let xOffset = 0;
  let yOffset = 0;

  header.addEventListener('mousedown', dragStart);
  header.addEventListener('click', (e) => {
    if (modal.classList.contains('minimized') && e.target !== minimizeBtn) {
        toggleMinimized(e);
    }
});

  document.addEventListener('mousemove', drag);
  document.addEventListener('mouseup', dragEnd);

  function dragStart(e) {
    // Don't start drag if clicking minimize/close buttons
    if (e.target === minimizeBtn || e.target === closeBtn) {
      return;
    }
    initialX = e.clientX - xOffset;
    initialY = e.clientY - yOffset;
    if (e.target === header || header.contains(e.target)) {
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
      setTranslate(currentX, currentY, modal);
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

  // Minimize/maximize functionality
  function toggleMinimized(e) {
    if (isDragging) return; // Prevent toggling while dragging

    modal.classList.toggle('minimized');
    minimizeBtn.textContent = modal.classList.contains('minimized') ? '+' : '−';

    // Update transform to correctly restore position
    modal.style.transform = modal.classList.contains('minimized') 
        ? 'translate3d(310px, 0, 0)' 
        : `translate3d(${xOffset}px, ${yOffset}px, 0)`;

    console.log("Modal state changed. Minimized:", modal.classList.contains('minimized'));
}

  

  // Add event listeners for minimize/maximize
  minimizeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMinimized(e);
});


  // Close functionality
  closeBtn.addEventListener('click', () => {
    modal.remove();
    styleSheet.remove();
  });

  // Initialize domain list population
  populateDomainList(domains);
}

// Separate function to populate domain list
function populateDomainList(domains) {
  const domainList = document.getElementById('domain-list');
  const appUrl = config.appUrl;

  fetch(appUrl + '/privacyRating', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domains })
  })
  .then(res => res.json())
  .then(responseJson => {
    if (responseJson.status === "success" && Array.isArray(responseJson.data)) {
      domains.forEach(domain => {
        const ratingData = responseJson.data.find(rating =>
          rating.domain_url.includes(domain) ||
          rating.domain_name.toLowerCase() === domain.toLowerCase()
        );

        const li = document.createElement("li");
        li.style.display = 'flex';
        li.style.alignItems = 'center';
        li.style.padding = '8px 0';
        li.style.borderBottom = '1px solid #eee';

        const favicon = document.createElement("img");
        favicon.src = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=16`;
        favicon.style.marginRight = '8px';
        favicon.width = 16;
        favicon.height = 16;

        const domainText = document.createElement("span");
        domainText.textContent = domain;
        domainText.style.flexGrow = '1';

        const riskText = document.createElement("span");
        if (ratingData) {
          riskText.textContent = ratingData.riskLevel;
          riskText.style.color = ratingData.color;
        } else {
          riskText.textContent = "Unknown";
          riskText.style.color = "gray";
        }
        riskText.style.fontWeight = "bold";
        riskText.style.marginLeft = "8px";

        li.appendChild(favicon);
        li.appendChild(domainText);
        li.appendChild(riskText);
        domainList.appendChild(li);
      });
    }
  })
  .catch(err => console.error("Error fetching privacy ratings:", err));
}

// Main content script logic
const urlParams = new URLSearchParams(window.location.search);
const query = urlParams.get('q');
const appUrl = config.appUrl;

if (query) {
  fetch(appUrl + "/classify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query })
  })
    .then(response => response.json())
    .then(data => {
      if (data && data.classification) {
        if (data.classification.toLowerCase() === "health related") {
          console.log("Health-related query detected:", query);
          
          const resultElements = document.querySelectorAll("div.g");
          const urls = Array.from(resultElements)
            .map(result => {
              const link = result.querySelector("a");
              return link ? link.href : null;
            })
            .filter(url => url !== null);
          
          const domains = urls.map(url => {
            try {
              const urlObj = new URL(url);
              return urlObj.hostname.replace("www.", "");
            } catch (err) {
              console.error("Error parsing URL:", url, err);
              return null;
            }
          }).filter(domain => domain !== null);
          
          console.log("Extracted domains:", domains);
          
          // fetch(appUrl + "/domains", {
          //   method: "POST",
          //   headers: { "Content-Type": "application/json" },
          //   body: JSON.stringify({ domains })
          // })
          //   .then(response => response.json())
          //   .then(apiResponse => {
          //     console.log("Backend domains response:", apiResponse);
          //   })
          //   .catch(error => {
          //     console.error("Error sending domains to backend:", error);
          //   });
          
          // Inject the modal directly
          injectModal(domains);
        } else {
          console.log("Query is not health related:", data.classification);
        }
      } else {
        console.log("No classification data received.");
      }
    })
    .catch(error => {
      console.error("Error classifying query:", error);
    });
}
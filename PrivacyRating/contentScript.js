// contentScript.js

// Modal styles
// Updated modal styles
const modalStyles = `
.privacy-lens-modal {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 384px; /* w-96 equivalent */
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  z-index: 10000;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  transition: transform 0.3s ease;
}

.privacy-lens-modal.minimized {
  transform: translateX(calc(100% - 40px));
}

.privacy-lens-header {
  padding: 16px;
  border-radius: 8px 8px 0 0;
  background-color: #F8F7FF;
  /*background: linear-gradient(135deg, #4282AA 0%, #6141AC 100%);*/
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid rgba(179, 218, 222, 0.5);
}

.privacy-lens-header-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.privacy-lens-logo {
  width: 48px;
  height: 48px;
}

.privacy-lens-title {
  color: white;
}

.privacy-lens-title h2 {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
}

.privacy-lens-title p {
  margin: 4px 0 0;
  font-size: 14px;
  opacity: 0.9;
}

.privacy-lens-controls {
  display: flex;
  gap: 8px;
}

.privacy-lens-button {
  background: none;
  border: none;
  
  cursor: pointer;
  padding: 4px;
  font-size: 20px;
  opacity: 1;
  transition: opacity 0.2s;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.privacy-lens-button:hover {
  opacity: 0.8;
}

.privacy-lens-content {
  padding: 16px;
  background-color: rgba(179, 218, 222, 0.1); /* Very light tint of #B3DADE */
}

.privacy-lens-content h3 {
  margin: 0 0 16px;
  color: #6141AC;
  font-weight: 600;
}

.privacy-lens-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.privacy-lens-item {
  display: flex;
  align-items: left;
  justify-content: space-between;
  
}

.privacy-lens-domain {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #4282AA;
}

.privacy-lens-favicon {
  width: 16px;
  height: 16px;
  margin-right: 10px;
  text-align: left;
}

.privacy-lens-domainText {
  color: #4282AA;
  flexgrow: 1;
  text-align: left;
}

.privacy-lens-risk {
  font-weight: 600;
}

.privacy-lens-risk.high {
  color:rgb(239, 152, 152);
}

.privacy-lens-risk.medium {
  color:rgb(217, 175, 127);
}

.privacy-lens-risk.low {
  color:rgb(118, 158, 145);
}

.privacy-lens-footer {
  margin-top: 24px;
  text-align: center;
}

.privacy-lens-link {
  display: inline-flex;
  align-items: center;
  color: #4282AA;
  text-decoration: none;
  margin-bottom: 16px;
}

.privacy-lens-link:hover {
  text-decoration: underline;
}

.privacy-lens-feedback {
  border-top: 1px solid rgba(179, 218, 222, 0.5);
  padding-top: 16px;
}

.privacy-lens-feedback p {
  margin: 0 0 8px;
  color: #6141AC;
  font-size: 14px;
}

.privacy-lens-feedback-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.privacy-lens-feedback-button {
  background: none;
  border: none;
  color: #4282AA;
  cursor: pointer;
  padding: 8px;
  transition: transform 0.2s;
}

.privacy-lens-feedback-button:hover {
  transform: scale(1.1);
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
      <div class="privacy-lens-header" id="privacyLensModalHeader">
        <div class="privacy-lens-header-content">
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
      <div class="privacy-lens-content">
          <h3>Websites & their Privacy Scores</h3>
          <ul id="domain-list" class="privacy-lens-list"></ul>

           <div class="privacy-lens-footer">
            <a href="https://www.privacylens.info" target="_blank" rel="noopener noreferrer" class="privacy-lens-link">
              Click here for detailed results →
            </a>
            <div id="feedback" class="privacy-lens-feedback">
              <p>Was this helpful?</p>
              <div class="privacy-lens-feedback-buttons">
                <button class="privacy-lens-feedback-button">👍</button>
                <button class="privacy-lens-feedback-button">👎</button>
              </div>
            </div>
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
        li.className = "privacy-lens-item";

        const div = document.createElement("div");
        div.className = "privacy-lens-domain";

        const favicon = document.createElement("img");
        favicon.src = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=16`;
        favicon.className = "privacy-lens-favicon";

        const domainText = document.createElement("span");
        domainText.className = "privacy-lens-domainText";
        domainText.textContent = domain;

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

        li.appendChild(div);
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
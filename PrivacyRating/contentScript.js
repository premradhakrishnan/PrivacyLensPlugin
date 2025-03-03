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
  width: 245px;
  height: 70px;
  object-fit: contain;
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
  color: #6141AC;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;
}

.privacy-lens-button:hover {
  opacity: 0.8;
}

.privacy-lens-content {
  padding: 10px 5px 0px 5px;
  /*background-color: rgba(179, 218, 222, 0.1);*/
}

.privacy-lens-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 16px;
}

.privacy-lens-table th {
  text-align: left;
  color: #6141AC;
  padding: 0 8px 8px 8px;
  font-weight: 600;
  font-size: 14px;
}

.privacy-lens-table td {
  padding: 4px;
  vertical-align: middle;
}

.privacy-lens-domain-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4282AA;
  font-size: small;
}

.privacy-lens-favicon {
  width: 16px;
  height: 16px;
}

.privacy-lens-rating {
  text-align: right;
  font-weight: 600;
  font-size: small;
}

.privacy-lens-rating.strong {
  color: #78BF26;
}

.privacy-lens-rating.moderate {
  color: #FFA500;
}

.privacy-lens-rating.weak {
  color: #DE0E3F;
}

.privacy-lens-footer {
  padding: 8px 8px 8px 8px;
  border-radius: 0 0 8px 8px;
  display: flex;
  align-items: center;
  border-top: 1px solid rgba(179, 218, 222, 0.5);
  font-size: smaller;
  color: #6141AC;
}

.privacy-lens-link {
  text-decoration: none;
  color: #6141AC;
}
  
a:visited {
  color: #6141AC;
}

.privacy-lens-link:hover {
  text-decoration: underline;
}

.privacy-lens-feedback {
  display: flex;
  align-items: center;
  gap: 8px;
}

.privacy-lens-feedback span {
  font-size: smaller;
}

.privacy-lens-feedback-button {
  background: none;
  border: none;
  color: #4282AA;
  cursor: pointer;
  padding: 4px;
  transition: transform 0.2s;
  font-size: smaller;
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
  const appUrl = config.appUrl;

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
  startAutoPopulate(domains);
}

function startAutoPopulate(domains) {
  // Initial call
  populateDomainList(domains);

  // Repeat every 60 seconds
  setInterval(() => {
    console.log("Re-populating domain list...");
    populateDomainList(domains);
  }, 60 * 1000);
}

// Separate function to populate domain list
function populateDomainList(domains) {
  const domainList = document.getElementById('domain-list');
  domainList.innerHTML = "";
  const hubUrl = config.hubUrl;
  const appUrl = config.appUrl;
  const detailedResultsLink = document.getElementById('detailed-results-link');

  // 1) Remove duplicates so each domain is only shown once
  const uniqueDomains = [...new Set(domains)];

  // Update the detailed results link with unique domains
  const domainParams = uniqueDomains.map(domain => `domains[]=${encodeURIComponent(domain)}`).join('&');
  detailedResultsLink.href = appUrl + `/detailed-results?${domainParams}`;

  // Fetch ratings for the unique domains
  fetch(hubUrl + '/privacyRating', {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Send uniqueDomains to the server
    body: JSON.stringify({ domains: uniqueDomains })
  })
  .then(res => res.json())
  .then(responseJson => {
    if (responseJson.status === "success" && Array.isArray(responseJson.data)) {
      // 2) Iterate over uniqueDomains instead of the original array
      uniqueDomains.forEach(domain => {
        console.log(domain);
        
        // Try to find a matching rating for this domain
        const ratingData = responseJson.data.find(rating =>
          rating.domain_url.includes(domain) ||
          rating.domain_name.toLowerCase() === domain.toLowerCase()
        );

        const tr = document.createElement("tr");
        
        // Domain cell with favicon
        const domainTd = document.createElement("td");
        const domainDiv = document.createElement("div");
        domainDiv.className = "privacy-lens-domain-cell";
        
        const favicon = document.createElement("img");
        favicon.src = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=16`;
        favicon.className = "privacy-lens-favicon";
        
        const domainText = document.createElement("span");
        domainText.textContent = domain;
        
        domainDiv.appendChild(favicon);
        domainDiv.appendChild(domainText);
        domainTd.appendChild(domainDiv);
        
        // Rating cell
        const ratingTd = document.createElement("td");
        ratingTd.className = "privacy-lens-rating";
        
        if (ratingData && ratingData.riskLevel) {
          const riskLevel = ratingData.riskLevel.toLowerCase();
          ratingTd.textContent = riskLevel;
          ratingTd.classList.add(riskLevel);
        } else {
          // 2) Show “loading” message/spinner instead of "Unknown"
          ratingTd.innerHTML = `
            <img 
              src="images/loading.gif" 
              alt="Calculating..." 
              style="width:16px; height:16px; vertical-align:middle;"
            />
            <span style="margin-left:8px;">Calculating...</span>
          `;
          ratingTd.style.color = "gray";
        }
        
        tr.appendChild(domainTd);
        tr.appendChild(ratingTd);
        domainList.appendChild(tr);
      });
    }
  })
  .catch(err => console.error("Error fetching privacy ratings:", err));
}


// Main content script logic
const urlParams = new URLSearchParams(window.location.search);
const query = urlParams.get('q');
const hubUrl = config.hubUrl;

if (query) {
  fetch(hubUrl + "/classify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
    mode: "cors"
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
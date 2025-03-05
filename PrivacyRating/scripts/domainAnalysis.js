// domainAnalysis.js - Functions to analyze and display domain data

// Define PrivacyLens namespace if it doesn't exist
window.PrivacyLens = window.PrivacyLens || {};

// Add domain analysis functionality to the namespace
PrivacyLens.domainAnalysis = {
  /**
   * Populates the domain list for multiple domains (search results)
   * @param {string[]} domains - Array of domains to display
   */
  populateDomainList: function(domains) {
    const domainList = document.getElementById('domain-list');
    if (!domainList) return;
    
    domainList.innerHTML = "";
    const hubUrl = PrivacyLensConfig.hubUrl;
    const appUrl = PrivacyLensConfig.appUrl;
    const detailedResultsLink = document.getElementById('detailed-results-link');

    // Remove duplicates so each domain is only shown once
    const uniqueDomains = [...new Set(domains)];

    // Update the detailed results link with unique domains
    const domainParams = uniqueDomains.map(domain => `domains[]=${encodeURIComponent(domain)}`).join('&');
    detailedResultsLink.href = `${appUrl}/detailed-results?${domainParams}`;

    // Fetch ratings for the unique domains
    fetch(`${hubUrl}/privacyRating`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domains: uniqueDomains })
    })
    .then(res => res.json())
    .then(responseJson => {
      if (responseJson.status === "success" && Array.isArray(responseJson.data)) {
        // Iterate over uniqueDomains to maintain order
        uniqueDomains.forEach(domain => {
          console.log(domain);
          
          // Try to find a matching rating for this domain
          const ratingData = responseJson.data.find(rating =>
            rating.domain_url?.includes(domain) ||
            rating.domain_name?.toLowerCase() === domain.toLowerCase()
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
            // Show "loading" message/spinner
            ratingTd.innerHTML = `
              <img 
                src="${PrivacyLens.utils.getExtensionURL('images/loading.gif')}" 
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
  },

  /**
   * Starts auto-population of domain list at regular intervals
   * @param {string[]} domains - Array of domains to display
   */
  startAutoPopulate: function(domains) {
    // Initial call
    this.populateDomainList(domains);

    // Repeat every 60 seconds
    setInterval(() => {
      console.log("Re-populating domain list...");
      this.populateDomainList(domains);
    }, 60 * 1000);
  },

  /**
   * Populates a single domain view
   * @param {string} domain - Domain to display
   */
  populateSingleDomainView: function(domain = null) {
    // If no domain provided, use current
    domain = domain || PrivacyLens.utils.getCurrentDomain();
    
    const domainList = document.getElementById('domain-list');
    const summaryContent = document.getElementById('privacy-summary-content');
    const summaryTitle = document.querySelector('.privacy-lens-summary-title');
    const hubUrl = PrivacyLensConfig.hubUrl;
    const appUrl = PrivacyLensConfig.appUrl;
    const detailedResultsLink = document.getElementById('detailed-results-link');

    // Set detailed results link
    detailedResultsLink.href = `${appUrl}/detailed-results?domains[]=${encodeURIComponent(domain)}`;

    // First check if the site is health-related
    fetch(`${hubUrl}/isHealthRelated`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: window.location.href })
    })
    .then(res => res.json())
    .then(healthResponse => {
      const isHealthRelated = healthResponse.isHealthRelated || false;
      
      
    })
    .catch(err => {
      console.error("Error fetching data:", err);
      if (summaryContent) {
        summaryTitle.textContent = "Error";
        summaryContent.textContent = "We encountered an error while analyzing this website. Please try again later.";
      }
    });
  }
};

function getRating(){
    // Now get the privacy rating
    return fetch(`${hubUrl}/privacyRating`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domains: [domain] })
      })
      .then(res => res.json())
      .then(ratingResponse => {
        if (ratingResponse.status === "success" && Array.isArray(ratingResponse.data) && ratingResponse.data.length > 0) {
          const ratingData = ratingResponse.data[0];
          
          // Update summary
          if (isHealthRelated) {
            summaryTitle.textContent = "Health Privacy Analysis";
            summaryContent.textContent = ratingData.summary || 
              `This website appears to be health-related with a ${ratingData.riskLevel.toLowerCase()} privacy rating. ${ratingData.description || ''}`;
          } else {
            summaryTitle.textContent = "Privacy Analysis";
            summaryContent.textContent = ratingData.summary || 
              `This website has a ${ratingData.riskLevel.toLowerCase()} privacy rating. ${ratingData.description || ''}`;
          }

          // Add domain to the list
          if (domainList) {
            domainList.innerHTML = "";
            
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
            
            if (ratingData.riskLevel) {
              const riskLevel = ratingData.riskLevel.toLowerCase();
              ratingTd.textContent = riskLevel;
              ratingTd.classList.add(riskLevel);
            } else {
              ratingTd.textContent = "unknown";
              ratingTd.style.color = "gray";
            }
            
            tr.appendChild(domainTd);
            tr.appendChild(ratingTd);
            domainList.appendChild(tr);
          }
        } else {
          // Handle no rating data
          summaryTitle.textContent = "Privacy Analysis";
          summaryContent.textContent = `We're currently analyzing the privacy practices of ${domain}. Check back soon for a detailed report.`;
        }
      });
}

// Add this function to your domainAnalysis.js file

/**
 * Fetches detailed privacy rating for a single domain
 * @param {string} domain - Domain to analyze
 * @returns {Promise} Promise that resolves with the detailed domain data
 */
PrivacyLens.domainAnalysis.fetchDetailedDomainRating = function(domain) {
    const hubUrl = window.PrivacyLensConfig.hubUrl;
    
    return fetch(`${hubUrl}/privacyRatingSingleDomain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain })
    })
    .then(res => res.json())
    .then(response => {
      if (response.status === "success" && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch domain rating");
      }
    });
  };
  
  /**
   * Creates a detailed privacy report UI for a single domain
   * @param {Object} ratingData - Rating data from fetchDetailedDomainRating
   * @returns {HTMLElement} The generated report element
   */
  PrivacyLens.domainAnalysis.createDetailedReport = function(ratingData) {
    const reportContainer = document.createElement("div");
    reportContainer.className = "privacy-lens-detailed-report";
    
    // Create header
    const header = document.createElement("div");
    header.className = "privacy-lens-report-header";
    
    const domainTitle = document.createElement("h2");
    domainTitle.textContent = ratingData.domain_name;
    domainTitle.className = "privacy-lens-domain-title";
    
    const ratingBadge = document.createElement("div");
    
    // Handle case when riskLevel is null, undefined, or empty
    const riskLevel = ratingData.riskLevel || "pending";
    const riskLevelClass = riskLevel.toLowerCase();
    
    ratingBadge.className = `privacy-lens-rating-badge ${riskLevelClass}`;
    ratingBadge.textContent = riskLevel;
    
    // Use default color if not provided
    if (ratingData.color) {
      ratingBadge.style.backgroundColor = ratingData.color;
    } else {
      // Default colors based on risk level
      const colorMap = {
        "strong": "#78BF26",
        "moderate": "#FFA500",
        "weak": "#DE0E3F",
        "pending": "#808080" // Gray for pending analysis
      };
      ratingBadge.style.backgroundColor = colorMap[riskLevelClass] || "#808080";
    }
    
    header.appendChild(domainTitle);
    header.appendChild(ratingBadge);
    reportContainer.appendChild(header);
    
    // Create summary section
    const summarySection = document.createElement("div");
    summarySection.className = "privacy-lens-summary-section";
    
    const summaryTitle = document.createElement("h3");
    summaryTitle.textContent = "Summary";
    summarySection.appendChild(summaryTitle);
    
    const summaryText = document.createElement("p");
    summaryText.textContent = ratingData.summary;
    summarySection.appendChild(summaryText);
    
    reportContainer.appendChild(summarySection);
    
    // Add positives if available
    // if (ratingData.details && ratingData.details.positives && ratingData.details.positives.length > 0) {
    //   const positivesSection = document.createElement("div");
    //   positivesSection.className = "privacy-lens-positives-section";
      
    //   const positivesTitle = document.createElement("h3");
    //   positivesTitle.textContent = "Strengths";
    //   positivesSection.appendChild(positivesTitle);
      
    //   const positivesList = document.createElement("ul");
    //   ratingData.details.positives.forEach(positive => {
    //     const item = document.createElement("li");
    //     item.textContent = positive;
    //     positivesList.appendChild(item);
    //   });
      
    //   positivesSection.appendChild(positivesList);
    //   reportContainer.appendChild(positivesSection);
    // }
    
    // // Add concerns if available
    // if (ratingData.details && ratingData.details.concerns && ratingData.details.concerns.length > 0) {
    //   const concernsSection = document.createElement("div");
    //   concernsSection.className = "privacy-lens-concerns-section";
      
    //   const concernsTitle = document.createElement("h3");
    //   concernsTitle.textContent = "Concerns";
    //   concernsSection.appendChild(concernsTitle);
      
    //   const concernsList = document.createElement("ul");
    //   ratingData.details.concerns.forEach(concern => {
    //     const item = document.createElement("li");
    //     item.textContent = concern;
    //     concernsList.appendChild(item);
    //   });
      
    //   concernsSection.appendChild(concernsList);
    //   reportContainer.appendChild(concernsSection);
    // }
    
    // Add policy link if available
    if (ratingData.details && ratingData.details.policy_url) {
      const policySection = document.createElement("div");
      policySection.className = "privacy-lens-policy-section";
      
      const policyLink = document.createElement("a");
      policyLink.href = ratingData.details.policy_url;
      policyLink.textContent = "View Privacy Policy";
      policyLink.target = "_blank";
      policyLink.className = "privacy-lens-policy-link";
      
      policySection.appendChild(policyLink);
      reportContainer.appendChild(policySection);
    }
    
    // Add some appropriate CSS
    const styleElement = document.createElement("style");
    styleElement.textContent = `
      .privacy-lens-detailed-report {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        color: #333;
        padding: 15px 0px 0px 0px;
        margin-bottom: 15px;
        border-radius: 6px;
        font-size: 12px;
      }
      
      .privacy-lens-report-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15px;
      }
      
      .privacy-lens-domain-title {
        font-size: 18px;
        margin: 0;
        color: #4282AA;
      }
      
      .privacy-lens-rating-badge {
        font-weight: bold;
        padding: 5px 10px;
        border-radius: 4px;
        color: white;
        font-size: 14px;
      }
      
      .privacy-lens-rating-badge.strong {
        background-color: #78BF26;
      }
      
      .privacy-lens-rating-badge.moderate {
        background-color: #FFA500;
      }
      
      .privacy-lens-rating-badge.weak {
        background-color: #DE0E3F;
      }
      
      .privacy-lens-summary-section, 
      .privacy-lens-positives-section, 
      .privacy-lens-concerns-section,
      .privacy-lens-policy-section {
        margin-bottom: 15px;
      }
      
      .privacy-lens-summary-section h3,
      .privacy-lens-positives-section h3,
      .privacy-lens-concerns-section h3 {
        font-size: 16px;
        color: #6141AC;
        margin: 0 0 10px 0;
      }
      
      .privacy-lens-policy-link {
        display: inline-block;
        color: #4282AA;
        text-decoration: none;
        padding: 5px 0;
      }
      
      .privacy-lens-policy-link:hover {
        text-decoration: underline;
      }
    `;
    reportContainer.appendChild(styleElement);
    
    return reportContainer;
  };
  
  /**
   * Updates the single domain view with detailed information
   * @param {string} domain - Domain to analyze
   * @param {HTMLElement} containerElement - Element to append the report to
   */
  PrivacyLens.domainAnalysis.updateSingleDomainView = function(domain, containerElement) {
    const summaryContent = document.getElementById('privacy-summary-content');
    const summaryTitle = document.querySelector('.privacy-lens-summary-title');
    
    if (summaryTitle) {
      summaryTitle.textContent = "Loading privacy assessment...";
    }
    
    if (summaryContent) {
      summaryContent.textContent = `Analyzing the privacy practices of ${domain}...`;
    }
    
    this.fetchDetailedDomainRating(domain)
      .then(ratingData => {
        // Update the summary section
        if (summaryTitle) {
          summaryTitle.textContent = `Privacy Rating: ${ratingData.riskLevel}`;
        }
        
        if (summaryContent) {
          // Remove existing content
          summaryContent.innerHTML = '';
          
          // Create and append the detailed report
          const reportElement = this.createDetailedReport(ratingData);
          summaryContent.appendChild(reportElement);
        }
        
        // Hide duplicate information in the footer table
        const domainListTable = document.getElementById('domain-list');
        if (domainListTable) {
          domainListTable.closest('.privacy-lens-table').style.display = 'none';
        }
      })
      .catch(error => {
        console.error("Error fetching detailed domain rating:", error);
        if (summaryTitle) {
          summaryTitle.textContent = "Error";
        }
        if (summaryContent) {
          summaryContent.textContent = "We encountered an error while analyzing this website. Please try again later.";
        }
      });
  };
  
  // Update the populateSingleDomainView method to use the new function
  PrivacyLens.domainAnalysis.populateSingleDomainView = function(domain = null) {
    // If no domain provided, use current
    domain = domain || PrivacyLens.utils.getCurrentDomain();
    
    const summaryContent = document.getElementById('privacy-summary-content');
    const appUrl = PrivacyLensConfig.appUrl;
    const detailedResultsLink = document.getElementById('detailed-results-link');
  
    // Set detailed results link
    if (detailedResultsLink) {
      detailedResultsLink.href = `${appUrl}/detailed-results?domains[]=${encodeURIComponent(domain)}`;
    }
  
    // Update with the detailed view
    this.updateSingleDomainView(domain, summaryContent);
    
    // We don't need to populate the domain list for single domain view
    // as we're hiding that table completely
  };
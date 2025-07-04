// googleSearch.js - Google search specific functionality

// Ensure config is defined
// window.PrivacyLensConfig = window.PrivacyLensConfig || {
//   apiUrl: "https://api.privacylens.info",
//   appUrl: "https://www.privacylens.info"
//   };
  const apiUrl = PrivacyLensConfig.apiUrl;
  const appUrl = PrivacyLensConfig.appUrl;

  // Define PrivacyLens namespace if it doesn't exist
  window.PrivacyLens = window.PrivacyLens || {};
  
  // Add Google search functionality to the namespace
  PrivacyLens.googleSearch = {
    /**
     * Extracts domains from Google search results
     * @returns {string[]} Array of extracted domains
     */
    extractDomainsFromSearchResults: function() {
      const resultElements = document.querySelectorAll("div.yuRUbf");
      console.log("Search results:", resultElements);
      const urls = Array.from(resultElements)
        .map(result => {
          console.log("Result:", result);
          const link = result.querySelector("a");
          console.log("Link:", link);
          return link ? link.href : null;
        })
        .filter(url => url !== null);
  
      const domains = urls.map(url => PrivacyLens.utils.extractDomain(url))
        .filter(domain => domain !== null);
  
      console.log("Extracted domains:", domains);
      return domains;
    },
  
    /**
     * Checks if a search query is health-related
     * @param {string} query - Search query to check
     * @returns {Promise<boolean>} Promise resolving to true if health-related
     */
    isQueryHealthRelated: function(query) {
      return fetch(`${PrivacyLensConfig.apiUrl}/classify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
        mode: "cors"
      })
        .then(response => response.json())
        .then(data => {
          if (data && data.classification) {
            return data.classification.toLowerCase() === "health related";
          }
          return false;
        })
        .catch(error => {
          console.error("Error classifying query:", error);
          return false;
        });
    },
  
    /**
     * Handles the Google search page
     */
    handleGoogleSearch: function() {
      const urlParams = new URLSearchParams(window.location.search);
      const query = urlParams.get('q');
      
      if (query) {
        this.isQueryHealthRelated(query).then(isHealthRelated => {
          if (isHealthRelated) {
            console.log("Health-related query detected:", query);
            const domains = this.extractDomainsFromSearchResults();
            PrivacyLens.modal.injectModal(domains, false);
            
            // Start auto-population of domain list
            PrivacyLens.domainAnalysis.startAutoPopulate(domains);
          } else {
            console.log("Query is not health related:", query);
          }
        });
      }
    }
  };
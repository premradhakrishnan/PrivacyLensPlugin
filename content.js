console.log("Content script is running...");

const domains = new Set(); // Use a Set to ensure unique domain names

// Function to extract the domain name from a URL
function extractDomain(url) {
  try {
    const hostname = new URL(url).hostname; // Extracts the hostname (e.g., www.example.com)
    return hostname.replace("www.", ""); // Remove "www." for a cleaner domain name
  } catch (e) {
    console.error("Error extracting domain from URL:", url, e);
    return null; // Return null if the URL is invalid
  }
}

// Use MutationObserver to handle dynamically loaded results
const observer = new MutationObserver(() => {
  document.querySelectorAll("a[href]").forEach((link) => {
    const url = link.href;
    const domain = extractDomain(url);

    // Filter: Add only valid, unique domains
    if (domain && !domains.has(domain)) {
      domains.add(domain); // Add to the Set
      console.log("Extracted domain:", domain);
    }
  });

  // Send the unique domains to the background script for storage
  if (domains.size > 0) {
    chrome.runtime.sendMessage({ type: "storeDomains", data: Array.from(domains) });
  }
});

// Start observing changes in the body
observer.observe(document.body, { childList: true, subtree: true });
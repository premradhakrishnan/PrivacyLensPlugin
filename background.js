const storedDomains = new Set(); // Use a Set to store unique domains

// Listener for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "storeDomains") {
    // Add new unique domains from content script
    message.data.forEach((domain) => storedDomains.add(domain));
    saveToFile(); // Save domains to a file
  } else if (message.type === "getDomains") {
    // Send stored domains to the popup
    sendResponse({ data: Array.from(storedDomains) });
  }
});

// Function to save domains to a local file
function saveToFile() {
  const data = Array.from(storedDomains).join("\n"); // Convert Set to a newline-separated string
  const blob = new Blob([data], { type: "text/plain" });

  // Create a downloadable file using the Chrome downloads API
  const url = URL.createObjectURL(blob);
  chrome.downloads.download({
    url: url,
    filename: "extracted_domains.txt", // File will appear in the default Downloads folder
    conflictAction: "overwrite", // Overwrites existing file with the same name
  });
}
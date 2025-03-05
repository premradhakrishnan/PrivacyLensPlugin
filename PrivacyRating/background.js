// background.js
// This is a service worker that handles the extension's action (icon click)

// Handle the extension icon click
chrome.action.onClicked.addListener((tab) => {
  // Send a message to the content script to check the current site
  chrome.tabs.sendMessage(tab.id, { action: "checkCurrentSite" })
    .then(response => {
      console.log("Response from content script:", response);
    })
    .catch(error => {
      // Content script might not be loaded yet, inject it
      console.log("Content script not ready, injecting it now");
      
      // We need to inject all the modules in the correct order
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: [
          "config.js",
          "scripts/utils.js",
          "scripts/styles.js",
          "scripts/modal.js",
          "scripts/domainAnalysis.js",
          "scripts/googleSearch.js",
          "scripts/contentScript.js"
        ]
      })
      .then(() => {
        // Now send the message again after a short delay
        setTimeout(() => {
          chrome.tabs.sendMessage(tab.id, { action: "checkCurrentSite" })
            .catch(err => console.error("Error sending message after injection:", err));
        }, 100);
      })
      .catch(err => console.error("Error injecting content script:", err));
    });
});
document.addEventListener("DOMContentLoaded", () => {
    const resultsList = document.getElementById("results");
  
    // Request stored domains from the background script
    chrome.runtime.sendMessage({ type: "getDomains" }, (response) => {
      const domains = response.data || [];
      domains.forEach((domain) => {
        const listItem = document.createElement("li");
        listItem.textContent = domain;
        resultsList.appendChild(listItem);
      });
    });
  });
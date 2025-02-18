document.addEventListener("DOMContentLoaded", () => {
  const domainList = document.getElementById("domain-list");
  const thumbsUp = document.getElementById("thumbs-up");
  const thumbsDown = document.getElementById("thumbs-down");

  // Fetch stored domains from background script
  chrome.runtime.sendMessage({ type: "getDomains" }, (response) => {
      const domains = response.data || [];
      domains.forEach((domain) => {
          const li = document.createElement("li");

          const domainContainer = document.createElement("div");
          domainContainer.classList.add("domain-container");

          // Create favicon image element
          const favicon = document.createElement("img");
          favicon.src = `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=http://${domain}&size=16`;
          favicon.classList.add("favicon");

          // Create the domain name display
          const span = document.createElement("span");
          span.textContent = domain;

          domainContainer.appendChild(favicon);
          domainContainer.appendChild(span);

          // Generate a random privacy score (replace with actual logic)
          const score = Math.floor(Math.random() * 11);
          const { riskLevel, color } = getRiskLevel(score);

          // Create a text element for risk level
          const riskText = document.createElement("span");
          riskText.textContent = ` (${riskLevel})`;
          riskText.style.color = color;
          riskText.style.fontWeight = "bold";
          riskText.style.marginLeft = "8px";
          riskText.classList.add("risk-label");

          // Append elements to list item
          li.appendChild(favicon);
          li.appendChild(span);
          li.appendChild(riskText);
          li.appendChild(domainContainer);
          domainList.appendChild(li);
      });
  });

  // Determine risk level and color based on score
  function getRiskLevel(score) {
      if (score >= 8) return { riskLevel: "Low Risk", color: "green" };
      if (score >= 5) return { riskLevel: "Medium Risk", color: "orange" };
      return { riskLevel: "High Risk", color: "red" };
  }

  // Thumbs up/down event listeners
  thumbsUp.addEventListener("click", () => alert("Thanks for your feedback! 😊"));
  thumbsDown.addEventListener("click", () => alert("Thanks for your feedback! We'll improve! 🙏"));
});

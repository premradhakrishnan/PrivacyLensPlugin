document.addEventListener("DOMContentLoaded", () => {
  const domainList = document.getElementById("domain-list");
  const thumbsUp = document.getElementById("thumbs-up");
  const thumbsDown = document.getElementById("thumbs-down");

  // Fetch stored domains from background script
  chrome.runtime.sendMessage({ type: "getDomains" }, (response) => {
      const domains = response.data || [];
      domains.forEach((domain) => {
          const li = document.createElement("li");

          // Create the domain name display
          const span = document.createElement("span");
          span.textContent = domain;
          li.appendChild(span);

          // Generate a random privacy score (replace this with actual logic)
          const score = Math.floor(Math.random() * 11); // Random score 0-10

          // Get risk level and color
          const { riskLevel, color } = getRiskLevel(score);

          // Create a text element for risk level
          const riskText = document.createElement("span");
          riskText.textContent = ` (${riskLevel})`;
          riskText.style.color = color;
          riskText.style.fontWeight = "bold";
          riskText.style.marginLeft = "8px";

          li.appendChild(riskText);
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

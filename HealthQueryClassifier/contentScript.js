// contentScript.js
// (function() {
//     // Extract the search query parameter "q" from the URL.
//     const urlParams = new URLSearchParams(window.location.search);
//     const query = urlParams.get('q');

//     if (query) {
//       // Define a list of health-related keywords (you can expand this list as needed).
//       const healthKeywords = [
//         "health", "medicine", "medical", "disease",
//         "symptom", "treatment", "doctor", "hospital",
//         "cancer", "diabetes", "wellness", "nutrition"
//       ];

//       // Convert the query to lower case for case-insensitive matching.
//       const lowerQuery = query.toLowerCase();

//       // Check if any of the health keywords appear in the query.
//       const isHealthRelated = healthKeywords.some(keyword => lowerQuery.includes(keyword));

//       if (isHealthRelated) {
//         console.log("Health-related search query detected:", query);
//         // Optionally: display a notification, change the page style, or send the data to a server.
//       } else {
//         console.log("Search query is not health-related:", query);
//       }
//     }
//   })();

// contentScript.js
(function () {
  //console.log("content script executed");
  // Extract the "q" parameter from the Google search URL.
  const urlParams = new URLSearchParams(window.location.search);
  const query = urlParams.get('q');
  // Retrieve the appUrl from the config
  const appUrl = config.appUrl;
  //console.log(query);

  if (query) {
    // Send the query to your backend for classification.
    fetch(appUrl + "/classify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ query })
    })
      .then(response => response.json())
      .then(data => {
        if (data && data.classification) {
          if (data.classification.toLowerCase() === "health related") {
            console.log("Health-related query:", data.classification);
            // Retrieve URLs from the search results page.
            // This example assumes each search result is within a container element with class "g"
            // and that the actual link is within an <a> element.
            const resultElements = document.querySelectorAll("div.g");
            const urls = Array.from(resultElements).map(result => {
              const link = result.querySelector("a");
              return link ? link.href : null;
            }).filter(url => url !== null);

            console.log("Retrieved search result URLs:", urls);

            // Extract domain names from each URL.
            const domains = urls.map(url => {
              try {
                const urlObj = new URL(url);
                return urlObj.hostname;
              } catch (err) {
                console.error("Error parsing URL:", url, err);
                return null;
              }
            }).filter(domain => domain !== null);

            console.log("Extracted domains:", domains);

            // Prepare the payload object.
            const payload = { domains: domains };

            // Send the domains object to the Flask app.
            fetch(appUrl + "/domains", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify(payload)
            })
              .then(response => response.json())
              .then(data => {
                console.log("Flask app response:", data);
              })
              .catch(error => {
                console.error("Error sending domains to Flask app:", error);
              });
          } else {
            console.log("Not health related:", data.classification);
          }
        }
        else {
          if (data) {
            console.log(data);
          }
          else {
            console.log('No data received.');
          }
        }
      })
      .catch(error => {
        console.error("Error:", error);
      })
  }
})();

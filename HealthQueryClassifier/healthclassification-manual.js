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
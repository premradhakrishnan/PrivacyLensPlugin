// Import config
import config from './config.js';

console.log("PrivacyLens content script is running...");

// Function to extract the domain name from a URL
function extractDomain(url) {
    try {
        const hostname = new URL(url).hostname;
        return hostname.replace("www.", "");
    } catch (e) {
        console.error("Error extracting domain from URL:", url, e);
        return null;
    }
}

// Function to get search query from URL
function getSearchQuery() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('q') || '';
}

// Function to analyze if a query is health-related using OpenAI
async function analyzeHealthQuery(query) {
    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a health query classifier. Respond with only 'true' if the search query is health-related, or 'false' if not."
                    },
                    {
                        role: "user",
                        content: `Is this query health-related: "${query}"`
                    }
                ],
                temperature: 0.3
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.toLowerCase().trim() === 'true';
    } catch (error) {
        console.error('Error in health classification:', error);
        return fallbackHealthCheck(query);
    }
}

// Fallback function for basic health query detection
function fallbackHealthCheck(query) {
    const healthKeywords = ['symptoms', 'disease', 'doctor', 'medical', 'health', 'medicine', 'diagnosis', 'treatment'];
    const normalizedQuery = query.toLowerCase();
    return healthKeywords.some(keyword => normalizedQuery.includes(keyword));
}

// Function to add visual indicator for health-related queries
function addHealthIndicator() {
    const searchBox = document.querySelector('input[name="q"]');
    if (!searchBox) return;

    const indicator = document.createElement('div');
    indicator.style.cssText = `
        position: absolute;
        top: 100%;
        left: 0;
        background: #dcfce7;
        color: #166534;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        margin-top: 4px;
        z-index: 1000;
    `;
    indicator.textContent = '🏥 Health-related search detected';
    
    searchBox.parentElement.style.position = 'relative';
    searchBox.parentElement.appendChild(indicator);
}

// Main processing function
async function processSearch() {
    const query = getSearchQuery();
    if (!query) return;

    console.log("Processing query:", query);
    
    try {
        const isHealthRelated = await analyzeHealthQuery(query);
        console.log("Health classification result:", isHealthRelated);

        if (isHealthRelated) {
            console.log("Health-related search detected");
            addHealthIndicator();
            
            // Update health query count
            const { healthQueryCount = 0 } = await chrome.storage.local.get(['healthQueryCount']);
            await chrome.storage.local.set({ healthQueryCount: healthQueryCount + 1 });
        }
    } catch (error) {
        console.error("Error processing search:", error);
    }
}

// Use MutationObserver to handle dynamically loaded results
const observer = new MutationObserver(() => {
    processSearch();
});

// Start observing changes in the body
observer.observe(document.body, { childList: true, subtree: true });

// Initial processing
processSearch();
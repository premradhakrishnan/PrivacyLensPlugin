export class HealthQueryClassifier {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    async analyzeQuery(query) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
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
            const result = data.choices[0].message.content.toLowerCase().trim();
            
            return {
                isHealthRelated: result === 'true',
                query: query
            };
        } catch (error) {
            console.error('Error in health classification:', error);
            return this._basicClassification(query);
        }
    }

    _basicClassification(query) {
        const healthKeywords = ['symptoms', 'disease', 'doctor', 'medical', 'health'];
        const normalizedQuery = query.toLowerCase();
        const isHealth = healthKeywords.some(keyword => normalizedQuery.includes(keyword));
        
        return {
            isHealthRelated: isHealth,
            query: query,
            source: 'fallback'
        };
    }
}
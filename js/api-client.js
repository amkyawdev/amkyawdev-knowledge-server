// API Client for Knowledge Base
const apiClient = {
    baseURL: '/api/v1',
    
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Request Failed:', error);
            throw error;
        }
    },
    
    // Search API
    search(query, category = null) {
        let endpoint = `/search?q=${encodeURIComponent(query)}`;
        if (category) {
            endpoint += `&category=${encodeURIComponent(category)}`;
        }
        return this.request(endpoint);
    },
    
    // Categories API
    getCategories() {
        return this.request('/categories');
    },
    
    getCategory(id) {
        return this.request(`/category/${id}`);
    },
    
    // Items API
    getItem(id) {
        return this.request(`/item/${id}`);
    },
    
    // Health Check
    health() {
        return this.request('/health');
    }
};

// Export for use in other files
window.apiClient = apiClient;

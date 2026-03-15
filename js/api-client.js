/**
 * Amkyaw.Dev API Client
 * Knowledge Base Server API Integration
 * @version 1.0.0
 */

class ApiClient {
    constructor() {
        this.baseURL = '/api/v1';
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        };
        
        // Cache configuration
        this.cache = new Map();
        this.cacheDuration = 5 * 60 * 1000; // 5 minutes
        
        // Request queue for rate limiting
        this.requestQueue = [];
        this.isProcessingQueue = false;
    }

    /**
     * Make API request with error handling
     * @param {string} endpoint - API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise} - API response
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const cacheKey = `${options.method || 'GET'}-${url}-${JSON.stringify(options.body || {})}`;
        
        // Check cache for GET requests
        if (options.method === 'GET' || !options.method) {
            const cached = this.getFromCache(cacheKey);
            if (cached) {
                console.log('📦 Returning cached response for:', endpoint);
                return cached;
            }
        }

        try {
            // Merge headers
            const headers = { ...this.defaultHeaders, ...options.headers };
            
            // Add auth token if exists
            const token = localStorage.getItem('auth_token');
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            // Make request
            console.log(`🌐 API Request: ${options.method || 'GET'} ${endpoint}`);
            
            const response = await fetch(url, {
                ...options,
                headers,
                credentials: 'same-origin'
            });

            // Handle response
            if (!response.ok) {
                throw await this.handleError(response);
            }

            const data = await response.json();
            
            // Cache GET responses
            if (options.method === 'GET' || !options.method) {
                this.addToCache(cacheKey, data);
            }

            return data;

        } catch (error) {
            console.error('❌ API Request Failed:', error);
            throw this.normalizeError(error);
        }
    }

    /**
     * GET request
     * @param {string} endpoint - API endpoint
     * @param {Object} params - Query parameters
     * @returns {Promise}
     */
    async get(endpoint, params = {}) {
        const queryString = this.buildQueryString(params);
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    }

    /**
     * POST request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body
     * @returns {Promise}
     */
    async post(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * PUT request
     * @param {string} endpoint - API endpoint
     * @param {Object} data - Request body
     * @returns {Promise}
     */
    async put(endpoint, data = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    /**
     * DELETE request
     * @param {string} endpoint - API endpoint
     * @returns {Promise}
     */
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    }

    /**
     * Search knowledge base
     * @param {string} query - Search query
     * @param {Object} options - Search options
     * @returns {Promise}
     */
    async search(query, options = {}) {
        const params = {
            q: query,
            category: options.category || '',
            limit: options.limit || 20,
            offset: options.offset || 0,
            sort: options.sort || 'relevance'
        };
        
        return this.get('/search', params);
    }

    /**
     * Get all categories
     * @param {Object} options - Options
     * @returns {Promise}
     */
    async getCategories(options = {}) {
        const params = {
            include_counts: options.includeCounts || true,
            limit: options.limit || 100
        };
        
        return this.get('/categories', params);
    }

    /**
     * Get single category
     * @param {string} categoryId - Category ID
     * @param {Object} options - Options
     * @returns {Promise}
     */
    async getCategory(categoryId, options = {}) {
        const params = {
            include_items: options.includeItems || false,
            limit: options.limit || 50
        };
        
        return this.get(`/category/${categoryId}`, params);
    }

    /**
     * Get single item
     * @param {string} itemId - Item ID
     * @returns {Promise}
     */
    async getItem(itemId) {
        return this.get(`/item/${itemId}`);
    }

    /**
     * Get related items
     * @param {string} itemId - Item ID
     * @param {number} limit - Number of related items
     * @returns {Promise}
     */
    async getRelatedItems(itemId, limit = 5) {
        return this.get(`/item/${itemId}/related`, { limit });
    }

    /**
     * Get popular items
     * @param {number} limit - Number of items
     * @returns {Promise}
     */
    async getPopularItems(limit = 10) {
        return this.get('/popular', { limit });
    }

    /**
     * Get recent items
     * @param {number} limit - Number of items
     * @returns {Promise}
     */
    async getRecentItems(limit = 10) {
        return this.get('/recent', { limit });
    }

    /**
     * Health check
     * @returns {Promise}
     */
    async health() {
        return this.get('/health');
    }

    /**
     * Get API stats
     * @returns {Promise}
     */
    async getStats() {
        return this.get('/stats');
    }

    /**
     * External API - GitHub
     * @param {string} username - GitHub username
     * @returns {Promise}
     */
    async getGitHubProfile(username) {
        return this.get(`/external/github/${username}`);
    }

    /**
     * External API - OpenAI
     * @param {string} prompt - AI prompt
     * @returns {Promise}
     */
    async askAI(prompt) {
        return this.post('/external/openai', { prompt });
    }

    /**
     * Build query string from params
     * @param {Object} params - Query parameters
     * @returns {string}
     */
    buildQueryString(params) {
        const filtered = Object.entries(params)
            .filter(([_, value]) => value !== undefined && value !== null && value !== '')
            .map(([key, value]) => {
                if (Array.isArray(value)) {
                    return value.map(v => `${encodeURIComponent(key)}[]=${encodeURIComponent(v)}`).join('&');
                }
                return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
            });
        
        return filtered.join('&');
    }

    /**
     * Handle API errors
     * @param {Response} response - Fetch response
     * @returns {Promise<Error>}
     */
    async handleError(response) {
        let errorData;
        try {
            errorData = await response.json();
        } catch (e) {
            errorData = { message: response.statusText };
        }

        const error = new Error(errorData.message || 'API request failed');
        error.status = response.status;
        error.code = errorData.code || 'UNKNOWN_ERROR';
        error.details = errorData.details || {};
        
        return error;
    }

    /**
     * Normalize error object
     * @param {Error} error - Original error
     * @returns {Object}
     */
    normalizeError(error) {
        return {
            message: error.message || 'An unexpected error occurred',
            status: error.status || 500,
            code: error.code || 'INTERNAL_ERROR',
            details: error.details || {},
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Add to cache
     * @param {string} key - Cache key
     * @param {any} data - Data to cache
     */
    addToCache(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
        
        // Clean old cache entries
        this.cleanCache();
    }

    /**
     * Get from cache
     * @param {string} key - Cache key
     * @returns {any|null}
     */
    getFromCache(key) {
        const cached = this.cache.get(key);
        if (!cached) return null;
        
        const age = Date.now() - cached.timestamp;
        if (age > this.cacheDuration) {
            this.cache.delete(key);
            return null;
        }
        
        return cached.data;
    }

    /**
     * Clean old cache entries
     */
    cleanCache() {
        const now = Date.now();
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > this.cacheDuration) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * Clear cache
     */
    clearCache() {
        this.cache.clear();
        console.log('🧹 Cache cleared');
    }

    /**
     * Retry failed request
     * @param {Function} requestFn - Request function
     * @param {number} maxRetries - Max retry attempts
     * @returns {Promise}
     */
    async retryRequest(requestFn, maxRetries = 3) {
        let lastError;
        
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await requestFn();
            } catch (error) {
                lastError = error;
                console.log(`🔄 Retry attempt ${i + 1}/${maxRetries}`);
                
                // Exponential backoff
                await this.delay(Math.pow(2, i) * 1000);
            }
        }
        
        throw lastError;
    }

    /**
     * Delay helper
     * @param {number} ms - Milliseconds
     * @returns {Promise}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Queue request for rate limiting
     * @param {Function} requestFn - Request function
     * @returns {Promise}
     */
    async queueRequest(requestFn) {
        return new Promise((resolve, reject) => {
            this.requestQueue.push({ requestFn, resolve, reject });
            
            if (!this.isProcessingQueue) {
                this.processQueue();
            }
        });
    }

    /**
     * Process request queue
     */
    async processQueue() {
        this.isProcessingQueue = true;
        
        while (this.requestQueue.length > 0) {
            const { requestFn, resolve, reject } = this.requestQueue.shift();
            
            try {
                const result = await requestFn();
                resolve(result);
            } catch (error) {
                reject(error);
            }
            
            // Rate limit delay
            await this.delay(100); // 10 requests per second
        }
        
        this.isProcessingQueue = false;
    }

    /**
     * Cancel ongoing requests
     */
    cancelRequests() {
        this.requestQueue = [];
        this.isProcessingQueue = false;
        console.log('🛑 Requests cancelled');
    }

    /**
     * Get API status
     * @returns {Object}
     */
    getStatus() {
        return {
            baseURL: this.baseURL,
            cacheSize: this.cache.size,
            queueLength: this.requestQueue.length,
            isProcessingQueue: this.isProcessingQueue
        };
    }
}

// Create singleton instance
const apiClient = new ApiClient();

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = apiClient;
} else {
    window.apiClient = apiClient;
}

// Initialize with health check
apiClient.health()
    .then(data => {
        console.log('✅ API Client initialized successfully');
        console.log('📊 API Status:', data);
    })
    .catch(error => {
        console.warn('⚠️ API Health check failed, using mock data');
        
        // Provide mock data for development
        apiClient.mockMode = true;
        apiClient.mockData = {
            categories: [
                { id: 'general', name: 'General', count: 25, icon: '📚' },
                { id: 'technical', name: 'Technical', count: 42, icon: '💻' },
                { id: 'chatbot', name: 'Chatbot', count: 18, icon: '🤖' },
                { id: 'coder', name: 'Coder', count: 31, icon: '👨‍💻' },
                { id: 'image', name: 'Image', count: 12, icon: '🖼️' }
            ],
            stats: {
                categories: 5,
                items: 128,
                apiCalls: '10K+',
                users: '500+'
            }
        };
    });

// Add mock methods when in mock mode
if (apiClient.mockMode) {
    const originalGet = apiClient.get;
    apiClient.get = async function(endpoint, params) {
        if (endpoint.includes('/categories')) {
            return { success: true, data: this.mockData.categories };
        }
        if (endpoint.includes('/stats')) {
            return { success: true, data: this.mockData.stats };
        }
        return originalGet.call(this, endpoint, params);
    };
}

console.log('🚀 Amkyaw.Dev API Client loaded');

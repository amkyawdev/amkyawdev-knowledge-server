/**
 * Search - Search functionality
 */

class Search {
    constructor() {
        this.loader = new KnowledgeLoader();
        this.results = [];
    }

    /**
     * Initialize search
     */
    async init() {
        await this.loader.loadCategories();
        
        // Check for query parameter
        const params = new URLSearchParams(window.location.search);
        const query = params.get('q');
        
        if (query) {
            document.getElementById('search-input').value = query;
            await this.performSearch(query);
        }
    }

    /**
     * Perform search
     */
    async performSearch(query) {
        const resultsContainer = document.getElementById('search-results');
        const loadingIndicator = document.getElementById('loading');
        
        if (!query.trim()) {
            resultsContainer.innerHTML = '<p class="no-results">ရှာဖွေလိုက်ပါပါ</p>';
            return;
        }

        loadingIndicator.style.display = 'block';
        resultsContainer.innerHTML = '';

        try {
            this.results = await this.loader.search(query);
            this.renderResults(this.results, query);
        } catch (error) {
            console.error('Search error:', error);
            resultsContainer.innerHTML = '<p class="error">ရှာဖွေရာတွင် အမှားဖြစ်ပါပါ</p>';
        } finally {
            loadingIndicator.style.display = 'none';
        }
    }

    /**
     * Render search results
     */
    renderResults(results, query) {
        const resultsContainer = document.getElementById('search-results');
        
        if (results.length === 0) {
            resultsContainer.innerHTML = `<p class="no-results">"${query}" အတွက် ရလဒ်မရှိပါပါ</p>`;
            return;
        }

        const html = results.map(result => `
            <div class="search-result">
                <h3><a href="item-detail.html?id=${result.id}&category=${result.category?.id}">${result.title || result.question}</a></h3>
                <p>${this.highlightMatch(result.content || result.answer, query)}</p>
                <span class="category-tag">${result.category?.name || ''}</span>
            </div>
        `).join('');

        resultsContainer.innerHTML = html;
        
        // Update result count
        const resultCount = document.getElementById('result-count');
        if (resultCount) {
            resultCount.textContent = `${results.length} ရလဒ်များ`;
        }
    }

    /**
     * Highlight matching text
     */
    highlightMatch(text, query) {
        if (!text) return '';
        const regex = new RegExp(`(${this.escapeRegex(query)})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }

    /**
     * Escape regex special characters
     */
    escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Filter results by category
     */
    filterByCategory(categoryId) {
        const filtered = this.results.filter(r => r.category?.id === categoryId);
        const query = document.getElementById('search-input').value;
        this.renderResults(filtered, query);
    }

    /**
     * Clear filters
     */
    clearFilters() {
        const query = document.getElementById('search-input').value;
        this.renderResults(this.results, query);
    }
}

// Initialize search when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const search = new Search();
    search.init();

    // Search button click
    document.getElementById('search-btn')?.addEventListener('click', () => {
        const query = document.getElementById('search-input').value;
        search.performSearch(query);
    });

    // Enter key in search input
    document.getElementById('search-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = e.target.value;
            search.performSearch(query);
        }
    });
});

// Export
window.Search = Search;

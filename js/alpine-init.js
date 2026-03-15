// Alpine.js Store and Components
document.addEventListener('alpine:init', () => {
    // Global Store
    Alpine.store('app', {
        theme: localStorage.getItem('theme') || 'light',
        menuOpen: false,
        searchQuery: '',
        currentCategory: null,
        
        toggleTheme() {
            this.theme = this.theme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', this.theme);
            document.documentElement.setAttribute('data-theme', this.theme);
        },
        
        toggleMenu() {
            this.menuOpen = !this.menuOpen;
        }
    });
    
    // Search Component
    Alpine.data('searchComponent', () => ({
        query: '',
        results: [],
        loading: false,
        
        async search() {
            if (this.query.length < 2) return;
            
            this.loading = true;
            try {
                const response = await apiClient.search(this.query);
                this.results = response.data;
            } catch (error) {
                console.error('Search failed:', error);
            } finally {
                this.loading = false;
            }
        },
        
        debouncedSearch: Alpine.debounce(function() {
            this.search();
        }, 300)
    }));
    
    // Category Component
    Alpine.data('categoryComponent', () => ({
        categories: [],
        loading: false,
        
        async init() {
            await this.loadCategories();
        },
        
        async loadCategories() {
            this.loading = true;
            try {
                const response = await apiClient.getCategories();
                this.categories = response.data;
            } catch (error) {
                console.error('Failed to load categories:', error);
            } finally {
                this.loading = false;
            }
        }
    }));
});

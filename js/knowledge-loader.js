/**
 * Knowledge Loader - Load and manage JSON data
 */

class KnowledgeLoader {
    constructor() {
        this.categories = [];
        this.data = {};
        this.basePath = '';
    }

    /**
     * Load the master index file
     */
    async loadIndex() {
        try {
            const response = await fetch(`${this.basePath}data/index.json`);
            if (!response.ok) {
                throw new Error('Failed to load index');
            }
            const index = await response.json();
            this.categories = index.categories || [];
            return index;
        } catch (error) {
            console.error('Error loading index:', error);
            return { categories: [] };
        }
    }

    /**
     * Load categories
     */
    async loadCategories() {
        const index = await this.loadIndex();
        this.renderCategories();
        return this.categories;
    }

    /**
     * Render categories to the grid
     */
    renderCategories() {
        const grid = document.getElementById('category-grid');
        if (!grid) return;

        grid.innerHTML = this.categories.map(category => `
            <a href="pages/category-detail.html?category=${category.id}" class="category-card">
                <div class="category-icon">${category.icon || '📚'}</div>
                <h3>${category.name}</h3>
                <p>${category.description || ''}</p>
            </a>
        `).join('');
    }

    /**
     * Get all categories
     */
    getCategories() {
        return this.categories;
    }

    /**
     * Get category count
     */
    getCategoryCount() {
        return this.categories.length;
    }

    /**
     * Load category data
     */
    async loadCategory(categoryId) {
        if (this.data[categoryId]) {
            return this.data[categoryId];
        }

        try {
            const response = await fetch(`${this.basePath}data/${categoryId}/index.json`);
            if (!response.ok) {
                throw new Error('Failed to load category');
            }
            const data = await response.json();
            this.data[categoryId] = data;
            return data;
        } catch (error) {
            console.error(`Error loading category ${categoryId}:`, error);
            return { items: [] };
        }
    }

    /**
     * Get total items across all categories
     */
    async getTotalItems() {
        let total = 0;
        for (const category of this.categories) {
            const data = await this.loadCategory(category.id);
            if (data.items) {
                total += data.items.length;
            }
        }
        return total;
    }

    /**
     * Search across all categories
     */
    async search(query) {
        const results = [];
        const lowerQuery = query.toLowerCase();

        for (const category of this.categories) {
            const data = await this.loadCategory(category.id);
            if (data.items) {
                const matches = data.items.filter(item => 
                    item.title?.toLowerCase().includes(lowerQuery) ||
                    item.content?.toLowerCase().includes(lowerQuery) ||
                    item.question?.toLowerCase().includes(lowerQuery) ||
                    item.answer?.toLowerCase().includes(lowerQuery)
                );
                results.push(...matches.map(item => ({
                    ...item,
                    category: category
                })));
            }
        }

        return results;
    }

    /**
     * Load all JSON files for a category
     */
    async loadCategoryFiles(categoryId) {
        try {
            const files = await fetch(`${this.basePath}data/${categoryId}/files.json`);
            const fileList = await files.json();
            
            const data = {};
            for (const file of fileList.files) {
                const response = await fetch(`${this.basePath}data/${categoryId}/${file}`);
                data[file.replace('.json', '')] = await response.json();
            }
            return data;
        } catch (error) {
            console.error(`Error loading files for ${categoryId}:`, error);
            return {};
        }
    }
}

// Export for use in other scripts
window.KnowledgeLoader = KnowledgeLoader;

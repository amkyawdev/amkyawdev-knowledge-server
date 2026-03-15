// js/knowledge-loader.js
const KnowledgeLoader = {
    baseUrl: 'https://raw.githubusercontent.com/amkyawdev/knowledge-server/main/data/',
    
    async loadCategory(category) {
        try {
            const response = await fetch(`${this.baseUrl}${category}/index.json`);
            return await response.json();
        } catch (error) {
            console.error('Error loading category:', error);
            return null;
        }
    },
    
    async loadItem(category, id) {
        try {
            const response = await fetch(`${this.baseUrl}${category}/${id}.json`);
            return await response.json();
        } catch (error) {
            console.error('Error loading item:', error);
            return null;
        }
    },
    
    async search(query) {
        // This would typically call a search API
        // For now, return mock results
        return [
            { id: 1, title: 'Sample Result 1', category: 'general' },
            { id: 2, title: 'Sample Result 2', category: 'technical' }
        ];
    }
};

window.KnowledgeLoader = KnowledgeLoader;

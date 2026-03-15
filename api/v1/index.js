// API Router
export default async function handler(req, res) {
    const { path } = req.query;
    
    // Route to appropriate handler
    switch(path) {
        case 'search':
            return handleSearch(req, res);
        case 'categories':
            return handleCategories(req, res);
        case 'category':
            return handleCategory(req, res);
        case 'item':
            return handleItem(req, res);
        case 'health':
            return handleHealth(req, res);
        default:
            return res.status(404).json({ error: 'API endpoint not found' });
    }
}

async function handleSearch(req, res) {
    const { q, category } = req.query;
    
    // Mock search results
    const results = [
        { id: 1, title: 'Sample Result 1', category: 'general' },
        { id: 2, title: 'Sample Result 2', category: 'technical' }
    ];
    
    res.json({ success: true, data: results });
}

async function handleCategories(req, res) {
    const categories = [
        { id: 'general', name: 'General', count: 25 },
        { id: 'technical', name: 'Technical', count: 42 },
        { id: 'chatbot', name: 'Chatbot', count: 18 },
        { id: 'coder', name: 'Coder', count: 31 },
        { id: 'image', name: 'Image', count: 12 }
    ];
    
    res.json({ success: true, data: categories });
}

async function handleHealth(req, res) {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
}

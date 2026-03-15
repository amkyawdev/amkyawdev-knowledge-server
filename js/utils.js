// js/utils.js
const Utils = {
    // Format date
    formatDate(date) {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    
    // Truncate text
    truncate(text, length = 100) {
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    },
    
    // Generate slug from text
    slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
    },
    
    // Debounce function
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Copy to clipboard
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            console.error('Failed to copy:', err);
            return false;
        }
    },
    
    // Get URL parameters
    getUrlParams() {
        const params = new URLSearchParams(window.location.search);
        const obj = {};
        for (const [key, value] of params) {
            obj[key] = value;
        }
        return obj;
    },
    
    // Set URL parameters
    setUrlParams(params) {
        const url = new URL(window.location.href);
        Object.keys(params).forEach(key => {
            url.searchParams.set(key, params[key]);
        });
        window.history.pushState({}, '', url);
    },
    
    // Detect if device is mobile
    isMobile() {
        return window.innerWidth <= 768;
    },
    
    // Generate random ID
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    },
    
    // Safe JSON parse
    safeJsonParse(str, fallback = null) {
        try {
            return JSON.parse(str);
        } catch {
            return fallback;
        }
    },
    
    // Group array by key
    groupBy(array, key) {
        return array.reduce((result, item) => {
            (result[item[key]] = result[item[key]] || []).push(item);
            return result;
        }, {});
    },
    
    // Sort array by key
    sortBy(array, key, order = 'asc') {
        return array.sort((a, b) => {
            if (order === 'asc') {
                return a[key] > b[key] ? 1 : -1;
            } else {
                return a[key] < b[key] ? 1 : -1;
            }
        });
    }
};

window.Utils = Utils;

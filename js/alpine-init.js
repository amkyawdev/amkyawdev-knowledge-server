// js/alpine-init.js
document.addEventListener('alpine:init', () => {
    Alpine.data('app', () => ({
        theme: localStorage.getItem('theme') || 'light',
        mobileMenuOpen: false,
        
        init() {
            this.applyTheme();
        },
        
        toggleTheme() {
            this.theme = this.theme === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', this.theme);
            this.applyTheme();
        },
        
        applyTheme() {
            if (this.theme === 'dark') {
                document.documentElement.setAttribute('data-theme', 'dark');
            } else {
                document.documentElement.removeAttribute('data-theme');
            }
        }
    }));
});

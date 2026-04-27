/**
 * JavaScript utility for generating SEO-friendly encoded URLs
 */
const UrlHelper = {
    /**
     * Encode a page and slug into the new /v/ format
     */
    encode: function(page, slug, params = {}) {
        const cleanSlug = this.slugify(slug);
        
        const data = { p: page, ...params };
        const json = JSON.stringify(data);
        
        // Base64 encoding
        let encoded = btoa(unescape(encodeURIComponent(json)));
        
        // URL safe replacements (matching PHP)
        encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
        
        // The path should be relative to the application root
        // If your app is in a subdirectory, adjust here
        const baseUrl = window.location.origin + "/";
        return baseUrl + `v/${cleanSlug}--${encoded}`;
    },
    
    /**
     * Get full URL for an asset, ensuring it points to the API Gateway port 3000 if relative
     */
    getAssetUrl: function(path) {
        if (!path) return "";
        if (path.startsWith('http')) return path;
        const gateway = window.location.protocol + "//" + window.location.hostname + ":3000";
        // Ensure path starts with /
        const normalizedPath = path.startsWith('/') ? path : '/' + path;
        return gateway + normalizedPath;
    },

    /**
     * Helper to create SEO slugs (mirroring PHP logic)
     */
    slugify: function(text) {
        if (!text) return 'n-a';
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')           // Replace spaces with -
            .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
            .replace(/\-\-+/g, '-')         // Replace multiple - with single -
            .replace(/^-+/, '')             // Trim - from start of text
            .replace(/-+$/, '');            // Trim - from end of text
    }
};

// Also export to window for easy access
window.encodeLink = (page, slug, params = {}) => UrlHelper.encode(page, slug, params);
window.getAssetUrl = (path) => UrlHelper.getAssetUrl(path);

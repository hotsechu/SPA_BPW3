export class Router {
    constructor(basePath = '') {
        this.routes = {}; // { 'login': () => renderLogin() }
        this.currentRoute = null;
        this.basePath = basePath || Router.detectBasePath();
    }

    // Determine the base path from <base> tag or current URL
    static detectBasePath() {
        const baseTag = document.querySelector('base');
        if (baseTag?.href) {
            const url = new URL(baseTag.href);
            return url.pathname.replace(/\/$/, '') + '/';
        }

        const parts = window.location.pathname.split('/');
        // Remove the last segment if it looks like a file (contains a dot)
        if (parts.length && parts[parts.length - 1].includes('.')) {
            parts.pop();
        }
        return parts.join('/').replace(/\/$/, '') + '/';
    }

    // Normalize a route path into a key used by the router
    normalize(path) {
        let normalized = path;
        // If it includes the basePath, strip it
        if (normalized.startsWith(this.basePath)) {
            normalized = normalized.slice(this.basePath.length);
        }
        // Remove leading slash to keep routes consistent
        if (normalized.startsWith('/')) {
            normalized = normalized.slice(1);
        }
        // Ensure empty string represents root
        return normalized === '' ? '' : normalized.replace(/\/$/, '');
    }

    // Define a route (path → view function)
    route(path, view) {
        const key = this.normalize(path);
        this.routes[key] = view;
    }

    // Navigate to a path (update URL and render view)
    navigate(path) {
        const key = this.normalize(path);
        const url = this.basePath + key;
        history.pushState(null, null, url);
        this.renderView(url);
    }

    // Render the view for a given path
    renderView(path) {
        const key = this.normalize(path);
        const view = this.routes[key] || this.routes['404']; // Fallback to 404
        this.currentRoute = key;
        if (view) {
            view(); // Call the view function to render
        }
    }

    // Initialize router (handle initial load and popstate)
    init() {
        // Handle back/forward buttons
        window.addEventListener('popstate', () => {
            this.renderView(window.location.pathname);
        });

        // Render initial view (execute immediately since this runs after DOM is ready)
        this.renderView(window.location.pathname);
    }
}
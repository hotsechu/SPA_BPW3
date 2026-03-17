// app.js
class Router {
    constructor() {
        this.routes = {}; // { '/login': () => renderLogin() }
        this.currentRoute = null;
    }
 
    // Define a route (path → view function)
    route(path, view) {
        this.routes[path] = view;
    }
 
    // Navigate to a path (update URL and render view)
    navigate(path) {
        history.pushState(null, null, path);
        this.renderView(path);
    }
 
    // Render the view for a given path
    renderView(path) {
        const view = this.routes[path] || this.routes['/404']; // Fallback to 404
        this.currentRoute = path;
        view(); // Call the view function to render
    }
 
    // Initialize router (handle initial load and popstate)
    init() {
        // Handle initial page load
        window.addEventListener('DOMContentLoaded', () => {
            this.renderView(window.location.pathname);
        });
 
        // Handle back/forward buttons
        window.addEventListener('popstate', () => {
            this.renderView(window.location.pathname);
        });
    }
}

const state = {
    isAuthenticated: false,
    user: null,
    token: null,
 
    // Initialize state from localStorage (persist across refreshes)
    init() {
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (savedToken && savedUser) {
            this.token = savedToken;
            this.user = JSON.parse(savedUser);
            this.isAuthenticated = true;
        }
    },
 
    // Login: update state and save to localStorage
    login(token, user) {
        this.token = token;
        this.user = user;
        this.isAuthenticated = true;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    },
 
    // Logout: clear state and localStorage
    logout() {
        this.token = null;
        this.user = null;
        this.isAuthenticated = false;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
};
 
// Initialize state on app load
state.init();

function renderLogin() {
    const app = document.getElementById('app');
    const loginTemplate = document.getElementById('login-template').content.cloneNode(true);
    app.innerHTML = '';
    app.appendChild(loginTemplate);
 
    // Handle form submission
    const loginForm = document.getElementById('login-form');
    const errorElement = document.getElementById('login-error');
 
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
 
        try {
            // Mock API call (see api-mock.js for implementation)
            const { token, user } = await authAPI.login(email, password);
            state.login(token, user);
            router.navigate('/home'); // Navigate to homepage
        } catch (error) {
            errorElement.textContent = error.message;
            errorElement.style.display = 'block';
        }
    });
}

async function renderHome() {
    const app = document.getElementById('app');
    const homeTemplate = document.getElementById('home-template').content.cloneNode(true);
    app.innerHTML = '';
    app.appendChild(homeTemplate);
 
    const usernameElement = document.getElementById('username');
    const activityList = document.getElementById('activity-list');
    const loadingElement = document.getElementById('home-loading');
    const errorElement = document.getElementById('home-error');
 
    // Show loading state
    loadingElement.style.display = 'block';
 
    try {
        // Fetch user activity from mock API
        const activity = await dataAPI.getHomepageData(state.token);
        usernameElement.textContent = state.user.name;
        
        // Render activity list
        activity.forEach(item => {
            const li = document.createElement('li');
            li.textContent = item;
            activityList.appendChild(li);
        });
    } catch (error) {
        errorElement.textContent = error.message;
        errorElement.style.display = 'block';
        state.logout(); // Clear invalid token
        router.navigate('/login'); // Redirect to login
    } finally {
        loadingElement.style.display = 'none'; // Hide loading
    }
 
    // Logout button
    document.getElementById('logout-btn').addEventListener('click', () => {
        state.logout();
        router.navigate('/login');
    });
}

// Initialize router
const router = new Router();
 
// Define routes
router.route('/login', renderLogin);
router.route('/home', renderHome);
router.route('/', () => {
    // Redirect root to login/home based on auth state
    state.isAuthenticated ? router.navigate('/home') : router.navigate('/login');
});
 
// Start the router
router.init();

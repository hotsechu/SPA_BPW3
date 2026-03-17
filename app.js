// app.js
import { Router } from './router.js';
import { authAPI, dataAPI } from './api-mock.js';

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
            router.navigate('home'); // Navigate to homepage
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

    // Query from the newly rendered DOM
    const usernameElement = app.querySelector('#username');
    const activityList = app.querySelector('#activity-list');
    const activityContainer = app.querySelector('#activity-container');
    const loadingElement = app.querySelector('#home-loading');
    const errorElement = app.querySelector('#home-error');
    const logoutBtn = app.querySelector('#logout-btn');

    // Show loading state
    loadingElement.classList.add('show');

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

        // Hide loading and show activity
        loadingElement.classList.remove('show');
        activityContainer.style.display = 'block';
    } catch (error) {
        errorElement.textContent = error.message;
        errorElement.classList.add('show');
        loadingElement.classList.remove('show');
        state.logout(); // Clear invalid token
        router.navigate('login'); // Redirect to login
    }

    // Logout button
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            state.logout();
            router.navigate('login');
        });
    }
}

function renderAbout() {
    const app = document.getElementById('app');
    const aboutTemplate = document.getElementById('about-template').content.cloneNode(true);
    app.innerHTML = '';
    app.appendChild(aboutTemplate);

    // Handle back button
    const aboutBackBtn = document.getElementById('about-back');
    if (aboutBackBtn) {
        aboutBackBtn.addEventListener('click', (e) => {
            e.preventDefault();
            state.isAuthenticated ? router.navigate('home') : router.navigate('login');
        });
    }
}

// Initialize router
const router = new Router();

// Define routes
router.route('login', renderLogin);
router.route('home', renderHome);
router.route('about', renderAbout);
router.route('', () => {
    // Redirect root to login/home based on auth state
    state.isAuthenticated ? router.navigate('home') : router.navigate('login');
});

// Handle footer about link
document.getElementById('about-link').addEventListener('click', (e) => {
    e.preventDefault();
    router.navigate('about');
});

// Start the router
router.init();

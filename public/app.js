// app.js - Updated to work with Node.js backend
import { Router } from './router.js';
import { authAPI, dataAPI, healthAPI } from './api.js';

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

function showError(message, container = null) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger alert-dismissible fade show';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);
    } else {
        document.getElementById('app').insertBefore(alertDiv, document.getElementById('app').firstChild);
    }
    
    // Auto-dismiss after 5 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 5000);
}

function showSuccess(message, container = null) {
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-success alert-dismissible fade show';
    alertDiv.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);
    } else {
        document.getElementById('app').insertBefore(alertDiv, document.getElementById('app').firstChild);
    }
    
    // Auto-dismiss after 3 seconds
    setTimeout(() => {
        if (alertDiv.parentNode) {
            alertDiv.remove();
        }
    }, 3000);
}

function showLoading(show = true) {
    let spinner = document.getElementById('loading-spinner');
    
    if (show) {
        if (!spinner) {
            spinner = document.createElement('div');
            spinner.id = 'loading-spinner';
            spinner.className = 'd-flex justify-content-center p-4';
            spinner.innerHTML = `
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Cargando...</span>
                </div>
            `;
            document.getElementById('app').appendChild(spinner);
        }
    } else {
        if (spinner) {
            spinner.remove();
        }
    }
}

function renderLogin() {
    const app = document.getElementById('app');
    const loginTemplate = document.getElementById('login-template').content.cloneNode(true);
    app.innerHTML = '';
    app.appendChild(loginTemplate);

    // Handle form submission
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const submitBtn = document.getElementById('submit-btn');
        const originalText = submitBtn.textContent;

        try {
            // Show loading state
            submitBtn.disabled = true;
            submitBtn.textContent = 'Iniciando sesión...';

            const response = await authAPI.login(email, password);
            
            // Update global state
            state.login(response.token, response.user);
            
            showSuccess('¡Login exitoso! Redirigiendo...', loginForm.parentNode);
            
            // Redirect to homepage after short delay
            setTimeout(() => {
                router.navigate('home');
            }, 1000);

        } catch (error) {
            showError(error.message || 'Error al iniciar sesión', loginForm.parentNode);
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    });
}

async function renderHome() {
    const app = document.getElementById('app');
    
    // Show loading spinner
    showLoading(true);
    
    try {
        // Get homepage data from backend
        const data = await dataAPI.getHomepageData();
        
        app.innerHTML = `
            <div class="home-view">
                <div class="container">
                    <div class="row">
                        <div class="col-12">
                            <div class="d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    <h1 class="mb-0">¡Bienvenido, ${state.user?.name || 'Usuario'}!</h1>
                                    <p class="text-muted">Biodanza Player 3.0 ${state.user?.role === 'facilitator' ? '- Panel de Facilitador' : ''}</p>
                                </div>
                                <button class="btn btn-outline-secondary" id="logout-btn">
                                    <i class="bi bi-box-arrow-right"></i> Cerrar Sesión
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- Stats Cards -->
                    <div class="row mb-4">
                        <div class="col-md-3">
                            <div class="card text-center">
                                <div class="card-body">
                                    <h4 class="text-primary">${data.stats.totalSessions}</h4>
                                    <p class="mb-0">Sesiones Totales</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card text-center">
                                <div class="card-body">
                                    <h4 class="text-success">${data.stats.completedSessions}</h4>
                                    <p class="mb-0">Completadas</p>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="card text-center">
                                <div class="card-body">
                                    <h4 class="text-info">${data.stats.totalPlaylists}</h4>
                                    <p class="mb-0">Playlists</p>
                                </div>
                            </div>
                        </div>
                        ${state.user?.role === 'facilitator' && data.facilitatorData ? `
                        <div class="col-md-3">
                            <div class="card text-center">
                                <div class="card-body">
                                    <h4 class="text-warning">${data.facilitatorData.activeStudents}</h4>
                                    <p class="mb-0">Estudiantes Activos</p>
                                </div>
                            </div>
                        </div>
                        ` : ''}
                    </div>

                    <div class="row">
                        <!-- Upcoming Sessions -->
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header d-flex justify-content-between align-items-center">
                                    <h5 class="mb-0">Próximas Sesiones</h5>
                                    <a href="#" id="view-all-sessions" class="btn btn-sm btn-outline-primary">Ver Todas</a>
                                </div>
                                <div class="card-body">
                                    ${data.upcomingSessions.length > 0 ? 
                                        data.upcomingSessions.map(session => `
                                            <div class="d-flex justify-content-between align-items-start mb-3">
                                                <div>
                                                    <h6 class="mb-1">${session.title}</h6>
                                                    <p class="text-muted mb-0">${session.date} - ${session.duration}</p>
                                                    <small class="text-muted">${session.description}</small>
                                                </div>
                                                <span class="badge bg-primary">${session.status}</span>
                                            </div>
                                        `).join('') 
                                        : '<p class="text-muted">No hay sesiones programadas</p>'
                                    }
                                </div>
                            </div>
                        </div>

                        <!-- Recent Activity -->
                        <div class="col-md-6">
                            <div class="card">
                                <div class="card-header">
                                    <h5 class="mb-0">Actividad Reciente</h5>
                                </div>
                                <div class="card-body">
                                    ${data.userActivity.length > 0 ? 
                                        data.userActivity.map(activity => `
                                            <div class="mb-2">
                                                <i class="bi bi-circle-fill text-success me-2" style="font-size: 0.5rem;"></i>
                                                ${activity}
                                            </div>
                                        `).join('')
                                        : '<p class="text-muted">No hay actividad reciente</p>'
                                    }
                                </div>
                            </div>
                        </div>
                    </div>

                    ${state.user?.role === 'facilitator' && data.facilitatorData ? `
                    <!-- Facilitator Section -->
                    <div class="row mt-4">
                        <div class="col-12">
                            <div class="card border-warning">
                                <div class="card-header bg-warning bg-opacity-10">
                                    <h5 class="mb-0"><i class="bi bi-star-fill"></i> Panel de Facilitador</h5>
                                </div>
                                <div class="card-body">
                                    <div class="row">
                                        <div class="col-md-4">
                                            <p><strong>Revisiones Pendientes:</strong> ${data.facilitatorData.pendingReviews}</p>
                                        </div>
                                        <div class="col-md-8">
                                            <p><strong>Próxima Preparación:</strong> ${data.facilitatorData.nextSessionPrep}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
        `;

        // Add event listeners
        document.getElementById('logout-btn').addEventListener('click', handleLogout);
        document.getElementById('view-all-sessions')?.addEventListener('click', (e) => {
            e.preventDefault();
            router.navigate('sessions');
        });

    } catch (error) {
        showError('Error cargando datos: ' + error.message);
        console.error('Error loading homepage:', error);
    } finally {
        showLoading(false);
    }
}

async function handleLogout() {
    try {
        await authAPI.logout();
        state.logout();
        showSuccess('Sesión cerrada exitosamente');
        setTimeout(() => {
            router.navigate('login');
        }, 1000);
    } catch (error) {
        // Even if server logout fails, logout locally
        state.logout();
        router.navigate('login');
    }
}

function renderAbout() {
    const app = document.getElementById('app');
    app.innerHTML = `
        <div class="about-view">
            <div class="container">
                <div class="row justify-content-center">
                    <div class="col-md-8">
                        <div class="card">
                            <div class="card-body text-center">
                                <h2 class="card-title">Acerca de Biodanza Player 3.0</h2>
                                <p class="lead">Una plataforma moderna para la gestión de sesiones de Biodanza</p>
                                <hr>
                                <div class="row">
                                    <div class="col-md-6">
                                        <h6>Características:</h6>
                                        <ul class="list-unstyled text-start">
                                            <li>✓ Gestión de sesiones</li>
                                            <li>✓ Playlists musicales</li>
                                            <li>✓ Panel de facilitador</li>
                                            <li>✓ Seguimiento de progreso</li>
                                        </ul>
                                    </div>
                                    <div class="col-md-6">
                                        <h6>Tecnologías:</h6>
                                        <ul class="list-unstyled text-start">
                                            <li>• Node.js + Express</li>
                                            <li>• JavaScript ES6+</li>
                                            <li>• Bootstrap 5</li>
                                            <li>• JWT Authentication</li>
                                        </ul>
                                    </div>
                                </div>
                                <p class="text-muted mt-3">© 2026 Todos los derechos reservados.</p>
                                <a href="#" id="back-home" class="btn btn-primary">Volver al inicio</a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('back-home').addEventListener('click', (e) => {
        e.preventDefault();
        if (state.isAuthenticated) {
            router.navigate('home');
        } else {
            router.navigate('login');
        }
    });
}

// Initialize Router
const router = new Router();

// Define routes
router.route('login', renderLogin);
router.route('home', renderHome);
router.route('about', renderAbout);
router.route('', () => {
    if (state.isAuthenticated) {
        router.navigate('home');
    } else {
        router.navigate('login');
    }
});

// Handle about link in footer
document.getElementById('about-link').addEventListener('click', (e) => {
    e.preventDefault();
    router.navigate('about');
});

// Start the application
router.init();

// Health check on app load (optional)
healthAPI.check().then(health => {
    if (health.status === 'OK') {
        console.log(`✅ Backend conectado - v${health.version}`);
    } else {
        console.warn('⚠️ Backend no disponible:', health.error);
    }
}).catch(err => {
    console.warn('⚠️ No se pudo conectar con el backend:', err.message);
});
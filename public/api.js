// api.js - Real API calls to Node.js backend
const API_BASE_URL = window.location.origin + '/api';

// Helper function for API calls with authentication
async function apiCall(endpoint, options = {}) {
    const token = localStorage.getItem('token');
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        },
        ...options
    };

    if (config.body && typeof config.body === 'object') {
        config.body = JSON.stringify(config.body);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
        
        // Handle non-JSON responses (like redirects)
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            return { success: true };
        }

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
        }

        return data;
    } catch (error) {
        // Handle network errors or JSON parsing errors
        if (error.message.includes('Failed to fetch')) {
            throw new Error('Error de conexión. Verifica que el servidor esté funcionando.');
        }
        throw error;
    }
}

export const authAPI = {
    // Login endpoint
    async login(email, password) {
        try {
            const response = await apiCall('/auth/login', {
                method: 'POST',
                body: { email, password }
            });
            return response;
        } catch (error) {
            console.error('Error en login:', error);
            throw error;
        }
    },

    // Logout endpoint
    async logout() {
        try {
            await apiCall('/auth/logout', {
                method: 'POST'
            });
            return { success: true };
        } catch (error) {
            // Even if logout fails on server, we should clear local storage
            console.warn('Error en logout del servidor:', error);
            return { success: true };
        }
    },

    // Get current user info
    async getCurrentUser() {
        try {
            const response = await apiCall('/auth/me');
            return response;
        } catch (error) {
            console.error('Error obteniendo usuario actual:', error);
            throw error;
        }
    },

    // Register new user (optional)
    async register(name, email, password, role = 'student') {
        try {
            const response = await apiCall('/auth/register', {
                method: 'POST',
                body: { name, email, password, role }
            });
            return response;
        } catch (error) {
            console.error('Error en registro:', error);
            throw error;
        }
    }
};

export const dataAPI = {
    // Get homepage data
    async getHomepageData() {
        try {
            const response = await apiCall('/data/homepage');
            return response;
        } catch (error) {
            console.error('Error obteniendo datos homepage:', error);
            throw error;
        }
    },

    // Get all sessions
    async getSessions(status = null) {
        try {
            const endpoint = status ? `/data/sessions?status=${status}` : '/data/sessions';
            const response = await apiCall(endpoint);
            return response;
        } catch (error) {
            console.error('Error obteniendo sesiones:', error);
            throw error;
        }
    },

    // Get specific session
    async getSession(sessionId) {
        try {
            const response = await apiCall(`/data/sessions/${sessionId}`);
            return response;
        } catch (error) {
            console.error('Error obteniendo sesión:', error);
            throw error;
        }
    },

    // Get all playlists
    async getPlaylists(genre = null) {
        try {
            const endpoint = genre ? `/data/playlists?genre=${genre}` : '/data/playlists';
            const response = await apiCall(endpoint);
            return response;
        } catch (error) {
            console.error('Error obteniendo playlists:', error);
            throw error;
        }
    },

    // Get specific playlist
    async getPlaylist(playlistId) {
        try {
            const response = await apiCall(`/data/playlists/${playlistId}`);
            return response;
        } catch (error) {
            console.error('Error obteniendo playlist:', error);
            throw error;
        }
    },

    // Create new session (facilitators only)
    async createSession(sessionData) {
        try {
            const response = await apiCall('/data/sessions', {
                method: 'POST',
                body: sessionData
            });
            return response;
        } catch (error) {
            console.error('Error creando sesión:', error);
            throw error;
        }
    },

    // Update session status (facilitators only)
    async updateSessionStatus(sessionId, status) {
        try {
            const response = await apiCall(`/data/sessions/${sessionId}/status`, {
                method: 'PUT',
                body: { status }
            });
            return response;
        } catch (error) {
            console.error('Error actualizando sesión:', error);
            throw error;
        }
    }
};

// Health check utility
export const healthAPI = {
    async check() {
        try {
            const response = await fetch(`${API_BASE_URL}/health`);
            return await response.json();
        } catch (error) {
            console.error('Error en health check:', error);
            return { status: 'ERROR', error: error.message };
        }
    }
};
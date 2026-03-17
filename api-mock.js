export const authAPI = {
    // Mock login endpoint
    async login(email, password) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock validation (replace with real backend logic)
        if (email === 'user@example.com' && password === 'password123') {
            return {
                token: 'mock-jwt-token-123',
                user: { id: 1, name: 'John Doe', email }
            };
        } else {
            throw new Error('Invalid email or password');
        }
    }
};

export const dataAPI = {
    // Mock homepage data endpoint
    async getHomepageData(token) {
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock token validation
        if (token !== 'mock-jwt-token-123') {
            throw new Error('Invalid authentication token');
        }

        // Mock user activity data
        return [
            'Logged in at 9:00 AM',
            'Updated profile at 10:30 AM',
            'Received message from Jane'
        ];
    }
};
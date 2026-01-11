/**
 * API Client for AutoMCP backend
 */
class APIClient {
    constructor(baseUrl = 'http://localhost:8000') {
        this.baseUrl = baseUrl;
        this.sessionId = null;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        if (options.body && typeof options.body === 'object') {
            config.body = JSON.stringify(options.body);
        }

        const response = await fetch(url, config);

        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }

        return response.json();
    }

    // Chat endpoints
    async sendMessage(message) {
        const body = {
            message,
            session_id: this.sessionId,
        };

        const response = await this.request('/api/chat/message', {
            method: 'POST',
            body,
        });

        this.sessionId = response.session_id;
        return response;
    }

    async getSession() {
        if (!this.sessionId) {
            throw new Error('No active session');
        }
        return this.request(`/api/chat/session/${this.sessionId}`);
    }

    async confirmDesign() {
        if (!this.sessionId) {
            throw new Error('No active session');
        }
        return this.request(`/api/chat/session/${this.sessionId}/confirm-design`, {
            method: 'POST',
        });
    }

    // Server endpoints
    async generateCode() {
        if (!this.sessionId) {
            throw new Error('No active session');
        }
        return this.request(`/api/servers/generate/${this.sessionId}`, {
            method: 'POST',
        });
    }

    async getCode() {
        if (!this.sessionId) {
            throw new Error('No active session');
        }
        return this.request(`/api/servers/code/${this.sessionId}`);
    }

    async deploy(target = 'standalone') {
        if (!this.sessionId) {
            throw new Error('No active session');
        }
        return this.request('/api/servers/deploy', {
            method: 'POST',
            body: {
                server_id: this.sessionId,
                target,
            },
        });
    }

    async getDeploymentTargets() {
        return this.request('/api/servers/targets');
    }

    // Session management
    resetSession() {
        this.sessionId = null;
    }
}

// Export singleton instance
const apiClient = new APIClient();

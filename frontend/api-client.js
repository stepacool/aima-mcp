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

    // Step 1: Describe system and get suggested actions
    async describeSystem(description) {
        const response = await this.request('/api/chat/describe', {
            method: 'POST',
            body: {
                description,
                session_id: this.sessionId,
            },
        });
        this.sessionId = response.session_id;
        return response;
    }

    // Step 2: Refine actions with feedback
    async refineActions(feedback) {
        if (!this.sessionId) {
            throw new Error('No active session');
        }
        return this.request('/api/chat/refine', {
            method: 'POST',
            body: {
                session_id: this.sessionId,
                feedback,
            },
        });
    }

    // Confirm actions and move to auth step
    async confirmActions() {
        if (!this.sessionId) {
            throw new Error('No active session');
        }
        return this.request(`/api/chat/actions/confirm?session_id=${this.sessionId}`, {
            method: 'POST',
        });
    }

    // Step 3: Configure authentication
    async configureAuth(authType, oauthConfig = {}) {
        if (!this.sessionId) {
            throw new Error('No active session');
        }
        return this.request('/api/chat/auth/configure', {
            method: 'POST',
            body: {
                session_id: this.sessionId,
                auth_type: authType,
                oauth_provider_url: oauthConfig.providerUrl || null,
                oauth_client_id: oauthConfig.clientId || null,
                oauth_scopes: oauthConfig.scopes || null,
            },
        });
    }

    // Generate code
    async generateCode() {
        if (!this.sessionId) {
            throw new Error('No active session');
        }
        return this.request(`/api/servers/generate/${this.sessionId}`, {
            method: 'POST',
        });
    }

    // Deploy (paid tier)
    async deploy(target = 'standalone') {
        if (!this.sessionId) {
            throw new Error('No active session');
        }
        return this.request('/api/servers/deploy', {
            method: 'POST',
            body: {
                session_id: this.sessionId,
                target,
            },
        });
    }

    // Validate code for free tier
    async validateCode() {
        if (!this.sessionId) {
            throw new Error('No active session');
        }
        return this.request(`/api/servers/validate/${this.sessionId}`, {
            method: 'POST',
        });
    }

    // Activate on shared runtime (free tier)
    async activate() {
        if (!this.sessionId) {
            throw new Error('No active session');
        }
        return this.request(`/api/servers/activate/${this.sessionId}`, {
            method: 'POST',
        });
    }

    // Get tier info
    async getTierInfo(tier = 'free') {
        return this.request(`/api/servers/tier-info/${tier}`);
    }

    // Get session state
    async getSession() {
        if (!this.sessionId) {
            throw new Error('No active session');
        }
        return this.request(`/api/chat/session/${this.sessionId}`);
    }

    // Reset session
    resetSession() {
        this.sessionId = null;
    }
}

const apiClient = new APIClient();

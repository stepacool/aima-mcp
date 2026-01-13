/**
 * API Client for AutoMCP backend
 */
class APIClient {
    constructor(baseUrl = 'http://localhost:8000') {
        this.baseUrl = baseUrl;
        this.serverId = null;
        this.customerId = this._getOrCreateCustomerId();
    }

    _getOrCreateCustomerId() {
        let id = localStorage.getItem('automcp_customer_id');
        if (!id) {
            if (typeof crypto !== 'undefined' && crypto.randomUUID) {
                id = crypto.randomUUID();
            } else {
                // Fallback for non-secure contexts
                id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            }
            localStorage.setItem('automcp_customer_id', id);
        }
        return id;
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
        const response = await this.request('/api/wizard/start', {
            method: 'POST',
            body: {
                customer_id: this.customerId,
                description,
            },
        });
        this.serverId = response.server_id;
        return response;
    }

    // Step 2: Refine actions with feedback
    async refineActions(feedback) {
        if (!this.serverId) {
            throw new Error('No active server');
        }
        return this.request(`/api/wizard/${this.serverId}/refine`, {
            method: 'POST',
            body: {
                feedback,
            },
        });
    }

    // Confirm selected actions
    async confirmActions(selectedActions) {
        if (!this.serverId) {
            throw new Error('No active server');
        }
        return this.request(`/api/wizard/${this.serverId}/actions/confirm`, {
            method: 'POST',
            body: {
                selected_actions: selectedActions,
            },
        });
    }

    // Step 3: Configure authentication
    async configureAuth(authType, oauthConfig = {}) {
        if (!this.serverId) {
            throw new Error('No active server');
        }
        return this.request(`/api/wizard/${this.serverId}/auth`, {
            method: 'POST',
            body: {
                auth_type: authType,
                auth_config: oauthConfig, // backend expects field "auth_config"
            },
        });
    }

    // Generate code
    async generateCode() {
        if (!this.serverId) {
            throw new Error('No active server');
        }
        return this.request(`/api/wizard/${this.serverId}/generate-code`, {
            method: 'POST',
        });
    }

    // Create VPS (paid tier) - Mocked
    async createVPS() {
        if (!this.serverId) {
            throw new Error('No active server');
        }
        // This hits the mocked backend endpoint
        return this.request(`/api/servers/${this.serverId}/create-vps`, {
            method: 'POST',
            body: {
                server_id: this.serverId,
            },
        });
    }

    // Deploy (legacy/old paid tier logic - keeping just in case or removing?)
    // Instruction said remove legacy. I'll remove it.

    // Validate code for free tier
    async validateCode() {
        // Endpoint removed/handled by activate. 
        // Returning success to keep frontend logic intact if called, 
        // but app.js call should be removed or this is a no-op
        return { valid: true, errors: [] };
    }

    // Activate on shared runtime (free tier)
    async activate() {
        if (!this.serverId) {
            throw new Error('No active server');
        }
        return this.request(`/api/servers/${this.serverId}/activate`, {
            method: 'POST',
        });
    }

    // Get tier info
    async getTierInfo(tier = 'free') {
        return this.request(`/api/servers/tier-info/${tier}`);
    }

    // Get session state
    async getSession() {
        if (!this.serverId) {
            throw new Error('No active server');
        }
        return this.request(`/api/wizard/${this.serverId}`);
    }

    // Reset session
    resetSession() {
        this.serverId = null;
    }
}

const apiClient = new APIClient();

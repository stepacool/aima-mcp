/**
 * AutoMCP Frontend - Wizard Flow
 */

// State
let state = {
    currentStep: 1,
    serverName: '',
    serverDescription: '',
    actions: [],
    authType: 'none',
    authConfig: {},
    generatedCode: null,
    selectedTier: 'free',
};

// DOM Elements
const loadingOverlay = document.getElementById('loading');
const loadingText = document.getElementById('loading-text');

// Step elements
const stepDescribe = document.getElementById('step-describe');
const stepActions = document.getElementById('step-actions');
const stepAuth = document.getElementById('step-auth');
const stepDeploy = document.getElementById('step-deploy');
const stepResult = document.getElementById('step-result');

// Progress bar steps
const progressSteps = document.querySelectorAll('.progress-bar .step');

// Utility functions
function showLoading(text = 'Processing...') {
    loadingText.textContent = text;
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

function showStep(stepNum) {
    state.currentStep = stepNum;

    // Hide all steps
    [stepDescribe, stepActions, stepAuth, stepDeploy, stepResult].forEach(el => {
        el.classList.add('hidden');
    });

    // Show current step
    const steps = [stepDescribe, stepActions, stepAuth, stepDeploy, stepResult];
    if (steps[stepNum - 1]) {
        steps[stepNum - 1].classList.remove('hidden');
    }

    // Update progress bar
    progressSteps.forEach((step, idx) => {
        step.classList.remove('active', 'completed');
        if (idx + 1 < stepNum) {
            step.classList.add('completed');
        } else if (idx + 1 === stepNum) {
            step.classList.add('active');
        }
    });
}

function renderActions(actions) {
    const container = document.getElementById('actions-list');
    container.innerHTML = '';

    actions.forEach(action => {
        const card = document.createElement('div');
        card.className = 'action-card';

        const paramsHtml = action.parameters.length > 0
            ? `<div class="action-params">
                ${action.parameters.map(p => `<span class="param-tag">${p.name}: ${p.type || 'string'}</span>`).join('')}
               </div>`
            : '';

        const authBadge = action.auth_required
            ? '<span class="action-badge">Auth Required</span>'
            : '';

        card.innerHTML = `
            <div class="action-header">
                <span class="action-name">${action.name}</span>
                ${authBadge}
            </div>
            <div class="action-description">${action.description}</div>
            ${paramsHtml}
        `;

        container.appendChild(card);
    });
}

function renderDeployFiles(files) {
    const container = document.getElementById('deploy-files');
    container.innerHTML = '';

    for (const [filename, content] of Object.entries(files)) {
        const card = document.createElement('div');
        card.className = 'file-card';

        card.innerHTML = `
            <div class="file-header">
                <span class="file-name">${filename}</span>
                <button class="secondary" onclick="copyFile('${filename}')">Copy</button>
            </div>
            <div class="file-content" id="file-${filename.replace(/[^a-zA-Z0-9]/g, '-')}">${escapeHtml(content)}</div>
        `;

        container.appendChild(card);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function copyFile(filename) {
    const id = `file-${filename.replace(/[^a-zA-Z0-9]/g, '-')}`;
    const content = document.getElementById(id)?.textContent;
    if (content) {
        await navigator.clipboard.writeText(content);
        alert('Copied to clipboard!');
    }
}

// Step 1: Describe System
async function handleDescribe() {
    const description = document.getElementById('system-description').value.trim();
    if (!description) {
        alert('Please describe your system');
        return;
    }

    try {
        showLoading('Analyzing your requirements...');
        const response = await apiClient.describeSystem(description);
        hideLoading();

        state.serverName = response.server_name;
        state.serverDescription = response.server_description;
        state.actions = response.actions;

        document.getElementById('server-name').textContent = response.server_name;
        document.getElementById('server-description').textContent = response.server_description;
        renderActions(response.actions);

        showStep(2);
    } catch (error) {
        hideLoading();
        alert(`Error: ${error.message}`);
    }
}

// Step 2: Refine Actions
async function handleRefine() {
    const feedback = document.getElementById('refine-input').value.trim();
    if (!feedback) return;

    try {
        showLoading('Updating actions...');
        const response = await apiClient.refineActions(feedback);
        hideLoading();

        state.actions = response.actions;
        renderActions(response.actions);
        document.getElementById('refine-input').value = '';
    } catch (error) {
        hideLoading();
        alert(`Error: ${error.message}`);
    }
}

async function handleConfirmActions() {
    try {
        showLoading('Confirming actions...');
        await apiClient.confirmActions();
        hideLoading();
        showStep(3);
    } catch (error) {
        hideLoading();
        alert(`Error: ${error.message}`);
    }
}

// Step 3: Configure Auth
function handleAuthTypeChange(e) {
    const oauthConfig = document.getElementById('oauth-config');
    if (e.target.value === 'oauth') {
        oauthConfig.classList.remove('hidden');
    } else {
        oauthConfig.classList.add('hidden');
    }
    state.authType = e.target.value;
}

async function handleConfirmAuth() {
    const authType = document.querySelector('input[name="auth-type"]:checked').value;

    let oauthConfig = {};
    if (authType === 'oauth') {
        oauthConfig = {
            providerUrl: document.getElementById('oauth-provider').value,
            clientId: document.getElementById('oauth-client-id').value,
            scopes: document.getElementById('oauth-scopes').value.split(',').map(s => s.trim()).filter(Boolean),
        };
    }

    try {
        showLoading('Configuring authentication...');
        await apiClient.configureAuth(authType, oauthConfig);

        // Generate code
        showLoading('Generating server code...');
        const codeResponse = await apiClient.generateCode();
        hideLoading();

        state.authType = authType;
        state.authConfig = oauthConfig;
        state.generatedCode = codeResponse.code;

        // Update deploy step
        document.getElementById('summary-name').textContent = state.serverName;
        document.getElementById('summary-description').textContent = state.serverDescription;
        document.getElementById('summary-actions-count').textContent = state.actions.length;
        document.getElementById('summary-auth-type').textContent = authType.charAt(0).toUpperCase() + authType.slice(1);
        document.getElementById('code-content').textContent = state.generatedCode;

        showStep(4);
    } catch (error) {
        hideLoading();
        alert(`Error: ${error.message}`);
    }
}

// Step 4: Tier and Deploy
function handleTierChange(e) {
    const tier = e.target.value;
    state.selectedTier = tier;

    // Update UI to show selected tier
    document.querySelectorAll('.tier-option').forEach(t => {
        t.classList.remove('selected');
    });
    e.target.closest('.tier-option').classList.add('selected');

    // Toggle tier-specific sections
    const freeTierInfo = document.getElementById('free-tier-info');
    const paidTierOptions = document.getElementById('paid-tier-options');
    const activateBtn = document.getElementById('activate-btn');
    const deployBtn = document.getElementById('deploy-btn');

    if (tier === 'free') {
        freeTierInfo.classList.remove('hidden');
        paidTierOptions.classList.add('hidden');
        activateBtn.classList.remove('hidden');
        deployBtn.classList.add('hidden');
    } else {
        freeTierInfo.classList.add('hidden');
        paidTierOptions.classList.remove('hidden');
        activateBtn.classList.add('hidden');
        deployBtn.classList.remove('hidden');
    }
}

function handleTargetChange() {
    document.querySelectorAll('.deploy-target').forEach(t => {
        t.classList.remove('selected');
    });
    event.target.closest('.deploy-target').classList.add('selected');
}

async function handleActivate() {
    // Check if we're within free tier limits
    if (state.actions.length > 3) {
        alert('Free tier allows maximum 3 tools. Please upgrade to Pro or reduce your tools.');
        return;
    }

    try {
        showLoading('Validating code...');
        const validation = await apiClient.validateCode();

        if (!validation.valid) {
            hideLoading();
            alert(`Validation failed:\n${validation.errors.join('\n')}`);
            return;
        }

        showLoading('Activating on shared runtime...');
        const response = await apiClient.activate();
        hideLoading();

        document.getElementById('deploy-instructions').innerHTML = `
            <strong>Your MCP Server is Active!</strong><br><br>
            <strong>MCP Endpoint:</strong> <code>${response.mcp_endpoint}</code><br>
            <strong>Customer ID:</strong> <code>${response.customer_id}</code><br>
            <strong>Tools Active:</strong> ${response.tools_count}<br><br>
            Use the X-Customer-ID header with your customer ID when connecting to the MCP endpoint.
        `;
        document.getElementById('deploy-files').innerHTML = '';

        showStep(5);
    } catch (error) {
        hideLoading();
        alert(`Error: ${error.message}`);
    }
}

async function handleDeploy() {
    const target = document.querySelector('input[name="deploy-target"]:checked').value;

    try {
        showLoading('Generating deployment package...');
        const response = await apiClient.deploy(target);
        hideLoading();

        document.getElementById('deploy-instructions').innerHTML = `<strong>Instructions:</strong> ${response.instructions}`;
        renderDeployFiles(response.files);

        showStep(5);
    } catch (error) {
        hideLoading();
        alert(`Error: ${error.message}`);
    }
}

function handleStartOver() {
    apiClient.resetSession();
    state = {
        currentStep: 1,
        serverName: '',
        serverDescription: '',
        actions: [],
        authType: 'none',
        authConfig: {},
        generatedCode: null,
        selectedTier: 'free',
    };
    document.getElementById('system-description').value = '';

    // Reset tier selection UI
    document.querySelectorAll('.tier-option').forEach(t => t.classList.remove('selected'));
    document.querySelector('.tier-option[data-tier="free"]').classList.add('selected');
    document.querySelector('input[name="tier"][value="free"]').checked = true;
    document.getElementById('free-tier-info').classList.remove('hidden');
    document.getElementById('paid-tier-options').classList.add('hidden');
    document.getElementById('activate-btn').classList.remove('hidden');
    document.getElementById('deploy-btn').classList.add('hidden');

    showStep(1);
}

// Event Listeners
document.getElementById('describe-btn').addEventListener('click', handleDescribe);
document.getElementById('refine-btn').addEventListener('click', handleRefine);
document.getElementById('confirm-actions-btn').addEventListener('click', handleConfirmActions);
document.getElementById('confirm-auth-btn').addEventListener('click', handleConfirmAuth);
document.getElementById('activate-btn').addEventListener('click', handleActivate);
document.getElementById('deploy-btn').addEventListener('click', handleDeploy);
document.getElementById('start-over-btn').addEventListener('click', handleStartOver);

// Back buttons
document.getElementById('back-to-describe').addEventListener('click', () => showStep(1));
document.getElementById('back-to-actions').addEventListener('click', () => showStep(2));
document.getElementById('back-to-auth').addEventListener('click', () => showStep(3));

// Auth type radio change
document.querySelectorAll('input[name="auth-type"]').forEach(radio => {
    radio.addEventListener('change', handleAuthTypeChange);
});

// Deploy target selection
document.querySelectorAll('.deploy-target input').forEach(radio => {
    radio.addEventListener('change', handleTargetChange);
});

// Tier selection
document.querySelectorAll('input[name="tier"]').forEach(radio => {
    radio.addEventListener('change', handleTierChange);
});

// Enter key in refine input
document.getElementById('refine-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        handleRefine();
    }
});

// Enter key in description
document.getElementById('system-description').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
        handleDescribe();
    }
});

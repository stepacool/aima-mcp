/**
 * AutoMCP Frontend Application
 */

// State
let currentDesign = null;
let generatedCode = null;

// DOM Elements
const chatMessages = document.getElementById('chat-messages');
const chatForm = document.getElementById('chat-form');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const designPanel = document.getElementById('design-panel');
const designContent = document.getElementById('design-content');
const generateBtn = document.getElementById('generate-btn');
const refineBtn = document.getElementById('refine-btn');
const codePanel = document.getElementById('code-panel');
const codeContent = document.getElementById('code-content');
const deployTarget = document.getElementById('deploy-target');
const deployBtn = document.getElementById('deploy-btn');
const deployPanel = document.getElementById('deploy-panel');
const deployInstructions = document.getElementById('deploy-instructions');
const deployFiles = document.getElementById('deploy-files');
const loadingOverlay = document.getElementById('loading');

// Utility functions
function showLoading() {
    loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    loadingOverlay.classList.add('hidden');
}

function addMessage(content, role) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = formatMessage(content);

    messageDiv.appendChild(contentDiv);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function formatMessage(content) {
    // Basic markdown-like formatting
    return content
        // Code blocks
        .replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>')
        // Inline code
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        // Bold
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        // Italic
        .replace(/\*([^*]+)\*/g, '<em>$1</em>')
        // Line breaks
        .replace(/\n/g, '<br>');
}

function renderDesign(design) {
    let html = '';

    if (design.server_name) {
        html += `<div class="design-section">
            <h4>Server: ${design.server_name}</h4>
            <p>${design.description || ''}</p>
        </div>`;
    }

    if (design.tools && design.tools.length > 0) {
        html += '<div class="design-section"><h4>Tools</h4>';
        for (const tool of design.tools) {
            html += `<div class="design-item">
                <div class="design-item-name">${tool.name}</div>
                <div class="design-item-desc">${tool.description}</div>
            </div>`;
        }
        html += '</div>';
    }

    if (design.prompts && design.prompts.length > 0) {
        html += '<div class="design-section"><h4>Prompts</h4>';
        for (const prompt of design.prompts) {
            html += `<div class="design-item">
                <div class="design-item-name">${prompt.name}</div>
                <div class="design-item-desc">${prompt.description}</div>
            </div>`;
        }
        html += '</div>';
    }

    designContent.innerHTML = html;
}

function renderDeployFiles(files) {
    deployFiles.innerHTML = '';

    for (const [filename, content] of Object.entries(files)) {
        const fileDiv = document.createElement('div');
        fileDiv.className = 'deploy-file';

        fileDiv.innerHTML = `
            <div class="deploy-file-header">
                <span class="deploy-file-name">${filename}</span>
                <button class="copy-btn secondary" onclick="copyToClipboard('${filename}')">Copy</button>
            </div>
            <div class="deploy-file-content" id="file-${filename.replace(/[^a-zA-Z0-9]/g, '-')}">${escapeHtml(content)}</div>
        `;

        deployFiles.appendChild(fileDiv);
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

async function copyToClipboard(filename) {
    const contentId = `file-${filename.replace(/[^a-zA-Z0-9]/g, '-')}`;
    const content = document.getElementById(contentId)?.textContent;
    if (content) {
        await navigator.clipboard.writeText(content);
        alert('Copied to clipboard!');
    }
}

// Event handlers
async function handleSendMessage(e) {
    e.preventDefault();

    const message = messageInput.value.trim();
    if (!message) return;

    messageInput.value = '';
    addMessage(message, 'user');
    sendBtn.disabled = true;

    try {
        showLoading();
        const response = await apiClient.sendMessage(message);
        hideLoading();

        addMessage(response.response, 'assistant');

        if (response.design_complete && response.design) {
            currentDesign = response.design;
            renderDesign(currentDesign);
            designPanel.classList.remove('hidden');
        }
    } catch (error) {
        hideLoading();
        addMessage(`Error: ${error.message}`, 'assistant');
    } finally {
        sendBtn.disabled = false;
        messageInput.focus();
    }
}

async function handleGenerateCode() {
    if (!currentDesign) {
        alert('No design available. Please complete the chat first.');
        return;
    }

    try {
        showLoading();
        const response = await apiClient.generateCode();
        hideLoading();

        generatedCode = response.code;
        codeContent.textContent = generatedCode;
        codePanel.classList.remove('hidden');

        // Scroll to code panel
        codePanel.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        hideLoading();
        alert(`Error generating code: ${error.message}`);
    }
}

async function handleDeploy() {
    if (!generatedCode) {
        alert('No code generated. Please generate code first.');
        return;
    }

    const target = deployTarget.value;

    try {
        showLoading();
        const response = await apiClient.deploy(target);
        hideLoading();

        deployInstructions.innerHTML = `<strong>Instructions:</strong><br>${response.instructions}`;
        renderDeployFiles(response.files);
        deployPanel.classList.remove('hidden');

        // Scroll to deploy panel
        deployPanel.scrollIntoView({ behavior: 'smooth' });
    } catch (error) {
        hideLoading();
        alert(`Error generating deployment: ${error.message}`);
    }
}

function handleRefine() {
    designPanel.classList.add('hidden');
    codePanel.classList.add('hidden');
    deployPanel.classList.add('hidden');
    messageInput.focus();
}

// Handle Enter key in textarea
messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(new Event('submit'));
    }
});

// Initialize event listeners
chatForm.addEventListener('submit', handleSendMessage);
generateBtn.addEventListener('click', handleGenerateCode);
refineBtn.addEventListener('click', handleRefine);
deployBtn.addEventListener('click', handleDeploy);

// Focus input on load
messageInput.focus();

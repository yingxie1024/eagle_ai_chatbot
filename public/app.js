// State management
let conversations = [];
let currentConversationId = null;
let availableModels = [];

// Configure marked.js for markdown rendering
if (typeof marked !== 'undefined') {
    marked.setOptions({
        breaks: true,  // Convert line breaks to <br>
        gfm: true,      // GitHub Flavored Markdown
        headerIds: false,
        mangle: false
    });
}

// DOM elements
const conversationList = document.getElementById('conversationList');
const chatMessages = document.getElementById('chatMessages');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const newChatBtn = document.getElementById('newChatBtn');
const modelSelect = document.getElementById('modelSelect');

// Initialize app
async function init() {
    await loadModels();
    loadConversationsFromStorage();
    renderConversations();
    
    // If no conversations, create a new one
    if (conversations.length === 0) {
        createNewConversation();
    } else {
        // Load the first conversation
        switchConversation(conversations[0].id);
    }
    
    // Set initial model selector visibility
    updateModelSelectorVisibility();

    // Event listeners
    sendBtn.addEventListener('click', handleSendMessage);
    newChatBtn.addEventListener('click', createNewConversation);
    messageInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
    
    // Auto-resize textarea
    messageInput.addEventListener('input', () => {
        messageInput.style.height = 'auto';
        messageInput.style.height = messageInput.scrollHeight + 'px';
    });
}

// Load available models from API
async function loadModels() {
    try {
        const response = await fetch('/api/models');
        const data = await response.json();
        
        if (data.data && Array.isArray(data.data)) {
            availableModels = data.data;
            modelSelect.innerHTML = '';
            
            availableModels.forEach(model => {
                const option = document.createElement('option');
                option.value = model.id;
                option.textContent = model.id;
                if (model.description) {
                    option.title = model.description;
                }
                modelSelect.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading models:', error);
        modelSelect.innerHTML = '<option value="supermind-agent-v1">supermind-agent-v1</option>';
    }
}

// Create a new conversation
function createNewConversation() {
    const conversation = {
        id: Date.now().toString(),
        title: 'New Chat',
        messages: [],
        model: null, // Model will be set when first message is sent
        createdAt: new Date().toISOString()
    };
    
    conversations.unshift(conversation);
    currentConversationId = conversation.id;
    saveConversationsToStorage();
    renderConversations();
    renderMessages();
    updateModelSelectorVisibility();
    messageInput.focus();
}

// Switch to a different conversation
function switchConversation(conversationId) {
    currentConversationId = conversationId;
    saveConversationsToStorage();
    renderConversations();
    renderMessages();
    updateModelSelectorVisibility();
    messageInput.focus();
}

// Count messages in conversation
function getMessageCount(conversation) {
    if (!conversation.messages || conversation.messages.length === 0) {
        return '0 messages';
    }
    
    const totalMessages = conversation.messages.length;
    const userMessages = conversation.messages.filter(m => m.role === 'user').length;
    const assistantMessages = conversation.messages.filter(m => m.role === 'assistant').length;
    
    return `${totalMessages} messages (${userMessages} user, ${assistantMessages} AI)`;
}

// Render conversation list
function renderConversations() {
    conversationList.innerHTML = '';
    
    conversations.forEach(conversation => {
        const item = document.createElement('div');
        item.className = `conversation-item ${conversation.id === currentConversationId ? 'active' : ''}`;
        item.onclick = () => switchConversation(conversation.id);
        
        // First row: Title
        const title = document.createElement('div');
        title.className = 'conversation-item-title';
        title.textContent = conversation.title;
        
        // Second row: Message counts
        const messageCount = document.createElement('div');
        messageCount.className = 'conversation-item-count';
        messageCount.textContent = getMessageCount(conversation);
        
        item.appendChild(title);
        item.appendChild(messageCount);
        
        // Show model info if conversation has a model
        if (conversation.model) {
            const modelInfo = document.createElement('div');
            modelInfo.className = 'conversation-item-model';
            modelInfo.textContent = `Model: ${conversation.model}`;
            item.appendChild(modelInfo);
        }
        
        conversationList.appendChild(item);
    });
}

// Update model selector visibility based on current conversation state
function updateModelSelectorVisibility() {
    const conversation = conversations.find(c => c.id === currentConversationId);
    const modelSelectorContainer = document.getElementById('modelSelector');
    const modelDisplayContainer = document.getElementById('modelDisplay');
    const modelNameSpan = document.getElementById('modelName');
    
    if (!conversation || conversation.messages.length === 0) {
        // Show model selector for new conversations
        if (modelSelectorContainer) {
            modelSelectorContainer.style.display = 'flex';
        }
        if (modelDisplayContainer) {
            modelDisplayContainer.style.display = 'none';
        }
        modelSelect.disabled = false;
    } else {
        // Hide model selector and show locked model for conversations with messages
        if (modelSelectorContainer) {
            modelSelectorContainer.style.display = 'none';
        }
        if (modelDisplayContainer && conversation.model) {
            modelDisplayContainer.style.display = 'flex';
            if (modelNameSpan) {
                modelNameSpan.textContent = conversation.model;
            }
        }
        modelSelect.disabled = true;
    }
}

// Render messages for current conversation
function renderMessages() {
    const conversation = conversations.find(c => c.id === currentConversationId);
    
    if (!conversation || conversation.messages.length === 0) {
        chatMessages.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-eaglet">🦅</div>
                <h3>Welcome to Eagle AI Chat</h3>
                <p>Select a model and start soaring with your conversations!</p>
                <div class="welcome-decorations">
                    <span class="deco-eaglet">🦅</span>
                    <span class="deco-eaglet">🦅</span>
                    <span class="deco-eaglet">🦅</span>
                </div>
            </div>
        `;
        return;
    }
    
    chatMessages.innerHTML = '';
    
    conversation.messages.forEach(message => {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.role}`;
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = message.role === 'user' ? '👤' : '🦅';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        
        // Render markdown for assistant messages, plain text for user messages
        if (message.role === 'assistant') {
            // Use marked.js to parse markdown
            if (typeof marked !== 'undefined') {
                content.innerHTML = marked.parse(message.content);
            } else {
                // Fallback to plain text if marked.js isn't loaded
                content.textContent = message.content;
            }
        } else {
            // User messages stay as plain text
            content.textContent = message.content;
        }
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
        chatMessages.appendChild(messageDiv);
    });
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Handle sending a message
async function handleSendMessage() {
    const message = messageInput.value.trim();
    if (!message) return;
    
    const conversation = conversations.find(c => c.id === currentConversationId);
    if (!conversation) {
        createNewConversation();
        return handleSendMessage();
    }
    
    // Determine which model to use
    let selectedModel;
    if (conversation.messages.length === 0) {
        // First message: use selected model from dropdown and lock it
        selectedModel = modelSelect.value;
        conversation.model = selectedModel;
    } else {
        // Subsequent messages: use the locked model from conversation
        if (!conversation.model) {
            // Fallback: if somehow model is missing, use default
            selectedModel = modelSelect.value || 'supermind-agent-v1';
            conversation.model = selectedModel;
        } else {
            selectedModel = conversation.model;
        }
    }
    
    // Add user message to conversation
    conversation.messages.push({
        role: 'user',
        content: message
    });
    
    // Update conversation title if it's the first message
    if (conversation.messages.length === 1) {
        conversation.title = message.substring(0, 50);
    }
    
    // Clear input
    messageInput.value = '';
    messageInput.style.height = 'auto';
    
    // Disable send button
    sendBtn.disabled = true;
    
    // Hide model selector after first message
    if (conversation.messages.length === 1) {
        updateModelSelectorVisibility();
    }
    
    // Render messages
    renderMessages();
    
    // Show loading indicator
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message assistant';
    loadingDiv.id = 'loading-message';
    loadingDiv.innerHTML = `
        <div class="message-avatar">🦅</div>
        <div class="message-content">
            <div class="loading">
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
                <div class="loading-dot"></div>
            </div>
        </div>
    `;
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    try {
        // Send request to API using the locked model
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: selectedModel,
                messages: conversation.messages,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Remove loading indicator
        const loadingMessage = document.getElementById('loading-message');
        if (loadingMessage) {
            loadingMessage.remove();
        }
        
        // Add assistant response
        if (data.choices && data.choices.length > 0) {
            const assistantMessage = data.choices[0].message.content;
            conversation.messages.push({
                role: 'assistant',
                content: assistantMessage
            });
        } else {
            throw new Error('No response from API');
        }
        
        // Save and render
        saveConversationsToStorage();
        renderConversations();
        renderMessages();
        
    } catch (error) {
        console.error('Error sending message:', error);
        
        // Remove loading indicator
        const loadingMessage = document.getElementById('loading-message');
        if (loadingMessage) {
            loadingMessage.remove();
        }
        
        // Show error message
        conversation.messages.push({
            role: 'assistant',
            content: `Error: ${error.message}. Please try again.`
        });
        
        saveConversationsToStorage();
        renderMessages();
    } finally {
        sendBtn.disabled = false;
        messageInput.focus();
    }
}

// Save conversations to localStorage
function saveConversationsToStorage() {
    localStorage.setItem('conversations', JSON.stringify(conversations));
    localStorage.setItem('currentConversationId', currentConversationId);
}

// Load conversations from localStorage
function loadConversationsFromStorage() {
    const saved = localStorage.getItem('conversations');
    if (saved) {
        conversations = JSON.parse(saved);
        // Ensure all conversations have a model field (for backward compatibility)
        conversations.forEach(conversation => {
            if (!conversation.hasOwnProperty('model')) {
                conversation.model = null;
            }
        });
    }
    
    const savedId = localStorage.getItem('currentConversationId');
    if (savedId && conversations.find(c => c.id === savedId)) {
        currentConversationId = savedId;
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}


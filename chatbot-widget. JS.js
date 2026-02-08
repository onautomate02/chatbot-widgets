/**
 * Chatbot Widget - Kungsriket
 * 
 * Installation:
 * <script src="https://YOUR-SERVER.com/chatbot-widget.js" 
 *         data-webhook="https://your-n8n-webhook-url"
 *         data-bot-name="Företagets Assistent"
 *         data-color="#667eea">
 * </script>
 */

(function() {
    'use strict';

    // Hämta konfiguration från script-taggen
    const currentScript = document.currentScript || document.querySelector('script[data-webhook]');
    
    const config = {
        webhookUrl: currentScript.getAttribute('data-webhook') || '',
        botName: currentScript.getAttribute('data-bot-name') || 'Assistent',
        primaryColor: currentScript.getAttribute('data-color') || '#667eea',
        secondaryColor: currentScript.getAttribute('data-color-secondary') || '#764ba2'
    };

    // Vänta tills DOM är redo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        injectStyles();
        createChatWidget();
        attachEventListeners();
    }

    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .kungsriket-chat-button {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, ${config.primaryColor} 0%, ${config.secondaryColor} 100%);
                color: white;
                border: none;
                cursor: pointer;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                transition: transform 0.3s, box-shadow 0.3s;
                z-index: 99998;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .kungsriket-chat-button:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
            }

            .kungsriket-chat-button.active {
                transform: rotate(45deg);
            }

            .kungsriket-chat-container {
                position: fixed;
                bottom: 90px;
                right: 20px;
                width: 380px;
                height: 550px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                display: none;
                flex-direction: column;
                overflow: hidden;
                z-index: 99999;
                animation: slideUp 0.3s ease-out;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .kungsriket-chat-container.open {
                display: flex;
            }

            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .kungsriket-chat-header {
                background: linear-gradient(135deg, ${config.primaryColor} 0%, ${config.secondaryColor} 100%);
                color: white;
                padding: 20px;
                font-weight: 600;
                font-size: 18px;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .kungsriket-chat-header::before {
                content: '💬';
                font-size: 24px;
            }

            .kungsriket-chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                background: #f8f9fa;
            }

            .kungsriket-message {
                margin-bottom: 16px;
                display: flex;
                gap: 10px;
                animation: fadeIn 0.3s ease-out;
            }

            @keyframes fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .kungsriket-message.user {
                flex-direction: row-reverse;
            }

            .kungsriket-message-bubble {
                max-width: 75%;
                padding: 12px 16px;
                border-radius: 16px;
                word-wrap: break-word;
                line-height: 1.4;
                font-size: 14px;
            }

            .kungsriket-message.bot .kungsriket-message-bubble {
                background: white;
                color: #333;
                border-bottom-left-radius: 4px;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            }

            .kungsriket-message.user .kungsriket-message-bubble {
                background: linear-gradient(135deg, ${config.primaryColor} 0%, ${config.secondaryColor} 100%);
                color: white;
                border-bottom-right-radius: 4px;
            }

            .kungsriket-message-avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                flex-shrink: 0;
            }

            .kungsriket-message.bot .kungsriket-message-avatar {
                background: linear-gradient(135deg, ${config.primaryColor} 0%, ${config.secondaryColor} 100%);
            }

            .kungsriket-message.user .kungsriket-message-avatar {
                background: #e9ecef;
            }

            .kungsriket-typing-indicator {
                display: none;
                padding: 12px 16px;
                background: white;
                border-radius: 16px;
                width: fit-content;
                box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            }

            .kungsriket-typing-indicator.active {
                display: block;
            }

            .kungsriket-typing-indicator span {
                display: inline-block;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #999;
                margin: 0 2px;
                animation: typing 1.4s infinite;
            }

            .kungsriket-typing-indicator span:nth-child(2) {
                animation-delay: 0.2s;
            }

            .kungsriket-typing-indicator span:nth-child(3) {
                animation-delay: 0.4s;
            }

            @keyframes typing {
                0%, 60%, 100% {
                    transform: translateY(0);
                    opacity: 0.7;
                }
                30% {
                    transform: translateY(-10px);
                    opacity: 1;
                }
            }

            .kungsriket-chat-input-container {
                padding: 16px;
                background: white;
                border-top: 1px solid #e9ecef;
                display: flex;
                gap: 10px;
            }

            .kungsriket-chat-input {
                flex: 1;
                border: 2px solid #e9ecef;
                border-radius: 24px;
                padding: 12px 16px;
                font-size: 14px;
                outline: none;
                transition: border-color 0.3s;
                font-family: inherit;
            }

            .kungsriket-chat-input:focus {
                border-color: ${config.primaryColor};
            }

            .kungsriket-send-button {
                width: 44px;
                height: 44px;
                border-radius: 50%;
                background: linear-gradient(135deg, ${config.primaryColor} 0%, ${config.secondaryColor} 100%);
                color: white;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                transition: transform 0.2s;
            }

            .kungsriket-send-button:hover:not(:disabled) {
                transform: scale(1.1);
            }

            .kungsriket-send-button:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .kungsriket-welcome-message {
                text-align: center;
                padding: 40px 20px;
                color: #666;
            }

            .kungsriket-welcome-message h2 {
                color: #333;
                margin-bottom: 10px;
                font-size: 20px;
            }

            .kungsriket-chat-messages::-webkit-scrollbar {
                width: 6px;
            }

            .kungsriket-chat-messages::-webkit-scrollbar-track {
                background: #f1f1f1;
            }

            .kungsriket-chat-messages::-webkit-scrollbar-thumb {
                background: #ccc;
                border-radius: 3px;
            }

            .kungsriket-chat-messages::-webkit-scrollbar-thumb:hover {
                background: #999;
            }

            @media (max-width: 480px) {
                .kungsriket-chat-container {
                    width: calc(100vw - 20px);
                    height: calc(100vh - 100px);
                    right: 10px;
                    bottom: 80px;
                }
            }
        `;
        document.head.appendChild(style);
    }

    function createChatWidget() {
        // Chat button
        const button = document.createElement('button');
        button.className = 'kungsriket-chat-button';
        button.id = 'kungsriketChatButton';
        button.innerHTML = '💬';
        button.setAttribute('aria-label', 'Öppna chat');

        // Chat container
        const container = document.createElement('div');
        container.className = 'kungsriket-chat-container';
        container.id = 'kungsriketChatContainer';
        container.innerHTML = `
            <div class="kungsriket-chat-header">
                ${config.botName}
            </div>
            
            <div class="kungsriket-chat-messages" id="kungsriketChatMessages">
                <div class="kungsriket-welcome-message">
                    <h2>👋 Välkommen!</h2>
                    <p>Jag är ${config.botName}. Hur kan jag hjälpa dig idag?</p>
                </div>
            </div>

            <div class="kungsriket-chat-input-container">
                <input 
                    type="text" 
                    class="kungsriket-chat-input" 
                    id="kungsriketChatInput" 
                    placeholder="Skriv ditt meddelande..."
                    autocomplete="off"
                >
                <button class="kungsriket-send-button" id="kungsriketSendButton" aria-label="Skicka meddelande">
                    ➤
                </button>
            </div>
        `;

        document.body.appendChild(button);
        document.body.appendChild(container);
    }

    function attachEventListeners() {
        const chatButton = document.getElementById('kungsriketChatButton');
        const chatContainer = document.getElementById('kungsriketChatContainer');
        const chatInput = document.getElementById('kungsriketChatInput');
        const sendButton = document.getElementById('kungsriketSendButton');

        // Toggle chat
        chatButton.addEventListener('click', () => {
            chatContainer.classList.toggle('open');
            chatButton.classList.toggle('active');
            if (chatContainer.classList.contains('open')) {
                chatInput.focus();
            }
        });

        // Send message
        sendButton.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    async function sendMessage() {
        const chatInput = document.getElementById('kungsriketChatInput');
        const sendButton = document.getElementById('kungsriketSendButton');
        const chatMessages = document.getElementById('kungsriketChatMessages');
        
        const message = chatInput.value.trim();
        
        if (!message) return;

        if (!config.webhookUrl) {
            console.error('Chatbot error: No webhook URL configured');
            addMessage('Fel: Chatbot är inte korrekt konfigurerad.', 'bot');
            return;
        }

        // Clear input and disable
        chatInput.value = '';
        chatInput.disabled = true;
        sendButton.disabled = true;

        // Remove welcome message if exists
        const welcomeMsg = chatMessages.querySelector('.kungsriket-welcome-message');
        if (welcomeMsg) {
            welcomeMsg.remove();
        }

        // Add user message
        addMessage(message, 'user');

        // Show typing indicator
        const typingIndicator = addTypingIndicator();

        try {
            const response = await fetch(config.webhookUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    timestamp: new Date().toISOString(),
                    source: 'widget'
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Remove typing indicator
            typingIndicator.remove();

            // Add bot response
            const botMessage = data.response || data.message || data.output || JSON.stringify(data);
            addMessage(botMessage, 'bot');

        } catch (error) {
            console.error('Chatbot error:', error);
            typingIndicator.remove();
            addMessage('Tyvärr, något gick fel. Försök igen om en stund.', 'bot');
        } finally {
            chatInput.disabled = false;
            sendButton.disabled = false;
            chatInput.focus();
        }
    }

    function addMessage(text, sender) {
        const chatMessages = document.getElementById('kungsriketChatMessages');
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `kungsriket-message ${sender}`;

        const avatar = document.createElement('div');
        avatar.className = 'kungsriket-message-avatar';
        avatar.textContent = sender === 'bot' ? '🤖' : '👤';

        const bubble = document.createElement('div');
        bubble.className = 'kungsriket-message-bubble';
        bubble.textContent = text;

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(bubble);
        chatMessages.appendChild(messageDiv);

        chatMessages.scrollTop = chatMessages.scrollHeight;

        return messageDiv;
    }

    function addTypingIndicator() {
        const chatMessages = document.getElementById('kungsriketChatMessages');
        
        const messageDiv = document.createElement('div');
        messageDiv.className = 'kungsriket-message bot';

        const avatar = document.createElement('div');
        avatar.className = 'kungsriket-message-avatar';
        avatar.textContent = '🤖';

        const indicator = document.createElement('div');
        indicator.className = 'kungsriket-typing-indicator active';
        indicator.innerHTML = '<span></span><span></span><span></span>';

        messageDiv.appendChild(avatar);
        messageDiv.appendChild(indicator);
        chatMessages.appendChild(messageDiv);

        chatMessages.scrollTop = chatMessages.scrollHeight;

        return messageDiv;
    }

})();

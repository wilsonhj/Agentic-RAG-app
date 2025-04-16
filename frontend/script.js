document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const chatHistory = document.getElementById('chat-history');

    // Configure marked.js
    marked.setOptions({
        highlight: function(code, language) {
            if (language && hljs.getLanguage(language)) {
                return hljs.highlight(code, { language: language }).value;
            }
            return hljs.highlightAuto(code).value;
        },
        breaks: true,
        gfm: true
    });

    // Function to add a message to the chat history
    function addMessage(sender, message, isMarkdown = false) {
        const messageElement = document.createElement('div');
        messageElement.classList.add('message', sender === 'user' ? 'user-message' : 'bot-message');
        
        if (isMarkdown && sender === 'bot') {
            // Process markdown for bot messages
            messageElement.innerHTML = marked.parse(message);
            // Apply syntax highlighting to code blocks
            messageElement.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });
        } else {
            messageElement.textContent = message;
        }
        
        chatHistory.appendChild(messageElement);
        // Scroll to the bottom of the chat history
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    // Function to handle sending a message
    async function sendMessage() {
        const query = userInput.value.trim();
        if (query === '') return; // Don't send empty messages

        addMessage('user', query);
        userInput.value = ''; // Clear the input field
        sendButton.disabled = true; // Disable button while processing
        
        // Add thinking message
        const thinkingMessage = document.createElement('div');
        thinkingMessage.classList.add('message', 'bot-message', 'thinking');
        thinkingMessage.textContent = 'Thinking...';
        chatHistory.appendChild(thinkingMessage);
        chatHistory.scrollTop = chatHistory.scrollHeight;

        try {
            const response = await fetch('http://localhost:8001/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: query }),
            });

            // Remove the thinking message
            chatHistory.removeChild(thinkingMessage);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Unknown server error' }));
                console.error('Error from backend:', errorData);
                addMessage('bot', `Error: ${errorData.detail || 'Could not process request.'}`);
                return;
            }

            const data = await response.json();
            // Add the bot's response with markdown formatting
            addMessage('bot', data.answer, true);

        } catch (error) {
            // Remove the thinking message
            if (thinkingMessage.parentNode === chatHistory) {
                chatHistory.removeChild(thinkingMessage);
            }
            console.error('Error sending message:', error);
            addMessage('bot', 'Sorry, something went wrong. Please try again later.');
        } finally {
            sendButton.disabled = false; // Re-enable button
            userInput.focus(); // Focus back on input
        }
    }

    // Event listener for the send button
    sendButton.addEventListener('click', sendMessage);

    // Event listener for pressing Enter in the input field
    userInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault(); // Prevent default to avoid newline
            sendMessage();
        }
    });

    // Add initial welcome message
    addMessage('bot', '👋 Welcome! I\'m your Software Consulting AI assistant. How can I help you today?', true);
});

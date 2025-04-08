document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const chatHistory = document.getElementById('chat-history');

    // Function to add a message to the chat history
    function addMessage(sender, message) {
        const messageElement = document.createElement('p');
        messageElement.textContent = message;
        messageElement.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
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
        addMessage('bot', 'Thinking...'); // Show thinking indicator

        try {
            const response = await fetch('/query', { // Assuming the backend runs on the same host/port for now
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: query }),
            });

            // Remove the "Thinking..." message
            const thinkingMessage = chatHistory.querySelector('p:last-child');
            if (thinkingMessage && thinkingMessage.textContent === 'Thinking...') {
                chatHistory.removeChild(thinkingMessage);
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Unknown server error' }));
                console.error('Error from backend:', errorData);
                addMessage('bot', `Error: ${errorData.detail || 'Could not process request.'}`);
                return; // Exit the function after handling the error
            }

            const data = await response.json();
            addMessage('bot', data.answer);

        } catch (error) {
             // Remove the "Thinking..." message even if there's an error
            const thinkingMessage = chatHistory.querySelector('p:last-child');
            if (thinkingMessage && thinkingMessage.textContent === 'Thinking...') {
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
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

     // Initial welcome message (optional)
    // addMessage('bot', 'Welcome! How can I help with your software consulting needs today?');
});

import React, { useState, useEffect, useRef } from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import 'highlight.js/styles/github-dark.css'
import './App.css'

const MODELS = [
  { name: 'Sonar', value: 'sonar' }
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState(MODELS[0].value);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Add welcome message
    setMessages([{
      role: 'assistant',
      content: '👋 Welcome! I\'m your Software Consulting AI assistant. How can I help you today?'
    }]);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setError(null);
    setIsLoading(true);
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    const payload = {
      query: input,
      model: selectedModel
    };

    console.log('Sending request to:', 'http://localhost:8001/query');
    console.log('Request payload:', payload);

    try {
      const response = await fetch('http://localhost:8001/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.detail || 'Failed to get response');
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      const assistantMessage: Message = { role: 'assistant', content: data.answer };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Software Consulting RAG Agent</h1>
          
          {/* Model Selector */}
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors"
          >
            {MODELS.map(model => (
              <option key={model.value} value={model.value}>
                {model.name}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          {/* Chat Messages */}
          <div className="h-[60vh] overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`${
                  message.role === 'user' 
                    ? 'ml-auto bg-blue-600' 
                    : 'mr-auto bg-gray-700'
                } max-w-[80%] rounded-lg overflow-hidden`}
              >
                <div className="p-4">
                  {message.role === 'user' ? (
                    <div className="text-white">{message.content}</div>
                  ) : (
                    <ReactMarkdown
                      rehypePlugins={[rehypeHighlight, rehypeRaw]}
                      className="markdown-body text-gray-100"
                      components={{
                        code({ node, inline, className, children, ...props }) {
                          return (
                            <code
                              className={`${className} ${inline ? 'inline-code' : 'block-code'}`}
                              {...props}
                            >
                              {children}
                            </code>
                          );
                        },
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
            {error && (
              <div className="bg-red-600 text-white p-4 rounded-lg">
                Error: {error}
              </div>
            )}
            {isLoading && (
              <div className="bg-gray-700 text-gray-300 p-4 rounded-lg mr-auto max-w-[80%]">
                <div className="flex items-center space-x-2">
                  <div className="animate-pulse">Thinking</div>
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Form */}
          <div className="border-t border-gray-700 p-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about software consulting..."
                className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg disabled:opacity-50 hover:bg-blue-700 transition-colors"
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App 
import React from 'react'
import { ChatMessage } from './ChatMessage'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatWindowProps {
  messages: Message[]
  messagesEndRef: React.RefObject<HTMLDivElement>
  error: string | null
  isLoading: boolean
}

const ChatWindow: React.FC<ChatWindowProps> = ({ messages, messagesEndRef, error, isLoading }) => (
  <div className="h-[60vh] overflow-y-auto p-4 space-y-4">
    {messages.map((message, index) => (
      <ChatMessage key={index} message={message} />
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
)

export default ChatWindow
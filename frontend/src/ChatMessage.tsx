import React from 'react'
import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const ChatMessage = ({ message }: { message: Message }) => (
  <div
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
        >
          {message.content}
        </ReactMarkdown>
      )}
    </div>
  </div>
)
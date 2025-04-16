import React, { useState, useEffect, useRef } from 'react'
import ModelSelector from './ModelSelector'
import ChatWindow from './ChatWindow'
import InputForm from './InputForm'
import 'highlight.js/styles/github-dark.css'
import './App.css'

// Add all available models
const MODELS = [
  { name: 'Sonar', value: 'sonar' },
  { name: 'Sonar Reasoning', value: 'sonar-reasoning' },
  { name: 'Sonar Reseach', value: 'sonar-reseach' },
  { name: 'Sonar Pro', value: 'sonar-pro' },
  { name: 'R1', value: 'r1-1776' }
];

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [selectedModel, setSelectedModel] = useState(MODELS[0].value)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    setMessages([{
      role: 'assistant',
      content: '👋 Welcome! I\'m your Software Consulting AI assistant. How can I help you today?'
    }])
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    setError(null)
    setIsLoading(true)
    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')

    const payload = {
      query: input,
      model: selectedModel
    }

    try {
      const response = await fetch('http://localhost:8001/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to get response')
      }

      const data = await response.json()
      const assistantMessage: Message = { role: 'assistant', content: data.answer }
      setMessages(prev => [...prev, assistantMessage])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Software Consulting RAG Agent</h1>
          <ModelSelector
            models={MODELS}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
        </div>
        <div className="bg-gray-800 rounded-lg shadow-lg overflow-hidden">
          <ChatWindow
            messages={messages}
            messagesEndRef={messagesEndRef}
            error={error}
            isLoading={isLoading}
          />
          <div className="border-t border-gray-700 p-4">
            <InputForm
              input={input}
              setInput={setInput}
              handleSubmit={handleSubmit}
              isLoading={isLoading}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
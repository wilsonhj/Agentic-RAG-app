import React from 'react'

interface InputFormProps {
  input: string
  setInput: (val: string) => void
  handleSubmit: (e: React.FormEvent) => void
  isLoading: boolean
}

const InputForm: React.FC<InputFormProps> = ({ input, setInput, handleSubmit, isLoading }) => (
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
)

export default InputForm
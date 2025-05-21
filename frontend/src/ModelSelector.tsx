import React from 'react'

interface Model {
  name: string
  value: string
}

interface ModelSelectorProps {
  models: Model[]
  selectedModel: string
  setSelectedModel: (model: string) => void
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ models, selectedModel, setSelectedModel }) => (
  <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto">
    <label htmlFor="model-selector" className="text-xs sm:text-sm font-medium mr-1 sm:mr-2">
      Model:
    </label>
    <select
      id="model-selector"
      value={selectedModel}
      onChange={(e) => setSelectedModel(e.target.value)}
      className="bg-gray-800 text-white px-2 py-2 sm:px-4 sm:py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
      style={{ minHeight: 44 }} // Ensures touch target size
    >
      {models.map(model => (
        <option key={model.value} value={model.value}>
          {model.name}
        </option>
      ))}
    </select>
  </div>
)
               
export default ModelSelector
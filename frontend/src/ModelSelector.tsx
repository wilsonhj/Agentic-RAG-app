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
  <div className="flex items-center gap-2">
    <label htmlFor="model-selector" className="text-sm font-medium">
      Model Selector:
    </label>
    <select
      id="model-selector"
      value={selectedModel}
      onChange={(e) => setSelectedModel(e.target.value)}
      className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 hover:border-blue-500 transition-colors"
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
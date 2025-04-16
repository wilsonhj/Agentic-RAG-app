# Agentic RAG Application for Software Consulting

This project implements a Retrieval-Augmented Generation (RAG) application tailored for software consulting tasks. It uses an agentic approach combined with modern open-source LLMs (like Llama 3 or Gemma 3) to provide knowledgeable and context-aware assistance.

## Features

- **Agentic RAG**: Leverages agentic principles for more robust interaction and task handling.
- **Software Consulting Focus**: Designed to ingest and retrieve information relevant to software development, architecture, and best practices.
- **Open-Source LLMs**: Utilizes powerful open-source models.
- **Minimal Dark UI**: Clean and simple user interface with a dark theme.
- **Guardrails**: Basic implementation to prevent misuse.
- **Model Selector Dropdown**: Users can choose from all supported Perplexity models (e.g., Sonar, Llama 3, Mixtral, CodeLlama) via a dropdown menu in the UI. The selected model is used for all queries.

## Project Structure

```
.
├── backend/
│   ├── main.py           # FastAPI application
│   └── requirements.txt  # Python dependencies
├── data/                 # Directory for storing knowledge base / vector store
│   └── .gitkeep
├── frontend/
│   ├── index.html        # Vite entry HTML file
│   ├── src/
│   │   ├── App.tsx           # Main React component
│   │   ├── App.css           # Main CSS (with Tailwind and markdown styles)
│   │   ├── ChatMessage.tsx   # Chat message component
│   │   ├── ModelSelector.tsx # Model selector dropdown component
│   │   ├── InputForm.tsx     # Input form component
│   │   ├── ChatWindow.tsx    # Chat window component
│   │   └── main.tsx          # React entry point
│   ├── package.json      # Frontend dependencies and scripts
│   ├── tailwind.config.js # Tailwind CSS config
│   └── ...               # Other config files
└── README.md             # This file
```

## Setup and Running

1. **Backend**:
    ```bash
    cd backend
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    pip install -r requirements.txt
    uvicorn main:app --reload --port 8001
    ```

2. **Frontend**:
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    The frontend will be available at [http://localhost:5173](http://localhost:5173).

3. **Usage**:
    - The React frontend communicates with the FastAPI backend via API calls.
    - In development, both servers must be running (frontend and backend on separate ports).

## Notes

- The Model Selector is implemented as a modular React component (`ModelSelector.tsx`) and uses only valid Perplexity model names.
- Legacy files (`script.js`, `style.css`) have been removed. All UI logic and styling are now handled by React, Tailwind CSS, and `App.css`.
- The frontend uses Vite for fast development and hot reloading.
- In production, you can build the frontend and serve static files from the backend or a dedicated web server.

## TODO

- Implement core RAG logic (document loading, embedding, vector store, retrieval, generation).
- Integrate specific LLM (Perplexity).
- Refine agentic components.
- Implement guardrails (content filtering, rate limiting).
- Add data ingestion pipeline.

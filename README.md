# Agentic RAG Application for Software Consulting

This project implements a Retrieval-Augmented Generation (RAG) application tailored for software consulting tasks. It uses an agentic approach combined with modern open-source LLMs (like Llama 3 or Gemma 3) to provide knowledgeable and context-aware assistance.

## Features

-   **Agentic RAG**: Leverages agentic principles for more robust interaction and task handling.
-   **Software Consulting Focus**: Designed to ingest and retrieve information relevant to software development, architecture, and best practices.
-   **Open-Source LLMs**: Utilizes powerful open-source models.
-   **Minimal Dark UI**: Clean and simple user interface with a dark theme.
-   **Guardrails**: Basic implementation to prevent misuse.

## Project Structure

```
.
├── backend/
│   ├── main.py         # FastAPI application
│   └── requirements.txt # Python dependencies
├── data/               # Directory for storing knowledge base / vector store
│   └── .gitkeep
├── frontend/
│   ├── index.html      # Main HTML file
│   ├── script.js       # Frontend JavaScript
│   └── style.css       # CSS styling
└── README.md           # This file
```

## Setup and Running

1.  **Backend**:
    ```bash
    cd backend
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    pip install -r requirements.txt
    # Download LLM model weights (e.g., Llama 3) and place them appropriately
    uvicorn main:app --reload
    ```

2.  **Frontend**: Open `frontend/index.html` in your web browser.

## TODO

-   Implement core RAG logic (document loading, embedding, vector store, retrieval, generation).
-   Integrate specific LLM (Llama 3 / Gemma 3).
-   Refine agentic components.
-   Implement guardrails (content filtering, rate limiting).
-   Connect frontend to backend API properly.
-   Add data ingestion pipeline.

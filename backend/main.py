from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import os
from pathlib import Path
from langchain_community.document_loaders import DirectoryLoader, TextLoader
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.llms import LlamaCpp
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.chains import RetrievalQA

# Configuration
DATA_PATH = Path("../data") # Assumes data directory is one level up from backend
VECTOR_STORE_PATH = "vectorstore/db_faiss"
MODEL_PATH = "/path/to/your/llm/model.gguf" # <<<--- IMPORTANT: Update this path
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50

app = FastAPI()

# Global variables for RAG components (initialize lazily)
vector_store = None
llm = None
rag_chain = None

def initialize_rag():
    global vector_store, llm, rag_chain

    print("Initializing RAG components...")

    # 1. Load or create embeddings
    print(f"Loading embedding model: {EMBEDDING_MODEL_NAME}")
    embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL_NAME)

    # 2. Load or create the vector store
    if os.path.exists(VECTOR_STORE_PATH):
        print(f"Loading existing vector store from: {VECTOR_STORE_PATH}")
        vector_store = FAISS.load_local(VECTOR_STORE_PATH, embeddings, allow_dangerous_deserialization=True) # Allow deserialization
    else:
        print(f"Creating new vector store from data in: {DATA_PATH}")
        if not DATA_PATH.exists() or not any(DATA_PATH.iterdir()):
             print(f"Warning: Data directory '{DATA_PATH}' is empty or does not exist.")
             # Create an empty store if no data? Or raise error?
             # For now, let's proceed but it won't have data.
             documents = []
        else:
            # Simple loader for .txt files for now
            loader = DirectoryLoader(DATA_PATH, glob="**/*.txt", loader_cls=TextLoader, show_progress=True)
            documents = loader.load()

        if documents:
            text_splitter = RecursiveCharacterTextSplitter(chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP)
            texts = text_splitter.split_documents(documents)
            print(f"Creating FAISS index with {len(texts)} text chunks.")
            vector_store = FAISS.from_documents(texts, embeddings)
            print(f"Saving vector store to: {VECTOR_STORE_PATH}")
            os.makedirs(os.path.dirname(VECTOR_STORE_PATH), exist_ok=True)
            vector_store.save_local(VECTOR_STORE_PATH)
        else:
            print("No documents found to create vector store. RAG will operate without retrieval.")
            # Create an empty FAISS index? This might require at least one dummy document.
            # Or handle this case in the query logic.

    # 3. Initialize the LLM
    if not os.path.exists(MODEL_PATH):
         print(f"Error: LLM model not found at {MODEL_PATH}. Please update the MODEL_PATH variable.")
         # Decide how to handle - raise error, disable LLM part?
         # For now, we'll let it fail later if used.
         llm = None # Explicitly set to None
    else:
        print(f"Loading LLM from: {MODEL_PATH}")
        try:
            llm = LlamaCpp(
                model_path=MODEL_PATH,
                n_gpu_layers=-1, # Use -1 to utilize all available GPU layers
                n_batch=512,    # Adjust based on your VRAM
                n_ctx=2048,     # Context window size
                verbose=True,   # Print LlamaCpp logs
                # f16_kv=True,  # Potentially speeds up inference if VRAM allows
            )
        except Exception as e:
            print(f"Error loading LLM: {e}")
            llm = None # Ensure llm is None if loading fails

    # 4. Create the RAG chain (only if both vector_store and llm are available)
    if vector_store is not None and llm is not None:
        print("Creating RAG chain...")
        retriever = vector_store.as_retriever()
        # Could use different chain types (e.g., load_qa_chain with map_reduce)
        rag_chain = RetrievalQA.from_chain_type(
            llm=llm,
            chain_type="stuff", # Simple chain type, fits all context in one prompt
            retriever=retriever,
            return_source_documents=True # Optionally return source docs
        )
        print("RAG components initialized successfully.")
    elif vector_store is None:
         print("Vector store not available. Cannot create RAG chain.")
    elif llm is None:
         print("LLM not available. Cannot create RAG chain.")

# Run initialization on startup (can be slow, consider background task or endpoint)
# For simplicity, run it directly here. Add error handling.
try:
    initialize_rag()
except Exception as e:
    print(f"Error during RAG initialization: {e}")
    # Decide if the app should still start or exit

class QueryRequest(BaseModel):
    query: str

class QueryResponse(BaseModel):
    answer: str

@app.get("/")
def read_root():
    return {"message": "Agentic RAG API is running!"}

@app.post("/query", response_model=QueryResponse)
async def process_query(request: QueryRequest):
    print(f"Received query: {request.query}")

    if rag_chain is None:
        print("RAG chain is not initialized.")
        # Fallback behavior: maybe just echo the query or return a static message
        if llm is not None:
             # If LLM loaded but no vector store, maybe just use LLM?
             print("Using LLM directly (no retrieval)...")
             try:
                 # Note: Direct LLM invocation might need different handling
                 # depending on the Langchain version/LLM wrapper.
                 # This is a simplified example.
                 result = llm(request.query) # Check if this direct call works or needs invoke/arun
                 answer = result if isinstance(result, str) else str(result)
             except Exception as e:
                 print(f"Error during direct LLM call: {e}")
                 raise HTTPException(status_code=500, detail="Error processing query with LLM.")
        else:
            # No LLM, no RAG chain
            raise HTTPException(status_code=503, detail="RAG system not available. LLM or Vector Store failed to initialize.")
    else:
        # Use the RAG chain
        try:
            print("Processing query with RAG chain...")
            result = rag_chain({"query": request.query})
            answer = result.get('result', "Sorry, I couldn't find an answer.")
            # Optional: Log or include source documents
            # source_docs = result.get('source_documents')
            # if source_docs:
            #    print(f"Source documents found: {len(source_docs)}")
        except Exception as e:
            print(f"Error during RAG chain execution: {e}")
            raise HTTPException(status_code=500, detail="Error processing query with RAG chain.")

    return QueryResponse(answer=answer)

if __name__ == "__main__":
    import uvicorn
    # Run initialization only if executed directly (might be redundant if done above)
    # if rag_chain is None:
    #    initialize_rag() # Ensure it's initialized if run directly

    # Note: Uvicorn reloader might cause multiple initializations if not careful.
    # Consider a more robust initialization strategy for production (e.g., lifespan events).
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

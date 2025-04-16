from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import os
from dotenv import load_dotenv
import httpx
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Configuration
PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")
PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions"

# Log API key status (masked for security)
logger.info(f"Perplexity API Key loaded: {'Yes' if PERPLEXITY_API_KEY else 'No'}")

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str
    model: str = "sonar"  # default model

class QueryResponse(BaseModel):
    answer: str

async def query_perplexity(query: str, model: str = "sonar") -> str:
    headers = {
        "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
        "Content-Type": "application/json"
    }
    
    messages = [
        {"role": "system", "content": "You are a helpful AI assistant specializing in software consulting."},
        {"role": "user", "content": query}
    ]
    
    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 1000,
        "stream": False
    }
    
    logger.info(f"Sending request to Perplexity API with model: {model}")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                PERPLEXITY_API_URL,
                headers=headers,
                json=payload,
                timeout=30.0
            )
            
            logger.info(f"Perplexity API response status: {response.status_code}")
            
            if response.status_code != 200:
                logger.error(f"Perplexity API error: {response.text}")
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"Error from Perplexity API: {response.text}"
                )
            
            return response.json()["choices"][0]["message"]["content"]
        except Exception as e:
            logger.error(f"Error in query_perplexity: {str(e)}")
            raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def read_root():
    return {"message": "Software Consulting RAG API is running!"}

@app.post("/query", response_model=QueryResponse)
async def process_query(request: QueryRequest):
    if not PERPLEXITY_API_KEY:
        raise HTTPException(status_code=500, detail="Perplexity API key not configured")
    
    try:
        answer = await query_perplexity(request.query, request.model)
        return QueryResponse(answer=answer)
    except Exception as e:
        logger.error(f"Error processing query: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)

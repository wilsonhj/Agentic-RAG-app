from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from enum import Enum
import logging
from queryModels import query_model
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ModelChoice(str, Enum):
    sonar = "sonar"
    sonar_reasoning = "sonar-reasoning"
    r1 = "r1-1776"
    sonar_deep_reseach = "sonar-deep-research"
    gemini_2_5_pro = "gemini-2.5-pro-preview-05-06"
    gpt_4o_mini = "gpt-4.1" # FIXME: change to gpt 4.1

class QueryRequest(BaseModel):
    query: str
    model: str = "sonar"

class QueryResponse(BaseModel):
    answer: str

@app.get("/")
async def read_root():
    return {"message": "Software Consulting RAG API is running!"}

@app.post("/query", response_model=QueryResponse)
async def process_query(request: QueryRequest):
    answer = await query_model(request.query, request.model)
    return QueryResponse(answer=answer)

if __name__ == "__main__":
        uvicorn.run("main:app", host="0.0.0.0", port=8001, reload=True)

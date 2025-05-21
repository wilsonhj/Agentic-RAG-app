import os
from dotenv import load_dotenv
import httpx
import logging
from google import genai
from fastapi import HTTPException
from openai import OpenAI

load_dotenv()

# Perplexity API config
PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")
PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions"

# Gemini API config
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
client = genai.Client(api_key=GOOGLE_API_KEY)

# OpenAI API config
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
openai_client = OpenAI(api_key=OPENAI_API_KEY)

logger = logging.getLogger(__name__)

content = "You are a A.I. Software Engineering Consultant with expert knowledge in software development, devops, software architecture, machine learning, AI."

async def query_perplexity(query: str, model: str) -> str:
    headers = {
        "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
        "Content-Type": "application/json"
    }
    messages = [
        {"role": "system", "content": content},
        {"role": "user", "content": query}
    ]
    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.7,
        "max_tokens": 1000,
        "stream": False
    }
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                PERPLEXITY_API_URL,
                headers=headers,
                json=payload,
                timeout=30.0
            )
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

def query_gemini(query: str, model: str = "gemini-2.5-pro-exp-03-25") -> str:
    try:
        response = client.models.generate_content(
            model=model,
            contents=query,
        )
        return response.text
    except Exception as e:
        print(f"Error querying Gemini: {e}")
        return "Error querying Gemini"

async def query_openai(query: str, model: "gpt-4.1") -> str:
    try:
        response = await openai_client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": content},
                {"role": "user", "content": query}
            ],
            temperature=0.7,
            max_tokens=1000,
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Error in query_openai: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def query_model(query: str, model: str) -> str:
    if model == "gemini-2.5-pro-exp-03-25":
        return query_gemini(query, model)
    elif model == "gpt-4.1":
        return await query_openai(query, model)
    else:
        return await query_perplexity(query, model)
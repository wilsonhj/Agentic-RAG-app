import os
import httpx
from dotenv import load_dotenv
import json

# Load environment variables
load_dotenv()

# Configuration
PERPLEXITY_API_KEY = os.getenv("PERPLEXITY_API_KEY")
PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions"

def query_perplexity(query: str, model: str = "sonar") -> str:
    """
    Query the Perplexity API with a given question.
    
    Args:
        query (str): The question to ask
        model (str): The model to use (default: "sonar")
    
    Returns:
        str: The model's response
    """
    headers = {
        "Authorization": f"Bearer {PERPLEXITY_API_KEY}",
        "Content-Type": "application/json"
    }
    
    messages = [
        {"role": "system", "content": "Be precise and concise."},
        {"role": "user", "content": query}
    ]
    
    payload = {
        "model": model,
        "messages": messages,
        "temperature": 0.2,
        "top_p": 0.9,
        "max_tokens": 1000,
        "stream": False
    }
    
    try:
        with httpx.Client() as client:
            response = client.post(
                PERPLEXITY_API_URL,
                headers=headers,
                json=payload,
                timeout=30.0
            )
            
            if response.status_code != 200:
                print(f"Error: {response.status_code}")
                print(response.text)
                return None
            
            return response.json()["choices"][0]["message"]["content"]
    except Exception as e:
        print(f"Error calling Perplexity API: {str(e)}")
        return None

if __name__ == "__main__":
    # Example usage
    question = "Which model are you running?"
    response = query_perplexity(question)
    if response:
        print(f"Question: {question}")
        print(f"Response: {response}")
    else:
        print("Failed to get response from Perplexity API") 
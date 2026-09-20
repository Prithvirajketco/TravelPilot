import os
import json
import requests
from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class IntentResponse(BaseModel):
    intent: str # create_trip, simulate_event, get_schedule, qna
    parameters: Dict[str, Any]

def parse_user_intent(user_text: str) -> IntentResponse:
    """
    Parses natural language into a structured intent for the TravelPilot orchestrator.
    Uses REST API directly to avoid protobuf dependency hell with ortools.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key or api_key == "mock_key":
        # Fallback for hackathon demo if no API key is provided
        if "cancel" in user_text.lower():
            return IntentResponse(intent="simulate_event", parameters={"event": "cancellation"})
        return IntentResponse(intent="create_trip", parameters={"destination": "Rome", "budget": 1000})

    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    
    prompt = f"""
    You are the Intent Router for TravelPilot.
    Classify the following user input into one of these intents: 
    - create_trip: User wants to plan a new trip (extract destination, days, budget, interests)
    - simulate_event: User wants to know what happens if something changes (e.g. flight cancelled, hotel changed)
    - get_schedule: User asks about their existing schedule (e.g. "What am I doing tomorrow morning?")
    - qna: General questions about the trip.
    
    User Input: "{user_text}"
    
    Return ONLY a valid JSON object matching this schema:
    {{
      "intent": "string",
      "parameters": {{ "key": "value" }}
    }}
    """
    
    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    
    try:
        resp = requests.post(url, json=payload)
        resp.raise_for_status()
        
        data = resp.json()
        text_resp = data["candidates"][0]["content"]["parts"][0]["text"].strip()
        
        # strip markdown formatting if present
        if text_resp.startswith("```json"):
            text_resp = text_resp[7:-3]
        elif text_resp.startswith("```"):
            text_resp = text_resp[3:-3]
            
        parsed = json.loads(text_resp)
        return IntentResponse(**parsed)
    except Exception as e:
        print(f"Agent Router Error: {e}")
        return IntentResponse(intent="create_trip", parameters={"destination": "Rome", "budget": 1000})

def format_explanation(facts: Dict[str, Any], context: str) -> str:
    """
    Takes strict solver facts and turns them into a human-readable explanation without hallucinating.
    """
    if "moved" in context:
        return f"I had to move {facts.get('item_name')} because of the {facts.get('reason')}."
    return "Based on your constraints, this is the optimal schedule."

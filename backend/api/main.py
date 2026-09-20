from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import json
import os

from solver.planner import solve_itinerary
from schema import Constraints

app = FastAPI(title="TravelPilot API", version="1.0")

# Load mock data
CITIES_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "cities")

def load_places(city: str) -> List[Dict[str, Any]]:
    path = os.path.join(CITIES_DIR, city, "places.json")
    if not os.path.exists(path):
        return []
    with open(path, "r") as f:
        return json.load(f)

@app.get("/health")
def health_check():
    return {"status": "ok"}

class PlanRequest(BaseModel):
    city: str
    constraints: dict

@app.post("/trips/plan")
def plan_trip(request: PlanRequest):
    places = load_places(request.city)
    if not places:
        raise HTTPException(status_code=404, detail="City data not found")
        
    result = solve_itinerary(places, request.constraints)
    return result

# Run with: uvicorn api.main:app --reload

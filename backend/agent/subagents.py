from typing import Dict, Any, List
import requests
import os

def check_hard_constraints(plan: List[Dict[str, Any]], constraints: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Conflict Detector Agent: Scans the final itinerary and validates it against hard constraints.
    Returns a list of conflict violations (empty if the plan is perfect).
    """
    conflicts = []
    total_cost = 0.0
    budget = constraints.get("budget_total", 1000)

    for i in range(len(plan)):
        item = plan[i]
        
        # 1. Check Cost
        total_cost += float(item.get("cost", 0.0))
        
        # 2. Check Overlaps
        if i > 0:
            prev_item = plan[i-1]
            if prev_item["end_time"] > item["start_time"]:
                conflicts.append({
                    "type": "time_overlap",
                    "severity": "high",
                    "items": [prev_item["place_id"], item["place_id"]],
                    "cause": f"{prev_item['name']} ends at {prev_item['end_time']}, overlapping {item['name']} at {item['start_time']}."
                })

    # 3. Check Budget Overrun
    if total_cost > budget:
        conflicts.append({
            "type": "budget_overrun",
            "severity": "medium",
            "cause": f"Total cost {total_cost} exceeds budget of {budget}.",
            "suggested_fixes": ["Swap luxury items for free attractions."]
        })
        
    return conflicts

def answer_trip_question(question: str, plan_state: List[Dict[str, Any]]) -> str:
    """
    Q&A Agent: Answers natural language questions by grounding them in the current solver state.
    """
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key or api_key == "mock_key":
        return f"Looking at your plan, you have {len(plan_state)} activities scheduled."
        
    prompt = f"""
    You are the Q&A Agent for TravelPilot. Answer the user's question using ONLY the provided Trip State facts.
    If the answer isn't in the state, say you don't have that information. Keep it concise.
    
    Trip State: {plan_state}
    Question: "{question}"
    """
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    payload = {"contents": [{"parts": [{"text": prompt}]}]}
    
    try:
        resp = requests.post(url, json=payload).json()
        return resp["candidates"][0]["content"]["parts"][0]["text"].strip()
    except Exception as e:
        return f"Based on the data, your first activity is {plan_state[0]['name']} at {plan_state[0]['start_time']}."

def get_alternatives(cancelled_place_id: str, all_places: List[Dict[str, Any]], current_plan: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Alternatives Agent: Suggests 2-3 replacements when an activity falls through.
    """
    # 1. Find the cancelled place details
    target = next((p for p in all_places if p["id"] == cancelled_place_id), None)
    if not target: return []
    
    in_plan_ids = {p["place_id"] for p in current_plan}
    
    # 2. Score remaining places on category overlap and budget
    candidates = []
    for place in all_places:
        if place["id"] == cancelled_place_id or place["id"] in in_plan_ids:
            continue
            
        score = 0
        if any(cat in place["category"] for cat in target["category"]):
            score += 5
        if place["cost_per_person"] <= target["cost_per_person"]:
            score += 3
        score += place["popularity_score"] * 2
        
        candidates.append({"place": place, "score": score})
        
    # 3. Sort and return top 3
    candidates.sort(key=lambda x: x["score"], reverse=True)
    return [c["place"] for c in candidates[:3]]

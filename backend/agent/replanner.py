from typing import List, Dict, Any
from solver.planner import solve_itinerary
import copy

def calculate_diff(old_plan: List[Dict[str, Any]], new_plan: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Computes added, removed, and moved items between two schedule versions.
    """
    old_ids = {item["place_id"]: item for item in old_plan}
    new_ids = {item["place_id"]: item for item in new_plan}
    
    added = [pid for pid in new_ids if pid not in old_ids]
    removed = [pid for pid in old_ids if pid not in new_ids]
    moved = []
    
    for pid in new_ids:
        if pid in old_ids:
            if old_ids[pid]["start_time"] != new_ids[pid]["start_time"]:
                moved.append({
                    "place_id": pid,
                    "name": new_ids[pid]["name"],
                    "old_time": old_ids[pid]["start_time"],
                    "new_time": new_ids[pid]["start_time"]
                })
                
    return {
        "added": added,
        "removed": removed,
        "moved": moved
    }

def handle_event_and_replan(current_plan: Dict[str, Any], places: List[Dict[str, Any]], event: Dict[str, Any]) -> Dict[str, Any]:
    """
    Simulates the tiered replanner.
    1. Deep copies the plan for a sandbox environment.
    2. Modifies constraints based on the event (e.g. venue closure removes it from `places`).
    3. Re-runs the solver with a stability penalty (mocked here).
    4. Calculates the diff.
    """
    sandbox_places = copy.deepcopy(places)
    constraints = {"budget_total": 1000} # Mock constraints
    
    # Apply Event
    if event.get("type") == "venue_closed":
        target = event.get("target_id")
        sandbox_places = [p for p in sandbox_places if p["id"] != target]
    elif event.get("type") == "budget_cut":
        constraints["budget_total"] -= event.get("amount", 200)
        
    # Re-Solve
    new_plan_result = solve_itinerary(sandbox_places, constraints)
    
    # Calculate Diff
    diff = calculate_diff(current_plan.get("items", []), new_plan_result.get("items", []))
    
    return {
        "status": "success",
        "new_plan": new_plan_result,
        "diff": diff,
        "explanation": f"Replanned due to {event.get('type')}. {len(diff['moved'])} items shifted."
    }

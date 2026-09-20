from ortools.sat.python import cp_model
from typing import List, Dict, Any
from datetime import datetime, timedelta

def solve_itinerary(places: List[Dict[str, Any]], constraints: Dict[str, Any]):
    """
    Core OR-Tools CP-SAT solver for the TravelPilot itinerary.
    Minimizes travel time while maximizing interest scores within budget & time windows.
    """
    model = cp_model.CpModel()
    
    # Extract constraints
    budget = constraints.get("budget_total", 1000)
    day_start_min = 9 * 60 # 09:00 in minutes
    day_end_min = 21 * 60 # 21:00 in minutes
    
    # Variables
    # x[i] = 1 if place i is visited
    x = {}
    # start[i] = start time of place i (in minutes from day start)
    start = {}
    
    for i, p in enumerate(places):
        x[i] = model.NewBoolVar(f"x_{i}")
        start[i] = model.NewIntVar(day_start_min, day_end_min, f"start_{i}")
        
        # Hard constraint: budget
        # We will enforce total budget constraint after creating all variables
    
    # Budget constraint
    model.Add(sum(x[i] * int(places[i].get("cost_per_person", 0)) for i in range(len(places))) <= budget)
    
    # Overlap constraints (simplified for single day right now)
    # If both x[i] and x[j] are true, they cannot overlap.
    # We use OptionalIntervalVars
    intervals = {}
    for i, p in enumerate(places):
        dur = p.get("avg_duration_min", 60)
        end = model.NewIntVar(day_start_min, day_end_min, f"end_{i}")
        model.Add(end == start[i] + dur)
        intervals[i] = model.NewOptionalIntervalVar(start[i], dur, end, x[i], f"interval_{i}")
        
    model.AddNoOverlap(intervals.values())
    
    # Objective: maximize popularity/interest
    # In a real scenario, this maximizes score minus travel time
    model.Maximize(sum(x[i] * int(places[i].get("popularity_score", 0.5) * 100) for i in range(len(places))))
    
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 5.0
    status = solver.Solve(model)
    
    result = []
    if status == cp_model.OPTIMAL or status == cp_model.FEASIBLE:
        for i, p in enumerate(places):
            if solver.BooleanValue(x[i]):
                start_time_min = solver.Value(start[i])
                hh = start_time_min // 60
                mm = start_time_min % 60
                end_time_min = start_time_min + p.get("avg_duration_min", 60)
                ehh = end_time_min // 60
                emm = end_time_min % 60
                
                result.append({
                    "place_id": p["id"],
                    "name": p["name"],
                    "start_time": f"{hh:02d}:{mm:02d}",
                    "end_time": f"{ehh:02d}:{emm:02d}",
                    "cost": p.get("cost_per_person", 0)
                })
                
        # Sort by start time
        result = sorted(result, key=lambda r: r["start_time"])
        
    return {
        "status": solver.StatusName(status),
        "objective_value": solver.ObjectiveValue() if status in [cp_model.OPTIMAL, cp_model.FEASIBLE] else 0,
        "items": result
    }

# TravelPilot

**Plan a trip once. Cancel anything. TravelPilot fixes the rest, and shows its work.**

TravelPilot is an AI travel planning and itinerary management agent that keeps a trip valid when reality changes. It was built for the Agentic AI Hackathon (Problem 1: Travel Planning & Itinerary Management).

Most travel tools handle single bookings well, but none of them keep reasoning about the whole itinerary once something changes. A cancelled flight, a closed museum, or a rain forecast forces the traveler to re-plan by hand. TravelPilot solves this by combining the natural language understanding of an LLM with the provable guarantees of an optimization solver.

## Features

- **Solver-Guaranteed Feasibility**: The LLM understands your goals, but a constraint solver builds the itinerary. Every schedule is provably free of conflicts (no double-bookings, no closed venues).
- **Automatic Minimal-Change Replanning**: When a booking or activity changes (e.g., a flight is delayed or a venue closes), TravelPilot repairs the plan with minimal disruption to the rest of your trip.
- **What-If Simulation**: Ask "What happens if this booking is cancelled?" and see the impact on cost, time, and activities before committing to the change.
- **Unified Trip Dashboard**: View your itinerary, transport, activities, and estimated cost all in one place.
- **Grounded Q&A**: Ask natural-language questions about your trip, and get answers based on real trip state, not LLM hallucinations.
- **Agent Trace**: See exactly how the agent is reasoning with a live, human-readable log of each step.

## How it Works

1. **Intake**: Provide your destination, dates, budget, interests, and preferences (via structured form or free-text).
2. **Planning**: TravelPilot generates a feasible, optimized, day-by-day itinerary, minimizing travel time and adhering to your budget.
3. **Adaptation**: If reality changes (cancellations, delays, closures), the agent detects conflicts, explains them, and suggests verified alternatives, rebuilding the itinerary automatically.

## Project Structure

- `frontend/`: The responsive web user interface and trip dashboard.
- `backend/`: The agent logic, constraint solver, and API endpoints.
- `TravelPilot_PRD.md`: The detailed Product Requirements Document.
- `TravelPilot_DRD.md`: The Design Requirements Document.
- `TravelPilot_DataRequirements.md`: Data schemas and requirements.

## License
MIT

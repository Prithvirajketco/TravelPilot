<div align="center">
  <h1>🌍 TravelPilot</h1>
  <p><b>Plan a trip once. Cancel anything. TravelPilot fixes the rest, and shows its work.</b></p>
  
  [![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://travelpilot-two.vercel.app/)
  
  <p><i>Built for the Agentic AI Hackathon (Problem 1: Travel Planning & Itinerary Management)</i></p>
</div>

---

## 🚀 The Problem
Most travel tools handle single bookings well, but **none of them keep reasoning about the whole itinerary once something changes**. A cancelled flight, a closed museum, or a rain forecast forces you to re-plan by hand. 

**TravelPilot** solves this by combining the natural language understanding of an LLM with the provable, mathematical guarantees of an optimization solver.

## ⚡ Key Features

- 🛡️ **Solver-Guaranteed Feasibility**: The LLM understands your goals, but a constraint solver builds the itinerary. Every schedule is provably free of conflicts (no double-bookings, no closed venues).
- 🔄 **Minimal-Change Replanning**: When disaster strikes (e.g., a delayed flight), TravelPilot repairs your plan automatically with *minimal disruption* to the rest of your trip.
- 🔮 **What-If Simulation**: Ask *"What happens if this booking is cancelled?"* and see the hidden impacts on your schedule and budget *before* you commit.
- 💬 **Grounded Q&A**: Ask natural-language questions about your trip and get mathematically accurate answers based on the live trip state—zero LLM hallucination.
- 📊 **Agent Trace**: Total transparency. See exactly how the agent is reasoning with a live, human-readable log of every decision.

## 🛠️ How it Works

1. 🗣️ **Intake**: Give the agent a messy request like *"5 days in Rome, tight budget, love history, hate crowds."*
2. 🗺️ **Planning**: The solver generates a feasible, optimized, day-by-day itinerary that minimizes your travel time and respects your budget constraints.
3. 🛠️ **Adaptation**: If reality changes, the agent detects conflicts, explains them, and surgically rebuilds the itinerary around the new constraints.

## 🔗 Try it out

**Check out the live demo here:** [https://travelpilot-two.vercel.app/](https://travelpilot-two.vercel.app/)

## 📁 Project Structure

- `frontend/`: The responsive web UI and trip dashboard.
- `backend/`: The agent logic, constraint solver, and API endpoints.
- `TravelPilot_PRD.md`: Detailed Product Requirements Document.
- `TravelPilot_DRD.md`: Design Requirements Document.
- `TravelPilot_DataRequirements.md`: Data schemas and requirements.

## 📜 License
MIT License

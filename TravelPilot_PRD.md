# TravelPilot — Product Requirements Document (PRD)

**Product:** TravelPilot, an AI travel planning and itinerary management agent that keeps a trip valid when reality changes
**Hackathon track:** Agentic AI, Problem 1 (Travel Planning & Itinerary Management)
**Version:** 1.0 | **Status:** Draft for team review

---

## 1. Executive Summary

Most travel tools handle single bookings well. None of them keep reasoning about the whole itinerary once something changes. A cancelled flight, a closed museum, or a rain forecast forces the traveler to re-plan by hand.

**TravelPilot is a planning agent, not a chatbot.** It converts a traveler's goals into formal constraints, builds an itinerary with a real optimization solver, monitors it, and when a booking or activity changes it repairs the plan with minimal disruption and explains exactly what changed and why.

**Core idea:** the LLM understands people; a solver guarantees the plan is feasible. Every schedule the user sees is provably free of conflicts, so the agent can never hand over an itinerary that visits a closed venue or double-books a slot.

### One-line pitch
> "Plan a trip once. Cancel anything. TravelPilot fixes the rest, and shows its work."

---

## 2. Problem Statement

| Pain point | Today | TravelPilot |
|---|---|---|
| Plans are static | Any change means manual re-planning | Automatic, minimal-change replanning |
| Info is scattered | Flights, hotel, and activities live in different apps | One trip workspace and dashboard |
| Feasibility is guesswork | Users misjudge opening hours and travel time | Solver-verified schedule with buffers |
| Changes have hidden costs | Users cannot see knock-on effects | What-if simulation before committing |
| LLM planners hallucinate | Chatbots invent times, prices, and places | LLM proposes, solver and data tools verify |

---

## 3. Goals, Non-Goals, and Success Metrics

### 3.1 Goals
1. Generate a feasible, optimized, day-by-day itinerary from destination, dates, budget, interests, and preferences.
2. Rebuild the itinerary automatically and minimally when a booking or activity changes.
3. Detect conflicts, explain them, and suggest verified alternatives.
4. Answer natural-language questions about the trip using real trip state, not guesses.
5. Show the whole trip in one dashboard: itinerary, transport, activities, estimated cost.
6. Make the agent's reasoning visible and measurable to judges.

### 3.2 Non-Goals (for the hackathon)
- Real payment processing or actual booking on third-party sites.
- Multi-traveler group negotiation.
- Global coverage. We ship one or two fully curated demo destinations plus a generic API-backed mode.
- Native mobile apps (responsive web only).

### 3.3 Success Metrics (what we will show judges)

| Metric | Target | How measured |
|---|---|---|
| Hard-constraint violations in generated plans | **0** | Automated validator across benchmark scenarios |
| Travel time vs. naive (interest-ordered) plan | **≥ 25% reduction** | Benchmark suite |
| Budget adherence | **100% within cap** (or an explicit, justified warning) | Validator |
| Replan latency (local repair) | **< 3 s** | Timed on benchmark events |
| Replan latency (full re-solve) | **< 10 s** | Timed |
| Plan stability after a change | **≥ 80% of unaffected items unchanged** | Diff analysis |
| NL answer grounding | **100% of numbers and times traceable to trip state** | Verifier pass rate |
| LLM-only baseline comparison | TravelPilot wins on violations, travel time, stability | Head-to-head on the same scenarios |

---

## 4. Personas

| Persona | Description | Key need |
|---|---|---|
| **Aarav, the budget-conscious planner** | Student or young professional, 4–6 day trip, tight budget | Stay under budget, see per-day cost |
| **Meera, the family organizer** | Balances kids, elders, and timing | Realistic pacing, no rushed transfers |
| **Rohan, the spontaneous traveler** | Changes his mind often | Instant re-plans and "can I fit this in?" answers |

---

## 5. Requirement Traceability (Problem Statement → Feature)

Every requirement in the official problem statement maps to at least one feature.

| # | Official requirement | Feature ID(s) |
|---|---|---|
| R1 | Users provide destination, dates, budget, interests, preferences | FR-1, FR-2 |
| R2 | Build day-by-day itinerary from constraints | FR-3 |
| R3 | Coordinate by location, opening hours, travel time, schedule | FR-3, FR-4 |
| R4 | Optimize to reduce unnecessary travel | FR-4 |
| R5 | Track transport, accommodation, activities in one place | FR-5 |
| R6 | Estimate daily and total budget | FR-6 |
| R7 | Modify constraints (budget, duration, interests) | FR-7 |
| R8 | Rebuild itinerary when a booking or activity changes | FR-8, FR-9 |
| R9 | Detect scheduling conflicts | FR-10 |
| R10 | Suggest alternatives when an activity becomes unavailable | FR-11 |
| R11 | Natural-language interface (4 sample questions) | FR-12 |
| R12 | Final trip dashboard (itinerary, transport, activities, costs) | FR-13 |

---

## 6. Functional Requirements

Priority: **P0** = must ship, **P1** = should ship, **P2** = stretch.

### 6.1 Trip Intake
- **FR-1 (P0) Structured intake.** Form for destination, start and end dates, total budget and currency, party size, interests (multi-select with weights), pace (relaxed / balanced / packed), hotel location, and dietary or mobility notes.
- **FR-2 (P0) Free-text intake.** The user can type "5 days in Kyoto, ₹80k, love temples and street food, hate crowds." The agent extracts constraints, shows them back for confirmation, and asks at most two clarifying questions.

### 6.2 Planning
- **FR-3 (P0) Day-by-day itinerary generation.** Each day includes start and end times, ordered activities with durations, meals, transit legs with mode and time, and buffers. Opening hours and travel time are hard constraints.
- **FR-4 (P0) Travel optimization.** The solver minimizes total transit time by clustering nearby activities per day and ordering them optimally. The UI shows "Travel time saved vs. naive plan."
- **FR-14 (P1) Pace and energy modeling.** No more than N hours of activity per day, plus rest windows. Outdoor activities avoid the hottest hours or rain forecasts.

### 6.3 Trip Workspace
- **FR-5 (P0) Unified tracker.** Transport (flights, trains, transfers), accommodation, and activities are stored as bookings with status (`planned`, `confirmed`, `cancelled`, `delayed`), time, cost, and a **fixed** flag. Confirmed bookings are immovable anchors for the planner.
- **FR-6 (P0) Budget engine.** Estimates per activity, meals, transport, and lodging. Shows daily and total spend against the cap, with a remaining-budget indicator and a per-category breakdown.
- **FR-7 (P0) Constraint editing.** The user can change budget, trip length, interests, or pace at any time. The agent re-plans and shows a diff of what changed.

### 6.4 Adaptation (the heart of the product)
- **FR-8 (P0) Event handling.** Supported events: booking cancelled, booking delayed, venue closed, new activity added, budget changed, weather alert. Events can be triggered from the UI or the simulator.
- **FR-9 (P0) Minimal-change replanning.** The agent first tries a local repair, then a day-level re-solve, then a full re-solve, and stops at the least disruptive level that works. Returns a version diff (added, removed, moved, retimed) with reasons.
- **FR-10 (P0) Conflict detection.** Detects time overlaps, insufficient transit time, closed venues, budget overrun, and unreachable connections. Each conflict lists cause, severity, and suggested resolutions.
- **FR-11 (P0) Verified alternatives.** When an activity becomes unavailable, the agent proposes 2–3 replacements ranked by interest match, proximity, price, and time fit. Every suggestion is solver-checked to fit before it is shown.
- **FR-15 (P1) What-if simulation.** "What happens if this booking is cancelled?" runs the change on a sandbox copy. It returns the impact on cost, time, and activities without modifying the real plan. The user can then apply or discard it.

### 6.5 Natural-Language Interface
- **FR-12 (P0) Grounded Q&A.** The chat interface answers by calling tools against live trip state. It must support at least:
  - "What should I do tomorrow morning?"
  - "Can I fit this activity into today's schedule?"
  - "Which activities are close to my hotel?"
  - "What happens to my itinerary if this booking is cancelled?"
  - Extras: "How much have I spent so far?", "Make Day 3 more relaxed", "Why did you move the museum?"
- **FR-16 (P1) Action-taking chat.** Commands such as "Swap Day 2 dinner for something vegetarian" execute through the same planning tools, with a confirmation step.

### 6.6 Dashboard and Transparency
- **FR-13 (P0) Trip dashboard** with four panels: daily itinerary (timeline), transportation, activities, and estimated costs, plus a route map.
- **FR-17 (P0) Agent trace panel.** A live, human-readable log of each step ("Parsed constraints → Generated 34 candidates → Solved in 1.8 s → 0 violations"). This makes the agentic behavior visible to judges.
- **FR-18 (P1) Version history.** Every plan is versioned, and users can compare or roll back to any version.
- **FR-19 (P2) Export.** PDF or ICS calendar export.

---

## 7. Differentiators

1. **Solver-guaranteed feasibility.** The LLM never sets a time or an order. The plan is the output of a constraint solver.
2. **Minimal-change repair.** A stability penalty keeps unaffected parts of the plan unchanged, like a human assistant would.
3. **Counterfactual what-if engine.** The user sees consequences before committing.
4. **Explanations from facts, not fluency.** Explanations are generated from solver facts and checked by a verifier that rejects any number not in the trip state.
5. **Benchmarked against an LLM-only baseline.** We show measured results, not just a demo.

---

## 8. Non-Functional Requirements

| Category | Requirement |
|---|---|
| Performance | Initial 5-day plan in < 10 s; local repair < 3 s |
| Reliability | Deterministic **demo mode** using cached data, so the demo works with no network or API failure |
| Correctness | A validator runs after every solve and blocks any plan with hard-constraint violations |
| Explainability | Every plan change carries a machine-generated reason |
| Usability | First plan in under 60 seconds of user effort; the dashboard is legible on a projector |
| Security | API keys server-side only; no PII stored beyond the session for the demo |
| Observability | Structured logs for every agent step and tool call |

---

## 9. Key User Flows

**Flow A: Create a trip.** Intake (form or text) → confirm parsed constraints → agent plans → dashboard opens with the trace panel showing the steps.

**Flow B: Booking cancelled.** User marks a flight as cancelled or clicks "Simulate event" → impact analysis highlights affected days → agent repairs → diff view (what moved, what was dropped, cost delta) → user accepts or rejects.

**Flow C: "Can I fit this in?"** User asks in chat → agent tries insertion into the current day → answers "Yes, at 3:40 pm, if you shorten lunch by 20 minutes" or "No, because…" and offers the next-best slot.

**Flow D: Constraint change.** User lowers the budget by 20% → agent re-plans and shows which activities were swapped for cheaper equivalents, plus the total savings.

---

## 10. Demo Scenarios for the Judges (3–4 minutes)

1. **Generate (30 s).** Type a messy request. The plan appears with the map, budget bar, and trace. Call out "0 violations, 31% less travel than naive."
2. **Break it (60 s).** Simulate "Day 2 museum closed" and "outbound flight delayed 3 h." Show the diff, with the rest of the trip untouched.
3. **Ask it (45 s).** Ask the four official questions in the chat, then "Why did you move the temple to Day 3?"
4. **What-if (30 s).** "What if I cancel the hotel?" shows the cost and time impact on a sandbox copy, then discard.
5. **Proof (45 s).** Show the benchmark chart: TravelPilot vs. an LLM-only baseline on violations, travel time, and stability.

---

## 11. Evaluation Plan

- **Benchmark suite:** 20 scenarios (varying destinations, budgets, durations, and paces) plus 30 change events (cancellations, delays, closures).
- **Baseline:** one strong LLM prompted to produce the itinerary and re-plan, with no solver.
- **Metrics:** hard-constraint violations, total transit minutes, budget overrun, interest-match score, replan latency, plan stability, and grounding-verifier pass rate.
- **Output:** a results table and one or two charts included in the slides and shown in the app's "Benchmarks" tab.

---

## 12. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Live API failure during demo | High | Cached dataset and deterministic demo mode |
| Solver too slow on large candidate sets | Medium | Candidate pruning, time-limited solves, greedy fallback |
| LLM misparses constraints | Medium | Confirmation step, schema-validated structured output |
| Scope creep | High | Strict P0/P1/P2 list; freeze features before the final polish phase |
| Data quality (opening hours, prices) | Medium | Curated, hand-verified data for demo cities |
| Demo looks like "just another chatbot" | High | Lead with the break-and-repair moment and the benchmark |

---

## 13. Delivery Plan

The hackathon length and team size are unknown, so this plan is expressed as phases of the total time.

| Phase | Share of time | Deliverable |
|---|---|---|
| 1. Foundations | 15% | Data model, curated demo dataset, travel-time matrix, project skeleton |
| 2. Core solver | 25% | Feasible, optimized single-day and multi-day planner plus validator |
| 3. Agent layer | 20% | Constraint parser, event handling, replanner, conflict detector, alternatives |
| 4. Chat and what-if | 10% | Tool-calling Q&A, sandbox simulation |
| 5. Dashboard | 15% | Timeline, map, budget, diff view, trace panel |
| 6. Benchmark and polish | 10% | Baseline comparison, charts, demo rehearsal |
| 7. Buffer | 5% | Bug fixes, recorded backup demo video |

**Suggested roles (adjust to team size):** Solver and backend lead · Agent and LLM lead · Frontend and visualization lead · Data, evaluation, and demo lead.

---

## 14. Alignment with Likely Judging Criteria

| Criterion | How TravelPilot scores |
|---|---|
| Technical depth | Hybrid LLM plus constraint optimization, minimal-change repair, what-if engine |
| Creativity | Counterfactual simulation, stability-aware replanning, trace transparency |
| Agentic behavior | Perceives events, plans, acts through tools, verifies, and re-plans |
| Completeness | All 12 official requirements are traceably covered |
| Demo impact | Live break-and-repair moment plus benchmark proof |
| Reliability | Validator, deterministic demo mode, and a backup video |

---

## 15. Open Questions

1. Which destination(s) will be fully curated for the demo?
2. Which real APIs (maps, places, weather) are we allowed and able to use?
3. What is the exact hackathon duration and team size?
4. Are judges scoring on a rubric we can see?

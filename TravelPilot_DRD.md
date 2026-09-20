# TravelPilot — Design Requirements Document (DRD)

**Companion to:** TravelPilot PRD v1.0
**Scope:** System architecture, agent design, algorithms, data model, APIs, UX design, and evaluation design
**Version:** 1.0 | **Status:** Draft for team review

---

## 1. Design Principles

1. **Separation of judgment and guarantees.** The LLM interprets intent, ranks preferences, and narrates. The solver decides times and order. The validator has the final say.
2. **Facts first, prose last.** Every explanation is generated from structured facts and checked against them.
3. **Minimal disruption.** A repaired plan should look like what a careful human assistant would do: change as little as possible.
4. **Always demoable.** Every external dependency has a cached or deterministic fallback.
5. **Show the work.** All agent steps are visible in a trace.

---

## 2. System Architecture

```
┌──────────────────────────── Frontend (React/Next.js) ────────────────────────────┐
│  Intake · Timeline · Map · Budget · Bookings · Diff View · Chat · Trace Panel   │
└───────────────▲──────────────────────────────────────────────┬───────────────────┘
                │ REST + WebSocket (plan streaming, trace)      │
┌───────────────┴───────────────────────────────────────────────▼───────────────────┐
│                          API Layer (FastAPI, Pydantic)                            │
└───────┬───────────────────────────────────────────────────────────────────────────┘
        │
┌───────▼──────────────────── Agent Orchestrator ───────────────────────────────────┐
│  Intent Router → [Constraint Parser] [Planner] [Replanner] [Conflict Detector]    │
│                  [Alternatives Agent] [What-If Agent] [Q&A Agent] [Explainer]      │
│                                        │                                           │
│                     Tool Layer (deterministic, typed)                              │
│  get_schedule · try_insert · nearby · travel_time · budget_status · simulate_event │
│  solve_plan · repair_plan · validate_plan · diff_versions · search_alternatives    │
└───────┬───────────────────────────┬───────────────────────────┬───────────────────┘
        │                           │                           │
┌───────▼────────┐        ┌─────────▼──────────┐       ┌────────▼─────────┐
│ Solver Core    │        │ Data Services      │       │ State Store      │
│ OR-Tools CP-SAT│        │ Places · Routing · │       │ SQLite/Postgres  │
│ + heuristics   │        │ Weather · Cache    │       │ versioned plans  │
└────────────────┘        └────────────────────┘       └──────────────────┘
```

**Key architectural decision:** agents never mutate the plan directly. They call typed tools, and only `solve_plan` and `repair_plan` can produce a new plan version. Each result passes through `validate_plan` before it is stored.

---

## 3. Recommended Technology Stack

| Layer | Choice | Rationale |
|---|---|---|
| Backend | Python 3.11, FastAPI, Pydantic v2 | Fast to build, strong schema validation |
| Solver | Google OR-Tools (CP-SAT) | Handles time windows, optional nodes, and circuit constraints |
| LLM | Any strong tool-calling model (for example a Claude model via API) with JSON-schema outputs | Structured extraction and tool use |
| Routing and distance | OSRM or Google Distance Matrix, with a precomputed matrix cache | Realistic travel times |
| Places data | Google Places or OpenStreetMap plus a hand-curated JSON for demo cities | Reliable hours and prices for the demo |
| Weather | Open-Meteo (free, no key) | Weather-triggered events |
| State | SQLite (Postgres if deployed) | Versioned plans and event log |
| Frontend | React or Next.js, Tailwind, Leaflet or MapLibre, Recharts | Fast, polished dashboard and map |
| Realtime | WebSocket | Stream the trace and plan updates |
| Testing | pytest, Hypothesis (property tests for the validator) | Confidence in feasibility guarantees |

---

## 4. Agent Design

### 4.1 Agent Roles

| Agent | Responsibility | Input → Output | Uses LLM? |
|---|---|---|---|
| **Intent Router** | Classifies a message or event | text/event → intent + args | Yes |
| **Constraint Parser** | Free text → structured constraints | text → `Constraints` JSON | Yes (schema-constrained) |
| **Candidate Generator** | Selects and scores possible activities | constraints → ranked candidates | Hybrid (LLM scoring, rule filters) |
| **Planner** | Builds the itinerary | constraints + candidates → `Itinerary` | No (solver) |
| **Replanner** | Repairs the plan after an event | itinerary + event → new itinerary + diff | No (solver) |
| **Conflict Detector** | Finds violations | itinerary → `Conflict[]` | No (rules) |
| **Alternatives Agent** | Replacement options | removed activity → verified candidates | Hybrid |
| **What-If Agent** | Runs sandboxed counterfactuals | hypothetical event → impact report | No |
| **Q&A Agent** | Answers questions with tools | question → grounded answer | Yes (tool-calling) |
| **Explainer** | Human-readable reasons | facts → text | Yes, then verified |

### 4.2 Orchestration Loop (Plan–Act–Verify)

```
1. PERCEIVE   receive user input or event
2. ROUTE      classify intent, select tools
3. PLAN       decide the tool sequence (LLM only picks tools; it does not choose times)
4. ACT        call solver or data tools
5. VERIFY     validate_plan; reject and retry with relaxed soft constraints if invalid
6. EXPLAIN    generate reasons from structured facts; verifier checks every number
7. COMMIT     store a new version + event log + trace
```

### 4.3 Grounding and Anti-Hallucination Rules
- The LLM receives trip state only through tool outputs, never from memory.
- Structured outputs are validated against Pydantic schemas. Invalid outputs are retried once and then fail safely.
- **Explanation verifier:** extracts every time, price, duration, and place name from generated text and confirms it exists in the facts payload. On mismatch, the text is regenerated or replaced with a template.
- Any question the tools cannot answer returns "I don't have that information" plus what it would need.

---

## 5. Core Algorithms

### 5.1 Planning Model (CP-SAT)

**Problem class:** a multi-day orienteering problem with time windows and budget, also called a prize-collecting vehicle routing problem.

**Decision variables**
- `x[a]` ∈ {0,1}: activity `a` is included
- `day[a]`: day assigned
- `start[a]`: start time (in minutes)
- Arc variables `y[a,b,d]`: `b` immediately follows `a` on day `d`; self-loops mean the activity is skipped (`AddCircuit` with optional nodes)

**Hard constraints**
1. Opening hours: `open[a] ≤ start[a]` and `start[a] + dur[a] ≤ close[a]`
2. Transit feasibility: `start[b] ≥ start[a] + dur[a] + travel(a,b) + buffer`
3. Daily window: activities fit in `[dayStart, dayEnd]`, with lunch and dinner windows reserved
4. Fixed bookings: confirmed bookings have fixed day and time and are always included
5. Budget: `Σ cost[a]·x[a] + transport + lodging + meals ≤ budget`
6. Pace cap: activity minutes per day ≤ pace limit
7. Accessibility and dietary filters applied at candidate generation

**Objective (maximize)**
```
Σ interest_score[a]·x[a]
 − λ_travel · total_transit_minutes
 − λ_cost   · soft_budget_pressure
 − λ_stab   · (# items moved or removed vs. previous version)   ← replanning only
 + λ_var    · category_diversity_bonus
```

`λ_stab` is the stability penalty that gives minimal-change repair. It is 0 for the first plan and large for repairs.

**Performance strategy**
- Prune candidates to about 30–50 per trip using score and proximity filters.
- Pre-cluster by geography to seed day assignment (k-means on coordinates).
- Time limit of 5–8 s with a warm start from the previous plan. If the solver times out, use the best feasible solution, or greedy insertion as a last fallback.

### 5.2 Tiered Replanning

```
Event arrives
   │
   ├─► Impact Analysis: dependency graph finds every affected item
   │        (e.g., a delayed flight affects the transfer, check-in, and Day 1 activities)
   │
   ├─► Tier 1: LOCAL REPAIR    shift or shorten items within the same day
   ├─► Tier 2: DAY RE-SOLVE    re-solve affected days only; other days frozen
   └─► Tier 3: TRIP RE-SOLVE   full solve with stability penalty
   
Stop at the first tier that yields a valid plan.  Emit: new version + diff + reasons.
```

The **impact analysis** step is what makes replanning fast and explainable. Only the affected subgraph is touched unless escalation is required.

### 5.3 Conflict Detection Rules

| Type | Check |
|---|---|
| Time overlap | `start[b] < end[a]` on the same day |
| Insufficient transit | gap < `travel(a,b) + buffer` |
| Venue closed | outside the opening window or on a closure date |
| Budget overrun | cumulative cost > cap |
| Connection risk | layover shorter than the minimum |
| Weather exposure | outdoor activity during a severe-weather forecast |

Each conflict carries `severity`, `cause`, and `suggested_fixes[]` (each pre-checked by the solver).

### 5.4 Alternatives Ranking

```
score(c) = w1·category_similarity(c, removed)
         + w2·interest_match(c)
         + w3·proximity_to_neighbors(c)
         + w4·price_fit(c)
         + w5·time_fit(c)
```
Top candidates are test-inserted with `try_insert`. Only insertions that pass validation are shown.

### 5.5 What-If Simulation
1. Deep-copy the current plan into a **sandbox version** (`is_sandbox = true`).
2. Apply the hypothetical event.
3. Run tiered replanning.
4. Return an `ImpactReport`: cost delta, transit delta, items lost, items added, and conflicts.
5. The user can `apply` (promote to the real version) or `discard`.

---

## 6. Data Model

```
Trip           { id, destination, start_date, end_date, currency, party_size, created_at }
Constraints    { trip_id, budget_total, pace, interests[{tag, weight}], hotel_location,
                 dietary[], mobility, day_start, day_end, avoid[], must_include[] }
Place          { id, name, lat, lon, category[], open_hours[{dow, open, close}],
                 closure_dates[], avg_duration_min, cost, rating, tags[], indoor }
Booking        { id, trip_id, type: transport|stay|activity, place_id?, start_dt, end_dt,
                 cost, status: planned|confirmed|cancelled|delayed, fixed: bool, details }
ItineraryVer   { id, trip_id, version, parent_version, is_sandbox, created_by_event?,
                 objective_value, violations: 0, created_at }
ItineraryItem  { version_id, day, order, place_id | booking_id, start, end,
                 transit_from_prev{mode, minutes, cost}, reason }
Event          { id, trip_id, type, target_id, payload, occurred_at, resolved_version? }
Conflict       { id, version_id, type, severity, items[], cause, suggested_fixes[] }
Diff           { from_version, to_version, added[], removed[], moved[], retimed[],
                 cost_delta, transit_delta, reasons[] }
TraceStep      { id, trip_id, ts, agent, action, inputs, outputs, duration_ms }
```

Design notes:
- Plans are **immutable versions**, never edited in place. This gives rollback, diffs, and sandboxing for free.
- `fixed = true` bookings are treated by the solver as constants.
- Every item stores a machine-readable `reason` (for example `"moved: museum closed on Tue"`).

---

## 7. API Design

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/trips` | Create a trip (form or free text) |
| PATCH | `/trips/{id}/constraints` | Modify constraints and trigger a re-plan |
| POST | `/trips/{id}/plan` | Generate the initial plan |
| GET | `/trips/{id}/dashboard` | Aggregated view: itinerary, transport, activities, costs |
| POST | `/trips/{id}/bookings` | Add or update a booking |
| POST | `/trips/{id}/events` | Submit or simulate an event, triggers replanning |
| POST | `/trips/{id}/whatif` | Sandbox simulation returning an `ImpactReport` |
| POST | `/trips/{id}/whatif/{sid}/apply` | Promote a sandbox to the real plan |
| POST | `/trips/{id}/chat` | Natural-language Q&A and commands |
| GET | `/trips/{id}/versions/{a}/diff/{b}` | Compare two versions |
| GET | `/trips/{id}/conflicts` | Current conflicts and fixes |
| WS | `/trips/{id}/stream` | Live trace and plan updates |
| GET | `/benchmarks` | Cached benchmark results for the demo tab |

---

## 8. Natural-Language Interface Design

The Q&A agent uses tool-calling. It does not answer from memory.

| User question | Tools invoked | Answer shape |
|---|---|---|
| "What should I do tomorrow morning?" | `get_schedule(day, window)` | Time-ordered list with transit and cost |
| "Can I fit this activity into today's schedule?" | `try_insert(place, day)` | Yes or no, best slot, what shifts, and the cost |
| "Which activities are close to my hotel?" | `nearby(hotel, radius, filter)` | Ranked list with walking or transit minutes |
| "What happens if this booking is cancelled?" | `simulate_event` → `diff_versions` | Impact report with an Apply / Discard action |
| "How much have I spent?" | `budget_status()` | Category breakdown and remaining budget |
| "Why did you move X?" | `get_item_reason(item)` | The stored reason, in plain language |

**Response contract:** each answer includes (1) the direct answer, (2) supporting facts, and (3) optional next actions. Write actions always require confirmation.

---

## 9. Data Sources and Fallback Strategy

| Data | Primary | Fallback |
|---|---|---|
| Places, hours, prices | Places API or OSM | Hand-curated JSON for 1–2 demo cities (about 60 places each) |
| Travel time | Routing API | Precomputed distance matrix (cached) |
| Weather | Open-Meteo | Recorded forecast fixtures |
| Flights and trains | Mock provider with realistic schedules | Static JSON |

**Demo mode flag** forces all data services to use fixtures so the demo is repeatable.

---

## 10. UX and Interface Design Requirements

### 10.1 Visual Principles
- Clean, high-contrast, readable on a projector. Minimum body text 16 px.
- One accent color for "changed" items so diffs stand out. Neutral colors elsewhere.
- Semantic colors: green (valid), amber (warning), red (conflict), blue (changed).
- Motion is used only to explain change, such as an item sliding to its new slot.

### 10.2 Screen Inventory

| Screen | Contents |
|---|---|
| **Intake** | Structured form with a free-text box, parsed-constraints confirmation chips |
| **Dashboard** (main) | Left: day tabs and timeline. Center: route map. Right: budget and bookings. Bottom or side: chat and trace |
| **Timeline** | Draggable cards, transit legs between them, closing-time markers, buffer indicators |
| **Diff View** | Before and after columns with added (green), removed (red), and moved (blue) markers, plus cost and transit deltas |
| **What-If Sandbox** | Banner "Sandbox: not applied," impact summary, Apply and Discard buttons |
| **Conflicts Drawer** | Severity-sorted list with one-click fixes |
| **Trace Panel** | Streaming step log with per-step timings, collapsible detail |
| **Benchmarks Tab** | Charts comparing TravelPilot with the LLM-only baseline |

### 10.3 Interaction Requirements
- Every solver-driven change shows a loading state with a live trace, never a frozen screen.
- Any change to the plan is shown as a diff before it is committed, unless the user turns on auto-apply.
- Drag-and-drop edits are validated instantly, and violations show inline with the reason.
- The map highlights the selected day's route and animates when the route changes.
- Chat is persistent and context-aware. Selecting an item and asking "why here?" works.

### 10.4 Accessibility
Keyboard navigable, sufficient contrast, and status never conveyed by color alone (icons and labels too).

---

## 11. Event Simulator (Demo Control Panel)

A hidden or toggled panel that lets the presenter fire realistic events instantly:

- Cancel a flight or hotel
- Delay a train by X minutes
- Close a venue for the day
- Trigger a rain alert for Day N
- Cut the budget by X%
- Add a must-see activity

Each button sends a normal `/events` call, so the demo exercises the real replanning pipeline.

---

## 12. Validation, Testing, and Evaluation Design

### 12.1 Plan Validator
An independent module (separate from the solver code) re-checks every hard constraint on a finished plan: opening hours, transit gaps, overlaps, budget, and fixed bookings. Property-based tests generate random plans and assert that the validator and solver agree.

### 12.2 Test Layers
| Layer | Tests |
|---|---|
| Unit | Distance matrix lookup, cost math, diff computation |
| Solver | Known small instances with expected optimal answers |
| Property | Random trips: solver output must always validate |
| Agent | Parser accuracy on 50 labeled free-text requests; router accuracy |
| Grounding | Explainer verifier catches injected wrong numbers |
| End to end | Scripted demo run must produce the same result twice |

### 12.3 Benchmark Harness
- **Scenarios:** 20 trips × 30 events, seeded and reproducible.
- **Systems compared:** TravelPilot vs. an LLM-only baseline (same model, plain prompt).
- **Metrics:** hard violations, transit minutes, budget adherence, interest match, replan latency, plan stability, explanation grounding rate.
- **Output:** JSON results plus charts for the slides and the Benchmarks tab.

---

## 13. Non-Functional Design

| Area | Design |
|---|---|
| Latency | Streamed results, warm-started solves, cached distance matrix |
| Reliability | Demo mode, solver timeouts with greedy fallback, retry with backoff on LLM calls |
| Security | Keys in environment variables, CORS restricted, input validation via Pydantic |
| Observability | Structured JSON logs and trace records for every tool call |
| Reproducibility | Fixed random seeds, pinned dependencies, seeded fixtures |
| Deployment | Docker Compose (API + frontend), or a single-host deploy, plus a recorded backup demo video |

---

## 14. Build Order (Dependency-Driven)

1. Data model and demo dataset (places, hours, cost)
2. Travel-time matrix and cache
3. CP-SAT single-day planner, then multi-day
4. Validator and property tests
5. Budget engine and conflict detector
6. Constraint parser (LLM, structured output)
7. Event model, impact analysis, and tiered replanner
8. Diff engine and versioned storage
9. Alternatives agent and what-if sandbox
10. Q&A agent with tools, then the explanation verifier
11. Dashboard, map, diff view, and trace panel
12. Event simulator, benchmark harness, and charts
13. Demo rehearsal, backup video, and slide deck

---

## 15. Design Risks and Decisions Log

| Decision | Choice | Alternative rejected | Reason |
|---|---|---|---|
| Who sets times? | Solver | LLM | Guarantees feasibility |
| Repair strategy | Tiered with stability penalty | Always re-plan from scratch | Faster and less disruptive |
| Data for demo | Curated fixtures plus optional live APIs | Live APIs only | Demo reliability |
| Plan storage | Immutable versions | In-place edits | Diffs, rollback, sandboxing |
| Explanations | Fact-grounded and verified | Free generation | Prevents hallucination |

---

## 16. Definition of Done

- All 12 official requirements are demonstrable in the UI.
- Zero hard-constraint violations across the full benchmark.
- The break-and-repair demo works twice in a row in demo mode.
- The benchmark comparison and charts are ready for the slides.
- A backup demo video is recorded.

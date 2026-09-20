# TravelPilot — Data Requirements Document (DaRD)

**Companion to:** TravelPilot PRD v1.0 and DRD v1.0
**Purpose:** Define every dataset TravelPilot needs, its schema, source, quality rules, and acceptance criteria, so the solver's guarantees rest on trustworthy data.
**Version:** 1.0 | **Status:** Draft for team review

---

## 1. Why Data Is a First-Class Concern

TravelPilot's headline claim is "zero constraint violations." That claim is only true relative to the data the solver sees. If a museum's closing time in our dataset is wrong, the plan is "valid" but wrong. Therefore:

1. Demo-critical data is **hand-verified**, not scraped and trusted.
2. Every record carries **provenance** (where it came from and when it was checked).
3. All external dependencies have **fixtures** so the demo is deterministic.
4. Data is **validated automatically** before the solver ever sees it.

---

## 2. Data Inventory

| ID | Dataset | Used by | Priority | Source strategy |
|---|---|---|---|---|
| D1 | Places / activities | Candidate generator, solver | P0 | Curated JSON (demo cities) + optional API |
| D2 | Opening hours and closure dates | Solver (hard constraints), conflict detector | P0 | Hand-verified |
| D3 | Travel-time matrix (place × place × mode) | Solver, nearby search | P0 | Routing engine, precomputed and cached |
| D4 | Accommodation | Anchor point, nearby search, budget | P0 | Curated (5–8 hotels per city) |
| D5 | Transport options (flights, trains, transfers) | Bookings, replanning | P0 | Mock provider with realistic schedules |
| D6 | Cost and price model | Budget engine | P0 | Curated estimates by category |
| D7 | Weather forecast and climate | Weather events, outdoor scoring | P1 | Open-Meteo plus recorded fixtures |
| D8 | Interest taxonomy | Constraint parser, scoring | P0 | Defined in-house |
| D9 | Demo trips, bookings, and events | Demo, simulator | P0 | Authored fixtures |
| D10 | Benchmark scenarios and events | Evaluation harness | P0 | Generated with fixed seed |
| D11 | Trace, event log, plan versions | Transparency, diffs, rollback | P0 | Produced at runtime |
| D12 | User and session data | Trip state | P0 | Runtime (minimal) |

---

## 3. Detailed Dataset Specifications

### D1. Places and Activities

**Volume target (per demo city):** 60–80 places, split roughly into 20 attractions, 10 outdoor or nature, 10 cultural or museums, 15 food venues, 5 shopping or markets, and 10 other (nightlife, wellness, experiences).

**Schema**

| Field | Type | Required | Notes |
|---|---|---|---|
| `id` | string | yes | Stable slug, e.g. `kyoto_fushimi_inari` |
| `name` | string | yes | Display name |
| `lat`, `lon` | float | yes | Verified coordinates |
| `category` | string[] | yes | From the interest taxonomy (D8) |
| `tags` | string[] | no | e.g. `crowded`, `photogenic`, `kid_friendly` |
| `avg_duration_min` | int | yes | Typical visit length; also `min_duration` / `max_duration` |
| `cost_per_person` | number | yes | Local currency; 0 if free |
| `indoor` | bool | yes | Used for weather logic |
| `open_hours` | object[] | yes | See D2 |
| `closure_dates` | date[] | no | Holidays, maintenance |
| `best_time_of_day` | enum | no | `morning` / `afternoon` / `evening` / `any` |
| `booking_required` | bool | no | Whether advance booking is needed |
| `accessibility` | object | no | Step-free, wheelchair notes |
| `dietary` | string[] | food only | `vegetarian`, `vegan`, `halal`, etc. |
| `popularity_score` | float 0–1 | yes | Used in interest scoring |
| `source` | object | yes | `{origin, url, verified_by, verified_on}` |

**Example record**
```json
{
  "id": "demo_city_old_fort",
  "name": "Old Fort",
  "lat": 0.0000, "lon": 0.0000,
  "category": ["history", "architecture"],
  "tags": ["photogenic"],
  "avg_duration_min": 90,
  "cost_per_person": 300,
  "indoor": false,
  "open_hours": [{"dow": [1,2,3,4,5,6,7], "open": "09:00", "close": "17:30"}],
  "closure_dates": ["2026-12-25"],
  "best_time_of_day": "morning",
  "popularity_score": 0.82,
  "source": {"origin": "official_site", "url": "…", "verified_by": "teammate_a", "verified_on": "2026-09-20"}
}
```

### D2. Opening Hours and Closures

- Stored as per-day-of-week windows, allowing **multiple windows per day** (e.g., 09:00–13:00 and 15:00–19:00).
- Support **last-entry time** separately from closing time (`last_entry`).
- Support **weekly closed days** and **date-specific closures**.
- All times are in the destination's local time zone, and the time zone is stored per city.
- Places with unknown hours are **excluded from the solver's candidate pool** rather than guessed.

### D3. Travel-Time Matrix

**Structure:** `travel[a][b][mode] → {minutes, distance_km, cost}` for modes `walk`, `transit`, `taxi/drive` (as applicable).

**Requirements**
- Precomputed for all places in each demo city, including hotels and transport hubs.
- Size check: 80 places × 80 places × 3 modes ≈ 19,200 entries per city, small enough to hold in memory.
- Asymmetry allowed (A→B need not equal B→A).
- Time-of-day multiplier table for peak traffic (e.g., ×1.3 during 08:00–10:00 and 17:00–19:00), applied by the solver.
- Cached in a file (`travel_matrix_<city>.json` or SQLite) with the routing engine, version, and timestamp recorded.
- **Fallback:** if a pair is missing, use haversine distance × a mode speed factor, and flag the estimate as approximate.

### D4. Accommodation

| Field | Notes |
|---|---|
| `id`, `name`, `lat`, `lon` | Also linked into the travel matrix |
| `price_per_night` | Per room, local currency |
| `tier` | `budget` / `mid` / `premium` |
| `check_in`, `check_out` | Times |
| `area` | Neighborhood label |

Volume: 5–8 hotels per city across price tiers. Hotels are the anchor for "close to my hotel" queries and for daily start and end points.

### D5. Transport Options (Mock Provider)

The mock provider must **behave like a real one**, because event handling depends on it.

| Entity | Fields |
|---|---|
| Flight or train | `id`, `origin`, `destination`, `depart_dt`, `arrive_dt`, `price`, `status`, `carrier`, `min_connection_min` |
| Local transfer | `from`, `to`, `mode`, `duration`, `cost` |
| Status values | `scheduled`, `delayed(minutes)`, `cancelled` |

Requirements: at least 3 outbound and 3 return options per demo trip, including one **tight connection** (to exercise conflict detection) and one **red-eye** option.

### D6. Cost and Price Model

- **Per-activity cost:** from D1.
- **Meal estimates:** by meal type and tier, e.g. `breakfast: {budget, mid, premium}`, `lunch`, `dinner`.
- **Local transit costs:** per mode and per km or per ride.
- **Contingency buffer:** default 8–10% of the total, configurable.
- All prices in one base currency per trip, with an optional exchange-rate table (static for the demo).
- Each price is labelled `estimate` or `verified`.

### D7. Weather

- **Live:** Open-Meteo forecast (temperature, precipitation probability, wind) per day.
- **Fixture:** recorded forecasts including at least one **rain-heavy day** to trigger the weather-alert event reproducibly.
- Derived fields: `outdoor_suitability` score per day and time block.

### D8. Interest Taxonomy

A controlled vocabulary shared by the parser, the places dataset, and the scorer. It must be defined before curation so tags are consistent.

```
culture: history, museums, temples, architecture, art
nature: parks, hiking, beaches, wildlife
food: street_food, fine_dining, cafes, local_cuisine
activity: adventure, sports, wellness, nightlife
lifestyle: shopping, markets, photography
```
Each interest has synonyms (for example "temples" ↔ "shrines" ↔ "places of worship") so the parser can map free text onto tags.

### D9. Demo Trips, Bookings, and Events

**Authored fixtures**
- 2–3 demo trips with different personas and budgets, including pre-confirmed bookings (flight, hotel, one timed-entry activity).
- A scripted **event library** used by the simulator:
  - `flight_delayed_3h`
  - `flight_cancelled`
  - `venue_closed_day2`
  - `rain_alert_day3`
  - `budget_cut_20pct`
  - `add_must_see`
- Expected outcomes are recorded for regression tests.

### D10. Benchmark Data

- 20 trip scenarios varying destination, duration (3–7 days), budget (tight to generous), pace, and interests.
- 30 change events sampled from the event library and applied at random points.
- Generated with a **fixed random seed** and stored in the repo so results are reproducible.
- Includes the **LLM-only baseline's outputs** for comparison and the automatic validator's scores for both systems.

### D11. Runtime Records

| Record | Retention | Purpose |
|---|---|---|
| Plan versions (immutable) | Session or demo lifetime | Diffs, rollback, sandbox |
| Event log | Same | Audit and replay |
| Trace steps | Same | Transparency panel |
| Conflicts | Per version | Conflict drawer |

### D12. User and Session Data

- Minimum data only: trip preferences and constraints. No accounts, payment data, or personal identifiers are required for the demo.
- Any free-text input is stored only for the session.

---

## 4. Data Sourcing Strategy

| Source | Use | Notes |
|---|---|---|
| Official venue websites | Opening hours, prices | Best accuracy; record the URL and date |
| OpenStreetMap / Wikidata | Coordinates, categories, base facts | Check the license and give attribution |
| Routing engine (e.g., OSRM) | Travel-time matrix | Run once, cache results |
| Open-Meteo | Weather | Free; store recorded fixtures for the demo |
| Commercial place APIs | Optional enrichment | **Check the provider's terms before caching or storing results;** many restrict this |
| Team knowledge | Sanity checks, local insight | Log as `verified_by` |

**Rule:** anything the demo depends on is verified by a person and dated. Live API data is a bonus layer and never a dependency.

---

## 5. Data Quality Requirements

### 5.1 Automated Validation (run on every dataset load)

| Check | Rule |
|---|---|
| Schema | All required fields present with the right types (Pydantic) |
| Coordinates | Inside the city's bounding box |
| Hours | `open < close`; no overlapping windows; time-zone set |
| Duration | 15 ≤ `avg_duration_min` ≤ 480 |
| Cost | ≥ 0; outliers flagged for review |
| Taxonomy | Every tag exists in D8 |
| Matrix | Complete for all place pairs; no zero-minute non-identical pairs; triangle-inequality spot checks |
| Uniqueness | No duplicate IDs or near-duplicate names within 50 m |
| Provenance | `source.verified_on` present and no older than 90 days |

### 5.2 Manual Verification
- Every P0 place gets a **two-person check** of hours and price against an official source.
- Spot-check 10% of the travel matrix against a map service.
- Walk through each demo scenario by hand once to confirm the plan looks sensible.

### 5.3 Freshness
- Each record has `verified_on`. A CI check warns on records older than 90 days.
- The demo dataset is **frozen** 24 hours before the presentation. After the freeze, no data edits are allowed without re-running the full test suite.

---

## 6. Data Storage and Formats

| Data | Format | Location |
|---|---|---|
| Curated places, hotels, transport, events | JSON (one file per city) | `/data/cities/<city>/` |
| Travel matrix | JSON or Parquet | `/data/cities/<city>/travel_matrix.*` |
| Taxonomy | YAML | `/data/taxonomy.yaml` |
| Benchmarks | JSON with seed | `/data/benchmarks/` |
| Runtime state | SQLite | `travelpilot.db` |
| Recorded API fixtures | JSON | `/data/fixtures/` |

All data files are version-controlled, and a checksum is stored so the demo can confirm it is running on the frozen dataset.

---

## 7. Data Flow

```
Curation (manual + scripts)
        │
        ▼
Raw JSON ──► Validation (schema, rules, provenance) ──► fails? → fix and re-run
        │
        ▼
Build step: compute travel matrix, index by category and location
        │
        ▼
Loaded into memory at startup ──► Solver / Agents (read-only)
        │
        ▼
Runtime writes only to: plan versions, events, traces (SQLite)
```

Reference data is **read-only at runtime**. Agents cannot modify places, hours, or prices.

---

## 8. Data Governance and Ethics

- **Licensing:** record each source's license. Provide OSM attribution if OSM data is used. Do not redistribute restricted API data.
- **Privacy:** no real personal data. Use synthetic personas for demos and benchmarks.
- **Honesty about estimates:** prices and durations labelled `estimate` are shown as estimates in the UI, and the budget engine reports a confidence range.
- **Bias check:** the curated set should include a range of price tiers and not only premium options, so budget plans are meaningful.

---

## 9. Data Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Wrong opening hours | Plans look valid but are wrong | Two-person verification, provenance dates |
| Sparse data in a city | Solver has too few options | Minimum of 60 places per demo city |
| Missing matrix entries | Solver failures | Full matrix build plus haversine fallback |
| API terms restrict caching | Legal or demo risk | Curate from open or official sources; use APIs only as optional layers |
| Data edited late | Demo breaks | Freeze plus checksum |
| Inconsistent tags | Poor interest matching | Taxonomy defined first, validated on load |

---

## 10. Acceptance Criteria

- [ ] At least 1 demo city fully curated (target 2), with 60+ places each.
- [ ] 100% of P0 places pass automated validation and two-person verification.
- [ ] Complete travel matrix for each demo city, with 10% spot-checked.
- [ ] 3+ outbound and return transport options per demo trip, including a tight connection.
- [ ] Event library covers all six event types, each with a recorded expected outcome.
- [ ] Benchmark set (20 scenarios × 30 events) is seeded and stored in the repo.
- [ ] Dataset frozen and checksummed before the final rehearsal.
- [ ] Every record has provenance (`source`, `verified_by`, `verified_on`).

---

## 11. Suggested Work Split for Data

1. **Day 1:** finalize the taxonomy and schemas, choose the demo city, and write the validation script.
2. **Then:** curate places in parallel (assign categories per person), build the matrix, and author the transport mock.
3. **Then:** author the demo trips and event library, and generate the benchmark set.
4. **Before the demo:** run the full validation and manual checks, then freeze.

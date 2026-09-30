# 🚛 CargoMind 3.0 (ShipMerge) — Full Project Overview

> **Smart India Hackathon 2026 | Problem Statement: SIH26002**
> **Team NASCENT** · AI-Based Smart Logistics and Accessibility Intelligence Platform for North Eastern Region (NER)

---

## 📌 What Is CargoMind?

**CargoMind 3.0** (internally code-named **ShipMerge**) is an **enterprise-grade, multi-tenant rural last-mile logistics consolidation, multi-modal freight orchestration, and physics-informed cold-chain risk prediction platform** built specifically for the North-Eastern Region (NER) of India — one of the most topographically complex and logistics-underserved regions in the country.

It is a **first-of-its-kind hybrid Physics + AI + Combinatorial Optimization** system that merges:
- **Google OR-Tools CP-SAT** exact combinatorial optimization
- **Arrhenius & Q₁₀ differential physics** for thermal degradation
- **Spatial-Temporal Graph Neural Networks (ST-GNN)** and **XGBoost ML regressors** for corridor delay prediction
- **Explainable AI (SHAP)** with plain-language constraint tracing
- **Trilingual offline-first assistant** (English, Hindi, Assamese)

### 🎯 The Problem We Solve

Rural last-mile logistics in NER suffers from:

| Problem | Impact |
|---|---|
| **30–40% cold-chain spoilage** | Organic tea, pineapples, biologics/vaccines wasted |
| **Fragmented freight** | Small farmers (<500 kg) cannot fill reefer trucks; pay LTL premiums |
| **Terrain shocks** | High IRI roads, monsoon landslides, steep ghats damage produce |
| **Digital exclusion** | No regional-language software; zero offline capability for rural drivers |
| **Multi-modal complexity** | Road, Rail (FOIS), Riverine (NW-2), Mountain routes not unified |

---

## 🏗️ Architecture at a Glance

```
CargoMind 3.0
├── Backend (Python FastAPI — Async, Port 8000)
│   ├── Multi-tenant REST API (15+ routers)
│   ├── Google OR-Tools CP-SAT Solver
│   ├── Physics Engines (Arrhenius, Q₁₀, PINN Vibration)
│   ├── ML Models (XGBoost, ST-GNN, Scikit-Learn)
│   ├── LLM Services (Groq + Gemini — EN/HI/AS)
│   └── Database (PostgreSQL / SQLite fallback, Async SQLAlchemy)
│
└── Frontend (Next.js 16 App Router + React 19 — Port 3000)
    ├── 15 Localized Pages (en / hi / as)
    ├── Swiss Editorial Design System
    ├── Interactive GIS Maps (Leaflet + Custom SVG)
    ├── AI Chat Interface
    └── Real-Time Dashboards
```

---

## 💻 Tech Stack

| Layer | Technologies |
|---|---|
| **Backend Framework** | Python 3.11+, FastAPI, Uvicorn, Pydantic v2 |
| **Database & ORM** | PostgreSQL, SQLite (fallback), Async SQLAlchemy, Alembic |
| **Combinatorial Optimization** | Google OR-Tools CP-SAT (`cp_model.CpModel`) |
| **Machine Learning** | XGBoost, Scikit-Learn, ST-GNN (PyTorch/Graph), SHAP |
| **Physics Engines** | Custom Arrhenius, Q₁₀, Mechanical Stress PINN |
| **LLM & Voice** | Groq API, Google Gemini API, Web Speech API |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript |
| **Styling** | Tailwind CSS v4, Lucide React Icons |
| **Mapping & GIS** | Leaflet, React-Leaflet, OpenStreetMap, Custom SVG |
| **State & Offline** | Zustand, IndexedDB, `next-intl` |
| **DevOps & Testing** | Docker, Docker Compose, Pytest, Pytest-Asyncio, Alembic |
| **Infrastructure** | PostgreSQL container, Redis cache, FastAPI container |

---

## 📂 Directory Structure

```
Cargomind3.0/
├── Backends/                          # Python FastAPI Backend
│   ├── app/
│   │   ├── api/                       # REST routers
│   │   │   ├── auth.py                # JWT + tenant registration
│   │   │   ├── shipments.py           # Shipment CRUD lifecycle
│   │   │   ├── dispatch.py            # CP-SAT solver trigger
│   │   │   ├── network.py             # Intermodal graph API
│   │   │   ├── risk.py                # Physics + ML risk predictor
│   │   │   ├── roadsense.py           # IRI road roughness scoring
│   │   │   ├── st_gnn.py              # ST-GNN congestion forecasts
│   │   │   ├── accessibility.py       # Rural hub accessibility index
│   │   │   ├── sensors.py             # IoT thermistor telemetry
│   │   │   ├── sync.py                # Offline batch sync
│   │   │   ├── chat.py                # Multilingual AI assistant
│   │   │   ├── carbon.py              # CO2 emissions calculator
│   │   │   ├── weather.py             # Weather disruption service
│   │   │   ├── vehicles.py            # Fleet vehicle management
│   │   │   ├── temperature_logs.py    # Thermal excursion logs
│   │   │   ├── road_conditions.py     # Road hazard crowd-reports
│   │   │   └── dataset.py             # Census and agro data explorer
│   │   ├── core/
│   │   │   ├── auth.py                # JWT + header dual auth
│   │   │   ├── config.py              # Environment settings
│   │   │   ├── database.py            # Async SQLAlchemy engine
│   │   │   └── deps.py                # DI: tenant sessions, auth guards
│   │   ├── models/                    # SQLAlchemy ORM Models
│   │   │   ├── tenant.py
│   │   │   ├── shipment.py
│   │   │   ├── hub.py
│   │   │   ├── route.py
│   │   │   ├── temperature_log.py
│   │   │   ├── roadsense.py
│   │   │   ├── road_condition.py
│   │   │   ├── allocation_history.py
│   │   │   └── dispatch_execution.py
│   │   ├── repositories/              # Repository pattern data access
│   │   ├── schemas/                   # Pydantic v2 validation schemas
│   │   └── services/
│   │       ├── optimizer/
│   │       │   ├── solver.py          # CP-SAT ConsolidationSolver
│   │       │   ├── constraints.py     # Hard constraint definitions
│   │       │   └── fairness_calculator.py  # Gini index rural equity
│   │       ├── risk/
│   │       │   ├── predictor.py       # Unified risk prediction API
│   │       │   ├── spoilage_model.py  # Arrhenius + Q10 kinetics
│   │       │   └── delay_model.py     # XGBoost corridor delay
│   │       ├── network/
│   │       │   ├── graph_builder.py   # NetworkX intermodal graph
│   │       │   ├── route_scorer.py    # Multi-criteria corridor scoring
│   │       │   ├── terrain_service.py # SRTM elevation profiling
│   │       │   └── river_multimodal_engine.py # NW-2 riverine routing
│   │       ├── roadsense/
│   │       │   ├── scorer.py          # IRI road roughness scorer
│   │       │   └── osm_seeder.py      # OSM road data extraction
│   │       ├── st_gnn/
│   │       │   ├── model.py           # ST-GNN PyTorch model
│   │       │   ├── graph.py           # Graph construction
│   │       │   └── service.py         # Inference service
│   │       ├── stress_decay/
│   │       │   └── model.py           # PINN vibration damage model
│   │       ├── explain/
│   │       │   ├── shap_explainer.py  # SHAP feature attribution
│   │       │   └── constraint_tracer.py  # Solver decision rationale
│   │       ├── carbon/carbon_engine.py     # CO2 abatement engine
│   │       ├── cold_chain/cold_chain_passport.py
│   │       ├── consolidation/consolidation_engine.py
│   │       ├── crossdock/crossdock_optimizer.py
│   │       ├── demand_forecast/demand_forecast_engine.py
│   │       ├── digital_twin/digital_twin_engine.py
│   │       ├── disruption/counterfactual_sim.py
│   │       ├── emergency/emergency_engine.py
│   │       ├── eta/dynamic_eta_engine.py
│   │       ├── fleet/fleet_engine.py
│   │       ├── pricing/pricing_engine.py
│   │       ├── routing/routing_engine.py
│   │       ├── settlement/settlement_engine.py
│   │       ├── weather/service.py
│   │       ├── sensors/processor.py
│   │       ├── integrations/ulip/ulip_integration.py
│   │       └── llm_service.py         # Groq/Gemini multilingual LLM
│   ├── ml/                            # ML training scripts + artifacts
│   ├── scripts/
│   │   └── seed_demo_data.py          # Demo data seeder
│   ├── alembic/                       # DB migration versions
│   ├── tests/                         # Pytest test suite
│   └── Dockerfile + docker-compose
│
├── frontend/                          # Next.js 16 Web Application
│   ├── app/[locale]/                  # Localized pages (en / hi / as)
│   │   ├── page.tsx                   # Main Operations Dashboard (206 KB!)
│   │   ├── about/                     # Architecture + Manifesto
│   │   ├── accessibility/             # Rural Accessibility Audit
│   │   ├── ai-intelligence/           # Multi-objective Simulator + XAI
│   │   ├── analytics/                 # Analytics Dashboard
│   │   ├── audit/                     # Real-Time Incident Audit Feed
│   │   ├── carbon/                    # CO2 Abatement Tracker
│   │   ├── cold-chain/                # Cold Chain Passport View
│   │   ├── consolidation/             # Freight Consolidation Planner
│   │   ├── control-tower/             # Control Tower Monitor
│   │   ├── driver/                    # Driver Portal
│   │   ├── farmer/                    # Farmer / Shipper Portal
│   │   ├── fleet/                     # Fleet Management
│   │   ├── hubs/                      # Hub Digital Twin Gallery
│   │   ├── map/                       # Full-Screen GIS Map
│   │   └── simulation/                # Disruption Simulation Lab
│   ├── components/
│   │   ├── ai/RuralChatbot.tsx        # Multilingual AI Chatbot
│   │   ├── dataset/DatasetExplorer.tsx
│   │   ├── hub/HubDigitalTwinGallery.tsx
│   │   ├── map/CargoMindOsmMap.tsx    # Leaflet/OSM Live Map
│   │   ├── map/SwissLogisticsMap.tsx  # SVG Network Map
│   │   ├── map/NERMap.tsx             # NER Region Map
│   │   ├── navigation/TopNavigation.tsx
│   │   ├── pinn/PINNStressCard.tsx    # Vibration Damage Visualizer
│   │   ├── search/LogisticsSearchModal.tsx  # Cmd+K Command Palette
│   │   ├── sensors/SensorCaptureCard.tsx
│   │   ├── st_gnn/STGNNDegradationCard.tsx
│   │   ├── weather/WeatherRiskCard.tsx
│   │   ├── theme/ThemeProvider.tsx
│   │   ├── OpeningScreen.tsx          # Kinetic HUD Intro
│   │   ├── LanguageSwitcher.tsx
│   │   └── ThemeSwitcher.tsx
│   ├── messages/                      # i18n translation dictionaries
│   │   ├── en.json
│   │   ├── hi.json
│   │   └── as.json (Assamese)
│   └── lib/api/                       # Typed frontend API client
│
├── write_translations.py              # Automated i18n sync utility
├── run_cargomind.sh                   # One-click launcher
├── README.md
├── FEATURES.md
├── PROJECT_OVERVIEW.md
└── CargoMind_3.0_Complete_Project_Guide.pdf
```

---

## ✅ Features Built (What We Have Done)

### 1. 🔐 Multi-Tenancy, Authentication & RBAC

- **Complete tenant isolation** — every DB query scoped to tenant context
- **3 Roles**: `shipper` (creates shipments), `carrier` (masked view), `admin` (system-wide)
- **Dual auth**: JWT Bearer (`POST /api/auth/token`) + Header-based (`X-Tenant-ID`, `X-Tenant-Role`) for Swagger testing
- **Dynamic tenant registration** via `POST /api/auth/register-tenant`
- **Carrier payload masking** via `CarrierShipmentRead` schema (hides shipper financials)

---

### 2. 📦 Freight Manifest & Shipment Lifecycle

- **Full state machine**: `Pending → Consolidated → Pre-Cooling → In Transit → Crossdocking → Delivered / Cancelled`
- **Thermal classifications**:
  - `frozen` (−18°C): meat, fish, vaccines, biologics
  - `chilled` (+4°C): dairy, fresh fruits, tea extracts
  - `ambient` (+22°C): dry goods, standard cargo
- **SLA constraints**: weight (kg), volume (m³), delivery deadline, max budget (INR)
- **Interactive dispatch ingestion form** — client-side validation, auto waybill generation
- **Real-time manifest filtering** by status with live telemetry counters

---

### 3. 🧩 Combinatorial Freight Optimization (Google OR-Tools CP-SAT)

**The core engine of CargoMind.** Powered by `ConsolidationSolver` using constraint programming.

**Objective function** (multi-weighted minimization of cost + spoilage risk + fixed vehicle overhead):

**Hard Constraints enforced:**

| Constraint | Rule |
|---|---|
| Thermal Isolation | Frozen + Ambient **NEVER** share same vehicle compartment |
| Payload Capacity | Weight ≤ MaxPayload per vehicle |
| Volumetric Capacity | Volume ≤ MaxVolume per vehicle |
| SLA Deadline | Departure + Transit ≤ Deadline |
| Cost Ceiling | Total route cost ≤ shipper's max budget |

**Pareto Plan Generation:**
- **Plan Alpha** — Max Rail/DFC consolidation (highest cost savings, lowest CO₂)
- **Plan Beta** — Express highway reefer relay (shortest SLA, fastest delivery)
- **Plan Gamma** — Zero-defect cold shield (minimum thermal excursions)

**Additional:**
- **Gini Fairness Calculator** — ensures remote rural hubs are not starved in favor of high-volume urban routes
- **Greedy fallback heuristic** — sub-second response if CP-SAT hits tight timeouts

---

### 4. 🌡️ Physics-Informed Cold-Chain & Thermal Kinetics

**Arrhenius Shelf-Life Depletion** — calculates instantaneous biochemical decay rate based on activation energy (Ea ≈ 62–110 kJ/mol).

**Q₁₀ Temperature Acceleration** — computes dynamic acceleration factor when containers deviate from target setpoints.

**Built components:**
- Container insulation & heat exchange modeling (R-2 to R-8 R-values, ambient 20–52°C)
- IoT thermistor log ingestion & door-opening excursion tracking
- **Live Thermal Playground** — interactive UI sliders for real-time decay curve visualization
- **Cold Chain Passport** (`cold_chain_passport.py`) — end-to-end thermal trace document per shipment

---

### 5. 📳 Physics-Informed Mechanical Stress & Vibration (PINN)

- **PINN Vibration Damage Model** (`stress_decay/model.py`) — evaluates physical product damage from road roughness + chassis vibration
- **`PINNStressCard.tsx`** — visualizes cumulative stress scores, G-force shock peaks, packaging threshold exceedances for fragile goods

---

### 6. 🤖 Spatial-Temporal Graph Neural Network (ST-GNN)

- **ST-GNN model** (`st_gnn/model.py`) — PyTorch-based GNN where hub nodes + corridor edges model the logistics network
- **Dynamic congestion & delay forecasting** across interconnected transport corridors
- **`STGNNDegradationCard.tsx`** — interactive visualizer showing bottleneck nodes, degradation indices, diversion paths
- **XGBoost corridor delay regressor** — trained on departure time, monsoon indices, route elevation, carrier reliability

---

### 7. 🛣️ RoadSense IRI & SRTM Terrain Engine

- **International Roughness Index (IRI) scoring** — evaluates paved/unpaved/gravel surfaces, computes speed penalties
- **SRTM 30m DEM elevation profiling** — incline gradients, fuel surcharges, transit delay on steep ghats
- **OpenStreetMap seeder** (`osm_seeder.py`) — auto-extracts and classifies NE India road geometry
- **Road hazard crowd-reporting** — drivers submit pothole/landslide/waterlogging reports with GPS tags
- **`GET /api/roadsense/score`** — vehicle suitability scoring per corridor

---

### 8. 🗺️ NER Logistics Network Topology (Authentic Data)

**Hub Nodes modeled:**

| Hub | Code | Capacity | Role |
|---|---|---|---|
| Guwahati Central Multimodal Mega-Hub | GHY | 75,000 kg | Primary rail + air gateway |
| Shillong Hill Agro-Aggregation | SHL | 25,000 kg | High-altitude solar cold hub |
| Silchar Barak Valley Hub | IXS | — | Gateway to Tripura, Mizoram |
| Pandu Port Inland Waterways Terminal | NW-2 | — | Brahmaputra barge node |
| Tezpur / Jorhat / Dibrugarh | — | — | Regional depots |
| Dimapur / Imphal / Agartala / Aizawl | — | — | State capital hubs |

**Transport modes:**
- `road_reefer` — Heavy insulated trucks (10–25 ton)
- `road_camper` — 4x4 Bolero for mountain last-mile (1.2–2.5 ton)
- `rail_wagon` — FOIS refrigerated rail container rakes (DFC)
- `riverine_barge` — NW-2 Brahmaputra inland waterway

---

### 9. 🗺️ Geospatial Mapping & Digital Twin

**Three interactive maps built:**

1. **`CargoMindOsmMap.tsx`** — Leaflet/OSM live GIS map with active GPS tracking, road roughness heatmaps, hub fill meters
2. **`SwissLogisticsMap.tsx`** — High-contrast editorial SVG network map with animated DFC rail streams
3. **`NERMap.tsx`** — Dedicated North-East India regional map

**`HubDigitalTwinGallery.tsx`** — Cold-room compressor health, solar microgrid battery levels, docking bay telemetry

---

### 10. 🧠 Explainable AI (XAI) & Constraint Tracing

- **SHAP feature attribution** (`shap_explainer.py`) — quantitative impact factors for every optimization decision
- **Constraint Tracer** (`constraint_tracer.py`) — human-readable rationales for consolidation decisions
- **Multi-tier automated synthesis**: Executive Summary, Depot/Driver Instructions, Natural Language Query Console

---

### 11. ⚡ Disruption Simulation Lab & Auto-Mitigation

Synthetic shock scenarios with autonomous response:

| Shock Event | Auto-Mitigation |
|---|---|
| Valley Heatwave (42°C spike) | Emergency pre-cooling + compressor +12% boost |
| Monsoon NH-27 Flash Flood | Reroute → Brahmaputra barge (NW-2) |
| Lumding-Silchar Hill Railway Landslide | Disaggregate → 4x4 Bolero camper fleet |
| Rail Siding Maintenance (4 hr bottleneck) | Vaccines → road; bulk tea stays on rail |

- **`disruption/counterfactual_sim.py`** — synthetic shock injection engine
- **Real-Time Incident Audit Feed** — chronological log of anomalies, mitigations, recovery timestamps

---

### 12. 💬 Multilingual Rural AI Assistant & Voice Interface

- **LLM integration** — Groq + Google Gemini with logistics domain system prompting
- **Trilingual**: English (`en`), Hindi (`hi`), Assamese (`as`) — full native fluency
- **Voice input** — Browser Web Speech API for low-literacy rural drivers
- **Context injection** — chatbot has live access to shipment statuses, road conditions, hub capacities, weather alerts
- **`RuralChatbot.tsx`** — full UI component with language auto-detection

---

### 13. 📴 Offline-First Architecture & Driver Sync

- **IndexedDB client storage** — buffers pending status updates, e-PoD, temperature logs when offline
- **`POST /api/sync/batch`** — resolves conflicts, flushes batched mutations on reconnect
- **Visual sync status badge** — `ONLINE (SYNCED)` / `OFFLINE (BUFFERING)` / `SYNCING...`
- **`syncStore.ts`** — Zustand store managing offline mutation queue

---

### 14. 🌿 Carbon & Sustainability Engine

- **`carbon/carbon_engine.py`** — CO₂ emissions calculation per transport mode and route
- **Carbon abatement tracker** — real-time comparison of Plan Alpha (rail) vs road alternatives
- **Dedicated `/carbon` page** in frontend for CO₂ dashboard

---

### 15. 🧑‍🌾 Specialized User Portals

| Portal | Page | Users |
|---|---|---|
| **Farmer/Shipper Portal** | `/farmer` | Agricultural cooperatives, smallholder farmers |
| **Driver Portal** | `/driver` | Rural transport drivers, depot handlers |
| **Control Tower** | `/control-tower` | Logistics coordinators, fleet supervisors |

---

### 16. 📊 Additional Engines Built

| Engine | File | Purpose |
|---|---|---|
| Pricing Engine | `pricing/pricing_engine.py` | Dynamic freight rate calculation |
| Settlement Engine | `settlement/settlement_engine.py` | Post-delivery payment reconciliation |
| Demand Forecast | `demand_forecast/demand_forecast_engine.py` | Predictive shipment volume planning |
| Fleet Management | `fleet/fleet_engine.py` | Vehicle assignment and utilization |
| ETA Prediction | `eta/dynamic_eta_engine.py` | Dynamic estimated time of arrival |
| Emergency Engine | `emergency/emergency_engine.py` | Critical shipment prioritization |
| Crossdock Optimizer | `crossdock/crossdock_optimizer.py` | Transfer hub dwell minimization |
| Accessibility Scorer | `accessibility/scorer.py` | Rural hub connectivity index |
| ULIP Integration | `integrations/ulip/ulip_integration.py` | Govt. ULIP logistics API bridge |
| Weather Service | `weather/service.py` | Open-Meteo weather disruption alerts |
| Sensor Processor | `sensors/processor.py` | IoT telemetry signal processing |
| River Multimodal | `network/river_multimodal_engine.py` | NW-2 Brahmaputra routing |

---

### 17. 🖥️ Frontend Pages Summary (16 Pages)

| Page Route | Purpose |
|---|---|
| `/` (main `page.tsx`) | Main Operations Dashboard (206 KB — full control room) |
| `/about` | Architecture, manifesto, benchmarks vs conventional 3PL |
| `/accessibility` | Rural hub accessibility & connectivity audit |
| `/ai-intelligence` | Multi-objective simulator + XAI SHAP console |
| `/analytics` | Advanced analytics dashboard |
| `/audit` | Real-time incident audit feed |
| `/carbon` | CO₂ abatement tracker |
| `/cold-chain` | Cold chain passport & thermal trace |
| `/consolidation` | Freight consolidation plan viewer |
| `/control-tower` | Operations control tower |
| `/driver` | Driver portal (offline-first) |
| `/farmer` | Farmer/shipper portal |
| `/fleet` | Fleet management dashboard |
| `/hubs` | Hub digital twin gallery |
| `/map` | Full-screen GIS / OSM live map |
| `/simulation` | Disruption simulation lab |

---

### 18. 🎨 Frontend Design System

- **Swiss Editorial Aesthetic** — minimalist, high-contrast, 1px hairline borders, monospace data readouts, zero gradients
- **Kinetic HUD Intro Screen** (`OpeningScreen.tsx`) — fullscreen animated reticle calibrating solver params on first visit
- **Global Command Palette** (`Cmd+K` / `Ctrl+K`) via `LogisticsSearchModal.tsx` — search across all pages, hubs, waybills
- **Theme Engine** — Dark Mode (deep navy) ↔ Light Mode (pure white) seamless toggle
- **Internationalization** — `next-intl` with `en.json`, `hi.json`, `as.json` translation dictionaries
- **`write_translations.py`** — automated script to sync translation keys across all locale files

---

## 🌐 API Endpoints Reference

| Endpoint | Method | Auth | Description |
|---|---|---|---|
| `/api/auth/token` | POST | Public | Issue JWT token with tenant claims |
| `/api/auth/register-tenant` | POST | Public | Onboard new tenant |
| `/api/shipments` | GET / POST | Authenticated | List / Create consignments |
| `/api/shipments/{id}` | GET | Authenticated | Shipment detail (carrier-masked) |
| `/api/dispatch/match` | POST | shipper / admin | Execute CP-SAT consolidation solver |
| `/api/dispatch/fairness-metrics` | GET | Authenticated | Gini index & rural allocation scores |
| `/api/network/graph` | GET | Authenticated | Intermodal logistics graph |
| `/api/risk/predict` | POST | Authenticated | Physics + ML thermal & delay risk |
| `/api/roadsense/score` | GET | Authenticated | Road roughness & vehicle suitability |
| `/api/st-gnn/predict` | POST | Authenticated | ST-GNN congestion forecast |
| `/api/accessibility/score` | GET | Authenticated | Rural accessibility index |
| `/api/sensors/telemetry` | POST | carrier / admin | IoT thermistor + vibration ingestion |
| `/api/temperature-logs` | GET / POST | Authenticated | Thermal excursion log management |
| `/api/road-conditions` | POST | Authenticated | Crowdsourced road hazard reports |
| `/api/carbon` | GET | Authenticated | CO₂ emissions per route/plan |
| `/api/weather` | GET | Authenticated | Weather disruption alerts |
| `/api/vehicles` | GET / POST | Authenticated | Fleet vehicle management |
| `/api/sync/batch` | POST | Authenticated | Offline mutation batch sync |
| `/api/chat/assistant` | POST | Authenticated | Multilingual LLM assistant |
| `/api/dataset` | GET | Authenticated | Census & agro-economic data |

---

## 🗄️ Database & Seeder

Running `python -m scripts.seed_demo_data` generates:

- **3 Default Tenants**: `Shipper` (ColdChain Logistics India), `Carrier` (Indian Rail Express), `Admin` (ShipMerge Admin Platform)
- **15 Indian Logistics Hubs** with geo-coordinates, capacities, and roles
- **Highway & Rail Routes** with transit times, costs, and reliability scores
- **180-Day Historical Performance Data** per route for ML models
- **50 Pending Temperature-Sensitive Shipments** (Frozen, Chilled, Ambient mix)
- **IoT Temperature Excursion Logs** per shipment

**Database support:**
- **PostgreSQL** (production) via `asyncpg`
- **SQLite** (development fallback) via `aiosqlite`
- **Alembic** migrations (`alembic/versions/001_initial_schema.py`)

---

## 🧪 Testing

Pytest suite in `Backends/tests/` covering:
- CP-SAT solver constraint satisfaction (thermal isolation, capacity bounds)
- ML risk predictor outputs (delay probability, spoilage %)
- Shipment repository queries + tenant isolation policies
- API endpoint integration tests

```bash
pytest tests                    # Run full test suite
pytest tests -v                 # Verbose output
```

---

## 🚀 How to Run

### Option 1: One-Click (Bash/WSL)
```bash
./run_cargomind.sh
```

### Option 2: Docker (Recommended)
```bash
cd Backends
docker compose up --build -d
docker compose exec api python -m scripts.seed_demo_data
```

### Option 3: Local Python + SQLite (No Docker, Windows)
```bash
# Backend
cd Backends
python -m venv venv && venv\Scripts\activate
pip install -e .
# Set DATABASE_URL=sqlite+aiosqlite:///./shipmerge.db in .env
python -m scripts.seed_demo_data
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm install && npm run dev
```

**Access:**
- API + Swagger: `http://localhost:8000/docs`
- Web App: `http://localhost:3000/en` (or `/hi`, `/as`)

---

## 🏆 Unique Innovations & Differentiators

1. **First Hybrid Physics-AI-Optimization Stack** — CP-SAT exact optimization + Arrhenius differential physics + ST-GNN deep learning in one unified platform

2. **Deep NER Geographic Specialization** — Custom models for SRTM terrain, NW-2 Brahmaputra riverine corridors, high-IRI mountain roads, and monsoon shock patterns unique to Assam/Meghalaya

3. **Equitable Rural Logistics (Gini Fairness)** — Built-in Gini index ensures isolated farming clusters in Dima Hasao or Karbi Anglong are not deprioritized vs. high-volume urban corridors

4. **Inclusive Multilingual Interface** — Assamese voice assistant + offline-first design built specifically for low-literacy rural drivers and depot managers

5. **Real Physics, Not Heuristics** — Shelf-life predictions use actual Arrhenius activation energies and Q₁₀ kinetics, not simplified lookup tables

6. **End-to-End Cold Chain Passport** — Per-shipment thermal audit trail from origin cold-room to delivery, with IoT sensor integration

7. **Autonomous Disruption Response** — System does not just alert on disruptions; it autonomously re-routes, re-plans, and triggers emergency protocols

---

## 📊 Operational Benchmarks (vs. Conventional 3PL)

| Metric | Conventional 3PL | CargoMind 3.0 |
|---|---|---|
| Cold-chain spoilage rate | 30–40% | Target <8% |
| Freight consolidation efficiency | Manual / ad-hoc | CP-SAT optimal bin-packing |
| Rural hub equity | Urban-biased | Gini-fair allocation |
| Language accessibility | English-only systems | EN / HI / AS trilingual + voice |
| Offline capability | None | Full IndexedDB offline-first |
| Disruption response | Human escalation (hours) | Autonomous re-routing (<1 min) |
| CO₂ reporting | Not tracked | Per-shipment per-mode carbon audit |

---

*Generated: September 2026 | Team NASCENT | SIH 2026 — Problem Statement SIH26002*

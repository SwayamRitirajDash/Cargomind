# CargoMind 3.0 (ShipMerge) — Complete Project Documentation & Prototype Feature Directory

> **Platform Overview**: Enterprise Multi-Tenant Rural Last-Mile Logistics Consolidation, Multi-Modal Freight Orchestration, and Physics-Informed Cold-Chain Risk Prediction Engine.
> **Target Region**: North-Eastern Region (NER) of India (Assam, Meghalaya, Brahmaputra Corridor) and Strategic National Gateway Corridors.
> **Developed by**: Team NASCENT (Smart India Hackathon 2026).

---

## 1. Executive Summary & Problem Context

### 1.1 The Rural & Perishable Logistics Crisis
Rural last-mile logistics in developing economies—particularly in high-friction, topographically complex geographies like North-East India (NER)—suffer from critical structural challenges:
1. **High Cold-Chain Spoilage Rates (30–40%)**: Organic tea, seasonal horticulture (pineapples, ginger, oranges), and temperature-sensitive biologicals/vaccines decay rapidly due to unmonitored temperature excursions and rough mountain transits.
2. **Fragmented Freight & Low Asset Utilization**: Smallholder farmers and local agricultural cooperatives produce small consignment volumes (<500 kg) that cannot independently fill refrigerated trucks (reefers), leading to empty backhauls or exorbitant Less-Than-Truckload (LTL) costs.
3. **Severe Road Degradation & Terrain Shocks**: Heavy monsoons, landslides, high International Roughness Index (IRI) roads, and steep elevation gradients cause mechanical stress on produce and unpredictable transit delays.
4. **Information Asymmetry & Language Barriers**: Rural depot managers and local transport operators face digital exclusion due to complex enterprise software lacking regional language support and offline operational capability.

### 1.2 The CargoMind Solution
**CargoMind 3.0** (internally code-named **ShipMerge**) is an intelligent freight orchestration platform designed to transform rural cold-chain logistics into a consolidated, multi-modal, and physics-predictable supply network.

It combines:
- **Google OR-Tools CP-SAT** combinatorial optimization for automated consignment bin-packing and multi-modal route matching.
- **Physics-Informed Thermal Degradation Kinetics (Arrhenius & $Q_{10}$)** alongside **PINN Mechanical Stress Decay** modeling.
- **Spatial-Temporal Graph Neural Networks (ST-GNN)** and **XGBoost Regressors** for dynamic corridor delay prediction.
- **RoadSense IRI Scorer** integrating SRTM elevation profiles and OpenStreetMap road roughness metrics.
- **Explainable AI (XAI)** with SHAP feature attribution and natural-language constraint tracing.
- **Multilingual Offline-First Assistant** supporting English, Hindi, and Assamese with voice synthesis and IndexedDB sync.

---

## 2. Complete Prototype Features (Current State)

### 2.1 Multi-Tenancy, Security & Role-Based Access Control (RBAC)
- **Tenant Isolation**: Complete database and query isolation via `Tenant` models and `TenantContext` middleware. Multi-tenant operations support three distinct actor roles:
  - `shipper`: Creates consignments, specifies SLA deadlines, sets budget limits, and initiates CP-SAT optimization batches.
  - `carrier`: Accepts loads, views route waypoints, monitors vehicle capacity, and accesses operational telemetry with commercial pricing metadata masked (`CarrierShipmentRead`).
  - `admin`: System-wide oversight over all network hubs, intermodal corridors, tenant allocations, and audit logs.
- **Dual Authentication Protocols**:
  - **JWT Bearer Authentication**: Cryptographically signed HS256 JWT tokens issued via `POST /api/auth/token` containing tenant ID and role claims.
  - **Header-Based Authentication**: Seamless API/Swagger testing using `X-Tenant-ID` and `X-Tenant-Role` HTTP headers.
- **Dynamic Tenant Onboarding**: Self-service tenant creation via `POST /api/auth/register-tenant` with auto-seeded demo instances.

---

### 2.2 Consignment Manifest & Cold-Chain Management
- **Full Lifecycle State Machine**: Real-time status transitions:
  $$\text{Pending} \longrightarrow \text{Consolidated} \longrightarrow \text{Pre-Cooling} \longrightarrow \text{In Transit} \longrightarrow \text{Crossdocking} \longrightarrow \text{Delivered} \ (\text{or } \text{Cancelled})$$
- **Thermal Classification Categories**:
  - **`frozen` ($-18^\circ\text{C}$)**: Deep cold-chain for meat, fish, and biologics/vaccines.
  - **`chilled` ($+4^\circ\text{C}$)**: Temperature-controlled dairy, fresh fruits, vegetables, and tea extracts.
  - **`ambient` ($+22^\circ\text{C}$)**: Standard non-refrigerated cargo and dry goods.
- **Multi-Constraint Manifest Ingestion**: Captures physical parameters (weight in kg, volume in $\text{m}^3$), delivery urgency (`standard`, `express`, `emergency`), maximum allowable budget (INR), and strict delivery deadlines.
- **Interactive Dispatch Ingestion Console**: Modern UI form with client-side validation, automated waybill generation, and instant injection into the CP-SAT consolidation pool.
- **Real-Time Manifest Filter**: Tabbed filtering by shipment status with live cold-chain telemetry counters.

---

### 2.3 Combinatorial Freight Optimization (Google OR-Tools CP-SAT)
- **Multi-Objective Optimization Solver**: Powered by `ConsolidationSolver` implementing constraint programming via Google OR-Tools CP-SAT:
  $$\min \sum \left( w_{\text{cost}} \cdot \text{Cost} + w_{\text{risk}} \cdot \text{SpoilageRisk} + \text{FixedVehicleCost} \cdot y_k \right)$$
- **Strict Hard Constraints**:
  1. **Thermal Isolation**: Absolute guarantee that incompatible temperature classes (e.g., Frozen and Ambient) are never co-loaded in the same vehicle compartment.
  2. **Vehicle Capacity Limits**: Strict enforcement of payload weight limits ($\text{kg}$) and volumetric bounds ($\text{m}^3$) per vehicle type.
  3. **SLA Deadlines & Budget Bounds**: Guarantees arrival before shipper deadlines without exceeding cost ceilings.
- **Pareto Frontier Generation (Plan Alpha, Beta, Gamma)**:
  - **Plan Alpha (Max Rail / Eco-Saver)**: Maximizes Dedicated Freight Corridor (DFC) rail wagon consolidation, minimizing freight costs and $\text{CO}_2$ emissions.
  - **Plan Beta (Express Road / SLA-First)**: Direct reefer highway relays prioritizing rapid transit times.
  - **Plan Gamma (Zero-Defect Thermal Shield)**: Minimizes thermal excursions and vibration damage by selecting optimal multi-modal corridors with verified cold-storage crossdocks.
- **Gini Fairness Calculator**: Computes allocation equity indices across rural aggregation hubs to prevent starvation of remote mountain clusters.
- **Sub-Second Greedy Heuristic Fallback**: Automatic failover to a greedy bin-packing heuristic if CP-SAT model encounters tight timeout limits.

---

### 2.4 Physics-Informed Thermal Kinetics & Sensor Telemetry
- **Arrhenius Shelf-Life Depletion Kinetics**:
  $$k(T) = A \cdot \exp\left(-\frac{E_a}{R \cdot T}\right)$$
  Calculates instantaneous biochemical decay rates based on activation energy ($E_a \approx 62\text{--}110\,\text{kJ/mol}$).
- **$Q_{10}$ Temperature Acceleration Factor**:
  $$\text{Acceleration Factor} = Q_{10}^{\frac{T_{\text{actual}} - T_{\text{target}}}{10}}$$
  Quantifies shelf-life decay multipliers when containers deviate from target setpoints.
- **Container Insulation & Heat Exchange Modeling**: Computes thermal influx based on container R-values ($R\text{-}2\text{ to }R\text{-}8$), ambient ambient temperatures ($20^\circ\text{C}\text{--}52^\circ\text{C}$), and transit durations.
- **Live Thermal Playground**: Interactive UI controls for adjusting external temperatures, insulation thickness, and transit hours with real-time decay curves.
- **IoT Telemetry Ingestion**: Ingests continuous temperature sensor logs, door-opening logs, and refrigeration compressor failure alerts.

---

### 2.5 Physics-Informed Mechanical Stress & Vibration Decay (PINN)
- **Vibration Damage Kinetics**: Evaluates physical product damage caused by road surface roughness (IRI) and vehicle chassis vibrations.
- **`PINNStressCard` Interface**: Visualizes cumulative mechanical stress scores, vibration shock peaks (G-force), and packaging threshold exceedances on fragile agricultural goods (e.g., fresh strawberries, organic eggs, glass medical vials).

---

### 2.6 Spatial-Temporal Graph Neural Networks (ST-GNN) & ML Delay Prediction
- **ST-GNN Corridor Modeling**: Graph neural network representation of the logistics network where nodes are freight hubs and edges are multi-modal corridors.
- **Dynamic Delay & Congestion Forecasting**: Predicts delay propagation across interconnected transport corridors using historical traffic patterns, weather disruptions, and elevation factors.
- **`STGNNDegradationCard` Component**: Interactive visualizer showing corridor degradation indices, forecasted bottleneck nodes, and alternative diversion paths.
- **XGBoost Corridor Delay Regressor**: Gradient boosting model predicting transit delays based on departure time, seasonal monsoon indices, route elevation, and carrier reliability scores.

---

### 2.7 RoadSense Roughness (IRI) & SRTM Elevation Engine
- **International Roughness Index (IRI) Scoring**: Evaluates road surface conditions (paved asphalt, unpaved gravel, broken dirt tracks) and computes vehicle transit speed penalties.
- **SRTM Elevation Profiling**: Integrates Shuttle Radar Topography Mission (SRTM) elevation models to calculate incline gradients, fuel consumption surcharges, and transit delays on steep ghat sections.
- **OpenStreetMap (OSM) Seed Integration**: Automates extraction and classification of road geometry and surface metadata across North-East India corridors.
- **Road Condition Crowdsourcing**: Ingests road hazard reports (potholes, waterlogging, landslides) from drivers with spatial coordinate tagging.

---

### 2.8 North-East Region (NER) Logistics Topology & Authentic Datasets
- **Authentic Network Nodes**:
  - **Guwahati Central Multimodal Mega-Hub (GHY)**: Major rail freight terminal and air cargo gateway ($75{,}000\,\text{kg}$ cold storage).
  - **Shillong Hill Agro-Aggregation Node (SHL)**: High-altitude solar-powered cold hub ($25{,}000\,\text{kg}$ capacity).
  - **Silchar Barak Valley Hub (IXS)**: Critical gateway connecting southern Assam, Tripura, and Mizoram.
  - **Pandu Port Inland Waterways Terminal (NW-2)**: Riverine Brahmaputra barge transport node for heavy and temperature-stable freight.
  - **Tezpur, Jorhat, Dibrugarh, Dimapur, Imphal, Agartala, and Aizawl Regional Depots**.
- **Multi-Modal Transport Modes**:
  - `road_reefer`: Heavy multi-axle insulated trucks ($10\text{--}25\,\text{ton}$).
  - `road_camper`: 4x4 Bolero campers for rugged mountain last-mile connectivity ($1.2\text{--}2.5\,\text{ton}$).
  - `rail_wagon`: FOIS-integrated refrigerated rail container rakes.
  - `riverine_barge`: NW-2 Brahmaputra inland waterway transport.
- **Census 2011 & Agro-Economic Data Integration**: Scripts for processing authentic demographic, village population, and crop production datasets to model real rural freight supply curves.

---

### 2.9 Geospatial Mapping & Digital Twin Telemetry
- **CargoMind OpenStreetMap GIS View (`CargoMindOsmMap.tsx`)**: High-performance interactive Leaflet/OSM vector map with layer controls:
  - Active reefer and 4x4 vehicle GPS tracking with breadcrumb trails.
  - Color-coded corridor routes (Road, Rail, Riverine).
  - Road roughness heatmaps and mountain elevation contours.
  - Hub cold-storage capacity fill meters.
- **Swiss-Style Vector Map (`SwissLogisticsMap.tsx`)**: Editorial high-contrast SVG map visualizing abstract network topology, rural aggregation nodes, and DFC rail motion streams.
- **Hub Digital Twin Gallery (`HubDigitalTwinGallery.tsx`)**: 3D/telemetry overview of warehouse cold-rooms, compressor health, solar microgrid battery levels, and docking bays.
- **Dataset Explorer (`DatasetExplorer.tsx`)**: Interactive data grid for filtering and querying raw census points, historical route transit logs, and crop yield databases.

---

### 2.10 Explainable AI (XAI) & Strategic Narratives
- **SHAPley Feature Attribution**: Deconstructs optimization decisions into quantitative impact factors (e.g., $+34\%$ cost saving via Rail DFC shift, $-18\%$ spoilage risk via high-grade insulation).
- **Constraint Tracing Engine**: Generates human-readable rationales detailing why specific shipments were consolidated together and why particular transport modes were chosen.
- **Multi-Tier Automated Synthesis**:
  - **Executive Summary**: High-level financial savings, $\text{CO}_2$ abatement figures, and SLA compliance percentages.
  - **Depot / Driver Instructions**: Concrete setpoints, precooling dwell times, and transshipment protocols.
  - **Interactive Natural Language Query Console**: Query interface for evaluating counterfactual scenarios (e.g., *"What happens if NH-27 is closed due to a landslide?"*).

---

### 2.11 Disruption Simulation Lab & Autonomous Mitigation
- **Synthetic Operational Shocks**:
  - **Valley Heatwave Spike**: Ambient temperature surges to $42^\circ\text{C} \rightarrow$ automatic trigger of emergency pre-cooling cycles and compressor boost.
  - **Monsoon Flash Flooding on NH-27**: Road corridor severed $\rightarrow$ automated diversion of non-critical freight to Brahmaputra Riverine Barge (NW-2) and priority medical cargo to rail.
  - **Hill Railway Landslide**: Lumding-Silchar hill section blocked $\rightarrow$ immediate parcel disaggregation into a fleet of 4x4 Bolero campers over bypass mountain passes.
- **Real-Time Incident Audit Feed**: Live chronological logging of system anomalies, mitigation executions, and recovery timestamps.

---

### 2.12 Multilingual Rural AI Assistant & Voice Interface
- **Large Language Model Integration**: Powered by Groq / Google Gemini with domain-specific logistics system prompting.
- **Trilingual Localization**: Complete native fluency in **English (`en`)**, **Hindi (`hi`)**, and **Assamese (`as`)**.
- **Voice Input & Audio Synthesis**: Browser Web Speech API integration allowing low-literacy drivers and depot workers to query dispatch schedules, report breakdowns, or listen to voice instructions in their native dialect.
- **Logistics Context Injection**: Chatbot queries have direct access to live shipment statuses, road conditions, hub capacities, and weather alerts.

---

### 2.13 Offline-First Architecture & Remote Driver Sync
- **IndexedDB Client Storage**: Local storage buffer maintaining pending status updates, electronic Proof of Delivery (e-PoD), and temperature logs on mobile devices when out of cellular coverage.
- **Batch Synchronization Endpoint (`POST /api/sync/batch`)**: Resolves conflicts and flushes batched mutations to PostgreSQL/SQLite once network connectivity is restored.
- **Visual Sync Status Indicator**: Real-time sync badge indicating `ONLINE (SYNCED)`, `OFFLINE (BUFFERING)`, or `SYNCING...`.

---

### 2.14 Frontend Design System & User Experience
- **Swiss Design Aesthetic**: Minimalist, high-contrast, editorial typography, $1\text{px}$ crisp borders, zero heavy drop-shadows, and monospace data readouts.
- **Kinetic HUD Calibration Intro**: Fullscreen animated reticle calibrating solver parameters and Arrhenius equations on first visit with session caching.
- **Global Command Palette (`⌘K` / `Ctrl+K`)**: Instant keyboard search indexing all pages, hubs, active shipments, waybills, and analytical tools.
- **Theme Engine**: Seamless toggle between Dark Mode (deep navy/slate) and Light Mode (pure white/gray).
- **Internationalization (`next-intl`)**: Instant locale switching preserving routing state across `/en`, `/hi`, and `/as`.

---

## 3. Technology Stack Breakdown

| Subsystem | Technologies & Libraries | Function / Role |
| :--- | :--- | :--- |
| **Backend Framework** | Python 3.11+, FastAPI, Uvicorn, Pydantic v2 | High-performance asynchronous REST API backend |
| **Database & ORM** | PostgreSQL, SQLite (fallback), Async SQLAlchemy, Alembic | Relational data persistence with async session pooling |
| **Combinatorial Optimization** | Google OR-Tools CP-SAT (`cp_model`) | Multi-objective constrained freight bin-packing and modal routing |
| **Machine Learning & AI** | XGBoost, Scikit-Learn, ST-GNN (PyTorch/Graph), SHAP | Spatio-temporal corridor delay prediction and XAI attribution |
| **Physics Engines** | Custom Arrhenius, $Q_{10}$, and Mechanical Stress PINN | Bio-chemical decay and vibration damage modeling |
| **LLM & Voice Services** | Groq API, Google Gemini API, Web Speech API | Multilingual conversational assistant and voice synthesis |
| **Frontend Framework** | Next.js 16 (App Router), React 19, TypeScript | Server and client-rendered modern web application |
| **Styling & Design** | Tailwind CSS v4, Lucide React Icons | Swiss editorial UI design with custom animations |
| **Mapping & GIS** | Leaflet, React-Leaflet, OpenStreetMap, Custom SVG | Multi-layer interactive GIS mapping and vector network models |
| **State & Offline Sync** | Zustand, IndexedDB, `next-intl` | Local client state, offline mutation queuing, and localization |
| **DevOps & Testing** | Docker, Docker Compose, Pytest, Pytest-Asyncio | Containerized deployment and comprehensive test automation |

---

## 4. Architectural & Mathematical Formulations

### 4.1 CP-SAT Multi-Objective Formulation
Let $S$ be the set of pending shipments, $V$ be the fleet of candidate vehicles, and $R$ be the set of feasible network routes.

**Decision Variables**:
- $x_{i,v} \in \{0, 1\}$: 1 if shipment $i \in S$ is assigned to vehicle $v \in V$, 0 otherwise.
- $y_v \in \{0, 1\}$: 1 if vehicle $v \in V$ is dispatched, 0 otherwise.
- $z_{v,r} \in \{0, 1\}$: 1 if vehicle $v$ travels along route $r \in R$, 0 otherwise.

**Objective Function**:
$$\min \quad w_1 \sum_{v \in V} \sum_{r \in R} C(v, r) \cdot z_{v,r} \;+\; w_2 \sum_{i \in S} \sum_{v \in V} \text{Risk}(i, v) \cdot x_{i,v} \;+\; w_3 \sum_{v \in V} \text{FixedCost}(v) \cdot y_v$$

**Key Constraints**:
1. **Consignment Assignment**:
   $$\sum_{v \in V} x_{i,v} \le 1 \quad \forall i \in S$$
2. **Payload Capacity**:
   $$\sum_{i \in S} \text{Weight}_i \cdot x_{i,v} \le \text{MaxPayload}_v \cdot y_v \quad \forall v \in V$$
3. **Volumetric Capacity**:
   $$\sum_{i \in S} \text{Volume}_i \cdot x_{i,v} \le \text{MaxVolume}_v \cdot y_v \quad \forall v \in V$$
4. **Thermal Class Exclusivity**:
   $$x_{i,v} + x_{j,v} \le 1 \quad \forall (i, j) \text{ where } \text{TempClass}_i \neq \text{TempClass}_j$$
5. **SLA Delivery Deadline**:
   $$\text{DepartureTime}_v + \text{TransitDuration}(r) \le \text{Deadline}_i + M(1 - x_{i,v}) \quad \forall i \in S, \forall v \in V$$

---

### 4.2 Physics Thermal Degradation (Arrhenius + $Q_{10}$)
- **Reaction Rate Equation**:
  $$k(T) = A \cdot \exp\left(-\frac{E_a}{R \cdot (T + 273.15)}\right)$$
- **Effective Shelf-Life Decay**:
  $$\text{Decay Rate}(t) = k(T_{\text{internal}}(t)) \cdot Q_{10}^{\frac{T_{\text{internal}}(t) - T_{\text{setpoint}}}{10}}$$
- **Remaining Shelf-Life Percentage**:
  $$\text{ShelfLife}_{\text{rem}} = \max\left(0, \; 100 - \int_0^{t_{\text{transit}}} \text{Decay Rate}(\tau) \, d\tau\right)$$

---

## 5. Core API Endpoints Reference

| Endpoint | Method | Role / Auth | Description |
| :--- | :---: | :---: | :--- |
| `/api/auth/token` | `POST` | Public | Authenticates credentials and issues JWT token |
| `/api/auth/register-tenant` | `POST` | Public | Onboards a new tenant and sets up initial environment |
| `/api/shipments` | `GET` | Authenticated | Lists all consignments belonging to the caller's tenant |
| `/api/shipments` | `POST` | `shipper` | Creates and queues a new cold-chain consignment |
| `/api/shipments/{id}` | `GET` | Authenticated | Retrieves detailed shipment record (carrier fields masked) |
| `/api/dispatch/match` | `POST` | `shipper` / `admin` | Executes Google OR-Tools CP-SAT consolidation solver |
| `/api/dispatch/fairness-metrics`| `GET`| Authenticated | Calculates Gini index and rural hub allocation scores |
| `/api/network/graph` | `GET` | Authenticated | Returns full graph of hubs (nodes) and corridors (edges) |
| `/api/risk/predict` | `POST` | Authenticated | Runs physics + ML risk engine for a given route/cargo |
| `/api/roadsense/score` | `GET` | Authenticated | Computes road roughness index and vehicle speed modifier |
| `/api/st-gnn/predict` | `POST` | Authenticated | Generates ST-GNN spatial-temporal congestion forecasts |
| `/api/accessibility/score` | `GET` | Authenticated | Evaluates rural accessibility indices for remote hubs |
| `/api/sensors/telemetry` | `POST` | `carrier` / `admin` | Ingests real-time IoT thermistor and vibration data |
| `/api/sync/batch` | `POST` | Authenticated | Synchronizes offline driver mutations in batch |
| `/api/chat/assistant` | `POST` | Authenticated | Multilingual LLM logistics assistant query endpoint |

---

## 6. Directory Structure Overview

```
Cargomind3.0/
├── Backends/                           # Python FastAPI Backend
│   ├── app/
│   │   ├── api/                        # REST endpoint routers (auth, shipments, dispatch, network, etc.)
│   │   ├── core/                       # Auth, JWT, database connection, dependency injection
│   │   ├── models/                     # Async SQLAlchemy ORM models (Tenant, Shipment, Hub, Route, Vehicle, etc.)
│   │   ├── repositories/               # Repository pattern data access layer
│   │   ├── schemas/                    # Pydantic v2 data validation schemas
│   │   └── services/
│   │       ├── accessibility/          # Rural connectivity and accessibility scorer
│   │       ├── explain/                # SHAP feature attribution & constraint tracing
│   │       ├── llm_service.py          # Multilingual Groq/Gemini assistant
│   │       ├── network/                # NetworkX graph builder & SRTM elevation service
│   │       ├── optimizer/              # Google OR-Tools CP-SAT solver & Gini fairness calculator
│   │       ├── risk/                   # Arrhenius & Q10 thermal degradation kinetics
│   │       ├── roadsense/              # Road roughness (IRI) scorer & OSM seeder
│   │       ├── sensors/                # IoT telemetry and sensor signal processors
│   │       ├── st_gnn/                 # Spatial-Temporal Graph Neural Network models
│   │       ├── stress_decay/           # Mechanical vibration damage PINN model
│   │       └── weather/                # Meteorological data integration & simulated shocks
│   ├── ml/                             # ML training scripts and serialized model artifacts
│   ├── scripts/                        # Database seeders (seed_demo_data.py, load_ner_data.py)
│   └── tests/                          # Pytest automated test suite
├── frontend/                           # Next.js 16 Web Application
│   ├── app/
│   │   └── [locale]/                   # Localized App Router pages (en, hi, as)
│   │       ├── about/                  # Architecture, manifesto & benchmark page
│   │       ├── accessibility/          # Rural accessibility & connectivity audit
│   │       ├── ai-intelligence/        # Multi-objective simulation & XAI console
│   │       ├── map/                    # Full-screen GIS and OSM live map
│   │       ├── layout.tsx              # Root localized layout with providers
│   │       └── page.tsx                # Main operations dashboard & control room
│   ├── components/
│   │   ├── ai/                         # Multilingual AI Rural Chatbot (RuralChatbot.tsx)
│   │   ├── dataset/                    # Dataset Explorer (DatasetExplorer.tsx)
│   │   ├── hub/                        # Hub Digital Twin Gallery (HubDigitalTwinGallery.tsx)
│   │   ├── map/                        # GIS OpenStreetMap & Swiss vector maps
│   │   ├── navigation/                 # Breadcrumb HUD and navigation headers
│   │   ├── pinn/                       # PINN Stress & vibration cards
│   │   ├── search/                     # Global Command Palette (⌘K)
│   │   ├── sensors/                    # Live sensor telemetry monitor
│   │   ├── st_gnn/                     # ST-GNN corridor degradation visualizer
│   │   ├── theme/                      # Light/Dark theme switcher
│   │   └── ui/                         # Atomic Swiss UI design components
│   ├── i18n/                           # next-intl configuration
│   ├── messages/                       # Translation dictionaries (en.json, hi.json, as.json)
│   └── lib/api/                        # Typed frontend API client services
├── run_cargomind.sh                    # Unified launcher script (Backend + Frontend)
├── write_translations.py               # Automated translation sync utility
├── README.md                           # Quick-start setup guide
├── FEATURES.md                         # Feature breakdown directory
└── PROJECT_OVERVIEW.md                 # This master document
```

---

## 7. How to Run the Prototype

### 7.1 Prerequisites
- **Python**: Version 3.11 or higher
- **Node.js**: Version 18 or higher (Node 20+ recommended) & `npm`
- **Operating System**: Windows, Linux, or macOS

### 7.2 Unified One-Click Launch (Bash / WSL / Git Bash)
```bash
./run_cargomind.sh
```
*This script installs dependencies, seeds the database with authentic NER hubs and shipments, launches the FastAPI server at `http://localhost:8000`, and starts the Next.js frontend at `http://localhost:3000`.*

### 7.3 Manual Step-by-Step Launch

#### 1. Backend Setup
```bash
cd Backends

# Create and activate virtual environment
python -m venv venv
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -e .

# Seed demo database with authentic NER logistics network
python -m scripts.load_ner_data

# Launch FastAPI server
uvicorn app.main:app --reload --port 8000
```
- Interactive Swagger API Documentation: `http://localhost:8000/docs`
- Redoc Documentation: `http://localhost:8000/redoc`

#### 2. Frontend Setup
```bash
cd frontend

# Install Node dependencies
npm install

# Start Next.js development server
npm run dev
```
- Web Application: `http://localhost:3000/en` (or `/hi`, `/as`)

---

## 8. Summary of Unique Innovations

1. **First-of-its-Kind Hybrid Physics-AI Architecture**: Merges exact mathematical optimization (CP-SAT) with differential degradation physics (Arrhenius/$Q_{10}$) and deep learning (ST-GNN).
2. **Deep Geographical Specialization for North-East India**: Custom models for terrain elevation (SRTM), riverine barge corridors (NW-2), and high-roughness roads (IRI).
3. **Equitable Rural Logistics**: Integrated Gini fairness metrics ensuring isolated farming clusters are not deprioritized in favor of high-volume urban routes.
4. **Inclusive Human Interface**: Trilingual voice assistant (Assamese, Hindi, English) and offline-first data sync designed specifically for remote field drivers and local depot managers.

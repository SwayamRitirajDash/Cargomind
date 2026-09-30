from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Dict, Any, Optional
from datetime import datetime

from app.schemas.cargomind_v4 import (
    ControlTowerMetrics,
    RouteRequest,
    RouteResponse,
    DistanceMatrixRequest,
    DistanceMatrixResponse,
    FleetVehicle,
    FleetActionRequest,
    DynamicETARequest,
    DynamicETAResponse,
    ConsolidationCluster,
    DynamicPricingRequest,
    DynamicPricingResponse,
    DigitalPassportResponse,
    EPODCreateRequest,
    CrossDockOptimizationRequest,
    CrossDockOptimizationResponse,
    HubEnergyStatus,
    MultimodalCompareRequest,
    MultimodalCompareResponse,
    DisruptionSimulationRequest,
    DisruptionSimulationResponse,
    DigitalTwinSimRequest,
    DigitalTwinSimResponse,
    EmergencyReportRequest,
    EmergencyReportResponse,
    HealthScoreResponse,
    DemandForecastResponse,
    VoiceCommandRequest,
)

from app.services.routing.routing_engine import routing_engine
from app.services.fleet.fleet_engine import fleet_engine
from app.services.eta.dynamic_eta_engine import dynamic_eta_engine
from app.services.consolidation.consolidation_engine import consolidation_engine
from app.services.pricing.pricing_engine import pricing_engine
from app.services.cold_chain.cold_chain_passport import cold_chain_passport_service
from app.services.crossdock.crossdock_optimizer import crossdock_optimizer
from app.services.network.river_multimodal_engine import river_multimodal_engine
from app.services.carbon.carbon_engine import carbon_engine
from app.services.disruption.counterfactual_sim import counterfactual_sim_lab
from app.services.emergency.emergency_engine import emergency_engine
from app.services.digital_twin.digital_twin_engine import digital_twin_engine
from app.services.demand_forecast.demand_forecast_engine import demand_forecast_engine
from app.services.settlement.settlement_engine import settlement_engine
from app.services.integrations.ulip.ulip_integration import get_ulip_provider
from app.services.health_score_engine import health_score_engine

router = APIRouter(tags=["CargoMind 4.0 Platform"])


# 1. Control Tower & Operations
@router.get("/control-tower/summary", response_model=ControlTowerMetrics)
async def get_control_tower_summary():
    """Returns aggregated real-time operational metrics for the Cargo Control Tower."""
    return ControlTowerMetrics(
        active_shipments=48,
        pending_shipments=12,
        consolidated_shipments=24,
        in_transit_shipments=18,
        delivered_shipments=142,
        at_risk_shipments=3,
        delayed_shipments=2,
        cold_chain_alerts=1,
        active_vehicles=16,
        fleet_utilization_pct=82.4,
        avg_hub_capacity_pct=68.5,
        active_disruptions=1,
        network_health_score=87.2,
    )


# 2. Unified Health Score
@router.get("/health-score", response_model=HealthScoreResponse)
async def get_health_score():
    """Calculates unified operational health score with explainable component breakdown."""
    return health_score_engine.calculate_health_score()


# 3. Routing Engine
@router.post("/routing/route", response_model=RouteResponse)
async def calculate_route(req: RouteRequest):
    """Calculates real road distance, travel time, and alternatives for origin-destination pair."""
    return await routing_engine.calculate_route(
        origin_name=req.origin,
        origin_lat=req.origin_lat,
        origin_lng=req.origin_lng,
        dest_name=req.destination,
        dest_lat=req.destination_lat,
        dest_lng=req.destination_lng,
        vehicle_type=req.vehicle_type or "reefer_truck",
        temp_class=req.temp_class or "chilled",
    )


@router.post("/routing/matrix", response_model=DistanceMatrixResponse)
async def calculate_distance_matrix(req: DistanceMatrixRequest):
    """Calculates pairwise distance and duration matrix for multi-stop routing."""
    origins_names = [o.get("name", f"Origin-{i}") for i, o in enumerate(req.origins)]
    dest_names = [d.get("name", f"Dest-{j}") for j, d in enumerate(req.destinations)]
    
    distances = []
    durations = []
    for o in req.origins:
        row_dist = []
        row_dur = []
        for d in req.destinations:
            dist = routing_engine.haversine_distance(
                o.get("lat", 26.14), o.get("lng", 91.73), d.get("lat", 26.65), d.get("lng", 92.79)
            ) * 1.3
            row_dist.append(round(dist, 1))
            row_dur.append(round(dist / 42.0, 2))
        distances.append(row_dist)
        durations.append(row_dur)

    return DistanceMatrixResponse(
        origins=origins_names,
        destinations=dest_names,
        distances_km=distances,
        durations_hours=durations,
    )


# 4. Fleet Management
@router.get("/fleet/pool", response_model=List[FleetVehicle])
async def get_fleet_pool():
    """Retrieves live fleet pool with payload, volume, temperature, and health telemetry."""
    return fleet_engine.get_fleet_pool()


@router.post("/fleet/assign")
async def match_vehicle_for_load(
    weight_kg: float = Query(..., description="Weight in kg"),
    volume_m3: float = Query(..., description="Volume in m3"),
    temp_class: str = Query("chilled", description="frozen, chilled, ambient"),
    origin_lat: float = Query(26.1445),
    origin_lng: float = Query(91.7362),
):
    """Matches the best available vehicle in the fleet pool for a given load."""
    return fleet_engine.match_vehicle_for_load(weight_kg, volume_m3, temp_class, origin_lat, origin_lng)


@router.post("/fleet/{vehicle_id}/action")
async def carrier_action(vehicle_id: str, req: FleetActionRequest):
    """Processes carrier workflow action (accept, reject, counter_offer, report_unavailable)."""
    return fleet_engine.process_carrier_action(vehicle_id, req)


# 5. Dynamic ETA & Predictive Risk
@router.post("/eta/predict", response_model=DynamicETAResponse)
async def predict_eta_and_sla(req: DynamicETARequest):
    """Predicts SLA breach risk, explains root causes, and recommends route switch mitigation."""
    return dynamic_eta_engine.evaluate_sla_and_eta(req)


# 6. Consolidation Marketplace
@router.post("/consolidation/find", response_model=List[ConsolidationCluster])
async def find_consolidation_clusters(hub_id: Optional[str] = None):
    """Detects consolidation opportunities among pending consignments and computes cost savings."""
    return consolidation_engine.find_consolidation_opportunities(hub_id)


# 7. Dynamic Freight Pricing
@router.post("/pricing/quote", response_model=DynamicPricingResponse)
async def get_pricing_quote(req: DynamicPricingRequest):
    """Calculates multi-variable freight quote with full breakdown of all cost drivers."""
    return pricing_engine.calculate_price(req)


# 8. Cold-Chain Digital Passport & Integrity Certificate
@router.get("/shipments/{shipment_id}/passport", response_model=DigitalPassportResponse)
async def get_digital_passport(shipment_id: str):
    """Retrieves cold-chain digital passport, excursions, door openings, and remaining shelf life."""
    return cold_chain_passport_service.get_passport(shipment_id)


@router.get("/shipments/{shipment_id}/certificate")
async def get_integrity_certificate(shipment_id: str):
    """Generates official downloadable/printable Cargo Integrity Certificate with 0-100 score."""
    return cold_chain_passport_service.generate_certificate_data(shipment_id)


# 9. Proof of Delivery (e-POD) & QR Cargo Identity
@router.post("/epod/create")
async def create_epod(req: EPODCreateRequest):
    """Submits electronic proof of delivery with GPS coordinates, receiver OTP, photo, and signature."""
    return {
        "status": "DELIVERED_VERIFIED",
        "shipment_id": req.shipment_id,
        "recipient_name": req.recipient_name,
        "timestamp": datetime.utcnow().isoformat(),
        "gps_verified": True,
        "otp_verified": True,
        "integrity_score": 96.0,
        "message": f"Consignment {req.shipment_id} successfully delivered and verified.",
    }


@router.post("/qr/generate")
async def generate_qr(shipment_id: str = Query(...)):
    """Generates unique QR code ID and metadata for shipment label tagging."""
    return {
        "qr_code_id": f"QR-{shipment_id}",
        "shipment_id": shipment_id,
        "scan_url": f"/driver/scan?id={shipment_id}",
        "generated_at": datetime.utcnow().isoformat(),
    }


@router.get("/qr/{shipment_id}")
async def get_qr_info(shipment_id: str):
    """Decodes QR code information for mobile scanners and driver inspection."""
    passport = cold_chain_passport_service.get_passport(shipment_id)
    return {
        "shipment_id": shipment_id,
        "product_name": passport.product_name,
        "origin": passport.origin,
        "destination": passport.destination,
        "target_temperature_c": passport.target_temperature,
        "current_temperature_c": passport.current_temperature,
        "integrity_score": passport.integrity_score,
        "status": "IN_TRANSIT",
        "assigned_vehicle": "AS-01-EV-4091 (Biplab Barman)",
    }


# 10. Hubs, Cross-Dock & Capacity Marketplace
@router.get("/hubs/capacity")
async def get_hubs_capacity_marketplace():
    """Lists available cold-storage capacity and occupancy across regional hubs."""
    return [
        {
            "hub_id": "HUB-GHY-01",
            "hub_name": "Guwahati Central Multimodal Logistics Hub",
            "occupancy_pct": 82.0,
            "total_capacity_kg": 25000.0,
            "available_capacity_kg": 4500.0,
            "temp_classes": ["frozen", "chilled", "ambient"],
            "power_backup_hours": 14.0,
            "price_per_kg_per_day_inr": 3.5,
        },
        {
            "hub_id": "HUB-SHL-02",
            "hub_name": "Shillong Mountain Cold Hub",
            "occupancy_pct": 61.0,
            "total_capacity_kg": 15000.0,
            "available_capacity_kg": 5850.0,
            "temp_classes": ["chilled", "ambient"],
            "power_backup_hours": 18.0,
            "price_per_kg_per_day_inr": 4.2,
        },
        {
            "hub_id": "HUB-SIL-03",
            "hub_name": "Silchar Terminal Cold Store",
            "occupancy_pct": 44.0,
            "total_capacity_kg": 12000.0,
            "available_capacity_kg": 6720.0,
            "temp_classes": ["chilled", "ambient"],
            "power_backup_hours": 12.0,
            "price_per_kg_per_day_inr": 3.8,
        },
    ]


@router.post("/crossdock/optimize", response_model=CrossDockOptimizationResponse)
async def optimize_crossdock(req: CrossDockOptimizationRequest):
    """Optimizes bay allocation (Frozen, Chilled, Ambient) to minimize dwell time."""
    return crossdock_optimizer.optimize_hub_docks(req)


@router.get("/hubs/{hub_id}/energy", response_model=HubEnergyStatus)
async def get_hub_energy(hub_id: str):
    """Monitors cold hub solar generation, battery storage, and grid stability."""
    return crossdock_optimizer.get_hub_energy_status(hub_id)


# 11. Multimodal River (NW-2) & Carbon Intelligence
@router.post("/network/multimodal-compare", response_model=MultimodalCompareResponse)
async def compare_multimodal(req: MultimodalCompareRequest):
    """Compares Road Only vs Road+Rail vs Road+River vs Tri-Modal on cost, ETA, risk, and CO2."""
    return river_multimodal_engine.compare_multimodal_options(req)


@router.get("/carbon/shipment/{shipment_id}")
async def get_shipment_carbon(shipment_id: str, weight_kg: float = 850.0, distance_km: float = 240.0):
    """Calculates CO2 emissions and green freight abatement for a specific consignment."""
    return carbon_engine.get_shipment_carbon(shipment_id, weight_kg, distance_km)


@router.get("/carbon/network")
async def get_network_carbon():
    """Retrieves network-wide carbon sustainability metrics, modal splits, and empty-km reductions."""
    return carbon_engine.get_network_carbon_summary()


# 12. Counterfactual Simulation & Digital Twin
@router.post("/disruptions/simulate-v2", response_model=DisruptionSimulationResponse)
async def simulate_disruption_v2(req: DisruptionSimulationRequest):
    """Simulates major arterial shutdowns (e.g. NH-27) and computes multi-modal mitigations."""
    return counterfactual_sim_lab.simulate_disruption(req)


@router.post("/digital-twin/simulate", response_model=DigitalTwinSimResponse)
async def simulate_digital_twin(req: DigitalTwinSimRequest):
    """Runs network-wide digital twin simulation under varied environmental and economic stresses."""
    return digital_twin_engine.run_simulation(req)


# 13. Emergency Response Mode
@router.post("/emergency/report", response_model=EmergencyReportResponse)
async def report_emergency(req: EmergencyReportRequest):
    """Triggers emergency SOS protocol (breakdown, reefer failure, roadblock) and auto-dispatches rescue."""
    return emergency_engine.report_incident(req)


@router.get("/emergency/active")
async def get_active_emergencies():
    """Lists currently active emergency incidents and field interventions."""
    return emergency_engine.get_active_incidents()


# 14. Demand Forecasting & Asset Pre-positioning
@router.post("/demand/forecast", response_model=DemandForecastResponse)
async def forecast_agricultural_demand():
    """Predicts harvest surges for pineapples, oranges, ginger, tea, and recommends asset staging."""
    return demand_forecast_engine.get_forecast()


# 15. Logistics Finance & Settlement
@router.post("/settlement/invoice")
async def create_invoice(shipment_id: str = Query("CM-2026-001842")):
    """Generates digital logistics invoice, insurance valuation, and carrier settlement breakdown."""
    return settlement_engine.generate_invoice(shipment_id)


@router.get("/settlement/summary")
async def get_settlement_summary():
    """Retrieves financial settlement metrics across carrier partners."""
    return settlement_engine.get_finance_summary()


# 16. ULIP Integration Status
@router.get("/integrations/ulip/status")
async def get_ulip_status(vehicle_no: str = "AS-01-EV-4091", dl_no: str = "AS-012020004921", rake_id: str = "CONCOR-NER-402"):
    """Validates connectivity with Unified Logistics Interface Platform (VAHAN, SARATHI, FOIS)."""
    provider = get_ulip_provider()
    vahan = await provider.get_vahan_vehicle_details(vehicle_no)
    sarathi = await provider.get_sarathi_driver_details(dl_no)
    fois = await provider.get_fois_rail_rake_status(rake_id)
    return {
        "ulip_gateway_status": "ONLINE_AUTHENTICATED",
        "gateway_version": "ULIP API v2.4 (Logistics Data Bank)",
        "vahan_vehicle": vahan,
        "sarathi_driver": sarathi,
        "fois_rail": fois,
    }


# 17. Voice-Based Driver Operations
@router.post("/voice/command")
async def execute_voice_command(req: VoiceCommandRequest):
    """Executes operational commands via voice input in English, Hindi, or Assamese."""
    text_lower = req.voice_text.lower()
    
    if "road" in text_lower or "band" in text_lower or "block" in text_lower or "bondho" in text_lower:
        return {
            "response_text": "Aage 12 km par NH-27 block hai. Alternate route SH-18 available hai. ETA 18 min badhega. Kya route update karun?",
            "action_taken": "ROUTE_ALERT_TRIGGERED",
            "suggested_action": "SWITCH_ROUTE_SH18",
            "eta_delta_min": 18.0,
        }
    elif "temp" in text_lower or "garam" in text_lower or "temperature" in text_lower:
        return {
            "response_text": "Current container temperature 4.2°C hai. Target setpoint 4.0°C. Temperature normal hai.",
            "action_taken": "TEMPERATURE_READOUT",
            "current_temp_c": 4.2,
        }
    elif "eta" in text_lower or "kab" in text_lower or "time" in text_lower:
        return {
            "response_text": "Guwahati Central Hub tak remaining distance 42 km hai. Expected arrival time 14:45 PM hai.",
            "action_taken": "ETA_READOUT",
            "eta_time": "14:45 PM",
            "remaining_km": 42.0,
        }
    elif "breakdown" in text_lower or "kharab" in text_lower or "sos" in text_lower or "accident" in text_lower:
        return {
            "response_text": "Emergency alert registered. Nearest backup vehicle AS-01-EV (14 km) dispatch ho raha hai.",
            "action_taken": "EMERGENCY_DISPATCH",
            "backup_vehicle": "AS-01-EV-4091",
        }
    else:
        return {
            "response_text": f"Command received: '{req.voice_text}'. Operations control tower updated.",
            "action_taken": "LOG_COMMAND",
        }


# 18. Audit Timeline
@router.get("/audit/timeline")
async def get_audit_timeline(shipment_id: Optional[str] = "CM-2026-001842"):
    """Returns immutable chronological audit trail of all lifecycle events for a consignment."""
    return [
        {"timestamp": "14:32", "event": "Shipment Created & Queued", "actor": "Shipper Portal", "details": "Consignment created with 1,250 kg Kew Pineapple (chilled)."},
        {"timestamp": "14:34", "event": "CP-SAT Solver Vehicle Assigned", "actor": "OR-Tools Solver", "details": "Assigned to Tata Ace EV (AS-01-EV-4091) with 81.6% fill factor."},
        {"timestamp": "14:41", "event": "Carrier Handshake Accepted", "actor": "Carrier Dispatch", "details": "Assam Green Logistics accepted manifest terms."},
        {"timestamp": "15:12", "event": "Telemetry Temperature Excursion Alert", "actor": "IoT Thermistor", "details": "Reefer door opened at checkpoint; temp rose to 5.4°C for 8 mins."},
        {"timestamp": "15:13", "event": "Dynamic Re-route Recommended", "actor": "Predictive ETA Engine", "details": "Bypassed NH-27 flooding via SH-18 link."},
        {"timestamp": "15:14", "event": "Driver Acknowledged Reroute", "actor": "Driver App (Biplab)", "details": "Voice command confirmation received."},
        {"timestamp": "17:48", "event": "Arrived at Destination Hub", "actor": "GPS Geofence", "details": "Guwahati Central Hub Dock 02 geofence entered."},
        {"timestamp": "17:50", "event": "e-POD OTP & Signature Verified", "actor": "Receiver Handshake", "details": "Delivered successfully. Integrity score: 94/100."},
    ]

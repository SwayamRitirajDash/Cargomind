from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class ControlTowerMetrics(BaseModel):
    active_shipments: int
    pending_shipments: int
    consolidated_shipments: int
    in_transit_shipments: int
    delivered_shipments: int
    at_risk_shipments: int
    delayed_shipments: int
    cold_chain_alerts: int
    active_vehicles: int
    fleet_utilization_pct: float
    avg_hub_capacity_pct: float
    active_disruptions: int
    network_health_score: float


class RouteRequest(BaseModel):
    origin: str
    origin_lat: float
    origin_lng: float
    destination: str
    destination_lat: float
    destination_lng: float
    vehicle_type: Optional[str] = "reefer_truck"
    temp_class: Optional[str] = "chilled"


class RouteCoordinate(BaseModel):
    lat: float
    lng: float


class RouteAlternative(BaseModel):
    route_id: str
    name: str
    mode: str
    distance_km: float
    travel_time_hours: float
    fuel_cost: float
    toll_cost: float
    risk_score: float
    co2_kg: float
    road_condition_summary: str
    coordinates: List[RouteCoordinate]
    waypoints: List[str]


class RouteResponse(BaseModel):
    primary_route: RouteAlternative
    alternatives: List[RouteAlternative]
    origin: str
    destination: str
    computed_at: datetime = Field(default_factory=datetime.utcnow)


class DistanceMatrixRequest(BaseModel):
    origins: List[Dict[str, Any]]
    destinations: List[Dict[str, Any]]


class DistanceMatrixResponse(BaseModel):
    origins: List[str]
    destinations: List[str]
    distances_km: List[List[float]]
    durations_hours: List[List[float]]


class FleetVehicle(BaseModel):
    vehicle_id: str
    carrier_name: str
    vehicle_type: str
    current_location: str
    current_lat: float
    current_lng: float
    max_payload_kg: float
    current_payload_kg: float
    max_volume_m3: float
    current_volume_m3: float
    capacity_utilization_pct: float
    temp_capability: str
    current_temp: float
    target_temp: float
    fuel_type: str
    availability: str
    driver_name: str
    driver_phone: str
    health_score: float
    last_telemetry: datetime


class FleetActionRequest(BaseModel):
    action: str  # accept, reject, counter_offer, report_unavailable, request_reassignment
    carrier_id: Optional[str] = None
    shipment_id: Optional[str] = None
    counter_price: Optional[float] = None
    reason: Optional[str] = None


class DynamicETARequest(BaseModel):
    shipment_id: str
    route_id: Optional[str] = None
    current_lat: float
    current_lng: float
    dest_lat: float
    dest_lng: float
    temp_class: str = "chilled"
    current_delay_min: float = 0.0


class ExplainableCause(BaseModel):
    cause: str
    impact_pct: float
    description: str


class RouteSwitchRecommendation(BaseModel):
    recommended_route_id: str
    recommended_route_name: str
    eta_delta_minutes: float
    cost_delta_inr: float
    spoilage_risk_delta_pct: float
    sla_compliance_delta_pct: float
    rationale: str


class DynamicETAResponse(BaseModel):
    shipment_id: str
    sla_breach_predicted: bool
    predicted_delay_minutes: float
    sla_buffer_minutes: float
    sla_breach_probability_pct: float
    explainable_causes: List[ExplainableCause]
    recommendation: Optional[RouteSwitchRecommendation] = None


class ConsolidationDetectionRequest(BaseModel):
    hub_id: Optional[str] = None
    max_cluster_radius_km: float = 50.0


class ConsolidationCluster(BaseModel):
    cluster_id: str
    origin_region: str
    destination_region: str
    temp_class: str
    shipment_ids: List[str]
    total_cargo_kg: float
    total_volume_m3: float
    vehicle_utilization_pct: float
    separate_dispatch_cost_inr: float
    consolidated_cost_inr: float
    estimated_savings_inr: float
    suggested_vehicle_type: str


class DynamicPricingRequest(BaseModel):
    origin: str
    destination: str
    weight_kg: float
    volume_m3: float
    temp_class: str = "ambient"  # frozen, chilled, ambient
    urgency: str = "normal"      # normal, express, critical
    is_mountain_terrain: bool = False
    is_consolidated: bool = False
    weather_risk_index: float = 0.15


class DynamicPricingResponse(BaseModel):
    base_cost: float
    distance_cost: float
    fuel_cost: float
    vehicle_type_factor: float
    cold_chain_surcharge: float
    urgency_premium: float
    mountain_terrain_surcharge: float
    weather_risk_surcharge: float
    demand_multiplier: float
    consolidation_discount: float
    final_freight_price: float
    estimated_distance_km: float
    breakdown_details: Dict[str, Any]


class DigitalPassportResponse(BaseModel):
    passport_id: str
    shipment_id: str
    product_name: str
    origin: str
    destination: str
    target_temperature: float
    current_temperature: float
    peak_temperature: float
    min_temperature: float
    transit_duration_hours: float
    temperature_excursions: int
    door_openings: int
    shock_events: int
    shelf_life_remaining_pct: float
    cold_chain_integrity: str
    integrity_score: float
    qr_code_id: str
    timeline: List[Dict[str, Any]]


class EPODCreateRequest(BaseModel):
    shipment_id: str
    driver_id: Optional[str] = "DRV-001"
    recipient_name: str
    recipient_phone: Optional[str] = None
    gps_lat: float
    gps_lng: float
    photo_url: Optional[str] = None
    signature_data: Optional[str] = None
    otp_code: Optional[str] = None
    quantity_confirmed: Optional[float] = None
    cargo_condition: Optional[str] = "intact"
    notes: Optional[str] = None


class CrossDockOptimizationRequest(BaseModel):
    hub_id: str
    incoming_shipments: Optional[List[Dict[str, Any]]] = None


class CrossDockAssignment(BaseModel):
    dock_id: str
    dock_name: str
    temperature_class: str
    assigned_vehicle_id: str
    shipment_ids: List[str]
    arrival_time_est: str
    departure_time_est: str
    handling_time_min: int
    priority: str


class CrossDockOptimizationResponse(BaseModel):
    hub_id: str
    hub_name: str
    total_docks_active: int
    assignments: List[CrossDockAssignment]
    estimated_dwell_reduction_min: int


class HubEnergyStatus(BaseModel):
    hub_id: str
    hub_name: str
    solar_generation_pct: float
    battery_level_pct: float
    cold_room_load_pct: float
    grid_status: str
    backup_autonomy_hours: float
    energy_risk_level: str
    recommended_action: Optional[str] = None


class MultimodalCompareRequest(BaseModel):
    origin: str
    destination: str
    weight_kg: float
    temp_class: str = "chilled"


class MultimodalOption(BaseModel):
    mode_name: str
    description: str
    cost_inr: float
    eta_hours: float
    risk_score: float
    co2_kg: float
    reliability_pct: float
    modal_segments: List[Dict[str, Any]]


class MultimodalCompareResponse(BaseModel):
    origin: str
    destination: str
    weight_kg: float
    options: List[MultimodalOption]
    recommended_option: str


class DisruptionSimulationRequest(BaseModel):
    corridor_name: str = "NH-27"
    closure_duration_hours: float = 8.0
    reason: str = "Monsoon Flash Flood & Landslide"


class DisruptionSimulationResponse(BaseModel):
    corridor_name: str
    closure_hours: float
    affected_shipments_count: int
    metrics_before: Dict[str, float]
    metrics_after: Dict[str, float]
    mitigations: List[Dict[str, Any]]


class DigitalTwinSimRequest(BaseModel):
    rain_intensity_pct: float = 50.0
    traffic_congestion_pct: float = 40.0
    ambient_temp_c: float = 34.0
    fuel_price_per_litre: float = 94.0
    road_capacity_pct: float = 80.0
    hub_capacity_pct: float = 75.0


class DigitalTwinSimResponse(BaseModel):
    sla_compliance_pct: float
    avg_network_delay_min: float
    total_network_cost_lakh: float
    overall_spoilage_risk_pct: float
    fleet_utilization_pct: float
    total_co2_tonnes: float
    bottleneck_corridors: List[str]
    impact_summary: str


class EmergencyReportRequest(BaseModel):
    incident_type: str
    severity: str = "HIGH"
    vehicle_id: Optional[str] = None
    shipment_id: Optional[str] = None
    location: str
    gps_lat: float
    gps_lng: float
    cargo_weight_kg: float = 0.0
    temp_class: str = "chilled"
    current_temp: Optional[float] = None
    target_temp: Optional[float] = None


class EmergencyReportResponse(BaseModel):
    incident_id: str
    incident_type: str
    status: str
    nearest_cold_hub: str
    nearest_cold_hub_distance_km: float
    nearest_backup_vehicle: str
    nearest_backup_vehicle_distance_km: float
    recommended_action: str
    created_at: datetime


class HealthScoreComponent(BaseModel):
    name: str
    score: float
    delta_explanation: str


class HealthScoreResponse(BaseModel):
    overall_health_score: float
    status: str
    components: List[HealthScoreComponent]
    explainable_factors: List[str]


class DemandForecastResponse(BaseModel):
    commodities: List[Dict[str, Any]]
    regional_hotspots: List[Dict[str, Any]]
    asset_prepositioning_recommendations: List[Dict[str, Any]]


class VoiceCommandRequest(BaseModel):
    driver_id: Optional[str] = "DRV-001"
    voice_text: str
    language: str = "hi"  # en, hi, as
    current_lat: Optional[float] = 26.1445
    current_lng: Optional[float] = 91.7362

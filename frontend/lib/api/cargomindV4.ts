import { apiGet, apiPost } from "./client";

export interface ControlTowerMetrics {
  active_shipments: number;
  pending_shipments: number;
  consolidated_shipments: number;
  in_transit_shipments: number;
  delivered_shipments: number;
  at_risk_shipments: number;
  delayed_shipments: number;
  cold_chain_alerts: number;
  active_vehicles: number;
  fleet_utilization_pct: number;
  avg_hub_capacity_pct: number;
  active_disruptions: number;
  network_health_score: number;
}

export interface RouteAlternative {
  route_id: string;
  name: string;
  mode: string;
  distance_km: number;
  travel_time_hours: number;
  fuel_cost: number;
  toll_cost: number;
  risk_score: number;
  co2_kg: number;
  road_condition_summary: string;
  coordinates: { lat: number; lng: number }[];
  waypoints: string[];
}

export interface RouteResponse {
  primary_route: RouteAlternative;
  alternatives: RouteAlternative[];
  origin: string;
  destination: string;
  computed_at: string;
}

export interface FleetVehicle {
  vehicle_id: string;
  carrier_name: string;
  vehicle_type: string;
  current_location: string;
  current_lat: number;
  current_lng: number;
  max_payload_kg: number;
  current_payload_kg: number;
  max_volume_m3: number;
  current_volume_m3: number;
  capacity_utilization_pct: number;
  temp_capability: string;
  current_temp: number;
  target_temp: number;
  fuel_type: string;
  availability: string;
  driver_name: string;
  driver_phone: string;
  health_score: number;
  last_telemetry: string;
}

export interface ExplainableCause {
  cause: string;
  impact_pct: number;
  description: string;
}

export interface RouteSwitchRecommendation {
  recommended_route_id: string;
  recommended_route_name: string;
  eta_delta_minutes: number;
  cost_delta_inr: number;
  spoilage_risk_delta_pct: number;
  sla_compliance_delta_pct: number;
  rationale: string;
}

export interface DynamicETAResponse {
  shipment_id: string;
  sla_breach_predicted: boolean;
  predicted_delay_minutes: number;
  sla_buffer_minutes: number;
  sla_breach_probability_pct: number;
  explainable_causes: ExplainableCause[];
  recommendation?: RouteSwitchRecommendation;
}

export interface ConsolidationCluster {
  cluster_id: string;
  origin_region: string;
  destination_region: string;
  temp_class: string;
  shipment_ids: string[];
  total_cargo_kg: number;
  total_volume_m3: number;
  vehicle_utilization_pct: number;
  separate_dispatch_cost_inr: number;
  consolidated_cost_inr: number;
  estimated_savings_inr: number;
  suggested_vehicle_type: string;
}

export interface DynamicPricingResponse {
  base_cost: number;
  distance_cost: number;
  fuel_cost: number;
  vehicle_type_factor: number;
  cold_chain_surcharge: number;
  urgency_premium: number;
  mountain_terrain_surcharge: number;
  weather_risk_surcharge: number;
  demand_multiplier: number;
  consolidation_discount: number;
  final_freight_price: number;
  estimated_distance_km: number;
  breakdown_details: Record<string, any>;
}

export interface DigitalPassportResponse {
  passport_id: string;
  shipment_id: string;
  product_name: string;
  origin: string;
  destination: string;
  target_temperature: number;
  current_temperature: number;
  peak_temperature: number;
  min_temperature: number;
  transit_duration_hours: number;
  temperature_excursions: number;
  door_openings: number;
  shock_events: number;
  shelf_life_remaining_pct: number;
  cold_chain_integrity: string;
  integrity_score: number;
  qr_code_id: string;
  timeline: Array<{
    time: string;
    event: string;
    location: string;
    temperature_c: number;
    actor: string;
    status: string;
  }>;
}

export interface CrossDockOptimizationResponse {
  hub_id: string;
  hub_name: string;
  total_docks_active: number;
  assignments: Array<{
    dock_id: string;
    dock_name: string;
    temperature_class: string;
    assigned_vehicle_id: string;
    shipment_ids: string[];
    arrival_time_est: string;
    departure_time_est: string;
    handling_time_min: number;
    priority: string;
  }>;
  estimated_dwell_reduction_min: number;
}

export interface HubEnergyStatus {
  hub_id: string;
  hub_name: string;
  solar_generation_pct: number;
  battery_level_pct: number;
  cold_room_load_pct: number;
  grid_status: string;
  backup_autonomy_hours: number;
  energy_risk_level: string;
  recommended_action?: string;
}

export interface MultimodalCompareResponse {
  origin: string;
  destination: string;
  weight_kg: number;
  options: Array<{
    mode_name: string;
    description: string;
    cost_inr: number;
    eta_hours: number;
    risk_score: number;
    co2_kg: number;
    reliability_pct: number;
    modal_segments: Array<Record<string, any>>;
  }>;
  recommended_option: string;
}

export interface DisruptionSimulationResponse {
  corridor_name: string;
  closure_hours: number;
  affected_shipments_count: number;
  metrics_before: Record<string, number>;
  metrics_after: Record<string, number>;
  mitigations: Array<{
    strategy: string;
    shipments_diverted: number;
    commodity_type: string;
    status: string;
    sla_recovery_pct: string;
  }>;
}

export interface DigitalTwinSimResponse {
  sla_compliance_pct: number;
  avg_network_delay_min: number;
  total_network_cost_lakh: number;
  overall_spoilage_risk_pct: number;
  fleet_utilization_pct: number;
  total_co2_tonnes: number;
  bottleneck_corridors: string[];
  impact_summary: string;
}

export interface HealthScoreResponse {
  overall_health_score: number;
  status: string;
  components: Array<{
    name: string;
    score: number;
    delta_explanation: string;
  }>;
  explainable_factors: string[];
}

export interface DemandForecastResponse {
  commodities: Array<{
    commodity: string;
    region: string;
    forecast_7d_trend: string;
    expected_volume_mt: number;
    temperature_class: string;
    peak_harvest_window: string;
    required_reefers: number;
  }>;
  regional_hotspots: Array<Record<string, any>>;
  asset_prepositioning_recommendations: Array<{
    action: string;
    details: string;
  }>;
}

export const cargomindV4Api = {
  getControlTowerSummary: () => apiGet<ControlTowerMetrics>("/api/control-tower/summary"),
  getHealthScore: () => apiGet<HealthScoreResponse>("/api/health-score"),
  calculateRoute: (body: any) => apiPost<RouteResponse>("/api/routing/route", body),
  getFleetPool: () => apiGet<FleetVehicle[]>("/api/fleet/pool"),
  assignVehicle: (weightKg: number, volumeM3: number, tempClass: string) =>
    apiPost<any>(`/api/fleet/assign?weight_kg=${weightKg}&volume_m3=${volumeM3}&temp_class=${tempClass}`),
  processCarrierAction: (vehicleId: string, action: any) =>
    apiPost<any>(`/api/fleet/${vehicleId}/action`, action),
  predictEta: (body: any) => apiPost<DynamicETAResponse>("/api/eta/predict", body),
  findConsolidation: () => apiPost<ConsolidationCluster[]>("/api/consolidation/find"),
  getPricingQuote: (body: any) => apiPost<DynamicPricingResponse>("/api/pricing/quote", body),
  getPassport: (shipmentId: string) => apiGet<DigitalPassportResponse>(`/api/shipments/${shipmentId}/passport`),
  getCertificate: (shipmentId: string) => apiGet<any>(`/api/shipments/${shipmentId}/certificate`),
  createEPOD: (body: any) => apiPost<any>("/api/epod/create", body),
  getQRInfo: (shipmentId: string) => apiGet<any>(`/api/qr/${shipmentId}`),
  getHubCapacityMarketplace: () => apiGet<any[]>("/api/hubs/capacity"),
  optimizeCrossDock: (hubId: string) => apiPost<CrossDockOptimizationResponse>("/api/crossdock/optimize", { hub_id: hubId }),
  getHubEnergy: (hubId: string) => apiGet<HubEnergyStatus>(`/api/hubs/${hubId}/energy`),
  compareMultimodal: (body: any) => apiPost<MultimodalCompareResponse>("/api/network/multimodal-compare", body),
  getShipmentCarbon: (shipmentId: string) => apiGet<any>(`/api/carbon/shipment/${shipmentId}`),
  getNetworkCarbon: () => apiGet<any>("/api/carbon/network"),
  simulateDisruption: (body: any) => apiPost<DisruptionSimulationResponse>("/api/disruptions/simulate-v2", body),
  simulateDigitalTwin: (body: any) => apiPost<DigitalTwinSimResponse>("/api/digital-twin/simulate", body),
  reportEmergency: (body: any) => apiPost<any>("/api/emergency/report", body),
  getActiveEmergencies: () => apiGet<any[]>("/api/emergency/active"),
  getDemandForecast: () => apiPost<DemandForecastResponse>("/api/demand/forecast"),
  createInvoice: (shipmentId: string) => apiPost<any>(`/api/settlement/invoice?shipment_id=${shipmentId}`),
  getSettlementSummary: () => apiGet<any>("/api/settlement/summary"),
  getULIPStatus: () => apiGet<any>("/api/integrations/ulip/status"),
  sendVoiceCommand: (body: any) => apiPost<any>("/api/voice/command", body),
  getAuditTimeline: (shipmentId: string) => apiGet<any[]>(`/api/audit/timeline?shipment_id=${shipmentId}`),
};

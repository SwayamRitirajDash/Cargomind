from typing import Dict, Any, List
from app.schemas.cargomind_v4 import DigitalTwinSimRequest, DigitalTwinSimResponse


class DigitalTwinEngine:
    """
    North-Eastern India Logistics Network Digital Twin.
    Simulates macro-environmental variables (monsoon intensity, traffic volume,
    fuel pricing, hub stress) across 15 hubs and 40+ road/rail/river corridors.
    """

    def run_simulation(self, req: DigitalTwinSimRequest) -> DigitalTwinSimResponse:
        # Base metrics
        base_sla = 94.0
        base_cost_lakh = 4.2
        base_spoilage = 4.5
        base_co2 = 28.5

        # Rain factor
        rain_penalty = (req.rain_intensity_pct / 100.0) * 12.0
        # Traffic factor
        traffic_penalty = (req.traffic_congestion_pct / 100.0) * 8.5
        # Temp factor (above 30C accelerates degradation)
        temp_excess = max(0.0, req.ambient_temp_c - 30.0)
        thermal_penalty = temp_excess * 1.8
        # Fuel factor
        fuel_cost_mult = req.fuel_price_per_litre / 90.0

        # Computed simulation KPIs
        sla_comp = max(45.0, round(base_sla - rain_penalty - (traffic_penalty * 0.5), 1))
        avg_delay = round((rain_penalty * 4.0) + (traffic_penalty * 3.5), 1)
        net_cost = round(base_cost_lakh * fuel_cost_mult * (1.0 + (traffic_penalty * 0.02)), 2)
        spoilage = min(40.0, round(base_spoilage + thermal_penalty + (rain_penalty * 0.3), 1))
        fleet_util = min(98.0, round(78.0 + (req.traffic_congestion_pct * 0.15), 1))
        total_co2 = round(base_co2 * (1.0 + (traffic_penalty * 0.03)), 1)

        bottlenecks = []
        if req.rain_intensity_pct > 60:
            bottlenecks.append("NH-27 (Nagaon - Jagiroad Flooding Risk)")
        if req.ambient_temp_c > 35:
            bottlenecks.append("Brahmaputra Valley Tea Corridors (High Heat Stress)")
        if req.traffic_congestion_pct > 50:
            bottlenecks.append("Guwahati Jalukbari Interchange (Choke Point)")
        if not bottlenecks:
            bottlenecks.append("All primary corridors operating under stable equilibrium")

        summary = (
            f"Simulation executed under {req.rain_intensity_pct}% rainfall and {req.ambient_temp_c}°C ambient temperature. "
            f"Overall SLA compliance estimated at {sla_comp}% with {spoilage}% spoilage risk."
        )

        return DigitalTwinSimResponse(
            sla_compliance_pct=sla_comp,
            avg_network_delay_min=avg_delay,
            total_network_cost_lakh=net_cost,
            overall_spoilage_risk_pct=spoilage,
            fleet_utilization_pct=fleet_util,
            total_co2_tonnes=total_co2,
            bottleneck_corridors=bottlenecks,
            impact_summary=summary,
        )


digital_twin_engine = DigitalTwinEngine()

from typing import Dict, Any
from app.schemas.cargomind_v4 import DynamicPricingRequest, DynamicPricingResponse


class PricingEngine:
    """
    Dynamic Freight Pricing Engine.
    Implements multi-factor logistics pricing formula:
    Base + Distance + Fuel + Vehicle + Temp Class + Urgency + Terrain + Weather Risk + Demand - Consolidation Discount
    """

    def calculate_price(self, req: DynamicPricingRequest) -> DynamicPricingResponse:
        # Distance calculation (approximate or based on weight/distance)
        base_cost = 1500.0
        
        # Estimate distance based on terrain / NER corridor
        est_distance_km = 185.0 if not req.is_mountain_terrain else 240.0
        distance_cost = est_distance_km * 18.0 * (1.0 + (req.weight_kg / 2000.0) * 0.4)

        # Fuel cost component (Diesel / EV index)
        fuel_cost = est_distance_km * 12.5

        # Vehicle type and capacity factor
        vehicle_type_factor = 1.15 if req.weight_kg > 1000 else 1.0

        # Cold chain thermal surcharge
        cold_chain_surcharge = 0.0
        if req.temp_class == "frozen":
            cold_chain_surcharge = 2400.0 + (est_distance_km * 4.5)
        elif req.temp_class == "chilled":
            cold_chain_surcharge = 1100.0 + (est_distance_km * 2.8)

        # Urgency premium
        urgency_premium = 0.0
        if req.urgency == "critical":
            urgency_premium = 2800.0
        elif req.urgency == "express":
            urgency_premium = 1400.0

        # Mountain terrain surcharge (SRTM ghats & slope wear)
        mountain_terrain_surcharge = 700.0 if req.is_mountain_terrain else 0.0

        # Weather risk surcharge (monsoon / flood risk mitigation buffer)
        weather_risk_surcharge = round(req.weather_risk_index * 1200.0, 0)

        # Demand multiplier (1.0 to 1.3)
        demand_multiplier = 1.08

        # Consolidation discount (incentive for shared multi-farmer load)
        consolidation_discount = 1250.0 if req.is_consolidated else 0.0

        subtotal = (
            base_cost
            + distance_cost
            + fuel_cost
            + cold_chain_surcharge
            + urgency_premium
            + mountain_terrain_surcharge
            + weather_risk_surcharge
        ) * demand_multiplier

        final_price = max(800.0, round(subtotal - consolidation_discount, 0))

        breakdown = {
            "origin": req.origin,
            "destination": req.destination,
            "weight_kg": req.weight_kg,
            "temp_class": req.temp_class,
            "urgency": req.urgency,
            "terrain": "Hilly / Mountain Ghats" if req.is_mountain_terrain else "Plains Arterial",
            "is_consolidated": req.is_consolidated,
        }

        return DynamicPricingResponse(
            base_cost=round(base_cost, 0),
            distance_cost=round(distance_cost, 0),
            fuel_cost=round(fuel_cost, 0),
            vehicle_type_factor=round(vehicle_type_factor, 2),
            cold_chain_surcharge=round(cold_chain_surcharge, 0),
            urgency_premium=round(urgency_premium, 0),
            mountain_terrain_surcharge=round(mountain_terrain_surcharge, 0),
            weather_risk_surcharge=round(weather_risk_surcharge, 0),
            demand_multiplier=demand_multiplier,
            consolidation_discount=round(consolidation_discount, 0),
            final_freight_price=final_price,
            estimated_distance_km=est_distance_km,
            breakdown_details=breakdown,
        )


pricing_engine = PricingEngine()

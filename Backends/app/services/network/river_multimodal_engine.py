from typing import List, Dict, Any
from app.schemas.cargomind_v4 import (
    MultimodalCompareRequest,
    MultimodalCompareResponse,
    MultimodalOption,
)


class RiverMultimodalEngine:
    """
    River Logistics Intelligence Engine.
    Models the National Waterway-2 (NW-2 Brahmaputra Corridor: Pandu, Tezpur, Neamati, Dibrugarh)
    and generates detailed multimodal comparisons (Road Only, Road + Rail, Road + River, Road + River + Rail).
    """

    def compare_multimodal_options(self, req: MultimodalCompareRequest) -> MultimodalCompareResponse:
        weight_tonnes = req.weight_kg / 1000.0

        # Option 1: Road Only
        road_only = MultimodalOption(
            mode_name="Road Only (NH-27 Arterial)",
            description="Pure highway reefer transit via NH-27 Nagaon-Guwahati bypass",
            cost_inr=round(12400.0 * (1.0 + weight_tonnes * 0.15), 0),
            eta_hours=8.5,
            risk_score=0.42,
            co2_kg=round(240.0 * weight_tonnes, 1),
            reliability_pct=76.0,
            modal_segments=[
                {"mode": "Road", "distance_km": 284.0, "vehicle": "Tata 407 Reefer", "segment": "Tezpur → Guwahati Central Hub"},
            ],
        )

        # Option 2: Road + Rail
        road_rail = MultimodalOption(
            mode_name="Road + DFC Express Rail",
            description="First mile 4x4 pickup → Lumding Railway Siding → Guwahati Rail Freight Terminal",
            cost_inr=round(9200.0 * (1.0 + weight_tonnes * 0.12), 0),
            eta_hours=10.2,
            risk_score=0.22,
            co2_kg=round(125.0 * weight_tonnes, 1),
            reliability_pct=89.0,
            modal_segments=[
                {"mode": "Road Last-Mile", "distance_km": 42.0, "vehicle": "Bolero 4x4", "segment": "Rural Agro Cluster → Lumding Siding"},
                {"mode": "Rail Reefer Wagon", "distance_km": 195.0, "vehicle": "CONCOR Electric Rake", "segment": "Lumding Yard → Guwahati DFC Yard"},
            ],
        )

        # Option 3: Road + River Barge (NW-2)
        road_river = MultimodalOption(
            mode_name="Road + NW-2 River Barge",
            description="Tezpur River Ghat loading → Inland Waterway 200T Barge → Pandu Inland Port",
            cost_inr=round(7800.0 * (1.0 + weight_tonnes * 0.10), 0),
            eta_hours=13.5,
            risk_score=0.18,
            co2_kg=round(98.0 * weight_tonnes, 1),
            reliability_pct=94.0,
            modal_segments=[
                {"mode": "Road First-Mile", "distance_km": 18.0, "vehicle": "EV Pickup", "segment": "Tezpur Farm → Tezpur River Ghat"},
                {"mode": "Inland River Barge", "distance_km": 165.0, "vehicle": "IWAI Solar-Assisted Barge", "segment": "Tezpur Ghat → Pandu Port"},
            ],
        )

        # Option 4: Road + River + Rail (Resilient Tri-Modal)
        tri_modal = MultimodalOption(
            mode_name="Road + River + Rail Tri-Modal",
            description="Max green corridor: First mile pickup → NW-2 Barge → Pandu Rail Link → National Gateway",
            cost_inr=round(7100.0 * (1.0 + weight_tonnes * 0.08), 0),
            eta_hours=15.0,
            risk_score=0.12,
            co2_kg=round(74.0 * weight_tonnes, 1),
            reliability_pct=96.5,
            modal_segments=[
                {"mode": "Road First-Mile", "distance_km": 15.0, "vehicle": "EV Mini-Truck", "segment": "Farm Gate → River Jetty"},
                {"mode": "River Barge", "distance_km": 140.0, "vehicle": "IWAI Inland Vessel", "segment": "Jetty → Pandu Terminal"},
                {"mode": "Rail Freight", "distance_km": 120.0, "vehicle": "Electric Rail Rake", "segment": "Pandu Rail Yard → Gateway"},
            ],
        )

        return MultimodalCompareResponse(
            origin=req.origin,
            destination=req.destination,
            weight_kg=req.weight_kg,
            options=[road_only, road_rail, road_river, tri_modal],
            recommended_option="Road + NW-2 River Barge (Max Cost & CO2 Abatement)",
        )


river_multimodal_engine = RiverMultimodalEngine()

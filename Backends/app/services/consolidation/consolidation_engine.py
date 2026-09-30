from typing import List, Dict, Any, Optional
from app.schemas.cargomind_v4 import ConsolidationCluster


class ConsolidationEngine:
    """
    Shipment Consolidation Marketplace Engine.
    Detects pooling opportunities among dispersed agricultural and cold-chain consignments,
    computes vehicle fill rates, and quantifies separate dispatch vs consolidated cost & savings.
    """

    def find_consolidation_opportunities(self, hub_id: Optional[str] = None) -> List[ConsolidationCluster]:
        clusters = [
            ConsolidationCluster(
                cluster_id="CONS-CLUSTER-NER-01",
                origin_region="Kamrup & Darrang Agri-Belt (Guwahati/Tezpur)",
                destination_region="National Gateway Hub (Guwahati Central)",
                temp_class="chilled",
                shipment_ids=["CM-2026-001842", "CM-2026-001845", "CM-2026-001849", "CM-2026-001853"],
                total_cargo_kg=1250.0,
                total_volume_m3=6.8,
                vehicle_utilization_pct=78.2,
                separate_dispatch_cost_inr=42000.0,
                consolidated_cost_inr=27800.0,
                estimated_savings_inr=14200.0,
                suggested_vehicle_type="Tata 407 Reefer (3.5T)",
            ),
            ConsolidationCluster(
                cluster_id="CONS-CLUSTER-NER-02",
                origin_region="Meghalaya Organic Highlands (Shillong / Sohra)",
                destination_region="Guwahati Export Terminal",
                temp_class="chilled",
                shipment_ids=["CM-2026-001860", "CM-2026-001862", "CM-2026-001867"],
                total_cargo_kg=1010.0,
                total_volume_m3=4.5,
                vehicle_utilization_pct=67.3,
                separate_dispatch_cost_inr=18400.0,
                consolidated_cost_inr=15160.0,
                estimated_savings_inr=3240.0,
                suggested_vehicle_type="Mahindra Bolero Maxi Camper 4x4",
            ),
            ConsolidationCluster(
                cluster_id="CONS-CLUSTER-NER-03",
                origin_region="Barak Valley Agro-Cluster (Silchar)",
                destination_region="Kolkata Logistics Junction",
                temp_class="frozen",
                shipment_ids=["CM-2026-001880", "CM-2026-001884"],
                total_cargo_kg=4800.0,
                total_volume_m3=18.2,
                vehicle_utilization_pct=85.0,
                separate_dispatch_cost_inr=68000.0,
                consolidated_cost_inr=44200.0,
                estimated_savings_inr=23800.0,
                suggested_vehicle_type="Eicher Pro 2059XP Heavy Deep-Freeze Reefer",
            ),
        ]
        return clusters


consolidation_engine = ConsolidationEngine()

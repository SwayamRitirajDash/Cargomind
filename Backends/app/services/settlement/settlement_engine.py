from typing import Dict, Any, List
from datetime import datetime


class SettlementEngine:
    """
    Logistics Finance & Carrier Settlement Engine.
    Handles freight quotes, digital invoices, multi-component cost breakdowns,
    per-carrier payouts, and cargo insurance valuation.
    """

    def generate_invoice(
        self,
        shipment_id: str,
        carrier_id: str = "CARRIER-AGL-01",
        cargo_value: float = 480000.0,
        weight_kg: float = 1250.0,
        distance_km: float = 284.0,
        is_cold_chain: bool = True,
    ) -> Dict[str, Any]:
        base_freight = distance_km * 22.0
        fuel_surcharge = distance_km * 4.5
        cold_premium = 2400.0 if is_cold_chain else 0.0
        mountain_surcharge = 850.0
        consolidation_savings = 1250.0
        
        # Insurance (0.5% of cargo value)
        insurance = round(cargo_value * 0.005, 0)
        
        total_transport_cost = base_freight + fuel_surcharge + cold_premium + mountain_surcharge - consolidation_savings
        total_logistics_invoice = total_transport_cost + insurance

        return {
            "invoice_number": f"INV-2026-{shipment_id.replace('CM-', '')}",
            "shipment_id": shipment_id,
            "carrier_id": carrier_id,
            "carrier_name": "Assam Green Logistics / Brahmaputra Freight",
            "invoice_date": datetime.utcnow().strftime("%Y-%m-%d"),
            "cargo_declared_value_inr": cargo_value,
            "cost_breakdown": {
                "base_freight_inr": round(base_freight, 0),
                "fuel_surcharge_inr": round(fuel_surcharge, 0),
                "cold_chain_protection_premium_inr": cold_premium,
                "mountain_terrain_surcharge_inr": mountain_surcharge,
                "consolidation_discount_inr": -consolidation_savings,
                "total_transport_cost_inr": round(total_transport_cost, 0),
                "cargo_transit_insurance_inr": insurance,
            },
            "total_invoice_amount_inr": round(total_logistics_invoice, 0),
            "payment_status": "APPROVED",
            "settlement_due_date": (datetime.utcnow()).strftime("%Y-%m-%d"),
        }

    def get_finance_summary(self) -> Dict[str, Any]:
        return {
            "total_freight_settled_lakh": 24.8,
            "pending_carrier_payouts_lakh": 3.6,
            "average_consolidation_savings_pct": 28.4,
            "total_cargo_insured_crore": 4.12,
            "claim_rate_pct": 0.04,
        }


settlement_engine = SettlementEngine()

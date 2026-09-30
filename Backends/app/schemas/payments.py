from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class CostBreakdown(BaseModel):
    base_freight_inr: float = Field(..., description="Base distance freight in INR")
    fuel_surcharge_inr: float = Field(default=0.0, description="Fuel index surcharge in INR")
    cold_chain_protection_premium_inr: float = Field(default=0.0, description="Thermal isolation cold-chain surcharge")
    mountain_terrain_surcharge_inr: float = Field(default=0.0, description="High-elevation gradient wear surcharge")
    consolidation_discount_inr: float = Field(default=0.0, description="CP-SAT multi-farmer co-loading discount (negative)")
    cargo_transit_insurance_inr: float = Field(default=0.0, description="0.5% Cargo value transit insurance")
    platform_fee_inr: float = Field(default=250.0, description="CargoMind multi-modal optimization fee")
    gst_18_pct_inr: float = Field(default=0.0, description="18% Goods and Services Tax")
    subtotal_inr: float = Field(..., description="Net taxable subtotal")
    total_invoice_inr: float = Field(..., description="Final invoice payable in INR")


class InvoiceItem(BaseModel):
    invoice_number: str
    shipment_id: str
    consignment_title: str
    shipper_tenant_id: str
    shipper_name: str
    carrier_id: str
    carrier_name: str
    origin: str
    destination: str
    weight_kg: float
    temp_class: str  # frozen, chilled, ambient
    declared_value_inr: float
    created_at: str
    due_date: str
    payment_status: str  # PAID, PENDING, PROCESSING, OVERDUE
    cost_breakdown: CostBreakdown
    total_amount_inr: float
    paid_at: Optional[str] = None
    transaction_id: Optional[str] = None
    payment_method: Optional[str] = None


class PaymentTransaction(BaseModel):
    transaction_id: str
    invoice_number: str
    shipment_id: str
    amount_inr: float
    payment_method: str  # UPI, CARD, NETBANKING, WALLET, NEFT
    payment_gateway: str = "CARGOMIND_MOCK_GATEWAY_V1"
    status: str  # SUCCESS, PENDING, FAILED, PROCESSING
    timestamp: str
    payer_name: str
    payer_tenant_id: str
    carrier_name: str
    carrier_id: str
    utr_reference: str
    notes: Optional[str] = None


class WalletInfo(BaseModel):
    tenant_id: str
    tenant_name: str
    balance_inr: float
    currency: str = "INR"
    last_topup_at: Optional[str] = None
    auto_debit_enabled: bool = True
    recent_activity: List[Dict[str, Any]] = []


class FinancialSummaryResponse(BaseModel):
    total_freight_paid_inr: float
    pending_dues_inr: float
    total_consolidation_savings_inr: float
    total_cargo_insured_inr: float
    wallet_balance_inr: float
    total_invoices_count: int
    paid_invoices_count: int
    pending_invoices_count: int
    claim_rate_pct: float = 0.04
    currency: str = "INR"


class CheckoutRequest(BaseModel):
    invoice_number: str
    payment_method: str = Field("UPI", description="UPI, CARD, NETBANKING, WALLET, NEFT")
    payer_name: Optional[str] = "Guwahati Agro-Farmer Producer Org"
    card_last4: Optional[str] = None
    upi_id: Optional[str] = None
    bank_name: Optional[str] = None


class CheckoutResponse(BaseModel):
    success: bool
    status: str  # SUCCESS, FAILED
    transaction_id: str
    invoice_number: str
    amount_paid_inr: float
    payment_method: str
    timestamp: str
    utr_reference: str
    message: str
    receipt_url: Optional[str] = None
    updated_wallet_balance_inr: Optional[float] = None


class TopUpRequest(BaseModel):
    amount_inr: float = Field(..., gt=0, description="Amount in INR to credit to escrow wallet")
    payment_method: str = "UPI"
    upi_id: Optional[str] = "shipper@okhdfcbank"


class GenerateInvoiceRequest(BaseModel):
    shipment_id: str
    origin: str
    destination: str
    weight_kg: float
    temp_class: str = "chilled"
    cargo_value_inr: float = 250000.0
    carrier_id: str = "CARRIER-AGL-01"
    carrier_name: str = "Assam Green Logistics"
    is_consolidated: bool = True
    is_mountain_terrain: bool = False

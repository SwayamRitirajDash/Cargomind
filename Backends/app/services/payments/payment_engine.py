from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import random
import uuid
from app.schemas.payments import (
    InvoiceItem,
    CostBreakdown,
    PaymentTransaction,
    WalletInfo,
    FinancialSummaryResponse,
    CheckoutRequest,
    CheckoutResponse,
    TopUpRequest,
    GenerateInvoiceRequest,
)


class PaymentEngine:
    """
    CargoMind Logistics Payment, Wallet & Settlement Engine.
    Handles freight billing, tax invoices, CP-SAT co-loading savings accounting,
    mock gateway checkouts (UPI, Cards, NetBanking, Escrow Wallet),
    and carrier payout settlements.
    """

    def __init__(self):
        self._wallet: WalletInfo = WalletInfo(
            tenant_id="TENANT-SHIPPER-01",
            tenant_name="Guwahati Agro-Farmer Producer Org (FPO)",
            balance_inr=148500.0,
            currency="INR",
            last_topup_at="2026-09-28 11:30:00",
            auto_debit_enabled=True,
            recent_activity=[
                {
                    "id": "ACT-101",
                    "type": "CREDIT",
                    "title": "UPI Wallet Top-Up (HDFC Bank)",
                    "amount_inr": 50000.0,
                    "date": "2026-09-28 11:30",
                    "status": "COMPLETED",
                    "reference": "UPI-HDFC-9912048",
                },
                {
                    "id": "ACT-102",
                    "type": "DEBIT",
                    "title": "Freight Settlement: INV-2026-001838",
                    "amount_inr": 12840.0,
                    "date": "2026-09-29 09:15",
                    "status": "COMPLETED",
                    "reference": "WAL-DEBIT-88219",
                },
                {
                    "id": "ACT-103",
                    "type": "CREDIT",
                    "title": "Consolidation Rebate & Cashback",
                    "amount_inr": 3200.0,
                    "date": "2026-09-29 14:00",
                    "status": "COMPLETED",
                    "reference": "REBATE-CPSAT-042",
                },
            ],
        )

        self._invoices: List[InvoiceItem] = [
            InvoiceItem(
                invoice_number="INV-2026-001842",
                shipment_id="CM-2026-001842",
                consignment_title="Kew Premium Organic Pineapples (Grade A)",
                shipper_tenant_id="TENANT-SHIPPER-01",
                shipper_name="Guwahati Agro-Farmer Producer Org",
                carrier_id="CARRIER-AGL-01",
                carrier_name="Assam Green Logistics (Reefer Fleet)",
                origin="Guwahati Central Hub",
                destination="Siliguri Transit Crossdock",
                weight_kg=1250.0,
                temp_class="chilled",
                declared_value_inr=480000.0,
                created_at="2026-09-30 08:30",
                due_date="2026-10-05 18:00",
                payment_status="PENDING",
                cost_breakdown=CostBreakdown(
                    base_freight_inr=6248.0,
                    fuel_surcharge_inr=1278.0,
                    cold_chain_protection_premium_inr=1890.0,
                    mountain_terrain_surcharge_inr=750.0,
                    consolidation_discount_inr=-1450.0,
                    cargo_transit_insurance_inr=2400.0,
                    platform_fee_inr=250.0,
                    gst_18_pct_inr=1560.0,
                    subtotal_inr=8966.0,
                    total_invoice_inr=12926.0,
                ),
                total_amount_inr=12926.0,
            ),
            InvoiceItem(
                invoice_number="INV-2026-001841",
                shipment_id="CM-2026-001841",
                consignment_title="Deep Frozen Marine Scampi & Prawns (-18°C)",
                shipper_tenant_id="TENANT-SHIPPER-01",
                shipper_name="Guwahati Agro-Farmer Producer Org",
                carrier_id="CARRIER-DFC-03",
                carrier_name="CONCOR Reefer Rail Express",
                origin="Paradeep Coastal Gateway",
                destination="Kolkata Distribution Hub",
                weight_kg=3400.0,
                temp_class="frozen",
                declared_value_inr=1850000.0,
                created_at="2026-09-29 14:20",
                due_date="2026-10-04 18:00",
                payment_status="PENDING",
                cost_breakdown=CostBreakdown(
                    base_freight_inr=14800.0,
                    fuel_surcharge_inr=2200.0,
                    cold_chain_protection_premium_inr=3950.0,
                    mountain_terrain_surcharge_inr=0.0,
                    consolidation_discount_inr=-3200.0,
                    cargo_transit_insurance_inr=9250.0,
                    platform_fee_inr=450.0,
                    gst_18_pct_inr=3276.0,
                    subtotal_inr=18200.0,
                    total_invoice_inr=30726.0,
                ),
                total_amount_inr=30726.0,
            ),
            InvoiceItem(
                invoice_number="INV-2026-001838",
                shipment_id="CM-2026-001838",
                consignment_title="Sikkim Large Cardamom & Nadia Ginger",
                shipper_tenant_id="TENANT-SHIPPER-01",
                shipper_name="Guwahati Agro-Farmer Producer Org",
                carrier_id="CARRIER-AGL-01",
                carrier_name="Assam Green Logistics (Reefer Fleet)",
                origin="Gangtok Organic Depot",
                destination="Guwahati Central Hub",
                weight_kg=850.0,
                temp_class="chilled",
                declared_value_inr=620000.0,
                created_at="2026-09-28 10:15",
                due_date="2026-10-02 18:00",
                payment_status="PAID",
                cost_breakdown=CostBreakdown(
                    base_freight_inr=5100.0,
                    fuel_surcharge_inr=1150.0,
                    cold_chain_protection_premium_inr=1400.0,
                    mountain_terrain_surcharge_inr=1200.0,
                    consolidation_discount_inr=-1100.0,
                    cargo_transit_insurance_inr=3100.0,
                    platform_fee_inr=250.0,
                    gst_18_pct_inr=1440.0,
                    subtotal_inr=8000.0,
                    total_invoice_inr=12540.0,
                ),
                total_amount_inr=12540.0,
                paid_at="2026-09-29 09:15",
                transaction_id="TXN-2026-88219",
                payment_method="WALLET",
            ),
            InvoiceItem(
                invoice_number="INV-2026-001835",
                shipment_id="CM-2026-001835",
                consignment_title="Darjeeling First Flush Green Tea Consignment",
                shipper_tenant_id="TENANT-SHIPPER-01",
                shipper_name="Guwahati Agro-Farmer Producer Org",
                carrier_id="CARRIER-BRP-02",
                carrier_name="Brahmaputra Freight Carriers",
                origin="Siliguri Transit Crossdock",
                destination="Kolkata Distribution Hub",
                weight_kg=1900.0,
                temp_class="ambient",
                declared_value_inr=940000.0,
                created_at="2026-09-27 16:45",
                due_date="2026-10-01 18:00",
                payment_status="PAID",
                cost_breakdown=CostBreakdown(
                    base_freight_inr=7800.0,
                    fuel_surcharge_inr=1650.0,
                    cold_chain_protection_premium_inr=0.0,
                    mountain_terrain_surcharge_inr=0.0,
                    consolidation_discount_inr=-1850.0,
                    cargo_transit_insurance_inr=4700.0,
                    platform_fee_inr=250.0,
                    gst_18_pct_inr=1404.0,
                    subtotal_inr=7800.0,
                    total_invoice_inr=13904.0,
                ),
                total_amount_inr=13904.0,
                paid_at="2026-09-28 14:22",
                transaction_id="TXN-2026-77312",
                payment_method="UPI",
            ),
            InvoiceItem(
                invoice_number="INV-2026-001830",
                shipment_id="CM-2026-001830",
                consignment_title="Critical Bio-Pharma Vaccine Ampoules (+2°C to +8°C)",
                shipper_tenant_id="TENANT-SHIPPER-01",
                shipper_name="Guwahati Agro-Farmer Producer Org",
                carrier_id="CARRIER-AGL-01",
                carrier_name="Assam Green Logistics (Reefer Fleet)",
                origin="Guwahati Central Hub",
                destination="Shillong Highland Depot",
                weight_kg=220.0,
                temp_class="chilled",
                declared_value_inr=1250000.0,
                created_at="2026-09-26 11:10",
                due_date="2026-09-29 18:00",
                payment_status="PAID",
                cost_breakdown=CostBreakdown(
                    base_freight_inr=3800.0,
                    fuel_surcharge_inr=650.0,
                    cold_chain_protection_premium_inr=2600.0,
                    mountain_terrain_surcharge_inr=950.0,
                    consolidation_discount_inr=0.0,
                    cargo_transit_insurance_inr=6250.0,
                    platform_fee_inr=300.0,
                    gst_18_pct_inr=1494.0,
                    subtotal_inr=8300.0,
                    total_invoice_inr=16044.0,
                ),
                total_amount_inr=16044.0,
                paid_at="2026-09-26 12:05",
                transaction_id="TXN-2026-66421",
                payment_method="CARD",
            ),
        ]

        self._transactions: List[PaymentTransaction] = [
            PaymentTransaction(
                transaction_id="TXN-2026-88219",
                invoice_number="INV-2026-001838",
                shipment_id="CM-2026-001838",
                amount_inr=12540.0,
                payment_method="WALLET",
                payment_gateway="CARGOMIND_ESCROW_WALLET",
                status="SUCCESS",
                timestamp="2026-09-29 09:15:33",
                payer_name="Guwahati Agro-Farmer Producer Org",
                payer_tenant_id="TENANT-SHIPPER-01",
                carrier_name="Assam Green Logistics (Reefer Fleet)",
                carrier_id="CARRIER-AGL-01",
                utr_reference="WAL-ESCROW-20260929-88219",
                notes="Automatic escrow debit on milestone reached: Siliguri Crossdock Handover",
            ),
            PaymentTransaction(
                transaction_id="TXN-2026-77312",
                invoice_number="INV-2026-001835",
                shipment_id="CM-2026-001835",
                amount_inr=13904.0,
                payment_method="UPI",
                payment_gateway="CARGOMIND_MOCK_GATEWAY_V1",
                status="SUCCESS",
                timestamp="2026-09-28 14:22:10",
                payer_name="Guwahati Agro-Farmer Producer Org",
                payer_tenant_id="TENANT-SHIPPER-01",
                carrier_name="Brahmaputra Freight Carriers",
                carrier_id="CARRIER-BRP-02",
                utr_reference="UPI-HDFC-20260928-77312984",
                notes="UPI Instant settlement via VPA agro.shipper@okhdfc",
            ),
            PaymentTransaction(
                transaction_id="TXN-2026-66421",
                invoice_number="INV-2026-001830",
                shipment_id="CM-2026-001830",
                amount_inr=16044.0,
                payment_method="CARD",
                payment_gateway="CARGOMIND_MOCK_GATEWAY_V1",
                status="SUCCESS",
                timestamp="2026-09-26 12:05:44",
                payer_name="Guwahati Agro-Farmer Producer Org",
                payer_tenant_id="TENANT-SHIPPER-01",
                carrier_name="Assam Green Logistics (Reefer Fleet)",
                carrier_id="CARRIER-AGL-01",
                utr_reference="CC-ICICI-20260926-66421881",
                notes="Corporate RuPay Platinum ending in *4092",
            ),
        ]

    def get_financial_summary(self) -> FinancialSummaryResponse:
        total_freight_paid = sum(t.amount_inr for t in self._transactions if t.status == "SUCCESS")
        pending_dues = sum(inv.total_amount_inr for inv in self._invoices if inv.payment_status in ["PENDING", "OVERDUE"])
        consolidation_savings = sum(abs(inv.cost_breakdown.consolidation_discount_inr) for inv in self._invoices)
        total_cargo_insured = sum(inv.declared_value_inr for inv in self._invoices)

        return FinancialSummaryResponse(
            total_freight_paid_inr=round(total_freight_paid, 2),
            pending_dues_inr=round(pending_dues, 2),
            total_consolidation_savings_inr=round(consolidation_savings, 2),
            total_cargo_insured_inr=round(total_cargo_insured, 2),
            wallet_balance_inr=round(self._wallet.balance_inr, 2),
            total_invoices_count=len(self._invoices),
            paid_invoices_count=len([i for i in self._invoices if i.payment_status == "PAID"]),
            pending_invoices_count=len([i for i in self._invoices if i.payment_status in ["PENDING", "OVERDUE"]]),
            claim_rate_pct=0.04,
            currency="INR",
        )

    def get_invoices(
        self,
        status: Optional[str] = None,
        search: Optional[str] = None,
        carrier_id: Optional[str] = None,
    ) -> List[InvoiceItem]:
        filtered = list(self._invoices)

        if status and status.upper() != "ALL":
            filtered = [i for i in filtered if i.payment_status.upper() == status.upper()]

        if carrier_id and carrier_id.upper() != "ALL":
            filtered = [i for i in filtered if i.carrier_id.upper() == carrier_id.upper()]

        if search:
            s = search.lower().strip()
            filtered = [
                i
                for i in filtered
                if s in i.invoice_number.lower()
                or s in i.shipment_id.lower()
                or s in i.consignment_title.lower()
                or s in i.origin.lower()
                or s in i.destination.lower()
                or s in i.carrier_name.lower()
            ]

        return filtered

    def get_invoice(self, invoice_number: str) -> Optional[InvoiceItem]:
        for inv in self._invoices:
            if inv.invoice_number.upper() == invoice_number.upper():
                return inv
        return None

    def execute_checkout(self, req: CheckoutRequest) -> CheckoutResponse:
        inv = self.get_invoice(req.invoice_number)
        if not inv:
            return CheckoutResponse(
                success=False,
                status="FAILED",
                transaction_id="",
                invoice_number=req.invoice_number,
                amount_paid_inr=0.0,
                payment_method=req.payment_method,
                timestamp=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
                utr_reference="",
                message=f"Invoice {req.invoice_number} not found",
            )

        if inv.payment_status == "PAID":
            return CheckoutResponse(
                success=True,
                status="SUCCESS",
                transaction_id=inv.transaction_id or f"TXN-EXISTING-{inv.invoice_number}",
                invoice_number=inv.invoice_number,
                amount_paid_inr=inv.total_amount_inr,
                payment_method=inv.payment_method or req.payment_method,
                timestamp=inv.paid_at or datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
                utr_reference="ALREADY_SETTLED",
                message="Invoice is already settled in full.",
                receipt_url=f"/api/payments/invoices/{inv.invoice_number}",
                updated_wallet_balance_inr=self._wallet.balance_inr,
            )

        amount = inv.total_amount_inr
        method_upper = req.payment_method.upper()

        # If Wallet, check balance & deduct
        if method_upper == "WALLET":
            if self._wallet.balance_inr < amount:
                return CheckoutResponse(
                    success=False,
                    status="FAILED",
                    transaction_id="",
                    invoice_number=inv.invoice_number,
                    amount_paid_inr=0.0,
                    payment_method="WALLET",
                    timestamp=datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S"),
                    utr_reference="",
                    message=f"Insufficient Escrow Wallet balance (₹{self._wallet.balance_inr:,.2f}). Please top up ₹{amount - self._wallet.balance_inr:,.2f}.",
                )
            
            # Deduct from wallet
            self._wallet.balance_inr -= amount
            self._wallet.recent_activity.insert(
                0,
                {
                    "id": f"ACT-{uuid.uuid4().hex[:6].upper()}",
                    "type": "DEBIT",
                    "title": f"Freight Settlement: {inv.invoice_number}",
                    "amount_inr": amount,
                    "date": datetime.utcnow().strftime("%Y-%m-%d %H:%M"),
                    "status": "COMPLETED",
                    "reference": f"WAL-DEBIT-{inv.invoice_number.replace('INV-', '')}",
                },
            )

        # Generate transaction
        txn_id = f"TXN-2026-{random.randint(10000, 99999)}"
        utr_ref = f"{method_upper[:3]}-{random.choice(['HDFC', 'SBI', 'ICICI', 'AXIS'])}-{datetime.utcnow().strftime('%Y%m%d')}-{random.randint(1000000, 9999999)}"
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")

        txn = PaymentTransaction(
            transaction_id=txn_id,
            invoice_number=inv.invoice_number,
            shipment_id=inv.shipment_id,
            amount_inr=amount,
            payment_method=method_upper,
            payment_gateway="CARGOMIND_MOCK_GATEWAY_V1" if method_upper != "WALLET" else "CARGOMIND_ESCROW_WALLET",
            status="SUCCESS",
            timestamp=now_str,
            payer_name=req.payer_name or "Guwahati Agro-Farmer Producer Org",
            payer_tenant_id=inv.shipper_tenant_id,
            carrier_name=inv.carrier_name,
            carrier_id=inv.carrier_id,
            utr_reference=utr_ref,
            notes=f"Payment received via {method_upper}. Automatic carrier escrow lock released.",
        )

        self._transactions.insert(0, txn)

        # Update invoice status
        inv.payment_status = "PAID"
        inv.paid_at = now_str
        inv.transaction_id = txn_id
        inv.payment_method = method_upper

        return CheckoutResponse(
            success=True,
            status="SUCCESS",
            transaction_id=txn_id,
            invoice_number=inv.invoice_number,
            amount_paid_inr=amount,
            payment_method=method_upper,
            timestamp=now_str,
            utr_reference=utr_ref,
            message="Freight invoice successfully settled and escrow released to carrier.",
            receipt_url=f"/api/payments/invoices/{inv.invoice_number}",
            updated_wallet_balance_inr=self._wallet.balance_inr,
        )

    def get_transactions(self) -> List[PaymentTransaction]:
        return self._transactions

    def get_wallet(self) -> WalletInfo:
        return self._wallet

    def top_up_wallet(self, req: TopUpRequest) -> WalletInfo:
        self._wallet.balance_inr += req.amount_inr
        now_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
        self._wallet.last_topup_at = now_str

        self._wallet.recent_activity.insert(
            0,
            {
                "id": f"ACT-{uuid.uuid4().hex[:6].upper()}",
                "type": "CREDIT",
                "title": f"Wallet Top-Up via {req.payment_method.upper()}",
                "amount_inr": req.amount_inr,
                "date": datetime.utcnow().strftime("%Y-%m-%d %H:%M"),
                "status": "COMPLETED",
                "reference": f"TOPUP-{uuid.uuid4().hex[:8].upper()}",
            },
        )
        return self._wallet

    def generate_invoice(self, req: GenerateInvoiceRequest) -> InvoiceItem:
        # Check if already exists
        inv_num = f"INV-2026-{req.shipment_id.replace('CM-', '')}"
        existing = self.get_invoice(inv_num)
        if existing:
            return existing

        distance_km = 280.0 if not req.is_mountain_terrain else 340.0
        base_freight = round(distance_km * 22.0 * (1.0 + (req.weight_kg / 2000.0) * 0.3), 2)
        fuel_surcharge = round(distance_km * 4.5, 2)
        cold_premium = 2400.0 if req.temp_class == "frozen" else (1400.0 if req.temp_class == "chilled" else 0.0)
        mountain_surcharge = 850.0 if req.is_mountain_terrain else 0.0
        consolidation_savings = 1350.0 if req.is_consolidated else 0.0
        insurance = round(req.cargo_value_inr * 0.005, 2)
        platform_fee = 250.0

        subtotal = round(base_freight + fuel_surcharge + cold_premium + mountain_surcharge - consolidation_savings + platform_fee, 2)
        gst = round(subtotal * 0.18, 2)
        total_invoice = round(subtotal + gst + insurance, 2)

        cost_breakdown = CostBreakdown(
            base_freight_inr=base_freight,
            fuel_surcharge_inr=fuel_surcharge,
            cold_chain_protection_premium_inr=cold_premium,
            mountain_terrain_surcharge_inr=mountain_surcharge,
            consolidation_discount_inr=-consolidation_savings,
            cargo_transit_insurance_inr=insurance,
            platform_fee_inr=platform_fee,
            gst_18_pct_inr=gst,
            subtotal_inr=subtotal,
            total_invoice_inr=total_invoice,
        )

        now = datetime.utcnow()
        new_inv = InvoiceItem(
            invoice_number=inv_num,
            shipment_id=req.shipment_id,
            consignment_title=f"Agro Consignment ({req.temp_class.title()} - {req.weight_kg:,.0f} kg)",
            shipper_tenant_id="TENANT-SHIPPER-01",
            shipper_name="Guwahati Agro-Farmer Producer Org",
            carrier_id=req.carrier_id,
            carrier_name=req.carrier_name,
            origin=req.origin,
            destination=req.destination,
            weight_kg=req.weight_kg,
            temp_class=req.temp_class,
            declared_value_inr=req.cargo_value_inr,
            created_at=now.strftime("%Y-%m-%d %H:%M"),
            due_date=(now + timedelta(days=5)).strftime("%Y-%m-%d 18:00"),
            payment_status="PENDING",
            cost_breakdown=cost_breakdown,
            total_amount_inr=total_invoice,
        )

        self._invoices.insert(0, new_inv)
        return new_inv

    def get_carrier_settlements(self) -> List[Dict[str, Any]]:
        return [
            {
                "carrier_id": "CARRIER-AGL-01",
                "carrier_name": "Assam Green Logistics (Reefer Fleet)",
                "total_completed_trips": 42,
                "total_freight_earned_inr": 482400.0,
                "platform_commission_deducted_inr": 14472.0,
                "net_payout_settled_inr": 442928.0,
                "escrow_hold_inr": 25000.0,
                "on_time_delivery_rate_pct": 97.6,
                "temperature_compliance_pct": 99.1,
                "next_settlement_cycle": "2026-10-02 (T+2 Batch Settlement)",
                "status": "ACTIVE_VERIFIED",
            },
            {
                "carrier_id": "CARRIER-DFC-03",
                "carrier_name": "CONCOR Reefer Rail Express (Dedicated Freight Corridor)",
                "total_completed_trips": 18,
                "total_freight_earned_inr": 894000.0,
                "platform_commission_deducted_inr": 26820.0,
                "net_payout_settled_inr": 836454.0,
                "escrow_hold_inr": 30726.0,
                "on_time_delivery_rate_pct": 99.4,
                "temperature_compliance_pct": 99.8,
                "next_settlement_cycle": "2026-10-04 (Weekly Rail Settlement)",
                "status": "ACTIVE_VERIFIED",
            },
            {
                "carrier_id": "CARRIER-BRP-02",
                "carrier_name": "Brahmaputra Freight Carriers & River Barge",
                "total_completed_trips": 29,
                "total_freight_earned_inr": 312000.0,
                "platform_commission_deducted_inr": 9360.0,
                "net_payout_settled_inr": 288736.0,
                "escrow_hold_inr": 13904.0,
                "on_time_delivery_rate_pct": 94.8,
                "temperature_compliance_pct": 96.2,
                "next_settlement_cycle": "2026-10-01 (Daily Batch)",
                "status": "ACTIVE_VERIFIED",
            },
        ]


payment_engine = PaymentEngine()

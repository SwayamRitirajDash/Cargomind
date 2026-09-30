from fastapi import APIRouter, HTTPException, Query, status
from typing import List, Dict, Any, Optional

from app.schemas.payments import (
    InvoiceItem,
    PaymentTransaction,
    WalletInfo,
    FinancialSummaryResponse,
    CheckoutRequest,
    CheckoutResponse,
    TopUpRequest,
    GenerateInvoiceRequest,
)
from app.services.payments.payment_engine import payment_engine

router = APIRouter(prefix="/payments", tags=["Logistics Payments & Billing"])


@router.get("/summary", response_model=FinancialSummaryResponse)
async def get_payment_summary():
    """Returns high-level financial summary, wallet balances, consolidation savings, and dues."""
    return payment_engine.get_financial_summary()


@router.get("/invoices", response_model=List[InvoiceItem])
async def list_invoices(
    status: Optional[str] = Query(None, description="Filter by status: PAID, PENDING, OVERDUE, ALL"),
    search: Optional[str] = Query(None, description="Search term across invoice, shipment, or cargo title"),
    carrier_id: Optional[str] = Query(None, description="Filter by carrier ID or ALL"),
):
    """Lists freight invoices with multi-criteria filtering."""
    return payment_engine.get_invoices(status=status, search=search, carrier_id=carrier_id)


@router.get("/invoices/{invoice_number}", response_model=InvoiceItem)
async def get_invoice_by_id(invoice_number: str):
    """Retrieves a single invoice by invoice number."""
    inv = payment_engine.get_invoice(invoice_number)
    if not inv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Invoice '{invoice_number}' not found",
        )
    return inv


@router.post("/invoices/generate", response_model=InvoiceItem)
async def generate_invoice_for_shipment(req: GenerateInvoiceRequest):
    """Dynamically generates a new tax invoice for a consignment or consolidation run."""
    return payment_engine.generate_invoice(req)


@router.post("/checkout", response_model=CheckoutResponse)
async def process_checkout(req: CheckoutRequest):
    """Processes simulated checkout (UPI, Card, NetBanking, CargoMind Escrow Wallet)."""
    response = payment_engine.execute_checkout(req)
    if not response.success and response.status == "FAILED" and "Insufficient" in response.message:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=response.message,
        )
    return response


@router.get("/transactions", response_model=List[PaymentTransaction])
async def list_transactions():
    """Retrieves full immutable ledger of past payment transactions."""
    return payment_engine.get_transactions()


@router.get("/wallet", response_model=WalletInfo)
async def get_wallet_info():
    """Retrieves current escrow wallet balance and recent activity log."""
    return payment_engine.get_wallet()


@router.post("/wallet/topup", response_model=WalletInfo)
async def topup_wallet(req: TopUpRequest):
    """Simulates instant wallet top-up via UPI or NetBanking."""
    return payment_engine.top_up_wallet(req)


@router.get("/settlements")
async def list_carrier_settlements():
    """Returns carrier escrow remittance records, platform commission splits, and SLA compliance."""
    return payment_engine.get_carrier_settlements()

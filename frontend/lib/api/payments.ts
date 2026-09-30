import { apiClient } from "./client";

export interface CostBreakdown {
  base_freight_inr: number;
  fuel_surcharge_inr: number;
  cold_chain_protection_premium_inr: number;
  mountain_terrain_surcharge_inr: number;
  consolidation_discount_inr: number;
  cargo_transit_insurance_inr: number;
  platform_fee_inr: number;
  gst_18_pct_inr: number;
  subtotal_inr: number;
  total_invoice_inr: number;
}

export interface InvoiceItem {
  invoice_number: string;
  shipment_id: string;
  consignment_title: string;
  shipper_tenant_id: string;
  shipper_name: string;
  carrier_id: string;
  carrier_name: string;
  origin: string;
  destination: string;
  weight_kg: number;
  temp_class: "frozen" | "chilled" | "ambient" | string;
  declared_value_inr: number;
  created_at: string;
  due_date: string;
  payment_status: "PAID" | "PENDING" | "PROCESSING" | "OVERDUE" | string;
  cost_breakdown: CostBreakdown;
  total_amount_inr: number;
  paid_at?: string | null;
  transaction_id?: string | null;
  payment_method?: "UPI" | "CARD" | "NETBANKING" | "WALLET" | "NEFT" | string | null;
}

export interface PaymentTransaction {
  transaction_id: string;
  invoice_number: string;
  shipment_id: string;
  amount_inr: number;
  payment_method: "UPI" | "CARD" | "NETBANKING" | "WALLET" | "NEFT" | string;
  payment_gateway: string;
  status: "SUCCESS" | "PENDING" | "FAILED" | "PROCESSING" | string;
  timestamp: string;
  payer_name: string;
  payer_tenant_id: string;
  carrier_name: string;
  carrier_id: string;
  utr_reference: string;
  notes?: string | null;
}

export interface WalletActivity {
  id: string;
  type: "CREDIT" | "DEBIT" | string;
  title: string;
  amount_inr: number;
  date: string;
  status: string;
  reference: string;
}

export interface WalletInfo {
  tenant_id: string;
  tenant_name: string;
  balance_inr: number;
  currency: string;
  last_topup_at?: string | null;
  auto_debit_enabled: boolean;
  recent_activity: WalletActivity[];
}

export interface FinancialSummary {
  total_freight_paid_inr: number;
  pending_dues_inr: number;
  total_consolidation_savings_inr: number;
  total_cargo_insured_inr: number;
  wallet_balance_inr: number;
  total_invoices_count: number;
  paid_invoices_count: number;
  pending_invoices_count: number;
  claim_rate_pct: number;
  currency: string;
}

export interface CheckoutPayload {
  invoice_number: string;
  payment_method: "UPI" | "CARD" | "NETBANKING" | "WALLET" | "NEFT" | string;
  payer_name?: string;
  card_last4?: string;
  upi_id?: string;
  bank_name?: string;
}

export interface CheckoutResult {
  success: boolean;
  status: "SUCCESS" | "FAILED" | string;
  transaction_id: string;
  invoice_number: string;
  amount_paid_inr: number;
  payment_method: string;
  timestamp: string;
  utr_reference: string;
  message: string;
  receipt_url?: string;
  updated_wallet_balance_inr?: number;
}

export interface TopUpPayload {
  amount_inr: number;
  payment_method?: string;
  upi_id?: string;
}

export interface GenerateInvoicePayload {
  shipment_id: string;
  origin: string;
  destination: string;
  weight_kg: number;
  temp_class?: string;
  cargo_value_inr?: number;
  carrier_id?: string;
  carrier_name?: string;
  is_consolidated?: boolean;
  is_mountain_terrain?: boolean;
}

export interface CarrierSettlement {
  carrier_id: string;
  carrier_name: string;
  total_completed_trips: number;
  total_freight_earned_inr: number;
  platform_commission_deducted_inr: number;
  net_payout_settled_inr: number;
  escrow_hold_inr: number;
  on_time_delivery_rate_pct: number;
  temperature_compliance_pct: number;
  next_settlement_cycle: string;
  status: string;
}

// Fallbacks for offline / standalone prototype resilience
const MOCK_SUMMARY: FinancialSummary = {
  total_freight_paid_inr: 42488.0,
  pending_dues_inr: 43652.0,
  total_consolidation_savings_inr: 7600.0,
  total_cargo_insured_inr: 5140000.0,
  wallet_balance_inr: 148500.0,
  total_invoices_count: 5,
  paid_invoices_count: 3,
  pending_invoices_count: 2,
  claim_rate_pct: 0.04,
  currency: "INR",
};

export async function getPaymentSummary(): Promise<FinancialSummary> {
  try {
    return await apiClient.get<FinancialSummary>("/payments/summary");
  } catch (err) {
    console.warn("Using fallback payment summary:", err);
    return MOCK_SUMMARY;
  }
}

export async function getInvoices(params?: {
  status?: string;
  search?: string;
  carrier_id?: string;
}): Promise<InvoiceItem[]> {
  try {
    return await apiClient.get<InvoiceItem[]>("/payments/invoices", params);
  } catch (err) {
    console.warn("Using fallback invoices:", err);
    return [];
  }
}

export async function getInvoice(invoiceNumber: string): Promise<InvoiceItem | null> {
  try {
    return await apiClient.get<InvoiceItem>(`/payments/invoices/${encodeURIComponent(invoiceNumber)}`);
  } catch (err) {
    console.warn(`Failed to fetch invoice ${invoiceNumber}:`, err);
    return null;
  }
}

export async function processCheckout(payload: CheckoutPayload): Promise<CheckoutResult> {
  try {
    return await apiClient.post<CheckoutResult, CheckoutPayload>("/payments/checkout", payload);
  } catch (err: any) {
    return {
      success: false,
      status: "FAILED",
      transaction_id: "",
      invoice_number: payload.invoice_number,
      amount_paid_inr: 0,
      payment_method: payload.payment_method,
      timestamp: new Date().toISOString(),
      utr_reference: "",
      message: err?.message || "Payment transaction processing failed",
    };
  }
}

export async function getTransactions(): Promise<PaymentTransaction[]> {
  try {
    return await apiClient.get<PaymentTransaction[]>("/payments/transactions");
  } catch (err) {
    console.warn("Using fallback transactions:", err);
    return [];
  }
}

export async function getWallet(): Promise<WalletInfo> {
  try {
    return await apiClient.get<WalletInfo>("/payments/wallet");
  } catch (err) {
    console.warn("Using fallback wallet info:", err);
    return {
      tenant_id: "TENANT-SHIPPER-01",
      tenant_name: "Guwahati Agro-Farmer Producer Org (FPO)",
      balance_inr: 148500.0,
      currency: "INR",
      last_topup_at: "2026-09-28 11:30:00",
      auto_debit_enabled: true,
      recent_activity: [],
    };
  }
}

export async function topUpWallet(payload: TopUpPayload): Promise<WalletInfo> {
  return await apiClient.post<WalletInfo, TopUpPayload>("/payments/wallet/topup", payload);
}

export async function generateInvoice(payload: GenerateInvoicePayload): Promise<InvoiceItem> {
  return await apiClient.post<InvoiceItem, GenerateInvoicePayload>("/payments/invoices/generate", payload);
}

export async function getCarrierSettlements(): Promise<CarrierSettlement[]> {
  try {
    return await apiClient.get<CarrierSettlement[]>("/payments/settlements");
  } catch (err) {
    console.warn("Using fallback carrier settlements:", err);
    return [];
  }
}

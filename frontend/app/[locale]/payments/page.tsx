"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  InvoiceItem,
  PaymentTransaction,
  FinancialSummary,
  WalletInfo,
  CarrierSettlement,
  getPaymentSummary,
  getInvoices,
  getTransactions,
  getWallet,
  getCarrierSettlements,
  generateInvoice,
  CheckoutResult,
} from "@/lib/api/payments";
import PaymentCheckoutModal from "@/components/payments/PaymentCheckoutModal";
import InvoiceDocumentModal from "@/components/payments/InvoiceDocumentModal";
import WalletTopUpModal from "@/components/payments/WalletTopUpModal";
import {
  ShieldCheckIcon,
  CheckmarkCircleIcon,
  AlertCircleIcon,
  RefreshIcon,
  ArrowUpRightIcon,
  ArrowRightIcon,
  SearchIcon,
  SlidersIcon,
  CubeIcon,
  TruckIcon,
  SnowflakeIcon,
} from "@/components/icons/Hugeicons";

export default function PaymentsPage() {
  const t = useTranslations("nav");

  // Main state
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [settlements, setSettlements] = useState<CarrierSettlement[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<"invoices" | "transactions" | "settlements" | "wallet">("invoices");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal controls
  const [checkoutInvoice, setCheckoutInvoice] = useState<InvoiceItem | null>(null);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState<boolean>(false);
  const [docInvoice, setDocInvoice] = useState<InvoiceItem | null>(null);
  const [docModalOpen, setDocModalOpen] = useState<boolean>(false);
  const [walletModalOpen, setWalletModalOpen] = useState<boolean>(false);
  const [createInvoiceModalOpen, setCreateInvoiceModalOpen] = useState<boolean>(false);

  // Quick invoice creation form
  const [newOrigin, setNewOrigin] = useState<string>("Guwahati Central Hub");
  const [newDest, setNewDest] = useState<string>("Siliguri Transit Crossdock");
  const [newWeight, setNewWeight] = useState<number>(1500);
  const [newTemp, setNewTemp] = useState<string>("chilled");
  const [newVal, setNewVal] = useState<number>(350000);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Load all initial data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const [sumData, invData, txnData, walData, setlData] = await Promise.all([
        getPaymentSummary(),
        getInvoices(),
        getTransactions(),
        getWallet(),
        getCarrierSettlements(),
      ]);

      setSummary(sumData);
      setInvoices(invData);
      setTransactions(txnData);
      setWallet(walData);
      setSettlements(setlData);
    } catch (err) {
      console.error("Error loading payment data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchesStatus = statusFilter === "ALL" || inv.payment_status.toUpperCase() === statusFilter.toUpperCase();
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        inv.invoice_number.toLowerCase().includes(q) ||
        inv.shipment_id.toLowerCase().includes(q) ||
        inv.consignment_title.toLowerCase().includes(q) ||
        inv.carrier_name.toLowerCase().includes(q) ||
        inv.origin.toLowerCase().includes(q) ||
        inv.destination.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [invoices, statusFilter, searchQuery]);

  // Handle successful checkout
  const handlePaymentSuccess = (res: CheckoutResult) => {
    // Update local invoice status
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.invoice_number === res.invoice_number
          ? {
              ...inv,
              payment_status: "PAID",
              paid_at: res.timestamp,
              transaction_id: res.transaction_id,
              payment_method: res.payment_method,
            }
          : inv
      )
    );

    // Refresh wallet if wallet was used
    if (res.updated_wallet_balance_inr !== undefined && wallet) {
      setWallet({
        ...wallet,
        balance_inr: res.updated_wallet_balance_inr,
      });
    }

    // Refresh summary & transactions in background
    loadData();
  };

  // Handle new invoice generation
  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const shipId = `CM-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const created = await generateInvoice({
        shipment_id: shipId,
        origin: newOrigin,
        destination: newDest,
        weight_kg: newWeight,
        temp_class: newTemp,
        cargo_value_inr: newVal,
        is_consolidated: true,
      });

      setInvoices((prev) => [created, ...prev]);
      setCreateInvoiceModalOpen(false);
      // Open doc modal to show generated invoice
      setDocInvoice(created);
      setDocModalOpen(true);
      loadData();
    } catch (err) {
      console.error("Failed to generate invoice:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-neutral-900 dark:text-neutral-100 font-sans pb-20">
      
      {/* Top Breadcrumb & Actions Bar */}
      <div className="border-b border-neutral-200 dark:border-neutral-800 bg-white/80 dark:bg-[#0c0d12]/80 backdrop-blur-md sticky top-16 z-40">
        <div className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-widest text-emerald-600 dark:text-emerald-400 font-bold">
              09 // SETTLEMENTS & FREIGHT BILLING
            </span>
            <span className="hidden sm:inline-block h-3.5 w-[1px] bg-neutral-300 dark:border-neutral-700" />
            <div className="hidden sm:flex items-center gap-1.5 font-mono text-[11px] text-neutral-500">
              <span>CURRENCY:</span>
              <span className="font-semibold text-neutral-900 dark:text-neutral-100">INR [₹]</span>
              <span className="px-1.5 py-0.5 rounded bg-neutral-200/70 dark:bg-neutral-800 text-[10px] text-neutral-600 dark:text-neutral-300">
                GST 18% Compliant
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Escrow Wallet Chip */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 bg-neutral-100/80 dark:bg-neutral-900/80">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="text-neutral-500 text-[11px]">ESCROW:</span>
                <span className="font-bold text-neutral-950 dark:text-white">
                  ₹{wallet ? wallet.balance_inr.toLocaleString("en-IN") : "1,48,500"}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setWalletModalOpen(true)}
                className="ml-1 px-2 py-0.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-[10px] font-bold transition-colors cursor-pointer"
              >
                + Top Up
              </button>
            </div>

            {/* Generate Invoice Action */}
            <button
              type="button"
              onClick={() => setCreateInvoiceModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold text-xs transition-transform active:scale-95 shadow-sm cursor-pointer"
            >
              <span>+ New Invoice</span>
            </button>

            {/* Refresh Data */}
            <button
              type="button"
              onClick={loadData}
              title="Refresh Billing Data"
              className="h-8 w-8 rounded-full border border-neutral-200 dark:border-neutral-800 flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <RefreshIcon size={14} className={isLoading ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1680px] px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        
        {/* HERO SECTION: High-Level Logistics Financial KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Total Freight Settled */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#11131a] border border-neutral-200 dark:border-neutral-800 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
            <div className="flex items-center justify-between text-neutral-500 font-mono text-xs uppercase tracking-wider">
              <span>Freight Settled (Paid)</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                {summary?.paid_invoices_count || 3} Cleared
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-neutral-950 dark:text-white mt-2">
              ₹{summary ? summary.total_freight_paid_inr.toLocaleString("en-IN") : "42,488"}
            </div>
            <div className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
              <span className="text-emerald-600 font-semibold">100% On-Time</span>
              <span>escrow payout release</span>
            </div>
          </div>

          {/* Card 2: Pending Freight Dues */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#11131a] border border-neutral-200 dark:border-neutral-800 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-24 w-24 bg-amber-500/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
            <div className="flex items-center justify-between text-neutral-500 font-mono text-xs uppercase tracking-wider">
              <span>Pending Settlement Dues</span>
              <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-[10px]">
                {summary?.pending_invoices_count || 2} Pending
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-2">
              ₹{summary ? summary.pending_dues_inr.toLocaleString("en-IN") : "43,652"}
            </div>
            <div className="text-xs text-neutral-500 mt-1 flex items-center gap-1">
              <span>Awaiting delivery milestones / e-POD</span>
            </div>
          </div>

          {/* Card 3: CP-SAT Optimization Rebate */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#11131a] border border-neutral-200 dark:border-neutral-800 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-24 w-24 bg-cyan-500/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
            <div className="flex items-center justify-between text-neutral-500 font-mono text-xs uppercase tracking-wider">
              <span>OR-Tools Savings Rebate</span>
              <span className="px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 font-bold text-[10px]">
                -28.4% Avg
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-cyan-600 dark:text-cyan-400 mt-2">
              ₹{summary ? summary.total_consolidation_savings_inr.toLocaleString("en-IN") : "7,600"}
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              Direct cost reduction via co-loading
            </div>
          </div>

          {/* Card 4: Insured Cargo In-Transit */}
          <div className="p-5 rounded-2xl bg-white dark:bg-[#11131a] border border-neutral-200 dark:border-neutral-800 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 h-24 w-24 bg-purple-500/5 rounded-bl-full pointer-events-none transition-transform group-hover:scale-110" />
            <div className="flex items-center justify-between text-neutral-500 font-mono text-xs uppercase tracking-wider">
              <span>Insured In-Transit Cargo</span>
              <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-[10px]">
                0.04% Claim Rate
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-bold font-mono text-neutral-950 dark:text-white mt-2">
              ₹{summary ? (summary.total_cargo_insured_inr / 100000).toFixed(2) : "51.40"} Lakh
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              Active thermal risk warranty attached
            </div>
          </div>

        </section>

        {/* SECTION TABS NAVIGATION */}
        <div className="border-b border-neutral-200 dark:border-neutral-800">
          <nav className="flex items-center gap-2 sm:gap-6 overflow-x-auto pb-px">
            {[
              { id: "invoices", label: "01 // FREIGHT INVOICES", count: invoices.length },
              { id: "transactions", label: "02 // TRANSACTION LEDGER", count: transactions.length },
              { id: "settlements", label: "03 // CARRIER B2B SETTLEMENTS", count: settlements.length },
              { id: "wallet", label: "04 // ESCROW WALLET & CREDITS" },
            ].map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 py-3 px-1 border-b-2 font-mono text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? "border-neutral-950 dark:border-white text-neutral-950 dark:text-white"
                      : "border-transparent text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-300 hover:border-neutral-300"
                  }`}
                >
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold"
                          : "bg-neutral-200/70 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* TAB 1: FREIGHT INVOICES & PAYMENTS */}
        {activeTab === "invoices" && (
          <div className="space-y-4">
            
            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-2xl bg-white dark:bg-[#11131a] border border-neutral-200 dark:border-neutral-800 shadow-2xs">
              
              {/* Status Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto">
                {["ALL", "PENDING", "PAID"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-xl font-mono text-xs font-semibold transition-all cursor-pointer ${
                      statusFilter === st
                        ? "bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 shadow-xs"
                        : "bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <SearchIcon size={14} className="absolute left-3 top-3 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search invoice number, waybill, consignment, or carrier..."
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-neutral-400 dark:focus:ring-neutral-600 font-sans"
                />
              </div>
            </div>

            {/* Invoices List / Table */}
            <div className="grid grid-cols-1 gap-3">
              {filteredInvoices.length === 0 ? (
                <div className="p-12 text-center rounded-2xl bg-white dark:bg-[#11131a] border border-neutral-200 dark:border-neutral-800 text-neutral-500 space-y-2">
                  <CubeIcon size={32} className="mx-auto text-neutral-400 opacity-60" />
                  <p className="text-sm font-semibold">No invoices match your filter</p>
                  <p className="text-xs">Try changing your search term or filter status</p>
                </div>
              ) : (
                filteredInvoices.map((inv) => {
                  const isPaid = inv.payment_status === "PAID";
                  const isChilled = inv.temp_class === "chilled";
                  const isFrozen = inv.temp_class === "frozen";

                  return (
                    <div
                      key={inv.invoice_number}
                      className="p-5 rounded-2xl bg-white dark:bg-[#11131a] border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 transition-all shadow-2xs space-y-4"
                    >
                      {/* Top Row: Ref, Consignment, Status Badge */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-100 dark:border-neutral-800/80 pb-3">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="font-mono text-xs font-bold text-neutral-950 dark:text-white px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800">
                            {inv.invoice_number}
                          </span>
                          <span className="text-xs text-neutral-500 font-mono">
                            Waybill: {inv.shipment_id}
                          </span>
                          <span
                            className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                              isFrozen
                                ? "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20"
                                : isChilled
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                : "bg-neutral-500/10 text-neutral-600 dark:text-neutral-400 border border-neutral-500/20"
                            }`}
                          >
                            <SnowflakeIcon size={11} />
                            <span>{inv.temp_class}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                              isPaid
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                            }`}
                          >
                            {isPaid ? "● PAID & SETTLED" : "○ PENDING PAYMENT"}
                          </span>
                        </div>
                      </div>

                      {/* Middle Grid: Consignment Info + Cost Breakdown Summary */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        
                        {/* Column 1: Cargo details */}
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-neutral-900 dark:text-white">
                            {inv.consignment_title}
                          </h4>
                          <div className="text-xs text-neutral-500 flex items-center gap-1.5">
                            <TruckIcon size={13} />
                            <span>{inv.carrier_name}</span>
                          </div>
                          <div className="text-[11px] text-neutral-400 font-mono">
                            {inv.origin} → {inv.destination} • {inv.weight_kg.toLocaleString("en-IN")} kg
                          </div>
                        </div>

                        {/* Column 2: Breakdown Snapshot */}
                        <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 text-[11px] font-mono space-y-1 text-neutral-600 dark:text-neutral-400">
                          <div className="flex justify-between">
                            <span>Base Freight:</span>
                            <span>₹{inv.cost_breakdown.base_freight_inr.toLocaleString("en-IN")}</span>
                          </div>
                          {inv.cost_breakdown.cold_chain_protection_premium_inr > 0 && (
                            <div className="flex justify-between text-cyan-600 dark:text-cyan-400">
                              <span>Cold Protection:</span>
                              <span>+₹{inv.cost_breakdown.cold_chain_protection_premium_inr.toLocaleString("en-IN")}</span>
                            </div>
                          )}
                          {inv.cost_breakdown.consolidation_discount_inr < 0 && (
                            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                              <span>CP-SAT Rebate:</span>
                              <span>-₹{Math.abs(inv.cost_breakdown.consolidation_discount_inr).toLocaleString("en-IN")}</span>
                            </div>
                          )}
                          <div className="flex justify-between pt-1 border-t border-neutral-200 dark:border-neutral-800 text-neutral-500 text-[10px]">
                            <span>GST (18%) + Insurance:</span>
                            <span>₹{(inv.cost_breakdown.gst_18_pct_inr + inv.cost_breakdown.cargo_transit_insurance_inr).toLocaleString("en-IN")}</span>
                          </div>
                        </div>

                        {/* Column 3: Grand Total & Action Buttons */}
                        <div className="flex flex-col sm:items-end justify-between gap-3">
                          <div className="sm:text-right">
                            <div className="text-[10px] font-mono uppercase text-neutral-400 tracking-wider">
                              Total Invoice Amount
                            </div>
                            <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                              ₹{inv.total_amount_inr.toLocaleString("en-IN")}
                            </div>
                            <div className="text-[10px] text-neutral-400 font-mono">
                              Due: {inv.due_date}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setDocInvoice(inv);
                                setDocModalOpen(true);
                              }}
                              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all cursor-pointer"
                            >
                              Tax Invoice
                            </button>

                            {!isPaid ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setCheckoutInvoice(inv);
                                  setCheckoutModalOpen(true);
                                }}
                                className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md active:scale-95 cursor-pointer"
                              >
                                <span>Pay Now</span>
                                <ArrowRightIcon size={13} />
                              </button>
                            ) : (
                              <div className="flex items-center gap-1 text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold px-2 py-1 rounded bg-emerald-500/10">
                                <CheckmarkCircleIcon size={13} />
                                <span>Cleared ({inv.payment_method})</span>
                              </div>
                            )}
                          </div>
                        </div>

                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* TAB 2: TRANSACTION LEDGER */}
        {activeTab === "transactions" && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#11131a] border border-neutral-200 dark:border-neutral-800 shadow-2xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-neutral-50 dark:bg-neutral-900/80 border-b border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400">
                    <tr>
                      <th className="py-3 px-4 font-semibold">Transaction ID</th>
                      <th className="py-3 px-3 font-semibold">Invoice / Waybill</th>
                      <th className="py-3 px-3 font-semibold">Channel</th>
                      <th className="py-3 px-3 font-semibold">Bank Reference (UTR)</th>
                      <th className="py-3 px-3 font-semibold">Timestamp</th>
                      <th className="py-3 px-3 font-semibold">Status</th>
                      <th className="py-3 px-4 font-semibold text-right">Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                    {transactions.map((txn) => (
                      <tr key={txn.transaction_id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-900/40 transition-colors">
                        <td className="py-3 px-4 font-bold text-neutral-950 dark:text-white">
                          {txn.transaction_id}
                        </td>
                        <td className="py-3 px-3 text-neutral-600 dark:text-neutral-300">
                          <div>{txn.invoice_number}</div>
                          <div className="text-[10px] text-neutral-400">{txn.shipment_id}</div>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 font-semibold text-[10px]">
                            {txn.payment_method}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-neutral-500 text-[11px]">
                          {txn.utr_reference}
                        </td>
                        <td className="py-3 px-3 text-neutral-500 text-[11px]">
                          {txn.timestamp}
                        </td>
                        <td className="py-3 px-3">
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
                            <CheckmarkCircleIcon size={12} />
                            <span>{txn.status}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-bold text-neutral-950 dark:text-white">
                          ₹{txn.amount_inr.toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CARRIER B2B SETTLEMENTS */}
        {activeTab === "settlements" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {settlements.map((carrier) => (
                <div
                  key={carrier.carrier_id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#11131a] border border-neutral-200 dark:border-neutral-800 shadow-2xs space-y-4"
                >
                  <div className="flex items-start justify-between gap-2 border-b border-neutral-100 dark:border-neutral-800 pb-3">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-emerald-600 dark:text-emerald-400 font-bold">
                        {carrier.carrier_id}
                      </span>
                      <h4 className="text-sm font-bold text-neutral-950 dark:text-white mt-0.5">
                        {carrier.carrier_name}
                      </h4>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-mono font-bold">
                      {carrier.status}
                    </span>
                  </div>

                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex justify-between text-neutral-500">
                      <span>Total Completed Trips:</span>
                      <span className="font-semibold text-neutral-900 dark:text-white">{carrier.total_completed_trips} Loads</span>
                    </div>
                    <div className="flex justify-between text-neutral-500">
                      <span>Gross Freight Value:</span>
                      <span className="font-semibold text-neutral-900 dark:text-white">₹{carrier.total_freight_earned_inr.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-neutral-500">
                      <span>CargoMind Platform Fee (3%):</span>
                      <span className="text-neutral-900 dark:text-white">-₹{carrier.platform_commission_deducted_inr.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-neutral-500">
                      <span>Active Escrow Retained:</span>
                      <span className="text-amber-600 dark:text-amber-400">₹{carrier.escrow_hold_inr.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800 text-sm font-bold">
                      <span>Net Remittance:</span>
                      <span className="text-emerald-600 dark:text-emerald-400">₹{carrier.net_payout_settled_inr.toLocaleString("en-IN")}</span>
                    </div>
                  </div>

                  {/* SLA Compliance Meters */}
                  <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 text-[11px] font-mono space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-neutral-500">On-Time SLA:</span>
                      <span className="text-emerald-600 font-bold">{carrier.on_time_delivery_rate_pct}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-500">Thermal Compliance:</span>
                      <span className="text-cyan-600 font-bold">{carrier.temperature_compliance_pct}%</span>
                    </div>
                    <div className="text-[10px] text-neutral-400 pt-1 border-t border-neutral-200 dark:border-neutral-800">
                      Next Remittance: {carrier.next_settlement_cycle}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: CARGOMIND WALLET & CREDITS */}
        {activeTab === "wallet" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Card: Escrow Wallet Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-neutral-900 via-neutral-950 to-emerald-950 text-white border border-neutral-800 shadow-xl space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheckIcon size={20} className="text-emerald-400" />
                  <span className="text-xs font-mono tracking-widest text-emerald-300 font-bold uppercase">
                    CargoMind Escrow Account
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/10 text-emerald-300 font-bold">
                  ACTIVE
                </span>
              </div>

              <div>
                <div className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">
                  Available Operating Balance
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-emerald-400 mt-1">
                  ₹{wallet ? wallet.balance_inr.toLocaleString("en-IN") : "1,48,500"}
                </div>
                <div className="text-[11px] text-neutral-400 mt-1">
                  Tenant: {wallet?.tenant_name || "Guwahati Agro FPO"}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setWalletModalOpen(true)}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs font-mono transition-all text-center cursor-pointer shadow-md"
                >
                  + Add Funds (Top Up)
                </button>
              </div>
            </div>

            {/* Right Card: Activity History */}
            <div className="lg:col-span-2 p-6 rounded-2xl bg-white dark:bg-[#11131a] border border-neutral-200 dark:border-neutral-800 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
                <h4 className="text-sm font-bold text-neutral-950 dark:text-white font-mono uppercase">
                  Escrow Deposit & Rebate History
                </h4>
                <span className="text-xs text-neutral-500 font-mono">
                  Auto-Debit: {wallet?.auto_debit_enabled ? "Enabled" : "Disabled"}
                </span>
              </div>

              <div className="space-y-3">
                {wallet?.recent_activity.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200/80 dark:border-neutral-800 font-mono text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-neutral-900 dark:text-white">
                        {act.title}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {act.date} • Ref: {act.reference}
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className={`font-bold ${
                          act.type === "CREDIT"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-neutral-900 dark:text-white"
                        }`}
                      >
                        {act.type === "CREDIT" ? "+" : "-"}₹{act.amount_inr.toLocaleString("en-IN")}
                      </div>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 font-bold">
                        {act.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </main>

      {/* MODAL 1: CHECKOUT MODAL */}
      <PaymentCheckoutModal
        isOpen={checkoutModalOpen}
        invoice={checkoutInvoice}
        walletBalance={wallet?.balance_inr || 0}
        onClose={() => setCheckoutModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
        onOpenInvoiceDoc={(inv) => {
          setDocInvoice(inv);
          setDocModalOpen(true);
        }}
      />

      {/* MODAL 2: PRINTABLE TAX INVOICE MODAL */}
      <InvoiceDocumentModal
        isOpen={docModalOpen}
        invoice={docInvoice}
        onClose={() => setDocModalOpen(false)}
        onPayNow={(inv) => {
          setCheckoutInvoice(inv);
          setCheckoutModalOpen(true);
        }}
      />

      {/* MODAL 3: WALLET TOP-UP MODAL */}
      <WalletTopUpModal
        isOpen={walletModalOpen}
        currentBalance={wallet?.balance_inr || 0}
        onClose={() => setWalletModalOpen(false)}
        onSuccess={(updated) => {
          setWallet(updated);
          loadData();
        }}
      />

      {/* MODAL 4: CREATE / SIMULATE NEW INVOICE */}
      {createInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-[#11131a] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-neutral-950 dark:text-white font-mono uppercase">
              Generate New Freight Tax Invoice
            </h3>
            <p className="text-xs text-neutral-500">
              Calculate instant billing breakdown with CP-SAT co-loading rebate and GST.
            </p>

            <form onSubmit={handleCreateInvoice} className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">Origin Hub</label>
                <input
                  type="text"
                  value={newOrigin}
                  onChange={(e) => setNewOrigin(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">Destination Hub</label>
                <input
                  type="text"
                  value={newDest}
                  onChange={(e) => setNewDest(e.target.value)}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">Weight (kg)</label>
                  <input
                    type="number"
                    value={newWeight}
                    onChange={(e) => setNewWeight(Number(e.target.value))}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">Thermal Class</label>
                  <select
                    value={newTemp}
                    onChange={(e) => setNewTemp(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white"
                  >
                    <option value="chilled">Chilled (+4°C)</option>
                    <option value="frozen">Frozen (-18°C)</option>
                    <option value="ambient">Ambient (+22°C)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300">Declared Cargo Value (INR ₹)</label>
                <input
                  type="number"
                  value={newVal}
                  onChange={(e) => setNewVal(Number(e.target.value))}
                  className="w-full mt-1 px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setCreateInvoiceModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 transition-all cursor-pointer"
                >
                  {isGenerating ? "Generating..." : "Generate Invoice"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

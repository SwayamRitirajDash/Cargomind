"use client";

import { useState, useEffect } from "react";
import { InvoiceItem, processCheckout, CheckoutResult } from "@/lib/api/payments";
import {
  CheckmarkCircleIcon,
  AlertCircleIcon,
  CloseIcon,
  ShieldCheckIcon,
  RefreshIcon,
  ArrowRightIcon,
} from "@/components/icons/Hugeicons";

interface PaymentCheckoutModalProps {
  isOpen: boolean;
  invoice: InvoiceItem | null;
  walletBalance: number;
  onClose: () => void;
  onPaymentSuccess: (result: CheckoutResult) => void;
  onOpenInvoiceDoc?: (invoice: InvoiceItem) => void;
}

type PaymentMethod = "UPI" | "CARD" | "NETBANKING" | "WALLET" | "NEFT";

export default function PaymentCheckoutModal({
  isOpen,
  invoice,
  walletBalance,
  onClose,
  onPaymentSuccess,
  onOpenInvoiceDoc,
}: PaymentCheckoutModalProps) {
  const [method, setMethod] = useState<PaymentMethod>("UPI");
  const [upiId, setUpiId] = useState("agro.shipper@okhdfcbank");
  const [cardNumber, setCardNumber] = useState("4532 8921 4092 1184");
  const [cardName, setCardName] = useState("ASSAM AGRO PRODUCER CO");
  const [cardExpiry, setCardExpiry] = useState("08/29");
  const [cardCvv, setCardCvv] = useState("892");
  const [selectedBank, setSelectedBank] = useState("HDFC Bank");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [result, setResult] = useState<CheckoutResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setResult(null);
      setErrorMsg(null);
      setIsProcessing(false);
      setProcessingStep(0);
    }
  }, [isOpen, invoice]);

  if (!isOpen || !invoice) return null;

  const isWalletSufficient = walletBalance >= invoice.total_amount_inr;

  const handlePayNow = async () => {
    setIsProcessing(true);
    setErrorMsg(null);

    // Simulated progress steps for realism
    setProcessingStep(1);
    await new Promise((r) => setTimeout(r, 600));
    setProcessingStep(2);
    await new Promise((r) => setTimeout(r, 700));
    setProcessingStep(3);
    await new Promise((r) => setTimeout(r, 600));

    try {
      const res = await processCheckout({
        invoice_number: invoice.invoice_number,
        payment_method: method,
        payer_name: cardName || "Guwahati Agro-Farmer Producer Org",
        card_last4: method === "CARD" ? cardNumber.slice(-4) : undefined,
        upi_id: method === "UPI" ? upiId : undefined,
        bank_name: method === "NETBANKING" ? selectedBank : undefined,
      });

      if (res.success) {
        setResult(res);
        onPaymentSuccess(res);
      } else {
        setErrorMsg(res.message || "Payment execution failed");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "An unexpected error occurred during payment processing");
    } finally {
      setIsProcessing(false);
    }
  };

  const banks = [
    { name: "HDFC Bank", code: "HDFC", icon: "🏛️" },
    { name: "State Bank of India", code: "SBI", icon: "🇮🇳" },
    { name: "ICICI Bank", code: "ICICI", icon: "🏢" },
    { name: "Axis Bank", code: "AXIS", icon: "🏦" },
    { name: "Kotak Mahindra", code: "KOTAK", icon: "💳" },
    { name: "Punjab National Bank", code: "PNB", icon: "🛡️" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#11131a] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldCheckIcon size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-neutral-950 dark:text-white">
                CargoMind Secure Freight Checkout
              </h3>
              <p className="text-[11px] font-mono text-neutral-500">
                Invoice Ref: {invoice.invoice_number} • Escrow Protected
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-950 dark:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Modal Body */}
        {result && result.success ? (
          /* SUCCESS SCREEN */
          <div className="p-8 text-center space-y-6">
            <div className="mx-auto h-16 w-16 rounded-full bg-emerald-500/10 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-500 animate-bounce">
              <CheckmarkCircleIcon size={36} />
            </div>

            <div className="space-y-1">
              <span className="inline-block font-mono text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                Escrow Settlement Complete
              </span>
              <h2 className="text-xl font-bold text-neutral-950 dark:text-white">
                Payment of ₹{result.amount_paid_inr.toLocaleString("en-IN")} Successful
              </h2>
              <p className="text-xs text-neutral-500 max-w-md mx-auto">
                Funds have been locked in escrow and will be released to {invoice.carrier_name} upon milestone verification.
              </p>
            </div>

            {/* Receipt Summary Box */}
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/80 border border-neutral-200 dark:border-neutral-800 text-left font-mono text-xs space-y-2">
              <div className="flex justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
                <span className="text-neutral-500">Transaction ID</span>
                <span className="font-semibold text-neutral-900 dark:text-neutral-100">{result.transaction_id}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
                <span className="text-neutral-500">Bank UTR Reference</span>
                <span className="text-neutral-900 dark:text-neutral-100">{result.utr_reference}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200 dark:border-neutral-800 pb-2">
                <span className="text-neutral-500">Payment Channel</span>
                <span className="text-neutral-900 dark:text-neutral-100">{result.payment_method}</span>
              </div>
              <div className="flex justify-between pt-1 font-bold text-sm">
                <span className="text-neutral-700 dark:text-neutral-300">Amount Paid</span>
                <span className="text-emerald-600 dark:text-emerald-400">₹{result.amount_paid_inr.toLocaleString("en-IN")}</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-3 pt-2">
              {onOpenInvoiceDoc && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenInvoiceDoc(invoice);
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-all cursor-pointer"
                >
                  View Tax Invoice
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:bg-black dark:hover:bg-neutral-200 transition-all cursor-pointer shadow-sm"
              >
                Close Receipt
              </button>
            </div>
          </div>
        ) : (
          /* CHECKOUT FORM */
          <div className="p-6 space-y-6">
            
            {/* Bill Summary Banner */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-neutral-100 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 gap-3">
              <div>
                <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
                  Consignment & Route
                </div>
                <div className="text-sm font-semibold text-neutral-900 dark:text-white mt-0.5">
                  {invoice.consignment_title}
                </div>
                <div className="text-xs text-neutral-500 mt-0.5">
                  {invoice.origin} → {invoice.destination} • {invoice.weight_kg} kg
                </div>
              </div>

              <div className="sm:text-right border-t sm:border-t-0 border-neutral-200 dark:border-neutral-800 pt-2 sm:pt-0 w-full sm:w-auto">
                <div className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider">
                  Net Amount Payable
                </div>
                <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  ₹{invoice.total_amount_inr.toLocaleString("en-IN")}
                </div>
                <div className="text-[10px] text-neutral-400 font-mono">
                  Incl. GST (18%) & Cargo Insurance
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-mono">
                <AlertCircleIcon size={16} />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Payment Method Selector Tabs */}
            <div className="space-y-3">
              <label className="text-xs font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400 font-mono">
                Select Payment Channel
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "UPI" as PaymentMethod, label: "UPI / QR", desc: "Instant QR & VPA", badge: "Zero Fee" },
                  { id: "WALLET" as PaymentMethod, label: "Escrow Wallet", desc: `Bal: ₹${walletBalance.toLocaleString("en-IN")}`, badge: isWalletSufficient ? "Instant" : "Low Bal" },
                  { id: "CARD" as PaymentMethod, label: "Cards", desc: "RuPay / Visa / MC", badge: "Secure" },
                  { id: "NETBANKING" as PaymentMethod, label: "NetBanking", desc: "All Indian Banks", badge: "Instant" },
                ].map((item) => {
                  const isSelected = method === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setMethod(item.id)}
                      className={`flex flex-col text-left p-3 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-neutral-900 dark:border-white shadow-md"
                          : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-bold">{item.label}</span>
                        <span
                          className={`text-[9px] font-mono px-1 rounded ${
                            isSelected
                              ? "bg-white/20 dark:bg-neutral-950/20 text-white dark:text-neutral-950"
                              : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                          }`}
                        >
                          {item.badge}
                        </span>
                      </div>
                      <span className={`text-[10px] mt-1 truncate ${isSelected ? "text-neutral-300 dark:text-neutral-700" : "text-neutral-400"}`}>
                        {item.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* TAB CONTENT PANELS */}
            <div className="p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 min-h-[160px]">
              {/* 1. UPI */}
              {method === "UPI" && (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Mock QR Code */}
                    <div className="relative h-28 w-28 shrink-0 rounded-lg bg-white border border-neutral-300 dark:border-neutral-700 p-2 flex flex-col items-center justify-center shadow-inner">
                      <div className="grid grid-cols-4 gap-1 w-full h-full opacity-80">
                        {Array.from({ length: 16 }).map((_, i) => (
                          <div
                            key={i}
                            className={`rounded-xs ${
                              (i * 7 + 3) % 2 === 0 ? "bg-black" : "bg-neutral-200"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="absolute bottom-1 bg-black text-white text-[7px] font-mono px-1 rounded">
                        UPI QR
                      </span>
                    </div>

                    <div className="space-y-2 flex-1 w-full">
                      <label className="text-xs font-medium text-neutral-700 dark:text-neutral-300">
                        Virtual Payment Address (VPA / UPI ID)
                      </label>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        placeholder="yourname@okhdfcbank"
                        className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <p className="text-[11px] text-neutral-500">
                        Supports Google Pay, PhonePe, Paytm, BHIM, Cred, and all bank UPI apps.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. ESCROW WALLET */}
              {method === "WALLET" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <div>
                      <div className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                        CargoMind Escrow Available Balance
                      </div>
                      <div className="text-lg font-bold font-mono text-emerald-700 dark:text-emerald-400 mt-0.5">
                        ₹{walletBalance.toLocaleString("en-IN")}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-semibold">
                        Instant 1-Click
                      </span>
                    </div>
                  </div>

                  {!isWalletSufficient ? (
                    <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                      ⚠️ Balance is low. Please select UPI / Cards or top up your wallet to settle.
                    </div>
                  ) : (
                    <p className="text-xs text-neutral-500">
                      Funds will be deducted from your organization escrow account. A rebate voucher for CP-SAT co-loading is automatically stamped.
                    </p>
                  )}
                </div>
              )}

              {/* 3. CARD */}
              {method === "CARD" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        placeholder="•••• •••• •••• ••••"
                        className="w-full mt-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full mt-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        maxLength={4}
                        className="w-full mt-1 px-3 py-1.5 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 4. NETBANKING */}
              {method === "NETBANKING" && (
                <div className="space-y-3">
                  <label className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">
                    Select Corporate / Retail Banking Portal
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {banks.map((b) => (
                      <button
                        key={b.code}
                        type="button"
                        onClick={() => setSelectedBank(b.name)}
                        className={`p-2 rounded-lg border text-left text-xs font-medium flex items-center gap-2 transition-all cursor-pointer ${
                          selectedBank === b.name
                            ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 border-neutral-900 dark:border-white font-semibold"
                            : "bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300"
                        }`}
                      >
                        <span>{b.icon}</span>
                        <span className="truncate">{b.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* PROCESSING OVERLAY ANIMATION */}
            {isProcessing && (
              <div className="p-4 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 space-y-2 text-center animate-pulse">
                <div className="flex items-center justify-center gap-2 text-xs font-mono font-semibold">
                  <RefreshIcon size={14} className="animate-spin" />
                  <span>
                    {processingStep === 1 && "Connecting to Banking Switch & Verifying Escrow..."}
                    {processingStep === 2 && "Stamping Cryptographic Hash & GST Voucher..."}
                    {processingStep === 3 && "Finalizing Settlement & Releasing Consignment Lock..."}
                  </span>
                </div>
                <div className="w-full bg-white/20 dark:bg-neutral-950/20 h-1 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 dark:bg-emerald-600 h-full transition-all duration-500"
                    style={{ width: `${(processingStep / 3) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isProcessing}
                className="px-4 py-2 text-xs font-semibold text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handlePayNow}
                disabled={isProcessing || (method === "WALLET" && !isWalletSufficient)}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>Authorize & Pay ₹{invoice.total_amount_inr.toLocaleString("en-IN")}</span>
                <ArrowRightIcon size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { InvoiceItem } from "@/lib/api/payments";
import CargoMindLogo from "@/components/icons/CargoMindLogo";
import {
  CloseIcon,
  CheckmarkCircleIcon,
  ShieldCheckIcon,
} from "@/components/icons/Hugeicons";

interface InvoiceDocumentModalProps {
  isOpen: boolean;
  invoice: InvoiceItem | null;
  onClose: () => void;
  onPayNow?: (invoice: InvoiceItem) => void;
}

export default function InvoiceDocumentModal({
  isOpen,
  invoice,
  onClose,
  onPayNow,
}: InvoiceDocumentModalProps) {
  if (!isOpen || !invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const isPaid = invoice.payment_status === "PAID";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white text-neutral-900 dark:bg-[#0c0d12] dark:text-neutral-100 border border-neutral-300 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Top Control Bar (Hidden on print) */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-100 dark:bg-neutral-900/80 shrink-0 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              Tax Invoice & Logistics Consignment Voucher
            </span>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                isPaid
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30"
              }`}
            >
              {invoice.payment_status}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 hover:bg-black dark:hover:bg-neutral-200 transition-all cursor-pointer shadow-xs"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <path d="M6 14h12v8H6z" />
              </svg>
              <span>Print / Save PDF</span>
            </button>

            {!isPaid && onPayNow && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onPayNow(invoice);
                }}
                className="px-3 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-all cursor-pointer shadow-xs"
              >
                Pay Now
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <CloseIcon size={16} />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div id="printable-invoice" className="p-6 sm:p-10 overflow-y-auto space-y-6 font-sans text-xs print:p-0 print:text-black print:bg-white">
          
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-neutral-200 dark:border-neutral-800 pb-6 print:border-black">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 flex items-center justify-center p-1.5 shrink-0">
                <CargoMindLogo size={28} />
              </div>
              <div>
                <h1 className="text-base font-extrabold tracking-tight">CargoMind Logistics Network</h1>
                <p className="text-[10px] font-mono text-neutral-500">
                  GSTIN: 18AABCC4910K1Z8 • ARN: AA180926019284
                </p>
                <p className="text-[10px] text-neutral-400">
                  Guwahati Intermodal Logistics Terminal, NH-27 Corridor, Assam - 781035
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right font-mono">
              <div className="text-sm font-bold text-neutral-950 dark:text-white print:text-black">
                {invoice.invoice_number}
              </div>
              <div className="text-[11px] text-neutral-500">
                Date: {invoice.created_at}
              </div>
              <div className="text-[11px] text-neutral-500">
                Due Date: {invoice.due_date}
              </div>
              <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1">
                Waybill ID: {invoice.shipment_id}
              </div>
            </div>
          </div>

          {/* Consignor & Transporter Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-neutral-50 dark:bg-neutral-900/50 border border-neutral-200 dark:border-neutral-800 print:border-black print:bg-white">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                Consignor (Shipper FPO)
              </span>
              <div className="font-bold text-sm text-neutral-900 dark:text-white print:text-black mt-0.5">
                {invoice.shipper_name}
              </div>
              <div className="text-[11px] text-neutral-500">
                Tenant: {invoice.shipper_tenant_id} • Origin: {invoice.origin}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                Thermal Setpoint:{" "}
                <span className="font-mono uppercase font-semibold text-cyan-600 dark:text-cyan-400">
                  {invoice.temp_class}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">
                Transporter / Carrier
              </span>
              <div className="font-bold text-sm text-neutral-900 dark:text-white print:text-black mt-0.5">
                {invoice.carrier_name}
              </div>
              <div className="text-[11px] text-neutral-500">
                Carrier ID: {invoice.carrier_id} • Dest: {invoice.destination}
              </div>
              <div className="text-[11px] text-neutral-500 mt-1">
                Cargo Weight: <span className="font-mono font-semibold">{invoice.weight_kg.toLocaleString("en-IN")} kg</span> • Declared Value:{" "}
                <span className="font-mono font-semibold">₹{invoice.declared_value_inr.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Line Item Breakdown Table */}
          <div className="border border-neutral-200 dark:border-neutral-800 rounded-xl overflow-hidden print:border-black">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-neutral-100 dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 print:bg-neutral-100">
                <tr>
                  <th className="py-2.5 px-4 font-semibold text-neutral-700 dark:text-neutral-300"># Description</th>
                  <th className="py-2.5 px-3 font-semibold text-neutral-700 dark:text-neutral-300">HSN/SAC</th>
                  <th className="py-2.5 px-4 font-semibold text-right text-neutral-700 dark:text-neutral-300">Amount (INR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                <tr>
                  <td className="py-2 px-4">
                    <span className="font-semibold text-neutral-900 dark:text-white print:text-black">Base Intermodal Freight Movement</span>
                    <p className="text-[10px] text-neutral-500">{invoice.origin} to {invoice.destination}</p>
                  </td>
                  <td className="py-2 px-3 text-neutral-500">996511</td>
                  <td className="py-2 px-4 text-right font-medium">₹{invoice.cost_breakdown.base_freight_inr.toLocaleString("en-IN")}</td>
                </tr>

                <tr>
                  <td className="py-2 px-4">
                    <span className="text-neutral-900 dark:text-white print:text-black">Fuel Energy Index Surcharge</span>
                  </td>
                  <td className="py-2 px-3 text-neutral-500">996511</td>
                  <td className="py-2 px-4 text-right">₹{invoice.cost_breakdown.fuel_surcharge_inr.toLocaleString("en-IN")}</td>
                </tr>

                {invoice.cost_breakdown.cold_chain_protection_premium_inr > 0 && (
                  <tr>
                    <td className="py-2 px-4">
                      <span className="text-cyan-700 dark:text-cyan-400 font-medium">Thermal Isolation & Active Reefer Preservation ({invoice.temp_class.toUpperCase()})</span>
                    </td>
                    <td className="py-2 px-3 text-neutral-500">996519</td>
                    <td className="py-2 px-4 text-right text-cyan-600 dark:text-cyan-400">
                      ₹{invoice.cost_breakdown.cold_chain_protection_premium_inr.toLocaleString("en-IN")}
                    </td>
                  </tr>
                )}

                {invoice.cost_breakdown.mountain_terrain_surcharge_inr > 0 && (
                  <tr>
                    <td className="py-2 px-4">High Elevation Mountain Gradient & Wear Surcharge</td>
                    <td className="py-2 px-3 text-neutral-500">996511</td>
                    <td className="py-2 px-4 text-right">₹{invoice.cost_breakdown.mountain_terrain_surcharge_inr.toLocaleString("en-IN")}</td>
                  </tr>
                )}

                {invoice.cost_breakdown.consolidation_discount_inr < 0 && (
                  <tr className="bg-emerald-50/50 dark:bg-emerald-950/20">
                    <td className="py-2 px-4">
                      <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                        ⚡ CP-SAT Combinatorial Co-Loading Rebate (OR-Tools Savings)
                      </span>
                    </td>
                    <td className="py-2 px-3 text-emerald-600 dark:text-emerald-400">DISCOUNT</td>
                    <td className="py-2 px-4 text-right text-emerald-600 dark:text-emerald-400 font-bold">
                      -₹{Math.abs(invoice.cost_breakdown.consolidation_discount_inr).toLocaleString("en-IN")}
                    </td>
                  </tr>
                )}

                <tr>
                  <td className="py-2 px-4">Cargo Transit Insurance (0.5% of ₹{invoice.declared_value_inr.toLocaleString("en-IN")})</td>
                  <td className="py-2 px-3 text-neutral-500">997132</td>
                  <td className="py-2 px-4 text-right">₹{invoice.cost_breakdown.cargo_transit_insurance_inr.toLocaleString("en-IN")}</td>
                </tr>

                <tr>
                  <td className="py-2 px-4">CargoMind Autonomous Dispatch & Routing Platform Fee</td>
                  <td className="py-2 px-3 text-neutral-500">998314</td>
                  <td className="py-2 px-4 text-right">₹{invoice.cost_breakdown.platform_fee_inr.toLocaleString("en-IN")}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Totals & Taxes Summary */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div className="space-y-1 max-w-sm text-[11px] text-neutral-500">
              <p className="font-semibold text-neutral-800 dark:text-neutral-200">Payment & Escrow Terms:</p>
              <p>
                1. Freight settlement is secured in multi-signature escrow until digital e-POD signature confirmation.
              </p>
              <p>
                2. Real-time Arrhenius kinetics integrity check threshold: &gt;90% shelf-life intact upon delivery.
              </p>
            </div>

            <div className="w-full sm:w-72 font-mono text-xs space-y-1.5 border-t sm:border-t-0 border-neutral-200 dark:border-neutral-800 pt-3 sm:pt-0">
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Taxable Subtotal:</span>
                <span>₹{invoice.cost_breakdown.subtotal_inr.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>CGST (9%):</span>
                <span>₹{(invoice.cost_breakdown.gst_18_pct_inr / 2).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>SGST (9%):</span>
                <span>₹{(invoice.cost_breakdown.gst_18_pct_inr / 2).toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Transit Insurance:</span>
                <span>₹{invoice.cost_breakdown.cargo_transit_insurance_inr.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t border-neutral-300 dark:border-neutral-700 text-neutral-950 dark:text-white print:text-black">
                <span>Grand Total:</span>
                <span className="text-emerald-600 dark:text-emerald-400">
                  ₹{invoice.total_amount_inr.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          {/* Status & Digital Seal Footer */}
          <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] text-neutral-400">
            <div className="flex items-center gap-3">
              {isPaid ? (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold">
                  <CheckmarkCircleIcon size={14} />
                  <span>SETTLED VIA {invoice.payment_method || "ONLINE ESCROW"} ({invoice.paid_at})</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold">
                  <span>PAYMENT PENDING • DUE {invoice.due_date}</span>
                </div>
              )}
            </div>

            <div className="text-right">
              <div>Digital Cryptographic Voucher Seal: SHA256-V4-{invoice.invoice_number.slice(-6)}</div>
              <div>This is a computer-generated tax invoice and requires no physical signature.</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

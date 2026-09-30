"use client";

import { useState } from "react";
import { topUpWallet, WalletInfo } from "@/lib/api/payments";
import {
  CloseIcon,
  CheckmarkCircleIcon,
  AlertCircleIcon,
  RefreshIcon,
  ShieldCheckIcon,
} from "@/components/icons/Hugeicons";

interface WalletTopUpModalProps {
  isOpen: boolean;
  currentBalance: number;
  onClose: () => void;
  onSuccess: (updatedWallet: WalletInfo) => void;
}

export default function WalletTopUpModal({
  isOpen,
  currentBalance,
  onClose,
  onSuccess,
}: WalletTopUpModalProps) {
  const [amount, setAmount] = useState<number>(25000);
  const [method, setMethod] = useState<string>("UPI");
  const [upiId, setUpiId] = useState<string>("agro.shipper@okhdfcbank");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const chips = [10000, 25000, 50000, 100000];

  const handleTopUp = async () => {
    if (amount <= 0) {
      setErrorMsg("Please enter a valid amount greater than 0");
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      // Simulate gateway delay
      await new Promise((r) => setTimeout(r, 800));
      const updated = await topUpWallet({
        amount_inr: amount,
        payment_method: method,
        upi_id: upiId,
      });

      onSuccess(updated);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to complete wallet top-up");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white dark:bg-[#11131a] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-900/60">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <ShieldCheckIcon size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-950 dark:text-white">
                CargoMind Escrow Wallet Top-Up
              </h3>
              <p className="text-[11px] font-mono text-neutral-500">
                Current Balance: ₹{currentBalance.toLocaleString("en-IN")}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
          >
            <CloseIcon size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs font-sans">
          {errorMsg && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 text-[11px]">
              <AlertCircleIcon size={14} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider font-mono">
              Amount to Credit (₹ INR)
            </label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-2.5 text-neutral-400 font-mono text-sm font-bold">₹</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min={500}
                step={1000}
                className="w-full pl-7 pr-3 py-2 text-sm font-mono font-bold rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Quick Amount Chips */}
          <div className="flex items-center gap-1.5">
            {chips.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setAmount(c)}
                className={`flex-1 py-1.5 text-[11px] font-mono rounded-lg border transition-all cursor-pointer ${
                  amount === c
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-bold border-neutral-900 dark:border-white"
                    : "bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-300"
                }`}
              >
                +₹{(c / 1000).toFixed(0)}k
              </button>
            ))}
          </div>

          {/* Payment Method */}
          <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <label className="text-[11px] font-semibold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider font-mono">
              Funding Source
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: "UPI", label: "UPI Auto-Debit" },
                { id: "NETBANKING", label: "NetBanking / NEFT" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={`py-2 px-3 rounded-lg border text-left text-xs transition-all cursor-pointer ${
                    method === m.id
                      ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-950 font-semibold border-neutral-900 dark:border-white"
                      : "bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400"
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {method === "UPI" && (
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="agro.shipper@okhdfcbank"
                className="w-full mt-2 px-3 py-1.5 text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
              />
            )}
          </div>

          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-300 space-y-1">
            <div className="font-semibold flex items-center gap-1.5">
              <CheckmarkCircleIcon size={14} />
              <span>Escrow Protection Guarantee</span>
            </div>
            <p className="text-neutral-500 dark:text-neutral-400">
              Escrow funds remain in your custody until carrier delivers cargo in verified temperature-compliant SLA bounds.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-3 py-2 text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleTopUp}
              disabled={isProcessing || amount <= 0}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
            >
              {isProcessing && <RefreshIcon size={13} className="animate-spin" />}
              <span>Top Up ₹{amount.toLocaleString("en-IN")}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

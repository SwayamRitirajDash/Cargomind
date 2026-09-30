"use client";

import { useState } from "react";
import { InvoiceItem, generateInvoice } from "@/lib/api/payments";
import PaymentCheckoutModal from "./PaymentCheckoutModal";
import InvoiceDocumentModal from "./InvoiceDocumentModal";
import { ArrowRightIcon } from "@/components/icons/Hugeicons";

interface PaymentTriggerButtonProps {
  shipmentId: string;
  origin?: string;
  destination?: string;
  weightKg?: number;
  tempClass?: string;
  cargoValueInr?: number;
  className?: string;
  label?: string;
}

export default function PaymentTriggerButton({
  shipmentId,
  origin = "Guwahati Central Hub",
  destination = "Siliguri Transit Crossdock",
  weightKg = 1250,
  tempClass = "chilled",
  cargoValueInr = 250000,
  className = "",
  label = "Settle / Pay Freight",
}: PaymentTriggerButtonProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [docModalOpen, setDocModalOpen] = useState<boolean>(false);
  const [invoice, setInvoice] = useState<InvoiceItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      const inv = await generateInvoice({
        shipment_id: shipmentId,
        origin,
        destination,
        weight_kg: weightKg,
        temp_class: tempClass,
        cargo_value_inr: cargoValueInr,
        is_consolidated: true,
      });
      setInvoice(inv);
      setIsOpen(true);
    } catch (err) {
      console.error("Failed to generate or fetch invoice for trigger:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isLoading}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50 ${className}`}
      >
        <span>{isLoading ? "Generating..." : label}</span>
        <ArrowRightIcon size={12} />
      </button>

      {invoice && (
        <>
          <PaymentCheckoutModal
            isOpen={isOpen}
            invoice={invoice}
            walletBalance={148500}
            onClose={() => setIsOpen(false)}
            onPaymentSuccess={(res) => {
              setInvoice({
                ...invoice,
                payment_status: "PAID",
                paid_at: res.timestamp,
                transaction_id: res.transaction_id,
                payment_method: res.payment_method,
              });
            }}
            onOpenInvoiceDoc={(inv) => {
              setInvoice(inv);
              setDocModalOpen(true);
            }}
          />

          <InvoiceDocumentModal
            isOpen={docModalOpen}
            invoice={invoice}
            onClose={() => setDocModalOpen(false)}
            onPayNow={(inv) => {
              setInvoice(inv);
              setIsOpen(true);
            }}
          />
        </>
      )}
    </>
  );
}

"use client";

import { useActionState, useState, useEffect, useRef } from "react";
import { submitPayment } from "@/actions/payments";
import { formatMonth, formatPeso, type MonthLedger } from "@/lib/utils";

interface PaymentFormProps {
  tenantId: string;
  rentAmount: number;
  allMonths: string[];
  ledger: Record<string, MonthLedger>;
}

export default function PaymentForm({
  tenantId,
  rentAmount,
  allMonths,
  ledger,
}: PaymentFormProps) {
  const [state, action, pending] = useActionState(submitPayment, undefined);
  const [preview, setPreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // We want to default to the oldest unpaid month (remainingAmount > 0)
  // If all are paid, default to the current month or first month
  const getInitialMonth = () => {
    const now = new Date();
    const currentMonthISO = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
    
    // Find the oldest unpaid month
    const oldestUnpaid = allMonths.find((m) => {
      const item = ledger[m];
      return item && item.remainingAmount > 0;
    });

    if (oldestUnpaid) return oldestUnpaid;
    if (allMonths.includes(currentMonthISO)) return currentMonthISO;
    return allMonths[0] || "";
  };

  const [selectedMonth, setSelectedMonth] = useState(getInitialMonth);

  // Helper to calculate accumulated balance up to a given month (inclusive)
  const getAccumulatedBalance = (targetMonth: string) => {
    let total = 0;
    for (const m of allMonths) {
      const item = ledger[m];
      if (item) {
        total += item.remainingAmount;
      }
      if (m === targetMonth) break;
    }
    return total;
  };

  const [amountVal, setAmountVal] = useState(() => {
    const initialMonth = getInitialMonth();
    const accum = getAccumulatedBalance(initialMonth);
    return (accum > 0 ? accum : rentAmount).toString();
  });

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedMonth(val);
    const accum = getAccumulatedBalance(val);
    setAmountVal((accum > 0 ? accum : rentAmount).toString());
  };

  useEffect(() => {
    if (state?.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreview(null);
      formRef.current?.reset();
    }
  }, [state]);

  const scanReceipt = async (file: File) => {
    setIsScanning(true);
    setScanStatus("Uploading receipt to Google Vision...");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/ocr", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Failed to scan receipt image");
      }

      setScanStatus("Parsing details...");
      const data = await res.json();
      const text = data.text || "";

      // GCash reference number regex: match a 13-digit number (can contain spaces/dashes)
      // We don't use strict \b boundaries to handle OCR run-on texts (like "083324Jul")
      const refRegex = /\d[\d\s-]{10,24}\d/g;
      const matches = text.match(refRegex);
      let foundRef = false;
      if (matches) {
        for (const match of matches) {
          const cleaned = match.replace(/[\s-]/g, "");
          if (cleaned.length === 13) {
            const refInput = document.getElementById("ref_number") as HTMLInputElement;
            if (refInput) {
              refInput.value = cleaned;
              foundRef = true;
            }
            break;
          }
        }
      }

      // GCash amount regex: looks for Amount: PHP X,XXX.XX or Sent PHP X,XXX.XX
      const amountRegex = /(?:Amount|PHP|P)\s*[:\-\s]*([\d,]+\.\d{2})/i;
      const amountMatch = text.match(amountRegex);
      let foundAmount = false;
      if (amountMatch) {
        const cleanedAmount = amountMatch[1].replace(/,/g, "");
        setAmountVal(cleanedAmount);
        foundAmount = true;
      } else {
        const fallbackAmountRegex = /\b([\d,]+\.\d{2})\b/;
        const fallbackMatch = text.match(fallbackAmountRegex);
        if (fallbackMatch) {
          const cleanedAmount = fallbackMatch[1].replace(/,/g, "");
          setAmountVal(cleanedAmount);
          foundAmount = true;
        }
      }

      if (foundRef && foundAmount) {
        setScanStatus("Receipt scanned! Amount and Reference Number autofilled.");
      } else if (foundRef) {
        setScanStatus("Receipt scanned! Reference Number autofilled. (Amount not found)");
      } else if (foundAmount) {
        setScanStatus("Receipt scanned! Amount autofilled. (Reference Number not found)");
      } else {
        setScanStatus("Receipt scanned, but no GCash details could be recognized.");
      }
      setTimeout(() => setScanStatus(null), 6000);
    } catch (err) {
      console.error("OCR Scan Error:", err);
      setScanStatus("Scan failed. Please enter details manually.");
      setTimeout(() => setScanStatus(null), 6000);
    } finally {
      setIsScanning(false);
    }
  };

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      scanReceipt(file);
    }
  }

  return (
    <form ref={formRef} action={action} className="flex flex-col gap-4">
      <input type="hidden" name="tenant_id" value={tenantId} />

      {allMonths.length > 1 && (
        <div>
          <label htmlFor="month" className="form-label">
            Billing Month
          </label>
          <select
            id="month"
            name="month"
            className="input"
            required
            value={selectedMonth}
            onChange={handleMonthChange}
          >
            {allMonths.map((m) => {
              const item = ledger[m];
              let suffix = "";
              if (item) {
                if (item.status === "paid") {
                  suffix = " — Paid";
                } else if (item.status === "pending") {
                  suffix = " — Pending";
                } else {
                  const accum = getAccumulatedBalance(m);
                  if (accum > 0) {
                    suffix = ` — ${formatPeso(accum)}`;
                  }
                }
              }
              return (
                <option key={m} value={m} className="bg-[var(--color-surface-2)]">
                  {formatMonth(m)}{suffix}
                </option>
              );
            })}
          </select>
        </div>
      )}

      {allMonths.length === 1 && (
        <input type="hidden" name="month" value={allMonths[0]} />
      )}

      <div>
        <label htmlFor="ref_number" className="form-label">
          Reference Number
        </label>
        <input
          id="ref_number"
          name="ref_number"
          type="text"
          placeholder="Enter GCash Ref No."
          required
          className="input"
        />
      </div>

      <div>
        <label htmlFor="amount" className="form-label">
          Amount Paid
        </label>
        <input
          id="amount"
          name="amount"
          type="number"
          value={amountVal}
          onChange={(e) => setAmountVal(e.target.value)}
          required
          min="1"
          step="0.01"
          className="input"
        />
      </div>

      <div>
        <label htmlFor="receipt" className="form-label">
          Payment Receipt
        </label>
        <div className="receipt-upload" onDragOver={(e) => e.preventDefault()}>
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Receipt Preview"
              className="mx-auto max-h-[120px] object-contain"
            />
          ) : (
            <>
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                className="mx-auto mb-2 block"
                aria-hidden
              >
                <path
                  d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"
                  stroke="#64748b"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <div className="text-sm text-[#64748b]">
                Tap to upload receipt screenshot
              </div>
            </>
          )}
          <input
            id="receipt"
            name="receipt"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            required
            className="receipt-upload-input"
          />
        </div>
      </div>

      {scanStatus && (
        <div className={`text-xs rounded-lg px-3 py-2 ${isScanning ? "bg-[rgba(99,102,241,0.1)] text-[#818cf8]" : "bg-[rgba(16,185,129,0.1)] text-[var(--color-status-paid)]"}`}>
          <div className="flex items-center gap-2">
            {isScanning && (
              <svg className="animate-spin h-3.5 w-3.5 text-[#818cf8]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>{scanStatus}</span>
          </div>
        </div>
      )}

      {state?.error && (
        <div className="rounded-lg bg-[rgba(239,68,68,0.1)] px-3 py-2 text-sm text-[var(--color-status-overdue)]">
          {state.error}
        </div>
      )}
      {state?.success && (
        <div className="rounded-lg bg-[rgba(16,185,129,0.1)] px-3 py-2 text-sm text-[var(--color-status-paid)]">
          Payment submitted successfully! Waiting for admin review.
        </div>
      )}

      <button
        id="submit-payment-btn"
        type="submit"
        disabled={pending || isScanning}
        className="btn btn-primary w-full py-3 uppercase tracking-wide"
      >
        {pending ? "Submitting…" : isScanning ? "Scanning Receipt…" : "Submit Payment"}
      </button>
    </form>
  );
}

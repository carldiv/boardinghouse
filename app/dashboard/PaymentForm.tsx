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

  const [amountVal, setAmountVal] = useState(() => {
    const initialMonth = getInitialMonth();
    const item = ledger[initialMonth];
    const remaining = item ? item.remainingAmount : rentAmount;
    return (remaining > 0 ? remaining : rentAmount).toString();
  });

  const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedMonth(val);
    const item = ledger[val];
    const remaining = item ? item.remainingAmount : rentAmount;
    setAmountVal((remaining > 0 ? remaining : rentAmount).toString());
  };

  useEffect(() => {
    if (state?.success) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreview(null);
      formRef.current?.reset();
    }
  }, [state]);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreview(url);
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
                } else if (item.remainingAmount > 0) {
                  suffix = ` — ${formatPeso(item.remainingAmount)}`;
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
        disabled={pending}
        className="btn btn-primary w-full py-3 uppercase tracking-wide"
      >
        {pending ? "Submitting…" : "Submit Payment"}
      </button>
    </form>
  );
}

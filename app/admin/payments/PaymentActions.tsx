"use client";

import { useTransition } from "react";
import { confirmPayment } from "@/actions/payments";

function Spinner() {
  return (
    <svg
      className="animate-spin"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      width={14}
      height={14}
      style={{ display: "inline-block" }}
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

export default function PaymentActions({
  paymentId,
  rejectHref,
}: {
  paymentId: string;
  rejectHref: string;
}) {
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      await confirmPayment(paymentId);
    });
  };

  return (
    <div style={{ display: "flex", gap: "0.4rem" }}>
      <button
        id={`confirm-payment-${paymentId}`}
        type="button"
        onClick={handleConfirm}
        disabled={isPending}
        className="btn btn-success btn-sm"
        style={{
          minWidth: "2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: isPending ? 0.7 : 1,
          transition: "opacity 0.2s",
        }}
        title="Confirm payment"
      >
        {isPending ? <Spinner /> : "✓"}
      </button>

      <a
        href={rejectHref}
        className="btn btn-danger btn-sm"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textDecoration: "none",
          pointerEvents: isPending ? "none" : "auto",
          opacity: isPending ? 0.4 : 1,
          transition: "opacity 0.2s",
        }}
        title="Reject payment"
      >
        ✗
      </a>
    </div>
  );
}

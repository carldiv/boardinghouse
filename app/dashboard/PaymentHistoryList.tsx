import { formatDate, formatMonth, formatPeso, type PaymentRow } from "@/lib/utils";
import { PAYMENT_STATUS_CONFIG } from "./status-config";

interface PaymentHistoryListProps {
  payments: PaymentRow[];
}

export default function PaymentHistoryList({ payments }: PaymentHistoryListProps) {
  if (payments.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-[var(--text-muted)]">No payments yet.</p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {payments.map((p) => {
        const cfg = PAYMENT_STATUS_CONFIG[p.status];
        return (
          <div key={p.id} className="history-card">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="font-semibold text-[var(--foreground)]">
                {formatMonth(p.month)}
              </span>
              <span className={`badge badge-${cfg.badge}`}>{cfg.label}</span>
            </div>
            <p className="mb-1 text-sm text-[var(--text-muted)]">
              {formatPeso(p.amount)} · Ref: {p.ref_number}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              Submitted {formatDate(p.submitted_at)}
            </p>
            {p.admin_note && (
              <p className="mt-2 rounded-md bg-[rgba(239,68,68,0.08)] px-3 py-2 text-xs text-[#f87171]">
                {p.admin_note}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

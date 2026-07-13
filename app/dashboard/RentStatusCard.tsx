import {
  computeNextDueDate,
  formatMonth,
  formatPeso,
  toMonthISO,
  type PaymentRow,
  type PaymentStatus,
  type TenantRow,
} from "@/lib/utils";
import { STATUS_CONFIG } from "./status-config";

function computeCurrentDueDate(dueDay: number, now: Date): Date {
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const day = Math.min(dueDay, lastDay);
  return new Date(now.getFullYear(), now.getMonth(), day);
}

interface RentStatusCardProps {
  tenant: TenantRow;
  status: PaymentStatus;
  payments: PaymentRow[];
  now?: Date;
}

export default function RentStatusCard({
  tenant,
  status,
  payments,
  now = new Date(),
}: RentStatusCardProps) {
  const cfg = STATUS_CONFIG[status];
  const currentMonthISO = toMonthISO(now);
  const currentMonthLabel = formatMonth(currentMonthISO);
  const dueDate = computeCurrentDueDate(tenant.due_day, now);

  const currentMonthPayments = payments.filter(
    (p) => p.month === currentMonthISO
  );
  const confirmedTotal = currentMonthPayments
    .filter((p) => p.status === "confirmed")
    .reduce((sum, p) => sum + p.amount, 0);

  const remainingBalance = Math.max(0, tenant.rent_amount - confirmedTotal);

  const lastConfirmed = payments.find((p) => p.status === "confirmed");
  const nextDueDate =
    status === "paid" && lastConfirmed?.confirmed_at
      ? computeNextDueDate(tenant.due_day, new Date(lastConfirmed.confirmed_at))
      : null;

  return (
    <div
      className="card glow-pulse"
      style={{
        background: `linear-gradient(135deg, ${cfg.bg}, var(--surface-1))`,
        border: `1px solid ${cfg.border}`,
      }}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="m-0 text-sm font-semibold text-[var(--text-muted)]">
          Monthly Rent Status
        </h2>
        <span className={`badge badge-${status}`}>
          {cfg.emoji} {cfg.label}
        </span>
      </div>

      <p className="mb-4 text-xl font-bold text-[var(--foreground)]">
        {currentMonthLabel}
      </p>

      <div className="flex gap-6 border-t pt-4" style={{ borderColor: cfg.border }}>
        <div>
          <div className="mb-1 text-xs font-medium text-[var(--text-muted)]">Due Date</div>
          <div className="text-sm font-semibold text-[var(--text-primary)]">
            {dueDate.toLocaleDateString("en-PH", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>
        <div>
          <div className="mb-1 text-xs font-medium text-[var(--text-muted)]">
            {status === "paid" ? "Amount Paid" : "Amount Due"}
          </div>
          <div className="text-sm font-semibold" style={{ color: cfg.color }}>
            {formatPeso(status === "paid" ? tenant.rent_amount : remainingBalance)}
          </div>
        </div>
      </div>

      {nextDueDate && (
        <div className="mt-4 border-t pt-4" style={{ borderColor: cfg.border }}>
          <div className="mb-1 text-xs font-medium text-[var(--text-muted)]">Next Due Date</div>
          <div className="text-sm font-semibold text-[var(--color-status-paid)]">
            {nextDueDate.toLocaleDateString("en-PH", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>
      )}
    </div>
  );
}

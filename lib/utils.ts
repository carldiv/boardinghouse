export type PaymentStatus = "paid" | "pending" | "due" | "overdue";

export interface TenantRow {
  id: string;
  name: string;
  room: string;
  rent_amount: number;
  due_day: number;
  auth_user_id: string | null;
}

export interface PaymentRow {
  id: string;
  tenant_id: string;
  month: string; // ISO date string "YYYY-MM-DD" (first day of month)
  amount: number;
  ref_number: string;
  receipt_url: string | null;
  status: "pending" | "confirmed" | "rejected";
  submitted_at: string;
  confirmed_at: string | null;
  admin_note: string | null;
}

export interface Settings {
  gcash_name: string | null;
  gcash_number: string | null;
  qr_image_url: string | null;
}

/**
 * Computes the payment status for a tenant for the current month.
 * - 'paid'    → confirmed payment exists for current month
 * - 'pending' → submitted (pending) payment exists, not yet confirmed
 * - 'overdue' → past due_day, no confirmed/pending payment
 * - 'due'     → within the month, no payment yet
 */
export function computeStatus(
  tenant: TenantRow,
  payments: PaymentRow[],
  now: Date = new Date()
): PaymentStatus {
  const currentMonthISO = toMonthISO(now);

  const currentMonthPayments = payments.filter(
    (p) => p.tenant_id === tenant.id && p.month === currentMonthISO
  );

  const confirmedTotal = currentMonthPayments
    .filter((p) => p.status === "confirmed")
    .reduce((sum, p) => sum + p.amount, 0);

  if (confirmedTotal >= tenant.rent_amount) return "paid";

  if (currentMonthPayments.some((p) => p.status === "pending")) return "pending";

  // No payment or underpaid for this month — check if overdue
  if (now.getDate() > tenant.due_day) return "overdue";
  return "due";
}

/**
 * Computes the next due date after a payment is confirmed.
 * Handles month overflow (e.g. due_day=31 in February → Feb 28/29).
 */
export function computeNextDueDate(dueDay: number, fromDate: Date = new Date()): Date {
  // Next month = month + 1
  const nextMonth = new Date(fromDate.getFullYear(), fromDate.getMonth() + 1, 1);
  const lastDayOfNextMonth = new Date(
    nextMonth.getFullYear(),
    nextMonth.getMonth() + 1,
    0
  ).getDate();
  const day = Math.min(dueDay, lastDayOfNextMonth);
  return new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day);
}

/** Formats a number as Philippine peso string: ₱ 3,500.00 */
export function formatPeso(amount: number): string {
  return "₱ " + amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Converts a Date to "YYYY-MM-01" (first day of the month) */
export function toMonthISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}-01`;
}

/** Converts a "YYYY-MM-01" ISO string to a human-readable month label "July 2025" */
export function formatMonth(iso: string): string {
  const [y, m] = iso.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric",
  });
}

/** Formats a full date string to a short readable format */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Returns an array of the last N month ISO strings (most recent first) */
export function recentMonths(n: number, from: Date = new Date()): string[] {
  const months: string[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(from.getFullYear(), from.getMonth() - i, 1);
    months.push(toMonthISO(d));
  }
  return months;
}

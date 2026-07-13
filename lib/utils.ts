export type PaymentStatus = "paid" | "pending" | "due" | "overdue";

export interface TenantRow {
  id: string;
  name: string;
  room: string;
  rent_amount: number;
  due_day: number;
  auth_user_id: string | null;
  created_at?: string;
  move_in_date?: string | null;
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

export interface MonthLedger {
  month: string;
  rentAmount: number;
  confirmedPaid: number;
  pendingPaid: number;
  status: PaymentStatus;
  remainingAmount: number;
}

export function getTenantMonthsRange(createdAt?: string | null, now: Date = new Date()): string[] {
  const months: string[] = [];
  
  const currentYear = now.getFullYear();
  let startYear = currentYear;
  let startMonth = 0; // Default to January of current year

  if (createdAt) {
    const regDate = new Date(createdAt);
    startYear = regDate.getFullYear();
    startMonth = 0; // Always start from January of the creation year (show all months)
  }

  let endYear = currentYear;
  let endMonth = 11; // Always end at December of the current year

  // Also include up to 2 months in advance for advance payments
  const advanceDate = new Date(now.getFullYear(), now.getMonth() + 2, 1);
  if (advanceDate.getFullYear() > endYear) {
    endYear = advanceDate.getFullYear();
    endMonth = advanceDate.getMonth();
  }

  let currYear = startYear;
  let currMonth = startMonth;

  while (currYear < endYear || (currYear === endYear && currMonth <= endMonth)) {
    const mISO = `${currYear}-${String(currMonth + 1).padStart(2, "0")}-01`;
    months.push(mISO);

    currMonth++;
    if (currMonth > 11) {
      currMonth = 0;
      currYear++;
    }
  }

  return months;
}

/**
 * Distributes payments sequentially (rollover logic) to compute the ledger details of each month.
 */
export function computeTenantLedger(
  tenant: TenantRow,
  payments: PaymentRow[],
  now: Date = new Date()
): Record<string, MonthLedger> {
  const months = getTenantMonthsRange(tenant.created_at, now);
  const chronologicalMonths = [...months].reverse();

  // Prefer explicit move_in_date; fall back to created_at
  const startSource = tenant.move_in_date ?? tenant.created_at;
  const tenantStartISO = startSource ? toMonthISO(new Date(startSource)) : "";
  const ledger: Record<string, MonthLedger> = {};
  for (const m of chronologicalMonths) {
    const isBeforeStart = tenantStartISO && m < tenantStartISO;
    const rentAmount = isBeforeStart ? 0 : tenant.rent_amount;
    ledger[m] = {
      month: m,
      rentAmount: rentAmount,
      confirmedPaid: 0,
      pendingPaid: 0,
      status: isBeforeStart ? "paid" : "due",
      remainingAmount: rentAmount,
    };
  }

  // Populate actual confirmed and pending payments
  for (const p of payments) {
    if (p.tenant_id !== tenant.id) continue;
    const m = p.month;
    if (!ledger[m]) {
      const isBeforeStart = tenantStartISO && m < tenantStartISO;
      const rentAmount = isBeforeStart ? 0 : tenant.rent_amount;
      ledger[m] = {
        month: m,
        rentAmount: rentAmount,
        confirmedPaid: 0,
        pendingPaid: 0,
        status: isBeforeStart ? "paid" : "due",
        remainingAmount: rentAmount,
      };
      chronologicalMonths.push(m);
    }

    if (p.status === "confirmed") {
      ledger[m].confirmedPaid += p.amount;
    } else if (p.status === "pending") {
      ledger[m].pendingPaid += p.amount;
    }
  }

  chronologicalMonths.sort();

  // Distribute Confirmed Excess payments
  let confirmedExcessPool = 0;
  for (const m of chronologicalMonths) {
    const item = ledger[m];
    if (item.confirmedPaid > item.rentAmount) {
      confirmedExcessPool += (item.confirmedPaid - item.rentAmount);
      item.confirmedPaid = item.rentAmount;
    }
  }

  for (const m of chronologicalMonths) {
    const item = ledger[m];
    if (item.confirmedPaid < item.rentAmount) {
      const deficit = item.rentAmount - item.confirmedPaid;
      const allocated = Math.min(deficit, confirmedExcessPool);
      item.confirmedPaid += allocated;
      confirmedExcessPool -= allocated;
    }
  }

  // Distribute Pending Excess payments
  let pendingExcessPool = 0;
  for (const m of chronologicalMonths) {
    const item = ledger[m];
    if (item.pendingPaid > 0) {
      const confirmedShortage = Math.max(0, item.rentAmount - item.confirmedPaid);
      if (item.pendingPaid > confirmedShortage) {
        pendingExcessPool += (item.pendingPaid - confirmedShortage);
        item.pendingPaid = confirmedShortage;
      }
    }
  }

  for (const m of chronologicalMonths) {
    const item = ledger[m];
    const shortage = item.rentAmount - item.confirmedPaid - item.pendingPaid;
    if (shortage > 0 && pendingExcessPool > 0) {
      const allocated = Math.min(shortage, pendingExcessPool);
      item.pendingPaid += allocated;
      pendingExcessPool -= allocated;
    }
  }

  // Compute final status and remaining values
  for (const m of chronologicalMonths) {
    const item = ledger[m];
    item.remainingAmount = Math.max(0, item.rentAmount - item.confirmedPaid);

    if (item.confirmedPaid >= item.rentAmount) {
      item.status = "paid";
    } else if (item.confirmedPaid + item.pendingPaid >= item.rentAmount) {
      item.status = "pending";
    } else {
      const [y, monthPart] = m.split("-").map(Number);
      const lastDay = new Date(y, monthPart, 0).getDate();
      const dueDay = Math.min(tenant.due_day, lastDay);
      const dueDate = new Date(y, monthPart - 1, dueDay);

      if (now > dueDate) {
        item.status = "overdue";
      } else {
        item.status = "due";
      }
    }
  }

  return ledger;
}

/**
 * Computes the payment status for a tenant for the current month.
 */
export function computeStatus(
  tenant: TenantRow,
  payments: PaymentRow[],
  now: Date = new Date()
): PaymentStatus {
  const ledger = computeTenantLedger(tenant, payments, now);
  const currentMonthISO = toMonthISO(now);
  return ledger[currentMonthISO]?.status ?? "due";
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

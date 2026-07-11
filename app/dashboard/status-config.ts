import type { PaymentStatus } from "@/lib/utils";

export const STATUS_CONFIG: Record<
  PaymentStatus,
  { label: string; emoji: string; color: string; bg: string; border: string }
> = {
  paid: {
    label: "Paid",
    emoji: "✅",
    color: "var(--color-status-paid)",
    bg: "rgba(16,185,129,0.1)",
    border: "rgba(16,185,129,0.25)",
  },
  pending: {
    label: "Pending Review",
    emoji: "🕐",
    color: "var(--color-status-pending)",
    bg: "rgba(245,158,11,0.1)",
    border: "rgba(245,158,11,0.25)",
  },
  due: {
    label: "Due",
    emoji: "📅",
    color: "var(--color-status-due)",
    bg: "rgba(99,102,241,0.1)",
    border: "rgba(99,102,241,0.25)",
  },
  overdue: {
    label: "Overdue",
    emoji: "⚠️",
    color: "var(--color-status-overdue)",
    bg: "rgba(239,68,68,0.1)",
    border: "rgba(239,68,68,0.25)",
  },
};

export const PAYMENT_STATUS_CONFIG = {
  confirmed: { label: "Paid", badge: "confirmed" as const },
  pending: { label: "Pending", badge: "pending" as const },
  rejected: { label: "Rejected", badge: "rejected" as const },
};

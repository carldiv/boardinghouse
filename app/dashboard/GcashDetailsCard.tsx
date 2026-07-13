import CopyButton from "./CopyButton";
import type { Settings } from "@/lib/utils";

interface GcashDetailsCardProps {
  settings: Settings;
}

export default function GcashDetailsCard({ settings }: GcashDetailsCardProps) {
  if (!settings.gcash_name && !settings.gcash_number) return null;

  return (
    <div className="card">
      <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-[var(--text-muted)]">
        Pay via GCash
      </h2>

      <div className="flex flex-col gap-4">
        {settings.gcash_name && (
          <div>
            <div className="mb-1 text-xs font-medium text-[var(--text-muted)]">Account Name</div>
            <div className="text-base font-bold text-[var(--text-primary)]">{settings.gcash_name}</div>
          </div>
        )}
        {settings.gcash_number && (
          <div>
            <div className="mb-1 text-xs font-medium text-[var(--text-muted)]">Mobile Number</div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-base font-bold text-[var(--color-status-paid)]">
                {settings.gcash_number}
              </span>
              <CopyButton text={settings.gcash_number} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

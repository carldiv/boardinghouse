"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface SettingsMenuProps {
  logoutAction: () => Promise<void>;
}

export default function SettingsMenu({ logoutAction }: SettingsMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-[var(--color-surface-3)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[#94a3b8]"
        aria-label="Settings"
        aria-expanded={open}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
          <path
            d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 min-w-[160px] overflow-hidden rounded-lg border border-[var(--color-surface-3)] bg-[var(--color-surface-1)] shadow-lg">
          <Link
            href="/dashboard/profile"
            onClick={() => setOpen(false)}
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[#94a3b8] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--foreground)] border-b border-[var(--color-surface-2)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden style={{ opacity: 0.7 }}>
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Edit Profile
          </Link>
          
          <form
            action={logoutAction}
            onSubmit={() => setOpen(false)}
          >
            <button
              id="tenant-logout"
              type="submit"
              className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-[#94a3b8] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--foreground)]"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

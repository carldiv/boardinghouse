"use client";

import { useEffect, useRef, useCallback } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const IDLE_TIMEOUT_MS = 3 * 60 * 1000; // 3 minutes

const ACTIVITY_EVENTS = [
  "mousemove",
  "mousedown",
  "keydown",
  "touchstart",
  "scroll",
  "click",
] as const;

export default function IdleLogout() {
  const router = useRouter();
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doLogout = useCallback(async () => {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
  }, [router]);

  const resetTimer = useCallback(() => {
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(doLogout, IDLE_TIMEOUT_MS);
  }, [doLogout]);

  useEffect(() => {
    resetTimer();

    ACTIVITY_EVENTS.forEach((event) =>
      window.addEventListener(event, resetTimer, { passive: true })
    );

    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
      ACTIVITY_EVENTS.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
    };
  }, [resetTimer]);

  return null;
}

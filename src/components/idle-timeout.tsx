"use client";

import { useEffect } from "react";
import { signOutAction } from "@/app/dashboard/actions";

// Change these two numbers to change the timeout.
const IDLE_LIMIT_MS = 30 * 60 * 1000; // signed out after 30 minutes of no activity
const MAX_SESSION_MS = 12 * 60 * 60 * 1000; // and always after 12 hours
const KEY = "contriq:last-active";

export function IdleTimeout({ signedInAt }: { signedInAt: string }) {
  useEffect(() => {
    const signedIn = Date.parse(signedInAt) || 0;
    let signingOut = false;
    let lastWrite = 0;

    function readLast(): number | null {
      try {
        const v = Number(localStorage.getItem(KEY));
        return v > 0 ? v : null;
      } catch {
        return null;
      }
    }

    function touch() {
      try {
        localStorage.setItem(KEY, String(Date.now()));
      } catch {
        // Storage can be unavailable; the timer simply won't persist.
      }
    }

    function expired() {
      const now = Date.now();
      const last = readLast();
      const idle = last !== null && now - last > IDLE_LIMIT_MS;
      const tooOld = signedIn > 0 && now - signedIn > MAX_SESSION_MS;
      return idle || tooOld;
    }

    function check() {
      if (signingOut) return;
      if (expired()) {
        signingOut = true;
        void signOutAction();
      }
    }

    function onActivity() {
      check();
      if (signingOut) return;
      const now = Date.now();
      if (now - lastWrite > 15000) {
        lastWrite = now;
        touch();
      }
    }

    // A timestamp older than this sign-in belongs to a previous session.
    const stored = readLast();
    if (stored === null || stored < signedIn) {
      touch();
    } else {
      check();
    }

    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    document.addEventListener("visibilitychange", check);
    const timer = window.setInterval(check, 30000);

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      document.removeEventListener("visibilitychange", check);
      window.clearInterval(timer);
    };
  }, [signedInAt]);

  return null;
}
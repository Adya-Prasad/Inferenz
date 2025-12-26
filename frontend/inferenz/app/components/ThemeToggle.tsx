"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  // Start with a deterministic value for SSR (server and first client render).
  const [theme, setTheme] = useState<string>("light");
  // Track whether we've mounted so we can avoid rendering theme-dependent
  // UI during SSR/hydration and prevent hydration mismatches.
  const [mounted, setMounted] = useState(false);

  // On mount, read persisted preference / media query and update state.
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme");
    const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
    setTheme(stored || (prefersDark ? "dark" : "light"));
  }, []);

  // Apply theme attribute and persist changes whenever `theme` changes.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "light" ? "dark" : "light"));

  return (
    <button
      aria-label="Toggle theme"
      onClick={toggle}
      className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium border border-transparent bg-white/[.06] hover:bg-white/[.08] dark:bg-black/[.06] dark:hover:bg-black/[.08]"
    >
      {mounted ? (
        theme === "light" ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M12 3v2" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12 19v2" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M4.2 4.2l1.4 1.4" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18.4 18.4l1.4 1.4" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="12" r="4" stroke="#111827" strokeWidth="1.5" fill="#fff" />
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="#f9fafb" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )
      ) : (
        // Render the light (sun) icon as a deterministic fallback during SSR/hydration.
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M12 3v2" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M12 19v2" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4.2 4.2l1.4 1.4" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18.4 18.4l1.4 1.4" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="4" stroke="#111827" strokeWidth="1.5" fill="#fff" />
        </svg>
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  );
}

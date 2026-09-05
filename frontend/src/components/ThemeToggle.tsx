"use client";

import * as React from "react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg bg-surface-container-low text-text-muted hover:text-text-ink hover:bg-surface-container transition-all flex items-center justify-center cursor-pointer shadow-sm border border-surface-container relative overflow-hidden"
      aria-label="Toggle theme"
    >
      <span className="material-symbols-outlined text-[20px] transition-transform duration-300 transform dark:rotate-180 dark:opacity-0 absolute">
        light_mode
      </span>
      <span className="material-symbols-outlined text-[20px] transition-transform duration-300 transform -rotate-180 opacity-0 dark:rotate-0 dark:opacity-100">
        dark_mode
      </span>
    </button>
  );
}

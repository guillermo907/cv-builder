"use client";

import { useEffect, useSyncExternalStore } from "react";
import styles from "./theme-mode-toggle.module.scss";

type ThemeMode = "dark" | "light";

const storageKey = "auto-gdl-theme";
const changeEvent = "auto-gdl-theme-change";

function readStoredTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "dark";
  }

  try {
    const value = window.localStorage.getItem(storageKey);

    return value === "light" || value === "dark" ? value : "dark";
  } catch {
    return "dark";
  }
}

function subscribeTheme(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(changeEvent, callback);

  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(changeEvent, callback);
  };
}

function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.theme = mode;
  document.documentElement.style.colorScheme = mode;
}

function storeTheme(mode: ThemeMode) {
  applyTheme(mode);

  try {
    window.localStorage.setItem(storageKey, mode);
  } catch {
    // Storage can be unavailable in private or restricted contexts.
  }

  window.dispatchEvent(new Event(changeEvent));
}

export function ThemeModeToggle() {
  const mode = useSyncExternalStore<ThemeMode>(subscribeTheme, readStoredTheme, () => "dark");

  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  return (
    <button
      className={styles.toggle}
      type="button"
      onClick={() => storeTheme(mode === "dark" ? "light" : "dark")}
      aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} theme`}
      aria-pressed={mode === "light"}
    >
      <span className={styles.track} aria-hidden="true">
        <span className={styles.sun}>☀</span>
        <span className={styles.moon}>☾</span>
        <span className={styles.knob} />
      </span>
    </button>
  );
}

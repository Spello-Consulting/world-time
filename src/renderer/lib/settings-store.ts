import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "world-time:settings";

export interface WorldTimeSettings {
  militaryTime: boolean;
}

const DEFAULT_SETTINGS: WorldTimeSettings = {
  militaryTime: false,
};

function loadSettings(): WorldTimeSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return DEFAULT_SETTINGS;
    const obj = parsed as Record<string, unknown>;
    return {
      militaryTime: typeof obj.militaryTime === "boolean" ? obj.militaryTime : false,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings: WorldTimeSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<WorldTimeSettings>(loadSettings);

  // Persist on change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Listen for changes from other windows (e.g. the Settings window)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setSettings(loadSettings());
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const setMilitaryTime = useCallback((value: boolean) => {
    setSettings((prev) => ({ ...prev, militaryTime: value }));
  }, []);

  return { settings, setMilitaryTime };
}

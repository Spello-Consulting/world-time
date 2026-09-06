import { useCallback, useEffect, useState } from "react";
import { MAX_CITIES, type City, CITY_DATABASE } from "./cities";

const STORAGE_KEY = "world-time:selected-cities";

function loadSelectedCityIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultCityIds();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaultCityIds();
    const ids = parsed.filter((v): v is string => typeof v === "string");
    return ids.slice(0, MAX_CITIES);
  } catch {
    return defaultCityIds();
  }
}

function defaultCityIds(): string[] {
  return ["new-york", "london", "tokyo", "sydney"];
}

function saveSelectedCityIds(ids: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // localStorage might be unavailable; ignore
  }
}

export function useCitySelection() {
  const [selectedIds, setSelectedIds] = useState<string[]>(loadSelectedCityIds);

  useEffect(() => {
    saveSelectedCityIds(selectedIds);
  }, [selectedIds]);

  const addCity = useCallback((id: string) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev;
      if (prev.length >= MAX_CITIES) return prev;
      return [...prev, id];
    });
  }, []);

  const removeCity = useCallback((id: string) => {
    setSelectedIds((prev) => prev.filter((c) => c !== id));
  }, []);

  const reorderCity = useCallback((id: string, direction: -1 | 1) => {
    setSelectedIds((prev) => {
      const idx = prev.indexOf(id);
      if (idx === -1) return prev;
      const newIdx = idx + direction;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[newIdx]] = [next[newIdx], next[idx]];
      return next;
    });
  }, []);

  const setCities = useCallback((ids: string[]) => {
    setSelectedIds(ids.slice(0, MAX_CITIES));
  }, []);

  const canAdd = selectedIds.length < MAX_CITIES;

  return { selectedIds, addCity, removeCity, reorderCity, setCities, canAdd };
}

export type CitySelection = ReturnType<typeof useCitySelection>;

export function cityById(id: string): City | undefined {
  return CITY_DATABASE.find((c) => c.id === id);
}

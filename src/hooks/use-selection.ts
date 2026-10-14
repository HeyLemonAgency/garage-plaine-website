import { useCallback, useEffect, useState } from "react";
import { isListingPath } from "@/lib/autolina";

// "Ma sélection": listings a visitor hearts, kept in this browser only.
const KEY = "garage-plaine-selection-v1";
const MAX = 12;

function read(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(value)
      ? value.filter((p): p is string => typeof p === "string" && isListingPath(p)).slice(-MAX)
      : [];
  } catch {
    return [];
  }
}

export function useSelection() {
  const [paths, setPaths] = useState<string[]>([]);
  // Read after mount so the server-rendered page and the first client render match.
  useEffect(() => {
    setPaths(read());
    const onStorage = (e: StorageEvent) => e.key === KEY && setPaths(read());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = useCallback((path: string) => {
    setPaths((prev) => {
      const next = prev.includes(path)
        ? prev.filter((p) => p !== path)
        : [...prev, path].slice(-MAX);
      try {
        localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // Storage unavailable (private mode): the selection lasts for this visit.
      }
      return next;
    });
  }, []);

  return { paths, toggle };
}

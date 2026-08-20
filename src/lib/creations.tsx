import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { BoardEntry } from "@/lib/barista-data";

const KEY = "scoffey-creations";

type CreationsContextValue = {
  saved: BoardEntry[];
  addCreation: (entry: BoardEntry) => void;
};

const CreationsContext = createContext<CreationsContextValue | null>(null);

function readSaved(): BoardEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as BoardEntry[]) : [];
  } catch {
    return [];
  }
}

export function CreationsProvider({ children }: { children: ReactNode }) {
  const [saved, setSaved] = useState<BoardEntry[]>(readSaved);

  useEffect(() => {
    window.localStorage.setItem(KEY, JSON.stringify(saved));
  }, [saved]);

  const addCreation = (entry: BoardEntry) => {
    setSaved((prev) => [entry, ...prev]);
  };

  return (
    <CreationsContext.Provider value={{ saved, addCreation }}>
      {children}
    </CreationsContext.Provider>
  );
}

export function useCreations() {
  const ctx = useContext(CreationsContext);
  if (!ctx) throw new Error("useCreations must be used within CreationsProvider");
  return ctx;
}

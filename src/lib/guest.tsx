import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  KEY,
  findGuestByPhone,
  guestSchema,
  saveToRegistry,
  type Guest,
  type GuestInput,
} from "./guest-utils";

export type { Guest, GuestInput } from "./guest-utils";

function readGuest(): Guest | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    const result = guestSchema.safeParse(parsed);
    if (!result.success) return null;
    const since =
      typeof (parsed as { since?: unknown }).since === "string"
        ? (parsed as { since: string }).since
        : new Date().toISOString();
    return { ...result.data, since };
  } catch {
    return null;
  }
}

export function GuestProvider({ children }: { children: ReactNode }) {
  const [guest, setGuest] = useState<Guest | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setGuest(readGuest());
    setReady(true);
  }, []);

  const signInAsGuest = (input: GuestInput) => {
    const parsed = guestSchema.parse(input);
    const next: Guest = { ...parsed, since: new Date().toISOString() };
    localStorage.setItem(KEY, JSON.stringify(next));
    saveToRegistry(next);
    setGuest(next);
    return next;
  };

  const signInWithPhone = (phone: string) => {
    const found = findGuestByPhone(phone);
    if (!found) return null;
    localStorage.setItem(KEY, JSON.stringify(found));
    setGuest(found);
    return found;
  };

  const signOut = () => {
    localStorage.removeItem(KEY);
    setGuest(null);
  };

  return (
    <GuestContext.Provider value={{ guest, ready, signInAsGuest, signInWithPhone, signOut }}>

      {children}
    </GuestContext.Provider>
  );
}

export function useGuest() {
  const ctx = useContext(GuestContext);
  if (!ctx) throw new Error("useGuest must be used within GuestProvider");
  return ctx;
}

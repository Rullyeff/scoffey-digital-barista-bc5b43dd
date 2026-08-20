import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { z } from "zod";

const KEY = "scoffey.guest";
const REGISTRY_KEY = "scoffey.guests";

// Messages are i18n keys (see src/lib/i18n.tsx) so the UI can localize them.
export const guestSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "err.name.min" })
    .max(40, { message: "err.name.max" })
    .regex(/^[\p{L}\p{M}\s.'-]+$/u, { message: "err.name.chars" }),
  phone: z
    .string()
    .trim()
    .min(8, { message: "err.phone.min" })
    .max(20, { message: "err.phone.max" })
    .regex(/^\+?[0-9][0-9\s-]*$/, { message: "err.phone.format" })
    .refine((v) => v.replace(/\D/g, "").length >= 8 && v.replace(/\D/g, "").length <= 15, {
      message: "err.phone.digits",
    }),
});

export type GuestInput = z.infer<typeof guestSchema>;
export type Guest = GuestInput & { since: string };

/** 081234567890 -> 6281234567890 */
export function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("62")) return digits;
  return digits;
}

type GuestContextValue = {
  guest: Guest | null;
  ready: boolean;
  signInAsGuest: (input: GuestInput) => Guest;
  signInWithPhone: (phone: string) => Guest | null;
  signOut: () => void;
};

const GuestContext = createContext<GuestContextValue | null>(null);

function readRegistry(): Guest[] {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((item) => {
      const result = guestSchema.safeParse(item);
      if (!result.success) return [];
      const since =
        typeof (item as { since?: unknown }).since === "string"
          ? (item as { since: string }).since
          : new Date().toISOString();
      return [{ ...result.data, since }];
    });
  } catch {
    return [];
  }
}

function saveToRegistry(guest: Guest) {
  const list = readRegistry().filter(
    (g) => normalizePhone(g.phone) !== normalizePhone(guest.phone),
  );
  list.push(guest);
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(list));
}

export function findGuestByPhone(phone: string): Guest | null {
  const target = normalizePhone(phone);
  return readRegistry().find((g) => normalizePhone(g.phone) === target) ?? null;
}


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

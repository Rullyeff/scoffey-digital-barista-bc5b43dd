import { z } from "zod";

export const KEY = "scoffey.guest";
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

export function saveToRegistry(guest: Guest) {
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

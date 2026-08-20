import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const phoneSchema = z
  .string()
  .trim()
  .min(8)
  .max(20)
  .regex(/^\+?[0-9][0-9\s-]*$/);

type CustomerRow = { id: string; name: string; phone: string; status: string };

export const listPublicCreations = createServerFn({ method: "GET" }).handler(async () => {
  const { publicDb } = await import("@/lib/db.server");
  const { data } = await publicDb()
    .from("creations")
    .select("id, name, creator, taste, rating, votes")
    .eq("is_hidden", false)
    .order("rating", { ascending: false })
    .limit(30);
  return data ?? [];
});

export const registerCustomer = createServerFn({ method: "POST" })
  .inputValidator((input: { name: string; phone: string }) =>
    z.object({ name: z.string().trim().min(2).max(40), phone: phoneSchema }).parse(input),
  )
  .handler(async ({ data }) => {
    const { publicDb, normalizePhone } = await import("@/lib/db.server");
    const { rpc } = await import("@/lib/rpc.server");
    const { data: rows, error } = await rpc<CustomerRow[]>(publicDb(), "register_customer", {
      p_name: data.name,
      p_phone: data.phone,
      p_phone_normalized: normalizePhone(data.phone),
    });
    const row = rows?.[0];
    if (error || !row) return { ok: false as const, reason: "error" as const };
    if (row.status === "exists") return { ok: false as const, reason: "exists" as const };
    return { ok: true as const, customer: { id: row.id, name: row.name, phone: row.phone } };
  });

export const loginCustomer = createServerFn({ method: "POST" })
  .inputValidator((input: { phone: string }) => z.object({ phone: phoneSchema }).parse(input))
  .handler(async ({ data }) => {
    const { publicDb, normalizePhone } = await import("@/lib/db.server");
    const { rpc } = await import("@/lib/rpc.server");
    const { data: rows, error } = await rpc<CustomerRow[]>(publicDb(), "login_customer", {
      p_phone_normalized: normalizePhone(data.phone),
    });
    const row = rows?.[0];
    if (error || !row) return { ok: false as const, reason: "notfound" as const };
    if (row.status === "blocked") return { ok: false as const, reason: "blocked" as const };
    if (row.status !== "ok") return { ok: false as const, reason: "notfound" as const };
    return { ok: true as const, customer: { id: row.id, name: row.name, phone: row.phone } };
  });

export const saveCreation = createServerFn({ method: "POST" })
  .inputValidator((input: { name: string; creator: string; taste: string; rating: number; customerId?: string }) =>
    z
      .object({
        name: z.string().trim().min(1).max(80),
        creator: z.string().trim().min(1).max(40),
        taste: z.string().trim().max(120).default(""),
        rating: z.number().min(0).max(5),
        customerId: z.string().uuid().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { publicDb } = await import("@/lib/db.server");
    const { data: row } = await publicDb()
      .from("creations")
      .insert({
        name: data.name,
        creator: data.creator,
        taste: data.taste,
        rating: data.rating,
        ...(data.customerId ? { customer_id: data.customerId } : {}),
      })
      .select("id, name, creator, taste, rating, votes")
      .single();
    return { ok: !!row, creation: row };
  });

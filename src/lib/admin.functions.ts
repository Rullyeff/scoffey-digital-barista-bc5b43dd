import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

type AdminCustomer = {
  id: string;
  name: string;
  phone: string;
  note: string | null;
  is_blocked: boolean;
  created_at: string;
};

type AdminCreation = {
  id: string;
  name: string;
  creator: string;
  taste: string;
  rating: number;
  votes: number;
  is_hidden: boolean;
  is_featured: boolean;
  created_at: string;
};

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((input: { phone: string }) => z.object({ phone: z.string().trim().max(20) }).parse(input))
  .handler(async ({ data }) => {
    const { ADMIN_PHONE, getAdminSession } = await import("@/lib/admin-session.server");
    const { normalizePhone } = await import("@/lib/db.server");
    if (normalizePhone(data.phone) !== normalizePhone(ADMIN_PHONE)) {
      return { ok: false as const };
    }
    const session = await getAdminSession();
    await session.update({ isAdmin: true });
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const { getAdminSession } = await import("@/lib/admin-session.server");
  const session = await getAdminSession();
  await session.clear();
  return { ok: true as const };
});

export const adminMe = createServerFn({ method: "GET" }).handler(async () => {
  const { isAdmin } = await import("@/lib/admin-session.server");
  return { isAdmin: await isAdmin() };
});

export const adminOverview = createServerFn({ method: "GET" }).handler(async () => {
  const { requireAdmin } = await import("@/lib/admin-session.server");
  await requireAdmin();
  const { data } = await (await import("@/lib/admin-rpc.server")).adminRpc<{ customers: AdminCustomer[]; creations: AdminCreation[] }>(
    "admin_overview",
    {},
  );
  return {
    customers: data?.customers ?? [],
    creations: data?.creations ?? [],
  };
});

export const adminUpdateCustomer = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string; name?: string; note?: string; is_blocked?: boolean }) =>
    z
      .object({
        id: z.string().uuid(),
        name: z.string().trim().min(2).max(40).optional(),
        note: z.string().trim().max(300).optional(),
        is_blocked: z.boolean().optional(),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/admin-session.server");
    await requireAdmin();
    const { error } = await (await import("@/lib/admin-rpc.server")).adminRpc<boolean>("admin_update_customer", {
      p_id: data.id,
      p_name: data.name ?? null,
      p_note: data.note ?? null,
      p_is_blocked: data.is_blocked ?? null,
    });
    return { ok: !error };
  });

export const adminDeleteCustomer = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/admin-session.server");
    await requireAdmin();
    const { error } = await (await import("@/lib/admin-rpc.server")).adminRpc<boolean>("admin_delete_customer", { p_id: data.id });
    return { ok: !error };
  });

export const adminUpsertCreation = createServerFn({ method: "POST" })
  .inputValidator(
    (input: {
      id?: string;
      name: string;
      creator: string;
      taste: string;
      rating: number;
      votes: number;
      is_hidden: boolean;
      is_featured: boolean;
    }) =>
      z
        .object({
          id: z.string().uuid().optional(),
          name: z.string().trim().min(1).max(80),
          creator: z.string().trim().min(1).max(40),
          taste: z.string().trim().max(120),
          rating: z.number().min(0).max(5),
          votes: z.number().int().min(0).max(1000000),
          is_hidden: z.boolean(),
          is_featured: z.boolean(),
        })
        .parse(input),
  )
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/admin-session.server");
    await requireAdmin();
    const { error } = await (await import("@/lib/admin-rpc.server")).adminRpc<boolean>("admin_upsert_creation", {
      p_id: data.id ?? null,
      p_name: data.name,
      p_creator: data.creator,
      p_taste: data.taste,
      p_rating: data.rating,
      p_votes: data.votes,
      p_is_hidden: data.is_hidden,
      p_is_featured: data.is_featured,
    });
    return { ok: !error };
  });

export const adminDeleteCreation = createServerFn({ method: "POST" })
  .inputValidator((input: { id: string }) => z.object({ id: z.string().uuid() }).parse(input))
  .handler(async ({ data }) => {
    const { requireAdmin } = await import("@/lib/admin-session.server");
    await requireAdmin();
    const { error } = await (await import("@/lib/admin-rpc.server")).adminRpc<boolean>("admin_delete_creation", { p_id: data.id });
    return { ok: !error };
  });

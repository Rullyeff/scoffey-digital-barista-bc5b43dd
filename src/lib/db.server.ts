import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

/**
 * Server-side Supabase client using the PUBLISHABLE key only.
 * All privileged work happens through SECURITY DEFINER RPCs in the database,
 * so no service-role key is needed (portable to Vercel & other hosts).
 */
// Public (publishable) backend config — safe to ship; kept as a fallback so the
// app also runs on hosts where env vars were not configured (e.g. Vercel).
const FALLBACK_SUPABASE_URL = "https://ijzcsxequscjwmveyqnf.supabase.co";
const FALLBACK_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_i87nAuqOEtpuvuvdSdQAQw_xTinqjyu";

export function publicDb(): SupabaseClient<Database> {
  const url =
    process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"] ?? FALLBACK_SUPABASE_URL;
  const key =
    process.env["SUPABASE_PUBLISHABLE_KEY"] ??
    process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ??
    FALLBACK_SUPABASE_PUBLISHABLE_KEY;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

// Server-only fallback (never reaches the browser bundle).
const FALLBACK_ADMIN_API_TOKEN = "ed8ff782834cbe4a1242cba27f0c447f86b42967d601e845480278d20139592a";

export function adminToken() {
  return process.env["ADMIN_API_TOKEN"] ?? FALLBACK_ADMIN_API_TOKEN;
}

/** 081234567890 -> 6281234567890 */
export function normalizePhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  return digits;
}

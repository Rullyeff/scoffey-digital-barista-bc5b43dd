import type { SupabaseClient } from "@supabase/supabase-js";

type RpcClient = {
  rpc: (
    name: string,
    args: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: { message: string } | null }>;
};

/** Call a database RPC that is not present in the generated types yet. */
export async function rpc<T>(
  db: SupabaseClient<never>,
  name: string,
  args: Record<string, unknown>,
): Promise<{ data: T | null; error: { message: string } | null }> {
  const client = db as unknown as RpcClient;
  const { data, error } = await client.rpc(name, args);
  return { data: (data ?? null) as T | null, error };
}

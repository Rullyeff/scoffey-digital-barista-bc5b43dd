import { publicDb, adminToken } from "@/lib/db.server";
import { rpc } from "@/lib/rpc.server";

export async function adminRpc<T>(name: string, args: Record<string, unknown>) {
  return rpc<T>(publicDb(), name, { p_token: adminToken(), ...args });
}

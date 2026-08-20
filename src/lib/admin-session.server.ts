import { useSession } from "@tanstack/react-start/server";

export const ADMIN_PHONE = "1234512345";

type AdminSession = { isAdmin?: boolean };

function config() {
  return {
    password: process.env["SESSION_SECRET"] ?? "47292a8da40309d261f86f4f2a688a7bd046a28de9b4ce7305feadc3f9f6e02b",
    name: "scoffey-admin",
    maxAge: 60 * 60 * 12,
    cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
  };
}

export async function getAdminSession() {
  return useSession<AdminSession>(config());
}

export async function isAdmin() {
  const session = await getAdminSession();
  return session.data.isAdmin === true;
}

export async function requireAdmin() {
  if (!(await isAdmin())) throw new Error("Akses admin diperlukan");
}

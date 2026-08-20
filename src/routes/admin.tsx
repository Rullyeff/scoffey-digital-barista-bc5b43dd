import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toaster } from "@/components/ui/sonner";
import { adminLogin, adminLogout, adminMe } from "@/lib/admin.functions";
import { AdminPanel } from "@/components/admin/AdminPanel";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Panel Admin — Scoffey Digital Barista" },
      {
        name: "description",
        content:
          "Panel admin Scoffey Digital Barista: kelola data pelanggan, moderasi kreasi kopi, dan atur sorotan papan kreasi.",
      },
      { property: "og:title", content: "Panel Admin — Scoffey Digital Barista" },
      {
        property: "og:description",
        content: "Kelola pelanggan dan kreasi kopi Scoffey dari satu panel admin.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminRoute,
});

function AdminRoute() {
  const me = useServerFn(adminMe);
  const doLogin = useServerFn(adminLogin);
  const doLogout = useServerFn(adminLogout);
  const navigate = useNavigate();

  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    const res = await me({});
    setIsAdmin(res.isAdmin);
    setReady(true);
  }, [me]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-muted-foreground">
        Memuat panel admin…
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16 font-sans text-foreground">
        <Toaster />
        <div className="w-full max-w-md rounded-[2rem] border border-border bg-card p-8 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2 text-primary">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-xs uppercase tracking-[0.3em]">Scoffey Admin</span>
          </div>
          <h1 className="mt-5 font-display text-3xl tracking-tight">Masuk sebagai admin</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Masukkan nomor HP admin untuk membuka panel kontrol.
          </p>

          <Link
            to="/"
            className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke beranda
          </Link>

          <form
            className="mt-6 space-y-4"
            noValidate
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError(null);
              try {
                const res = await doLogin({ data: { phone } });
                if (!res.ok) {
                  setError("Nomor HP bukan admin.");
                  return;
                }
                await refresh();
              } catch {
                setError("Gagal masuk. Coba lagi.");
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="space-y-2">
              <label htmlFor="admin-phone" className="text-sm font-medium">
                No. HP admin
              </label>
              <Input
                id="admin-phone"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="1234512345"
                maxLength={20}
                aria-invalid={!!error}
              />
              {error ? <p className="text-xs text-destructive">{error}</p> : null}
            </div>
            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              {busy ? "Memeriksa…" : "Masuk panel admin"}
            </Button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Toaster />
      <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6">
        <div>
          <span className="font-display text-lg tracking-tight">
            SCOFFEY <span className="text-primary">Panel Admin</span>
          </span>
          <p className="text-sm text-muted-foreground">Kontrol penuh pelanggan &amp; kreasi.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/">Beranda</Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await doLogout({});
              setIsAdmin(false);
              void navigate({ to: "/admin", replace: true });
            }}
          >
            <LogOut className="mr-1.5 h-4 w-4" />
            Keluar
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 pb-20">
        <AdminPanel />
      </main>
    </div>
  );
}

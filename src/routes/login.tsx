import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Coffee, Loader2, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGuest } from "@/lib/guest";
import { guestSchema, normalizePhone } from "@/lib/guest-utils";
import { useI18n } from "@/lib/i18n";
import { isTKey } from "@/lib/i18n-dict";
import { loginCustomer, registerCustomer } from "@/lib/shop.functions";


const ADMIN_LOGIN_PHONE = "1234512345";


export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — Scoffey Digital Barista" },
      {
        name: "description",
        content:
          "Masuk sebagai pelanggan untuk mulai meracik kopi di Scoffey Digital Barista. Tanpa akun, tanpa kata sandi.",
      },
      { property: "og:title", content: "Masuk sebagai Pelanggan — Scoffey Digital Barista" },
      {
        property: "og:description",
        content: "Masuk sebagai pelanggan tanpa akun: langsung racik kopi dan simpan kreasimu di perangkat ini.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginRoute,
});

function LoginRoute() {
  return (
        <LoginPage />
  );
}

function LoginPage() {
  const { ready, signInAsGuest, signOut } = useGuest();
  const { t } = useI18n();
  const tr = (key?: string) => (key && isTKey(key) ? t(key) : key);
  const navigate = useNavigate();
  const register = useServerFn(registerCustomer);
  const login = useServerFn(loginCustomer);
  const skipAutoRedirect = useRef(false);
  const [mode, setMode] = useState<"new" | "returning">("new");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [returningPhone, setReturningPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<{ name?: string | undefined; phone?: string | undefined }>({});

  // Halaman login selalu bersih: sesi sebelumnya dihapus, tidak ada riwayat login.
  useEffect(() => {
    if (ready && !skipAutoRedirect.current) {
      signOut();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16 font-sans text-foreground">
      <div className="w-full max-w-md rounded-[2rem] border border-border bg-card p-8 shadow-[var(--shadow-card)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-primary">
            <Coffee className="h-5 w-5" />
            <span className="text-xs uppercase tracking-[0.3em]">Scoffey</span>
          </div>
        </div>

        <h1 className="mt-5 font-display text-3xl tracking-tight">{t("login.title")}</h1>

        <Link
          to="/"
          className="mt-2 inline-flex w-fit items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("login.back")}
        </Link>

        <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl border border-border bg-background p-1">
          <button
            type="button"
            onClick={() => {
              setMode("new");
              setErrors({});
            }}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              mode === "new" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("login.new")}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode("returning");
              setErrors({});
            }}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              mode === "returning"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t("login.returning")}
          </button>
        </div>

        {mode === "new" ? (
          <form
            className="mt-6 space-y-4"
            autoComplete="off"
            noValidate
            onSubmit={async (e) => {
              e.preventDefault();
              if (busy) return;
              if (normalizePhone(phone) === normalizePhone(ADMIN_LOGIN_PHONE)) {
                setErrors({});
                navigate({ to: "/admin" });
                return;
              }
              const result = guestSchema.safeParse({ name, phone });
              if (!result.success) {
                const f = result.error.flatten().fieldErrors;
                setErrors({ name: tr(f.name?.[0]), phone: tr(f.phone?.[0]) });
                return;
              }
              setErrors({});
              setBusy(true);
              try {
                const res = await register({ data: result.data });
                if (!res.ok) {
                  setErrors({
                    phone:
                      res.reason === "exists"
                        ? t("login.err.exists")
                        : t("login.err.register"),
                  });
                  return;
                }
                skipAutoRedirect.current = true;
                signInAsGuest(result.data);
                localStorage.setItem("scoffey.welcome", "new");
                navigate({ to: "/cara-kerja", replace: true });
              } catch {
                setErrors({ phone: t("login.err.network") });
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="space-y-2">
              <label htmlFor="guest-name" className="text-sm font-medium">
                {t("login.name")}
              </label>
              <Input
                id="guest-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t("login.namePlaceholder")}
                maxLength={40}
                autoComplete="off"
                aria-invalid={!!errors.name}
              />
              {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
            </div>

            <div className="space-y-2">
              <label htmlFor="guest-phone" className="text-sm font-medium">
                {t("login.phone")}
              </label>
              <Input
                id="guest-phone"
                type="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t("login.phonePlaceholder")}
                maxLength={20}
                autoComplete="off"
                aria-invalid={!!errors.phone}
              />
              {errors.phone ? <p className="text-xs text-destructive">{errors.phone}</p> : null}
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserRound className="mr-2 h-4 w-4" />}
              {t("login.register")}
            </Button>
          </form>
        ) : (
          <form
            className="mt-6 space-y-4"
            autoComplete="off"
            noValidate
            onSubmit={async (e) => {
              e.preventDefault();
              if (busy) return;
              if (normalizePhone(returningPhone) === normalizePhone(ADMIN_LOGIN_PHONE)) {
                setErrors({});
                navigate({ to: "/admin" });
                return;
              }
              const result = guestSchema.shape.phone.safeParse(returningPhone);
              if (!result.success) {
                setErrors({ phone: tr(result.error.issues[0]?.message) });
                return;
              }
              setErrors({});
              setBusy(true);
              try {
                const res = await login({ data: { phone: result.data } });
                if (!res.ok) {
                  setErrors({
                    phone:
                      res.reason === "blocked"
                        ? t("login.err.blocked")
                        : t("login.err.notFound"),
                  });
                  return;
                }
                skipAutoRedirect.current = true;
                signInAsGuest({ name: res.customer.name, phone: res.customer.phone });
                localStorage.setItem("scoffey.welcome", "back");
                navigate({ to: "/cara-kerja", replace: true });
              } catch {
                setErrors({ phone: t("login.err.network") });
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="space-y-2">
              <label htmlFor="returning-phone" className="text-sm font-medium">
                {t("login.phoneReturning")}
              </label>
              <Input
                id="returning-phone"
                type="tel"
                inputMode="tel"
                value={returningPhone}
                onChange={(e) => setReturningPhone(e.target.value)}
                placeholder={t("login.phonePlaceholder")}
                maxLength={20}
                autoComplete="off"
                aria-invalid={!!errors.phone}
              />
              {errors.phone ? <p className="text-xs text-destructive">{errors.phone}</p> : null}
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserRound className="mr-2 h-4 w-4" />}
              {t("login.submit")}
            </Button>
          </form>
        )}
      </div>
    </main>
  );
}


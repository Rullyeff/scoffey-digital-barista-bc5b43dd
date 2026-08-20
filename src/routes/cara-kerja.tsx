import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CycleGrid } from "@/components/barista/CycleGrid";
import { ThemeToggle } from "@/components/barista/ThemeToggle";
import { useI18n } from "@/lib/i18n";
import { useGuest } from "@/lib/guest";

const WELCOME_KEY = "scoffey.welcome";

export const Route = createFileRoute("/cara-kerja")({
  head: () => ({
    meta: [
      { title: "Cara Kerja Digital Barista — Scoffey" },
      {
        name: "description",
        content:
          "Alur Racik → Rekomendasi → Seduh → Cicip → Nilai → Belajar: bagaimana Digital Barista mengubah ide pelanggan menjadi resep kopi yang seimbang.",
      },
      { property: "og:title", content: "Cara Kerja Digital Barista — Scoffey" },
      {
        property: "og:description",
        content:
          "Penjelasan tahap demi tahap basis pengetahuan bahan, aturan peracikan, dan skor kecocokan 0–100.",
      },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HowItWorksRoute,
});

function HowItWorksRoute() {
  return (
        <HowItWorks />
  );
}

function HowItWorks() {
  const { t } = useI18n();
  const { guest } = useGuest();
  const [welcome, setWelcome] = useState<"new" | "back" | null>(null);

  useEffect(() => {
    const value = typeof window !== "undefined" ? window.localStorage.getItem(WELCOME_KEY) : null;
    if (value === "new" || value === "back") {
      setWelcome(value);
      window.localStorage.removeItem(WELCOME_KEY);
    }
  }, []);

  const showBanner = welcome && guest;

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-6">
        <Link to="/" className="font-display text-lg tracking-tight">
          SCOFFEY <span className="text-primary">Digital Barista</span>
        </Link>
        <ThemeToggle />
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-6">
        {showBanner ? (
          <div
            className="mb-8 flex items-start justify-between gap-4 rounded-2xl border border-primary/30 bg-primary/10 p-5 text-foreground"
            role="status"
          >
            <div>
              <p className="font-display text-lg">
                {welcome === "new"
                  ? `${t("welcome.new")}, ${guest.name}!`
                  : `${t("welcome.back")}, ${guest.name}!`}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {welcome === "new" ? t("welcome.newSub") : t("welcome.backSub")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setWelcome(null)}
              className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-primary/20 hover:text-foreground"
              aria-label={t("welcome.close")}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        <p className="text-xs uppercase tracking-[0.3em] text-primary">{t("hero.kicker")}</p>
        <h1 className="mt-5 font-display text-4xl tracking-tight sm:text-5xl">
          {t("cycle.title")}
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{t("hero.sub")}</p>

        <div className="mt-12">
          <CycleGrid />
        </div>

        <div className="mt-12">
          <Button size="lg" asChild>
            <Link to="/studio">
              {t("hero.cta")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </main>

      <footer className="border-t border-border py-10 text-center text-sm text-muted-foreground">
        {t("footer")} <span className="text-cream">SCOFFEY DIGITAL BARISTA</span>
      </footer>
    </div>
  );
}

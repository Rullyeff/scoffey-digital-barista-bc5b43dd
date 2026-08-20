import { createFileRoute, Link } from "@tanstack/react-router";
import { LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { CreationBoard } from "@/components/barista/CreationBoard";
import { LanguageToggle } from "@/components/barista/LanguageToggle";
import { ThemeToggle } from "@/components/barista/ThemeToggle";
import { useI18n } from "@/lib/i18n";
import { useGuest } from "@/lib/guest";
import { CreationsProvider, useCreations } from "@/lib/creations";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Scoffey Digital Barista — Racik Kopimu Sendiri" },
      {
        name: "description",
        content:
          "Racik kopimu sendiri di Scoffey: pilih dasar minuman, atur seleramu, dan biarkan Digital Barista menyusun resep seimbang dengan skor kecocokan AI.",
      },
      { property: "og:title", content: "Scoffey Digital Barista — Racik Kopimu Sendiri" },
      {
        property: "og:description",
        content:
          "Meracik minuman bersama AI: basis pengetahuan bahan, aturan peracikan, dan kartu resep ber-skor.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
        <CreationsProvider>
          <Home />
        </CreationsProvider>
  );
}

function Home() {
  const { t } = useI18n();
  const { guest, signOut } = useGuest();
  const { saved } = useCreations();

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Toaster />

      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-6">
        <span className="font-display text-lg tracking-tight">
          SCOFFEY <span className="text-primary">Digital Barista</span>
        </span>
        <div className="flex items-center gap-4 sm:gap-6">
          <LanguageToggle />
        <ThemeToggle />
          {guest ? (
            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex">
                <UserRound className="h-4 w-4 text-primary" />
                {guest.name}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  signOut();
                }}
              >
                <LogOut className="mr-1.5 h-4 w-4" />
                {t("nav.logout")}
              </Button>
            </div>
          ) : null}
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl items-center gap-12 px-6 pb-16 pt-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-primary">{t("hero.kicker")}</p>
          <h1 className="mt-5 font-display text-5xl leading-[1.05] tracking-tight sm:text-6xl">
            {t("hero.title1")} <span className="text-primary">{t("hero.titleAi")}</span>{" "}
            {t("hero.title2")}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground">{t("hero.sub")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link to={guest ? "/cara-kerja" : "/login"}>{t("hero.cta")}</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#board">{t("hero.cta2")}</a>
            </Button>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-[2rem] bg-primary/20 blur-3xl" />
          <img
            src="/scoffey-cafe.png"
            alt={t("hero.alt")}
            width={834}
            height={623}
            className="w-full rounded-[2rem] border border-border object-cover shadow-[var(--shadow-card)]"
          />
        </div>
      </section>

      <CreationBoard extra={saved} />

      <footer className="border-t border-border py-10 text-center text-sm text-muted-foreground">
        {t("footer")} <span className="text-cream">SCOFFEY DIGITAL BARISTA</span>
      </footer>
    </div>
  );
}

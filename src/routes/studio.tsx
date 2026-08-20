import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, LogIn, LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { BaristaStudio } from "@/components/barista/BaristaStudio";
import { ThemeToggle } from "@/components/barista/ThemeToggle";
import { StudioBackground } from "@/components/barista/StudioBackground";
import { LanguageProvider, useI18n } from "@/lib/i18n";
import { GuestProvider, useGuest } from "@/lib/guest";
import { CreationsProvider, useCreations } from "@/lib/creations";

export const Route = createFileRoute("/studio")({
  head: () => ({
    meta: [
      { title: "Studio — Scoffey Digital Barista" },
      {
        name: "description",
        content:
          "Racik minumanmu sendiri dengan Digital Barista: pilih dasar minuman, selera rasa, bahan, dan dapatkan racikan ber-skor.",
      },
      { property: "og:title", content: "Studio — Scoffey Digital Barista" },
      {
        property: "og:description",
        content:
          "Racik minumanmu sendiri dengan Digital Barista: pilih dasar minuman, selera rasa, bahan, dan dapatkan racikan ber-skor.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StudioRoute,
});

function StudioRoute() {
  return (
    <GuestProvider>
      <LanguageProvider>
        <CreationsProvider>
          <Studio />
        </CreationsProvider>
      </LanguageProvider>
    </GuestProvider>
  );
}

function Studio() {
  const { t } = useI18n();
  const { guest, signOut } = useGuest();
  const { addCreation } = useCreations();
  const navigate = useNavigate();

  return (
    <div className="relative z-[10001] min-h-screen overflow-x-hidden font-sans text-foreground">
      <StudioBackground />
      <Toaster />

      <header className="relative mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-6">
        <Link to="/" className="font-display text-lg tracking-tight">
          SCOFFEY <span className="text-primary">Digital Barista</span>
        </Link>
        <div className="flex items-center gap-4 sm:gap-6">
          <nav className="hidden gap-6 text-sm text-muted-foreground sm:flex">
            <Link to="/" className="hover:text-foreground">
              {t("nav.board")}
            </Link>
          </nav>
        <ThemeToggle />
          {guest ? (
            <div className="flex items-center gap-2">
              <span className="hidden items-center gap-1.5 text-sm text-muted-foreground sm:flex">
                <UserRound className="h-4 w-4 text-primary" />
                {guest.name}
              </span>
              <Button variant="outline" size="sm" onClick={() => {
                  signOut();
                  void navigate({ to: "/", replace: true });
                }}>
                <LogOut className="mr-1.5 h-4 w-4" />
                {t("nav.logout")}
              </Button>
            </div>
          ) : (
            <Button size="sm" variant="default" asChild>
              <Link to="/login">
                <LogIn className="mr-1.5 h-4 w-4" />
                {t("nav.login")}
              </Link>
            </Button>
          )}
        </div>
      </header>

      <main className="relative mx-auto max-w-5xl px-6 pb-24 pt-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("nav.back")}
          </Link>
        </Button>
        <BaristaStudio
          onSave={(entry) => {
            addCreation(entry);
            void navigate({ to: "/cara-kerja", replace: true });
          }}
        />
      </main>

      <footer className="relative border-t border-border py-10 text-center text-sm text-muted-foreground">
        {t("footer")} <span className="text-cream">SCOFFEY DIGITAL BARISTA</span>
      </footer>
    </div>
  );
}

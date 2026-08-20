import { Flame, Star } from "lucide-react";
import { TOP_CREATIONS, type BoardEntry } from "@/lib/barista-data";
import { useI18n } from "@/lib/i18n";

export function CreationBoard({ extra }: { extra?: BoardEntry[] }) {
  const { t, lang } = useI18n();
  const entries = [...(extra ?? []), ...TOP_CREATIONS]
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

  return (
    <section id="board" className="mx-auto w-full max-w-5xl px-6 py-24">
      <div className="flex items-center gap-3">
        <Flame className="h-6 w-6 text-primary" />
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
          {t("board.title")}
        </h2>
      </div>
      <p className="mt-3 max-w-xl text-muted-foreground">
        {t("board.sub1")}{" "}
        <span className="text-cream">Scoffey Creation of the Month</span>{" "}
        {t("board.sub2")}
      </p>

      <ol className="mt-10 divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {entries.map((c, i) => (
          <li key={c.id} className="flex items-center gap-5 p-5">
            <span className="font-display text-2xl text-primary tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{c.name}</p>
              <p className="truncate text-sm text-muted-foreground">
                {t("board.createdBy")} {c.creator} · {(lang === "id" && c.tasteId) || c.taste}
              </p>
            </div>
            <span className="flex shrink-0 items-center gap-1.5 text-sm">
              <Star className="h-4 w-4 fill-primary text-primary" />
              <span className="tabular-nums">{c.rating.toFixed(1)}</span>
              <span className="hidden text-muted-foreground sm:inline">({c.votes})</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

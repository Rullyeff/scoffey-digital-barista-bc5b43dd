import { useEffect, useState } from "react";
import { useI18n, type TKey } from "@/lib/i18n";

const PHASE_KEYS: TKey[] = ["brew.p1", "brew.p2", "brew.p3", "brew.p4"];

export function BrewingOverlay({ onDone }: { onDone: () => void }) {
  const { t } = useI18n();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const step = window.setInterval(
      () => setPhase((p) => Math.min(PHASE_KEYS.length - 1, p + 1)),
      520,
    );
    const finish = window.setTimeout(onDone, 2200);
    return () => {
      window.clearInterval(step);
      window.clearTimeout(finish);
    };
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-8 bg-background/92 backdrop-blur-sm animate-fade-in">
      {/* Cangkir yang terisi perlahan */}
      <div className="relative flex flex-col items-center">
        <div className="mb-3 flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-6 w-1.5 rounded-full bg-primary/50 animate-pulse"
              style={{ animationDelay: `${i * 0.18}s` }}
            />
          ))}
        </div>

        <div className="relative h-24 w-24 overflow-hidden rounded-b-[2.5rem] rounded-t-lg border-2 border-primary/70 bg-secondary">
          <div className="absolute inset-x-0 bottom-0 bg-primary/80 transition-[height] duration-500 ease-in-out"
            style={{ height: `${25 * (phase + 1)}%` }}
          />
        </div>
        <div className="mt-1 h-1.5 w-28 rounded-full bg-primary/40" />
      </div>

      <div className="flex flex-col items-center gap-3 text-center">
        <p className="font-display text-2xl text-foreground">{t("brew.title")}</p>
        <p key={phase} className="text-sm text-muted-foreground animate-fade-in">
          {t(PHASE_KEYS[phase] ?? "brew.p1")}
        </p>
        <div className="mt-2 h-1 w-56 overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${25 * (phase + 1)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

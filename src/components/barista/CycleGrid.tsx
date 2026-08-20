import { Coffee, Brain, ClipboardCheck, Repeat } from "lucide-react";
import { useI18n, type TKey } from "@/lib/i18n";

export const CYCLE: { icon: typeof Coffee; title: TKey; text: TKey }[] = [
  { icon: Coffee, title: "cycle.create", text: "cycle.create.text" },
  { icon: Brain, title: "cycle.recommend", text: "cycle.recommend.text" },
  { icon: ClipboardCheck, title: "cycle.brew", text: "cycle.brew.text" },
  { icon: Repeat, title: "cycle.learn", text: "cycle.learn.text" },
];

export function CycleGrid() {
  const { t } = useI18n();

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {CYCLE.map((c) => (
        <div key={c.title} className="rounded-2xl border border-border bg-card p-6">
          <c.icon className="h-6 w-6 text-primary" />
          <p className="mt-4 font-display text-xl">{t(c.title)}</p>
          <p className="mt-2 text-sm text-muted-foreground">{t(c.text)}</p>
        </div>
      ))}
    </div>
  );
}

import { Check, Palette } from "lucide-react";
import { toast } from "sonner";
import { PALETTES, usePalette, type PaletteId } from "@/lib/palette";

export function ThemeManager() {
  const { palette, setPalette } = usePalette();

  const choose = (id: PaletteId, name: string) => {
    setPalette(id);
    toast.success(`Tema "${name}" diterapkan ke seluruh halaman.`);
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <Palette className="h-5 w-5 text-primary" />
        <h2 className="font-display text-xl tracking-tight">Tema situs</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Tema yang dipilih langsung berlaku pada semua halaman (beranda, login, studio, cara kerja).
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PALETTES.map((p) => {
          const active = palette === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => choose(p.id, p.name)}
              aria-pressed={active}
              className={`flex flex-col gap-3 rounded-xl border p-4 text-left transition-colors ${
                active
                  ? "border-primary bg-primary/10"
                  : "border-border bg-background hover:bg-secondary"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{p.name}</span>
                {active ? <Check className="h-4 w-4 text-primary" /> : null}
              </div>
              <div className="flex gap-1.5">
                {p.swatch.map((c) => (
                  <span
                    key={c}
                    className="h-6 w-6 rounded-full border border-border"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">{p.description}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

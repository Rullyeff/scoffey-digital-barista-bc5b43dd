import { useI18n, type Lang } from "@/lib/i18n";

const OPTIONS: { id: Lang; label: string }[] = [
  { id: "id", label: "ID" },
  { id: "en", label: "EN" },
];

export function LanguageToggle() {
  const { lang, setLang } = useI18n();

  return (
    <div className="flex items-center rounded-full border border-border bg-secondary p-1">
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          type="button"
          onClick={() => setLang(o.id)}
          aria-pressed={lang === o.id}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            lang === o.id
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

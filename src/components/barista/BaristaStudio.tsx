import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Sparkles, Star, RotateCcw, ShieldAlert, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  BASES,
  CHARACTERS,
  INGREDIENTS,
  type BaseId,
  type BoardEntry,
  type Preferences,
} from "@/lib/barista-data";
import { formulate } from "@/lib/barista-engine";
import { checkFeasibility, type Selection } from "@/lib/barista-feasibility";
import { useI18n, type TKey } from "@/lib/i18n";
import { TasteMeter } from "./TasteMeter";
import { BrewingOverlay } from "./BrewingOverlay";


const STEP_KEYS: TKey[] = [
  "step.base",
  "step.taste",
  "step.ingredients",
  "step.formula",
  "step.rating",
];

const FEEDBACK_KEYS: TKey[] = [
  "fb.sweet",
  "fb.bitter",
  "fb.creamy",
  "fb.strong",
  "fb.balance",
];

const OptionChip = ({
  active,
  onClick,
  children,
  disabled,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={`rounded-full border px-4 py-2 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border bg-secondary text-secondary-foreground hover:border-primary/60"
    }`}
  >
    {children}
  </button>
);

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-3">
    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
    <div className="flex flex-wrap gap-2">{children}</div>
  </div>
);

export function BaristaStudio({ onSave }: { onSave: (entry: BoardEntry) => void }) {
  const { t, lang } = useI18n();
  const [step, setStep] = useState(0);
  const [base, setBase] = useState<BaseId>("espresso");
  const [prefs, setPrefs] = useState<Preferences>({
    sweetness: "Medium",
    intensity: "Medium",
    creaminess: "Medium",
    temperature: "Iced",
    character: ["caramel"],
  });
  const [picked, setPicked] = useState<string[]>(["milk", "caramel"]);
  const [stars, setStars] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [again, setAgain] = useState<boolean | null>(null);
  const [creator, setCreator] = useState("");
  const [brewing, setBrewing] = useState(false);
  const [gateOpen, setGateOpen] = useState(false);

  const formula = useMemo(() => formulate(base, prefs, picked, lang), [base, prefs, picked, lang]);

  const selection: Selection = useMemo(() => ({ base, prefs, picked }), [base, prefs, picked]);
  const feasibility = useMemo(() => checkFeasibility(selection, lang), [selection, lang]);

  const applySelection = (s: Selection) => {
    setBase(s.base);
    setPrefs(s.prefs);
    setPicked(s.picked);
  };

  const applyAll = () => {
    let s = selection;
    feasibility.issues.forEach((issue) => {
      s = issue.fix(s);
    });
    applySelection(s);
    toast.success(t("gate.applied"));
    if (checkFeasibility(s, lang).feasible) {
      setGateOpen(false);
      setBrewing(true);
    }
  };


  const toggle = (arr: string[], v: string, max: number) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : arr.length >= max ? arr : [...arr, v];

  const lvl = (v: string) => t(`lvl.${v}` as TKey);

  const next = () => setStep((s) => Math.min(STEP_KEYS.length - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  /** Decision node: "Compatible and feasible?" — NO opens the substitution panel. */
  const requestFormula = () => {
    if (!feasibility.feasible) {
      setGateOpen(true);
      return;
    }
    setGateOpen(false);
    setBrewing(true);
  };



  const submitRating = () => {
    if (!stars) {
      toast.error(t("rate.needStars"));
      return;
    }
    onSave({
      id: crypto.randomUUID(),
      name: formula.name,
      creator: creator.trim() || (lang === "id" ? "Kamu" : "You"),
      rating: stars,
      votes: 1,
      taste: prefs.character.map((c) => t(`char.${c}` as TKey)).join(" • ") || t("taste.signature"),
    });
    toast.success(t("rate.thanks"));
    setStep(0);
    setStars(0);
    setTags([]);
    setAgain(null);
  };

  return (
    <section id="studio" className="mx-auto w-full max-w-5xl px-6 py-24">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {STEP_KEYS.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => i <= step && setStep(i)}
            className={`flex items-center gap-2 text-xs uppercase tracking-[0.18em] ${
              i === step ? "text-primary" : i < step ? "text-cream" : "text-muted-foreground"
            }`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] ${
                i <= step ? "border-primary" : "border-border"
              }`}
            >
              {i < step ? <Check className="h-3 w-3" /> : i + 1}
            </span>
            {t(s)}
          </button>
        ))}
      </div>

      <div className="mt-8 rounded-3xl p-6 studio-card sm:p-10">
        {step === 0 && (
          <div>
            <h2 className="font-display text-3xl">{t("base.title")}</h2>
            <p className="mt-2 text-muted-foreground">{t("base.sub")}</p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {BASES.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setBase(b.id)}
                  className={`rounded-2xl border p-5 text-left transition-colors ${
                    base === b.id
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary hover:border-primary/50"
                  }`}
                >
                  <p className="font-display text-xl">{lang === "id" ? b.nameId : b.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {lang === "id" ? b.descId : b.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-3xl">{t("taste.title")}</h2>
              <p className="mt-2 text-muted-foreground">{t("taste.sub")}</p>
            </div>
            <Field label={t("taste.sweetness")}>
              {(["Low", "Medium", "Sweet"] as const).map((v) => (
                <OptionChip
                  key={v}
                  active={prefs.sweetness === v}
                  onClick={() => setPrefs({ ...prefs, sweetness: v })}
                >
                  {lvl(v)}
                </OptionChip>
              ))}
            </Field>
            <Field label={t("taste.intensity")}>
              {(["Light", "Medium", "Strong"] as const).map((v) => (
                <OptionChip
                  key={v}
                  active={prefs.intensity === v}
                  onClick={() => setPrefs({ ...prefs, intensity: v })}
                >
                  {lvl(v)}
                </OptionChip>
              ))}
            </Field>
            <Field label={t("taste.creaminess")}>
              {(["Light", "Medium", "Creamy"] as const).map((v) => (
                <OptionChip
                  key={v}
                  active={prefs.creaminess === v}
                  onClick={() => setPrefs({ ...prefs, creaminess: v })}
                >
                  {lvl(v)}
                </OptionChip>
              ))}
            </Field>
            <Field label={t("taste.temperature")}>
              {(["Hot", "Iced"] as const).map((v) => (
                <OptionChip
                  key={v}
                  active={prefs.temperature === v}
                  onClick={() => setPrefs({ ...prefs, temperature: v })}
                >
                  {lvl(v)}
                </OptionChip>
              ))}
            </Field>
            <Field label={t("taste.character")}>
              {CHARACTERS.map((c) => (
                <OptionChip
                  key={c}
                  active={prefs.character.includes(c)}
                  onClick={() => setPrefs({ ...prefs, character: toggle(prefs.character, c, 3) })}
                >
                  {t(`char.${c}` as TKey)}
                </OptionChip>
              ))}
            </Field>
          </div>
        )}

        {step === 2 && (
          <div>
            <h2 className="font-display text-3xl">{t("ing.title")}</h2>
            <p className="mt-2 text-muted-foreground">
              {t("ing.sub")} ({picked.length}/4)
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {INGREDIENTS.map((ing) => {
                const active = picked.includes(ing.id);
                return (
                  <button
                    key={ing.id}
                    type="button"
                    onClick={() => setPicked(toggle(picked, ing.id, 4))}
                    disabled={!active && picked.length >= 4}
                    className={`rounded-xl border p-4 text-left transition-colors disabled:opacity-40 ${
                      active
                        ? "border-primary bg-primary/10"
                        : "border-border bg-secondary hover:border-primary/50"
                    }`}
                  >
                    <p className="font-medium">{lang === "id" ? ing.nameId : ing.name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("ing.max")} {ing.attr.maxDose} {ing.attr.unit} ·{" "}
                      {t(`cat.${ing.category}` as TKey)}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr]">
            <div className="lg:col-span-2">
              {feasibility.feasible ? (
                <div className="flex items-center gap-2 rounded-2xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm">
                  <Check className="h-4 w-4 text-primary" />
                  {t("gate.pass")}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setGateOpen(true)}
                  className="flex w-full items-center gap-2 rounded-2xl border border-destructive/50 bg-destructive/10 px-4 py-3 text-left text-sm"
                >
                  <ShieldAlert className="h-4 w-4 text-destructive" />
                  {t("gate.title")} — {t("gate.recheck")}
                </button>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="h-5 w-5" />
                <span className="text-xs uppercase tracking-[0.2em]">
                  {t("formula.kicker")}
                </span>
              </div>
              <h2 className="mt-3 font-display text-4xl">{formula.name}</h2>
              <p className="mt-3 text-muted-foreground">{formula.description}</p>

              <ul className="mt-6 divide-y divide-border rounded-2xl border border-border">
                {formula.lines.map((l) => (
                  <li key={l.name} className="flex items-center justify-between px-4 py-3 text-sm">
                    <span>{l.name}</span>
                    <span className="tabular-nums text-cream">
                      {l.amount} {l.unit}
                    </span>
                  </li>
                ))}
              </ul>

              <p className="mt-4 text-sm text-muted-foreground">
                {t("formula.price")}{" "}
                <span className="text-cream">
                  Rp {formula.price.toLocaleString("id-ID")}
                </span>
              </p>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-border bg-secondary p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {t("formula.score")}
                </p>
                <p className="mt-2 font-display text-5xl text-primary">{formula.score}/100</p>
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${formula.score}%` }}
                  />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">
                  {formula.score >= 80
                    ? t("formula.good")
                    : formula.score >= 60
                      ? t("formula.ok")
                      : t("formula.bad")}
                </p>
              </div>

              <div className="space-y-3 rounded-2xl border border-border bg-secondary p-6">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  {t("formula.profile")}
                </p>
                <TasteMeter label={t("profile.sweet")} value={formula.profile.sweet} />
                <TasteMeter label={t("profile.creamy")} value={formula.profile.creamy} />
                <TasteMeter label={t("profile.coffee")} value={formula.profile.coffee} />
                <TasteMeter label={t("profile.aromatic")} value={formula.profile.aromatic} />
                <TasteMeter label={t("profile.acid")} value={formula.profile.acid} />
              </div>

              {formula.suggestion && (
                <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-5 text-sm">
                  {formula.suggestion}
                </div>
              )}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8">
            <div>
              <h2 className="font-display text-3xl">{t("rate.title")}</h2>
              <p className="mt-2 text-muted-foreground">{t("rate.sub")}</p>
            </div>

            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setStars(n)} aria-label={`${n} ${t("rate.star")}`}>
                  <Star
                    className={`h-9 w-9 transition-colors ${
                      n <= stars ? "fill-primary text-primary" : "text-border"
                    }`}
                  />
                </button>
              ))}
            </div>

            <Field label={t("rate.notice")}>
              {FEEDBACK_KEYS.map((f) => (
                <OptionChip
                  key={f}
                  active={tags.includes(f)}
                  onClick={() => setTags(toggle(tags, f, 5))}
                >
                  {t(f)}
                </OptionChip>
              ))}
            </Field>

            <Field label={t("rate.again")}>
              <OptionChip active={again === true} onClick={() => setAgain(true)}>
                {t("rate.yes")}
              </OptionChip>
              <OptionChip active={again === false} onClick={() => setAgain(false)}>
                {t("rate.no")}
              </OptionChip>
            </Field>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {t("rate.saveAs")}
              </p>
              <input
                value={creator}
                onChange={(e) => setCreator(e.target.value)}
                placeholder={t("rate.name")}
                className="w-full max-w-sm rounded-xl border border-input bg-secondary px-4 py-3 text-sm outline-none focus:border-primary"
              />
            </div>

            <Button size="lg" onClick={submitRating}>
              {t("rate.submit")}
            </Button>
          </div>
        )}

        <div className="mt-10 flex items-center justify-between gap-4 border-t border-border pt-6">
          <Button variant="ghost" onClick={back} disabled={step === 0}>
            <ArrowLeft className="mr-2 h-4 w-4" /> {t("nav.back")}
          </Button>
          {step < STEP_KEYS.length - 1 ? (
            <Button
              onClick={() => (step === 2 ? requestFormula() : next())}
              disabled={brewing || (step === 2 && picked.length === 0)}
            >
              {step === 2 ? t("nav.createFormula") : t("nav.continue")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (

            <Button variant="ghost" onClick={() => setStep(0)}>
              <RotateCcw className="mr-2 h-4 w-4" /> {t("nav.restart")}
            </Button>
          )}
        </div>
      </div>

      {gateOpen && !feasibility.feasible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-sm">
          <div className="max-h-[85vh] w-full max-w-xl overflow-y-auto rounded-3xl p-6 studio-card sm:p-8">
            <div className="flex items-center gap-2 text-destructive">
              <ShieldAlert className="h-5 w-5" />
              <span className="text-xs uppercase tracking-[0.2em]">{t("gate.kicker")}</span>
            </div>
            <h3 className="mt-3 font-display text-2xl">{t("gate.title")}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{t("gate.sub")}</p>

            <ul className="mt-6 space-y-3">
              {feasibility.issues.map((issue) => (
                <li key={issue.id} className="rounded-2xl border border-border bg-secondary p-4">
                  <p className="font-medium">{issue.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{issue.detail}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-3"
                    onClick={() => {
                      applySelection(issue.fix(selection));
                      toast.success(t("gate.applied"));
                    }}
                  >
                    <Wand2 className="mr-1.5 h-4 w-4" />
                    {issue.fixLabel}
                  </Button>
                </li>
              ))}
            </ul>

            <div className="mt-6 flex flex-wrap gap-2">
              <Button onClick={applyAll}>
                <Wand2 className="mr-1.5 h-4 w-4" />
                {t("gate.applyAll")}
              </Button>
              <Button variant="outline" onClick={() => setGateOpen(false)}>
                {t("gate.edit")}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setGateOpen(false);
                  setBrewing(true);
                }}
              >
                {t("gate.continue")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {brewing && (
        <BrewingOverlay
          onDone={() => {
            setBrewing(false);
            setGateOpen(false);
            next();
          }}
        />
      )}

    </section>
  );
}

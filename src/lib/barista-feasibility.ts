import {
  ingredientById,
  type BaseId,
  type Preferences,
} from "./barista-data";
import { formulate } from "./barista-engine";

export type Selection = {
  base: BaseId;
  prefs: Preferences;
  picked: string[];
};

export type FeasibilityIssue = {
  id: string;
  title: string;
  detail: string;
  fixLabel: string;
  fix: (s: Selection) => Selection;
};

const nm = (id: string, lang: "id" | "en") => {
  const ing = ingredientById(id);
  return lang === "id" ? ing.nameId : ing.name;
};

/**
 * Layer "Check constraints" → decision node "Compatible and feasible?".
 * Returns the blocking issues plus a concrete substitution / reformulation
 * for each one, so the customer never hits a dead end.
 */
export function checkFeasibility(sel: Selection, lang: "id" | "en" = "id") {
  const id = lang === "id";
  const issues: FeasibilityIssue[] = [];
  const picked = sel.picked.map(ingredientById);

  const dairy = picked.filter((i) => i.category === "dairy" && i.id !== "sea-salt");
  const acidic = picked.filter((i) => i.attr.acid >= 4);
  const syrups = picked.filter((i) => i.category === "syrup");

  // 1. Milk + high acidity → curdling risk
  if (dairy.length > 0 && acidic.length > 0) {
    const d = dairy[0]!;
    issues.push({
      id: "dairy-acid",
      title: id ? "Susu bertemu bahan asam" : "Dairy meets high acidity",
      detail: id
        ? `${nm(d.id, lang)} dapat pecah saat dicampur ${acidic.map((a) => nm(a.id, lang)).join(", ")}, dan rasanya jadi tajam.`
        : `${d.name} can curdle with ${acidic.map((a) => a.name).join(", ")} and taste sharp.`,
      fixLabel: id
        ? `Ganti ${nm(d.id, lang)} → Air Berkarbonasi`
        : `Replace ${d.name} → Sparkling Water`,
      fix: (s) => ({
        ...s,
        picked: [...s.picked.filter((p) => p !== d.id), "sparkling"].slice(0, 4),
      }),
    });
  }

  // 2. Too many syrups competing
  if (syrups.length > 2) {
    const keep = syrups.slice(0, 2).map((s) => s.id);
    const dropped = syrups.slice(2);
    issues.push({
      id: "syrup-overload",
      title: id ? "Terlalu banyak sirup" : "Too many syrups",
      detail: id
        ? `${syrups.length} sirup saling menutupi karakter. Aturan peracikan Scoffey membatasi maksimal 2 sirup.`
        : `${syrups.length} syrups mask each other. Scoffey's rules cap this at 2 syrups.`,
      fixLabel: id
        ? `Sisakan 2 sirup, lepas ${dropped.map((d) => nm(d.id, lang)).join(", ")}`
        : `Keep 2 syrups, drop ${dropped.map((d) => d.name).join(", ")}`,
      fix: (s) => ({
        ...s,
        picked: s.picked.filter((p) => !dropped.some((d) => d.id === p) || keep.includes(p)),
      }),
    });
  }

  // 3. Matcha over a coffee base
  const coffeeBase: BaseId[] = ["espresso", "americano", "milk-coffee", "cold-brew"];
  if (sel.picked.includes("matcha") && coffeeBase.includes(sel.base)) {
    issues.push({
      id: "matcha-coffee",
      title: id ? "Matcha di atas basis kopi" : "Matcha over a coffee base",
      detail: id
        ? "Matcha dan kopi berebut kepahitan sehingga aroma matcha hilang."
        : "Matcha and coffee compete on bitterness, muting the matcha aroma.",
      fixLabel: id ? "Pindahkan ke basis Teh / Non-Kopi" : "Switch to the Tea / Non-Coffee base",
      fix: (s) => ({ ...s, base: "tea" }),
    });
  }

  // 4. Strong coffee intensity without coffee
  if (prefsIsStrong(sel.prefs) && (sel.base === "chocolate" || sel.base === "tea")) {
    issues.push({
      id: "intensity-no-coffee",
      title: id ? "Kopi kuat tanpa kopi" : "Strong coffee without coffee",
      detail: id
        ? "Basis pilihanmu tidak memakai kopi, jadi ketebalan kopi 'Kuat' tidak bisa dieksekusi barista."
        : "Your base contains no coffee, so a 'Strong' coffee body cannot be executed.",
      fixLabel: id ? "Turunkan ketebalan kopi ke Sedang" : "Lower coffee intensity to Medium",
      fix: (s) => ({ ...s, prefs: { ...s.prefs, intensity: "Medium" } }),
    });
  }

  // 5. Low sweetness but sweet syrups picked
  if (sel.prefs.sweetness === "Low" && syrups.length >= 2) {
    const drop = syrups.slice(1);
    issues.push({
      id: "sweetness-conflict",
      title: id ? "Selera rendah manis vs sirup" : "Low sweetness vs syrups",
      detail: id
        ? "Kamu meminta rasa tidak terlalu manis, tetapi memilih beberapa sirup manis."
        : "You asked for low sweetness but picked several sweet syrups.",
      fixLabel: id
        ? `Cukup satu sirup (${nm(syrups[0]!.id, lang)})`
        : `Keep one syrup (${syrups[0]!.name})`,
      fix: (s) => ({
        ...s,
        picked: s.picked.filter((p) => !drop.some((d) => d.id === p)),
      }),
    });
  }

  // 6. Overall score too low → reformulate towards the stated preferences
  if (issues.length === 0) {
    const f = formulate(sel.base, sel.prefs, sel.picked, lang);
    if (f.score < 60) {
      issues.push({
        id: "low-score",
        title: id ? "Skor kecocokan masih rendah" : "Compatibility score still low",
        detail: id
          ? `Racikan ini hanya mendapat skor ${f.score}/100 terhadap seleramu. Digital Barista bisa menyeimbangkan ulang takaran dan bahan.`
          : `This build only scores ${f.score}/100 against your taste. Digital Barista can rebalance it.`,
        fixLabel: id ? "Seimbangkan ulang otomatis" : "Auto-rebalance",
        fix: (s) => reformulate(s, lang),
      });
    }
  }

  return { feasible: issues.length === 0, issues };
}

const prefsIsStrong = (p: Preferences) => p.intensity === "Strong";

/** Greedy reformulation: try small edits and keep the best-scoring one. */
export function reformulate(sel: Selection, lang: "id" | "en" = "id"): Selection {
  const candidates: Selection[] = [sel];

  // drop each ingredient
  sel.picked.forEach((p) => {
    candidates.push({ ...sel, picked: sel.picked.filter((x) => x !== p) });
  });
  // add a rounding ingredient
  ["milk", "oat-milk", "vanilla", "coconut", "sea-salt"].forEach((add) => {
    if (!sel.picked.includes(add) && sel.picked.length < 4) {
      candidates.push({ ...sel, picked: [...sel.picked, add] });
    }
  });
  // soften extremes
  (["Low", "Medium", "Sweet"] as const).forEach((sweetness) => {
    candidates.push({ ...sel, prefs: { ...sel.prefs, sweetness } });
  });
  (["Light", "Medium", "Strong"] as const).forEach((intensity) => {
    candidates.push({ ...sel, prefs: { ...sel.prefs, intensity } });
  });

  let best = sel;
  let bestScore = -1;
  candidates.forEach((c) => {
    if (c.picked.length === 0) return;
    const score = formulate(c.base, c.prefs, c.picked, lang).score;
    const penalty = checkFeasibilityShallow(c).length * 25;
    const value = score - penalty;
    if (value > bestScore) {
      bestScore = value;
      best = c;
    }
  });
  return best;
}

/** Constraint check without the score-based rule (avoids recursion). */
function checkFeasibilityShallow(sel: Selection): string[] {
  const picked = sel.picked.map(ingredientById);
  const problems: string[] = [];
  const dairy = picked.filter((i) => i.category === "dairy" && i.id !== "sea-salt");
  const acidic = picked.filter((i) => i.attr.acid >= 4);
  const syrups = picked.filter((i) => i.category === "syrup");
  if (dairy.length > 0 && acidic.length > 0) problems.push("dairy-acid");
  if (syrups.length > 2) problems.push("syrup-overload");
  if (
    sel.picked.includes("matcha") &&
    ["espresso", "americano", "milk-coffee", "cold-brew"].includes(sel.base)
  )
    problems.push("matcha-coffee");
  if (sel.prefs.intensity === "Strong" && (sel.base === "chocolate" || sel.base === "tea"))
    problems.push("intensity-no-coffee");
  if (sel.prefs.sweetness === "Low" && syrups.length >= 2) problems.push("sweetness-conflict");
  return problems;
}

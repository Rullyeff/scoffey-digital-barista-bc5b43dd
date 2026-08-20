import {
  INGREDIENTS,
  ingredientById,
  type BaseId,
  type Ingredient,
  type Preferences,
} from "./barista-data";

export type RecipeLine = { name: string; amount: number; unit: string };

export type Formula = {
  name: string;
  lines: RecipeLine[];
  profile: { sweet: number; creamy: number; coffee: number; aromatic: number; acid: number };
  score: number;
  description: string;
  warnings: string[];
  suggestion: string | null;
  price: number;
};

const LEVEL = { Low: 1, Medium: 3, Sweet: 5, Light: 1, Strong: 5, Creamy: 5 } as const;

const baseIngredient = (base: BaseId): Ingredient | null => {
  switch (base) {
    case "espresso":
    case "americano":
    case "milk-coffee":
      return ingredientById("espresso");
    case "cold-brew":
      return ingredientById("cold-brew");
    case "chocolate":
      return ingredientById("chocolate");
    default:
      return null;
  }
};

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));
const round5 = (n: number) => Math.round(n / 5) * 5;

/**
 * Layer 2 + 3: rule-constrained formulation and scoring.
 */
export function formulate(
  base: BaseId,
  prefs: Preferences,
  selectedIds: string[],
  lang: "id" | "en" = "en",
): Formula {
  const isId = lang === "id";
  const nm = (i: Ingredient) => (isId ? i.nameId : i.name);
  const warnings: string[] = [];
  const selected = selectedIds.map(ingredientById);
  const coreBase = baseIngredient(base);

  const intensity = LEVEL[prefs.intensity] ?? 3;
  const sweetness = LEVEL[prefs.sweetness] ?? 3;
  const creaminess = LEVEL[prefs.creaminess] ?? 3;

  const lines: RecipeLine[] = [];
  let price = 12000; // base cup price
  const used: { ing: Ingredient; dose: number }[] = [];

  const push = (ing: Ingredient, dose: number) => {
    const d = clamp(dose, 0, ing.attr.maxDose);
    if (d <= 0) return;
    used.push({ ing, dose: d });
    lines.push({
      name: nm(ing),
      amount: ing.attr.unit === "g" ? Math.round(d * 10) / 10 : round5(d),
      unit: ing.attr.unit,
    });
    price += Math.round((ing.attr.price * d) / ing.attr.maxDose);
  };

  // Base dose scaled by coffee intensity (Rule: espresso 15-60 ml)
  if (coreBase) {
    const doseMap: Record<string, number> = {
      espresso: 15 + intensity * 6,
      "cold-brew": 60 + intensity * 15,
      chocolate: 30,
    };
    push(coreBase, doseMap[coreBase.id] ?? 30);
  }

  // Dairy / liquid body
  const dairy = selected.find((i) => i.category === "dairy" && i.id !== "sea-salt");
  const hasSparkling = selectedIds.includes("sparkling");
  const acidic = selected.filter((i) => i.attr.acid >= 4);

  if (dairy && acidic.length > 0) {
    warnings.push(
      lang === "id"
        ? "Susu dengan bahan berkeasaman tinggi bisa pecah dan terasa tajam."
        : "Milk combined with high-acidity ingredients can curdle and taste sharp.",
    );
  }

  const targetVolume = base === "americano" ? 180 : prefs.temperature === "Iced" ? 165 : 150;
  const currentVolume = used
    .filter((u) => u.ing.attr.unit === "ml")
    .reduce((s, u) => s + u.dose, 0);

  if (dairy) {
    push(dairy, clamp((targetVolume - currentVolume) * (0.5 + creaminess * 0.1), 40, 150));
  } else if (hasSparkling) {
    push(ingredientById("sparkling"), clamp(targetVolume - currentVolume, 40, 150));
  } else if (base === "americano" || base === "cold-brew" || base === "tea") {
    lines.push({ name: isId ? "Air" : "Water", amount: round5(clamp(targetVolume - currentVolume, 30, 150)), unit: "ml" });
  }

  // Syrups — Rule: total syrup <= 30 ml
  const syrups = selected.filter((i) => i.category === "syrup");
  let syrupBudget = 10 + sweetness * 4; // 14..30
  syrupBudget = Math.min(syrupBudget, 30);
  syrups.forEach((s) => {
    const dose = syrupBudget / syrups.length;
    push(s, dose);
  });

  // Remaining flavor ingredients
  selected
    .filter(
      (i) =>
        i.category === "fruit" ||
        i.category === "spice" ||
        (i.category === "other" && i.id !== "sparkling") ||
        i.id === "sea-salt",
    )
    .forEach((i) => {
      if (used.some((u) => u.ing.id === i.id)) return;
      push(i, i.attr.maxDose * (i.category === "spice" ? 0.5 : 0.6));
    });

  if (prefs.temperature === "Iced") {
    lines.push({ name: isId ? "Es" : "Ice", amount: 100, unit: "g" });
  }

  // Taste profile (weighted by dose share)
  const total = used.reduce((s, u) => s + u.dose / u.ing.attr.maxDose, 0) || 1;
  const w = (key: "sweet" | "bitter" | "acid" | "creamy" | "aroma") =>
    clamp(
      used.reduce((s, u) => s + u.ing.attr[key] * (u.dose / u.ing.attr.maxDose), 0) / total,
      0,
      5,
    );

  const profile = {
    sweet: w("sweet"),
    creamy: w("creamy"),
    coffee: w("bitter"),
    aromatic: w("aroma"),
    acid: w("acid"),
  };

  // Compatibility scoring: preference match + balance + compatibility
  const match =
    100 -
    (Math.abs(profile.sweet - sweetness) +
      Math.abs(profile.creamy - creaminess) +
      Math.abs(profile.coffee - intensity)) *
      8;

  let compatibility = 100;
  if (dairy && acidic.length > 0) compatibility -= 35;
  if (acidic.length > 1) compatibility -= 12;
  if (selectedIds.includes("matcha") && used.some((u) => u.ing.id === "espresso"))
    compatibility -= 10;
  if (syrups.length > 2) compatibility -= 10;
  if (selectedIds.length > 4) compatibility -= 8;

  const balance = 100 - Math.abs(profile.sweet - profile.acid) * 6 - Math.max(0, profile.acid - 3.5) * 10;

  const score = Math.round(clamp(match * 0.4 + compatibility * 0.35 + balance * 0.25, 20, 99));

  const id = isId;
  let suggestion: string | null = null;
  if (dairy && acidic.length > 0) {
    suggestion = id
      ? `Kombinasi ini berpotensi terlalu asam. Digital Barista menyarankan mengganti ${nm(dairy)} dengan air soda.`
      : `This combination may produce excessive acidity. Digital Barista recommends replacing ${dairy.name} with Sparkling Water.`;
  } else if (score < 65 && syrups.length > 2) {
    suggestion = id
      ? "Terlalu banyak sirup saling bertabrakan. Sebaiknya gunakan maksimal dua sirup."
      : "Too many syrups compete with each other. Try keeping a maximum of two.";
  }

  const descWords: string[] = [];
  if (id) {
    descWords.push(
      profile.creamy >= 3.5 ? "Minuman lembut" : profile.acid >= 3 ? "Minuman segar" : "Minuman bersih",
    );
    descWords.push(
      profile.coffee >= 3.5 ? "dengan body kopi kuat" : profile.coffee >= 2 ? "dengan body kopi sedang" : "yang lembut",
    );
  } else {
    descWords.push(profile.creamy >= 3.5 ? "A creamy" : profile.acid >= 3 ? "A bright" : "A clean");
    descWords.push(
      profile.coffee >= 3.5 ? "full-bodied coffee" : profile.coffee >= 2 ? "medium-bodied coffee" : "gentle drink",
    );
  }
  const flavorNames = selected.filter((i) => i.category !== "dairy").map((i) => nm(i).toLowerCase());
  const notes = flavorNames.slice(0, 2).join(id ? " dan " : " and ") || (id ? "rasa membulat" : "a rounded");
  const description = id
    ? `${descWords.join(" ")}, beraroma ${notes}, disajikan ${prefs.temperature === "Iced" ? "dingin dengan es" : "hangat"}.`
    : `${descWords.join(" ")} with ${notes} notes, finished ${prefs.temperature === "Iced" ? "cold over ice" : "warm"}.`;


  const name = buildName(prefs, selected, base);

  return { name, lines, profile, score, description, warnings, suggestion, price };
}

function buildName(prefs: Preferences, selected: Ingredient[], base: BaseId) {
  const flavor = selected.find((i) => ["syrup", "fruit", "spice"].includes(i.category));
  const second = selected.find((i) => i.category === "dairy");
  const suffix =
    prefs.creaminess === "Creamy"
      ? "Cloud"
      : prefs.temperature === "Iced"
        ? "Fizz"
        : base === "espresso"
          ? "Shot"
          : "Brew";
  return [flavor?.name.replace(" Syrup", ""), second ? "Latte" : null, suffix]
    .filter(Boolean)
    .join(" ");
}

export const ALL_INGREDIENTS = INGREDIENTS;

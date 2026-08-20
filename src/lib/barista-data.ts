export type Attr = {
  sweet: number;
  bitter: number;
  acid: number;
  creamy: number;
  aroma: number;
  maxDose: number;
  unit: "ml" | "g";
  price: number;
};

export type Ingredient = {
  id: string;
  name: string;
  nameId: string;
  category: "base" | "dairy" | "syrup" | "spice" | "fruit" | "other";
  attr: Attr;
};

export const BASES = [
  { id: "espresso", name: "Espresso", nameId: "Espresso", desc: "Bold, concentrated shot", descId: "Sajian pekat dan kuat" },
  { id: "americano", name: "Americano", nameId: "Americano", desc: "Espresso lengthened with water", descId: "Espresso yang dilonggarkan air" },
  { id: "milk-coffee", name: "Milk Coffee", nameId: "Kopi Susu", desc: "Smooth latte-style base", descId: "Dasar susu yang lembut" },
  { id: "cold-brew", name: "Cold Brew", nameId: "Cold Brew", desc: "Slow-steeped, low acidity", descId: "Seduhan dingin, rendah keasaman" },
  { id: "chocolate", name: "Chocolate", nameId: "Cokelat", desc: "Rich cocoa, no coffee", descId: "Kaya kakao, tanpa kopi" },
  { id: "tea", name: "Tea / Non-Coffee", nameId: "Teh / Non-Kopi", desc: "Light and aromatic", descId: "Ringan dan aromatik" },
] as const;

export type BaseId = (typeof BASES)[number]["id"];

export const INGREDIENTS: Ingredient[] = [
  { id: "espresso", name: "Espresso", nameId: "Espresso", category: "base", attr: { sweet: 1, bitter: 5, acid: 3, creamy: 1, aroma: 5, maxDose: 60, unit: "ml", price: 6000 } },
  { id: "cold-brew", name: "Cold Brew", nameId: "Cold Brew", category: "base", attr: { sweet: 1, bitter: 4, acid: 2, creamy: 1, aroma: 4, maxDose: 150, unit: "ml", price: 8000 } },
  { id: "milk", name: "Fresh Milk", nameId: "Susu Segar", category: "dairy", attr: { sweet: 2, bitter: 0, acid: 0, creamy: 5, aroma: 2, maxDose: 150, unit: "ml", price: 5000 } },
  { id: "oat-milk", name: "Oat Milk", nameId: "Susu Oat", category: "dairy", attr: { sweet: 3, bitter: 0, acid: 0, creamy: 4, aroma: 2, maxDose: 150, unit: "ml", price: 7000 } },
  { id: "sparkling", name: "Sparkling Water", nameId: "Air Berkarbonasi", category: "other", attr: { sweet: 0, bitter: 0, acid: 2, creamy: 0, aroma: 1, maxDose: 150, unit: "ml", price: 4000 } },
  { id: "caramel", name: "Caramel Syrup", nameId: "Sirup Karamel", category: "syrup", attr: { sweet: 5, bitter: 0, acid: 0, creamy: 3, aroma: 4, maxDose: 25, unit: "ml", price: 4000 } },
  { id: "vanilla", name: "Vanilla Syrup", nameId: "Sirup Vanila", category: "syrup", attr: { sweet: 4, bitter: 0, acid: 0, creamy: 2, aroma: 5, maxDose: 25, unit: "ml", price: 4000 } },
  { id: "brown-sugar", name: "Brown Sugar", nameId: "Gula Aren", category: "syrup", attr: { sweet: 5, bitter: 1, acid: 0, creamy: 1, aroma: 3, maxDose: 25, unit: "ml", price: 3000 } },
  { id: "chocolate", name: "Chocolate", nameId: "Cokelat", category: "other", attr: { sweet: 4, bitter: 3, acid: 0, creamy: 4, aroma: 4, maxDose: 40, unit: "ml", price: 5000 } },
  { id: "matcha", name: "Matcha", nameId: "Matcha", category: "other", attr: { sweet: 1, bitter: 4, acid: 1, creamy: 2, aroma: 5, maxDose: 6, unit: "g", price: 7000 } },
  { id: "strawberry", name: "Strawberry", nameId: "Stroberi", category: "fruit", attr: { sweet: 4, bitter: 0, acid: 4, creamy: 0, aroma: 4, maxDose: 30, unit: "ml", price: 5000 } },
  { id: "lemon", name: "Lemon", nameId: "Lemon", category: "fruit", attr: { sweet: 1, bitter: 0, acid: 5, creamy: 0, aroma: 4, maxDose: 20, unit: "ml", price: 3000 } },
  { id: "coconut", name: "Coconut", nameId: "Kelapa", category: "other", attr: { sweet: 3, bitter: 0, acid: 0, creamy: 4, aroma: 3, maxDose: 30, unit: "ml", price: 5000 } },
  { id: "cinnamon", name: "Cinnamon", nameId: "Kayu Manis", category: "spice", attr: { sweet: 1, bitter: 1, acid: 0, creamy: 0, aroma: 5, maxDose: 1, unit: "g", price: 2000 } },
  { id: "sea-salt", name: "Sea Salt Foam", nameId: "Busa Garam Laut", category: "dairy", attr: { sweet: 2, bitter: 1, acid: 0, creamy: 5, aroma: 3, maxDose: 40, unit: "ml", price: 6000 } },
];

export const ingredientById = (id: string) =>
  INGREDIENTS.find((i) => i.id === id)!;

export type Preferences = {
  sweetness: "Low" | "Medium" | "Sweet";
  intensity: "Light" | "Medium" | "Strong";
  creaminess: "Light" | "Medium" | "Creamy";
  temperature: "Hot" | "Iced";
  character: string[];
};

export const CHARACTERS = [
  "nutty",
  "caramel",
  "fruity",
  "chocolatey",
  "refreshing",
  "aromatic",
];

export type BoardEntry = {
  id: string;
  name: string;
  creator: string;
  rating: number;
  votes: number;
  taste: string;
  tasteId?: string;
};

export const TOP_CREATIONS: BoardEntry[] = [
  { id: "1", name: "Vanilla Sea Salt Latte", creator: "Alya", rating: 4.8, votes: 126, taste: "Creamy • Vanilla • Medium Coffee" , tasteId: "Lembut • Vanila • Kopi Sedang" },
  { id: "2", name: "Strawberry Espresso Fizz", creator: "Rizky", rating: 4.7, votes: 98, taste: "Fruity • Refreshing • Strong" , tasteId: "Buah • Menyegarkan • Kuat" },
  { id: "3", name: "Cinnamon Brown Sugar Latte", creator: "Nabila", rating: 4.6, votes: 87, taste: "Aromatic • Sweet • Creamy" , tasteId: "Aromatik • Manis • Lembut" },
  { id: "4", name: "Matcha Coconut Cloud", creator: "Dimas", rating: 4.5, votes: 71, taste: "Creamy • Grassy • Light" , tasteId: "Lembut • Rasa Daun • Ringan" },
  { id: "5", name: "Cold Brew Tonic", creator: "Sarah", rating: 4.4, votes: 64, taste: "Refreshing • Bitter • Crisp" , tasteId: "Menyegarkan • Pahit • Renyah" },
];

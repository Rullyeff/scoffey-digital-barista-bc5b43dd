import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type Lang = "id" | "en";

const DICT = {
  "nav.studio": { id: "Studio", en: "Studio" },
  "nav.board": { id: "Papan Kreasi", en: "Creation Board" },
  "nav.login": { id: "Masuk", en: "Sign in" },
  "nav.logout": { id: "Keluar", en: "Sign out" },

  "hero.kicker": { id: "Kreasi Bersama AI Terpandu", en: "Guided AI Co-Creation" },
  "hero.title1": { id: "Racik kopimu sendiri,", en: "Craft your own coffee," },
  "hero.titleAi": { id: "AI", en: "AI" },
  "hero.title2": { id: "yang menjaga rasanya.", en: "keeps the taste balanced." },
  "hero.sub": {
    id: "Digital Barista mengubah kreativitas pelanggan menjadi racikan yang seimbang: basis pengetahuan bahan, aturan peracikan, lalu rekomendasi ber-skor 0–100 yang siap dieksekusi barista.",
    en: "Digital Barista turns customer creativity into balanced formulations: an ingredient knowledge base, formulation rules, then a 0–100 scored recommendation ready for the barista.",
  },
  "hero.cta": { id: "Mulai berkreasi", en: "Start creating" },
  "hero.cta2": { id: "Lihat kreasi terbaik", en: "See top creations" },
  "hero.alt": {
    id: "Sudut kedai Scoffey dengan meja bar kayu, kursi tinggi, dan logo Scoffey yang menyala",
    en: "Scoffey cafe corner with a wooden bar counter, high stools, and a glowing Scoffey logo",
  },

  "cycle.title": {
    id: "Racik → Rekomendasi → Seduh → Cicip → Nilai → Belajar",
    en: "Create → Recommend → Brew → Taste → Rate → Learn",
  },
  "cycle.create": { id: "Racik", en: "Create" },
  "cycle.create.text": {
    id: "Pelanggan memilih dasar minuman, selera rasa, dan bahan.",
    en: "Customers pick a base, taste preferences, and ingredients.",
  },
  "cycle.recommend": { id: "Rekomendasi", en: "Recommend" },
  "cycle.recommend.text": {
    id: "Sistem menghitung takaran sesuai aturan peracikan dan penilaian rasa.",
    en: "The engine computes doses using rules and taste scoring.",
  },
  "cycle.brew": { id: "Seduh", en: "Brew" },
  "cycle.brew.text": {
    id: "Barista mengeksekusi kartu resep digital.",
    en: "The barista executes the digital recipe card.",
  },
  "cycle.learn": { id: "Belajar", en: "Learn" },
  "cycle.learn.text": {
    id: "Penilaian pelanggan menyempurnakan rekomendasi berikutnya.",
    en: "Customer ratings refine future recommendations.",
  },

  "step.base": { id: "Dasar", en: "Base" },
  "step.taste": { id: "Rasa", en: "Taste" },
  "step.ingredients": { id: "Bahan", en: "Ingredients" },
  "step.formula": { id: "Racikan", en: "Formula" },
  "step.rating": { id: "Penilaian", en: "Rating" },

  "base.title": { id: "Pilih dasar minumanmu", en: "Choose your base" },
  "base.sub": {
    id: "Semua kreasi dimulai dari pilihan dasar milik Scoffey.",
    en: "Every creation starts inside Scoffey's design space.",
  },

  "taste.title": { id: "Ceritakan seleramu", en: "Tell us your taste" },
  "taste.sub": {
    id: "Empat pilihan selera, satu profil rasa.",
    en: "Four preferences, one flavor profile.",
  },
  "taste.sweetness": { id: "Tingkat manis", en: "Sweetness" },
  "taste.intensity": { id: "Ketebalan kopi", en: "Coffee intensity" },
  "taste.creaminess": { id: "Kelembutan susu", en: "Creaminess" },
  "taste.temperature": { id: "Suhu", en: "Temperature" },
  "taste.character": { id: "Karakter rasa (maks 3)", en: "Flavor character (max 3)" },
  "taste.signature": { id: "Racikan khas", en: "Signature blend" },

  "ing.title": { id: "Pilih bahanmu", en: "Pick your ingredients" },
  "ing.sub": {
    id: "Maksimal 4 bahan agar rasa dan penyajian tetap terkendali.",
    en: "Maximum 4 ingredients to keep operations and flavor under control.",
  },
  "ing.max": { id: "maks", en: "max" },

  "cat.base": { id: "dasar", en: "base" },
  "cat.dairy": { id: "susu", en: "dairy" },
  "cat.syrup": { id: "sirup", en: "syrup" },
  "cat.spice": { id: "rempah", en: "spice" },
  "cat.fruit": { id: "buah", en: "fruit" },
  "cat.other": { id: "lainnya", en: "other" },

  "formula.kicker": {
    id: "Rekomendasi Digital Barista",
    en: "Digital Barista Recommendation",
  },
  "formula.price": { id: "Perkiraan harga:", en: "Estimated price:" },
  "formula.score": { id: "Skor Kecocokan AI", en: "AI Compatibility Score" },
  "formula.profile": { id: "Profil Rasa", en: "Taste Profile" },
  "formula.good": { id: "Perpaduan direkomendasikan.", en: "Recommended combination." },
  "formula.ok": { id: "Bisa dibuat, dengan sedikit kompromi.", en: "Workable, with minor trade-offs." },
  "formula.bad": {
    id: "Perpaduan berisiko — lihat catatan di bawah.",
    en: "Risky combination — see the note below.",
  },

  "profile.sweet": { id: "Manis", en: "Sweet" },
  "profile.creamy": { id: "Lembut", en: "Creamy" },
  "profile.coffee": { id: "Kopi", en: "Coffee" },
  "profile.aromatic": { id: "Aroma", en: "Aromatic" },
  "profile.acid": { id: "Keasaman", en: "Acidity" },

  "rate.title": { id: "Bagaimana kreasimu?", en: "How was your creation?" },
  "rate.sub": {
    id: "Masukan ini melatih rekomendasi Digital Barista berikutnya.",
    en: "This feedback trains the next Digital Barista recommendation.",
  },
  "rate.notice": { id: "Apa yang kamu rasakan?", en: "What did you notice?" },
  "rate.again": { id: "Mau pesan ini lagi?", en: "Would you order this again?" },
  "rate.yes": { id: "Ya", en: "Yes" },
  "rate.no": { id: "Tidak", en: "No" },
  "rate.star": { id: "bintang", en: "star" },
  "rate.saveAs": { id: "Simpan ke Papan Kreasi sebagai", en: "Save to Creation Board as" },
  "rate.name": { id: "Namamu", en: "Your name" },
  "rate.submit": { id: "Kirim & simpan kreasi", en: "Submit & save creation" },
  "rate.needStars": { id: "Beri penilaian bintang dulu ya.", en: "Please give a star rating first." },
  "rate.thanks": {
    id: "Terima kasih! Digital Barista belajar dari masukanmu.",
    en: "Thank you! Digital Barista learns from your feedback.",
  },

  "fb.sweet": { id: "Terlalu manis", en: "Too sweet" },
  "fb.bitter": { id: "Terlalu pahit", en: "Too bitter" },
  "fb.creamy": { id: "Terlalu lembut", en: "Too creamy" },
  "fb.strong": { id: "Terlalu kuat", en: "Too strong" },
  "fb.balance": { id: "Seimbang sempurna", en: "Perfect balance" },

  "nav.back": { id: "Kembali", en: "Back" },
  "nav.continue": { id: "Lanjut", en: "Continue" },
  "nav.createFormula": { id: "Buat racikanku", en: "Create my formula" },
  "nav.restart": { id: "Mulai ulang", en: "Start over" },

  "brew.title": { id: "Sedang meracik…", en: "Brewing your formula…" },
  "brew.p1": { id: "Menakar basis kopi", en: "Measuring the coffee base" },
  "brew.p2": { id: "Menyeimbangkan rasa", en: "Balancing the flavours" },
  "brew.p3": { id: "Menuang bahan pilihanmu", en: "Pouring your ingredients" },
  "brew.p4": { id: "Menghitung skor racikan", en: "Scoring your creation" },

  "gate.kicker": { id: "Pemeriksaan Kelayakan", en: "Feasibility Check" },
  "gate.title": {
    id: "Racikan ini perlu penyesuaian",
    en: "This creation needs adjusting",
  },
  "gate.sub": {
    id: "Digital Barista menemukan hal berikut sebelum resep dikirim ke barista. Pilih saran, atau ubah pilihanmu sendiri.",
    en: "Digital Barista found the following before sending the card to the barista. Apply a suggestion, or edit your own picks.",
  },
  "gate.apply": { id: "Terapkan saran ini", en: "Apply this suggestion" },
  "gate.applyAll": { id: "Terapkan semua saran", en: "Apply all suggestions" },
  "gate.edit": { id: "Ubah pilihan bahan", en: "Edit my ingredients" },
  "gate.continue": { id: "Lanjut apa adanya", en: "Continue anyway" },
  "gate.applied": { id: "Racikan disesuaikan ulang.", en: "Formulation adjusted." },
  "gate.recheck": { id: "Periksa ulang", en: "Re-check" },
  "gate.pass": {
    id: "Kombinasi lolos pemeriksaan — resep siap dieksekusi.",
    en: "Combination passed the check — the card is ready.",
  },

  "board.title": { id: "Kreasi Terpopuler Kampus", en: "Top Campus Creations" },
  "board.sub1": {
    id: "Resep dengan penilaian tertinggi setiap bulan menjadi",
    en: "The highest-rated recipe each month becomes",
  },
  "board.sub2": {
    id: "dan masuk menu resmi selama satu bulan penuh.",
    en: "and joins the official menu for a full month.",
  },
  "board.createdBy": { id: "dibuat oleh", en: "created by" },

  "footer": { id: "Dibuat dengan", en: "Created with" },

  "lvl.Low": { id: "Rendah", en: "Low" },
  "lvl.Medium": { id: "Sedang", en: "Medium" },
  "lvl.Sweet": { id: "Manis", en: "Sweet" },
  "lvl.Light": { id: "Ringan", en: "Light" },
  "lvl.Strong": { id: "Kuat", en: "Strong" },
  "lvl.Creamy": { id: "Lembut", en: "Creamy" },
  "lvl.Hot": { id: "Panas", en: "Hot" },
  "lvl.Iced": { id: "Dingin", en: "Iced" },

  "char.nutty": { id: "kacang", en: "nutty" },
  "char.caramel": { id: "karamel", en: "caramel" },
  "char.fruity": { id: "buah", en: "fruity" },
  "char.chocolatey": { id: "cokelat", en: "chocolatey" },
  "char.refreshing": { id: "menyegarkan", en: "refreshing" },
  "char.aromatic": { id: "aromatik", en: "aromatic" },

  "login.title": { id: "Masuk sebagai pelanggan", en: "Sign in as a customer" },
  "login.back": { id: "Kembali ke beranda", en: "Back to home" },
  "login.new": { id: "Pelanggan baru", en: "New customer" },
  "login.returning": { id: "Pelanggan terdaftar", en: "Returning customer" },
  "login.name": { id: "Nama", en: "Name" },
  "login.namePlaceholder": { id: "mis. Rangga", en: "e.g. Rangga" },
  "login.phone": { id: "No. HP / WhatsApp", en: "Phone / WhatsApp number" },
  "login.phoneReturning": {
    id: "No. HP / WhatsApp terdaftar",
    en: "Registered phone / WhatsApp number",
  },
  "login.phonePlaceholder": { id: "mis. 081234567890", en: "e.g. 081234567890" },
  "login.register": { id: "Daftar & lanjut", en: "Register & continue" },
  "login.submit": { id: "Masuk", en: "Sign in" },
  "login.err.exists": {
    id: "Nomor HP sudah terdaftar. Pilih masuk sebagai pelanggan terdaftar.",
    en: "This number is already registered. Sign in as a returning customer.",
  },
  "login.err.register": {
    id: "Gagal mendaftar. Coba lagi sebentar lagi.",
    en: "Registration failed. Please try again shortly.",
  },
  "login.err.network": {
    id: "Gagal terhubung ke server. Coba lagi.",
    en: "Could not reach the server. Please try again.",
  },
  "login.err.blocked": {
    id: "Akun ini sedang diblokir. Hubungi barista Scoffey.",
    en: "This account is blocked. Please contact a Scoffey barista.",
  },
  "login.err.notFound": {
    id: "Nomor HP belum terdaftar. Daftar dulu sebagai pelanggan baru.",
    en: "This number is not registered yet. Sign up as a new customer first.",
  },

  "err.name.min": { id: "Nama minimal 2 karakter", en: "Name must be at least 2 characters" },
  "err.name.max": { id: "Nama maksimal 40 karakter", en: "Name can be at most 40 characters" },
  "err.name.chars": {
    id: "Nama hanya boleh huruf, spasi, titik, dan tanda hubung",
    en: "Name may only contain letters, spaces, dots, and hyphens",
  },
  "err.phone.min": { id: "Nomor HP minimal 8 digit", en: "Phone number needs at least 8 digits" },
  "err.phone.max": {
    id: "Nomor HP maksimal 20 karakter",
    en: "Phone number can be at most 20 characters",
  },
  "err.phone.format": {
    id: "Gunakan angka saja, contoh 081234567890",
    en: "Use digits only, e.g. 081234567890",
  },
  "err.phone.digits": {
    id: "Nomor HP harus 8–15 digit",
    en: "Phone number must be 8–15 digits",
  },

  "welcome.new": { id: "Selamat bergabung", en: "Welcome aboard" },
  "welcome.back": { id: "Selamat datang kembali", en: "Welcome back" },
  "welcome.newSub": {
    id: "Akun pelangganmu sudah siap. Yuk mulai berkreasi.",
    en: "Your customer account is ready. Let's start creating.",
  },
  "welcome.backSub": {
    id: "Senang melihatmu lagi di Scoffey.",
    en: "Great to see you again at Scoffey.",
  },
  "welcome.close": { id: "Tutup sambutan", en: "Dismiss welcome" },
} as const;

export type TKey = keyof typeof DICT;

export const isTKey = (key: string): key is TKey => key in DICT;

const LangContext = createContext<{
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TKey) => string;
}>({ lang: "id", setLang: () => {}, t: (k) => DICT[k].id });

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("id");

  useEffect(() => {
    const stored = window.localStorage.getItem("scoffey-lang");
    if (stored === "id" || stored === "en") setLang(stored);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("scoffey-lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(
    () => ({ lang, setLang, t: (key: TKey) => DICT[key][lang] }),
    [lang],
  );

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useI18n = () => useContext(LangContext);

// Skins are token sets in src/index.css, switched with <html data-theme="...">.
export const skins = [
  { id: "loomik", label: "Loomik" },
  { id: "airy", label: "Soft & airy" },
  { id: "midnight", label: "Midnight", dark: true },
  { id: "ocean", label: "Bold & compact" },
] as const;

export type SkinId = (typeof skins)[number]["id"];

const STORAGE_KEY = "loomik-skin";

export const getSavedSkin = (): SkinId => {
  try {
    const id = localStorage.getItem(STORAGE_KEY);
    return skins.some((s) => s.id === id) ? (id as SkinId) : "loomik";
  } catch {
    return "loomik";
  }
};

export const applySkin = (id: SkinId) => {
  const skin = skins.find((s) => s.id === id) ?? skins[0];
  const root = document.documentElement;
  root.dataset.theme = skin.id;
  root.classList.toggle("dark", "dark" in skin && skin.dark);
  try {
    localStorage.setItem(STORAGE_KEY, skin.id);
  } catch {
    // Storage unavailable (private mode): the skin still applies for this visit.
  }
};

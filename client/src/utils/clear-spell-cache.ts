import { clearTranslationCache } from "@/data/spell-translations";

export function clearSpellCacheAndReload() {
  clearTranslationCache();
  window.location.reload();
}

export function clearSpellCache(spellIndex: string) {
  try {
    const cached = localStorage.getItem("spell-translations-cache");
    if (cached) {
      const cache = JSON.parse(cached);
      delete cache[spellIndex];
      localStorage.setItem("spell-translations-cache", JSON.stringify(cache));
    }
  } catch (e) {
  }
}


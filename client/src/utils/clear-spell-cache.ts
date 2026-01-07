// Utilitário para limpar o cache de traduções de feitiços
import { clearTranslationCache } from "@/data/spell-translations";

/**
 * Limpa o cache de traduções e recarrega a página
 * Útil quando há traduções ruins ou estranhas
 */
export function clearSpellCacheAndReload() {
  clearTranslationCache();
  window.location.reload();
}

/**
 * Limpa apenas o cache de um feitiço específico
 */
export function clearSpellCache(spellIndex: string) {
  try {
    const cached = localStorage.getItem("spell-translations-cache");
    if (cached) {
      const cache = JSON.parse(cached);
      delete cache[spellIndex];
      localStorage.setItem("spell-translations-cache", JSON.stringify(cache));
    }
  } catch (e) {
    console.warn("Erro ao limpar cache do feitiço:", e);
  }
}


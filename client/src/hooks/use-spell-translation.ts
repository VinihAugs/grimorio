import { useEffect, useState } from "react";
import { translateSpellName, translateSpellNameSync, preloadTranslations } from "@/data/spell-translations";
import type { SpellListItem } from "@/hooks/use-dnd-api";

/**
 * Hook para traduzir nomes de feitiços
 * Retorna o nome traduzido quando disponível, ou o original enquanto traduz
 */
export function useSpellTranslation(spell: SpellListItem | null) {
  const [translatedName, setTranslatedName] = useState<string>(
    spell ? translateSpellNameSync(spell.index, spell.name) : ""
  );

  useEffect(() => {
    if (!spell) {
      setTranslatedName("");
      return;
    }

    // Se já tem no cache, usar imediatamente
    const cached = translateSpellNameSync(spell.index, spell.name);
    if (cached !== spell.name) {
      setTranslatedName(cached);
      return;
    }

    // Se não tem cache, traduzir em background
    translateSpellName(spell.index, spell.name).then(setTranslatedName);
  }, [spell?.index, spell?.name]);

  return translatedName || spell?.name || "";
}

/**
 * Hook para pré-carregar traduções de uma lista de feitiços
 */
export function usePreloadSpellTranslations(spells: SpellListItem[] | undefined) {
  useEffect(() => {
    if (spells && spells.length > 0) {
      preloadTranslations(spells);
    }
  }, [spells]);
}


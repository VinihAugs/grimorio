import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { DnDClass } from "@shared/character-schema";
import {
  loadLocalSpells,
  findSpellByIndex,
  filterSpellsByClass,
  filterSpellsByLevel,
  filterSpellsBySchool,
  convertLocalSpellToSpellListItem,
  convertLocalSpellToSpellDetail,
  type LocalSpell,
} from "@/data/spells.json";
import type { SpellListItem, SpellDetail } from "./use-dnd-api";

// Mapeamento de classes em português para inglês
const classToEnglish: Record<DnDClass, string> = {
  "Bárbaro": "Barbarian",
  "Bardo": "Bard",
  "Bruxo": "Warlock",
  "Clérigo": "Cleric",
  "Druida": "Druid",
  "Feiticeiro": "Sorcerer",
  "Guerreiro": "Fighter",
  "Ladino": "Rogue",
  "Mago": "Wizard",
  "Monge": "Monk",
  "Paladino": "Paladin",
  "Patrulheiro": "Ranger",
};

/**
 * Hook para carregar todas as magias do JSON local
 * Como os dados são estáticos e já carregados via import, retorna imediatamente
 */
export function useLocalSpells() {
  return useQuery({
    queryKey: ["local-spells"],
    queryFn: () => loadLocalSpells(),
    staleTime: Infinity, // Nunca expira, são dados estáticos
    // Dados já estão disponíveis, não precisa de loading
    initialData: () => loadLocalSpells(),
  });
}

/**
 * Hook para buscar magias filtradas usando dados locais
 */
export function useFilteredLocalSpells(
  filters: {
    class: DnDClass | null;
    level: number | null;
    school: string | null;
  }
) {
  const { data: allSpells, isLoading } = useLocalSpells();

  const filteredSpells = useMemo(() => {
    if (!allSpells) return [];

    let filtered: LocalSpell[] = [...allSpells];

    // Aplicar filtros
    if (filters.class) {
      filtered = filterSpellsByClass(filtered, filters.class);
    }

    if (filters.level !== null) {
      filtered = filterSpellsByLevel(filtered, filters.level);
    }

    if (filters.school) {
      filtered = filterSpellsBySchool(filtered, filters.school);
    }

    // Converter para o formato esperado
    return filtered.map((spell, index) =>
      convertLocalSpellToSpellListItem(spell, index)
    );
  }, [allSpells, filters.class, filters.level, filters.school]);

  return {
    data: filteredSpells,
    isLoading,
    error: null,
  };
}

/**
 * Hook para buscar detalhes de uma magia específica usando dados locais
 */
export function useLocalSpellDetail(index: string | null) {
  return useQuery({
    queryKey: ["local-spell", index],
    queryFn: () => {
      if (!index) return null;
      const spell = findSpellByIndex(index);
      if (!spell) return null;
      return convertLocalSpellToSpellDetail(spell, index) as SpellDetail;
    },
    enabled: !!index,
    staleTime: Infinity, // Nunca expira, são dados estáticos
    // Dados já estão disponíveis, não precisa de loading
    initialData: () => {
      if (!index) return null;
      const spell = findSpellByIndex(index);
      if (!spell) return null;
      return convertLocalSpellToSpellDetail(spell, index) as SpellDetail;
    },
  });
}

// Re-exportar tipos para compatibilidade
export type { SpellListItem, SpellDetail };


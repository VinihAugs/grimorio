import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import type { DnDClass } from "@shared/character-schema";

// Zod schemas for external API responses
const spellListItemSchema = z.object({
  index: z.string(),
  name: z.string(),
  level: z.number(),
  url: z.string(),
});

const spellDetailSchema = z.object({
  index: z.string(),
  name: z.string(),
  desc: z.array(z.string()),
  higher_level: z.array(z.string()).optional(),
  range: z.string(),
  components: z.array(z.string()),
  material: z.string().optional(),
  ritual: z.boolean(),
  duration: z.string(),
  concentration: z.boolean(),
  casting_time: z.string(),
  level: z.number(),
  school: z.object({
    index: z.string().optional(),
    name: z.string(),
    url: z.string(),
  }),
  attack_type: z.string().optional(),
  damage: z.object({
    damage_type: z.object({
      index: z.string(),
      name: z.string(),
      url: z.string(),
    }).optional(),
    damage_at_slot_level: z.record(z.string(), z.string()).optional(),
    damage_at_character_level: z.record(z.string(), z.string()).optional(),
  }).optional(),
  classes: z.array(z.object({
    index: z.string(),
    name: z.string(),
    url: z.string(),
  })).optional(),
  subclasses: z.array(z.object({
    index: z.string(),
    name: z.string(),
    url: z.string(),
  })).optional(),
  url: z.string().optional(),
  updated_at: z.string().optional(),
});

export type SpellListItem = z.infer<typeof spellListItemSchema>;
export type SpellDetail = z.infer<typeof spellDetailSchema>;

// Mapeamento de classes em português para nomes da API em inglês
const classToApiName: Record<DnDClass, string> = {
  "Bárbaro": "barbarian",
  "Bardo": "bard",
  "Bruxo": "warlock",
  "Clérigo": "cleric",
  "Druida": "druid",
  "Feiticeiro": "sorcerer",
  "Guerreiro": "fighter",
  "Ladino": "rogue",
  "Mago": "wizard",
  "Monge": "monk",
  "Paladino": "paladin",
  "Patrulheiro": "ranger",
};

/**
 * Converte classe em português para nome da API
 */
export function getClassApiName(dndClass: DnDClass | null | undefined): string | null {
  if (!dndClass) return null;
  return classToApiName[dndClass] || null;
}

/**
 * Busca feitiços de uma classe específica
 * @param dndClass - Classe do personagem em português (ex: "Bardo", "Mago")
 * @param enabled - Se a query deve ser executada
 */
export function useClassSpells(dndClass: DnDClass | null | undefined, enabled: boolean = true) {
  const apiClass = getClassApiName(dndClass);
  
  return useQuery({
    queryKey: ["spells", "class", apiClass],
    queryFn: async () => {
      if (!apiClass) {
        throw new Error("Classe inválida");
      }
      const res = await fetch(`https://www.dnd5eapi.co/api/2014/classes/${apiClass}/spells`);
      if (!res.ok) throw new Error("Failed to fetch spells");
      const data = await res.json();
      return z.array(spellListItemSchema).parse(data.results);
    },
    enabled: enabled && !!apiClass,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

/**
 * Busca feitiços com filtros otimizados usando endpoints específicos da API
 * Estratégia híbrida: busca no servidor o que for possível e refina no front-end quando necessário
 * 
 * IMPORTANTE: A API da 5e NÃO suporta ?level= ou ?school= no endpoint de classe
 * Quando há classe + nível/escola, buscamos todas as magias da classe e filtramos localmente
 * 
 * @param filters - Filtros a serem aplicados
 * @param enabled - Se a query deve ser executada
 */
export function useFilteredSpells(
  filters: {
    class: DnDClass | null;
    level: number | null;
    school: string | null;
  },
  enabled: boolean = true
) {
  const apiClass = getClassApiName(filters.class);
  
  return useQuery({
    queryKey: ["spells", "filtered", apiClass, filters.level, filters.school],
    queryFn: async () => {
      let url: string;
      let needsLocalFiltering = false;
      
      // ESTRATÉGIA: Priorizar endpoint de classe se houver classe
      if (apiClass) {
        // IMPORTANTE: A API ignora ?level= e ?school= no endpoint de classe
        // Sempre buscar todas as magias da classe e filtrar localmente se necessário
        url = `https://www.dnd5eapi.co/api/2014/classes/${apiClass}/spells`;
        
        // Se há nível ou escola, precisamos filtrar localmente
        if (filters.level !== null || filters.school) {
          needsLocalFiltering = true;
        }
      }
      // Sem classe: usar endpoints globais que suportam filtros
      else {
        const params = new URLSearchParams();
        if (filters.level !== null) params.append('level', filters.level.toString());
        if (filters.school) params.append('school', filters.school);
        
        if (params.toString()) {
          url = `https://www.dnd5eapi.co/api/2014/spells?${params.toString()}`;
        } else {
          // Sem filtros - buscar todas as magias
          url = `https://www.dnd5eapi.co/api/2014/spells`;
        }
      }
      
      // Buscar lista básica de feitiços
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch spells");
      const data = await res.json();
      
      // A API retorna { count: number, results: [...] }
      // Garantir que temos results mesmo se a estrutura for diferente
      const resultsArray = Array.isArray(data) ? data : (data.results || []);
      let results = z.array(spellListItemSchema).parse(resultsArray);
      
      // REFINAMENTO NO FRONT-END (quando necessário)
      // Se filtramos por classe e há nível ou escola, precisamos buscar detalhes
      if (needsLocalFiltering && results.length > 0) {
        // Buscar detalhes em paralelo usando Promise.all (otimização de performance)
        const detailPromises = results.map((spell) => {
          // A URL pode ser relativa ou absoluta
          const detailUrl = spell.url.startsWith('http') 
            ? spell.url 
            : `https://www.dnd5eapi.co${spell.url.startsWith('/') ? spell.url : `/${spell.url}`}`;
          
          return fetch(detailUrl)
            .then(res => res.ok ? res.json() : null)
            .catch(() => null);
        });
        
        const detailedSpells = await Promise.all(detailPromises);
        
        // Filtrar por nível e escola
        const filtered = detailedSpells
          .filter((spell): spell is any => spell !== null)
          .filter(spell => {
            const matchLevel = filters.level === null || spell.level === filters.level;
            const matchSchool = !filters.school || spell.school?.index === filters.school || spell.school?.name?.toLowerCase() === filters.school;
            return matchLevel && matchSchool;
          })
          .map(spell => ({
            index: spell.index,
            name: spell.name,
            level: spell.level,
            url: spell.url || `/api/spells/${spell.index}`,
          }));
        
        return z.array(spellListItemSchema).parse(filtered);
      }
      
      return results;
    },
    enabled: enabled, // Sempre habilitado quando enabled=true (já controlado pelo componente)
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

// Mantido para compatibilidade (deprecated - usar useClassSpells)
export function useNecromancySpells() {
  return useQuery({
    queryKey: ["spells", "necromancy"],
    queryFn: async () => {
      const res = await fetch("https://www.dnd5eapi.co/api/spells?school=necromancy");
      if (!res.ok) throw new Error("Failed to fetch spells");
      const data = await res.json();
      return z.array(spellListItemSchema).parse(data.results);
    },
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}

// Fetch single spell details
export function useSpellDetail(index: string | null) {
  return useQuery({
    queryKey: ["spell", index],
    queryFn: async () => {
      if (!index) return null;
      const res = await fetch(`https://www.dnd5eapi.co/api/spells/${index}`);
      if (!res.ok) throw new Error("Failed to fetch spell details");
      const data = await res.json();
      return spellDetailSchema.parse(data);
    },
    enabled: !!index,
    staleTime: 1000 * 60 * 60 * 24,
  });
}

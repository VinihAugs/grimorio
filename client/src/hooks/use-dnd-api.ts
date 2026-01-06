import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

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
    name: z.string(),
    url: z.string(),
  }),
});

export type SpellListItem = z.infer<typeof spellListItemSchema>;
export type SpellDetail = z.infer<typeof spellDetailSchema>;

// Fetch all Necromancy spells
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

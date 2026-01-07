import { z } from "zod";

// Classes de D&D 5e
export const dndClasses = [
  "Bárbaro",
  "Bardo",
  "Bruxo",
  "Clérigo",
  "Druida",
  "Feiticeiro",
  "Guerreiro",
  "Ladino",
  "Mago",
  "Monge",
  "Paladino",
  "Patrulheiro",
] as const;

export const characterSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  name: z.string().min(1, "Nome é obrigatório"),
  class: z.enum(dndClasses as any, {
    errorMap: () => ({ message: "Classe inválida" }),
  }),
  avatar: z.string().url().optional().nullable(),
  level: z.number().int().min(1).max(20).default(1),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const createCharacterSchema = characterSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Character = z.infer<typeof characterSchema>;
export type CreateCharacter = z.infer<typeof createCharacterSchema>;
export type DnDClass = typeof dndClasses[number];


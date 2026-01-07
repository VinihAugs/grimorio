import { z } from "zod";

export const noteSchema = z.object({
  id: z.string().optional(),
  userId: z.string(),
  characterId: z.string(),
  title: z.string().min(1, "Título é obrigatório"),
  content: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export const createNoteSchema = noteSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Note = z.infer<typeof noteSchema>;
export type CreateNote = z.infer<typeof createNoteSchema>;


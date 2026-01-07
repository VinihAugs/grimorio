import type { InsertFavorite, Favorite } from "@shared/schema";
import { MongoDBStorage } from "./storage-mongodb";
import { MemoryStorage } from "./storage-memory";

// Tipo estendido para incluir characterId opcional
type InsertFavoriteWithCharacter = InsertFavorite & { characterId?: string };

export interface IStorage {
  getFavorites(userId: string): Promise<Favorite[]>;
  createFavorite(favorite: InsertFavoriteWithCharacter, userId: string): Promise<Favorite>;
  deleteFavorite(spellIndex: string, userId: string): Promise<void>;
  }

// Usa MongoDB se MONGODB_URI estiver definido, senão usa memória
export const storage = process.env.MONGODB_URI
  ? new MongoDBStorage()
  : new MemoryStorage();

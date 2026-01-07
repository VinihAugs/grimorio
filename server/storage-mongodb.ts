import { getDB } from "./mongodb";
import type { InsertFavorite, Favorite } from "@shared/schema";

// Tipo estendido para incluir characterId opcional
type InsertFavoriteWithCharacter = InsertFavorite & { characterId?: string };
type FavoriteWithExtras = Favorite & { userId: string; characterId?: string };

export interface IStorage {
  getFavorites(userId: string): Promise<Favorite[]>;
  createFavorite(favorite: InsertFavoriteWithCharacter, userId: string): Promise<Favorite>;
  deleteFavorite(spellIndex: string, userId: string): Promise<void>;
}

export class MongoDBStorage implements IStorage {
  async getFavorites(userId: string): Promise<Favorite[]> {
    const db = getDB();
    const favorites = await db
      .collection<Favorite>("favorites")
      .find({ userId })
      .toArray();
    return favorites;
  }

  async createFavorite(
    favorite: InsertFavoriteWithCharacter,
    userId: string
  ): Promise<Favorite> {
    const db = getDB();
    const favoritesCollection = db.collection<FavoriteWithExtras>(
      "favorites"
    );

    // Check if already exists
    const existing = await favoritesCollection.findOne({
      spellIndex: favorite.spellIndex,
      userId,
    });

    if (existing) {
      // Converter para o formato esperado (id como number)
      return {
        id: typeof existing.id === 'string' ? parseInt(existing.id) || 0 : (existing.id as number) || 0,
        spellIndex: existing.spellIndex,
        spellName: existing.spellName,
        level: existing.level,
        createdAt: existing.createdAt,
      };
    }

    // Create new favorite
    const newFavorite: Omit<FavoriteWithExtras, "id"> = {
      spellIndex: favorite.spellIndex,
      spellName: favorite.spellName,
      level: favorite.level || null,
      createdAt: new Date(),
      userId,
      // Adicionar characterId se fornecido (opcional)
      ...(favorite.characterId && { characterId: favorite.characterId }),
    };
    
    const result = await favoritesCollection.insertOne(newFavorite as any);
    const createdFavorite: Favorite = {
      id: parseInt(result.insertedId.toString()) || 0,
      spellIndex: newFavorite.spellIndex,
      spellName: newFavorite.spellName,
      level: newFavorite.level,
      createdAt: newFavorite.createdAt,
    };
    
    return createdFavorite;
  }

  async deleteFavorite(spellIndex: string, userId: string): Promise<void> {
    const db = getDB();
    await db.collection("favorites").deleteOne({
      spellIndex,
      userId,
    });
  }
}


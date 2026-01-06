import { db } from "./db";
import { favorites, type InsertFavorite, type Favorite } from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getFavorites(): Promise<Favorite[]>;
  createFavorite(favorite: InsertFavorite): Promise<Favorite>;
  deleteFavorite(spellIndex: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getFavorites(): Promise<Favorite[]> {
    return await db.select().from(favorites);
  }

  async createFavorite(favorite: InsertFavorite): Promise<Favorite> {
    const [created] = await db.insert(favorites).values(favorite).onConflictDoNothing().returning();
    // Return existing if duplicate (onConflictDoNothing returns undefined if conflict)
    // For simplicity in this demo, if it exists, we just return the first match
    if (!created) {
       const [existing] = await db.select().from(favorites).where(eq(favorites.spellIndex, favorite.spellIndex));
       return existing;
    }
    return created;
  }

  async deleteFavorite(spellIndex: string): Promise<void> {
    await db.delete(favorites).where(eq(favorites.spellIndex, spellIndex));
  }
}

export const storage = new DatabaseStorage();

import type { InsertFavorite, Favorite } from "@shared/schema";

// Tipo estendido para incluir characterId opcional
type InsertFavoriteWithCharacter = InsertFavorite & { characterId?: string };

// Storage em memória - não precisa de banco de dados!
// Os favoritos serão perdidos quando o servidor reiniciar
export class MemoryStorage {
  private favorites: Map<string, Map<string, Favorite>> = new Map(); // userId -> Map<spellIndex, Favorite>
  private nextId = 1;

  async getFavorites(userId: string): Promise<Favorite[]> {
    const userFavorites = this.favorites.get(userId);
    return userFavorites ? Array.from(userFavorites.values()) : [];
  }

  async createFavorite(favorite: InsertFavoriteWithCharacter, userId: string): Promise<Favorite> {
    let userFavorites = this.favorites.get(userId);
    if (!userFavorites) {
      userFavorites = new Map();
      this.favorites.set(userId, userFavorites);
    }

    // Verifica se já existe
    const existing = userFavorites.get(favorite.spellIndex);
    if (existing) {
      return existing;
    }

    // Cria novo favorito
    const newFavorite: Favorite & { characterId?: string } = {
      id: this.nextId++,
      spellIndex: favorite.spellIndex,
      spellName: favorite.spellName,
      level: favorite.level || null,
      createdAt: new Date(),
      // Adicionar characterId se fornecido (opcional)
      ...(favorite.characterId && { characterId: favorite.characterId }),
    };

    userFavorites.set(favorite.spellIndex, newFavorite);
    return newFavorite;
  }

  async deleteFavorite(spellIndex: string, userId: string): Promise<void> {
    const userFavorites = this.favorites.get(userId);
    if (userFavorites) {
      userFavorites.delete(spellIndex);
    }
  }
}


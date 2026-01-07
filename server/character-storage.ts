import { getDB } from "./mongodb";
import type { Character, CreateCharacter } from "@shared/character-schema";

export interface ICharacterStorage {
  getCharacters(userId: string): Promise<Character[]>;
  getCharacter(characterId: string, userId: string): Promise<Character | null>;
  createCharacter(character: CreateCharacter): Promise<Character>;
  updateCharacter(characterId: string, userId: string, updates: Partial<Character>): Promise<Character>;
  deleteCharacter(characterId: string, userId: string): Promise<void>;
}

export class MongoDBCharacterStorage implements ICharacterStorage {
  async getCharacters(userId: string): Promise<Character[]> {
    const db = getDB();
    const characters = await db
      .collection<Character>("characters")
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray();
    return characters.map(char => ({
      ...char,
      id: char._id?.toString() || char.id,
    }));
  }

  async getCharacter(characterId: string, userId: string): Promise<Character | null> {
    const db = getDB();
    const { ObjectId } = await import("mongodb");
    
    let character = null;
    if (ObjectId.isValid(characterId) && characterId.length === 24) {
      character = await db.collection<Character>("characters").findOne({
        _id: new ObjectId(characterId),
        userId,
      });
    } else {
      character = await db.collection<Character>("characters").findOne({
        _id: characterId,
        userId,
      });
    }
    
    if (!character) return null;
    
    return {
      ...character,
      id: character._id?.toString() || character.id,
    };
  }

  async createCharacter(character: CreateCharacter): Promise<Character> {
    const db = getDB();
    const charactersCollection = db.collection<Character & { userId: string }>("characters");

    const newCharacter: Omit<Character, "id"> & { userId: string } = {
      ...character,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await charactersCollection.insertOne(newCharacter as any);
    const created = await charactersCollection.findOne({ _id: result.insertedId });
    
    if (!created) throw new Error("Erro ao criar personagem");

    return {
      ...created,
      id: created._id?.toString(),
    };
  }

  async updateCharacter(
    characterId: string,
    userId: string,
    updates: Partial<Character>
  ): Promise<Character> {
    const db = getDB();
    const { ObjectId } = await import("mongodb");
    const charactersCollection = db.collection<Character>("characters");

    const query: any = { userId };
    if (ObjectId.isValid(characterId) && characterId.length === 24) {
      query._id = new ObjectId(characterId);
    } else {
      query._id = characterId;
    }

    await charactersCollection.updateOne(query, {
      $set: {
        ...updates,
        updatedAt: new Date(),
      },
    });

    const updated = await charactersCollection.findOne(query);
    if (!updated) throw new Error("Personagem não encontrado");

    return {
      ...updated,
      id: updated._id?.toString(),
    };
  }

  async deleteCharacter(characterId: string, userId: string): Promise<void> {
    const db = getDB();
    const { ObjectId } = await import("mongodb");
    
    const query: any = { userId };
    if (ObjectId.isValid(characterId) && characterId.length === 24) {
      query._id = new ObjectId(characterId);
    } else {
      query._id = characterId;
    }

    await db.collection("characters").deleteOne(query);
  }
}

// Usa MongoDB se disponível, senão memória
export const characterStorage = process.env.MONGODB_URI
  ? new MongoDBCharacterStorage()
  : (() => {
      // Fallback em memória (não implementado ainda, mas pode ser adicionado)
      throw new Error("Character storage requires MongoDB");
    })();


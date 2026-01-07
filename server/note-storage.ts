import { getDB } from "./mongodb";
import type { Note, CreateNote } from "@shared/note-schema";

export interface INoteStorage {
  getNotes(userId: string, characterId: string): Promise<Note[]>;
  getNote(noteId: string, userId: string): Promise<Note | null>;
  createNote(note: CreateNote): Promise<Note>;
  updateNote(noteId: string, userId: string, updates: Partial<Note>): Promise<Note>;
  deleteNote(noteId: string, userId: string): Promise<void>;
}

export class MongoDBNoteStorage implements INoteStorage {
  async getNotes(userId: string, characterId: string): Promise<Note[]> {
    const db = getDB();
    const notes = await db
      .collection<Note>("notes")
      .find({ userId, characterId })
      .sort({ updatedAt: -1, createdAt: -1 })
      .toArray();
    return notes.map(note => ({
      ...note,
      id: note._id?.toString() || note.id,
    }));
  }

  async getNote(noteId: string, userId: string): Promise<Note | null> {
    const db = getDB();
    const { ObjectId } = await import("mongodb");
    
    let note = null;
    const query: any = { userId };
    if (ObjectId.isValid(noteId) && noteId.length === 24) {
      query._id = new ObjectId(noteId);
    } else {
      query._id = noteId;
    }
    
    note = await db.collection<Note>("notes").findOne(query);
    
    if (!note) return null;
    
    return {
      ...note,
      id: note._id?.toString() || note.id,
    };
  }

  async createNote(note: CreateNote): Promise<Note> {
    const db = getDB();
    const notesCollection = db.collection<Note & { userId: string; characterId: string }>("notes");

    const newNote: Omit<Note, "id"> & { userId: string; characterId: string } = {
      ...note,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await notesCollection.insertOne(newNote as any);
    const created = await notesCollection.findOne({ _id: result.insertedId });
    
    if (!created) throw new Error("Erro ao criar nota");

    return {
      ...created,
      id: created._id?.toString(),
    };
  }

  async updateNote(
    noteId: string,
    userId: string,
    updates: Partial<Note>
  ): Promise<Note> {
    const db = getDB();
    const { ObjectId } = await import("mongodb");
    const notesCollection = db.collection<Note>("notes");

    const query: any = { userId };
    if (ObjectId.isValid(noteId) && noteId.length === 24) {
      query._id = new ObjectId(noteId);
    } else {
      query._id = noteId;
    }

    await notesCollection.updateOne(query, {
      $set: {
        ...updates,
        updatedAt: new Date(),
      },
    });

    const updated = await notesCollection.findOne(query);
    if (!updated) throw new Error("Nota não encontrada");

    return {
      ...updated,
      id: updated._id?.toString(),
    };
  }

  async deleteNote(noteId: string, userId: string): Promise<void> {
    const db = getDB();
    const { ObjectId } = await import("mongodb");
    
    const query: any = { userId };
    if (ObjectId.isValid(noteId) && noteId.length === 24) {
      query._id = new ObjectId(noteId);
    } else {
      query._id = noteId;
    }

    await db.collection("notes").deleteOne(query);
  }
}

// Usa MongoDB se disponível, senão memória
export const noteStorage: INoteStorage = process.env.MONGODB_URI
  ? new MongoDBNoteStorage()
  : new MongoDBNoteStorage(); // Sempre usa MongoDB para notas


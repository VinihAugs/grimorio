import { Db } from "mongodb";
import { getDB } from "./mongodb";

export async function initializeDatabase(): Promise<void> {
  try {
    const db = getDB();
    if (!db) {
      console.log("⚠️  MongoDB não configurado, pulando inicialização do banco.");
      return;
    }

    console.log("🔧 Inicializando banco de dados 'necro_tome'...");

    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);

    const usersCollection = db.collection("users");
    
    if (!collectionNames.includes("users")) {
      await usersCollection.insertOne({ _temp: true });
      await usersCollection.deleteOne({ _temp: true });
      console.log("✅ Coleção 'users' criada");
    }
    
    try {
      await usersCollection.createIndex({ email: 1 }, { unique: true });
      console.log("✅ Índice único em 'email' criado");
    } catch (e: any) {
      if (e.code !== 85 && e.code !== 86) {
        console.warn("⚠️  Erro ao criar índice em email:", e.message);
      }
    }

    const favoritesCollection = db.collection("favorites");
    
    if (!collectionNames.includes("favorites")) {
      await favoritesCollection.insertOne({ _temp: true });
      await favoritesCollection.deleteOne({ _temp: true });
      console.log("✅ Coleção 'favorites' criada");
    }
    
    try {
      await favoritesCollection.createIndex(
        { userId: 1, spellIndex: 1 }, 
        { unique: true }
      );
      console.log("✅ Índice único composto (userId, spellIndex) criado");
    } catch (e: any) {
      if (e.code !== 85 && e.code !== 86) {
        console.warn("⚠️  Erro ao criar índice composto:", e.message);
      }
    }

    try {
      await favoritesCollection.createIndex({ userId: 1 });
      console.log("✅ Índice em 'userId' criado");
    } catch (e: any) {
      if (e.code !== 85 && e.code !== 86) {
        console.warn("⚠️  Erro ao criar índice em userId:", e.message);
      }
    }

    const charactersCollection = db.collection("characters");
    
    if (!collectionNames.includes("characters")) {
      await charactersCollection.insertOne({ _temp: true });
      await charactersCollection.deleteOne({ _temp: true });
      console.log("✅ Coleção 'characters' criada");
    }
    
    try {
      await charactersCollection.createIndex({ userId: 1 });
      console.log("✅ Índice em 'userId' (characters) criado");
    } catch (e: any) {
      if (e.code !== 85 && e.code !== 86) {
        console.warn("⚠️  Erro ao criar índice em userId (characters):", e.message);
      }
    }

    const notesCollection = db.collection("notes");
    
    if (!collectionNames.includes("notes")) {
      await notesCollection.insertOne({ _temp: true });
      await notesCollection.deleteOne({ _temp: true });
      console.log("✅ Coleção 'notes' criada");
    }
    
    try {
      await notesCollection.createIndex({ userId: 1, characterId: 1 });
      console.log("✅ Índice composto (userId, characterId) em 'notes' criado");
    } catch (e: any) {
      if (e.code !== 85 && e.code !== 86) {
        console.warn("⚠️  Erro ao criar índice composto em notes:", e.message);
      }
    }

    try {
      await notesCollection.createIndex({ userId: 1 });
      console.log("✅ Índice em 'userId' (notes) criado");
    } catch (e: any) {
      if (e.code !== 85 && e.code !== 86) {
        console.warn("⚠️  Erro ao criar índice em userId (notes):", e.message);
      }
    }

    console.log("✅ Banco de dados 'necro_tome' inicializado com sucesso!");
  } catch (error: any) {
    console.error("❌ Erro ao inicializar banco de dados:", error);
    console.log("⚠️  Continuando mesmo com erro na inicialização...");
  }
}


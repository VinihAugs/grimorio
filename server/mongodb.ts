import { MongoClient, Db } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;

function getClient(): MongoClient | null {
  if (!process.env.MONGODB_URI) {
    return null;
  }
  if (!client) {
    // Configura opções de conexão para MongoDB Atlas
    const options = {
      // Força uso de SSL/TLS (necessário para MongoDB Atlas)
      tls: true,
      // Timeout de conexão
      connectTimeoutMS: 30000,
      // Timeout de socket
      socketTimeoutMS: 30000,
      // Retry de conexão
      retryWrites: true,
      // Retry de leitura
      retryReads: true,
      // Pool de conexões
      maxPoolSize: 10,
      // Min pool size
      minPoolSize: 1,
    };
    
    client = new MongoClient(process.env.MONGODB_URI, options);
  }
  return client;
}

export async function connectMongoDB(): Promise<Db | null> {
  if (!process.env.MONGODB_URI) {
    console.warn("⚠️  MONGODB_URI não configurado. Usando armazenamento em memória.");
    return null;
  }

  if (db) {
    return db;
  }

  const mongoClient = getClient();
  if (!mongoClient) {
    return null;
  }

  try {
    console.log("🔌 Conectando ao MongoDB...");
    await mongoClient.connect();
    console.log("✅ Conexão estabelecida com MongoDB");
    
    db = mongoClient.db("necro_tome");
    console.log("📦 Usando banco de dados: necro_tome");
    
    // Testa a conexão
    await db.admin().ping();
    console.log("✅ Ping bem-sucedido - MongoDB está respondendo");
    
    // Inicializa o banco (cria coleções e índices se necessário)
    try {
      const { initializeDatabase } = await import("./init-db");
      await initializeDatabase();
    } catch (initError: any) {
      console.warn("⚠️  Erro ao inicializar banco:", initError?.message || initError);
      // Não bloqueia se houver erro na inicialização
    }
    
    return db;
  } catch (error: any) {
    console.error("❌ MongoDB connection error:", error.message || error);
    if (error.message?.includes("authentication")) {
      console.error("💡 Verifique se o usuário e senha estão corretos no MONGODB_URI");
    }
    if (error.message?.includes("ENOTFOUND") || error.message?.includes("getaddrinfo")) {
      console.error("💡 Verifique se a URL do MongoDB está correta e acessível");
    }
    throw error;
  }
}

export function getDB(): Db {
  if (!db) {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI não está configurado. Configure a variável de ambiente MONGODB_URI.");
    }
    throw new Error("Database not connected. Call connectMongoDB() first.");
  }
  return db;
}

// Garante que o MongoDB está conectado, reconecta se necessário
export async function ensureMongoDBConnection(): Promise<Db | null> {
  // Se não tem MONGODB_URI, retorna null (usa memória)
  if (!process.env.MONGODB_URI) {
    return null;
  }

  // Se já está conectado, testa a conexão
  if (db) {
    try {
      // Testa a conexão fazendo um ping
      await db.admin().ping();
      return db;
    } catch (error) {
      // Se o ping falhou, reconecta
      console.log("⚠️  Conexão MongoDB perdida, reconectando...");
      db = null;
      const mongoClient = getClient();
      if (mongoClient) {
        try {
          await mongoClient.close();
          client = null;
        } catch (e) {
          // Ignora erros ao fechar
        }
      }
    }
  }

  // Tenta conectar
  try {
    const connectedDb = await connectMongoDB();
    if (connectedDb) {
      // Garante que o banco está inicializado após reconexão
      try {
        const { initializeDatabase } = await import("./init-db");
        await initializeDatabase();
      } catch (initError) {
        // Ignora erros de inicialização em reconexão
      }
    }
    return connectedDb;
  } catch (error) {
    console.error("❌ Erro ao conectar MongoDB:", error);
    return null;
  }
}

export async function closeMongoDB(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}

// Verifica se MongoDB está configurado
export function isMongoDBConfigured(): boolean {
  return !!process.env.MONGODB_URI;
}

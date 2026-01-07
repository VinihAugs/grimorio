import { MongoClient, Db } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;
let isConnecting = false;
let connectionPromise: Promise<Db | null> | null = null;
let lastConnectionCheck = 0;
const CONNECTION_CHECK_INTERVAL = 30000; // Verifica conexão a cada 30 segundos

function getClient(): MongoClient | null {
  if (!process.env.MONGODB_URI) {
    return null;
  }
  if (!client) {
    // Garante que a connection string tem os parâmetros necessários
    let mongoUri = process.env.MONGODB_URI;
    
    // Se não tiver parâmetros de query, adiciona
    if (!mongoUri.includes('?')) {
      mongoUri += '?retryWrites=true&w=majority';
    } else if (!mongoUri.includes('retryWrites')) {
      mongoUri += '&retryWrites=true';
    }
    if (!mongoUri.includes('w=majority') && !mongoUri.includes('w=')) {
      mongoUri += mongoUri.includes('?') ? '&w=majority' : '?w=majority';
    }
    
    // Configura opções de conexão para MongoDB Atlas otimizadas
    const options = {
      // Timeout de conexão reduzido para resposta mais rápida
      connectTimeoutMS: 10000, // 10 segundos
      // Timeout de socket
      socketTimeoutMS: 45000, // 45 segundos
      // Retry de conexão
      retryWrites: true,
      // Retry de leitura
      retryReads: true,
      // Pool de conexões - mantém conexões abertas
      maxPoolSize: 10,
      // Min pool size - mantém pelo menos 1 conexão sempre aberta
      minPoolSize: 1,
      // Server selection timeout
      serverSelectionTimeoutMS: 10000, // 10 segundos
      // Heartbeat frequency - verifica conexão periodicamente
      heartbeatFrequencyMS: 10000,
    };
    
    // Para MongoDB Atlas (mongodb+srv://), não precisa especificar tls explicitamente
    // O driver já usa TLS automaticamente para mongodb+srv://
    if (!mongoUri.startsWith('mongodb+srv://')) {
      // Para connection strings normais, força TLS
      (options as any).tls = true;
    }
    
    console.log("🔗 Usando MongoDB URI:", mongoUri.replace(/:[^:@]+@/, ':****@')); // Esconde senha nos logs
    
    client = new MongoClient(mongoUri, options);
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
    
    // Tenta conectar com timeout
    await Promise.race([
      mongoClient.connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Connection timeout")), 10000)
      )
    ]);
    
    console.log("✅ Conexão estabelecida com MongoDB");
    
    db = mongoClient.db("necro_tome");
    console.log("📦 Usando banco de dados: necro_tome");
    
    // Testa a conexão com timeout
    try {
      await Promise.race([
        db.admin().ping(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Ping timeout")), 5000)
        )
      ]);
      console.log("✅ Ping bem-sucedido - MongoDB está respondendo");
    } catch (pingError) {
      console.warn("⚠️  Ping falhou, mas continuando...", pingError);
      // Não bloqueia se o ping falhar
    }
    
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
    if (error.message?.includes("SSL") || error.message?.includes("TLS")) {
      console.error("💡 Erro SSL/TLS. Verifique a connection string do MongoDB Atlas");
      console.error("💡 Certifique-se de que a connection string inclui: ?retryWrites=true&w=majority");
    }
    // Não lança erro - permite que o servidor continue com armazenamento em memória
    console.warn("⚠️  Continuando sem MongoDB - usando armazenamento em memória");
    return null;
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
// Otimizado para não fazer ping a cada requisição
export async function ensureMongoDBConnection(): Promise<Db | null> {
  // Se não tem MONGODB_URI, retorna null (usa memória)
  if (!process.env.MONGODB_URI) {
    return null;
  }

  // Se já está conectado e a última verificação foi recente, retorna direto
  if (db && Date.now() - lastConnectionCheck < CONNECTION_CHECK_INTERVAL) {
    return db;
  }

  // Se já está conectando, aguarda a conexão existente
  if (isConnecting && connectionPromise) {
    return connectionPromise;
  }

  // Se já está conectado mas precisa verificar, faz verificação rápida
  if (db) {
    try {
      // Verificação rápida sem ping - apenas verifica se o client está conectado
      const mongoClient = getClient();
      if (mongoClient && mongoClient.topology?.isConnected()) {
        lastConnectionCheck = Date.now();
        return db;
      }
    } catch (error) {
      // Se falhou, marca como desconectado
      console.log("⚠️  Conexão MongoDB perdida, reconectando...");
      db = null;
      client = null;
    }
  }

  // Tenta conectar (com cache de promise para evitar múltiplas conexões simultâneas)
  if (!connectionPromise) {
    isConnecting = true;
    connectionPromise = (async () => {
      try {
        const connectedDb = await connectMongoDB();
        if (connectedDb) {
          lastConnectionCheck = Date.now();
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
      } finally {
        isConnecting = false;
        connectionPromise = null;
      }
    })();
  }

  return connectionPromise;
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

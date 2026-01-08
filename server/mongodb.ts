import { MongoClient, Db } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;
let isConnecting = false;
let connectionPromise: Promise<Db | null> | null = null;
let lastConnectionCheck = 0;
const CONNECTION_CHECK_INTERVAL = 30000;

export function getClient(): MongoClient | null {
  if (!process.env.MONGODB_URI) {
    return null;
  }
  if (!client) {
    let mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri.includes('?')) {
      mongoUri += '?retryWrites=true&w=majority';
    } else if (!mongoUri.includes('retryWrites')) {
      mongoUri += '&retryWrites=true';
    }
    if (!mongoUri.includes('w=majority') && !mongoUri.includes('w=')) {
      mongoUri += mongoUri.includes('?') ? '&w=majority' : '?w=majority';
    }
    
    const options = {
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      retryReads: true,
      maxPoolSize: 10,
      minPoolSize: 1,
      serverSelectionTimeoutMS: 10000,
      heartbeatFrequencyMS: 10000,
    };
    
    if (!mongoUri.startsWith('mongodb+srv://')) {
      (options as any).tls = true;
    }
    
    client = new MongoClient(mongoUri, options);
  }
  return client;
}

export async function connectMongoDB(): Promise<Db | null> {
  if (!process.env.MONGODB_URI) {
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
    await Promise.race([
      mongoClient.connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Connection timeout")), 10000)
      )
    ]);
    
    db = mongoClient.db("necro_tome");
    
    try {
      await Promise.race([
        db.admin().ping(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Ping timeout")), 5000)
        )
      ]);
    } catch (pingError) {
    }
    
    try {
      const { initializeDatabase } = await import("./init-db");
      await initializeDatabase();
    } catch (initError: any) {
    }
    
    return db;
  } catch (error: any) {
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

export async function ensureMongoDBConnection(): Promise<Db | null> {
  if (!process.env.MONGODB_URI) {
    return null;
  }

  if (db && Date.now() - lastConnectionCheck < CONNECTION_CHECK_INTERVAL) {
    return db;
  }

  if (isConnecting && connectionPromise) {
    return connectionPromise;
  }

  if (db) {
    try {
      const mongoClient = getClient();
      if (mongoClient && mongoClient.topology?.isConnected()) {
        lastConnectionCheck = Date.now();
        return db;
      }
    } catch (error) {
      db = null;
      client = null;
    }
  }

  if (!connectionPromise) {
    isConnecting = true;
    connectionPromise = (async () => {
      try {
        const connectedDb = await connectMongoDB();
        if (connectedDb) {
          lastConnectionCheck = Date.now();
          try {
            const { initializeDatabase } = await import("./init-db");
            await initializeDatabase();
          } catch (initError) {
          }
        }
        return connectedDb;
      } catch (error) {
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

export function isMongoDBConfigured(): boolean {
  return !!process.env.MONGODB_URI;
}

import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import { getDB, ensureMongoDBConnection } from "./mongodb";
import type { Express, Request, Response, NextFunction } from "express";

export interface User {
  _id?: string;
  email: string;
  name: string;
  password?: string;
  avatar?: string;
  createdAt: Date;
}

// Serialize user for session
passport.serializeUser((user: any, done) => {
  try {
    console.log("📦 Serializando usuário:", user._id);
    // MongoDB ObjectId precisa ser convertido para string
    let id: string;
    if (user._id) {
      if (typeof user._id.toString === 'function') {
        id = user._id.toString();
      } else {
        id = String(user._id);
      }
    } else {
      id = String(user._id);
    }
    console.log("📦 ID serializado:", id);
    done(null, id);
  } catch (error: any) {
    console.error("❌ Erro ao serializar usuário:", error);
    done(error, null);
  }
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const db = await ensureMongoDBConnection();
    if (!db) {
      return done(new Error("Database not available"), null);
    }
    const { ObjectId } = await import("mongodb");
    
    // Tenta encontrar o usuário usando ObjectId se válido, senão usa string
    let user = null;
    if (ObjectId.isValid(id) && id.length === 24) {
      try {
        user = await db.collection<User>("users").findOne({ 
          _id: new ObjectId(id)
        });
      } catch (e) {
        // Se falhar com ObjectId, tenta como string
        user = await db.collection<User>("users").findOne({ 
          _id: id 
        });
      }
    } else {
      user = await db.collection<User>("users").findOne({ 
        _id: id 
      });
    }
    
    done(null, user);
  } catch (error: any) {
    console.error("Erro ao deserializar usuário:", error);
    done(error, null);
  }
});

// Local Strategy (email/password)
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        console.log(`🔐 Tentativa de login para: ${email}`);
        const db = await ensureMongoDBConnection();
        if (!db) {
          console.error("❌ MongoDB não disponível no login");
          return done(new Error("Database not available"), false, { 
            message: "Banco de dados não disponível. Verifique a conexão." 
          });
        }
        
        console.log("🔍 Buscando usuário no banco...");
        const user = await db.collection<User>("users").findOne({ email });
        console.log(`👤 Usuário encontrado: ${user ? "Sim" : "Não"}`);

        if (!user) {
          return done(null, false, { message: "Usuário não encontrado" });
        }


        console.log("🔒 Verificando senha...");
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          console.log("❌ Senha incorreta");
          return done(null, false, { message: "Senha incorreta" });
        }

        console.log("✅ Login bem-sucedido!");
        return done(null, user);
      } catch (error: any) {
        console.error("❌ Erro na estratégia local:", error);
        return done(error, undefined);
      }
    }
  )
);

// Middleware to check if user is authenticated
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Não autenticado" });
}

// Helper to get current user
export function getCurrentUser(req: Request): User | undefined {
  return req.user as User | undefined;
}


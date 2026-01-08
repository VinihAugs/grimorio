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

passport.serializeUser((user: any, done) => {
  try {
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
    done(null, id);
  } catch (error: any) {
    done(error, null);
  }
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const db = await ensureMongoDBConnection();
    if (!db) {
      return done(new Error("Database not available"), null);
    }
    const { ObjectId } = await import("mongodb");
    
    let user = null;
    if (ObjectId.isValid(id) && id.length === 24) {
      try {
        user = await db.collection<User>("users").findOne({ 
          _id: new ObjectId(id)
        });
      } catch (e) {
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
    done(error, null);
  }
});

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const db = await ensureMongoDBConnection();
        if (!db) {
          return done(new Error("Database not available"), false, { 
            message: "Banco de dados não disponível. Verifique a conexão." 
          });
        }
        
        const user = await db.collection<User>("users").findOne({ email });

        if (!user) {
          return done(null, false, { message: "Usuário não encontrado" });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
          return done(null, false, { message: "Senha incorreta" });
        }

        return done(null, user);
      } catch (error: any) {
        return done(error, undefined);
      }
    }
  )
);

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

export function getCurrentUser(req: Request): User | undefined {
  return req.user as User | undefined;
}

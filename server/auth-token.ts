import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { ensureMongoDBConnection } from "./mongodb";
import type { User } from "./auth";

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || "necro-tome-jwt-secret-change-in-production";

export function generateToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
}

export async function verifyToken(token: string): Promise<string | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch (error) {
    return null;
  }
}

// Middleware híbrido: aceita token OU cookie
export async function requireAuthHybrid(
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Tenta autenticar via token primeiro
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    const userId = await verifyToken(token);
    
    if (userId) {
      // Token válido - carrega o usuário do banco
      try {
        const db = await ensureMongoDBConnection();
        if (db) {
          const { ObjectId } = await import("mongodb");
          let user = null;
          
          if (ObjectId.isValid(userId) && userId.length === 24) {
            user = await db.collection<User>("users").findOne({ 
              _id: new ObjectId(userId)
            });
          } else {
            user = await db.collection<User>("users").findOne({ 
              _id: userId 
            });
          }
          
          if (user) {
            // Remove password antes de anexar ao req
            const { password, ...userWithoutPassword } = user;
            (req as any).user = userWithoutPassword;
            (req as any).isAuthenticated = () => true;
            console.log("✅ Autenticado via TOKEN:", user.email);
            return next();
          }
        }
      } catch (error) {
        console.error("❌ Erro ao autenticar via token:", error);
      }
    }
  }
  
  // Se não autenticou via token, tenta via cookie/sessão
  if (req.isAuthenticated && req.isAuthenticated()) {
    console.log("✅ Autenticado via COOKIE");
    return next();
  }
  
  // Não autenticado
  console.log("❌ Não autenticado - nem token nem cookie");
  res.status(401).json({ message: "Não autenticado" });
}

export function getCurrentUserHybrid(req: Request): User | undefined {
  return (req as any).user as User | undefined;
}


import type { Express } from "express";
import type { Server } from "http";
import passport from "passport";
import bcrypt from "bcryptjs";
import multer from "multer";
import { storage } from "./storage";
import { characterStorage } from "./character-storage";
import { noteStorage } from "./note-storage";
import { api } from "@shared/routes";
import { requireAuth, getCurrentUser } from "./auth";
import { generateToken, requireAuthHybrid, getCurrentUserHybrid } from "./auth-token";
import { getDB, ensureMongoDBConnection } from "./mongodb";
import type { User } from "./auth";
import { createCharacterSchema } from "@shared/character-schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/auth/me", requireAuthHybrid, async (req, res) => {
    const user = getCurrentUserHybrid(req) || getCurrentUser(req);
    if (user) {
      res.json({
        id: user._id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      });
    } else {
      res.status(401).json({ message: "Não autenticado" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { email, password, name } = req.body;
      
      if (!email || !password || !name) {
        return res.status(400).json({ message: "Email, senha e nome são obrigatórios" });
      }

      let db;
      try {
        db = await Promise.race([
          ensureMongoDBConnection(),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000))
        ]);
      } catch (error) {
        db = null;
      }
      
      if (!db) {
        return res.status(503).json({ 
          message: "Serviço temporariamente indisponível. Tente novamente em alguns instantes." 
        });
      }

      try {
        const usersCollection = db.collection<User>("users");

        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ message: "Email já cadastrado" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser: User = {
          email,
          name,
          password: hashedPassword,
          createdAt: new Date(),
        };

        const result = await usersCollection.insertOne(newUser as any);
        const createdUser = await usersCollection.findOne({ _id: result.insertedId });
        if (!createdUser) {
          return res.status(500).json({ message: "Erro ao criar usuário" });
        }

        req.login(createdUser, (err) => {
          if (err) {
            return res.status(500).json({ 
              message: "Erro ao fazer login após registro",
              error: process.env.NODE_ENV === "development" ? err.message : undefined
            });
          }
          const userId = createdUser._id?.toString() || String(createdUser._id);
          
          const token = generateToken(userId);
          
          res.status(201).json({
            id: userId,
            email: createdUser.email,
            name: createdUser.name,
            avatar: createdUser.avatar,
            token: token,
          });
        });
      } catch (dbError: any) {
        return res.status(500).json({ 
          message: "Erro ao conectar com o banco de dados. Verifique se MONGODB_URI está configurado corretamente.",
          error: process.env.NODE_ENV === "development" ? dbError.message : undefined
        });
      }
    } catch (error: any) {
      res.status(500).json({ 
        message: "Erro ao criar usuário",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  });

  app.post("/api/auth/login", async (req, res, next) => {
    try {
      const db = await Promise.race([
        ensureMongoDBConnection(),
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 5000))
      ]);
      
      if (!db) {
        return res.status(503).json({ 
          message: "Serviço temporariamente indisponível. Tente novamente em alguns instantes." 
        });
      }
    } catch (error: any) {
      return res.status(503).json({ 
        message: "Serviço temporariamente indisponível. Tente novamente em alguns instantes."
      });
    }
    next();
  }, (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ 
          message: "Erro interno na autenticação",
          error: process.env.NODE_ENV === "development" ? err.message : undefined
        });
      }
      if (!user) {
        return res.status(401).json({ 
          message: info?.message || "Credenciais inválidas" 
        });
      }
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          return res.status(500).json({ 
            message: "Erro ao criar sessão",
            error: process.env.NODE_ENV === "development" ? loginErr.message : undefined
          });
        }
        
        req.session.save((saveErr) => {
          if (saveErr) {
            return res.status(500).json({ 
              message: "Erro ao salvar sessão",
              error: process.env.NODE_ENV === "development" ? saveErr.message : undefined
            });
          }
          
          const userId = user._id?.toString ? user._id.toString() : String(user._id);
          
          const token = generateToken(userId);
          
          res.json({
            id: userId,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            token: token,
          });
        });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", requireAuthHybrid, (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }

      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          return res.status(500).json({ message: "Erro ao destruir sessão" });
        }
        res.json({ message: "Logout realizado com sucesso" });
      });
    });
  });

  app.get(api.favorites.list.path, requireAuthHybrid, async (req, res) => {
    const user = getCurrentUserHybrid(req) || getCurrentUser(req);
    if (!user?._id) {
      return res.status(401).json({ message: "Não autenticado" });
    }
    const favorites = await storage.getFavorites(user._id);
    res.json(favorites);
  });

  app.post(api.favorites.create.path, requireAuthHybrid, async (req, res) => {
    try {
      const user = getCurrentUserHybrid(req) || getCurrentUser(req);
      if (!user?._id) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      const input = api.favorites.create.input.parse(req.body);
      const favorite = await storage.createFavorite(input, user._id);
      res.status(201).json(favorite);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.favorites.delete.path, requireAuthHybrid, async (req, res) => {
    const user = getCurrentUserHybrid(req) || getCurrentUser(req);
    if (!user?._id) {
      return res.status(401).json({ message: "Não auticado" });
    }
    const { index } = req.params;
    await storage.deleteFavorite(index, user._id);
    res.status(204).send();
  });

  app.get("/api/characters", requireAuthHybrid, async (req, res) => {
    try {
      const user = getCurrentUserHybrid(req) || getCurrentUser(req);
      if (!user?._id) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      const userId = user._id.toString();
      const characters = await characterStorage.getCharacters(userId);
      res.json(characters);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Erro ao buscar personagens",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  });

  app.get("/api/characters/:id", requireAuthHybrid, async (req, res) => {
    try {
      const user = getCurrentUserHybrid(req) || getCurrentUser(req);
      if (!user?._id) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      const { id } = req.params;
      const userId = user._id.toString();
      const character = await characterStorage.getCharacter(id, userId);
      if (!character) {
        return res.status(404).json({ message: "Personagem não encontrado" });
      }
      res.json(character);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Erro ao buscar personagem",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  });

  app.post("/api/characters", requireAuthHybrid, async (req, res) => {
    try {
      const user = getCurrentUserHybrid(req) || getCurrentUser(req);
      if (!user?._id) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      
      const userId = user._id.toString();
      
      const input = createCharacterSchema.parse({ ...req.body, userId });
      
      const character = await characterStorage.createCharacter(input);
      
      res.status(201).json(character);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ 
        message: "Erro ao criar personagem",
        error: process.env.NODE_ENV === "development" ? (err as Error).message : undefined
      });
    }
  });

  app.put("/api/characters/:id", requireAuthHybrid, async (req, res) => {
    try {
      const user = getCurrentUserHybrid(req) || getCurrentUser(req);
      if (!user?._id) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      const { id } = req.params;
      const userId = user._id.toString();
      const updates = req.body;
      const character = await characterStorage.updateCharacter(id, userId, updates);
      res.json(character);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ 
        message: "Erro ao atualizar personagem",
        error: process.env.NODE_ENV === "development" ? (err as Error).message : undefined
      });
    }
  });

  app.delete("/api/characters/:id", requireAuthHybrid, async (req, res) => {
    try {
      const user = getCurrentUserHybrid(req) || getCurrentUser(req);
      if (!user?._id) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      const { id } = req.params;
      const userId = user._id.toString();
      await characterStorage.deleteCharacter(id, userId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ 
        message: "Erro ao deletar personagem",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  });

  app.post("/api/notes", requireAuthHybrid, async (req, res) => {
    try {
      const user = getCurrentUserHybrid(req) || getCurrentUser(req);
      if (!user?._id) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      const userId = user._id.toString();
      const { title, content, characterId } = req.body;
      
      if (!title || !characterId) {
        return res.status(400).json({ message: "Título e characterId são obrigatórios" });
      }

      const note = await noteStorage.createNote({
        userId,
        characterId,
        title,
        content: content || "",
      });
      
      res.status(201).json(note);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Erro ao criar nota",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  });

  app.get("/api/notes/:characterId", requireAuthHybrid, async (req, res) => {
    try {
      const user = getCurrentUserHybrid(req) || getCurrentUser(req);
      if (!user?._id) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      const { characterId } = req.params;
      const userId = user._id.toString();
      const notes = await noteStorage.getNotes(userId, characterId);
      res.json(notes);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Erro ao buscar notas",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  });

  app.get("/api/notes/:id", requireAuthHybrid, async (req, res) => {
    try {
      const user = getCurrentUserHybrid(req) || getCurrentUser(req);
      if (!user?._id) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      const { id } = req.params;
      const userId = user._id.toString();
      const note = await noteStorage.getNote(id, userId);
      if (!note) {
        return res.status(404).json({ message: "Nota não encontrada" });
      }
      res.json(note);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Erro ao buscar nota",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  });

  app.put("/api/notes/:id", requireAuthHybrid, async (req, res) => {
    try {
      const user = getCurrentUserHybrid(req) || getCurrentUser(req);
      if (!user?._id) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      const { id } = req.params;
      const userId = user._id.toString();
      const updates = req.body;
      const note = await noteStorage.updateNote(id, userId, updates);
      res.json(note);
    } catch (error: any) {
      res.status(500).json({ 
        message: "Erro ao atualizar nota",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  });

  app.delete("/api/notes/:id", requireAuthHybrid, async (req, res) => {
    try {
      const user = getCurrentUserHybrid(req) || getCurrentUser(req);
      if (!user?._id) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      const { id } = req.params;
      const userId = user._id.toString();
      await noteStorage.deleteNote(id, userId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ 
        message: "Erro ao deletar nota",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  });

  app.use("/api/*", (req, res) => {
    res.status(404).json({ 
      message: `Rota não encontrada: ${req.method} ${req.originalUrl}`,
      availableRoutes: [
        "GET /api/characters",
        "POST /api/characters",
        "GET /api/characters/:id",
        "PUT /api/characters/:id",
        "DELETE /api/characters/:id",
        "GET /api/notes/:characterId",
        "POST /api/notes",
        "GET /api/notes/:id",
        "PUT /api/notes/:id",
        "DELETE /api/notes/:id"
      ]
    });
  });

  return httpServer;
}

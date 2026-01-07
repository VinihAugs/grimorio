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
import { getDB, ensureMongoDBConnection } from "./mongodb";
import type { User } from "./auth";
import { createCharacterSchema } from "@shared/character-schema";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Debug: Log todas as rotas registradas
  console.log("🔧 Registrando rotas de personagens...");
  console.log("  POST", api.characters.create.path);
  console.log("  GET", api.characters.list.path);
  
  // Auth routes
  app.get("/api/auth/me", (req, res) => {
    const user = getCurrentUser(req);
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

      // Garante que MongoDB está conectado
      const db = await ensureMongoDBConnection();
      if (!db) {
        return res.status(500).json({ 
          message: "Banco de dados não disponível. Verifique se MONGODB_URI está configurado corretamente." 
        });
      }

      try {
        const usersCollection = db.collection<User>("users");

        // Check if user exists
        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
          return res.status(400).json({ message: "Email já cadastrado" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const newUser: User = {
          email,
          name,
          password: hashedPassword,
          createdAt: new Date(),
        };

        const result = await usersCollection.insertOne(newUser as any);
        // Busca o usuário criado para ter o formato correto
        const createdUser = await usersCollection.findOne({ _id: result.insertedId });
        if (!createdUser) {
          return res.status(500).json({ message: "Erro ao criar usuário" });
        }

        // Auto login
        req.login(createdUser, (err) => {
          if (err) {
            console.error("Login error:", err);
            return res.status(500).json({ 
              message: "Erro ao fazer login após registro",
              error: process.env.NODE_ENV === "development" ? err.message : undefined
            });
          }
          res.status(201).json({
            id: createdUser._id?.toString() || createdUser._id,
            email: createdUser.email,
            name: createdUser.name,
            avatar: createdUser.avatar,
          });
        });
      } catch (dbError: any) {
        console.error("Database error:", dbError);
        return res.status(500).json({ 
          message: "Erro ao conectar com o banco de dados. Verifique se MONGODB_URI está configurado corretamente.",
          error: process.env.NODE_ENV === "development" ? dbError.message : undefined
        });
      }
    } catch (error: any) {
      console.error("Register error:", error);
      res.status(500).json({ 
        message: "Erro ao criar usuário",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  });

  app.post("/api/auth/login", async (req, res, next) => {
    // Garante que MongoDB está conectado antes de autenticar
    try {
      const db = await ensureMongoDBConnection();
      if (!db) {
        return res.status(500).json({ 
          message: "Banco de dados não disponível. Verifique se MONGODB_URI está configurado corretamente." 
        });
      }
    } catch (error: any) {
      console.error("Erro ao conectar MongoDB no login:", error);
      return res.status(500).json({ 
        message: "Erro ao conectar com o banco de dados",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
    // Continua com a autenticação
    next();
  }, (req, res, next) => {
    // Middleware para capturar erros do Passport
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        console.error("Erro na autenticação:", err);
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
      // Login bem-sucedido
      console.log("✅ Usuário autenticado, criando sessão...");
      console.log("User object:", JSON.stringify(user, null, 2));
      
      req.login(user, (loginErr) => {
        if (loginErr) {
          console.error("❌ Erro ao fazer login:", loginErr);
          console.error("Erro stack:", loginErr.stack);
          return res.status(500).json({ 
            message: "Erro ao criar sessão",
            error: process.env.NODE_ENV === "development" ? loginErr.message : undefined
          });
        }
        console.log("✅ Sessão criada com sucesso!");
        const userId = user._id?.toString ? user._id.toString() : String(user._id);
        res.json({
          id: userId,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
        });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Erro ao fazer logout" });
      }
      res.json({ message: "Logout realizado com sucesso" });
    });
  });

  // Protected routes - require authentication
  app.get(api.favorites.list.path, requireAuth, async (req, res) => {
    const user = getCurrentUser(req);
    if (!user?._id) {
      return res.status(401).json({ message: "Não autenticado" });
    }
    const favorites = await storage.getFavorites(user._id);
    res.json(favorites);
  });

  app.post(api.favorites.create.path, requireAuth, async (req, res) => {
    try {
      const user = getCurrentUser(req);
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

  app.delete(api.favorites.delete.path, requireAuth, async (req, res) => {
    const user = getCurrentUser(req);
    if (!user?._id) {
      return res.status(401).json({ message: "Não auticado" });
    }
    const { index } = req.params;
    await storage.deleteFavorite(index, user._id);
    res.status(204).send();
  });

  // Character routes
  console.log("🔧 Registrando rotas de personagens:");
  console.log("  GET", api.characters.list.path);
  console.log("  POST", api.characters.create.path);
  console.log("  GET", api.characters.get.path);
  console.log("  PUT", api.characters.update.path);
  console.log("  DELETE", api.characters.delete.path);
  
  // Register character routes explicitly to ensure they're registered
  app.get("/api/characters", requireAuth, async (req, res) => {
    try {
      const user = getCurrentUser(req);
      if (!user?._id) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      const userId = user._id.toString();
      const characters = await characterStorage.getCharacters(userId);
      res.json(characters);
    } catch (error: any) {
      console.error("Erro ao buscar personagens:", error);
      res.status(500).json({ 
        message: "Erro ao buscar personagens",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  });

  app.get("/api/characters/:id", requireAuth, async (req, res) => {
    try {
      const user = getCurrentUser(req);
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
      console.error("Erro ao buscar personagem:", error);
      res.status(500).json({ 
        message: "Erro ao buscar personagem",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  });

  app.post("/api/characters", requireAuth, async (req, res) => {
    try {
      console.log("📝 POST /api/characters - Handler executado!");
      console.log("Body recebido:", JSON.stringify(req.body).substring(0, 200));
      
      const user = getCurrentUser(req);
      if (!user?._id) {
        console.log("❌ Usuário não autenticado");
        return res.status(401).json({ message: "Não autenticado" });
      }
      
      const userId = user._id.toString();
      console.log("👤 User ID:", userId);
      
      const input = createCharacterSchema.parse({ ...req.body, userId });
      console.log("✅ Input validado:", input);
      
      const character = await characterStorage.createCharacter(input);
      console.log("✅ Personagem criado:", character);
      
      res.status(201).json(character);
    } catch (err) {
      if (err instanceof z.ZodError) {
        console.error("❌ Erro de validação:", err.errors);
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      console.error("❌ Erro ao criar personagem:", err);
      res.status(500).json({ 
        message: "Erro ao criar personagem",
        error: process.env.NODE_ENV === "development" ? (err as Error).message : undefined
      });
    }
  });

  app.put("/api/characters/:id", requireAuth, async (req, res) => {
    try {
      const user = getCurrentUser(req);
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
      console.error("Erro ao atualizar personagem:", err);
      res.status(500).json({ 
        message: "Erro ao atualizar personagem",
        error: process.env.NODE_ENV === "development" ? (err as Error).message : undefined
      });
    }
  });

  app.delete("/api/characters/:id", requireAuth, async (req, res) => {
    try {
      const user = getCurrentUser(req);
      if (!user?._id) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      const { id } = req.params;
      const userId = user._id.toString();
      await characterStorage.deleteCharacter(id, userId);
      res.status(204).send();
    } catch (error: any) {
      console.error("Erro ao deletar personagem:", error);
      res.status(500).json({ 
        message: "Erro ao deletar personagem",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  });

  // Note routes - IMPORTANT: POST must come before GET with params
  app.post("/api/notes", requireAuth, async (req, res) => {
    try {
      const user = getCurrentUser(req);
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
      console.error("Erro ao criar nota:", error);
      res.status(500).json({ 
        message: "Erro ao criar nota",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  });

  app.get("/api/notes/:characterId", requireAuth, async (req, res) => {
    try {
      const user = getCurrentUser(req);
      if (!user?._id) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      const { characterId } = req.params;
      const userId = user._id.toString();
      const notes = await noteStorage.getNotes(userId, characterId);
      res.json(notes);
    } catch (error: any) {
      console.error("Erro ao buscar notas:", error);
      res.status(500).json({ 
        message: "Erro ao buscar notas",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  });

  app.get("/api/notes/:id", requireAuth, async (req, res) => {
    try {
      const user = getCurrentUser(req);
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
      console.error("Erro ao buscar nota:", error);
      res.status(500).json({ 
        message: "Erro ao buscar nota",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  });

  app.put("/api/notes/:id", requireAuth, async (req, res) => {
    try {
      const user = getCurrentUser(req);
      if (!user?._id) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      const { id } = req.params;
      const userId = user._id.toString();
      const updates = req.body;
      const note = await noteStorage.updateNote(id, userId, updates);
      res.json(note);
    } catch (error: any) {
      console.error("Erro ao atualizar nota:", error);
      res.status(500).json({ 
        message: "Erro ao atualizar nota",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  });

  app.delete("/api/notes/:id", requireAuth, async (req, res) => {
    try {
      const user = getCurrentUser(req);
      if (!user?._id) {
        return res.status(401).json({ message: "Não autenticado" });
      }
      const { id } = req.params;
      const userId = user._id.toString();
      await noteStorage.deleteNote(id, userId);
      res.status(204).send();
    } catch (error: any) {
      console.error("Erro ao deletar nota:", error);
      res.status(500).json({ 
        message: "Erro ao deletar nota",
        error: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  });

  // 404 handler para rotas de API não encontradas
  app.use("/api/*", (req, res) => {
    console.error(`❌ Rota API não encontrada: ${req.method} ${req.originalUrl}`);
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

import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.favorites.list.path, async (req, res) => {
    const favorites = await storage.getFavorites();
    res.json(favorites);
  });

  app.post(api.favorites.create.path, async (req, res) => {
    try {
      const input = api.favorites.create.input.parse(req.body);
      const favorite = await storage.createFavorite(input);
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

  app.delete(api.favorites.delete.path, async (req, res) => {
    const { index } = req.params;
    await storage.deleteFavorite(index);
    res.status(204).send();
  });

  // Seed data
  const favorites = await storage.getFavorites();
  if (favorites.length === 0) {
    await storage.createFavorite({
      spellIndex: "animate-dead",
      spellName: "Animate Dead",
      level: "3",
    });
    await storage.createFavorite({
      spellIndex: "blight",
      spellName: "Blight",
      level: "4",
    });
  }

  return httpServer;
}

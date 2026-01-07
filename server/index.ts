// Carrega variáveis de ambiente do arquivo .env
import "dotenv/config";

// Debug: verifica se as variáveis foram carregadas
if (process.env.MONGODB_URI) {
  console.log("✅ MONGODB_URI carregado do .env");
} else {
  console.warn("⚠️  MONGODB_URI não encontrado nas variáveis de ambiente");
}

import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { connectMongoDB } from "./mongodb";
import "./auth";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "necro-tome-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Connect to MongoDB (não bloqueia se não estiver configurado)
  try {
    const db = await connectMongoDB();
    if (db) {
      // Inicializa o banco (cria coleções e índices)
      try {
        const { initializeDatabase } = await import("./init-db");
        await initializeDatabase();
      } catch (initError) {
        console.warn("⚠️  Erro ao inicializar banco:", initError);
      }
    }
  } catch (error) {
    console.error("⚠️  Erro ao conectar MongoDB:", error);
    console.log("⚠️  Continuando com armazenamento em memória...");
  }
  
  await registerRoutes(httpServer, app);

  // Debug: Lista todas as rotas registradas
  console.log("📋 Rotas registradas:");
  app._router?.stack?.forEach((middleware: any) => {
    if (middleware.route) {
      console.log(`  ${Object.keys(middleware.route.methods).join(', ').toUpperCase()} ${middleware.route.path}`);
    }
  });

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("❌ Erro não tratado:", err);
    console.error("Stack:", err.stack);

    res.status(status).json({ 
      message,
      error: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
    // Não lança o erro novamente para não quebrar o servidor
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
      port,
    "0.0.0.0",
    () => {
      log(`serving on port ${port}`);
    },
  );
})();

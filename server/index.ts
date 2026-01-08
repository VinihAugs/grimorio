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
import MongoStore from "connect-mongo";
import passport from "passport";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { connectMongoDB, getClient } from "./mongodb";
import "./auth";

const app = express();
const httpServer = createServer(app);

// CORS configuration - permite cookies cross-origin
// IMPORTANTE: Para o mesmo domínio, não precisa de CORS, mas vamos manter para garantir
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const host = req.headers.host;
  
  // Em produção, permite requisições do mesmo domínio
  // Em desenvolvimento, permite qualquer origem
  if (process.env.NODE_ENV === "production") {
    // Em produção, permite requisições do mesmo domínio (grimorio.onrender.com)
    if (origin && (origin.includes("grimorio.onrender.com") || origin === `https://${host}`)) {
      res.setHeader("Access-Control-Allow-Origin", origin);
    } else if (origin) {
      // Permite também requisições do mesmo domínio sem protocolo
      res.setHeader("Access-Control-Allow-Origin", origin);
    }
  } else {
    // Em desenvolvimento, permite qualquer origem
    res.setHeader("Access-Control-Allow-Origin", origin || "*");
  }
  
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.setHeader("Access-Control-Expose-Headers", "Set-Cookie");
  
  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  
  next();
});

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

// Session configuration - usa MongoDB store se MONGODB_URI estiver configurado
let sessionStore: MongoStore | null = null;

if (process.env.MONGODB_URI) {
  try {
    // Cria MongoDB Session Store usando a connection string diretamente
    sessionStore = MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      dbName: "necro_tome",
      collectionName: "sessions",
      ttl: 7 * 24 * 60 * 60, // 7 days em segundos
    });
    console.log("✅ MongoDB Session Store configurado com connection string");
  } catch (error) {
    console.warn("⚠️  Erro ao configurar MongoDB Session Store:", error);
    console.log("⚠️  Usando armazenamento em memória...");
  }
}

// Session configuration - usa MongoDB store se disponível, senão memória
const sessionConfig: session.SessionOptions = {
  secret: process.env.SESSION_SECRET || "necro-tome-secret-key-change-in-production",
  resave: false,
  saveUninitialized: false,
  name: "connect.sid", // Nome padrão do cookie de sessão
  store: sessionStore || undefined, // Usa MongoDB store se disponível
  cookie: {
    secure: process.env.NODE_ENV === "production", // HTTPS em produção
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    sameSite: process.env.NODE_ENV === "production" ? "lax" : "lax",
    // sameSite: "none" só é necessário para cross-domain com secure: true
  },
};

// Log da configuração de sessão
console.log("🍪 Session config:", {
  secure: sessionConfig.cookie?.secure,
  sameSite: sessionConfig.cookie?.sameSite,
  httpOnly: sessionConfig.cookie?.httpOnly,
  name: sessionConfig.name,
  store: sessionStore ? "MongoDB" : "Memory"
});

// Configura sessão ANTES das rotas e outros middlewares
app.use(session(sessionConfig));

// Initialize Passport (após sessão estar configurada)
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

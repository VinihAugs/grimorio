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
  const referer = req.headers.referer;
  
  // Determina a origem correta
  let allowedOrigin = origin;
  
  // Se não tem origin mas tem referer, usa o referer
  if (!origin && referer) {
    try {
      const refererUrl = new URL(referer);
      allowedOrigin = refererUrl.origin;
    } catch (e) {
      // Ignora erro
    }
  }
  
  // Em produção, permite requisições do mesmo domínio
  if (process.env.NODE_ENV === "production") {
    // Se a requisição é do mesmo domínio (sem origin), não precisa de CORS
    // Mas vamos permitir mesmo assim para garantir
    if (allowedOrigin && allowedOrigin.includes("grimorio.onrender.com")) {
      res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    } else if (host && host.includes("grimorio.onrender.com")) {
      // Se não tem origin mas o host é o mesmo, permite
      res.setHeader("Access-Control-Allow-Origin", `https://${host}`);
    } else if (allowedOrigin) {
      // Permite a origem se fornecida
      res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    }
  } else {
    // Em desenvolvimento, permite qualquer origem
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin || "*");
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
  resave: false, // Volta para false - o store gerencia isso
  saveUninitialized: false, // Volta para false - só salva quando necessário
  name: "connect.sid", // Nome padrão do cookie de sessão
  store: sessionStore || undefined, // Usa MongoDB store se disponível
  cookie: {
    secure: process.env.NODE_ENV === "production", // HTTPS em produção (obrigatório para sameSite: "none")
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    // sameSite: "none" é necessário para cookies funcionarem corretamente em produção com HTTPS
    // Requer secure: true
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    // Não define domain para permitir que funcione em subdomínios
    path: "/", // Garante que o cookie seja enviado para todas as rotas
  },
  // Força o envio do cookie mesmo em requisições que não modificam a sessão
  rolling: false, // Desabilita rolling para evitar problemas
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

// Middleware para garantir que a sessão seja carregada do MongoDB
app.use((req, res, next) => {
  // Se há um sessionID mas não há sessão carregada, força o carregamento
  if (req.sessionID && !req.session) {
    console.log("⚠️  Session ID existe mas sessão não carregada, forçando carregamento...");
  }
  // Se há sessão mas não está autenticado, tenta deserializar
  if (req.session && req.session.passport && !req.user) {
    console.log("🔧 Sessão tem passport mas req.user não existe, forçando deserialização...");
    // O passport.session() deve fazer isso, mas vamos garantir
  }
  next();
});

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

// Middleware de logging global - captura TODAS as requisições
app.use((req, res, next) => {
  const cookieHeader = req.headers.cookie;
  const hasSessionCookie = cookieHeader?.includes('connect.sid');
  console.log(`📥 ${req.method} ${req.path} - Origin: ${req.headers.origin || 'none'} - Cookie: ${cookieHeader ? (hasSessionCookie ? 'connect.sid present' : 'present but no connect.sid') : 'missing'}`);
  next();
});

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

import "dotenv/config";

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

app.use((req, res, next) => {
  const origin = req.headers.origin;
  const host = req.headers.host;
  const referer = req.headers.referer;
  
  let allowedOrigin = origin;
  
  if (!origin && referer) {
    try {
      const refererUrl = new URL(referer);
      allowedOrigin = refererUrl.origin;
    } catch (e) {
    }
  }
  
  if (process.env.NODE_ENV === "production") {
    if (allowedOrigin && allowedOrigin.includes("grimorio.onrender.com")) {
      res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    } else if (host && host.includes("grimorio.onrender.com")) {
      res.setHeader("Access-Control-Allow-Origin", `https://${host}`);
    } else if (allowedOrigin) {
      res.setHeader("Access-Control-Allow-Origin", allowedOrigin);
    }
  } else {
    res.setHeader("Access-Control-Allow-Origin", allowedOrigin || "*");
  }
  
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With");
  res.setHeader("Access-Control-Expose-Headers", "Set-Cookie");
  
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

let sessionStore: MongoStore | null = null;

const sessionConfig: session.SessionOptions = {
  secret: process.env.SESSION_SECRET || "necro-tome-secret-key-change-in-production",
  resave: false,
  saveUninitialized: false,
  name: "connect.sid",
  store: undefined,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
  },
  rolling: false,
};

const sessionMiddleware = session(sessionConfig);
app.use(sessionMiddleware);

app.use((req, res, next) => {
  next();
});

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
  try {
    const db = await connectMongoDB();
    if (db) {
      try {
        const mongoClient = getClient();
        if (mongoClient) {
          sessionStore = MongoStore.create({
            client: mongoClient,
            dbName: "necro_tome",
            collectionName: "sessions",
            ttl: 7 * 24 * 60 * 60,
          });
          
          if ((sessionMiddleware as any).store) {
            (sessionMiddleware as any).store = sessionStore;
          }
        }
      } catch (storeError) {
      }
      
      try {
        const { initializeDatabase } = await import("./init-db");
        await initializeDatabase();
      } catch (initError) {
      }
    }
  } catch (error) {
  }
  
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ 
      message,
      error: process.env.NODE_ENV === "development" ? err.stack : undefined
    });
  });

  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
      port,
    "0.0.0.0",
    () => {
      log(`serving on port ${port}`);
    },
  );
})();

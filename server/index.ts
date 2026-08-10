import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import { registerRoutes } from "./routes.js";
import { setupVite, serveStatic, log } from "./vite";
import * as http from "http";

// ─── STABILITY: Cegah PM2 crash dari library pihak ketiga (Baileys WA) ─────
process.on('unhandledRejection', (reason: any) => {
  console.error('[PROCESS] UnhandledRejection (tidak crash):', reason?.message || reason);
});
process.on('uncaughtException', (err: Error) => {
  console.error('[PROCESS] UncaughtException (tidak crash):', err.message);
});


const app = express();

// SECURITY: Trust proxy (Nginx/Cloudflare) agar rate limiting pakai IP asli user
// Tanpa ini, semua request terdeteksi dari IP Nginx yang sama → rate limit bypass!
app.set('trust proxy', 1);

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

// ─── SECURITY: Helmet (HTTP Security Headers) ─────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // Dinonaktifkan agar React & Vite tidak bentrok
  crossOriginEmbedderPolicy: false,
}));

// ─── SECURITY: CORS Policy ────────────────────────────────────────────────
const allowedOrigins = (process.env.ALLOWED_ORIGIN || "").split(",").map(o => o.trim()).filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    // Izinkan request tanpa origin (curl, mobile app native, Casaku webhook)
    if (!origin) return callback(null, true);
    // Di development, izinkan semua
    if (process.env.NODE_ENV !== 'production') return callback(null, true);
    // Di production, hanya izinkan domain yang terdaftar
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('CORS: Origin tidak diizinkan'));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'x-casaku-signature'],
  credentials: false,
}));

// ─── SECURITY: Rate Limiting Global ───────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Terlalu banyak permintaan, coba lagi nanti." },
  skip: (req) => {
    // Webhook dari Casaku tidak di-rate-limit
    const path = req.path;
    return path === '/api/payment/webhook' || path === '/api/payment/casaku-webhook';
  }
});
app.use('/api/', globalLimiter);

// Rate limit ketat untuk endpoint pembuatan QRIS
const paymentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 menit
  max: 15,
  message: { success: false, message: "Terlalu banyak permintaan pembayaran, tunggu sebentar." },
});
app.use('/api/payment/charge', paymentLimiter);

// ─── Body Parser dengan size limit ────────────────────────────────────────
app.use(express.json({
  limit: '1mb', // Cegah request body raksasa (DoS)
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));

app.use(express.urlencoded({ extended: false, limit: '1mb' }));

// Express Logger Middleware (Filter out repetitive polling & stream logs)
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
    if (path.startsWith("/api") && !path.includes("check-status") && !path.includes("stream")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server: http.Server = await registerRoutes(app); 

  if (app.get("env") === "development") {
    await setupVite(app, server); 
  } else {
    serveStatic(app);
  }

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error(`Error ${status} di ${status}ms:`, err); 
    res.status(status).json({ message });
  });

  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(port, '0.0.0.0', () => {
    log(`serving on port ${port}`);
  });
})();

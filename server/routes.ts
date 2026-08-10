import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { initializeWhatsApp, sendWhatsAppMessage } from "./whatsapp.js";
import { verifyCasakuSignature } from "./casaku.js";

export async function registerRoutes(app: Express): Promise<Server> {
  // put application routes here
  // prefix all routes with /api

  // Initialize WhatsApp Bot
  initializeWhatsApp();

  // 1. Endpoint untuk membuat QRIS Dinamis via Casaku
  app.post("/api/payment/charge", async (req: Request, res: Response) => {
    try {
      const { nominal, nama } = req.body;

      // SECURITY: Validasi nominal — minimal Rp 1.000, maksimal Rp 10.000.000
      const amount = Number(nominal);
      if (!nominal || isNaN(amount) || amount < 1000 || amount > 10_000_000) {
        return res.status(400).json({ success: false, message: "Nominal harus antara Rp 1.000 hingga Rp 10.000.000" });
      }

      // SECURITY: Sanitasi nama — cegah WhatsApp message injection & karakter berbahaya
      // Ancaman: user bisa kirim nama seperti "*bold*", "_italic_", atau newline \n untuk
      // memanipulasi format pesan WA yang dikirim ke admin, atau via direct curl/Postman request.
      const rawName = String(nama || "").trim();
      const finalName = rawName
        .replace(/[<>&"'`]/g, "")          // Hapus karakter HTML/injection
        .replace(/[*_~`]/g, "")            // Hapus WhatsApp formatting chars
        .replace(/[\r\n\t]/g, " ")         // Hapus newline & tab (WA message split)
        .substring(0, 50)                  // Batasi panjang nama
        .trim() || "Hamba Allah";

      // Buat Order ID unik
      const orderId = `TAHU-${Date.now()}`;
      
      const { createQrisTransaction } = await import("./casaku.js");
      const transaction = await createQrisTransaction(orderId, amount, finalName);

      return res.json({ success: true, data: transaction });
    } catch (error: any) {
      console.error("Casaku Charge Error:", error);
      return res.status(500).json({ success: false, message: error.message || "Gagal membuat QRIS" });
    }
  });

  // In-memory store for recent paid transactions (super fast fallback)
  const recentPayments: { orderId: string; nominal: number; timestamp: number }[] = [];

  // SSE (Server-Sent Events) clients
  const clients: Response[] = [];

  // SSE Endpoint for Live Popup
  app.get("/api/payment/stream", (req: Request, res: Response) => {
    // SECURITY: Batasi jumlah koneksi SSE agar tidak bisa di-DoS
    if (clients.length >= 100) {
      return res.status(503).json({ message: "Kapasitas server penuh, coba lagi nanti." });
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    clients.push(res);
    req.on('close', () => {
      clients.splice(clients.indexOf(res), 1);
    });
  });

  // Endpoint Cek Status Pembayaran (Fast Polling Backup)
  app.get("/api/payment/check-status", (req: Request, res: Response) => {
    const { orderId, casakuId } = req.query;
    // SECURITY: Pengecekan HANYA berdasarkan orderId/casakuId yang unik.
    // Pengecekan berdasarkan 'amount' dihapus karena berisiko: transaksi orang lain
    // dengan nominal sama bisa ter-match sebagai lunas (payment bypass vulnerability).
    const match = recentPayments.find(p => 
      (orderId && p.orderId === String(orderId)) || 
      (casakuId && p.orderId === String(casakuId))
    );
    if (match) {
      return res.json({ paid: true, data: match });
    }
    return res.json({ paid: false });
  });

  // 2. Endpoint Webhook dari Casaku (Handler utama)
  const handleWebhook = async (req: Request, res: Response) => {
    try {
      console.log("--> Webhook Received from Casaku:", req.body);
      const signature = req.headers['x-casaku-signature'] as string;
      const secret = process.env.WEBHOOK_SECRET || "";

      // SECURITY: Wajibkan verifikasi signature di production
      if (process.env.NODE_ENV === 'production') {
        if (!signature || !secret) {
          console.warn("[SECURITY] Webhook ditolak: tidak ada signature atau secret.");
          return res.status(403).json({ success: false, message: "Forbidden" });
        }
        const isValid = verifyCasakuSignature(req.rawBody as Buffer, signature);
        if (!isValid) {
          console.warn("[SECURITY] Webhook ditolak: signature tidak valid.");
          return res.status(403).json({ success: false, message: "Forbidden" });
        }
      }

      let event: any = req.body;

      // Di development: coba verifikasi signature jika ada
      if (process.env.NODE_ENV !== 'production' && signature && secret) {
        try {
          const { parseWebhook } = await import("casaku");
          const parsed = parseWebhook(req.rawBody as Buffer || JSON.stringify(req.body), signature, secret);
          if (parsed) event = parsed;
        } catch (e) {
          console.warn("Webhook Signature verification warning:", (e as any).message);
        }
      }

      // Jika statusnya paid (LUNAS) atau test
      const status = (event.status || "").toLowerCase();
      if (status === 'paid' || status === 'success' || (status === 'test' && process.env.NODE_ENV !== 'production')) {
        // Prioritaskan custom_field1 (nama pembeli asli yang kita set saat buat QRIS)
        // event.appName bisa berisi "Manual Mark Paid" saat admin confirm manual dari dashboard Casaku
        const buyerName = event.custom_field1 || event.customerName || event.buyerName || 
                          (event.appName && event.appName !== "Manual Mark Paid" ? event.appName : null) || 
                          "Hamba Allah";

        // Simpan ke in-memory store
        recentPayments.push({
          orderId: String(event.transactionId || ''),
          nominal: Number(event.amount || 0),
          timestamp: Date.now()
        });
        if (recentPayments.length > 50) recentPayments.shift();

        // Broadcast ke semua client SSE (Layar Live) & Frontend
        const ssePayload = JSON.stringify({
            orderId: event.transactionId,
            nominal: event.amount,
            name: buyerName,
            timestamp: Date.now()
        });

        console.log("Broadcasting Payment Success via SSE:", ssePayload);
        clients.forEach(c => c.write(`data: ${ssePayload}\n\n`));

        const targetEnv = process.env.WHATSAPP_TARGET_NUMBER || "6285864917815";
        const numbers = targetEnv.split(",").map(n => n.trim()).filter(Boolean);

        const formattedNominal = Number(event.amount || 0).toLocaleString('id-ID');
        const message = `Pembayaran diterima Rp ${formattedNominal} dari ${buyerName} melalui QRIS`;

        for (const num of numbers) {
          let cleanNumber = num.replace(/\D/g, '');
          if (cleanNumber.startsWith('0')) cleanNumber = '62' + cleanNumber.substring(1);
          console.log(`Sending WhatsApp notification to: ${cleanNumber}`);
          await sendWhatsAppMessage(cleanNumber, message).catch(console.error);
        }
      }

      return res.json({ success: true });
    } catch (error: any) {
      console.error("Webhook Error:", error);
      // SECURITY: Jangan bocorkan detail error ke client
      return res.status(500).json({ success: false, message: "Server error" });
    }
  };

  app.post("/api/payment/webhook", handleWebhook);
  app.post("/api/payment/casaku-webhook", handleWebhook);

  // 3. Endpoint MOCK untuk mensimulasikan lunas dari Frontend (HANYA DEVELOPMENT)
  app.post("/api/payment/simulate-webhook", async (req: Request, res: Response) => {
    // SECURITY: Endpoint ini DINONAKTIFKAN di production untuk mencegah penipuan
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).end();
    }

    try {
      const { order_id, gross_amount, nama } = req.body;
      const adminNumber = process.env.WHATSAPP_TARGET_NUMBER;
      const buyerName = nama || "Hamba Allah";
      
      // Broadcast ke SSE
      const ssePayload = JSON.stringify({
          orderId: order_id,
          nominal: gross_amount,
          name: buyerName,
          timestamp: Date.now()
      });
      clients.forEach(c => c.write(`data: ${ssePayload}\n\n`));

      if (adminNumber) {
        const formattedNominal = Number(gross_amount || 0).toLocaleString('id-ID');
        const message = `[TEST] Pembayaran diterima Rp ${formattedNominal} dari ${buyerName} melalui QRIS`;
        let cleanNumber = adminNumber.replace(/\D/g, '');
        if (cleanNumber.startsWith('0')) cleanNumber = '62' + cleanNumber.substring(1);
        await sendWhatsAppMessage(cleanNumber, message).catch(console.error);
      }
      return res.json({ success: true });
    } catch (error) {
       return res.status(500).json({ success: false });
    }
  });


  const httpServer = createServer(app);

  return httpServer;
}

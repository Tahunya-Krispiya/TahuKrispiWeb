# 🔥 Tahunya Krispi-ya — Web Platform

---

<div align="center">

<img src="https://tahunyakrispiya.my.id/favicon.png" alt="Tahunya Krispi-ya" width="80" />

**Platform web e-commerce + branding untuk UMKM kuliner tahu crispy khas Bekasi Selatan.**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-tahunyakrispiya.my.id-orange?style=for-the-badge)](https://tahunyakrispiya.my.id)
[![Payment Portal](https://img.shields.io/badge/💳_QRIS_Portal-/payment-teal?style=for-the-badge)](https://tahunyakrispiya.my.id/payment)
[![Bio Link](https://img.shields.io/badge/🔗_Bio_Link-/link-purple?style=for-the-badge)](https://tahunyakrispiya.my.id/link)

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?logo=typescript)](https://typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-4-000000?logo=express)](https://expressjs.com)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-FFCA28?logo=firebase)](https://firebase.google.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss)](https://tailwindcss.com)

</div>

---

## ✨ Fitur Utama

| Fitur | Keterangan |
|-------|------------|
| 🛒 **Katalog & Keranjang** | Pilih produk, tambah ke keranjang, checkout otomatis via WhatsApp |
| 💳 **QRIS Dinamis** | Generate QR unik per transaksi via **Casaku API** — bayar pakai GoPay/Dana/OVO/ShopeePay |
| 🔔 **Notifikasi Live** | Popup konfetti real-time saat ada pembayaran masuk (gaya Saweria) |
| 🤖 **WhatsApp Bot** | Notifikasi otomatis ke admin via WhatsApp (Baileys/WA Web API) |
| 🎛️ **Admin Dashboard** | Kontrol Flash Sale, TikTok Live, status GoFood/GrabFood/ShopeeFood |
| 🔗 **Bio Link Page** | Halaman `/link` bergaya Linktree dengan voting maskot & feedback form |
| 🔥 **Flash Sale** | Banner countdown promo real-time dikontrol admin |
| 📊 **Firebase Realtime** | Status toko sync ke semua pengunjung secara real-time |

---

## 📸 Screenshot

<div align="center">

| Homepage | Portal Bayar QRIS | Bio Link Page |
|----------|-------------------|---------------|
| Menu, keranjang, flash sale | Generate QRIS per transaksi | Linktree-style + voting |

</div>

---

## 🗺️ Routes

| URL | Halaman | Akses |
|-----|---------|-------|
| `/` | Homepage — menu & keranjang | Publik |
| `/payment` | Portal pembayaran QRIS dinamis | Publik |
| `/link` | Bio link page + voting + feedback | Publik |
| `/login` | Login admin | Publik |
| `/admin` | Dashboard admin | 🔒 Firebase Auth |

---

## 💳 Mekanisme Pembayaran QRIS (Casaku)

> Platform ini menggunakan **[Casaku](https://casaku.id)** sebagai payment gateway QRIS Indonesia.

```
User isi nominal → POST /api/payment/charge
  → Casaku generateQRISv2() → dapat qr_string
  → Convert ke gambar QR → tampil di browser
  → User scan pakai e-wallet
  → Casaku kirim Webhook ke server
  → Server verifikasi HMAC signature
  → Broadcast SSE → Popup notifikasi live
  → WhatsApp Bot kirim notif ke admin
```

---

## 🏗️ Arsitektur

```
Client (React + Vite)
  ├── / Homepage
  ├── /payment QRIS Portal ─────────────────────────┐
  ├── /link Bio Link Page                            │
  └── /admin Dashboard                               │
                                                     │ HTTP/SSE
Server (Express + Node.js)                           │
  ├── POST /api/payment/charge ──── Casaku API ◄─────┘
  ├── POST /api/payment/webhook ─── Handler webhook
  ├── GET  /api/payment/stream ──── SSE broadcast
  └── GET  /api/payment/check-status
            │                │              │
       Casaku API       Firebase         WhatsApp Bot
       (QRIS Gen)    (Realtime DB)       (Baileys)
```

---

## ⚙️ Setup & Instalasi

### 1. Clone & Install

```bash
git clone https://github.com/Ramadani1t/TahuKrispiWeb.git
cd TahuKrispiWeb
npm install
```

### 2. Konfigurasi Environment

```bash
cp .env.example .env
# Edit .env dengan nilai asli kamu
```

Isi variabel berikut di `.env`:

```env
# Firebase
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=

# Casaku Payment Gateway
CASAKU_LICENSE_KEY=     # Dari dashboard casaku.id
CASAKU_QR_ID=           # UUID merchant QR
WEBHOOK_SECRET=         # Secret untuk verifikasi webhook

# WhatsApp Bot
WHATSAPP_PHONE_NUMBER=  # Nomor WA bot (format: 628xxx)
WHATSAPP_TARGET_NUMBER= # Nomor WA admin yang menerima notif

# Server
NODE_ENV=production
ALLOWED_ORIGIN=https://domainmu.com
```

### 3. Jalankan (Development)

```bash
npm run dev
# → Buka http://localhost:5000
```

### 4. WhatsApp Bot

Saat pertama kali, QR code akan muncul di terminal. Scan dengan WhatsApp HP kamu. Session tersimpan di `baileys_auth_info/`.

---

## 🚀 Deploy ke VPS

### Build

```bash
npm run build
# Output: dist/index.js + dist/public/
```

### Jalankan dengan PM2

```bash
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

### Nginx Config (Reverse Proxy)

```nginx
server {
    server_name tahunyakrispiya.my.id;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;

        # Penting untuk SSE (Server-Sent Events)
        proxy_buffering off;
        proxy_read_timeout 86400;
    }
}
```

---

## 📦 Tech Stack

| Layer | Teknologi |
|-------|-----------|
| **Frontend** | React 18 + Vite 7 + TypeScript |
| **Styling** | Tailwind CSS v3 + shadcn/ui + Radix UI |
| **State** | TanStack Query v5 |
| **Routing** | React Router v7 |
| **Backend** | Express v4 + Node.js |
| **Payment** | Casaku v0.2.1 (QRIS Gateway) |
| **Realtime** | Server-Sent Events (SSE) + Firebase RTDB |
| **Database** | Firebase Firestore |
| **Auth** | Firebase Authentication |
| **WhatsApp** | @whiskeysockets/baileys v6.7 |
| **Process** | PM2 |
| **Security** | Helmet + CORS + express-rate-limit |

---

## 🔒 Keamanan

- ✅ Webhook HMAC-SHA256 signature verification (Casaku)
- ✅ Rate limiting: 200 req/15mnt global, 15 req/mnt untuk QRIS endpoint
- ✅ CORS whitelist via `ALLOWED_ORIGIN` env
- ✅ Sanitasi input nama (cegah WhatsApp injection)
- ✅ Validasi nominal: min Rp1.000, maks Rp10.000.000
- ✅ HTTP security headers (Helmet)
- ✅ Body size limit 1MB (cegah DoS)
- ✅ Simulate webhook endpoint dinonaktifkan di production

---

## 📁 Struktur Proyek

```
TahuKrispiWeb/
├── client/
│   ├── public/
│   │   └── images/        # Gambar statis + QRIS statis
│   └── src/
│       ├── components/    # UI components
│       ├── pages/         # Halaman (Home, Payment, LinkPage, Admin)
│       └── lib/           # Firebase config + helpers
├── server/
│   ├── index.ts           # Express server + security middleware
│   ├── routes.ts          # API routes + SSE + webhook
│   ├── casaku.ts          # Casaku QRIS integration
│   └── whatsapp.ts        # WhatsApp bot (Baileys)
├── shared/
│   └── schema.ts          # TypeScript types
├── .env.example           # Template environment variables
├── ecosystem.config.cjs   # PM2 config
└── package.json
```

---

## 📍 Info Toko

**Tahunya Krispi-ya!** 🔥  
Tahu crispy dengan sambel kalasan khas

📍 Jl. Pulo Ribung No.12, Pekayon Jaya, Bekasi Selatan  
🕐 Selasa – Minggu, 09.00 – 21.00 WIB  
📱 TikTok: [@ajengandhika_](https://www.tiktok.com/@ajengandhika_)  
💬 WhatsApp: [Chat Sekarang](https://wa.me/6281288362512)

---

<div align="center">

**Made with ❤️ by Ramadani | © 2026 Tahunya Krispi-ya**

</div>

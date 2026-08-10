import Baileys, { useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } from '@whiskeysockets/baileys';
const makeWASocket = (Baileys as any).default || Baileys;
import pino from 'pino';
import qrcode from 'qrcode-terminal';

let sock: any = null;
let isReady = false;
let reconnectTimer: NodeJS.Timeout | null = null;

export async function initializeWhatsApp() {
    try {
        const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info');
        const { version } = await fetchLatestBaileysVersion();

        sock = makeWASocket({
            version,
            logger: pino({ level: 'silent' }),
            printQRInTerminal: false,
            auth: state,
            browser: ['Mac OS', 'Safari', '15.3'],
            syncFullHistory: false
        });

        sock.ev.on('creds.update', saveCreds);

        sock.ev.on('connection.update', async (update: any) => {
            const { connection, lastDisconnect, qr } = update;

            // Jika belum terdaftar & ada QR
            if (qr && !sock.authState?.creds?.registered) {
                console.log('\n==================================================');
                console.log('📱 SCAN QR CODE WHATSAPP (INSTAN 1 DETIK):');
                qrcode.generate(qr, { small: true });
                console.log('==================================================\n');
            }

            if (connection === 'close') {
                isReady = false;
                const statusCode = (lastDisconnect?.error as any)?.output?.statusCode || (lastDisconnect?.error as any)?.statusCode;
                
                // Status 440 = Connection Replaced (ada koneksi lain dengan sesi sama)
                // Status 401 = Logged Out / Invalid
                const isLoggedOut = statusCode === DisconnectReason.loggedOut || statusCode === 401;
                const isConflict = statusCode === DisconnectReason.connectionReplaced || statusCode === 440;

                console.log(`[WhatsApp] Koneksi terputus (Status ${statusCode}).`);

                if (reconnectTimer) clearTimeout(reconnectTimer);

                if (isLoggedOut) {
                    console.log('[WhatsApp] Sesi tidak valid (Status 401). Membersihkan sesi lama & menyiapkan login baru...');
                    try {
                        const fs = await import('fs');
                        fs.rmSync('baileys_auth_info', { recursive: true, force: true });
                    } catch (e) {}
                    reconnectTimer = setTimeout(() => initializeWhatsApp(), 3000);
                } else if (isConflict) {
                    console.log('[WhatsApp] Terdeteksi bentrok sesi (Status 440). Menunggu 10 detik sebelum reconnect...');
                    reconnectTimer = setTimeout(() => initializeWhatsApp(), 10000);
                } else {
                    reconnectTimer = setTimeout(() => initializeWhatsApp(), 5000);
                }
            } else if (connection === 'open') {
                console.log('\n==================================================');
                console.log('🎉 WHATSAPP BOT BERHASIL TERHUBUNG & SANGAT SIAP!');
                console.log('==================================================\n');
                isReady = true;
            }
        });

        // HAPUS SEMENTARA: Meminta Pairing Code sering bentrok dengan QR Code 
        // dan menyebabkan WhatsApp menendang sesi (401/515) saat di-scan.
        /*
        const phoneNum = process.env.WHATSAPP_PHONE_NUMBER;
        if (!sock.authState?.creds?.registered && phoneNum) {
            let cleanNumber = phoneNum.replace(/\D/g, '');
            if (cleanNumber.startsWith('0')) cleanNumber = '62' + cleanNumber.substring(1);

            setTimeout(async () => {
                try {
                    const pairingCode = await sock.requestPairingCode(cleanNumber);
                    console.log('\n==================================================');
                    console.log(`🔑 KODE PAIRING WHATSAPP ANDA: ${pairingCode}`);
                    console.log(`👉 Masukkan kode 8-digit ini di WhatsApp HP Anda!`);
                    console.log('==================================================\n');
                } catch (e) {
                    console.warn("[WhatsApp] Tidak bisa meminta pairing code, gunakan QR Code di atas.");
                }
            }, 4000);
        }
        */
    } catch (err) {
        console.error('[WhatsApp] Gagal inisialisasi:', err);
        isReady = false;
        if (reconnectTimer) clearTimeout(reconnectTimer);
        reconnectTimer = setTimeout(() => initializeWhatsApp(), 10000);
    }
}

/**
 * Sends a message to a specific number safely.
 * @param number Phone number in international format without '+' (e.g. 628123456789)
 * @param message The message to send
 */
export async function sendWhatsAppMessage(number: string, message: string) {
    if (!sock || !isReady) {
        console.warn('[WhatsApp] Bot belum terhubung. Pesan tidak terkirim.');
        return;
    }
    
    try {
        let cleanNumber = number.replace(/\D/g, '');
        if (cleanNumber.startsWith('0')) cleanNumber = '62' + cleanNumber.substring(1);
        
        const jid = `${cleanNumber}@s.whatsapp.net`;
        await sock.sendMessage(jid, { text: message });
    } catch (error) {
        console.error('[WhatsApp] Gagal mengirim pesan:', error);
    }
}


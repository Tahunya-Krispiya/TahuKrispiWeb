import { Casaku, verifyWebhookSignature } from "casaku";

// Inisialisasi Casaku Client
const casaku = new Casaku({ licenseKey: process.env.CASAKU_LICENSE_KEY || "" });

/**
 * Membuat transaksi QRIS dinamis baru menggunakan Casaku API.
 * Mengembalikan URL gambar QRIS dan Order ID.
 */
export async function createQrisTransaction(orderId: string, grossAmount: number, name: string = "Hamba Allah") {
    console.log(`[CASAKU] Creating QRIS for Order: ${orderId}, Amount: ${grossAmount}, Name: ${name}`);
    
    // Generate QRIS dinamis via Casaku
    const response = await casaku.generateQRISv2({
        qr_id: process.env.CASAKU_QR_ID || "", // ID Merchant dari dashboard Casaku
        amount: grossAmount,
        // Casaku membutuhkan string untuk transactionId, kita pakai orderId
        transactionId: orderId,
        packageIds: ["id.dana", "com.gojek.app", "com.shopee.id", "ovo.id"],
        qrType: "dynamic",
        paymentMethod: "qris",
        useQris: true,
        useUniqueCode: true
    });
    
    // Dapatkan data respons (QR string, status, dll)
    const data = response.data;
    
    // Kita convert QR string mentah ke URL gambar QR untuk ditampilkan di Frontend
    const qrUrl = casaku.getQRImageURL({
        data: data.qr_string,
        size: "300x300",
        style: 2, // Block style
        color: "713f12", // Warna yellow-900 biar senada dengan Tahu Krispi
    });

    return {
        order_id: orderId, // frontend pakai order_id
        gross_amount: grossAmount,
        transaction_status: "pending",
        qr_url: qrUrl,
        is_mock: false,
        custom_field1: name,
        casaku_transaction_id: data.transactionId
    };
}

/**
 * Validasi Webhook Signature dari Casaku
 */
export function verifyCasakuSignature(rawBody: Buffer, signature: string) {
    const secret = process.env.WEBHOOK_SECRET || "";
    if (!secret) return false;
    
    try {
        return verifyWebhookSignature(rawBody, signature, secret);
    } catch (e) {
        return false;
    }
}

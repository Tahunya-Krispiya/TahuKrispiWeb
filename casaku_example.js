/**
 * Casaku Webhook Receiver - Node.js (Express.js)
 *
 * Secure webhook endpoint with HMAC-SHA256 signature verification.
 * Webhook Secret didapatkan dari https://casaku.id → Dashboard → Webhook Developer
 */

import express from 'express';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

const WEBHOOK_SECRET =
  process.env.WEBHOOK_SECRET ||
  'xxxxxxxxxxxxx';

if (!WEBHOOK_SECRET) {
  console.warn('⚠️ WARNING: WEBHOOK_SECRET is not set in environment variables.');
}

app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

function safeDecodePayload(body) {
  try {
    const decoded = {};

    for (const [key, value] of Object.entries(body || {})) {
      if (typeof value === 'string') {
        try {
          decoded[key] = decodeURIComponent(value);
        } catch {
          decoded[key] = value;
        }
      } else {
        decoded[key] = value;
      }
    }

    return decoded;
  } catch (error) {
    console.error('❌ Failed to decode payload:', error.message);
    return body;
  }
}

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-casaku-signature'];

  const rawBodyString = req.rawBody ? req.rawBody.toString('utf8') : '';

  console.log('\n================ WEBHOOK RECEIVED ================');
  console.log('📩 Headers:', req.headers);
  console.log('📦 Raw Payload Asli:');
  console.log(rawBodyString || '(empty raw body)');

  console.log('🧩 Payload Parsed dari Express req.body:');
  console.log(req.body);

  const decodedPayload = safeDecodePayload(req.body);

  console.log('✅ Payload Setelah di Decode:');
  console.log(decodedPayload);
  console.log('==================================================\n');

  if (!WEBHOOK_SECRET) {
    console.error('❌ Webhook secret is not configured on the server.');
    return res.status(500).json({
      error: 'Server misconfiguration: WEBHOOK_SECRET is missing.',
    });
  }

  if (!signature) {
    console.warn('⚠️ Rejected request: x-casaku-signature header is missing.');
    return res.status(401).json({
      error: 'Unauthorized: Missing signature.',
    });
  }

  let isSignatureValid = false;

  try {
    const computedSignature = crypto
      .createHmac('sha256', WEBHOOK_SECRET)
      .update(req.rawBody || '')
      .digest('hex');

    console.log('🔐 Signature dari Header:', signature);
    console.log('🔐 Signature Hasil Compute:', computedSignature);

    const signatureBuffer = Buffer.from(signature, 'hex');
    const computedBuffer = Buffer.from(computedSignature, 'hex');

    if (signatureBuffer.length === computedBuffer.length) {
      isSignatureValid = crypto.timingSafeEqual(
        signatureBuffer,
        computedBuffer
      );
    }
  } catch (error) {
    console.error('❌ Error during signature verification:', error.message);
  }

  if (!isSignatureValid) {
    console.warn('⚠️ Rejected request: Invalid signature.');
    return res.status(401).json({
      error: 'Unauthorized: Invalid signature.',
    });
  }

  const {
    transactionId,
    amount,
    packageName,
    appName,
    status,
    paidAt,
  } = decodedPayload;

  console.log('✅ Webhook Signature Verified Successfully!');
  console.log('📦 Final Payload:', {
    transactionId,
    amount,
    packageName,
    appName,
    status,
    paidAt,
  });

  return res.status(200).json({
    success: true,
    message: 'Webhook received and processed',
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Webhook receiver example listening on http://localhost:${PORT}`);
  console.log(`📡 Send POST requests to: http://localhost:${PORT}/webhook`);
});
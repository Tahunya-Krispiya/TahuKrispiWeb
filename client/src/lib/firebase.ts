import { initializeApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { doc, getFirestore, onSnapshot, setDoc, updateDoc, increment, collection, addDoc, query, orderBy, limit } from "firebase/firestore";

/* =========================
   TYPES
========================= */

export interface DeliveryStatus {
    isGoFoodOnline: boolean;
    isGrabFoodOnline: boolean;
    isShopeeFoodOnline: boolean;
}

export interface LiveStatus {
    isTikTokLive: boolean;
    tiktokLiveUrl: string;
    timestamp?: number;
}

export type PromoType = "happy-hour" | "happy-holiday" | "buy-one-get-one" | "custom";

export interface PromoStatus {
    isPromoActive: boolean;
    promoType: PromoType;
    promoTitle: string;
    promoDescription: string;
    promoStartsAt?: number;
    promoEndsAt?: number;
    promoMediumSmallPrice: number;
    promoLargeMediumPrice: number;
}

export type PublicStatus = DeliveryStatus & LiveStatus & PromoStatus;

/* =========================
   FIREBASE INIT
========================= */

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const hasFirebaseConfig = Object.values(firebaseConfig).every(
    (value) => typeof value === "string" && value.length > 8 && !/^(x+|your_|isi)/i.test(value),
);
export const isFirebaseConfigured = hasFirebaseConfig;

let authInstance: Auth | null = null;
let dbInstance: ReturnType<typeof getFirestore> | null = null;

if (hasFirebaseConfig) {
    try {
        const app = initializeApp(firebaseConfig);
        authInstance = getAuth(app);
        dbInstance = getFirestore(app);
    } catch (error) {
        console.warn("Firebase tidak dapat diinisialisasi:", error);
    }
} else {
    console.info("Firebase belum dikonfigurasi; halaman publik berjalan tanpa status realtime.");
}

export const auth = authInstance;
export const db = dbInstance;

/* =========================
   FIRESTORE HELPERS
========================= */

const PUBLIC_STATUS_DOC = "public/status";

/**
 * Update status publik (delivery + live)
 */
export async function setPublicStatus(status: PublicStatus) {
    if (!db) throw new Error("Firebase belum dikonfigurasi.");
    await setDoc(doc(db, PUBLIC_STATUS_DOC), {
        ...status,
        timestamp: Date.now(),
    });
}

/**
 * Listen realtime ke status publik
 */
export function subscribeToStatus(
    callback: (status: PublicStatus) => void
) {
    if (!db) return () => undefined;
    return onSnapshot(
        doc(db, PUBLIC_STATUS_DOC),
        (snapshot) => {
            if (snapshot.exists()) callback(snapshot.data() as PublicStatus);
        },
        (error) => {
            console.warn("Status realtime tidak tersedia:", error.message);
        },
    );
}

const RECENT_PAYMENTS_DOC = "public/recent_payments";

export interface PaymentNotification {
    orderId: string;
    nominal: number;
    name: string;
    timestamp: number;
}

export async function addPaymentNotification(notification: Omit<PaymentNotification, "timestamp">) {
    if (!db) return;
    // We overwrite the single document to act as an event bus for the latest payment
    await setDoc(doc(db, RECENT_PAYMENTS_DOC), {
        ...notification,
        timestamp: Date.now()
    });
}

export function subscribeToPaymentNotifications(
    callback: (notification: PaymentNotification) => void
) {
    if (!db) return () => undefined;
    return onSnapshot(
        doc(db, RECENT_PAYMENTS_DOC),
        (snapshot) => {
            if (snapshot.exists()) {
                callback(snapshot.data() as PaymentNotification);
            }
        },
        (error) => {
            console.warn("Payment notifications tidak tersedia:", error.message);
        }
    );
}

/* =========================
   LINK PAGE: VOTING & FEEDBACK
========================= */

const VOTING_DOC = "public/voting_outfit";
const FEEDBACK_COLLECTION = "link_feedbacks";

export interface OutfitVoteCount {
    koki: number;
    penyihir: number;
    goku: number;
    mario: number;
    koboy: number;
    muslim: number;
    bajaklaut: number;
}

export async function submitOutfitVote(outfitId: string) {
    if (!db) return;
    try {
        await setDoc(doc(db, VOTING_DOC), {
            [outfitId]: increment(1)
        }, { merge: true });
    } catch (error) {
        console.error("Failed to submit outfit vote:", error);
        throw error;
    }
}

export function subscribeToOutfitVotes(
    callback: (votes: OutfitVoteCount) => void
) {
    if (!db) return () => undefined;
    return onSnapshot(
        doc(db, VOTING_DOC),
        (snapshot) => {
            if (snapshot.exists()) {
                callback(snapshot.data() as OutfitVoteCount);
            } else {
                callback({ koki: 0, penyihir: 0, goku: 0, mario: 0, koboy: 0, muslim: 0, bajaklaut: 0 });
            }
        },
        (error) => {
            console.warn("Voting realtime tidak tersedia:", error.message);
        }
    );
}

export interface FeedbackMessage {
    id?: string;
    message: string;
    timestamp: number;
}

export async function submitFeedback(message: string) {
    if (!db) return;
    await addDoc(collection(db, FEEDBACK_COLLECTION), {
        message,
        timestamp: Date.now()
    });
}

export function subscribeToFeedback(
    callback: (feedbacks: FeedbackMessage[]) => void
) {
    if (!db) return () => undefined;
    const q = query(collection(db, FEEDBACK_COLLECTION), orderBy("timestamp", "desc"), limit(50));
    return onSnapshot(q, (snapshot) => {
        const feedbacks: FeedbackMessage[] = [];
        snapshot.forEach((docSnap) => {
            feedbacks.push({ id: docSnap.id, ...docSnap.data() } as FeedbackMessage);
        });
        callback(feedbacks);
    }, (error) => {
        console.warn("Feedback realtime tidak tersedia:", error.message);
    });
}

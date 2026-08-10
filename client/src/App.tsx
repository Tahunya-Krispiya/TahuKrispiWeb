import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged, User } from "firebase/auth";
import Home from "./pages/Home";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import Payment from "./pages/Payment";
import LinkPage from "./pages/LinkPage";
import { LiveNotificationPopup } from "./components/LiveNotificationPopup";
import { auth, subscribeToStatus, PublicStatus } from "./lib/firebase";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";

/* ================= PROTECTED ================= */
function ProtectedRoute({
    isLoggedIn,
    children,
}: {
    isLoggedIn: boolean;
    children: React.ReactNode;
}) {
    if (!isLoggedIn) return <Navigate to="/login" replace />;
    return <>{children}</>;
}

/* ================= APP ================= */
export default function App() {
    const [authReady, setAuthReady] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    const [globalStatus, setGlobalStatus] = useState<PublicStatus>({
        tiktokLiveUrl: "https://www.tiktok.com/@ajengandhika_",
        isTikTokLive: false,
        isGoFoodOnline: false,
        isGrabFoodOnline: false,
        isShopeeFoodOnline: false,
        isPromoActive: false,
        promoType: "happy-hour",
        promoTitle: "Happy Hour",
        promoDescription: "Promo spesial dalam waktu terbatas!",
        promoStartsAt: Date.now(),
        promoMediumSmallPrice: 18000,
        promoLargeMediumPrice: 35000,
        timestamp: Date.now(),
    });

    /* ===== AUTH ===== */
    useEffect(() => {
        if (!auth) {
            setAuthReady(true);
            return;
        }
        const unsub = onAuthStateChanged(auth, (u) => {
            setUser(u);
            setAuthReady(true);
        });
        return () => unsub();
    }, []);

    /* ===== FIRESTORE ===== */
    useEffect(() => subscribeToStatus(setGlobalStatus), []);

    return (
        <div className="overflow-x-hidden w-full max-w-full min-h-screen bg-[#FFFDF5]">
            <LiveNotificationPopup />
            <TooltipProvider>
                <Router>
                <Routes>
                    <Route path="/" element={<Home globalStatus={globalStatus} />} />
                    <Route path="/payment" element={<Payment />} />
                    <Route path="/link" element={<LinkPage />} />
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/admin"
                        element={
                            <ProtectedRoute isLoggedIn={authReady && !!user}>
                                <AdminDashboard
                                    currentStatus={globalStatus}
                                onLogout={() => auth?.signOut()}
                                />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
                <Toaster />
            </Router>
        </TooltipProvider>
        </div>
    );
}

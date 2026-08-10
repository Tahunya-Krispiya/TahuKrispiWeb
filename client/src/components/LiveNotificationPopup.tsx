import { useState, useEffect } from "react";
import { subscribeToPaymentNotifications, PaymentNotification } from "../lib/firebase";
import { Coins } from "lucide-react";

export function LiveNotificationPopup() {
    const [notification, setNotification] = useState<PaymentNotification | null>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const handleNotification = (newNotification: PaymentNotification) => {
            if (Date.now() - newNotification.timestamp < 30000) {
                setNotification(newNotification);
                setIsVisible(true);
                
                const audio = new Audio("https://actions.google.com/sounds/v1/cartoon/cartoon_boing.ogg");
                audio.volume = 0.5;
                audio.play().catch(e => console.log("Audio autoplay blocked", e));

                setTimeout(() => {
                    setIsVisible(false);
                }, 6000);
            }
        };

        // 1. Firebase Listener (For legacy cross-device sync)
        const unsubscribe = subscribeToPaymentNotifications(handleNotification);

        // 2. BroadcastChannel Listener (For local cross-tab sync)
        const channel = new BroadcastChannel('payment_notifications');
        channel.onmessage = (event) => {
            handleNotification(event.data);
        };

        // 3. SSE Listener (For Server-Sent Events from Webhook)
        const evtSource = new EventSource('/api/payment/stream');
        evtSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                handleNotification(data);
            } catch (e) {}
        };

        return () => {
            unsubscribe();
            channel.close();
            evtSource.close();
        };
    }, []);

    if (!isVisible || !notification) return null;

    return (
        <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] pointer-events-none">
            {/* Saweria Style Animation */}
            <div className="bg-yellow-400 text-yellow-950 font-bold px-6 py-4 rounded-full shadow-2xl border-4 border-yellow-300 flex items-center gap-4 animate-in slide-in-from-top-10 fade-in zoom-in-50 duration-500 ease-out">
                <div className="bg-white p-2 rounded-full animate-bounce">
                    <Coins className="w-8 h-8 text-yellow-500" />
                </div>
                <div>
                    <p className="text-xl drop-shadow-md">
                        🎉 {notification.name || "Hamba Allah"} berdonasi! 🎉
                    </p>
                    <p className="text-2xl mt-1 text-center font-extrabold text-white drop-shadow-lg" style={{ WebkitTextStroke: '1px #713f12' }}>
                        Rp {notification.nominal.toLocaleString("id-ID")}
                    </p>
                </div>
            </div>
            {/* Confetti effect (simulated with CSS for simplicity) */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
                <div className="w-3 h-3 bg-red-500 absolute -left-10 top-0 animate-[ping_1s_ease-in-out_infinite]" />
                <div className="w-3 h-3 bg-blue-500 absolute left-full top-5 animate-[ping_1.2s_ease-in-out_infinite]" />
                <div className="w-3 h-3 bg-green-500 absolute -left-5 top-10 animate-[ping_0.8s_ease-in-out_infinite]" />
                <div className="w-3 h-3 bg-purple-500 absolute left-[120%] top-2 animate-[ping_1.5s_ease-in-out_infinite]" />
            </div>
        </div>
    );
}

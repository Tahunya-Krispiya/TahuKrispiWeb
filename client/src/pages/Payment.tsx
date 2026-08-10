import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { useToast } from "../hooks/use-toast";
import { CheckCircle2, Loader2, QrCode, Copy, MapPin, ExternalLink, Flame } from "lucide-react";
import { Link } from "react-router-dom";
import { subscribeToPaymentNotifications } from "../lib/firebase";
import { Dialog, DialogContent, DialogTrigger } from "../components/ui/dialog";
import { Maximize2, XCircle } from "lucide-react";
import logoImg from "@assets/1763097449392_1763097461717.png";

export default function Payment() {
    const [nominal, setNominal] = useState("");
    const [nominalDisplay, setNominalDisplay] = useState(""); // Format tampilan: 10.000
    const [nama, setNama] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [transaction, setTransaction] = useState<any>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 mins in seconds
    const [activeTab, setActiveTab] = useState("qris-asli");
    const { toast } = useToast();

    // LocalStorage Persistence
    useEffect(() => {
        const savedTx = localStorage.getItem("current_transaction");
        const savedTime = localStorage.getItem("current_transaction_expiry");
        if (savedTx && savedTime) {
            const expiry = parseInt(savedTime, 10);
            const now = Date.now();
            if (now < expiry) {
                setTransaction(JSON.parse(savedTx));
                setTimeLeft(Math.floor((expiry - now) / 1000));
            } else {
                localStorage.removeItem("current_transaction");
                localStorage.removeItem("current_transaction_expiry");
            }
        }
    }, []);

    // Listen to Firebase & SSE Realtime Webhooks
    useEffect(() => {
        if (!transaction || isSuccess) return;

        const handleSuccess = (notification: { orderId: string, nominal: number }) => {
            const isMatch = notification.orderId === transaction.casaku_transaction_id || 
                            notification.orderId === transaction.order_id || 
                            Number(notification.nominal) === Number(transaction.amount);

            if (isMatch) {
                setIsSuccess(true);
                localStorage.removeItem("current_transaction");
                localStorage.removeItem("current_transaction_expiry");
                toast({
                    title: "Pembayaran Lunas!",
                    description: `Terima kasih atas pembayaran sebesar Rp ${notification.nominal}`,
                });
            }
        };

        const unsubscribe = subscribeToPaymentNotifications(handleSuccess);
        
        const evtSource = new EventSource('/api/payment/stream');
        evtSource.onmessage = (event) => {
            try {
                handleSuccess(JSON.parse(event.data));
            } catch (e) {}
        };

        // Fast Polling fallback (setiap 2 detik)
        const pollInterval = setInterval(async () => {
            try {
                const res = await fetch(`/api/payment/check-status?orderId=${transaction.order_id}&casakuId=${transaction.casaku_transaction_id || ''}&amount=${transaction.gross_amount}`);
                const data = await res.json();
                if (data.paid && data.data) {
                    handleSuccess({ orderId: data.data.orderId, nominal: data.data.nominal });
                }
            } catch (e) {}
        }, 2000);

        return () => {
            unsubscribe();
            evtSource.close();
            clearInterval(pollInterval);
        };
    }, [transaction, isSuccess, toast]);

    // Countdown Timer Logic
    useEffect(() => {
        if (!transaction || isSuccess) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    localStorage.removeItem("current_transaction");
                    localStorage.removeItem("current_transaction_expiry");
                    toast({
                        title: "Waktu Habis",
                        description: "Sesi QRIS ini telah kedaluwarsa. Silakan muat ulang.",
                        variant: "destructive"
                    });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [transaction, isSuccess, toast]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // Format input nominal otomatis jadi format Rupiah (10.000, bukan 10000)
    const handleNominalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/\D/g, ""); // Hanya angka
        setNominal(raw); // Simpan angka mentah untuk dikirim ke API
        if (raw === "") {
            setNominalDisplay("");
        } else {
            // Format sebagai angka Indonesia: 10.000.000
            setNominalDisplay(Number(raw).toLocaleString("id-ID"));
        }
    };

    const handleGenerateQR = async () => {
        const amount = Number(nominal);
        if (!nominal || isNaN(amount) || amount < 1000) {
            toast({
                title: "Nominal tidak valid",
                description: "Minimal pembayaran adalah Rp 1.000.",
                variant: "destructive"
            });
            return;
        }
        if (amount > 10_000_000) {
            toast({
                title: "Nominal terlalu besar",
                description: "Maksimal pembayaran adalah Rp 10.000.000.",
                variant: "destructive"
            });
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch("/api/payment/charge", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nominal, nama: nama || "Hamba Allah" })
            });

            const data = await res.json();
            if (data.success) {
                setTransaction(data.data);
                setTimeLeft(15 * 60);
                localStorage.setItem("current_transaction", JSON.stringify(data.data));
                localStorage.setItem("current_transaction_expiry", (Date.now() + 15 * 60 * 1000).toString());
            } else {
                toast({
                    title: "Gagal Membuat QRIS",
                    description: data.message || "Terjadi kesalahan.",
                    variant: "destructive"
                });
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Tidak dapat terhubung ke server.",
                variant: "destructive"
            });
        } finally {
            setIsLoading(false);
        }
    };

    // For Demo: Simulate Webhook Button
    const simulateWebhook = async () => {
        if (!transaction) return;
        try {
            await fetch("/api/payment/simulate-webhook", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    order_id: transaction.order_id, 
                    gross_amount: transaction.gross_amount,
                    nama: transaction.custom_field1 || "Hamba Allah"
                })
            });
            
            // We explicitly set success here so the UI updates immediately
            setIsSuccess(true);
            
            const notificationPayload = {
                orderId: transaction.order_id,
                nominal: transaction.gross_amount,
                name: transaction.custom_field1 || "Hamba Allah",
                timestamp: Date.now()
            };
            
            // 1. Broadcast locally across tabs (bypasses Firebase rules)
            const channel = new BroadcastChannel('payment_notifications');
            channel.postMessage(notificationPayload);
            channel.close();

            // 2. Trigger Firebase to broadcast to other devices
            const { addPaymentNotification } = await import("../lib/firebase");
            await addPaymentNotification(notificationPayload);
            
        } catch (e) {
            console.error("Gagal mensimulasikan webhook:", e);
        }
    };

    const handleCancel = () => {
        if (window.confirm("Yakin ingin membatalkan transaksi ini?")) {
            localStorage.removeItem("current_transaction");
            localStorage.removeItem("current_transaction_expiry");
            setTransaction(null);
            setNominal("");
            setNominalDisplay("");
            setNama("");
            toast({
                title: "Dibatalkan",
                description: "Transaksi telah dibatalkan.",
            });
        }
    };

    const copyToClipboard = (text: string, label: string) => {
        navigator.clipboard.writeText(text).then(() => {
            toast({ title: `${label} disalin!`, description: text });
        }).catch(() => {
            toast({ title: "Gagal menyalin", variant: "destructive" });
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-orange-50 font-sans relative overflow-hidden">
            {/* Background Decorations */}
            <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-yellow-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob pointer-events-none"></div>
            <div className="fixed top-[-10%] right-[-10%] w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000 pointer-events-none"></div>
            <div className="fixed bottom-[-20%] left-[20%] w-96 h-96 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center py-8 px-4 min-h-screen">

            <Card className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden rounded-[2rem]">
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-5 sm:p-7 text-center relative shadow-sm rounded-t-[2rem] flex flex-col items-center">
                    {/* Tombol Website Utama dengan logo */}
                    <div className="w-full flex justify-start mb-4">
                        <a
                            href="https://tahunyakrispiya.my.id"
                            className="inline-flex bg-white/40 hover:bg-white/60 text-yellow-950 backdrop-blur-md px-3 py-1.5 rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.1)] transition-all duration-300 items-center gap-2 border border-white/50 hover:scale-105 active:scale-95"
                        >
                            <img src={logoImg} alt="Logo Tahunya Krispi-ya" className="h-6 w-auto" />
                            <span className="font-black text-xs sm:text-sm">Tahunya Krispi-ya!</span>
                        </a>
                    </div>
                    <h1 className="text-2xl font-black text-yellow-950 drop-shadow-sm">Portal Pembayaran</h1>
                    <p className="text-yellow-900/80 text-sm font-medium mt-1">Dukung &amp; Nikmati Kerenyahan Kami</p>
                </div>

                <CardContent className="p-5 sm:p-7">
                    {isSuccess ? (
                        <div className="text-center py-8 space-y-5 animate-in fade-in zoom-in duration-500 slide-in-from-bottom-4">
                            <div className="flex justify-center mb-6 relative">
                                <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-75"></div>
                                <CheckCircle2 className="w-24 h-24 text-green-500 relative z-10 bg-white rounded-full" />
                            </div>
                            <h3 className="text-3xl font-black text-gray-900">Alhamdulillah!</h3>
                            <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
                                <p className="text-green-800 font-medium text-sm uppercase tracking-wider">Pembayaran Lunas</p>
                                <p className="text-green-600 font-bold text-2xl mt-1">
                                    Rp {transaction?.gross_amount?.toLocaleString("id-ID")}
                                </p>
                            </div>
                            <p className="text-gray-500 text-sm font-medium">
                                Notifikasi telah masuk ke sistem kami. Terima kasih, <b>{transaction?.custom_field1}</b>!
                            </p>
                            <Button
                                onClick={() => {
                                    setIsSuccess(false);
                                    setTransaction(null);
                                    setNominal("");
                                    setNominalDisplay("");
                                    setNama("");
                                }}
                                variant="outline"
                                className="mt-6 border-yellow-500 text-yellow-700 hover:bg-yellow-50 hover:text-yellow-800 w-full rounded-xl py-6 font-bold"
                            >
                                Transaksi Baru
                            </Button>
                        </div>
                    ) : transaction ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="text-center p-4 bg-red-50/80 backdrop-blur-sm rounded-2xl border border-red-100 shadow-inner">
                                <p className="text-xs font-bold text-red-600 uppercase tracking-widest mb-1">Batas Waktu Bayar</p>
                                <p className="text-4xl font-mono font-black text-red-600 tracking-wider">
                                    {formatTime(timeLeft)}
                                </p>
                            </div>

                            <div className="bg-gradient-to-br from-blue-900 to-blue-950 rounded-[2rem] p-6 shadow-2xl w-full relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
                                <h2 className="text-white text-center font-black mb-5 italic text-xl tracking-wide">Satu QRIS untuk Semua</h2>
                                <div className="bg-white rounded-2xl p-4 flex flex-col items-center justify-center min-h-[250px] shadow-inner relative z-10">
                                    {transaction.qr_url ? (
                                        <img
                                            src={transaction.qr_url}
                                            alt="QRIS Midtrans"
                                            className="w-56 h-56 object-contain"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center text-gray-400 gap-3">
                                            <Loader2 className="w-10 h-10 animate-spin text-blue-900" />
                                            <p className="text-sm font-medium">Menghasilkan QR Code...</p>
                                        </div>
                                    )}
                                </div>
                                <div className="mt-6 text-center z-10 relative">
                                    <p className="text-white/70 text-xs uppercase tracking-widest font-bold mb-1">Total Tagihan</p>
                                    <p className="text-white font-black text-3xl drop-shadow-md">Rp {transaction.gross_amount.toLocaleString("id-ID")}</p>
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-2 pt-4">
                                <div className="flex items-center gap-2">
                                    <span className="relative flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                                    </span>
                                    <p className="text-sm font-semibold text-gray-600">Menunggu pembayaran...</p>
                                </div>
                                <div className="flex flex-wrap justify-center gap-3 mt-3 w-full max-w-xs px-2">
                                    <Button
                                        onClick={handleCancel}
                                        variant="outline"
                                        className="flex-1 py-5 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 font-bold rounded-2xl shadow-sm text-xs"
                                    >
                                        <XCircle className="w-4 h-4 mr-1.5" /> Batalkan
                                    </Button>
                                    <Button
                                        onClick={async () => {
                                            if (window.confirm("Apakah Anda sudah menyelesaikan pembayaran di aplikasi m-banking / e-wallet?")) {
                                                setIsSuccess(true);
                                                localStorage.removeItem("current_transaction");
                                                localStorage.removeItem("current_transaction_expiry");
                                                toast({ title: "Konfirmasi Pembayaran", description: "Terima kasih telah melakukan pembayaran!" });
                                                try {
                                                    await fetch('/api/payment/simulate-webhook', {
                                                        method: 'POST',
                                                        headers: { 'Content-Type': 'application/json' },
                                                        body: JSON.stringify({ order_id: transaction.order_id, gross_amount: transaction.gross_amount, nama: transaction.custom_field1 })
                                                    });
                                                } catch (e) {}
                                            }
                                        }}
                                        className="flex-1 py-5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-black rounded-2xl shadow-md text-xs"
                                    >
                                        <CheckCircle2 className="w-4 h-4 mr-1.5" /> Saya Sudah Bayar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-5">
                            {/* Header metode */}
                            <div className="text-center">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Penyedia: TAHUNYA KRISPIYA</p>
                                <h2 className="text-2xl font-black text-gray-900">Metode Pembayaran</h2>
                                <p className="text-sm text-gray-500 font-medium mt-1">Pilih metode favorit Anda di bawah ini.</p>
                            </div>

                            {/* Konten aktif TAMPIL DULU - fokus ke QRIS untuk penonton live */}
                            <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm relative overflow-hidden">
                                <div className="absolute -top-4 -right-4 w-16 h-16 bg-yellow-50 rounded-full blur-xl pointer-events-none"></div>

                                {activeTab === 'qris-asli' && (
                                    <div className="space-y-4 animate-in fade-in duration-300 text-center relative z-10 flex flex-col items-center">
                                        {/* Klik gambar QRIS untuk perbesar */}
                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <div className="bg-white p-3 rounded-3xl border-2 border-yellow-200 shadow-md inline-block relative group w-full cursor-pointer hover:border-yellow-400 transition-all duration-300 hover:shadow-lg">
                                                    <div className="absolute top-2 right-2 bg-yellow-100 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                                        <Maximize2 className="w-3.5 h-3.5 text-yellow-700" />
                                                    </div>
                                                    <img src="/images/qris.jpeg" alt="QRIS Tahu Krispi" className="w-full max-w-[220px] rounded-2xl mx-auto transition-transform duration-300 group-hover:scale-[1.02]" />
                                                    <p className="text-xs text-yellow-700 font-semibold mt-2 flex items-center justify-center gap-1">
                                                        <Maximize2 className="w-3 h-3" /> Ketuk untuk perbesar
                                                    </p>
                                                </div>
                                            </DialogTrigger>
                                            <DialogContent className="max-w-sm p-1 border-none bg-transparent shadow-none">
                                                <div className="bg-white p-4 rounded-3xl shadow-2xl">
                                                    <img src="/images/qris.jpeg" alt="QRIS Tahu Krispi — Perbesar" className="w-full h-auto rounded-xl" />
                                                    <p className="text-center text-xs text-gray-500 mt-3 font-medium">Pastikan nama penerima: <span className="font-black text-gray-800">TAHUNYA KRISPIYA</span></p>
                                                </div>
                                            </DialogContent>
                                        </Dialog>
                                        <p className="text-sm font-medium text-gray-500">Scan QRIS di atas menggunakan aplikasi e-wallet Anda.</p>
                                        <Button
                                            onClick={() => {
                                                toast({ title: "Terima Kasih!", description: "Silakan konfirmasikan pembayaran Anda ke Admin via WhatsApp." });
                                                window.open("https://wa.me/6281288362512", "_blank");
                                            }}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-sm py-5"
                                        >
                                            <CheckCircle2 className="w-4 h-4 mr-1.5" /> Saya Sudah Bayar
                                        </Button>
                                    </div>
                                )}

                                {activeTab === 'qris-dinamis' && (
                                    <div className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-300 relative z-10">
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Nama Anda (Opsional)</label>
                                            <Input
                                                type="text"
                                                placeholder="Hamba Allah"
                                                value={nama}
                                                onChange={(e) => setNama(e.target.value)}
                                                className="w-full border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-base py-6 px-4 rounded-xl transition-all shadow-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
                                                Nominal (Rp) <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold text-base pointer-events-none">Rp</span>
                                                <Input
                                                    type="text"
                                                    inputMode="numeric"
                                                    placeholder="10.000"
                                                    value={nominalDisplay}
                                                    onChange={handleNominalChange}
                                                    className="w-full border-gray-200 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-lg py-6 pl-10 pr-4 font-bold rounded-xl transition-all shadow-sm"
                                                />
                                            </div>
                                            {nominal && Number(nominal) > 0 && (
                                                <p className="text-xs text-gray-400 mt-1.5 ml-1">
                                                    Nominal: <span className="font-semibold text-gray-600">Rp {Number(nominal).toLocaleString("id-ID")}</span>
                                                </p>
                                            )}
                                        </div>
                                        <Button
                                            onClick={handleGenerateQR}
                                            disabled={isLoading || !nominal}
                                            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-yellow-950 font-black py-7 text-lg rounded-xl shadow-[0_4px_14px_0_rgba(234,179,8,0.39)] hover:shadow-[0_6px_20px_rgba(234,179,8,0.23)] transition-all hover:-translate-y-1 mt-4"
                                        >
                                            {isLoading ? <><Loader2 className="w-6 h-6 mr-2 animate-spin" /> Memproses...</> : "Buat Kode QRIS Instan"}
                                        </Button>
                                    </div>
                                )}

                                {activeTab === 'rekening' && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300 relative z-10">
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-3xl p-6 text-left shadow-inner relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200/50 rounded-full blur-xl transform translate-x-1/2 -translate-y-1/2"></div>
                                            <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                                                BCA
                                            </p>
                                            {/* Klik nomor → salin otomatis */}
                                            <button
                                                onClick={() => copyToClipboard("8420697954", "Nomor rekening BCA")}
                                                className="group flex items-center gap-3 w-full text-left mt-1 mb-3"
                                                title="Ketuk untuk menyalin nomor rekening"
                                            >
                                                <p className="text-3xl font-black text-blue-900 tracking-wider font-mono group-hover:text-blue-700 transition-colors">8420697954</p>
                                                <span className="flex items-center gap-1 text-xs bg-blue-200 text-blue-800 px-2 py-1 rounded-lg font-bold opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                                    <Copy className="w-3 h-3" /> Salin
                                                </span>
                                            </button>
                                            <p className="text-sm font-medium text-blue-800 bg-white/50 inline-block px-3 py-1 rounded-lg">a.n <span className="font-black text-blue-900">Ajeng Andhika</span></p>
                                        </div>
                                        <p className="text-xs text-gray-500 text-center font-medium flex items-center justify-center gap-1">
                                            <Copy className="w-3 h-3" /> Ketuk nomor rekening untuk menyalin otomatis
                                        </p>
                                        <p className="text-xs text-gray-400 text-center">Setelah transfer, konfirmasi ke admin via WhatsApp.</p>
                                    </div>
                                )}

                                {activeTab === 'whatsapp' && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300 relative z-10">
                                        <div className="bg-gradient-to-b from-green-50 to-green-100/50 border border-green-100 rounded-3xl p-6 text-center">
                                            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
                                            </div>
                                            <p className="text-sm font-bold text-gray-800 mb-4">Hubungi admin kami untuk pembayaran via pesan.</p>
                                            <div className="flex flex-col gap-3">
                                                <Button onClick={() => window.open('https://wa.me/6281288362512', '_blank')} className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-6 rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                                                    Admin 1 - Ajeng (+62 812-8836-2512)
                                                </Button>
                                                <Button onClick={() => window.open('https://wa.me/6289518007805', '_blank')} className="w-full bg-[#25D366] hover:bg-[#128C7E] text-white font-bold py-6 rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5">
                                                    Admin 2 - Rama (+62 895-1800-7805)
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Grid metode — DI BAWAH konten, penonton live fokus ke QRIS dulu */}
                            <div>
                                <p className="text-xs text-gray-400 text-center font-semibold uppercase tracking-widest mb-3">Pilih Metode Lain</p>
                                <div className="grid grid-cols-4 gap-2">
                                    <button
                                        onClick={() => setActiveTab('qris-asli')}
                                        className={`flex flex-col items-center gap-2 py-3 px-2 rounded-2xl border-2 transition-all duration-300 ${
                                            activeTab === 'qris-asli'
                                                ? 'border-yellow-400 bg-yellow-50 shadow-[0_4px_14px_0_rgba(234,179,8,0.2)]'
                                                : 'border-gray-100 hover:border-yellow-200 hover:bg-gray-50 opacity-70 hover:opacity-100'
                                        }`}
                                    >
                                        <QrCode className={`w-6 h-6 ${activeTab === 'qris-asli' ? 'text-yellow-600' : 'text-gray-400'}`} />
                                        <span className={`text-[10px] font-bold leading-tight text-center ${activeTab === 'qris-asli' ? 'text-yellow-900' : 'text-gray-500'}`}>Lihat QRIS</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('qris-dinamis')}
                                        className={`flex flex-col items-center gap-2 py-3 px-2 rounded-2xl border-2 transition-all duration-300 ${
                                            activeTab === 'qris-dinamis'
                                                ? 'border-yellow-400 bg-yellow-50 shadow-[0_4px_14px_0_rgba(234,179,8,0.2)]'
                                                : 'border-gray-100 hover:border-yellow-200 hover:bg-gray-50 opacity-70 hover:opacity-100'
                                        }`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-6 h-6 ${activeTab === 'qris-dinamis' ? 'text-yellow-600' : 'text-gray-400'}`}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                                        <span className={`text-[10px] font-bold leading-tight text-center ${activeTab === 'qris-dinamis' ? 'text-yellow-900' : 'text-gray-500'}`}>QRIS Instan</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('rekening')}
                                        className={`flex flex-col items-center gap-2 py-3 px-2 rounded-2xl border-2 transition-all duration-300 ${
                                            activeTab === 'rekening'
                                                ? 'border-yellow-400 bg-yellow-50 shadow-[0_4px_14px_0_rgba(234,179,8,0.2)]'
                                                : 'border-gray-100 hover:border-yellow-200 hover:bg-gray-50 opacity-70 hover:opacity-100'
                                        }`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-6 h-6 ${activeTab === 'rekening' ? 'text-yellow-600' : 'text-gray-400'}`}><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
                                        <span className={`text-[10px] font-bold leading-tight text-center ${activeTab === 'rekening' ? 'text-yellow-900' : 'text-gray-500'}`}>Rekening</span>
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('whatsapp')}
                                        className={`flex flex-col items-center gap-2 py-3 px-2 rounded-2xl border-2 transition-all duration-300 ${
                                            activeTab === 'whatsapp'
                                                ? 'border-yellow-400 bg-yellow-50 shadow-[0_4px_14px_0_rgba(234,179,8,0.2)]'
                                                : 'border-gray-100 hover:border-yellow-200 hover:bg-gray-50 opacity-70 hover:opacity-100'
                                        }`}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`w-6 h-6 ${activeTab === 'whatsapp' ? 'text-yellow-600' : 'text-gray-400'}`}><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"/></svg>
                                        <span className={`text-[10px] font-bold leading-tight text-center ${activeTab === 'whatsapp' ? 'text-yellow-900' : 'text-gray-500'}`}>WhatsApp</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* ===== SECTION: KEPO PRODUK KAMI ===== */}
            {!transaction && !isSuccess && (
                <div className="w-full max-w-md mt-6 space-y-4">
                    {/* Produk Unggulan */}
                    <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-white shadow-lg p-5">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Flame className="w-4 h-4 text-orange-500" />
                                    <span className="text-xs font-black text-orange-600 uppercase tracking-widest">Andalan Kami</span>
                                </div>
                                <h3 className="text-lg font-black text-gray-900">Tahu Krispi + Sambel Kalasan</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Renyah sempurna, sambel pedas-manis khas Kalasan 🌶️</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2.5 mb-4">
                            {[
                                { name: "Small Pack", size: "4 pcs", price: "Rp 10.000", emoji: "🟡" },
                                { name: "Medium Pack", size: "8 pcs", price: "Rp 18.000", emoji: "🟠", best: true },
                                { name: "Large Pack", size: "18 pcs", price: "Rp 35.000", emoji: "🔴" },
                            ].map((p) => (
                                <div key={p.name} className={`relative rounded-2xl border-2 p-3 text-center flex flex-col items-center gap-1 ${
                                    p.best ? 'border-yellow-400 bg-yellow-50' : 'border-gray-100 bg-gray-50'
                                }`}>
                                    {p.best && (
                                        <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px] bg-yellow-400 text-yellow-900 font-black px-2 py-0.5 rounded-full whitespace-nowrap">Paling pas</span>
                                    )}
                                    <span className="text-2xl">{p.emoji}</span>
                                    <p className="text-[11px] font-black text-gray-800 leading-tight">{p.name}</p>
                                    <p className="text-[10px] text-gray-500">{p.size}</p>
                                    <p className="text-xs font-black text-orange-600">{p.price}</p>
                                </div>
                            ))}
                        </div>

                        {/* Sambel Kalasan highlight */}
                        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-orange-100 p-3 flex items-center gap-3">
                            <span className="text-3xl">🌶️</span>
                            <div>
                                <p className="text-sm font-black text-red-700">+ Sambel Kalasan Khas</p>
                                <p className="text-xs text-gray-500 leading-snug">Warisan resep tradisional Kalasan, Sleman — pedas manis segar. Extra 1 Cup: Rp 3.000</p>
                            </div>
                        </div>

                        {/* Link ke website utama */}
                        <a
                            href="https://tahunyakrispiya.my.id"
                            className="mt-4 flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-black text-sm shadow hover:shadow-lg hover:scale-[1.02] transition-all duration-300"
                        >
                            <img src={logoImg} alt="Logo" className="h-5 w-auto" />
                            Selengkapnya di Tahunya Krispi-ya!
                            <ExternalLink className="w-4 h-4" />
                        </a>
                    </div>

                    {/* ===== MAPS LOKASI ===== */}
                    <div className="bg-white/70 backdrop-blur-md rounded-3xl border border-white shadow-lg overflow-hidden">
                        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="bg-red-100 p-2 rounded-xl">
                                    <MapPin className="w-5 h-5 text-red-600" />
                                </div>
                                <div>
                                    <h3 className="font-black text-gray-900 text-sm">Temukan Lapak Kami 📍</h3>
                                    <p className="text-xs text-gray-500">Tahunya Krispiya — Pekayon</p>
                                </div>
                            </div>
                            <a
                                href="https://maps.app.goo.gl/RoVegza696jarKxq7"
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition-colors"
                            >
                                Buka Maps <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                        {/* Google Maps Embed */}
                        <div className="relative w-full" style={{ height: '220px' }}>
                            <iframe
                                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3966.097427059456!2d106.89453!3d-6.29715!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e698d3d2c1dd1e5%3A0x1234567890abcdef!2sTahunya%20Krispiya%20Pekayon!5e0!3m2!1sid!2sid!4v1700000000000"
                                width="100%"
                                height="220"
                                style={{ border: 0 }}
                                allowFullScreen
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                title="Lokasi Tahunya Krispiya Pekayon"
                                className="w-full"
                            />
                        </div>
                        <div className="px-5 py-3">
                            <p className="text-xs text-gray-500 text-center">Jalan Pulo Ribung No.12 · Selasa–Minggu 09.00–21.00 WIB</p>
                        </div>
                    </div>
                </div>
            )}

            </div>
        </div>
    );
}

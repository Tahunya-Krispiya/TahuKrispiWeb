import { useState, useEffect } from 'react';
import { LayoutDashboard, LogOut, Truck, Zap, Link as LinkIcon, AlertTriangle, Loader2, BadgePercent, MessageSquare, BarChart3 } from 'lucide-react';
import { DeliveryStatus, LiveStatus, PublicStatus, PromoType, setPublicStatus, OutfitVoteCount, FeedbackMessage, subscribeToOutfitVotes, subscribeToFeedback } from '../lib/firebase';

interface AdminDashboardProps {
    currentStatus: PublicStatus;
    onLogout: () => void;
}

export default function AdminDashboard({ currentStatus, onLogout }: AdminDashboardProps) {
    const [newUrl, setNewUrl] = useState(currentStatus.tiktokLiveUrl);
    const [votes, setVotes] = useState<OutfitVoteCount | null>(null);
    const [feedbacks, setFeedbacks] = useState<FeedbackMessage[]>([]);

    useEffect(() => {
        const unsubVotes = subscribeToOutfitVotes(setVotes);
        const unsubFeedbacks = subscribeToFeedback(setFeedbacks);
        return () => {
            unsubVotes();
            unsubFeedbacks();
        };
    }, []);
    const [isSaving, setIsSaving] = useState(false);
    const [promoType, setPromoType] = useState<PromoType>(currentStatus.promoType ?? 'happy-hour');
    const [promoTitle, setPromoTitle] = useState(currentStatus.promoTitle ?? 'Happy Hour');
    const [promoDescription, setPromoDescription] = useState(currentStatus.promoDescription ?? 'Promo spesial dalam waktu terbatas!');
    const toLocalInput = (timestamp: number) => {
        const date = new Date(timestamp);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date.toISOString().slice(0, 16);
    };
    const [promoStartsAt, setPromoStartsAt] = useState(() => toLocalInput(currentStatus.promoStartsAt ?? Date.now()));
    const [promoEndsAt, setPromoEndsAt] = useState(() => {
        const date = new Date(currentStatus.promoEndsAt ?? Date.now() + 3 * 60 * 60 * 1000);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date.toISOString().slice(0, 16);
    });
    const [promoMediumSmallPrice, setPromoMediumSmallPrice] = useState(currentStatus.promoMediumSmallPrice ?? 18000);
    const [promoLargeMediumPrice, setPromoLargeMediumPrice] = useState(currentStatus.promoLargeMediumPrice ?? 35000);

    // Fungsi untuk mengubah status (Delivery atau Live)
    const handleToggleStatus = async (key: keyof (DeliveryStatus & LiveStatus), value: boolean | string) => {
        setIsSaving(true);
        try {
            const updatedStatus = { ...currentStatus, [key]: value };
            
            // Saat mengaktifkan/menonaktifkan Live, pastikan URL terbaru juga disertakan
            if (key === 'isTikTokLive') {
                 updatedStatus.tiktokLiveUrl = newUrl;
            }

            await setPublicStatus(updatedStatus);
        } catch (error) {
            console.error("Gagal memperbarui status:", error);
            // Menggunakan konsol.log atau modal custom alih-alih alert()
            console.log("Gagal memperbarui status! Cek konsol untuk detail.");
        } finally {
            setIsSaving(false);
        }
    };
    
    // Fungsi untuk memperbarui URL Live TikTok
    const handleUpdateUrl = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await setPublicStatus({
                ...currentStatus,
                tiktokLiveUrl: newUrl,
            });
            console.log("URL berhasil diperbarui.");
        } catch (error) {
            console.error("Gagal memperbarui URL:", error);
            console.log("Gagal memperbarui URL! Cek konsol untuk detail.");
        } finally {
            setIsSaving(false);
        }
    };

    const statusMap: { key: keyof DeliveryStatus, label: string, color: string }[] = [
        { key: 'isGoFoodOnline', label: 'GoFood', color: 'bg-red-500' },
        { key: 'isGrabFoodOnline', label: 'GrabFood', color: 'bg-green-500' },
        { key: 'isShopeeFoodOnline', label: 'ShopeeFood', color: 'bg-orange-500' },
    ];

    const promoPresets: Record<PromoType, { title: string; description: string }> = {
        'happy-hour': { title: 'Happy Hour!', description: 'Harga spesial cuma beberapa jam. Buruan sebelum habis!' },
        'happy-holiday': { title: 'Happy Holiday!', description: 'Liburan makin renyah dengan promo spesial Tahunya Krispiya.' },
        'buy-one-get-one': { title: 'Buy 1 Get 1', description: 'Beli satu, dapat satu lagi. Stok dan waktu terbatas!' },
        custom: { title: 'Promo Spesial', description: 'Ada kejutan spesial untuk kamu hari ini!' },
    };

    const selectPromoType = (type: PromoType) => {
        setPromoType(type);
        setPromoTitle(promoPresets[type].title);
        setPromoDescription(promoPresets[type].description);
    };

    const savePromo = async (isActive: boolean) => {
        setIsSaving(true);
        try {
            await setPublicStatus({
                ...currentStatus,
                isPromoActive: isActive,
                promoType,
                promoTitle,
                promoDescription,
                promoStartsAt: new Date(promoStartsAt).getTime(),
                promoEndsAt: new Date(promoEndsAt).getTime(),
                promoMediumSmallPrice,
                promoLargeMediumPrice,
            });
        } catch (error) {
            console.error('Gagal memperbarui promo:', error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            {/* Header Dashboard */}
            <header className="bg-white shadow-lg p-4 flex justify-between items-center sticky top-0 z-10">
                <div className="flex items-center space-x-2">
                    <LayoutDashboard className="w-6 h-6 text-orange-500" />
                    <h1 className="text-xl font-bold text-gray-800">Panel Kontrol Tahu Krispiya</h1>
                </div>
                <button
                    onClick={onLogout}
                    className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 transition duration-150"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar</span>
                </button>
            </header>

            {/* Konten Utama Dashboard */}
            <main className="flex-1 p-6 md:p-10">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Manajemen Status Publik</h2>
                
                {isSaving && (
                     <div className="fixed top-0 left-0 w-full bg-yellow-400 p-3 text-center text-sm font-medium flex items-center justify-center space-x-2 z-50">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Menyimpan perubahan...</span>
                    </div>
                )}

                <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
                    <div className="flex items-center space-x-3 mb-5">
                        <BadgePercent className="w-6 h-6 text-red-600" />
                        <div><h3 className="text-xl font-semibold text-gray-800">Flash Sale & Promo</h3><p className="text-sm text-gray-500">Atur promo dan countdown yang tampil di atas menu.</p></div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        <label className="space-y-1"><span className="text-sm font-medium text-gray-700">Jenis promo</span><select value={promoType} onChange={(event) => selectPromoType(event.target.value as PromoType)} className="w-full rounded-lg border p-2.5"><option value="happy-hour">Happy Hour</option><option value="happy-holiday">Happy Holiday</option><option value="buy-one-get-one">Buy 1 Get 1</option><option value="custom">Custom</option></select></label>
                        <div className="hidden md:block" />
                        <label className="space-y-1"><span className="text-sm font-medium text-gray-700">Mulai dari</span><input type="datetime-local" value={promoStartsAt} onChange={(event) => setPromoStartsAt(event.target.value)} className="w-full rounded-lg border p-2.5" /></label>
                        <label className="space-y-1"><span className="text-sm font-medium text-gray-700">Sampai</span><input type="datetime-local" min={promoStartsAt} value={promoEndsAt} onChange={(event) => setPromoEndsAt(event.target.value)} className="w-full rounded-lg border p-2.5" /></label>
                        <label className="space-y-1 md:col-span-2"><span className="text-sm font-medium text-gray-700">Judul promo</span><input value={promoTitle} onChange={(event) => setPromoTitle(event.target.value)} className="w-full rounded-lg border p-2.5" maxLength={60} /></label>
                        <label className="space-y-1 md:col-span-2"><span className="text-sm font-medium text-gray-700">Deskripsi</span><textarea value={promoDescription} onChange={(event) => setPromoDescription(event.target.value)} className="min-h-20 w-full rounded-lg border p-2.5" maxLength={160} /></label>
                        {promoType === 'buy-one-get-one' && <>
                            <label className="space-y-1 rounded-xl border border-orange-200 bg-orange-50 p-4"><span className="text-sm font-bold text-orange-900">Medium Pack + bonus Small Pack</span><span className="block text-xs text-orange-700">Harga normal gabungan Rp28.000</span><div className="flex items-center rounded-lg border bg-white"><span className="px-3 text-sm font-semibold">Rp</span><input type="number" min="1000" step="1000" value={promoMediumSmallPrice} onChange={(event) => setPromoMediumSmallPrice(Number(event.target.value))} className="w-full rounded-r-lg p-2.5 outline-none" /></div></label>
                            <label className="space-y-1 rounded-xl border border-orange-200 bg-orange-50 p-4"><span className="text-sm font-bold text-orange-900">Large Pack + bonus Medium Pack</span><span className="block text-xs text-orange-700">Harga normal gabungan Rp53.000</span><div className="flex items-center rounded-lg border bg-white"><span className="px-3 text-sm font-semibold">Rp</span><input type="number" min="1000" step="1000" value={promoLargeMediumPrice} onChange={(event) => setPromoLargeMediumPrice(Number(event.target.value))} className="w-full rounded-r-lg p-2.5 outline-none" /></div></label>
                        </>}
                    </div>
                    <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                        <button onClick={() => savePromo(true)} disabled={isSaving || !promoStartsAt || !promoEndsAt || new Date(promoEndsAt).getTime() <= new Date(promoStartsAt).getTime()} className="rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white disabled:opacity-50">Aktifkan & Simpan Promo</button>
                        <button onClick={() => savePromo(false)} disabled={isSaving} className="rounded-lg border border-gray-300 px-5 py-2.5 font-semibold text-gray-700 disabled:opacity-50">Nonaktifkan Promo</button>
                        <span className={`self-center rounded-full px-3 py-1 text-xs font-bold ${currentStatus.isPromoActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>{currentStatus.isPromoActive ? 'PROMO AKTIF' : 'PROMO NONAKTIF'}</span>
                    </div>
                </div>

                {/* --- KONTROL LIVE TIKTOK --- */}
                <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
                    <div className="flex items-center space-x-3 mb-4">
                        <Zap className="w-6 h-6 text-red-600" />
                        <h3 className="text-xl font-semibold text-gray-800">Status TikTok LIVE</h3>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-end md:space-x-4 mb-4">
                         {/* Input URL */}
                        <form onSubmit={handleUpdateUrl} className="flex-grow mb-3 md:mb-0">
                            <label className="block text-sm font-medium text-gray-700 mb-1">URL Live TikTok</label>
                            <div className="flex">
                                <span className="inline-flex items-center px-3 border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm rounded-l-lg">
                                    <LinkIcon className="w-4 h-4" />
                                </span>
                                <input
                                    type="url"
                                    value={newUrl}
                                    onChange={(e) => setNewUrl(e.target.value)}
                                    className="flex-1 block w-full rounded-none rounded-r-lg border border-gray-300 p-2 text-gray-900 focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                    placeholder="Masukkan link live TikTok saat ini..."
                                    required
                                />
                                <button type="submit" disabled={isSaving} className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:bg-gray-400">
                                    Simpan URL
                                </button>
                            </div>
                        </form>

                        {/* Tombol Toggle LIVE */}
                        <div className="flex-shrink-0">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status Live</label>
                            <button
                                onClick={() => handleToggleStatus('isTikTokLive', !currentStatus.isTikTokLive)}
                                className={`w-full md:w-auto px-6 py-2 rounded-lg text-white font-semibold transition ${currentStatus.isTikTokLive ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                                disabled={isSaving}
                            >
                                <div className="flex items-center space-x-2 justify-center">
                                    <Zap className="w-5 h-5" />
                                    <span>{currentStatus.isTikTokLive ? 'LIVE AKTIF' : 'NONAKTIFKAN LIVE'}</span>
                                </div>
                            </button>
                        </div>
                    </div>
                    
                    <p className="text-sm text-gray-500 mt-2 flex items-start space-x-1">
                        <AlertTriangle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                        <span>Perubahan yang Anda buat di sini akan langsung terlihat di halaman utama.</span>
                    </p>
                </div>

                {/* --- KONTROL STATUS DELIVERY --- */}
                <div className="bg-white p-6 rounded-xl shadow-lg mb-8 border border-gray-200">
                    <div className="flex items-center space-x-3 mb-4">
                        <Truck className="w-6 h-6 text-blue-600" />
                        <h3 className="text-xl font-semibold text-gray-800">Status Layanan Pengiriman</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {statusMap.map(({ key, label, color }) => (
                            <div key={key} className="p-4 border rounded-lg shadow-sm flex flex-col items-center justify-between">
                                <span className={`text-lg font-bold text-gray-800 mb-3`}>{label}</span>
                                
                                <p className={`font-semibold mb-3 ${currentStatus[key] ? 'text-green-600' : 'text-red-600'}`}>
                                    {currentStatus[key] ? 'Status: ONLINE' : 'Status: OFFLINE'}
                                </p>

                                <button
                                    onClick={() => handleToggleStatus(key, !currentStatus[key])}
                                    className={`w-full py-2 text-sm font-medium rounded-lg transition disabled:opacity-50 ${currentStatus[key] ? 'bg-red-500 hover:bg-red-600 text-white' : 'bg-green-500 hover:bg-green-600 text-white'}`}
                                    disabled={isSaving}
                                >
                                    {currentStatus[key] ? 'Matikan' : 'Aktifkan'}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* --- VOTING & FEEDBACK DASHBOARD --- */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Hasil Voting */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                        <div className="flex items-center space-x-3 mb-4">
                            <BarChart3 className="w-6 h-6 text-purple-600" />
                            <h3 className="text-xl font-semibold text-gray-800">Hasil Polling Outfit Maskot</h3>
                        </div>
                        {votes ? (
                            <div className="space-y-3">
                                {[
                                    { id: 'koki', label: '👨‍🍳 Koki', val: votes.koki || 0 },
                                    { id: 'penyihir', label: '🧙‍♂️ Penyihir', val: votes.penyihir || 0 },
                                    { id: 'goku', label: '🥋 Goku', val: votes.goku || 0 },
                                    { id: 'mario', label: '🍄 Mario', val: votes.mario || 0 },
                                    { id: 'koboy', label: '🤠 Koboy', val: votes.koboy || 0 },
                                    { id: 'muslim', label: '🧕 Muslim', val: votes.muslim || 0 },
                                    { id: 'bajaklaut', label: '🏴‍☠️ Bajak Laut', val: votes.bajaklaut || 0 }
                                ].sort((a, b) => b.val - a.val).map(opt => {
                                    const total = Object.values(votes).reduce((a,b)=>a+b,0);
                                    const percentage = total > 0 ? Math.round((opt.val / total) * 100) : 0;
                                    return (
                                        <div key={opt.id} className="relative overflow-hidden rounded-lg border bg-gray-50 p-3">
                                            <div className="absolute inset-y-0 left-0 bg-purple-200 transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                                            <div className="relative z-10 flex justify-between">
                                                <span className="font-medium">{opt.label}</span>
                                                <span className="font-bold text-purple-700">{opt.val} suara ({percentage}%)</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-sm">Memuat data polling...</p>
                        )}
                    </div>

                    {/* Kritik & Saran */}
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 flex flex-col">
                        <div className="flex items-center space-x-3 mb-4">
                            <MessageSquare className="w-6 h-6 text-teal-600" />
                            <h3 className="text-xl font-semibold text-gray-800">Kritik & Saran Masuk</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto max-h-[400px] space-y-3 pr-2">
                            {feedbacks.length > 0 ? feedbacks.map((fb, i) => (
                                <div key={i} className="p-3 bg-gray-50 border rounded-lg">
                                    <p className="text-gray-800 text-sm mb-2 whitespace-pre-wrap">{fb.message}</p>
                                    <p className="text-xs text-gray-400 text-right">
                                        {new Date(fb.timestamp).toLocaleString('id-ID')}
                                    </p>
                                </div>
                            )) : (
                                <p className="text-gray-500 text-sm italic">Belum ada pesan masuk.</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

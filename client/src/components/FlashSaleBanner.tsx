import { useEffect, useMemo, useState } from "react";
import { Clock3, Gift, ShoppingCart, Sparkles, Zap } from "lucide-react";
import type { PublicStatus } from "@/lib/firebase";
import type { Product } from "@shared/schema";
import mediumImage from "@assets/compressed/IMG-20250911-WA0021_1763095354116.webp";
import largeImage from "@assets/compressed/IMG-20250911-WA0027_1763095354130.webp";

const promoLabels = {
  "happy-hour": "Happy Hour",
  "happy-holiday": "Happy Holiday",
  "buy-one-get-one": "Buy 1 Get 1",
  custom: "Promo Spesial",
};

interface FlashSaleBannerProps {
  status?: PublicStatus;
  onBuyNow: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export default function FlashSaleBanner({ status, onBuyNow, onAddToCart }: FlashSaleBannerProps) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const startsAt = status?.promoStartsAt ?? 0;
  const endsAt = status?.promoEndsAt ?? 0;
  const isScheduled = status?.isPromoActive === true && startsAt > now && endsAt > startsAt;
  const isActive = status?.isPromoActive === true && now >= startsAt && endsAt > now;
  const targetTime = isScheduled ? startsAt : endsAt;
  const remaining = Math.max(0, targetTime - now);
  const totalSeconds = Math.floor(remaining / 1000);
  const blocks = [
    ["Hari", Math.floor(totalSeconds / 86400)],
    ["Jam", Math.floor((totalSeconds % 86400) / 3600)],
    ["Menit", Math.floor((totalSeconds % 3600) / 60)],
    ["Detik", totalSeconds % 60],
  ] as const;

  const bogoProducts = useMemo<Product[]>(() => [
    {
      id: "promo-medium-small",
      name: "Medium Pack + Bonus Small Pack",
      size: "8 pcs + bonus 4 pcs",
      pieces: 12,
      price: status?.promoMediumSmallPrice ?? 18000,
      image: mediumImage,
      description: "Beli Medium Pack, dapat Small Pack.",
      type: "paket",
    },
    {
      id: "promo-large-medium",
      name: "Large Pack + Bonus Medium Pack",
      size: "18 pcs + bonus 8 pcs",
      pieces: 26,
      price: status?.promoLargeMediumPrice ?? 35000,
      image: largeImage,
      description: "Beli Large Pack, dapat Medium Pack.",
      type: "paket",
    },
  ], [status?.promoMediumSmallPrice, status?.promoLargeMediumPrice]);

  if (!isActive && !isScheduled) {
    return (
      <section className="mx-auto mt-8 max-w-7xl px-4" aria-label="Promo akan datang">
        <div className="relative overflow-hidden rounded-2xl border border-dashed border-orange-300 bg-gradient-to-r from-orange-50 to-yellow-50 p-5 text-center">
          <Sparkles className="mx-auto mb-2 h-6 w-6 text-orange-500" />
          <p className="font-bold text-orange-900">Ada sesuatu yang lagi kami goreng...</p>
          <p className="mt-1 text-sm text-orange-700">Promo rahasia berikutnya bisa muncul kapan saja dan berkali-kali lipat. Jangan jauh-jauh ya 👀</p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto mt-8 max-w-7xl px-4" aria-label={isScheduled ? "Promo terjadwal" : "Flash sale aktif"}>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-700 via-red-600 to-orange-500 p-5 text-white shadow-xl md:p-6">
        <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10" />
        <div className="relative grid gap-5 md:grid-cols-[1fr_auto] md:items-center">
          <div><span className="inline-flex items-center gap-2 rounded-full bg-yellow-300 px-3 py-1 text-xs font-black uppercase tracking-wider text-red-800"><Zap className="h-3.5 w-3.5 fill-current" /> {isScheduled ? "Segera Hadir" : "Flash Sale"} · {promoLabels[status!.promoType] ?? "Promo Spesial"}</span><h2 className="mt-3 text-2xl font-black md:text-3xl">{status?.promoTitle || promoLabels[status!.promoType]}</h2><p className="mt-1 text-sm text-red-50 md:text-base">{isScheduled ? "Promo sudah dijadwalkan. Siap-siap sebelum dimulai!" : status?.promoDescription || "Buruan pesan sebelum waktunya habis!"}</p></div>
          <div><p className="mb-2 flex items-center justify-center gap-2 text-xs font-bold uppercase"><Clock3 className="h-4 w-4" /> {isScheduled ? "Dimulai dalam" : "Berakhir dalam"}</p><div className="flex justify-center gap-2">{blocks.map(([label, value]) => <div key={label} className="min-w-14 rounded-lg bg-black/25 p-2 text-center"><span className="block text-xl font-black tabular-nums">{String(value).padStart(2, "0")}</span><span className="text-[10px] uppercase">{label}</span></div>)}</div></div>
        </div>

        {isActive && status?.promoType === "buy-one-get-one" && (
          <div className="relative mt-5 grid gap-4 md:grid-cols-2">
            {bogoProducts.map((product) => (
              <article key={product.id} className="grid overflow-hidden rounded-xl bg-white text-gray-900 shadow-lg sm:grid-cols-[150px_1fr]">
                <img src={product.image} alt={product.name} className="h-44 w-full object-cover sm:h-full" />
                <div className="flex flex-col p-4"><span className="w-fit rounded-full bg-red-100 px-2 py-1 text-[10px] font-black uppercase text-red-700">Buy 1 Get 1</span><h3 className="mt-2 font-black leading-tight">{product.name}</h3><p className="mt-1 text-xs text-gray-500">{product.size}</p><p className="mt-2 text-xl font-black text-red-600">Rp {product.price.toLocaleString("id-ID")}</p><div className="mt-auto flex gap-2 pt-3"><button onClick={() => onBuyNow(product)} className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-sm font-bold text-white">Beli Sekarang</button><button onClick={() => onAddToCart(product)} className="rounded-lg border border-red-200 p-2 text-red-600" aria-label={`Tambah ${product.name} ke keranjang`}><ShoppingCart className="h-5 w-5" /></button></div></div>
              </article>
            ))}
          </div>
        )}
        <div className="relative mt-4 flex items-center gap-2 text-xs font-semibold text-yellow-100"><Gift className="h-4 w-4" /> Promo terbatas—syarat dan ketentuan berlaku.</div>
      </div>
    </section>
  );
}

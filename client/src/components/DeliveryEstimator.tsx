import { useMemo, useState } from "react";
import { Calculator, Clock3, ExternalLink, Loader2, LocateFixed, MapPin, Moon, Sparkles, Sun } from "lucide-react";

const STORE_ADDRESS = "Jalan Pulo Ribung No.12";
const STORE_NAME = "Tahunya Krispiya Pekayon";
const STORE_LOCATION = { latitude: -6.268527, longitude: 106.978001 };
const STORE_MAPS_URL = "https://maps.app.goo.gl/RoVegza696jarKxq7";
const platforms = [
  { name: "GoFood", base: 10000, perKm: 2200, color: "text-red-600" },
  { name: "GrabFood", base: 12000, perKm: 2100, color: "text-green-600" },
  { name: "Shopee Instant", base: 9200, perKm: 1800, color: "text-orange-600" },
];

const roundUp = (value: number) => Math.ceil(value / 1000) * 1000;
const rupiah = (value: number) => `Rp${value.toLocaleString("id-ID")}`;

function distanceInKm(latitude: number, longitude: number) {
  const earthRadius = 6371;
  const toRadians = (degree: number) => degree * Math.PI / 180;
  const latitudeDelta = toRadians(latitude - STORE_LOCATION.latitude);
  const longitudeDelta = toRadians(longitude - STORE_LOCATION.longitude);
  const a = Math.sin(latitudeDelta / 2) ** 2
    + Math.cos(toRadians(STORE_LOCATION.latitude)) * Math.cos(toRadians(latitude))
    * Math.sin(longitudeDelta / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function DeliveryEstimator() {
  const [destination, setDestination] = useState("");
  const [distance, setDistance] = useState(10);
  const [period, setPeriod] = useState<"day" | "night">("day");
  const [hasVoucher, setHasVoucher] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [locationMessage, setLocationMessage] = useState("");

  const estimates = useMemo(() => {
    const nightCharge = period === "night" ? 0 : -3000;
    const voucherDiscount = hasVoucher ? 6000 : 0;
    return platforms
      .map((platform) => ({
        ...platform,
        price: Math.max(5000, roundUp(platform.base + platform.perKm * distance + nightCharge - voucherDiscount)),
      }))
      .sort((a, b) => a.price - b.price);
  }, [distance, period, hasVoucher]);

  const recommended = estimates[0];
  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage("Browser ini tidak mendukung deteksi lokasi.");
      return;
    }
    setIsLocating(true);
    setLocationMessage("");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const directDistance = distanceInKm(coords.latitude, coords.longitude);
        const estimatedRoadDistance = Math.max(1, Math.round(directDistance * 1.25));
        setDistance(Math.min(60, estimatedRoadDistance));
        setDestination("Lokasi saya");
        setLocationMessage(`Lokasi ditemukan. Jarak garis lurus ${directDistance.toFixed(1)} km; estimasi rute ${estimatedRoadDistance} km.`);
        setIsLocating(false);
      },
      (error) => {
        const message = error.code === error.PERMISSION_DENIED
          ? "Izin lokasi ditolak. Izinkan lokasi pada browser lalu coba lagi."
          : "Lokasi belum dapat ditemukan. Pastikan GPS aktif lalu coba lagi.";
        setLocationMessage(message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 },
    );
  };

  return (
    <section className="py-16 md:py-20" aria-labelledby="delivery-estimator-title">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="mb-8 text-center">
          <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-orange-100 text-orange-600"><Calculator className="h-6 w-6" /></span>
          <h2 id="delivery-estimator-title" className="text-3xl font-bold">Simulasi Biaya Pengiriman</h2>
          <p className="mt-2 text-muted-foreground">Atur jarak, waktu, dan voucher untuk mendapatkan gambaran ongkir.</p>
        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm md:p-7">
          <div className="mb-6 flex flex-col justify-between gap-3 rounded-xl bg-orange-50 p-4 sm:flex-row sm:items-center">
            <div className="flex items-start gap-3"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" /><div><p className="text-xs font-semibold uppercase text-orange-700">Lokasi toko</p><p className="font-semibold">{STORE_NAME}</p><p className="text-sm text-orange-800/70">{STORE_ADDRESS}</p></div></div>
            <a href={STORE_MAPS_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold text-orange-700">Buka Maps <ExternalLink className="h-4 w-4" /></a>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2"><span className="text-sm font-semibold">Lokasi tujuan</span><div className="flex gap-2"><input value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="Contoh: Jakarta Barat" className="h-11 min-w-0 flex-1 rounded-lg border bg-background px-3 outline-none focus:ring-2 focus:ring-orange-500" /><button type="button" onClick={useCurrentLocation} disabled={isLocating} className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-orange-600 px-3 font-semibold text-white disabled:opacity-60" title="Gunakan lokasi perangkat">{isLocating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}<span className="hidden md:inline">Lokasi Saya</span></button></div>{locationMessage && <p className="text-xs leading-relaxed text-muted-foreground">{locationMessage}</p>}</div>
            <div className="space-y-2"><div className="flex justify-between text-sm font-semibold"><span>Perkiraan jarak rute</span><span className="text-orange-600">{distance} km</span></div><input type="range" min="1" max="60" value={distance} onChange={(event) => { setDistance(Number(event.target.value)); setLocationMessage(""); }} className="h-11 w-full accent-orange-600" /><div className="flex justify-between text-xs text-muted-foreground"><span>1 km</span><span>60 km</span></div></div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div><p className="mb-2 flex items-center gap-2 text-sm font-semibold"><Clock3 className="h-4 w-4" /> Waktu pengiriman</p><div className="grid grid-cols-2 gap-2"><button onClick={() => setPeriod("day")} className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold ${period === "day" ? "border-orange-500 bg-orange-50 text-orange-700" : ""}`}><Sun className="h-4 w-4" /> Siang</button><button onClick={() => setPeriod("night")} className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-semibold ${period === "night" ? "border-indigo-500 bg-indigo-50 text-indigo-700" : ""}`}><Moon className="h-4 w-4" /> Malam</button></div></div>
            <label className="flex cursor-pointer items-center justify-between rounded-lg border p-4"><span><span className="block text-sm font-semibold">Punya voucher?</span><span className="text-xs text-muted-foreground">Simulasi potongan sekitar Rp6.000</span></span><input type="checkbox" checked={hasVoucher} onChange={(event) => setHasVoucher(event.target.checked)} className="h-5 w-5 accent-orange-600" /></label>
          </div>

          {period === "night" && !hasVoucher && distance >= 30 && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-orange-300 bg-orange-50 p-4"><Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-orange-600" /><div><p className="font-bold text-orange-800">Highlight pengiriman malam</p><p className="text-sm text-orange-700">Tanpa voucher pada jarak sekitar {distance} km, Shopee Instant menjadi gambaran paling hemat. Pada 36 km estimasinya sekitar Rp74.000.</p></div></div>
          )}

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {estimates.map((platform) => {
              const isRecommended = platform.name === recommended.name;
              return <div key={platform.name} className={`relative rounded-xl border p-4 ${isRecommended ? "border-orange-500 bg-orange-50 ring-1 ring-orange-500" : ""}`}>{isRecommended && <span className="absolute -top-3 right-3 rounded-full bg-orange-600 px-3 py-1 text-xs font-bold text-white">Recommended</span>}<p className={`font-bold ${platform.color}`}>{platform.name}</p><p className="mt-2 text-2xl font-bold">{rupiah(platform.price)}</p><p className="mt-1 text-xs text-muted-foreground">Estimasi {distance} km · {period === "night" ? "malam" : "siang"}{hasVoucher ? " · dengan voucher" : " · tanpa voucher"}</p></div>;
            })}
          </div>
          <p className="mt-5 text-xs leading-relaxed text-muted-foreground">* Simulasi ini hanya untuk gambaran, bukan tarif resmi. Harga aktual berubah mengikuti rute, jam sibuk, cuaca, promo, dan kebijakan aplikasi. Selalu cek harga final sebelum memesan.</p>
        </div>
      </div>
    </section>
  );
}

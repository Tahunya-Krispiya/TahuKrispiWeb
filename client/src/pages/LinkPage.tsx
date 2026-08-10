import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import logoImg from "@assets/1763097449392_1763097461717.png";
import img1 from "@assets/compressed/IMG-20250911-WA0018_1763095354099.webp";
import img2 from "@assets/compressed/IMG-20250911-WA0021_1763095354116.webp";
import img3 from "@assets/compressed/IMG-20250911-WA0027_1763095354130.webp";
import { submitOutfitVote, subscribeToOutfitVotes, OutfitVoteCount, submitFeedback, subscribeToStatus, PublicStatus } from "../lib/firebase";

// ===== KONFIGURASI LINK (ganti sesuai kebutuhan) =====
const TIKTOK_HANDLE = "@ajengandhika_";
const TIKTOK_URL = "https://www.tiktok.com/@ajengandhika_";
const WEB_URL = "/"; // internal
const VOTING_URL = "https://forms.gle/contoh-voting"; // ganti link voting asli
const QRIS_URL = "/payment"; // internal
const GMAPS_URL = "https://maps.app.goo.gl/tahukrispi"; // ganti link GMaps asli
const WHATSAPP_NUMBER = "6281288362512";

const LOCATION = {
  name: "Jl. Pulo Ribung No.12",
  detail: "Pekayon Jaya, Bekasi Selatan",
  jam: "Selasa - Minggu • 09.00 – 21.00 WIB",
};

// ===== ICONS =====
const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.36 6.36 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.73a8.18 8.18 0 0 0 4.78 1.53V6.79a4.86 4.86 0 0 1-1.01-.1Z"/>
  </svg>
);

const GlobeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const VoteIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <path d="M9 11l3 3L22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>
);

const QrisIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    <rect x="5" y="5" width="3" height="3" fill="currentColor"/>
    <rect x="16" y="5" width="3" height="3" fill="currentColor"/>
    <rect x="16" y="16" width="3" height="3" fill="currentColor"/>
    <rect x="5" y="16" width="3" height="3" fill="currentColor"/>
  </svg>
);

const MapPinIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5 text-orange-400">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

const WAIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
);

const ChevronRightIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" className="w-3.5 h-3.5">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

const ExternalLinkIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5 text-white/70">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
    <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
  </svg>
);

// ===== LINK BUTTON =====
interface LinkButtonProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  isInternal?: boolean;
  gradient: string;
  iconBg: string;
  delay?: number;
}

function LinkButton({ href, icon, label, sublabel, isInternal, gradient, iconBg, delay = 0 }: LinkButtonProps) {
  const [visible, setVisible] = useState(false);
  const [pressed, setPressed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const inner = (
    <div
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      onMouseLeave={() => setPressed(false)}
      onTouchStart={() => setPressed(true)}
      onTouchEnd={() => setPressed(false)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible
          ? pressed ? "scale(0.97)" : "scale(1)"
          : "translateY(18px)",
        transition: `opacity 0.4s ease ${delay}ms, transform 0.4s cubic-bezier(0.34,1.56,0.64,1) ${delay}ms`,
      }}
      className={`relative overflow-hidden rounded-2xl cursor-pointer group ${gradient} shadow-lg hover:shadow-xl border border-white/10`}
    >
      {/* Shimmer on hover */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none"
        style={{ background: "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)" }}
      />
      <div className="flex items-center px-4 py-4 gap-4">
        <div className={`flex-shrink-0 w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center`}>
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-white font-semibold text-[15px]">{label}</p>
          {sublabel && <p className="text-white/60 text-xs mt-0.5">{sublabel}</p>}
        </div>
        <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors">
          <ChevronRightIcon />
        </div>
      </div>
    </div>
  );

  if (isInternal) return <Link to={href} className="block">{inner}</Link>;
  return <a href={href} target="_blank" rel="noopener noreferrer" className="block">{inner}</a>;
}

// ===== PRODUCT PREVIEW =====
function ProductPreview() {
  const menus = [
    { name: "Small", price: "Rp 10K", desc: "Isi 4pcs + 25ml sambal", img: img1 },
    { name: "Medium", price: "Rp 18K", desc: "Isi 8pcs + 35ml sambal", img: img2 },
    { name: "Large", price: "Rp 35K", desc: "Isi 18pcs + 2 cup 35ml", img: img3 },
  ];

  return (
    <div className="mt-2 w-full">
      <p className="text-center text-[10px] uppercase tracking-widest text-white/35 font-medium mb-3">🔥 Highlight Produk</p>
      
      <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {menus.map((item, idx) => (
          <div key={idx} className="snap-center shrink-0 w-36 rounded-2xl border border-white/10 bg-white/5 overflow-hidden backdrop-blur-sm flex flex-col">
            <div className="h-32 w-full overflow-hidden">
              <img src={item.img} alt={item.name} className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="p-3 text-center flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-white font-bold text-sm">{item.name}</h3>
                <p className="text-white/60 text-[10px] mt-0.5 leading-tight">{item.desc}</p>
              </div>
              <p className="text-orange-400 font-black text-sm mt-2">{item.price}</p>
            </div>
          </div>
        ))}
      </div>

      <Link to={WEB_URL} className="block w-full mt-1 text-center py-2.5 rounded-xl border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 text-sm font-medium transition-colors">
        Pesan Sesuai Budget 🛒
      </Link>
      
      <style>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
    </div>
  );
}

// ===== OUTFIT VOTING =====
const VOTING_OPTIONS = [
  { id: 'koki', label: '👨‍🍳 Koki' },
  { id: 'penyihir', label: '🧙‍♂️ Penyihir' },
  { id: 'goku', label: '🥋 Goku' },
  { id: 'mario', label: '🍄 Mario' },
  { id: 'koboy', label: '🤠 Koboy' },
  { id: 'muslim', label: '🧕 Muslim' },
  { id: 'bajaklaut', label: '🏴‍☠️ Bajak Laut' },
];

function OutfitVoting() {
  const [votedId, setVotedId] = useState<string | null>(null);
  const [votes, setVotes] = useState<OutfitVoteCount | null>(null);
  
  useEffect(() => {
    // Cek LocalStorage untuk hari ini
    const today = new Date().toISOString().split('T')[0];
    const savedVote = localStorage.getItem(`voted_outfit_${today}`);
    if (savedVote) setVotedId(savedVote);

    // Subsribe Firebase
    const unsub = subscribeToOutfitVotes((data) => {
      setVotes(data);
    });
    return () => unsub();
  }, []);

  const handleVote = async (id: string) => {
    if (votedId) return; 
    setVotedId(id);
    const today = new Date().toISOString().split('T')[0];
    localStorage.setItem(`voted_outfit_${today}`, id);
    try {
      await submitOutfitVote(id);
    } catch (err) {
      console.error("Gagal mengirim vote ke Firebase (kemungkinan masalah rules/koneksi), tapi tersimpan lokal:", err);
    }
  };

  const totalVotes = votes ? Object.values(votes).reduce((a, b) => a + b, 0) : 0;

  return (
    <div className="mt-2 w-full">
      <p className="text-center text-[10px] uppercase tracking-widest text-white/35 font-medium mb-3">🗳️ Polling Outfit Maskot</p>
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4">
        <p className="text-white font-medium text-sm mb-3 text-center">Bagusnya maskot pakai outfit apa nih?</p>
        <div className="flex flex-col gap-2">
          {VOTING_OPTIONS.map(opt => {
            const isVoted = votedId === opt.id;
            const showResult = votedId !== null;
            
            const rawVotes = votes ? (votes[opt.id as keyof OutfitVoteCount] || 0) : 0;
            const actualVotes = (isVoted && rawVotes === 0) ? 1 : rawVotes;
            const myTotal = totalVotes === 0 && isVoted ? 1 : totalVotes;
            
            const percentage = myTotal > 0 ? Math.round((actualVotes / myTotal) * 100) : 0;
            
            return (
              <button
                key={opt.id}
                onClick={() => handleVote(opt.id)}
                disabled={showResult}
                className={`relative overflow-hidden rounded-xl border transition-all duration-300 w-full text-left
                  ${showResult ? 'border-transparent bg-white/5 cursor-default' : 'border-white/10 bg-white/5 hover:bg-white/10'}
                  ${isVoted ? 'ring-1 ring-orange-500' : ''}
                `}
              >
                {showResult && (
                  <div 
                    className={`absolute inset-0 bg-gradient-to-r ${isVoted ? 'from-orange-500/30 to-amber-500/30' : 'from-white/10 to-white/5'}`}
                    style={{
                      width: `${percentage}%`,
                      transition: 'width 1s cubic-bezier(0.34, 1.56, 0.64, 1)'
                    }}
                  />
                )}
                
                <div className="relative z-10 flex items-center justify-between px-3 py-2.5">
                  <span className={`text-sm font-medium ${isVoted ? 'text-orange-400' : 'text-white/80'}`}>
                    {opt.label}
                  </span>
                  {showResult && (
                    <span className={`text-xs font-bold ${isVoted ? 'text-orange-400' : 'text-white/50'}`}>
                      {percentage}%
                    </span>
                  )}
                </div>
              </button>
            )
          })}
        </div>
        {!votedId && <p className="text-white/40 text-[10px] text-center mt-3">Klik salah satu untuk melihat hasil! (Bisa vote tiap hari)</p>}
        {votedId && <p className="text-orange-400 text-[10px] text-center mt-3 animate-fade-in">Terima kasih atas suaramu hari ini! 🎉</p>}
      </div>
    </div>
  );
}

// ===== FEEDBACK FORM =====
function FeedbackForm() {
  const [msg, setMsg] = useState("");
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msg.trim()) return;
    setStatus("loading");
    try {
      await submitFeedback(msg);
      setStatus("success");
      setMsg("");
      setTimeout(() => setStatus("idle"), 3000);
    } catch (err) {
      console.error("Gagal mengirim saran:", err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    }
  };

  return (
    <div className="mt-2 w-full">
      <p className="text-center text-[10px] uppercase tracking-widest text-white/35 font-medium mb-3">💬 Titip Pesan / Saran</p>
      <form onSubmit={handleSubmit} className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-4 flex flex-col gap-3">
        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          placeholder="Tulis kritik, saran, atau pesan rahasia di sini..."
          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-orange-500/50 resize-none min-h-[80px]"
          disabled={status === "loading" || status === "success"}
        />
        <button
          type="submit"
          disabled={!msg.trim() || status === "loading" || status === "success"}
          className={`w-full py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
            status === "success" ? "bg-green-500/20 text-green-400 border border-green-500/30" :
            status === "error" ? "bg-red-500/20 text-red-400 border border-red-500/30" :
            "bg-white/10 hover:bg-white/15 text-white/90 border border-white/10 disabled:opacity-50"
          }`}
        >
          {status === "loading" ? "Mengirim..." : status === "success" ? "Terkirim! Terima kasih ✨" : status === "error" ? "Gagal mengirim, coba lagi" : "Kirim Pesan"}
        </button>
      </form>
    </div>
  );
}

// ===== PROMO BANNER =====
function PromoBanner() {
  const [status, setStatus] = useState<PublicStatus | null>(null);
  
  useEffect(() => {
    const unsub = subscribeToStatus((data) => setStatus(data));
    return () => unsub();
  }, []);

  if (!status?.isPromoActive) return null;

  return (
    <div className="w-full bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl p-3 shadow-lg shadow-orange-500/20 border border-white/10 relative overflow-hidden mb-2">
      <div className="absolute -right-6 -top-6 w-16 h-16 bg-white/20 rounded-full blur-xl pointer-events-none" />
      <div className="flex items-center gap-3 relative z-10">
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 animate-pulse">
          <span className="text-base">🔥</span>
        </div>
        <div>
          <h3 className="text-white font-bold text-[13px] leading-tight">{status.promoTitle || "Promo Spesial!"}</h3>
          <p className="text-white/80 text-[11px] mt-0.5 leading-tight line-clamp-2">{status.promoDescription || "Yuk cek menu, sedang ada promo aktif!"}</p>
        </div>
      </div>
    </div>
  );
}

// ===== MAIN PAGE =====
export default function LinkPage() {
  const [show, setShow] = useState(false);
  const [isQrisOpen, setIsQrisOpen] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 80); return () => clearTimeout(t); }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes pulseRing { 0%{transform:scale(1);opacity:.6} 100%{transform:scale(1.6);opacity:0} }
        .float-anim { animation: float 3.5s ease-in-out infinite; }
      `}</style>

      <div
        className="min-h-screen w-full flex flex-col items-center"
        style={{
          fontFamily:"'Poppins',sans-serif",
          background:"linear-gradient(160deg,#0d0d0d 0%,#1c1005 45%,#0f0800 100%)",
        }}
      >
        {/* Ambient orbs */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -left-20 w-[480px] h-[480px] rounded-full opacity-[0.18]"
            style={{background:"radial-gradient(circle,#f97316 0%,transparent 70%)"}} />
          <div className="absolute bottom-0 -right-20 w-[380px] h-[380px] rounded-full opacity-[0.12]"
            style={{background:"radial-gradient(circle,#fb923c 0%,transparent 70%)"}} />
        </div>

        <div className="relative z-10 w-full max-w-[380px] mx-auto px-5 pt-14 pb-16 flex flex-col gap-5">

          <div style={{opacity:show?1:0,transform:show?"translateY(0)":"translateY(-16px)",transition:"all 0.5s ease 50ms"}}>
            <PromoBanner />
          </div>

          {/* ===== HEADER ===== */}
          <div style={{opacity:show?1:0,transform:show?"translateY(0)":"translateY(-16px)",transition:"all 0.5s ease 100ms"}}
            className="flex flex-col items-center text-center mb-1"
          >
            {/* Avatar */}
            <div className="relative mb-5 float-anim">
              <div className="absolute inset-[-4px] rounded-full opacity-60"
                style={{animation:"pulseRing 2s ease-out infinite",border:"2px solid #f97316"}} />
              <div className="absolute inset-[-4px] rounded-full opacity-40"
                style={{animation:"pulseRing 2s ease-out 0.6s infinite",border:"2px solid #f97316"}} />
              <div className="w-24 h-24 rounded-full overflow-hidden border-[2.5px] border-orange-400/60"
                style={{boxShadow:"0 0 32px rgba(249,115,22,0.45)"}}>
                <img src={logoImg} alt="Tahunya Krispi-ya" className="w-full h-full object-cover" />
              </div>
            </div>

            <h1 className="text-white text-xl font-bold leading-snug">Tahunya Krispi-ya! 🔥</h1>
            <div className="mt-1.5 flex flex-col items-center">
              <p className="text-white/80 text-[13px] font-medium tracking-wide">Tahu crispy dengan sambel kalasan</p>
              <p className="text-white/50 text-xs mt-0.5 tracking-wider uppercase">📍 Pekayon, Bekasi Selatan</p>
            </div>

            {/* TikTok badge */}
            <a href={TIKTOK_URL} target="_blank" rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-2 bg-white/10 hover:bg-white/18 border border-white/15 rounded-full px-4 py-1.5 backdrop-blur-sm transition-all duration-200 hover:scale-105 active:scale-95">
              <span className="text-white"><TikTokIcon /></span>
              <span className="text-white/75 text-sm font-medium">{TIKTOK_HANDLE}</span>
            </a>
          </div>

          {/* Divider */}
          <div style={{opacity:show?1:0,transition:"opacity 0.4s ease 250ms"}} className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/15" />
            <span className="text-white/30 text-[10px] uppercase tracking-widest font-medium">Links</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/15" />
          </div>

          {/* ===== BUTTONS ===== */}
          <div className="flex flex-col gap-3">
            <LinkButton
              href={WEB_URL} isInternal
              icon={<span className="text-white"><GlobeIcon /></span>}
              label="Website Utama 🌐"
              sublabel="Menu, pesan online & info lengkap"
              gradient="bg-gradient-to-r from-orange-500 to-amber-500"
              iconBg="bg-white/20"
              delay={200}
            />
            <LinkButton
              href={QRIS_URL} isInternal
              icon={<span className="text-white"><QrisIcon /></span>}
              label="Bayar via QRIS 💳"
              sublabel="Scan & bayar langsung di sini"
              gradient="bg-gradient-to-r from-teal-600 to-cyan-500"
              iconBg="bg-white/20"
              delay={320}
            />
          </div>

          {/* Divider QRIS */}
          <div style={{opacity:show?1:0,transition:"opacity 0.4s ease 350ms"}} className="flex items-center gap-3 mt-1">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/15" />
            <span className="text-white/30 text-[10px] uppercase tracking-widest font-medium">QRIS</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/15" />
          </div>

          {/* ===== QRIS CARD ===== */}
          <div style={{opacity:show?1:0,transform:show?"translateY(0)":"translateY(16px)",transition:"all 0.5s ease 380ms"}} className="flex flex-col items-center w-full">
            <p className="text-center text-[10px] uppercase tracking-widest text-white/35 font-medium mb-3">💳 Pembayaran</p>
            <div 
              className="cursor-pointer hover:scale-[1.02] transition-transform duration-300 relative group w-full"
              onClick={() => setIsQrisOpen(true)}
            >
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm flex justify-center">
                <img src="/images/qris.jpeg" alt="QRIS" className="w-full max-w-[200px] h-auto object-contain rounded-xl shadow-lg" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                  <span className="text-white text-[11px] font-bold tracking-wider uppercase bg-black/60 px-4 py-2 rounded-full border border-white/20 backdrop-blur-sm">🔍 Perbesar QRIS</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{opacity:show?1:0,transform:show?"translateY(0)":"translateY(16px)",transition:"all 0.5s ease 400ms"}}>
            <ProductPreview />
          </div>
          
          <div style={{opacity:show?1:0,transform:show?"translateY(0)":"translateY(16px)",transition:"all 0.5s ease 500ms"}}>
            <OutfitVoting />
          </div>

          <div style={{opacity:show?1:0,transform:show?"translateY(0)":"translateY(16px)",transition:"all 0.5s ease 550ms"}}>
            <FeedbackForm />
          </div>

          {/* Divider */}
          <div style={{opacity:show?1:0,transition:"opacity 0.4s ease 600ms"}} className="flex items-center gap-3">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/15" />
            <span className="text-white/30 text-[10px] uppercase tracking-widest font-medium">Find Us</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/15" />
          </div>

          {/* ===== LOCATION CARD ===== */}
          <div style={{opacity:show?1:0,transform:show?"translateY(0)":"translateY(16px)",transition:"all 0.5s ease 600ms"}}>
            <p className="text-center text-[10px] uppercase tracking-widest text-white/35 font-medium mb-3">📍 Lokasi Jualan</p>

            <a href={GMAPS_URL} target="_blank" rel="noopener noreferrer" className="block group">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 hover:bg-white/8 backdrop-blur-sm transition-all duration-300">
                {/* Map preview */}
                <div className="relative h-28 overflow-hidden"
                  style={{background:"linear-gradient(135deg,#1a2333 0%,#0f1928 100%)"}}>
                  <div className="absolute inset-0 opacity-20"
                    style={{backgroundImage:"linear-gradient(rgba(255,200,100,.25) 1px,transparent 1px),linear-gradient(90deg,rgba(255,200,100,.25) 1px,transparent 1px)",backgroundSize:"28px 28px"}} />
                  {/* Roads */}
                  <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/15" />
                  <div className="absolute top-0 bottom-0 left-[38%] w-[2px] bg-white/10" />
                  <div className="absolute top-0 bottom-0 left-[65%] w-[2px] bg-white/08" />
                  {/* Map pin */}
                  <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-full flex flex-col items-center">
                    <div className="w-9 h-9 rounded-full bg-orange-500 border-2 border-white/90 shadow-[0_4px_15px_rgba(249,115,22,0.6)] flex items-center justify-center">
                      <span className="text-base">🔥</span>
                    </div>
                    <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[9px] border-l-transparent border-r-transparent border-t-orange-500 -mt-0.5" />
                  </div>
                  {/* Badge */}
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 bg-black/50 group-hover:bg-orange-500/80 backdrop-blur-sm rounded-full px-2.5 py-1 transition-colors duration-300">
                    <ExternalLinkIcon />
                    <span className="text-white text-[10px] font-semibold">Buka Maps</span>
                  </div>
                </div>

                {/* Address */}
                <div className="p-4 flex items-start gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-orange-500/20 flex items-center justify-center mt-0.5">
                    <MapPinIcon />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold text-sm">{LOCATION.name}</p>
                    <p className="text-white/55 text-xs mt-0.5">{LOCATION.detail}</p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" style={{animation:"pulse 2s infinite"}} />
                      <span className="text-green-400 text-[11px] font-medium">{LOCATION.jam}</span>
                    </div>
                  </div>
                </div>
              </div>
            </a>

            {/* WhatsApp */}
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=Halo kak, mau tanya soal Tahu Krispi!`}
              target="_blank" rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2.5 py-3 rounded-xl border border-white/10 bg-white/5 hover:bg-green-500/15 hover:border-green-500/35 transition-all duration-300 group cursor-pointer"
            >
              <span className="text-green-400 group-hover:scale-110 transition-transform duration-200"><WAIcon /></span>
              <span className="text-white/65 group-hover:text-white text-sm font-medium transition-colors duration-200">Chat WhatsApp</span>
            </a>
          </div>

          {/* Footer */}
          <div style={{opacity:show?1:0,transition:"opacity 0.4s ease 800ms"}} className="text-center mt-3">
            <p className="text-white/20 text-xs">© {new Date().getFullYear()} Tahunya Krispi-ya</p>
          </div>
        </div>
      </div>

      {/* QRIS Modal */}
      {isQrisOpen && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-5 animate-in fade-in duration-200"
          onClick={() => setIsQrisOpen(false)}
        >
          <div className="relative max-w-[90vw] max-h-[85vh] animate-in zoom-in-95 duration-200">
            <button 
              className="absolute -top-10 -right-2 text-white bg-black/50 hover:bg-black/80 rounded-full w-8 h-8 flex items-center justify-center font-bold transition-colors"
              onClick={(e) => { e.stopPropagation(); setIsQrisOpen(false); }}
            >
              ✕
            </button>
            <img src="/images/qris.jpeg" alt="QRIS Enlarged" className="w-full h-auto max-h-[80vh] object-contain rounded-2xl shadow-2xl border border-white/20" />
          </div>
        </div>
      )}
    </>
  );
}

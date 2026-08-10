import { useState } from "react";
import { Flame, Leaf, ChefHat, Star, ChevronDown, ChevronUp } from "lucide-react";

interface SpiceLevel {
  level: number;
  name: string;
  emoji: string;
  description: string;
  color: string;
  bg: string;
}

const spiceLevels: SpiceLevel[] = [
  {
    level: 1,
    name: "Mild",
    emoji: "🌶️",
    description: "Pedas ringan, cocok buat yang baru kenal sambal atau makan bareng anak kecil",
    color: "text-yellow-600",
    bg: "bg-yellow-50 border-yellow-200",
  },
  {
    level: 2,
    name: "Medium",
    emoji: "🌶️🌶️",
    description: "Pedas standar, cita rasa pas banget buat teman makan tahu crispy",
    color: "text-orange-600",
    bg: "bg-orange-50 border-orange-200",
  },
  {
    level: 3,
    name: "Hot",
    emoji: "🌶️🌶️🌶️",
    description: "Pedas nampol! Sensasi bakar di lidah yang bikin kamu ketagihan",
    color: "text-red-600",
    bg: "bg-red-50 border-red-200",
  },
];

const ingredients = [
  { icon: "🌶️", name: "Cabai Merah & Rawit", desc: "Paduan cabai merah besar dan rawit untuk rasa pedas yang berlapis dan kompleks" },
  { icon: "🧅", name: "Bawang Merah & Putih", desc: "Aroma harum yang jadi fondasi rasa sambel, ditumis hingga wangi sempurna" },
  { icon: "🍅", name: "Tomat Segar", desc: "Kunci rasa! Tomat kasih keasaman dan kesegaran alami yang bikin sambel jadi segar dan tidak eneg" },
  { icon: "🍬", name: "Gula Merah Jawa", desc: "Rasa manis legit khas yang membedakan sambel Kalasan dari sambal biasa" },
  { icon: "🧂", name: "Garam & Bumbu Rahasia", desc: "Perpaduan bumbu pilihan yang menyeimbangkan semua rasa menjadi harmoni sempurna" },
];


const faqs = [
  {
    q: "Apa itu Sambel Kalasan?",
    a: "Sambel Kalasan adalah sambal khas dari Kecamatan Kalasan, Kabupaten Sleman, Yogyakarta — daerah yang terkenal dengan Ayam Goreng Kalasan yang sudah jadi Warisan Budaya Takbenda Nasional. Sambalnya punya ciri khas pedas-manis-segar yang unik berkat perpaduan cabai, bawang, tomat segar, dan gula merah Jawa. Kami mengadopsi resep tradisional ini sebagai pendamping setia tahu crispy kami.",
  },
  {
    q: "Kenapa Sambel Kalasan cocok banget sama Tahu Crispy?",
    a: "Tahu crispy punya rasa yang gurih dan netral. Sambel Kalasan dengan profil rasa pedas-manis-asam segar dari tomat memberikan kontras sempurna — setiap gigitan jadi ada 'ledakan' rasa. Tekstur tahu yang renyah di luar + lembut di dalam berpadu dengan sambel yang segar dan kompleks. Kombinasi ini bikin orang susah berhenti makan! 🤤",
  },
  {
    q: "Apakah sambel pakai tomat? Bisa basi gak?",
    a: "Iya, kami pakai tomat segar sebagai salah satu bahan utama — ini yang bikin sambel kami segar dan tidak eneg! Soal ketahanan: sambel disimpan di kulkas dalam wadah tertutup tahan 3 hari dengan aman. Kalau mau dipanasin lagi, boleh banget — justru rasanya makin meresap. Tips: keluarkan dari kulkas 5-10 menit sebelum disajikan biar rasanya optimal! 🍅",
  },
  {
    q: "Apakah ada pilihan tidak pedas?",
    a: "Saat ini sambel kami hadir dalam varian standar. Namun kalau kamu sensitif pedas, kamu bisa request ke kami via WhatsApp — kami siap bantu sesuaikan kebutuhan kamu! 😊",
  },
];


export default function SambelKalasanSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeSpice, setActiveSpice] = useState(1);

  return (
    <section
      id="sambel-kalasan"
      className="py-20 md:py-28 relative overflow-hidden"
      aria-label="Edukasi Sambel Kalasan"
    >
      {/* Gradient background yang menyatu dengan section sekitarnya */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Top fade-in dari putih */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white to-transparent z-10" />
        {/* Main background */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50/40 via-red-50 to-orange-50/60" />
        {/* Subtle warm tones */}
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-50/30 via-transparent to-red-50/30" />
        {/* Bottom fade-out ke putih */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent z-10" />
      </div>
      {/* Ambient blob decorations */}
      <div className="absolute top-[15%] right-0 w-96 h-96 bg-orange-200/25 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[15%] left-0 w-80 h-80 bg-red-200/25 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-red-100 text-red-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">
            <Flame className="w-4 h-4" />
            Keunggulan Kami
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight">
            Bukan Sambel Biasa —{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
              Sambel Kalasan!
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Setiap cup sambel yang kamu beli adalah warisan resep tradisional dari Kalasan,
            Sleman — Yogyakarta. Bukan sekedar pelengkap, tapi jiwa dari setiap gigitan tahu crispy kami.
          </p>
        </div>

        {/* Story Card */}
        <div className="mb-12">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-orange-100">
            <div className="grid md:grid-cols-2 gap-0">
              {/* Left: Story */}
              <div className="p-8 md:p-10 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-orange-100 rounded-2xl">
                    <ChefHat className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Cerita di Balik Sambel Kami</h3>
                </div>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Sambel Kalasan lahir dari tradisi kuliner Kecamatan Kalasan, Sleman — Yogyakarta,
                  daerah yang terkenal dengan Ayam Goreng Mbok Berek yang legendaris sejak tahun 1950-an.
                  Bahkan Presiden Soekarno pernah mencicipinya!
                </p>
                <p className="text-gray-600 leading-relaxed mb-4">
                  Kami mengadopsi filosofi yang sama: sambal bukan sekadar "yang penting pedas",
                  tapi harus punya <strong>kedalaman rasa</strong>. Pedas, manis, asam, dan gurih
                  dalam satu sendok — itulah sambel Kalasan.
                </p>
                <p className="text-gray-600 leading-relaxed">
                  Dipadukan dengan tahu crispy kami yang renyah sempurna, ini bukan lagi
                  sekadar camilan. Ini pengalaman kuliner!
                </p>

                <div className="mt-6 flex items-center gap-3 bg-orange-50 rounded-xl p-4 border border-orange-100">
                  <Star className="w-5 h-5 text-orange-500 flex-shrink-0" />
                  <p className="text-sm text-orange-800 font-medium">
                    Sambel Kalasan sudah ditetapkan sebagai bagian dari Warisan Budaya Takbenda Nasional Indonesia 🇮🇩
                  </p>
                </div>
              </div>

              {/* Right: Visual */}
              <div className="bg-gradient-to-br from-red-500 to-orange-500 p-8 md:p-10 flex flex-col justify-center items-center text-white relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                <div className="text-8xl mb-6 relative z-10 animate-bounce-slow" style={{animationDuration: '3s'}}>
                  🌶️
                </div>
                <div className="grid grid-cols-2 gap-4 w-full relative z-10">
                  {[
                    { label: "Tanpa Pengawet", icon: "🌿" },
                    { label: "Resep Tradisional", icon: "📜" },
                    { label: "Fresh Daily", icon: "✨" },
                    { label: "Rasa Autentik", icon: "🏆" },
                  ].map((item) => (
                    <div key={item.label} className="bg-white/20 backdrop-blur-sm rounded-xl p-3 text-center border border-white/30">
                      <div className="text-2xl mb-1">{item.icon}</div>
                      <p className="text-xs font-semibold text-white/90">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="mb-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 text-green-700 bg-green-100 px-4 py-2 rounded-full text-sm font-semibold mb-3">
              <Leaf className="w-4 h-4" />
              Bahan-Bahan Pilihan
            </div>
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
              Apa yang Bikin Sambel Kami Beda?
            </h3>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {ingredients.map((ing, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl p-5 shadow-md border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-center"
              >
                <div className="text-4xl mb-3">{ing.icon}</div>
                <h4 className="font-bold text-gray-900 text-sm mb-2">{ing.name}</h4>
                <p className="text-gray-500 text-xs leading-relaxed">{ing.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Spice Level Selector */}
        <div className="mb-12">
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-red-100">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 text-red-700 bg-red-100 px-4 py-2 rounded-full text-sm font-semibold mb-3">
                <Flame className="w-4 h-4" />
                Level Kepedasan
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
                Sambel Kami, Seberapa Pedas?
              </h3>
              <p className="text-gray-500 mt-2 text-sm">Klik untuk lihat detailnya</p>
            </div>

            {/* Level tabs */}
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              {spiceLevels.map((s) => (
                <button
                  key={s.level}
                  id={`spice-level-${s.level}`}
                  onClick={() => setActiveSpice(s.level)}
                  className={`flex-1 py-4 px-5 rounded-2xl border-2 font-bold text-center transition-all duration-300 cursor-pointer ${
                    activeSpice === s.level
                      ? `${s.bg} ${s.color} border-current shadow-lg scale-[1.02]`
                      : "bg-gray-50 text-gray-400 border-gray-100 hover:bg-gray-100"
                  }`}
                >
                  <div className="text-2xl mb-1">{s.emoji}</div>
                  <div className="text-sm">{s.name}</div>
                </button>
              ))}
            </div>

            {/* Active level info */}
            {spiceLevels.map((s) =>
              s.level === activeSpice ? (
                <div
                  key={s.level}
                  className={`${s.bg} ${s.color} rounded-2xl p-5 border-2 border-current/20 text-center transition-all duration-300`}
                >
                  <p className="font-semibold text-base">{s.description}</p>
                </div>
              ) : null
            )}

            <p className="text-center text-gray-400 text-sm mt-4">
              * Level kepedasan disesuaikan dengan standar kami. Bisa request lewat WhatsApp!
            </p>
          </div>
        </div>

        {/* FAQ */}
        <div>
          <div className="text-center mb-8">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-900">
              Pertanyaan Seputar Sambel Kalasan
            </h3>
            <p className="text-gray-500 mt-2">Yang sering ditanyakan pelanggan kami</p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden transition-all duration-300"
              >
                <button
                  id={`faq-sambel-${i}`}
                  className="w-full flex items-center justify-between p-6 text-left cursor-pointer hover:bg-orange-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span className="font-semibold text-gray-900 pr-4">{faq.q}</span>
                  <div className="flex-shrink-0 text-orange-500">
                    {openFaq === i ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </div>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

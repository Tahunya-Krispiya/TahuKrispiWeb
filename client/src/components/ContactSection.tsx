import { Mail, MessageCircle, ArrowRight } from "lucide-react";
import { SiTiktok, SiInstagram, SiWhatsapp } from "react-icons/si";

const contacts = [
  {
    id: "whatsapp",
    icon: SiWhatsapp,
    label: "WhatsApp",
    handle: "+62 812-8836-2512",
    sub: "Respon cepat!",
    href: "https://wa.me/6281288362512",
    gradient: "from-green-500 to-emerald-600",
    bg: "bg-green-50 hover:bg-green-100",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    handleStyle: "text-green-700",
  },
  {
    id: "instagram",
    icon: SiInstagram,
    label: "Instagram",
    handle: "@tahunya_krispiya",
    sub: "Follow for updates!",
    href: "https://www.instagram.com/tahunya_krispiya",
    gradient: "from-pink-500 via-purple-500 to-orange-400",
    bg: "bg-pink-50 hover:bg-pink-100",
    iconBg: "bg-gradient-to-br from-pink-100 to-purple-100",
    iconColor: "text-pink-600",
    handleStyle: "text-pink-700",
  },
  {
    id: "email",
    icon: Mail,
    label: "Email",
    handle: "tahunyakrispiya\n@gmail.com",
    sub: "Untuk kerjasama & media",
    href: "mailto:tahunyakrispiya@gmail.com",
    gradient: "from-blue-500 to-cyan-500",
    bg: "bg-blue-50 hover:bg-blue-100",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    handleStyle: "text-blue-700",
  },
  {
    id: "tiktok",
    icon: SiTiktok,
    label: "TikTok",
    handle: "@ajengandhika_",
    sub: "12.8K Followers 🔥",
    href: "https://tiktok.com/@ajengandhika_",
    gradient: "from-gray-900 to-gray-700",
    bg: "bg-gray-50 hover:bg-gray-100",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-800",
    handleStyle: "text-gray-800",
  },
];

export default function ContactSection() {
  return (
    <section
      id="contact"
      className="py-16 md:py-24 bg-gradient-to-b from-background to-muted/30"
      data-testid="contact-section"
      aria-label="Hubungi Kami"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 text-sm font-semibold px-4 py-2 rounded-full mb-4">
            💬 Yuk Ngobrol!
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Hubungi Kami
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-xl mx-auto">
            Mau pesan, tanya-tanya, atau sekadar bilang enak? Kami ada di sini!
          </p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {contacts.map((c) => {
            const Icon = c.icon;
            return (
              <a
                key={c.id}
                href={c.href}
                target={c.id !== "email" ? "_blank" : undefined}
                rel="noopener noreferrer"
                data-testid={`button-${c.id}`}
                className={`group flex flex-col items-center text-center p-5 rounded-2xl border border-transparent ${c.bg} transition-all duration-300 hover:shadow-lg hover:-translate-y-1 active:scale-95`}
              >
                {/* Icon */}
                <div className={`w-14 h-14 flex items-center justify-center rounded-2xl ${c.iconBg} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className={`w-7 h-7 ${c.iconColor}`} />
                </div>

                {/* Label */}
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">
                  {c.label}
                </span>

                {/* Handle — break long text */}
                <span className={`text-sm font-semibold ${c.handleStyle} break-all leading-snug mb-1 whitespace-pre-line`}>
                  {c.handle}
                </span>

                {/* Sub */}
                <span className="text-xs text-muted-foreground">{c.sub}</span>
              </a>
            );
          })}
        </div>

        {/* CTA Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 to-amber-500 p-8 md:p-10 text-white text-center shadow-2xl">
          <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <p className="text-sm font-semibold uppercase tracking-widest opacity-80 mb-2">
              Laper? 👀
            </p>
            <h3 className="text-2xl md:text-3xl font-black mb-2">
              Yuk Order Sekarang!
            </h3>
            <p className="text-white/80 mb-6 max-w-sm mx-auto">
              Tahu crispy renyah + sambel kalasan khas — siap bikin hari kamu makin seru ✨
            </p>
            <a
              href="https://wa.me/6281288362512?text=Halo%2C%20saya%20mau%20pesan%20tahu%20crispy!"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="button-order-now"
              className="inline-flex items-center gap-2 bg-white text-orange-600 font-bold px-8 py-3 rounded-xl hover:bg-orange-50 transition-colors shadow-lg"
            >
              Chat WhatsApp <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}


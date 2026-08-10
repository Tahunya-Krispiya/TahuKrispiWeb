import { useState, useEffect } from "react";
// Hapus 'Link' dan 'useLocation' dari wouter jika hanya digunakan untuk scroll
// Jika wouter masih diperlukan di komponen lain, biarkan saja. Saya asumsikan ini murni untuk anchor.
// import { Link, useLocation } from "wouter"; 
import { ChevronDown, ExternalLink, Grid2X2, LockKeyhole, Menu, X, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import logoImg from "@assets/1763097449392_1763097461717.png";

interface NavbarProps {
  cartItemCount?: number;
  onCartClick?: () => void;
}

export default function Navbar({ cartItemCount = 0, onCartClick }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAppsOpen, setIsAppsOpen] = useState(false);
  // const [location] = useLocation(); // Hapus jika tidak digunakan

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#top", label: "Home" }, // Anchor untuk paling atas halaman
    { href: "#menu", label: "Menu" }, // Anchor ke section Menu Anda
    { href: "#info", label: "Info" },
    { href: "#contact", label: "Contact" }
  ];

  const otherApps = [
    {
      label: "Liveflow",
      description: "TikTok live tool buatan sendiri — pantau & kelola sesi live secara real-time",
      href: import.meta.env.VITE_LIVEFLOW_URL || "https://liveflow.tahunyakrispiya.my.id/",
    },
    {
      label: "QRISKas",
      description: "Pencatat & QRIS scanner kasir tahu krispi",
      href: import.meta.env.VITE_SCAN_URL || "https://scan.tahunyakrispiya.my.id/",
    },
    {
      label: "DStock",
      description: "Database stok independen — kelola & monitor inventaris",
      href: "https://dstock.tahunyakrispiya.my.id/",
    },
  ];
  
  // FUNGSI SCROLL YANG SUDAH DIPERBAIKI (Tidak ada definisi ganda)
  const scrollToSection = (href: string) => {
    // 1. Logika Khusus untuk Home (#top)
    if (href === '#top') { 
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setIsMobileMenuOpen(false);
      return;
    }
    
    // 2. Logika untuk Anchor Lain (#menu, #info, #contact)
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setIsMobileMenuOpen(false);
      }
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 ${
        isScrolled ? "bg-background shadow-md" : "bg-background/95"
      }`}
      data-testid="navbar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* PERBAIKAN: Ganti Link wouter dengan button agar bisa dipanggil scrollToSection */}
          <button
            className="flex items-center gap-3 hover-elevate active-elevate-2 px-2 py-1 rounded-md"
            data-testid="link-home"
            onClick={() => scrollToSection("#top")} // Panggil scroll ke paling atas
          >
            <img 
              src={logoImg} 
              alt="Tahunya Krispi-ya Logo" 
              className="h-12 md:h-14 w-auto"
            />
            <span className="text-xl md:text-2xl font-bold text-primary hidden sm:block">
              Tahunya Krispi-ya!
            </span>
          </button>
          {/* END PERBAIKAN LOGO */}

          <div className="hidden lg:flex items-center gap-5 xl:gap-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className="text-base font-medium text-foreground hover-elevate active-elevate-2 px-3 py-2 rounded-md transition-colors"
                data-testid={`link-${link.label.toLowerCase()}`}
              >
                {link.label}
              </button>
            ))}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsAppsOpen((open) => !open)}
                className="flex items-center gap-2 text-base font-medium text-foreground px-3 py-2 rounded-md hover:bg-black/5"
                aria-expanded={isAppsOpen}
              >
                <Grid2X2 className="h-4 w-4" />
                Aplikasi Lain
                <ChevronDown className={`h-4 w-4 transition-transform ${isAppsOpen ? "rotate-180" : ""}`} />
              </button>
              {isAppsOpen && (
                <div className="absolute right-0 mt-2 w-72 rounded-xl border bg-background p-2 shadow-xl">
                  {otherApps.map((app) => app.href ? (
                    <a key={app.label} href={app.href} className="flex items-center justify-between rounded-lg p-3 hover:bg-muted" target="_blank" rel="noreferrer">
                      <span><span className="block font-semibold">{app.label}</span><span className="block text-xs text-muted-foreground">{app.description}</span></span>
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : (
                    <div key={app.label} className="rounded-lg p-3 opacity-50" title={`Isi VITE_${app.label.toUpperCase()}_URL`}>
                      <span className="block font-semibold">{app.label}</span>
                      <span className="block text-xs">Atur URL di environment</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <a href="/login" className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-orange-600">
              <LockKeyhole className="h-4 w-4" /> Admin
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              className="relative"
              onClick={onCartClick}
              data-testid="button-cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartItemCount > 0 && (
                <Badge
                  className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  data-testid="badge-cart-count"
                >
                  {cartItemCount}
                </Badge>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-menu-toggle"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          className="lg:hidden bg-background border-t shadow-lg"
          data-testid="mobile-menu"
          style={{
            maxHeight: "calc(100dvh - 64px)",
            overflowY: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div className="px-4 py-4 space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className="block w-full text-left text-base font-medium text-foreground hover-elevate active-elevate-2 px-4 py-3 rounded-md transition-colors hover:bg-muted"
                data-testid={`mobile-link-${link.label.toLowerCase()}`}
              >
                {link.label}
              </button>
            ))}
            <div className="border-t pt-3 mt-2">
              <p className="px-4 pb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Aplikasi Lain</p>
              {otherApps.map((app) => app.href && (
                <a key={app.label} href={app.href} target="_blank" rel="noreferrer" className="flex w-full items-center justify-between px-4 py-3 rounded-md hover:bg-muted transition-colors">
                  <span>
                    <span className="block font-semibold text-sm text-foreground">{app.label}</span>
                    <span className="block text-xs text-muted-foreground leading-snug mt-0.5 max-w-[240px]">{app.description}</span>
                  </span>
                  <ExternalLink className="h-4 w-4 shrink-0 ml-2 text-muted-foreground" />
                </a>
              ))}
            </div>
            <a href="/login" className="flex w-full items-center gap-2 border-t px-4 py-4 font-semibold text-orange-700 hover:bg-orange-50 rounded-md transition-colors">
              <LockKeyhole className="h-4 w-4" /> Login Admin
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}

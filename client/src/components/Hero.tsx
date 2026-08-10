import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@assets/compressed/IMG-20250911-WA0009_1763095354038.webp";
import logoImg from "@assets/1763097449392_1763097461717.png";

interface HeroProps {
  onCTAClick?: () => void;
}

export default function Hero({ onCTAClick }: HeroProps) {
  const scrollToMenu = () => {
    const menuSection = document.querySelector('#menu');
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: 'smooth' });
    }
    onCTAClick?.();
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden" data-testid="hero-section">
      <div
        className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/30 to-secondary/20"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(251, 146, 60, 0.15) 0%, rgba(253, 224, 71, 0.2) 50%, rgba(251, 146, 60, 0.15) 100%)`
        }}
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-center md:text-left space-y-6">
            <div className="flex justify-center md:justify-start mb-6">
              <img 
                src={logoImg} 
                alt="Tahunya Krispi-ya Logo" 
                className="h-24 sm:h-32 lg:h-40 w-auto"
                data-testid="hero-logo"
              />
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight" data-testid="hero-title">
              Tahunya <span className="text-primary">Krispi-ya!</span>
            </h1>
            
            <p className="text-2xl sm:text-3xl font-semibold text-primary" data-testid="hero-slogan">
              Krispinya Bikin Nagih Lagi!
            </p>
            
            <p className="text-lg sm:text-xl text-muted-foreground max-w-lg" data-testid="hero-description">
              Nikmati kelezatan tahu crispy dengan tekstur renyah dan dicocol sambal kecap kalasan pedas gurih, Dibuat fresh setiap hari dengan bahan berkualitas!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Button
                size="lg"
                onClick={scrollToMenu}
                className="text-lg font-semibold group"
                data-testid="button-view-menu"
              >
                Lihat Menu
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => {
                  const contactSection = document.querySelector('#contact');
                  if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="text-lg font-semibold"
                data-testid="button-contact-us"
              >
                Hubungi Kami
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={heroImage}
                alt="Tahu Crispy Krispi-ya dalam box"
                className="w-full h-auto object-cover"
                data-testid="hero-image"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
            
            <div className="absolute -bottom-6 -right-6 bg-primary text-primary-foreground rounded-full p-6 shadow-xl animate-pulse">
              <div className="text-center">
                <p className="text-sm font-semibold">Mulai dari</p>
                <p className="text-2xl font-bold">Rp 10K</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}

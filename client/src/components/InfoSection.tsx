import { MapPin, Phone, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface InfoSectionProps {
  address?: string;
  phone?: string;
  hours?: string;
}

export default function InfoSection({
  address = "Jalan Pulo Ribung No.12",
  phone = "+62 812-8836-2512",
  hours = "Selasa - Minggu: 09.00 - 21.00 WIB"
}: InfoSectionProps) {
  return (
    <section id="info" className="py-16 md:py-24 bg-muted/30" data-testid="info-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" data-testid="text-info-title">
            Informasi Toko
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Kunjungi toko kami atau hubungi untuk pemesanan
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover-elevate">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Alamat</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground" data-testid="text-address">
                {address}
              </p>
              <a href="https://maps.app.goo.gl/RoVegza696jarKxq7" target="_blank" rel="noreferrer" className="text-primary hover:underline text-sm mt-2 inline-block">
                Buka Tahunya Krispiya Pekayon di Maps
              </a>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Kontak</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground" data-testid="text-phone">
                {phone}
              </p>
              <a
                href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm mt-2 inline-block"
                data-testid="link-whatsapp"
              >
                Chat via WhatsApp
              </a>
            </CardContent>
          </Card>

          <Card className="hover-elevate">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Jam Buka</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground" data-testid="text-hours">
                {hours}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

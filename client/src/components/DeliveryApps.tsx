import { Smartphone, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import shopeeFoodLogo from "@assets/20251115_114212_1763181742871.png";
import goFoodLogo from "@assets/20251115_114119_1763181742925.png";
import grabFoodLogo from "@assets/20251115_113828_1763181742952.png";
import type { DeliveryStatus } from "@/lib/firebase";

interface DeliveryApp {
  name: string;
  color: string;
  url: string;
  description: string;
  isOnline: boolean;
  logo: string;
}

const deliveryApps: DeliveryApp[] = [
  {
    name: "GoFood",
    color: "bg-red-600",
    url: "https://gofood.link/a/M6pGo27",
    description: "Pesan via GoFood",
    isOnline: true,
    logo: goFoodLogo
  },
  {
    name: "GrabFood",
    color: "bg-green-600",
    url: "#grabfood",
    description: "Pesan via GrabFood",
    isOnline: false,
    logo: grabFoodLogo
  },
  {
    name: "ShopeeFood",
    color: "bg-orange-600",
    url: "#shoppeefood",
    description: "Pesan via ShopeeFood",
    isOnline: false,
    logo: shopeeFoodLogo
  }
];

export default function DeliveryApps({ status }: { status?: DeliveryStatus }) {
  const onlineState: Record<string, boolean> = {
    GoFood: status?.isGoFoodOnline ?? false,
    GrabFood: status?.isGrabFoodOnline ?? false,
    ShopeeFood: status?.isShopeeFoodOnline ?? false,
  };
  return (
    <section className="py-16 md:py-24 bg-muted/20" data-testid="delivery-apps-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Smartphone className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Pesan via Aplikasi
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Nikmati kemudahan pesan antar langsung ke rumah Anda
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {deliveryApps.map((app) => {
            const isOnline = onlineState[app.name];
            const canOpen = app.name === "GoFood" || isOnline;
            return (
              <Card key={app.name} className="hover-elevate transition-shadow duration-300">
                <CardHeader>
                  <div className={`${app.color} text-white rounded-lg p-6 mb-4 flex items-center justify-center`}>
                    <img 
                      src={app.logo} 
                      alt={`${app.name} Logo`} 
                      className="h-16 w-auto object-contain"
                      data-testid={`logo-${app.name.toLowerCase()}`}
                    />
                  </div>
                  <div className="flex justify-center">
                    <Badge 
                      variant={isOnline ? "default" : "secondary"}
                      className={app.name === "GoFood" ? "bg-red-600" : (isOnline ? app.color : "bg-gray-500")}
                    >
                      {app.name === "GoFood" ? "Forgotten" : (isOnline ? "Online" : "Offline")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-center text-muted-foreground">
                    {app.description}
                  </p>
                  {canOpen ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        if (app.url.startsWith('http')) {
                          window.open(app.url, '_blank');
                        }
                      }}
                      data-testid={`button-${app.name.toLowerCase()}`}
                    >
                      Buka Aplikasi
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      className="w-full border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                      disabled
                      data-testid={`button-${app.name.toLowerCase()}`}
                    >
                      {app.name === "GoFood" ? "Layanan Tidak Aktif" : "Belum Tersedia"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}

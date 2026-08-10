import { useState } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import ShoppingCart from "@/components/ShoppingCart";
import InfoSection from "@/components/InfoSection";
import SambelKalasanSection from "@/components/SambelKalasanSection";
import DeliveryApps from "@/components/DeliveryApps";
import BankInfo from "@/components/BankInfo";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import TikTokLiveCard from "@/components/TikTokLiveCard";
import QrisPayment from "@/components/QrisPayment";
import DeliveryEstimator from "@/components/DeliveryEstimator";
import type { Product, CartItem } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import type { PublicStatus } from "@/lib/firebase";
import FlashSaleBanner from "@/components/FlashSaleBanner";
import BudgetTahuCard from "@/components/BudgetTahuCard";
import { Link } from "react-router-dom";
import { QrCode, ArrowRight } from "lucide-react";

import img1 from "@assets/compressed/IMG-20250911-WA0018_1763095354099.webp";
import img2 from "@assets/compressed/IMG-20250911-WA0021_1763095354116.webp";
import img3 from "@assets/compressed/IMG-20250911-WA0027_1763095354130.webp";
import img4 from "@assets/compressed/IMG-20250911-WA0026_1763095354145.webp";
import img5 from "@assets/compressed/IMG-20250911-WA0020_1763095354162.webp";

const WHATSAPP_NUMBER = "6281288362512";

const products: Product[] = [
  {
    id: "small",
    name: "Small Pack",
    size: "4 pcs",
    pieces: 4,
    price: 10000,
    image: img1,
    description: "Porsi pas untuk cemilan sore atau makan sendiri",
    type: "tofu",
  },
  {
    id: "medium",
    name: "Medium Pack",
    size: "8 pcs",
    pieces: 8,
    price: 18000,
    image: img2,
    description: "Cocok untuk berbagi dengan teman atau keluarga",
    type: "tofu",
  },
  {
    id: "large",
    name: "Large Pack",
    size: "18 pcs",
    pieces: 18,
    price: 35000,
    image: img3,
    description: "Pilihan hemat untuk acara atau pesta kecil",
    type: "tofu",
  },
  {
    id: "sambel-1",
    name: "Extra 1",
    size: "1 Cup",
    pieces: 1,
    price: 3000,
    image: img4,
    description: "Sambel pedas spesial untuk tambahan nikmat",
    type: "sambel",
  },
  {
    id: "sambel-2",
    name: "Extra 2",
    size: "2 Cup",
    pieces: 2,
    price: 5000,
    image: img5,
    description: "Sambel pedas spesial - paket hemat 2 cup",
    type: "sambel",
  },
  {
    id: "paket-1",
    name: "Paket Happy",
    size: "Size L + Size M (26 Pcs) + Extra Sambel 1 Cup",
    pieces: 1,
    price: 50000,
    image: img2,
    description: "Cocok Untuk Hadiah Keluarga",
    type: "paket",
  },
  {
    id: "paket-2",
    name: "Paket Love",
    size: "Size L 2 (36 Pcs) + Extra Sambel 2 Cup",
    pieces: 2,
    price: 60000,
    image: img1,
    description: "Cucok Ketika Acara Rapat",
    type: "paket",
  },
];

interface HomeProps {
  globalStatus?: PublicStatus;
}

export default function Home({ globalStatus }: HomeProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { toast } = useToast();

  const addToCart = (product: Product) => {
    setCartItems((items) => {
      const existingItem = items.find((item) => item.product.id === product.id);
      if (existingItem) {
        return items.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...items, { product, quantity: 1 }];
    });

    toast({
      title: "Ditambahkan ke keranjang!",
      description: `${product.name} berhasil ditambahkan`,
    });
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCartItems((items) => items.filter((item) => item.product.id !== productId));
    } else {
      setCartItems((items) =>
        items.map((item) =>
          item.product.id === productId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const generateWhatsAppMessage = (items: CartItem[]) => {
    let message = "Halo, saya mau pesan:\n\n";
    items.forEach((item) => {
      message += `- ${item.product.name} (${item.product.size}) x${item.quantity}\n`;
    });
    const total = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    message += `\nTotal: Rp ${total.toLocaleString("id-ID")}`;
    return encodeURIComponent(message);
  };

  const handleBuyNow = (product: Product) => {
    const message = `Halo, saya mau pesan:\n\n- ${product.name} (${product.size}) x1\n\nTotal: Rp ${product.price.toLocaleString("id-ID")}`;
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) return;
    const message = generateWhatsAppMessage(cartItems);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
    window.open(url, "_blank");
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen">
      <Navbar cartItemCount={totalItems} onCartClick={() => setIsCartOpen(true)} />
      <Hero />
      <TikTokLiveCard status={globalStatus} />

      {globalStatus && (
        <section className="max-w-7xl mx-auto px-4 mt-6" aria-label="Status pemesanan">
          <div className="bg-white rounded-xl shadow p-4 border-l-4 border-orange-500">
            <p className="font-semibold text-gray-700 mb-2">Status pemesanan online</p>
            <div className="flex flex-wrap gap-2 text-sm">
              {[
                ["GoFood", globalStatus.isGoFoodOnline],
                ["GrabFood", globalStatus.isGrabFoodOnline],
                ["ShopeeFood", globalStatus.isShopeeFoodOnline],
              ].map(([name, online]) => (
                <span key={String(name)} className={`rounded-full px-3 py-1 font-medium ${name === "GoFood" ? "bg-red-100 text-red-700" : (online ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}`}>
                  {name}: {name === "GoFood" ? "Forgotten" : (online ? "Online" : "Offline")}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}


      <FlashSaleBanner status={globalStatus} onBuyNow={handleBuyNow} onAddToCart={addToCart} />

      <section className="max-w-7xl mx-auto px-4 mt-6 sm:mt-10 mb-[-2rem]">
        <Link to="/payment">
          <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl p-6 md:p-8 text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 relative overflow-hidden group">
            <div className="absolute right-[-10%] top-[-20%] w-64 h-64 bg-white/20 rounded-full blur-3xl group-hover:bg-white/30 transition-all"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="bg-white/20 p-4 rounded-2xl">
                  <QrCode className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-black mb-1">Portal Pembayaran Cepat</h3>
                  <p className="text-white/90 text-sm md:text-base font-medium">Sudah janjian sama admin atau ingin bayar instan pakai QRIS? Klik di sini!</p>
                </div>
              </div>
              <div className="bg-white text-orange-600 font-bold px-6 py-3 rounded-xl flex items-center gap-2 group-hover:bg-orange-50 transition-colors w-full md:w-auto justify-center mt-4 md:mt-0">
                Buka Portal <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </Link>
      </section>

      <section id="menu" className="py-16 md:py-24" data-testid="menu-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Menu Kami</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Pilih paket favorit Anda dan nikmati kelezatan tahu crispy kami
            </p>
          </div>

          <BudgetTahuCard
            onBuyNow={handleBuyNow}
            onAddToCart={addToCart}
            options={[
              { id: "budget-10", budget: 10000, pieces: 4, sambal: "1 cup 25 ml", image: img1, comparison: "Small Pack" },
              { id: "budget-15", budget: 15000, pieces: 6, sambal: "1 cup 35 ml", image: img2, comparison: "¾ Medium Pack" },
              { id: "budget-18", budget: 18000, pieces: 8, sambal: "1 cup 35 ml", image: img2, comparison: "Medium Pack", highlight: "Paling pas" },
              { id: "budget-20", budget: 20000, pieces: 9, sambal: "1 cup 35 ml + 1 cup 25 ml", image: img3, comparison: "Medium + 1 pcs" },
              { id: "budget-25", budget: 25000, pieces: 11, sambal: "1 cup 35 ml + 1 cup 25 ml", image: img1, comparison: "Medium + 3 pcs" },
              { id: "budget-35", budget: 35000, pieces: 18, sambal: "2 cup 35 ml", image: img3, comparison: "Large Pack", highlight: "Hemat" },
              { id: "budget-50", budget: 50000, pieces: 25, sambal: "3 cup 35 ml", image: img2, comparison: "Large + 7 pcs", highlight: "Paling hemat" },
            ]}
          />

          <div className="mb-16">
            <div className="mb-8">
              <h3 className="text-2xl md:text-3xl font-bold mb-3">Size</h3>
              <p className="text-base md:text-lg text-muted-foreground">
                Disesuaikan dengan kebutuhan anda
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products
                .filter((p) => p.type === "tofu")
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onBuyNow={handleBuyNow}
                    onAddToCart={addToCart}
                  />
                ))}
            </div>
          </div>

          <div className="mb-16">
            <div className="mb-8">
              <h3 className="text-2xl md:text-3xl font-bold mb-3">Add-ons</h3>
              <p className="text-base md:text-lg text-muted-foreground">
                Sambel pedas spesial untuk melengkapi tahu crispy Anda. Cocok kalau sambelnya kurang atau ingin lebih pedas!
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6 max-w-2xl">
              {products
                .filter((p) => p.type === "sambel")
                .map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onBuyNow={handleBuyNow}
                    onAddToCart={addToCart}
                  />
                ))}
            </div>
          </div>

          {products.filter((p) => p.type === "paket").length > 0 && (
            <div className="mb-16">
              <div className="mb-8">
                <h3 className="text-2xl md:text-3xl font-bold mb-3">Paket</h3>
                <p className="text-base md:text-lg text-muted-foreground">
                  Paket hemat untuk acara spesial, arisan, atau kumpul keluarga. Lebih banyak, lebih hemat!
                </p>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products
                  .filter((p) => p.type === "paket")
                  .map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onBuyNow={handleBuyNow}
                      onAddToCart={addToCart}
                    />
               ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <InfoSection />
      <SambelKalasanSection />
      <DeliveryApps status={globalStatus} />
      <DeliveryEstimator />
      <QrisPayment />
      <BankInfo />
      <ContactSection />
      <Footer />

      <ShoppingCart
        isOpen={isCartOpen}
        items={cartItems}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={updateQuantity}
        onCheckout={handleCheckout}
      />
    </div>
  );
}

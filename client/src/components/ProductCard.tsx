import { ShoppingCart, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  onBuyNow?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
}

export default function ProductCard({ product, onBuyNow, onAddToCart }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  return (
    <Card
      className="overflow-hidden hover-elevate active-elevate-2 transition-shadow duration-300"
      data-testid={`card-product-${product.id}`}
    >
      <CardHeader className="p-0">
        <div className="relative aspect-[4/3] overflow-hidden">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            data-testid={`img-product-${product.id}`}
          />
          {product.type === 'tofu' && (
            <Badge className="absolute top-4 right-4 bg-primary/90 text-primary-foreground">
              <Zap className="h-3 w-3 mr-1" />
              Fresh Daily
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-3">
        <div>
          <h3 className="text-xl font-bold text-foreground" data-testid={`text-product-name-${product.id}`}>
            {product.name}
          </h3>
          <p className="text-sm text-muted-foreground" data-testid={`text-product-size-${product.id}`}>
            {product.size}
          </p>
        </div>

        <p className="text-sm text-muted-foreground" data-testid={`text-product-description-${product.id}`}>
          {product.description}
        </p>

        <div className="pt-2">
          <p className="text-3xl font-bold text-primary" data-testid={`text-product-price-${product.id}`}>
            {formatPrice(product.price)}
          </p>
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0 flex gap-3">
        <Button
          onClick={() => onBuyNow?.(product)}
          className="flex-1 font-semibold"
          data-testid={`button-buy-now-${product.id}`}
        >
          Beli Sekarang
        </Button>
        <Button
          onClick={() => onAddToCart?.(product)}
          variant="outline"
          size="icon"
          className="shrink-0"
          data-testid={`button-add-to-cart-${product.id}`}
        >
          <ShoppingCart className="h-5 w-5" />
        </Button>
      </CardFooter>
    </Card>
  );
}

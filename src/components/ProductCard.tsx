import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, Flame, ExternalLink, MessageCircle, MessageSquare, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProductReactionCount } from "./ProductReactionCount";

interface ProductCardProps {
  id: string;
  title: string;
  originalPrice: number;
  promotionalPrice: number;
  image: string;
  store: string;
  storeLogo?: string;
  discount: number;
  timeAgo: string;
  isHot?: boolean;
  commentCount?: number;
  isExpired?: boolean;
}

export const ProductCard = ({
  id,
  title,
  originalPrice,
  promotionalPrice,
  image,
  store,
  storeLogo,
  discount,
  timeAgo,
  isHot = false,
  commentCount = 0,
  isExpired = false,
}: ProductCardProps) => {
  const navigate = useNavigate();
  return (
    <Card 
      className="group overflow-hidden border-0 shadow-[0_4px_12px_hsl(0_0%_0%_/_0.1)] hover:shadow-[0_8px_24px_hsl(0_0%_0%_/_0.15)] transition-all duration-300 hover:-translate-y-1 cursor-pointer
                 md:flex-col flex-row"
      onClick={() => navigate(`/produto/${id}`)}
    >
      {/* Layout Mobile: Horizontal */}
      <div className="md:hidden flex gap-3 p-3">
        {/* Image - Smaller on mobile */}
        <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
          <img
            src={image || "/placeholder.svg"}
            alt={title}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isExpired ? 'grayscale' : ''}`}
          />
          {isExpired && (
            <div className="absolute top-1 right-1 bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs font-bold shadow-lg border border-border">
              EXPIRADA
            </div>
          )}
          {discount > 0 && (
            <div className="absolute top-1 left-1 bg-destructive text-destructive-foreground px-2 py-0.5 rounded-full text-xs font-bold shadow-lg">
              -{discount}%
            </div>
          )}
          {isHot && (
            <div className="absolute top-1 right-1 bg-orange-500 text-white px-2 py-0.5 rounded-full text-xs font-bold shadow-lg animate-pulse">
              🔥 BOMBANDO
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          {/* Store and Time */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs text-muted-foreground font-medium truncate">
              {store}
            </span>
            <span className="text-xs text-muted-foreground flex-shrink-0">{timeAgo}</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Price */}
          <div className="mb-2">
            <div className="text-lg font-bold text-primary">
              R$ {promotionalPrice.toFixed(2).replace(".", ",")}
            </div>
            {originalPrice > promotionalPrice && (
              <div className="text-xs text-muted-foreground line-through">
                R$ {originalPrice.toFixed(2).replace(".", ",")}
              </div>
            )}
          </div>

          {/* Reactions and Comments */}
          <div className="flex items-center gap-3">
            <ProductReactionCount productId={id} />
            <div className="flex items-center gap-1 text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span className="text-xs font-medium">{commentCount}</span>
            </div>
            <div className="ml-auto">
              <Button 
                size="sm"
                variant="ghost"
                className="text-xs h-7 px-2 gap-1 pointer-events-none"
              >
                Ver mais
                <ChevronRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Layout Desktop: Vertical (existing layout) */}
      <div className="hidden md:block">
        {/* Image Container */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={image || "/placeholder.svg"}
            alt={title}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${isExpired ? 'grayscale' : ''}`}
          />
          {isExpired && (
            <div className="absolute top-3 right-3 bg-muted text-muted-foreground px-3 py-1 rounded-full text-sm font-bold shadow-lg border border-border">
              EXPIRADA
            </div>
          )}
          {discount > 0 && (
            <div className="absolute top-3 left-3 bg-destructive text-destructive-foreground px-3 py-1 rounded-full text-sm font-bold shadow-lg">
              -{discount}%
            </div>
          )}
          {isHot && (
            <div className="absolute top-3 right-3 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg animate-pulse">
              🔥 BOMBANDO
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {/* Store and Time */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              {storeLogo && (
                <img src={storeLogo} alt={store} className="h-4 w-auto object-contain" />
              )}
              <span className="font-medium">{store}</span>
            </div>
            <span>{timeAgo}</span>
          </div>

          {/* Title */}
          <h3 className="font-semibold text-base line-clamp-2 min-h-[3rem] group-hover:text-primary transition-colors">
            {title}
          </h3>

          {/* Price */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-primary">
                R$ {promotionalPrice.toFixed(2).replace(".", ",")}
              </span>
            </div>
            {originalPrice > promotionalPrice && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground line-through">
                  R$ {originalPrice.toFixed(2).replace(".", ",")}
                </span>
              </div>
            )}
          </div>

          {/* Reactions and Comments Count */}
          <div className="flex items-center gap-4 pt-2 border-t">
            <ProductReactionCount productId={id} />
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm font-medium">{commentCount}</span>
            </div>
          </div>

          {/* CTA Button */}
          <Button 
            className="w-full gradient-accent hover:opacity-90 font-bold shadow-md group/btn pointer-events-none"
          >
            <span>VER OFERTA</span>
            <ExternalLink className="h-4 w-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Clock, Flame, ExternalLink, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  discount,
  timeAgo,
  isHot = false,
  commentCount = 0,
  isExpired = false,
}: ProductCardProps) => {
  const navigate = useNavigate();
  return (
    <Card className="group overflow-hidden border-0 shadow-[0_4px_12px_hsl(0_0%_0%_/_0.1)] hover:shadow-[0_8px_24px_hsl(0_0%_0%_/_0.15)] transition-all duration-300 hover:-translate-y-1">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={image}
          alt={title}
          className={`h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 ${isExpired ? 'grayscale' : ''}`}
        />
        {/* Discount Badge */}
        <div className="absolute top-3 left-3">
          <Badge className="gradient-accent text-foreground font-bold text-base px-3 py-1 shadow-lg">
            -{discount}%
          </Badge>
        </div>
        {/* Hot Badge */}
        {isHot && !isExpired && (
          <div className="absolute top-3 right-3">
            <Badge variant="destructive" className="gap-1 font-bold shadow-lg">
              <Flame className="h-3 w-3" />
              QUENTE
            </Badge>
          </div>
        )}
        {/* Expired Badge */}
        {isExpired && (
          <div className="absolute top-3 right-3">
            <Badge variant="secondary" className="font-bold shadow-lg bg-muted text-muted-foreground">
              EXPIRADA
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Title */}
        <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem] group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Prices */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-primary">
              R$ {promotionalPrice.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground line-through">
              R$ {originalPrice.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">em até 10x sem juros</p>
        </div>

        {/* Store and Time */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium">{store}</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {commentCount}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {timeAgo}
            </span>
          </div>
        </div>

        {/* CTA Button */}
        <Button 
          className="w-full gradient-accent hover:opacity-90 font-bold shadow-md group/btn"
          onClick={() => navigate(`/produto/${id}`)}
        >
          <span>VER OFERTA</span>
          <ExternalLink className="h-4 w-4 ml-2 transition-transform group-hover/btn:translate-x-1" />
        </Button>
      </div>
    </Card>
  );
};

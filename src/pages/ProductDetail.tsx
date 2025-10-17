import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CommentSection } from "@/components/CommentSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProduct } from "@/hooks/useProducts";
import { ExternalLink, Clock, Store, Tag, ArrowLeft, Flame, Copy } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(id!);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">Produto não encontrado</h2>
            <Button onClick={() => navigate("/")}>Voltar para a home</Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(product.created_at), {
    addSuffix: true,
    locale: ptBR,
  });

  const handleCopyCoupon = () => {
    if (product.coupon_code) {
      navigator.clipboard.writeText(product.coupon_code);
      toast.success("Cupom copiado!");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 py-8">
        <div className="container px-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Image */}
            <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
              <img
                src={product.image_url}
                alt={product.title}
                className="h-full w-full object-cover"
              />
              {product.is_hot && (
                <div className="absolute top-4 right-4">
                  <Badge variant="destructive" className="gap-1 font-bold shadow-lg text-base px-3 py-1">
                    <Flame className="h-4 w-4" />
                    QUENTE
                  </Badge>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge className="gradient-accent text-foreground font-bold text-lg px-4 py-1">
                    -{product.discount_percentage}%
                  </Badge>
                  {product.categories && (
                    <Badge variant="outline">{product.categories.name}</Badge>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.title}</h1>
                
                {product.description && (
                  <p className="text-muted-foreground">{product.description}</p>
                )}
              </div>

              {/* Price */}
              <div className="space-y-2 p-6 bg-muted/50 rounded-lg">
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-bold text-primary">
                    R$ {Number(product.promotional_price).toFixed(2)}
                  </span>
                  <span className="text-xl text-muted-foreground line-through">
                    R$ {Number(product.original_price).toFixed(2)}
                  </span>
                </div>
                {product.installment_info && (
                  <p className="text-sm text-muted-foreground">{product.installment_info}</p>
                )}
              </div>

              {/* Coupon */}
              {product.coupon_code && (
                <div className="flex items-center justify-between gap-3 p-4 bg-accent/10 rounded-lg border-2 border-dashed border-accent">
                  <div className="flex items-center gap-3">
                    <Tag className="h-5 w-5 text-accent" />
                    <div>
                      <p className="text-sm font-medium">Cupom de desconto</p>
                      <p className="text-lg font-bold text-accent">{product.coupon_code}</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyCoupon}
                    className="gap-1 shrink-0"
                  >
                    <Copy className="h-3 w-3" />
                    Copiar
                  </Button>
                </div>
              )}

              {/* Store Info */}
              {product.stores && (
                <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                  <Store className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Loja</p>
                    <p className="font-semibold">{product.stores.name}</p>
                  </div>
                </div>
              )}

              {/* Time */}
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Publicado {timeAgo}
              </div>

              {/* CTA */}
              <Button
                size="lg"
                className="w-full gradient-accent hover:opacity-90 font-bold text-lg py-6 shadow-lg"
                onClick={() => window.open(product.affiliate_link, "_blank")}
              >
                <span>VER OFERTA NA LOJA</span>
                <ExternalLink className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </div>

          {/* Seção de Comentários */}
          <div className="mt-12">
            <CommentSection productId={id!} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;

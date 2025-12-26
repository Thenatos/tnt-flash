import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CommentSection } from "@/components/CommentSection";
import { ProductReactions } from "@/components/ProductReactions";
import { JoinGroupsPopup } from "@/components/JoinGroupsPopup";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProduct } from "@/hooks/useProducts";
import { useProductAlerts } from "@/hooks/useProductAlerts";
import { ExternalLink, Clock, Store, Tag, ArrowLeft, Flame, Copy, Bell, Bookmark, Share2, MoreVertical } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useAnalytics } from "@/hooks/useAnalytics";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(id!);
  const { createAlert } = useProductAlerts();
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    if (product) {
      trackEvent('page_view', { product_title: product.title }, product.id);
    }
  }, [product]);

  useEffect(() => {
    // Scroll para o topo quando a página carregar
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

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

  const isExpired = product.expires_at ? new Date(product.expires_at) < new Date() : false;

  const handleCopyCoupon = () => {
    if (product.coupon_code) {
      navigator.clipboard.writeText(product.coupon_code);
      toast.success("Cupom copiado!");
    }
  };

  const handleCreateAlert = () => {
    createAlert.mutate({
      alert_type: "product_name",
      search_term: product.title,
    });
  };

  const handleSearch = (query: string) => {
    navigate("/", { state: { searchQuery: query } });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <JoinGroupsPopup 
        whatsappLink="https://chat.whatsapp.com/IsXhhKLkxNPEywfx0IYG3e"
      />
      {/* Desktop Header */}
      <div className="hidden md:block">
        <Header onSearch={handleSearch} />
      </div>
      
      <main className="flex-1">
        {/* Mobile Header */}
        <div className="md:hidden sticky top-0 z-50 bg-background border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="text-sm text-muted-foreground">
              Vendido por <span className="font-semibold text-foreground">{product.stores?.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon">
                <Bookmark className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(window.location.href)}`, "_blank")}
              >
                <Share2 className="h-5 w-5 text-green-500" />
              </Button>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          <div className="px-4 py-6 space-y-6">
            {/* Title */}
            <h1 className="text-2xl font-bold leading-tight">{product.title}</h1>

            {/* Image */}
            <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
              <img
                src={product.image_url}
                alt={product.title}
                className={`h-full w-full object-contain ${isExpired ? 'grayscale' : ''}`}
              />
            </div>

            {/* Price and Time */}
            <div className="flex items-end justify-between">
              <div className="text-4xl font-bold text-orange-500">
                R$ {Number(product.promotional_price).toFixed(2).replace(".", ",")}
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {timeAgo.replace("há ", "")}
              </div>
            </div>

            {/* Installment Info */}
            {product.installment_count && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded">
                  Parcelado em até {product.installment_count}x {product.has_interest ? "Com Juros" : "Sem Juros"}
                </span>
              </div>
            )}

            {/* Reactions */}
            <div className="flex items-center gap-4">
              <ProductReactions productId={id!} />
            </div>

            {/* Alert Button */}
            <Button
              variant="outline"
              className="w-full justify-center gap-2"
              onClick={handleCreateAlert}
            >
              <Bell className="h-4 w-4" />
              Criar Alerta
            </Button>

            {/* CTA Button */}
            <Button
              size="lg"
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold text-lg py-6 rounded-full shadow-lg"
              onClick={() => window.open(product.affiliate_link, "_blank")}
            >
              Ir para loja
              <ExternalLink className="h-5 w-5 ml-2" />
            </Button>

            {/* Additional Info */}
            {product.description && (
              <div className="space-y-2">
                <h3 className="font-semibold">Descrição</h3>
                <p className="text-sm text-muted-foreground">{product.description}</p>
              </div>
            )}

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
          </div>

          {/* Comments Section */}
          <div className="px-4 py-6 border-t">
            <CommentSection productId={id!} />
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:block py-8">
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
                  className={`h-full w-full object-cover ${isExpired ? 'grayscale' : ''}`}
                />
                {product.is_hot && !isExpired && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="destructive" className="font-bold shadow-lg text-base px-3 py-1">
                      BOMBANDO
                    </Badge>
                  </div>
                )}
                {isExpired && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="font-bold shadow-lg text-base px-3 py-1 bg-muted text-muted-foreground">
                      EXPIRADA
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
                    {isExpired && (
                      <Badge variant="secondary" className="bg-muted text-muted-foreground font-bold">
                        EXPIRADA
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.title}</h1>
                  
                  {product.description && (
                    <p className="text-muted-foreground">{product.description}</p>
                  )}
                  
                  {isExpired && (
                    <div className="mt-4 p-4 bg-muted/50 rounded-lg border border-muted-foreground/20">
                      <p className="text-sm text-muted-foreground">
                        ⚠️ Esta oferta expirou. O cupom ou o valor do produto podem ter sofrido alterações.
                      </p>
                    </div>
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
                  {product.installment_count && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1.5 rounded">
                        Parcelado em até {product.installment_count}x {product.has_interest ? "Com Juros" : "Sem Juros"}
                      </span>
                    </div>
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

                {/* Alert Button */}
                <Button
                  variant="outline"
                  className="w-full gap-2"
                  onClick={handleCreateAlert}
                >
                  <Bell className="h-5 w-5" />
                  Criar Alerta
                </Button>

                {/* Product Reactions */}
                <div className="mt-6 pt-6 border-t">
                  <ProductReactions productId={id!} />
                </div>
              </div>
            </div>

            {/* Seção de Comentários */}
            <div className="mt-12">
              <CommentSection productId={id!} />
            </div>
          </div>
        </div>
      </main>

      {/* Desktop Footer */}
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
};

export default ProductDetail;

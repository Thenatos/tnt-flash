import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CommentSection } from "@/components/CommentSection";
import { ProductReactions } from "@/components/ProductReactions";
import { JoinGroupsPopup } from "@/components/JoinGroupsPopup";
import { ProductSEO } from "@/components/ProductSEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StoreTag } from "@/components/StoreTag";
import { ProductCard } from "@/components/ProductCard";
import { useProduct, useRelatedProducts } from "@/hooks/useProducts";
import { useProductAlerts } from "@/hooks/useProductAlerts";
import { ExternalLink, Clock, Store, Tag, ArrowLeft, Flame, Copy, Bell, Bookmark, Share2, MoreVertical, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useAffiliateTracking } from "@/hooks/useAffiliateTracking";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: product, isLoading } = useProduct(id!);
  const { data: relatedProducts = [] } = useRelatedProducts((product as any)?.category_id, id!, 8);
  const { createAlert } = useProductAlerts();
  const { trackEvent } = useAnalytics();
  const { trackNavigation } = useAffiliateTracking();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);

  useEffect(() => {
    if (product) {
      const productData = product as any;
      trackEvent('page_view', { product_title: productData.title }, productData.id);
    }
  }, [product, trackEvent]);

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

  // Type assertion para resolver problemas de inferência do TypeScript
  const productData = product as any;

  const timeAgo = formatDistanceToNow(new Date(productData.created_at), {
    addSuffix: true,
    locale: ptBR,
  });

  const isExpired = productData.expires_at ? new Date(productData.expires_at) < new Date() : false;

  const handleCopyCoupon = () => {
    if (productData.coupon_code) {
      navigator.clipboard.writeText(productData.coupon_code);
      toast.success("Cupom copiado!");
    }
  };

  const handleCreateAlert = () => {
    createAlert.mutate({
      alert_type: "product_name",
      search_term: productData.title,
    });
  };

  const handleSearch = (query: string) => {
    navigate("/", { state: { searchQuery: query } });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ProductSEO product={product} />
      <JoinGroupsPopup />
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
            <div className="flex items-center gap-2">
              {productData.stores && <StoreTag storeName={productData.stores.name} size="sm" />}
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
            {/* Badges - Loja, Desconto e Categoria */}
            <div className="flex items-center gap-2 flex-wrap">
              {productData.stores && <StoreTag storeName={productData.stores.name} size="sm" />}
              <Badge className="gradient-accent text-foreground font-bold text-base px-3 py-1">
                -{productData.discount_percentage}%
              </Badge>
              {productData.categories && (
                <Badge variant="outline">{productData.categories.name}</Badge>
              )}
              {isExpired && (
                <Badge variant="secondary" className="bg-muted text-muted-foreground font-bold">
                  EXPIRADA
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold leading-tight">{productData.title}</h1>

            {/* Image */}
            <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
              <img
                src={productData.image_url}
                alt={productData.title}
                fetchpriority="high"
                decoding="async"
                className={`h-full w-full object-contain ${isExpired ? 'grayscale' : ''}`}
              />
            </div>

            {/* Price */}
            <div className="space-y-2 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-primary">
                  R$ {Number(productData.promotional_price).toFixed(2)}
                </span>
                <span className="text-lg text-muted-foreground line-through">
                  R$ {Number(productData.original_price).toFixed(2)}
                </span>
              </div>
              {/* Installment Info */}
              {productData.installment_count && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1 rounded">
                    Parcelado em até {productData.installment_count}x {productData.has_interest ? "Com Juros" : "Sem Juros"}
                  </span>
                </div>
              )}
            </div>

            {/* Time */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Publicado {timeAgo}
            </div>

            {/* Reactions */}
            <div className="flex items-center gap-4">
              <ProductReactions productId={id!} />
            </div>

            {/* Share Button - Mobile */}
            <Button
              variant="outline"
              className="w-full justify-center gap-2 bg-green-50 hover:bg-green-100 border-green-500 text-green-700"
              onClick={() => {
                const shareUrl = window.location.href;
                const shareText = `Confira esta oferta: ${productData.title} - R$ ${Number(productData.promotional_price).toFixed(2)}`;
                window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, "_blank");
              }}
            >
              <MessageCircle className="h-4 w-4" />
              Compartilhar
            </Button>

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
              onClick={() => trackNavigation(id!, productData.title, productData.affiliate_link, productData.stores?.name || 'Loja')}
            >
              Ir para loja
              <ExternalLink className="h-5 w-5 ml-2" />
            </Button>

            {/* Additional Info */}
            {productData.description && (
              <div className="space-y-2">
                <h3 className="font-semibold">Descrição</h3>
                <div>
                  <p className={`text-sm text-muted-foreground whitespace-pre-wrap transition-all duration-300 ease-in-out ${
                    !isDescriptionExpanded 
                      ? 'line-clamp-2' 
                      : 'max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-200'
                  }`}>
                    {productData.description}
                  </p>
                  <button
                    onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                    className="text-sm font-semibold text-orange-500 hover:text-orange-600 mt-1 transition-colors"
                  >
                    {isDescriptionExpanded ? 'Exibir menos' : 'Exibir mais...'}
                  </button>
                </div>
              </div>
            )}

            {/* Coupon */}
            {productData.coupon_code && (
              <div className="flex items-center justify-between gap-3 p-4 bg-accent/10 rounded-lg border-2 border-dashed border-accent">
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-sm font-medium">Cupom de desconto</p>
                    <p className="text-lg font-bold text-accent">{productData.coupon_code}</p>
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

          {/* Produtos Relacionados Mobile */}
          {relatedProducts.length > 0 && (
            <div className="px-4 py-6 border-t">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Flame className="h-6 w-6 text-primary" />
                  <h2 className="text-xl font-bold">
                    Mais ofertas de {productData.categories?.name}
                  </h2>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/", { state: { categorySlug: productData.categories?.slug } })}
                  className="shrink-0"
                >
                  Ver todas
                </Button>
              </div>
              <div className="space-y-4">
                {(relatedProducts as any[]).map((relatedProduct: any) => {
                  const isExpired = relatedProduct.expires_at ? new Date(relatedProduct.expires_at) < new Date() : false;
                  return (
                    <ProductCard
                      key={relatedProduct.id}
                      id={relatedProduct.id}
                      title={relatedProduct.title}
                      originalPrice={Number(relatedProduct.original_price)}
                      promotionalPrice={Number(relatedProduct.promotional_price)}
                      image={relatedProduct.image_url}
                      store={relatedProduct.stores?.name || "Loja"}
                      storeLogo={relatedProduct.stores?.logo_url}
                      discount={relatedProduct.discount_percentage}
                      timeAgo={formatDistanceToNow(new Date(relatedProduct.created_at), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                      isHot={relatedProduct.is_hot || false}
                      commentCount={relatedProduct.comments?.[0]?.count || 0}
                      isExpired={isExpired}
                      installmentCount={relatedProduct.installment_count}
                      hasInterest={relatedProduct.has_interest}
                    />
                  );
                })}
              </div>
            </div>
          )}
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
              <div className="space-y-4">
                <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                  <img
                    src={productData.image_url}
                    alt={productData.title}
                    fetchpriority="high"
                    decoding="async"
                    className={`h-full w-full object-cover ${isExpired ? 'grayscale' : ''}`}
                  />
                  {productData.is_hot && !isExpired && (
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
                
                {/* Share Button - Desktop */}
                <Button
                  variant="outline"
                  className="w-full justify-center gap-2 bg-green-50 hover:bg-green-100 border-green-500 text-green-700 font-semibold"
                  onClick={() => {
                    const shareUrl = window.location.href;
                    const shareText = `Confira esta oferta: ${productData.title} - R$ ${Number(productData.promotional_price).toFixed(2)}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, "_blank");
                  }}
                >
                  <MessageCircle className="h-5 w-5" />
                  Compartilhar
                </Button>
              </div>

              {/* Details */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge className="gradient-accent text-foreground font-bold text-lg px-4 py-1">
                      -{productData.discount_percentage}%
                    </Badge>
                    {productData.categories && (
                      <Badge variant="outline">{productData.categories.name}</Badge>
                    )}
                    {isExpired && (
                      <Badge variant="secondary" className="bg-muted text-muted-foreground font-bold">
                        EXPIRADA
                      </Badge>
                    )}
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-4">{productData.title}</h1>
                  
                  {productData.description && (
                    <div>
                      <p className={`text-muted-foreground whitespace-pre-wrap transition-all duration-300 ease-in-out ${
                        !isDescriptionExpanded 
                          ? 'line-clamp-2' 
                          : 'max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-500 scrollbar-track-gray-200'
                      }`}>
                        {productData.description}
                      </p>
                      <button
                        onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                        className="text-sm font-semibold text-orange-500 hover:text-orange-600 mt-1 transition-colors"
                      >
                        {isDescriptionExpanded ? 'Exibir menos' : 'Exibir mais...'}
                      </button>
                    </div>
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
                      R$ {Number(productData.promotional_price).toFixed(2)}
                    </span>
                    <span className="text-xl text-muted-foreground line-through">
                      R$ {Number(productData.original_price).toFixed(2)}
                    </span>
                  </div>
                  {productData.installment_count && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold bg-gradient-to-r from-pink-500 to-purple-600 text-white px-3 py-1.5 rounded">
                        Parcelado em até {productData.installment_count}x {productData.has_interest ? "Com Juros" : "Sem Juros"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Coupon */}
                {productData.coupon_code && (
                  <div className="flex items-center justify-between gap-3 p-4 bg-accent/10 rounded-lg border-2 border-dashed border-accent">
                    <div className="flex items-center gap-3">
                      <Tag className="h-5 w-5 text-accent" />
                      <div>
                        <p className="text-sm font-medium">Cupom de desconto</p>
                        <p className="text-lg font-bold text-accent">{productData.coupon_code}</p>
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
                {productData.stores && (
                  <div className="flex items-center gap-3 p-4 bg-muted/30 rounded-lg">
                    <Store className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground mb-2">Loja</p>
                      <StoreTag storeName={productData.stores.name} size="md" />
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
                  onClick={() => trackNavigation(id!, productData.title, productData.affiliate_link, productData.stores?.name || 'Loja')}
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

            {/* Produtos Relacionados */}
            {relatedProducts.length > 0 && (
              <div className="mt-12">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <Flame className="h-6 w-6 text-primary" />
                    <h2 className="text-2xl font-bold">
                      Mais ofertas de {productData.categories?.name}
                    </h2>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/", { state: { categorySlug: productData.categories?.slug } })}
                  >
                    Ver todas as ofertas
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {(relatedProducts as any[]).map((relatedProduct: any) => {
                    const isExpired = relatedProduct.expires_at ? new Date(relatedProduct.expires_at) < new Date() : false;
                    return (
                      <ProductCard
                        key={relatedProduct.id}
                        id={relatedProduct.id}
                        title={relatedProduct.title}
                        originalPrice={Number(relatedProduct.original_price)}
                        promotionalPrice={Number(relatedProduct.promotional_price)}
                        image={relatedProduct.image_url}
                        store={relatedProduct.stores?.name || "Loja"}
                        storeLogo={relatedProduct.stores?.logo_url}
                        discount={relatedProduct.discount_percentage}
                        timeAgo={formatDistanceToNow(new Date(relatedProduct.created_at), {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                        isHot={relatedProduct.is_hot || false}
                        commentCount={relatedProduct.comments?.[0]?.count || 0}
                        isExpired={isExpired}
                        installmentCount={relatedProduct.installment_count}
                        hasInterest={relatedProduct.has_interest}
                      />
                    );
                  })}
                </div>
              </div>
            )}
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

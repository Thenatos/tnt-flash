import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CategorySection } from "@/components/CategorySection";
import { ProductCard } from "@/components/ProductCard";
import { Footer } from "@/components/Footer";
import { JoinGroupsPopup } from "@/components/JoinGroupsPopup";
import { useProducts } from "@/hooks/useProducts";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAnalytics } from "@/hooks/useAnalytics";

const Index = () => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [showBestDeals, setShowBestDeals] = useState(false);
  const { data: products, isLoading } = useProducts(searchQuery, selectedCategory);
  const { trackEvent } = useAnalytics();
  const productsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    trackEvent('page_view');
  }, []);

  // Aplicar busca vinda de outra página
  useEffect(() => {
    if (location.state?.searchQuery) {
      setSearchQuery(location.state.searchQuery);
      setShowBestDeals(false);
      setSelectedCategory(undefined);
      
      // Scroll para produtos após aplicar busca
      setTimeout(() => {
        productsRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 300);
    }
  }, [location.state]);

  const handleBestDealsFilter = () => {
    setShowBestDeals(true);
    setSelectedCategory(undefined);
    setSearchQuery("");
  };

  const handleCategorySelect = (slug: string | undefined) => {
    setSelectedCategory(slug);
    setShowBestDeals(false);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setShowBestDeals(false);
    
    // Scroll suave para a seção de produtos quando uma busca é realizada
    if (query && productsRef.current) {
      setTimeout(() => {
        productsRef.current?.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'start' 
        });
      }, 100);
    }
  };

  const handleReset = () => {
    setSearchQuery("");
    setSelectedCategory(undefined);
    setShowBestDeals(false);
  };

  const filteredProducts = showBestDeals && products
    ? (() => {
        const now = new Date();
        const thirtyHoursAgo = new Date(now.getTime() - 36 * 60 * 60 * 1000);
        
        // Filtrar apenas produtos das últimas 36 horas
        const recentProducts = products.filter(product => 
          new Date(product.created_at) >= thirtyHoursAgo
        );
        
        // Separar expiradas e não expiradas
        const active = recentProducts.filter(p => !p.expires_at || new Date(p.expires_at) >= now);
        const expired = recentProducts.filter(p => p.expires_at && new Date(p.expires_at) < now);
        
        // Ordenar ativos por desconto
        const sortedActive = [...active].sort((a, b) => {
          const discountDiff = b.discount_percentage - a.discount_percentage;
          if (discountDiff !== 0) return discountDiff;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        
        // Ordenar expirados por desconto
        const sortedExpired = [...expired].sort((a, b) => {
          const discountDiff = b.discount_percentage - a.discount_percentage;
          if (discountDiff !== 0) return discountDiff;
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
        
        // Retornar ativos primeiro, expirados depois
        return [...sortedActive, ...sortedExpired];
      })()
    : (() => {
        if (!products) return products;
        const now = new Date();
        
        // Separar expiradas e não expiradas
        const active = products.filter(p => !p.expires_at || new Date(p.expires_at) >= now);
        const expired = products.filter(p => p.expires_at && new Date(p.expires_at) < now);
        
        // Retornar ativos primeiro (já ordenados por created_at), expirados depois
        return [...active, ...expired];
      })();

  return (
    <div className="min-h-screen flex flex-col">
      <JoinGroupsPopup />
      <Header
        onSearch={handleSearch}
        onCategorySelect={handleCategorySelect}
        onBestDealsFilter={handleBestDealsFilter}
        onReset={handleReset}
      />
      <Hero />
      <CategorySection 
        onCategorySelect={handleCategorySelect}
        selectedCategory={selectedCategory}
      />
      
      {/* Products Section */}
      <section ref={productsRef} className="py-12 flex-1">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-bold">
              {showBestDeals ? "Melhores Ofertas " : "Ofertas "}
              <span className="text-gradient-primary">{showBestDeals ? "(36h)" : "Recentes"}</span>
            </h2>
            <span className="text-sm text-muted-foreground">
              {filteredProducts?.length || 0} ofertas encontradas
            </span>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredProducts && filteredProducts.length > 0 ? (
            <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredProducts.map((product) => {
                const isExpired = product.expires_at ? new Date(product.expires_at) < new Date() : false;
                return (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    originalPrice={Number(product.original_price)}
                    promotionalPrice={Number(product.promotional_price)}
                    image={product.image_url}
                    store={product.stores?.name || "Loja"}
                    storeLogo={product.stores?.logo_url}
                    discount={product.discount_percentage}
                    timeAgo={formatDistanceToNow(new Date(product.created_at), {
                      addSuffix: true,
                      locale: ptBR,
                    })}
                    isHot={product.is_hot || false}
                    commentCount={product.comments?.[0]?.count || 0}
                    isExpired={isExpired}
                    installmentCount={product.installment_count}
                    hasInterest={product.has_interest}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">Nenhuma oferta encontrada</p>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;

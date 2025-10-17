import { useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CategorySection } from "@/components/CategorySection";
import { ProductCard } from "@/components/ProductCard";
import { Footer } from "@/components/Footer";
import { GoogleSignInPopup } from "@/components/GoogleSignInPopup";
import { useProducts } from "@/hooks/useProducts";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [showBestDeals, setShowBestDeals] = useState(false);
  const { data: products, isLoading } = useProducts(searchQuery, selectedCategory);

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
  };

  const filteredProducts = showBestDeals && products
    ? (() => {
        const now = new Date();
        const thirtyHoursAgo = new Date(now.getTime() - 36 * 60 * 60 * 1000);
        
        // Filtrar apenas produtos das últimas 36 horas
        const recentProducts = products.filter(product => 
          new Date(product.created_at) >= thirtyHoursAgo
        );
        
        // Ordenar por desconto (maior primeiro) como critério primário
        return [...recentProducts].sort((a, b) => {
          // Primeiro critério: maior desconto
          const discountDiff = b.discount_percentage - a.discount_percentage;
          if (discountDiff !== 0) return discountDiff;
          
          // Segundo critério: mais recente
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });
      })()
    : products;

  return (
    <div className="min-h-screen flex flex-col">
      <GoogleSignInPopup delayMs={8000} />
      <Header
        onSearch={handleSearch}
        onCategorySelect={handleCategorySelect}
        onBestDealsFilter={handleBestDealsFilter}
      />
      <Hero />
      <CategorySection 
        onCategorySelect={handleCategorySelect}
        selectedCategory={selectedCategory}
      />
      
      {/* Products Section */}
      <section className="py-12 flex-1">
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

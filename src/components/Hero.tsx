import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { ChevronLeft, ChevronRight, Zap, Percent, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHeroBanners } from "@/hooks/useHeroBanners";

export const Hero = () => {
  const { data: banners, isLoading } = useHeroBanners();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Adiciona o banner especial ao array de banners
  const allBanners = [
    ...(banners || []),
    { id: 'special-banner', isSpecial: true } as any
  ];

  // Primeiro banner real (não o especial)
  const firstBanner = banners?.[0];

  useEffect(() => {
    if (allBanners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % allBanners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [allBanners.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + allBanners.length) % allBanners.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % allBanners.length);
  };

  if (isLoading) {
    return (
      <section className="relative overflow-hidden gradient-explosive h-[400px] md:h-[500px]">
        <div className="container relative z-10 px-4 flex items-center justify-center h-full">
          <div className="animate-pulse">
            <div className="h-16 bg-white/20 rounded mb-4 w-96"></div>
            <div className="h-8 bg-white/20 rounded w-80"></div>
          </div>
        </div>
      </section>
    );
  }

  const currentBanner = allBanners[currentIndex];
  const isSpecialBanner = currentBanner?.isSpecial;

  return (
    <>
      {firstBanner && !firstBanner.isSpecial && (
        <Helmet>
          <link 
            rel="preload" 
            as="image" 
            href={firstBanner.image_url}
            fetchpriority="high"
          />
        </Helmet>
      )}
      <section className="relative overflow-hidden">
      <div className="relative h-[400px] md:h-[500px]">
        {/* Banners normais com imagem */}
        {allBanners.map((banner, index) => {
          if (banner.isSpecial) return null;
          
          return (
            <div
              key={banner.id}
              className={`absolute inset-0 transition-opacity duration-700 ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
            >
              <img
                src={banner.image_url}
                alt={banner.title}
                loading={index === 0 ? "eager" : "lazy"}
                fetchpriority={index === 0 ? "high" : "low"}
                decoding="async"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
              
              {/* Conteúdo do banner */}
              <div className="absolute inset-0 z-10 flex items-center">
                <div className="container px-4">
                  <div className="max-w-3xl">
                    <h2 className="text-3xl md:text-6xl font-bold tracking-tight text-white mb-3 animate-fade-in">
                      {banner.title}
                    </h2>
                    {banner.subtitle && (
                      <p className="text-lg md:text-2xl text-white/95 font-medium animate-fade-in">
                        {banner.subtitle}
                      </p>
                    )}
                    {banner.link_url && (
                      <Button
                        size="lg"
                        className="mt-6 gradient-accent hover:opacity-90 font-bold shadow-lg animate-fade-in"
                        onClick={() => window.open(banner.link_url, "_blank")}
                      >
                        Ver Oferta
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Banner especial com estatísticas */}
        <div
          className={`absolute inset-0 transition-opacity duration-700 ${
            isSpecialBanner ? "opacity-100" : "opacity-0"
          }`}
        >
          <div className="relative overflow-hidden gradient-explosive h-full">
            {/* Decorative elements */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-accent blur-3xl" />
              <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-secondary blur-3xl" />
            </div>

            <div className="container relative z-10 px-4 h-full flex items-center">
              <div className="max-w-4xl mx-auto text-center text-white w-full">
                {/* Main heading */}
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Zap className="h-12 w-12 md:h-16 md:w-16 text-accent animate-pulse" />
                  <h2 className="text-5xl md:text-7xl font-bold tracking-tight">
                    OFERTAS EXPLOSIVAS
                  </h2>
                  <Percent className="h-12 w-12 md:h-16 md:w-16 text-accent animate-pulse" />
                </div>

                <p className="text-xl md:text-2xl mb-8 text-white/90 font-medium">
                  As melhores promoções do Brasil em um só lugar!
                </p>

                {/* Stats */}
                <div className="flex flex-wrap justify-center gap-6 md:gap-12 mb-8">
                  <div className="flex items-center gap-2">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                      <TrendingDown className="h-6 w-6 text-accent" />
                    </div>
                    <div className="text-left">
                      <div className="text-2xl md:text-3xl font-bold">1000+</div>
                      <div className="text-sm text-white/80">Ofertas Ativas</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                      <Percent className="h-6 w-6 text-accent" />
                    </div>
                    <div className="text-left">
                      <div className="text-2xl md:text-3xl font-bold">Até 80%</div>
                      <div className="text-sm text-white/80">de Desconto</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                      <Zap className="h-6 w-6 text-accent" />
                    </div>
                    <div className="text-left">
                      <div className="text-2xl md:text-3xl font-bold">24/7</div>
                      <div className="text-sm text-white/80">Atualizações</div>
                    </div>
                  </div>
                </div>

                <p className="text-white/90 max-w-2xl mx-auto">
                  Economize tempo e dinheiro! Encontre cupons de desconto, ofertas relâmpago e as melhores promoções das maiores lojas do Brasil.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {allBanners.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 text-white rounded-full"
              onClick={handleNext}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          </>
        )}

        {/* Dots Indicator */}
        {allBanners.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {allBanners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-white w-8"
                    : "bg-white/50 hover:bg-white/75"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
    </>
  );
};

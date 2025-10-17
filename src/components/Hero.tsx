import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useHeroBanners } from "@/hooks/useHeroBanners";

export const Hero = () => {
  const { data: banners, isLoading } = useHeroBanners();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!banners || banners.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000); // Troca a cada 5 segundos

    return () => clearInterval(interval);
  }, [banners]);

  const handlePrevious = () => {
    if (!banners) return;
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const handleNext = () => {
    if (!banners) return;
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (isLoading) {
    return (
      <section className="relative overflow-hidden gradient-explosive py-12 md:py-20">
        <div className="container relative z-10 px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <div className="animate-pulse">
              <div className="h-16 bg-white/20 rounded mb-4"></div>
              <div className="h-8 bg-white/20 rounded"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!banners || banners.length === 0) {
    return (
      <section className="relative overflow-hidden gradient-explosive py-12 md:py-20">
        <div className="container relative z-10 px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-4">
              OFERTAS EXPLOSIVAS
            </h2>
            <p className="text-xl md:text-2xl text-white/90 font-medium">
              As melhores promoções do Brasil em um só lugar!
            </p>
          </div>
        </div>
      </section>
    );
  }

  const currentBanner = banners[currentIndex];

  return (
    <section className="relative overflow-hidden">
      {/* Banner Image Background */}
      <div className="relative h-[400px] md:h-[500px]">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={banner.image_url}
              alt={banner.title}
              className="w-full h-full object-cover"
            />
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent"></div>
          </div>
        ))}

        {/* Content */}
        <div className="absolute inset-0 z-10 flex items-center">
          <div className="container px-4">
            <div className="max-w-3xl">
              <h2 className="text-4xl md:text-7xl font-bold tracking-tight text-white mb-4 animate-fade-in">
                {currentBanner.title}
              </h2>
              {currentBanner.subtitle && (
                <p className="text-xl md:text-3xl text-white/95 font-medium animate-fade-in">
                  {currentBanner.subtitle}
                </p>
              )}
              {currentBanner.link_url && (
                <Button
                  size="lg"
                  className="mt-6 gradient-accent hover:opacity-90 font-bold shadow-lg animate-fade-in"
                  onClick={() => window.open(currentBanner.link_url, "_blank")}
                >
                  Ver Oferta
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {banners.length > 1 && (
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
        {banners.length > 1 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {banners.map((_, index) => (
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
  );
};

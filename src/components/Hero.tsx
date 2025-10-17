import { Zap, Percent, TrendingDown } from "lucide-react";

export const Hero = () => {
  return (
    <section className="relative overflow-hidden gradient-explosive py-12 md:py-20">
      {/* Decorative elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 rounded-full bg-accent blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 rounded-full bg-secondary blur-3xl" />
      </div>

      <div className="container relative z-10 px-4">
        <div className="max-w-4xl mx-auto text-center text-white">
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
    </section>
  );
};

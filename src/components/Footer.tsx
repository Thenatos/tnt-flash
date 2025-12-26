import { MessageCircle, Send, Instagram } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Footer = () => {
  return (
    <footer className="gradient-primary text-white py-12 mt-20">
      <div className="container px-4">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="text-2xl font-bold mb-4">TNT OFERTAS</h3>
            <p className="text-white/80 mb-4">
              As melhores ofertas e promoções do Brasil em um só lugar. Economize tempo e dinheiro!
            </p>
          </div>

          {/* Social Channels */}
          <div>
            <h4 className="text-xl font-bold mb-4">Nossos Canais</h4>
            <div className="space-y-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white hover:text-white hover:bg-white/10"
                onClick={() => window.open('https://www.instagram.com/canaltntofertas/', '_blank')}
              >
                <Instagram className="h-5 w-5 mr-2" />
                Instagram
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white hover:text-white hover:bg-white/10"
                onClick={() => window.open('https://chat.whatsapp.com/IsXhhKLkxNPEywfx0IYG3e', '_blank')}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Grupo WhatsApp
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-white hover:text-white hover:bg-white/10"
                onClick={() => window.open('https://t.me/+NZ_5GVaIt342NTRh', '_blank')}
              >
                <Send className="h-5 w-5 mr-2" />
                Canal Telegram
              </Button>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xl font-bold mb-4">Links Rápidos</h4>
            <div className="space-y-2">
              <a href="/termos" className="block text-white/80 hover:text-white transition-colors">
                Termos de Uso
              </a>
              <a href="/privacidade" className="block text-white/80 hover:text-white transition-colors">
                Política de Privacidade
              </a>
              <a href="/conduta" className="block text-white/80 hover:text-white transition-colors">
                Código de Conduta
              </a>
            </div>
          </div>
        </div>

        <p className="text-center text-white/60 text-sm mt-8 pt-8 border-t border-white/20">
          © 2025 TNT Ofertas. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
};

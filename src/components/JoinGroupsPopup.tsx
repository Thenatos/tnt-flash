import { useState, useEffect } from "react";
import { X, MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface JoinGroupsPopupProps {
  whatsappLink: string;
  telegramLink: string;
}

export const JoinGroupsPopup = ({ whatsappLink, telegramLink }: JoinGroupsPopupProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    // Mostrar popup após 3 segundos
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleMinimize = () => {
    setIsMinimized(true);
    setIsOpen(false);
  };

  const handleExpand = () => {
    setIsMinimized(false);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  if (!isOpen && !isMinimized) return null;

  return (
    <>
      {/* Popup Expandido */}
      {isOpen && !isMinimized && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-4 fade-in duration-300">
          <Card className="w-80 shadow-2xl border-2 border-primary/20">
            <CardHeader className="relative pb-3">
              <Button
                variant="ghost"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={handleMinimize}
              >
                <X className="h-4 w-4" />
              </Button>
              <CardTitle className="flex items-center gap-2 text-lg">
                <MessageCircle className="h-5 w-5 text-primary" />
                Junte-se aos nossos grupos!
              </CardTitle>
              <CardDescription>
                Receba as melhores ofertas em primeira mão
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Participe das nossas comunidades e não perca nenhuma promoção imperdível! 🔥
              </p>

              <div className="space-y-2">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 hover:bg-green-50 hover:border-green-500 hover:text-green-700 transition-all"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Entrar no WhatsApp
                  </Button>
                </a>

                <a
                  href={telegramLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2 hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700 transition-all"
                  >
                    <Send className="h-4 w-4" />
                    Entrar no Telegram
                  </Button>
                </a>
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={handleClose}
              >
                Não mostrar novamente
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ícone Minimizado */}
      {isMinimized && !isOpen && (
        <button
          onClick={handleExpand}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-primary text-primary-foreground shadow-2xl hover:scale-110 transition-all duration-200 animate-in zoom-in-50 fade-in flex items-center justify-center group"
        >
          <MessageCircle className="h-6 w-6 animate-pulse" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full animate-ping"></span>
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive rounded-full"></span>
          
          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Entre nos grupos!
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </button>
      )}
    </>
  );
};

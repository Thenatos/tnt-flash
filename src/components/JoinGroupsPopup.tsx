import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useActiveSocialGroups } from "@/hooks/useSocialGroups";

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>
);

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.015-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.009-1.252-.242-1.865-.442-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635.099-.002.321.023.465.14.121.098.155.23.171.324.016.094.037.308.021.475z"/>
  </svg>
);

export const JoinGroupsPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const { data: groups, isLoading } = useActiveSocialGroups();

  useEffect(() => {
    // Mostrar popup minimizado após 3 segundos
    const timer = setTimeout(() => {
      setIsMinimized(true);
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

  if (isLoading || !groups || groups.length === 0) return null;

  if (!isOpen && !isMinimized) return null;

  const hasWhatsApp = groups.some(g => g.platform === "whatsapp");
  const hasTelegram = groups.some(g => g.platform === "telegram");

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
                {hasWhatsApp && <WhatsAppIcon />}
                {hasTelegram && <TelegramIcon />}
                Junte-se aos nossos grupos!
              </CardTitle>
              <CardDescription>
                Receba as melhores ofertas em primeira mão
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Participe da nossa comunidade e não perca nenhuma promoção imperdível! 🔥
              </p>

              <div className="space-y-2">
                {groups.map((group) => (
                  <a
                    key={group.id}
                    href={group.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <Button
                      variant="outline"
                      className={`w-full justify-start gap-2 transition-all ${
                        group.platform === "whatsapp"
                          ? "hover:bg-green-50 hover:border-green-500 hover:text-green-700"
                          : "hover:bg-blue-50 hover:border-blue-500 hover:text-blue-700"
                      }`}
                    >
                      {group.platform === "whatsapp" ? <WhatsAppIcon /> : <TelegramIcon />}
                      {group.name}
                    </Button>
                  </a>
                ))}
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
          className={`fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-2xl hover:scale-110 transition-all duration-200 animate-in zoom-in-50 fade-in flex items-center justify-center group ${
            hasWhatsApp ? "bg-green-500 hover:bg-green-600" : "bg-blue-500 hover:bg-blue-600"
          } text-white`}
        >
          {hasWhatsApp && <WhatsAppIcon />}
          {!hasWhatsApp && hasTelegram && <TelegramIcon />}
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

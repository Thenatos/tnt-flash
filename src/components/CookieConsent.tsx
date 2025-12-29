import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cookie, Shield, Settings } from "lucide-react";
import { hasConsentResponse, setConsent } from "@/utils/cookies";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    try {
      // Verifica se o usuário já respondeu sobre cookies
      const hasResponse = hasConsentResponse();
      setShowBanner(!hasResponse);
    } catch (error) {
      console.error("Erro ao verificar consentimento de cookies:", error);
      setShowBanner(false);
    }
  }, []);

  const handleAccept = () => {
    try {
      setConsent(true);
      setShowBanner(false);
    } catch (error) {
      console.error("Erro ao aceitar cookies:", error);
    }
  };

  const handleReject = () => {
    try {
      setConsent(false);
      setShowBanner(false);
    } catch (error) {
      console.error("Erro ao rejeitar cookies:", error);
    }
  };

  if (!showBanner) return null;

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom duration-500">
        <Card className="max-w-4xl mx-auto p-6 shadow-2xl border-2">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            {/* Icon */}
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Cookie className="h-6 w-6 text-primary" />
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">🍪 Cookies e Privacidade</h3>
                <Shield className="h-4 w-4 text-green-600" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Utilizamos cookies para melhorar sua experiência, personalizar conteúdo, analisar o tráfego 
                e rastrear comissionamento de produtos afiliados. Ao clicar em "Aceitar", você concorda com 
                o uso de cookies conforme nossa{" "}
                <Link to="/privacy" className="text-primary underline hover:text-primary/80">
                  Política de Privacidade
                </Link>
                . Seus dados são protegidos seguindo a LGPD.
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Button
                variant="outline"
                onClick={() => setShowSettings(true)}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Configurar
              </Button>
              <Button
                onClick={handleAccept}
                className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <Cookie className="h-4 w-4" />
                Aceitar Cookies
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Modal de Configurações */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurações de Cookies
            </DialogTitle>
            <DialogDescription className="space-y-4 pt-4">
              <div className="space-y-3">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Cookie className="h-4 w-4" />
                    Cookies Essenciais
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Necessários para o funcionamento básico do site. Não podem ser desativados.
                  </p>
                </div>

                <div className="p-4 bg-muted/50 rounded-lg">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    Cookies de Rastreamento e Analytics
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Utilizados para rastrear cliques em links de afiliados, melhorar comissionamento 
                    e analisar o uso do site para melhorias futuras.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  Ao aceitar cookies, você concorda com nossa{" "}
                  <Link to="/privacy" className="text-primary underline hover:text-primary/80">
                    Política de Privacidade
                  </Link>{" "}
                  em conformidade com a LGPD.
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={handleReject}
              className="w-full sm:w-auto"
            >
              Rejeitar Todos
            </Button>
            <Button
              onClick={handleAccept}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Aceitar Todos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Cookie, Shield, X } from "lucide-react";
import { hasConsentResponse, setConsent } from "@/utils/cookies";
import { Link } from "react-router-dom";

export const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Verifica se o usuário já respondeu sobre cookies
    const hasResponse = hasConsentResponse();
    setShowBanner(!hasResponse);
  }, []);

  const handleAccept = () => {
    setConsent(true);
    setShowBanner(false);
  };

  const handleReject = () => {
    setConsent(false);
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
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
              onClick={handleReject}
              className="gap-2"
            >
              Rejeitar
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
  );
};

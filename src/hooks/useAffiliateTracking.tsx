import { useEffect, useCallback } from "react";
import { trackAffiliateClick, getOrCreateSessionId, hasConsent } from "@/utils/cookies";
import { useAnalytics } from "./useAnalytics";

/**
 * Hook para rastrear cliques em links de afiliados
 */
export const useAffiliateTracking = () => {
  const { trackEvent } = useAnalytics();

  // Inicializa sessão do usuário quando há consentimento
  useEffect(() => {
    try {
      if (hasConsent()) {
        getOrCreateSessionId();
      }
    } catch (error) {
      console.error("Erro ao inicializar sessão:", error);
    }
  }, []);

  /**
   * Rastreia um clique em link de afiliado
   */
  const trackClick = useCallback(
    (productId: string, productTitle: string, affiliateLink: string, store: string) => {
      try {
        if (!hasConsent()) {
          console.log("Rastreamento de afiliados não autorizado - sem consentimento");
          return;
        }

        // Salva nos cookies
        trackAffiliateClick(productId, affiliateLink);

        // Envia evento para analytics
        trackEvent("affiliate_click", {
          product_id: productId,
          product_title: productTitle,
          store: store,
          session_id: getOrCreateSessionId(),
          timestamp: new Date().toISOString(),
        });

        console.log("✅ Clique em afiliado rastreado:", {
          productId,
          productTitle,
          store,
        });
      } catch (error) {
        console.error("Erro ao rastrear clique de afiliado:", error);
      }
    },
    [trackEvent]
  );

  /**
   * Rastreia quando um usuário sai para o link de afiliado
   */
  const trackNavigation = useCallback(
    (productId: string, productTitle: string, affiliateLink: string, store: string) => {
      try {
        trackClick(productId, productTitle, affiliateLink, store);

        // Pequeno delay para garantir que o tracking foi salvo antes de navegar
        setTimeout(() => {
          window.open(affiliateLink, "_blank");
        }, 100);
      } catch (error) {
        console.error("Erro ao rastrear navegação:", error);
        // Mesmo com erro, abre o link
        window.open(affiliateLink, "_blank");
      }
    },
    [trackClick]
  );

  return {
    trackClick,
    trackNavigation,
    hasConsent: hasConsent(),
  };
};

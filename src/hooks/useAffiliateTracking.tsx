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
    if (hasConsent()) {
      getOrCreateSessionId();
    }
  }, []);

  /**
   * Rastreia um clique em link de afiliado
   */
  const trackClick = useCallback(
    (productId: string, productTitle: string, affiliateLink: string, store: string) => {
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
    },
    [trackEvent]
  );

  /**
   * Rastreia quando um usuário sai para o link de afiliado
   */
  const trackNavigation = useCallback(
    (productId: string, productTitle: string, affiliateLink: string, store: string) => {
      trackClick(productId, productTitle, affiliateLink, store);

      // Pequeno delay para garantir que o tracking foi salvo antes de navegar
      setTimeout(() => {
        window.open(affiliateLink, "_blank");
      }, 100);
    },
    [trackClick]
  );

  return {
    trackClick,
    trackNavigation,
    hasConsent: hasConsent(),
  };
};

import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export const useAnalytics = () => {
  const { user } = useAuth();

  const getSessionId = () => {
    let sessionId = sessionStorage.getItem('analytics_session_id');
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('analytics_session_id', sessionId);
    }
    return sessionId;
  };

  const trackEvent = async (
    eventType: string,
    eventData?: Record<string, any>,
    productId?: string
  ) => {
    try {
      await supabase.from('analytics_events').insert({
        event_type: eventType,
        event_data: eventData || {},
        user_id: user?.id || null,
        session_id: getSessionId(),
        page_path: window.location.pathname,
        product_id: productId || null,
      });
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  };

  return { trackEvent };
};

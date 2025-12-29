// Gerenciamento de Cookies seguindo LGPD

export interface CookieOptions {
  expires?: number; // dias até expirar
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

/**
 * Define um cookie
 */
export const setCookie = (
  name: string,
  value: string,
  options: CookieOptions = {}
): void => {
  const {
    expires = 365,
    path = '/',
    domain,
    secure = true,
    sameSite = 'Lax',
  } = options;

  let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (expires) {
    const date = new Date();
    date.setTime(date.getTime() + expires * 24 * 60 * 60 * 1000);
    cookieString += `; expires=${date.toUTCString()}`;
  }

  cookieString += `; path=${path}`;

  if (domain) {
    cookieString += `; domain=${domain}`;
  }

  if (secure) {
    cookieString += '; secure';
  }

  cookieString += `; SameSite=${sameSite}`;

  document.cookie = cookieString;
};

/**
 * Obtém o valor de um cookie
 */
export const getCookie = (name: string): string | null => {
  const nameEQ = encodeURIComponent(name) + '=';
  const cookies = document.cookie.split(';');

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }

  return null;
};

/**
 * Remove um cookie
 */
export const removeCookie = (
  name: string,
  path: string = '/',
  domain?: string
): void => {
  setCookie(name, '', {
    expires: -1,
    path,
    domain,
  });
};

/**
 * Verifica se o usuário deu consentimento para cookies
 */
export const hasConsent = (): boolean => {
  return getCookie('cookie_consent') === 'accepted';
};

/**
 * Define o consentimento do usuário
 */
export const setConsent = (accepted: boolean): void => {
  if (accepted) {
    setCookie('cookie_consent', 'accepted', { expires: 365 });
  } else {
    setCookie('cookie_consent', 'rejected', { expires: 365 });
    // Remove cookies de rastreamento se o usuário rejeitou
    removeCookie('affiliate_tracking');
    removeCookie('user_session');
  }
};

/**
 * Verifica se já existe uma resposta de consentimento
 */
export const hasConsentResponse = (): boolean => {
  const consent = getCookie('cookie_consent');
  return consent === 'accepted' || consent === 'rejected';
};

/**
 * Rastreia clique em link de afiliado
 */
export const trackAffiliateClick = (productId: string, affiliateLink: string): void => {
  if (!hasConsent()) return;

  const trackingData = {
    productId,
    affiliateLink,
    timestamp: new Date().toISOString(),
    referrer: document.referrer,
    userAgent: navigator.userAgent,
  };

  // Armazena dados de rastreamento
  const existingData = getCookie('affiliate_tracking');
  const trackingArray = existingData ? JSON.parse(existingData) : [];
  
  trackingArray.push(trackingData);
  
  // Mantém apenas os últimos 10 cliques
  const limitedTracking = trackingArray.slice(-10);
  
  setCookie('affiliate_tracking', JSON.stringify(limitedTracking), { expires: 30 });
};

/**
 * Obtém dados de rastreamento de afiliados
 */
export const getAffiliateTracking = (): any[] => {
  if (!hasConsent()) return [];
  
  const data = getCookie('affiliate_tracking');
  return data ? JSON.parse(data) : [];
};

/**
 * Cria um ID de sessão único para o usuário
 */
export const getOrCreateSessionId = (): string => {
  if (!hasConsent()) return '';
  
  let sessionId = getCookie('user_session');
  
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setCookie('user_session', sessionId, { expires: 30 });
  }
  
  return sessionId;
};

// Regex para detectar URLs em texto
const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
const DOMAIN_REGEX = /(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b/gi;

export const containsLink = (text: string): boolean => {
  // Verifica URLs completas
  if (URL_REGEX.test(text)) {
    return true;
  }
  
  // Verifica domínios sem protocolo (ex: google.com)
  const words = text.split(/\s+/);
  for (const word of words) {
    if (DOMAIN_REGEX.test(word) && word.includes('.')) {
      return true;
    }
  }
  
  return false;
};

export const validateCommentContent = (content: string): { valid: boolean; error?: string } => {
  if (containsLink(content)) {
    return {
      valid: false,
      error: "Links não são permitidos em comentários. Por favor, remova os links e tente novamente.",
    };
  }
  
  return { valid: true };
};

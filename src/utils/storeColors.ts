// Configuração de cores para as tags das lojas
export interface StoreColorConfig {
  from: string;
  to: string;
  text: string;
}

export const storeColors: Record<string, StoreColorConfig> = {
  // Cores especificadas
  "Amazon": {
    from: "#87CEEB", // Azul claro
    to: "#4A9ECD",
    text: "#FFFFFF"
  },
  "Americanas": {
    from: "#FF4444", // Vermelho
    to: "#CC0000",
    text: "#FFFFFF"
  },
  "Shopee": {
    from: "#FF6B35", // Laranja
    to: "#E84A1A",
    text: "#FFFFFF"
  },
  "Mercado Livre": {
    from: "#FFE135", // Amarelo
    to: "#FFC300",
    text: "#1F2937"
  },
  // Cores adicionais seguindo o padrão
  "Magazine Luiza": {
    from: "#0086D6", // Azul Magalu
    to: "#005A9C",
    text: "#FFFFFF"
  },
  "Casas Bahia": {
    from: "#FF8C00", // Laranja Casas Bahia
    to: "#CC6600",
    text: "#FFFFFF"
  },
  "AliExpress": {
    from: "#E62E04", // Vermelho AliExpress
    to: "#B32400",
    text: "#FFFFFF"
  },
  "Shein": {
    from: "#FF69B4", // Rosa
    to: "#E91E63",
    text: "#FFFFFF"
  },
  "Submarino": {
    from: "#FF6F00", // Laranja Submarino
    to: "#E65100",
    text: "#FFFFFF"
  },
  "Extra": {
    from: "#0066CC", // Azul Extra
    to: "#004C99",
    text: "#FFFFFF"
  },
  "Ponto Frio": {
    from: "#0047BB", // Azul Ponto Frio
    to: "#003399",
    text: "#FFFFFF"
  },
  "Carrefour": {
    from: "#005FAA", // Azul Carrefour
    to: "#003D7A",
    text: "#FFFFFF"
  },
  "Kabum": {
    from: "#FF6600", // Laranja Kabum
    to: "#E65500",
    text: "#FFFFFF"
  },
  "Pichau": {
    from: "#FF3333", // Vermelho Pichau
    to: "#CC0000",
    text: "#FFFFFF"
  },
  "Terabyte": {
    from: "#00CC66", // Verde
    to: "#009944",
    text: "#FFFFFF"
  },
  "Centauro": {
    from: "#FFD700", // Dourado
    to: "#FFA500",
    text: "#1F2937"
  },
  "Nike": {
    from: "#111111", // Preto Nike
    to: "#333333",
    text: "#FFFFFF"
  },
  "Adidas": {
    from: "#000000", // Preto Adidas
    to: "#1E3A8A",
    text: "#FFFFFF"
  },
  "Netshoes": {
    from: "#9333EA", // Roxo
    to: "#7E22CE",
    text: "#FFFFFF"
  },
  "Renner": {
    from: "#DC2626", // Vermelho Renner
    to: "#991B1B",
    text: "#FFFFFF"
  },
  "C&A": {
    from: "#EF4444", // Vermelho C&A
    to: "#B91C1C",
    text: "#FFFFFF"
  },
  "Zara": {
    from: "#1F2937", // Cinza escuro
    to: "#0F172A",
    text: "#FFFFFF"
  },
};

// Cor padrão para lojas não mapeadas
export const defaultStoreColor: StoreColorConfig = {
  from: "#6B7280", // Cinza
  to: "#4B5563",
  text: "#FFFFFF"
};

export function getStoreColor(storeName: string): StoreColorConfig {
  return storeColors[storeName] || defaultStoreColor;
}

export function getStoreGradientClass(storeName: string): string {
  const color = getStoreColor(storeName);
  return `bg-gradient-to-r from-[${color.from}] to-[${color.to}] text-[${color.text}]`;
}

export function getStoreGradientStyle(storeName: string): React.CSSProperties {
  const color = getStoreColor(storeName);
  return {
    background: `linear-gradient(to right, ${color.from}, ${color.to})`,
    color: color.text,
  };
}

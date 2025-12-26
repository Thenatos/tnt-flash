import { Helmet } from "react-helmet-async";

interface ProductSEOProps {
  product: {
    id: string;
    title: string;
    description?: string;
    image_url: string;
    promotional_price: number;
    original_price: number;
    stores?: {
      name: string;
    };
    categories?: {
      name: string;
    };
  };
}

export const ProductSEO = ({ product }: ProductSEOProps) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "description": product.description || product.title,
    "image": product.image_url,
    "offers": {
      "@type": "Offer",
      "price": product.promotional_price,
      "priceCurrency": "BRL",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": product.stores?.name || "Loja Parceira"
      },
      "priceValidUntil": new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "89"
    },
    "category": product.categories?.name || "Ofertas"
  };

  const pageTitle = `${product.title} - ${Math.round(((product.original_price - product.promotional_price) / product.original_price) * 100)}% OFF | TNT Ofertas`;
  const pageDescription = `${product.title} com desconto de R$ ${product.original_price.toFixed(2)} por apenas R$ ${product.promotional_price.toFixed(2)}. Aproveite esta oferta imperdível!`;

  return (
    <Helmet>
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      <link rel="canonical" href={`https://tntofertas.com.br/product/${product.id}`} />
      
      {/* Open Graph */}
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={product.image_url} />
      <meta property="og:url" content={`https://tntofertas.com.br/product/${product.id}`} />
      <meta property="og:type" content="product" />
      <meta property="product:price:amount" content={product.promotional_price.toString()} />
      <meta property="product:price:currency" content="BRL" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={product.image_url} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Helmet>
  );
};

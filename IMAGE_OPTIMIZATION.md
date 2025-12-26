# 🚀 Otimização de Imagens - TNT Ofertas

## ⚡ Melhorias Implementadas

### 1. **Lazy Loading**
- ✅ Todas as imagens de produtos usam `loading="lazy"`
- ✅ Banners: primeiro banner com `loading="eager"`, demais com `lazy`
- ✅ `decoding="async"` para não bloquear o rendering

### 2. **FetchPriority**
- ✅ Logo do header: `fetchPriority="high"` (critical)
- ✅ Primeiro banner: `fetchPriority="high"`
- ✅ Imagem do produto na página de detalhes: `fetchPriority="high"`
- ✅ Demais imagens: `fetchPriority="low"` ou padrão

### 3. **Dimensões Especificadas**
- ✅ Logo tem width e height definidos (evita CLS)

---

## 📦 Próximos Passos - Otimizar Logo

### Opção 1: Usando Ferramentas Online

1. **Converter para WebP:**
   - Acesse: https://cloudconvert.com/png-to-webp
   - Faça upload de `src/assets/logo.png`
   - Converta para WebP
   - Download e salve como `src/assets/logo.webp`

2. **Redimensionar:**
   - Acesse: https://www.iloveimg.com/resize-image
   - Upload do logo original
   - Redimensione para 96x96px (2x do tamanho exibido)
   - Salve como `logo-96.webp`

### Opção 2: Usando ImageMagick (linha de comando)

```bash
# Instale ImageMagick
# Windows: https://imagemagick.org/script/download.php

# Converter e redimensionar
magick src/assets/logo.png -resize 96x96 -quality 85 src/assets/logo-96.webp
magick src/assets/logo.png -resize 192x192 -quality 85 src/assets/logo-192.webp
```

### Opção 3: Usando Sharp (Node.js)

```bash
npm install sharp --save-dev
```

Criar script `optimize-logo.js`:
```javascript
const sharp = require('sharp');

async function optimizeLogo() {
  // WebP 96x96
  await sharp('src/assets/logo.png')
    .resize(96, 96)
    .webp({ quality: 85 })
    .toFile('src/assets/logo-96.webp');
  
  // WebP 192x192 para telas Retina
  await sharp('src/assets/logo.png')
    .resize(192, 192)
    .webp({ quality: 85 })
    .toFile('src/assets/logo-192.webp');
  
  console.log('✅ Logos otimizados!');
}

optimizeLogo();
```

Executar:
```bash
node optimize-logo.js
```

---

## 🖼️ Imagens do Supabase (Produtos/Banners)

### Configurar Transformação Automática no Supabase

No upload de imagens, adicione transformação WebP:

```typescript
// Exemplo no ProductForm.tsx ao fazer upload
const { data, error } = await supabase.storage
  .from('product-images')
  .upload(filePath, file, {
    cacheControl: '3600',
    upsert: false,
    // Supabase faz transformação automática para WebP se disponível
  });

// Ao buscar a URL, adicione parâmetros de transformação:
const imageUrl = `${baseUrl}?width=600&format=webp`;
```

### Otimização Manual de Imagens Existentes

Para imagens já upadas, você pode:

1. **Criar Function no Supabase** que converte automaticamente
2. **Usar CDN** como Cloudflare Images (transformação on-the-fly)
3. **Re-upload** das imagens mais importantes já otimizadas

---

## 📊 Checklist de Otimização

- [x] Lazy loading em imagens de produtos
- [x] Lazy loading em banners (exceto primeiro)
- [x] fetchPriority="high" em imagens críticas
- [x] decoding="async" em todas as imagens
- [x] width/height no logo
- [ ] Logo convertido para WebP
- [ ] Logo redimensionado (96x96 e 192x192)
- [ ] Imagens do Supabase com WebP
- [ ] Implementar srcset para imagens responsivas

---

## 🎯 Resultados Esperados

### Antes:
- Logo: 1.922 KB (1024x1024)
- Banners: ~110 KB cada
- Produtos: ~60 KB cada

### Depois (esperado):
- Logo WebP: ~15 KB (96x96)
- Redução: **92% menor**
- LCP improvement: **~1-2 segundos**
- Performance Score: **+15-20 pontos**

---

## 🔧 Implementação Futura - srcset

Para imagens responsivas completas:

```tsx
<img
  src={`${imageUrl}?width=600&format=webp`}
  srcSet={`
    ${imageUrl}?width=300&format=webp 300w,
    ${imageUrl}?width=600&format=webp 600w,
    ${imageUrl}?width=900&format=webp 900w
  `}
  sizes="(max-width: 768px) 100vw, 600px"
  alt={title}
  loading="lazy"
  decoding="async"
/>
```

---

**Última atualização**: 26/12/2025

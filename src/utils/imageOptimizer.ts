/**
 * Otimiza imagem convertendo para WebP e redimensionando
 * @param file - Arquivo de imagem original
 * @param maxWidth - Largura máxima (padrão: 800px)
 * @param maxHeight - Altura máxima (padrão: 800px)
 * @param quality - Qualidade WebP 0-1 (padrão: 0.85)
 * @returns Promise com o arquivo otimizado
 */
export async function optimizeImage(
  file: File,
  maxWidth: number = 800,
  maxHeight: number = 800,
  quality: number = 0.85
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onerror = () => reject(new Error('Erro ao ler o arquivo'));
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onerror = () => reject(new Error('Erro ao carregar a imagem'));
      
      img.onload = () => {
        try {
          // Calcula dimensões mantendo proporção
          let width = img.width;
          let height = img.height;
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          
          // Cria canvas para redimensionar
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Não foi possível criar contexto do canvas'));
            return;
          }
          
          // Desenha imagem redimensionada
          ctx.drawImage(img, 0, 0, width, height);
          
          // Converte para WebP
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error('Erro ao converter imagem'));
                return;
              }
              
              // Cria novo arquivo WebP
              const originalName = file.name.replace(/\.[^/.]+$/, '');
              const optimizedFile = new File(
                [blob],
                `${originalName}.webp`,
                { type: 'image/webp' }
              );
              
              console.log(`✅ Imagem otimizada: ${file.size} bytes → ${optimizedFile.size} bytes (${Math.round((1 - optimizedFile.size / file.size) * 100)}% menor)`);
              
              resolve(optimizedFile);
            },
            'image/webp',
            quality
          );
        } catch (error) {
          reject(error);
        }
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Valida se o arquivo é uma imagem
 */
export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Formata tamanho de arquivo para exibição
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

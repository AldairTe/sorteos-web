/**
 * Super compresión de imágenes en el panel Admin mediante HTML5 Canvas.
 * Reduce fotos pesadas (5MB - 10MB) a ~70KB - 120KB manteniendo
 * excelente calidad visual para el carrusel del Salón de la Fama.
 */
export async function comprimirImagen(file: File, maxDim = 1200, calidad = 0.70): Promise<{
  file: File;
  pesoOriginalKb: number;
  pesoFinalKb: number;
  ahorroPorcentaje: number;
}> {
  const pesoOriginalKb = Math.round(file.size / 1024);

  if (!file.type.startsWith('image/')) {
    return {
      file,
      pesoOriginalKb,
      pesoFinalKb: pesoOriginalKb,
      ahorroPorcentaje: 0,
    };
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Escalar manteniendo proporción
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve({
            file,
            pesoOriginalKb,
            pesoFinalKb: pesoOriginalKb,
            ahorroPorcentaje: 0,
          });
        }

        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return resolve({
                file,
                pesoOriginalKb,
                pesoFinalKb: pesoOriginalKb,
                ahorroPorcentaje: 0,
              });
            }

            const cleanName = file.name.replace(/\.[^/.]+$/, '') + '.jpg';
            const compressedFile = new File([blob], cleanName, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });

            const pesoFinalKb = Math.round(compressedFile.size / 1024);
            const ahorro = Math.max(0, Math.round(((pesoOriginalKb - pesoFinalKb) / pesoOriginalKb) * 100));

            resolve({
              file: compressedFile,
              pesoOriginalKb,
              pesoFinalKb,
              ahorroPorcentaje: ahorro,
            });
          },
          'image/jpeg',
          calidad
        );
      };

      img.onerror = () => {
        resolve({
          file,
          pesoOriginalKb,
          pesoFinalKb: pesoOriginalKb,
          ahorroPorcentaje: 0,
        });
      };
    };

    reader.onerror = () => {
      resolve({
        file,
        pesoOriginalKb,
        pesoFinalKb: pesoOriginalKb,
        ahorroPorcentaje: 0,
      });
    };
  });
}

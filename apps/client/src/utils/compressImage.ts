/**
 * Super compresión de imágenes en el cliente mediante HTML5 Canvas.
 * Reduce comprobantes y fotos pesadas (5MB - 10MB) a ~60KB - 120KB manteniendo
 * nitidez óptima para la lectura OCR y auditoría manual en el panel de administración.
 */
export async function comprimirImagen(file: File, maxDim = 1200, calidad = 0.65): Promise<{
  file: File;
  pesoOriginalKb: number;
  pesoFinalKb: number;
  ahorroPorcentaje: number;
}> {
  const pesoOriginalKb = Math.round(file.size / 1024);

  // Si no es imagen, retornar archivo original
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

        // Escalar manteniendo relación de aspecto
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

        // Fondo blanco por si el PNG tiene transparencias
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

            console.log(
              `[Super Compresión Client] ${file.name}: ${pesoOriginalKb} KB -> ${pesoFinalKb} KB (${ahorro}% ahorro)`
            );

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

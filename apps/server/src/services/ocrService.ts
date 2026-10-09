import { createWorker } from 'tesseract.js';
import { ResultadoOcr, MetodoPago } from '@sorteos/shared';
import { db } from '../db';

export class OcrService {
  /**
   * Procesa la captura de un comprobante de pago y extrae:
   * 1. Código / Nro de Operación (Yape / Plin)
   * 2. Monto pagado
   * 3. Fecha
   * 4. Validación antifraude (si el código ya existe en la base de datos)
   */
  public static async analizarComprobante(imagePath: string): Promise<ResultadoOcr> {
    try {
      console.log(`[OCR] Iniciando análisis de imagen: ${imagePath}`);
      const worker = await createWorker('spa'); // Spanish OCR
      
      const ret = await worker.recognize(imagePath);
      const text = ret.data.text;
      await worker.terminate();

      console.log('[OCR] Texto detectado:\n', text);

      // 1. Detectar Método de Pago
      let metodoDetectado: MetodoPago = 'YAPE';
      if (/plin/i.test(text)) {
        metodoDetectado = 'PLIN';
      } else if (/transferencia|bcp|bbva|interbank/i.test(text)) {
        metodoDetectado = 'TRANSFERENCIA';
      }

      // 2. Extraer Código de Operación
      // Patrones comunes en Yape y Plin:
      // "Nro. de operación: 12345678", "Operación: 12345678", "N° de operación: 01234567", "Código de operación: 123456"
      let codigoOperacion: string | undefined;

      const patternOperacion = /(?:operaci[oó]n|c[oó]digo|nro\.?|ref(?:erencia)?)[^\d\n\r]*(\d{6,12})/i;
      const matchOp = text.match(patternOperacion);
      if (matchOp && matchOp[1]) {
        codigoOperacion = matchOp[1].trim();
      } else {
        // Búsqueda alternativa: cualquier secuencia de 8 o 10 dígitos aislada (típico de Yape)
        const matchDigits = text.match(/\b\d{8,10}\b/);
        if (matchDigits) {
          codigoOperacion = matchDigits[0];
        }
      }

      // 3. Extraer Monto
      // "S/ 10.00", "S/. 25", "S/ 5.00", "$ 10.00"
      let montoDetectado: number | undefined;
      const patternMonto = /(?:s\/|\$|monto)\s*([0-9]+(?:\.[0-9]{2})?)/i;
      const matchMonto = text.match(patternMonto);
      if (matchMonto && matchMonto[1]) {
        montoDetectado = parseFloat(matchMonto[1]);
      } else {
        // Fallback: buscar números con decimales como 10.00 o 25.00
        const matchDec = text.match(/\b([0-9]{1,4}\.[0-9]{2})\b/);
        if (matchDec) {
          montoDetectado = parseFloat(matchDec[1]);
        }
      }

      // 4. Extraer Fecha
      let fechaDetectada: string | undefined;
      const patternFecha = /(\d{1,2}\s+(?:ene|feb|mar|abr|may|jun|jul|ago|set|sep|oct|nov|dic)[a-z]*\.?\s+\d{2,4}|\d{1,2}[\/\.-]\d{1,2}[\/\.-]\d{2,4})/i;
      const matchFecha = text.match(patternFecha);
      if (matchFecha && matchFecha[1]) {
        fechaDetectada = matchFecha[1].trim();
      }

      // 5. VALIDACIÓN ANTIFRAUDE (Control de Duplicados)
      let esDuplicado = false;
      let mensaje: string | undefined;

      if (codigoOperacion) {
        esDuplicado = db.existeCodigoOperacion(codigoOperacion);
        if (esDuplicado) {
          mensaje = `⚠️ ALERTA DE SEGURIDAD: El comprobante con N° de Operación #${codigoOperacion} ya fue registrado previamente en el sistema.`;
        } else {
          mensaje = `✅ Comprobante válido. Operación #${codigoOperacion} única en el sistema.`;
        }
      } else {
        mensaje = 'ℹ️ No se pudo detectar claramente el código de operación. Verificación visual requerida.';
      }

      return {
        exito: true,
        codigoOperacion,
        montoDetectado,
        fechaDetectada,
        metodoDetectado,
        textoCompleto: text,
        esDuplicado,
        mensaje
      };
    } catch (error: any) {
      console.error('[OCR Error]:', error);
      return {
        exito: false,
        textoCompleto: '',
        esDuplicado: false,
        mensaje: `Error al procesar OCR: ${error.message || 'Error desconocido'}`
      };
    }
  }
}

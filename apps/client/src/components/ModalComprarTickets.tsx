import React, { useState } from 'react';
import { X, Copy, Check, Upload, AlertCircle, CheckCircle, Loader2, Sparkles, Ticket } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Sorteo, ConfiguracionWeb, MetodoPago, ResultadoOcr } from '@sorteos/shared';
import { analizarComprobanteOcr, registrarCompra } from '../services/api';
import { comprimirImagen } from '../utils/compressImage';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  sorteo: Sorteo;
  config: ConfiguracionWeb;
  onCompraCompletada: (dni: string) => void;
}

export const ModalComprarTickets: React.FC<Props> = ({
  isOpen,
  onClose,
  sorteo,
  config,
  onCompraCompletada,
}) => {
  const [cantidad, setCantidad] = useState<number>(1);
  const [metodoPago, setMetodoPago] = useState<MetodoPago>('YAPE');
  const [copiado, setCopiado] = useState(false);

  // Formulario
  const [dni, setDni] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [celular, setCelular] = useState('');
  const [archivoComprobante, setArchivoComprobante] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [infoCompresion, setInfoCompresion] = useState<{ originalKb: number; finalKb: number; ahorro: number } | null>(null);

  // Estados de OCR y antifraude
  const [isScanningOcr, setIsScanningOcr] = useState(false);
  const [ocrResultado, setOcrResultado] = useState<ResultadoOcr | null>(null);

  // Estado de envío
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  // Estados de billeteras y pago
  const billeterasDisponibles = (config.billeteras && config.billeteras.length > 0)
    ? config.billeteras.filter(b => b.activo)
    : [
        {
          id: 'billetera-yape',
          nombre: 'Yape Oficial',
          tipo: 'YAPE',
          numero: config.yapeNumero || '987 654 321',
          titular: config.yapeNombre || 'Juan Lorenzo Perez',
          qrUrl: config.yapeQr,
          activo: true
        },
        {
          id: 'billetera-plin',
          nombre: 'Plin',
          tipo: 'PLIN',
          numero: config.plinNumero || '987 654 321',
          titular: config.plinNombre || 'Juan Lorenzo Perez',
          qrUrl: config.plinQr,
          activo: true
        }
      ];

  const [billeteraSeleccionadaId, setBilleteraSeleccionadaId] = useState<string>(
    billeterasDisponibles[0]?.id || ''
  );

  const billeteraSeleccionada = billeterasDisponibles.find(b => b.id === billeteraSeleccionadaId) || billeterasDisponibles[0];

  const handleCopiarNumero = () => {
    if (billeteraSeleccionada?.numero) {
      navigator.clipboard.writeText(billeteraSeleccionada.numero.replace(/\s+/g, ''));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    }
  };

  if (!isOpen) return null;

  const precioUnitario = Number(sorteo.precioTicket);
  const totalPagar = cantidad * precioUnitario;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setOcrResultado(null);
    setIsScanningOcr(true);

    try {
      // 1. Super compresión en el cliente mediante Canvas (reduce 5MB a ~70KB al instante)
      const compRes = await comprimirImagen(file);
      const fileComprimido = compRes.file;
      setArchivoComprobante(fileComprimido);
      setPreviewUrl(URL.createObjectURL(fileComprimido));
      setInfoCompresion({
        originalKb: compRes.pesoOriginalKb,
        finalKb: compRes.pesoFinalKb,
        ahorro: compRes.ahorroPorcentaje,
      });

      // 2. Ejecutar OCR inteligente sobre la imagen optimizada
      const resultado = await analizarComprobanteOcr(fileComprimido);
      setOcrResultado(resultado);
      if (resultado.esDuplicado) {
        setErrorMsg('⚠️ Este comprobante ya fue registrado anteriormente en el sistema. No se aceptan comprobantes duplicados.');
      }
    } catch (err: any) {
      console.warn('Fallo OCR o compresión:', err);
    } finally {
      setIsScanningOcr(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dni || !nombreCompleto || !celular) {
      setErrorMsg('Por favor completa todos tus datos personales.');
      return;
    }

    if (dni.trim().length !== 8) {
      setErrorMsg('El DNI debe tener exactamente 8 dígitos numéricos.');
      return;
    }

    if (!archivoComprobante) {
      setErrorMsg('Debes adjuntar la captura del comprobante de pago.');
      return;
    }

    if (ocrResultado?.esDuplicado) {
      setErrorMsg('No puedes enviar un comprobante que ya fue registrado anteriormente.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('sorteoId', sorteo.id);
      formData.append('dni', dni.trim());
      formData.append('nombreCompleto', nombreCompleto.trim());
      formData.append('celular', celular.trim());
      formData.append('cantidadTickets', cantidad.toString());
      formData.append('metodoPago', (billeteraSeleccionada?.tipo as MetodoPago) || 'YAPE');
      formData.append('comprobante', archivoComprobante);
      if (ocrResultado?.codigoOperacion) {
        formData.append('codigoOperacionManual', ocrResultado.codigoOperacion);
      }

      await registrarCompra(formData);

      // Lanzar confeti de celebración
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#8442F2', '#10B981', '#F59E0B', '#FAF8FF']
      });

      setExito(true);
      setTimeout(() => {
        onCompraCompletada(dni.trim());
      }, 2500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al procesar la compra.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-pastel-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-pastel-600 to-pastel-500 p-6 text-white flex items-center justify-between">
          <div className="min-w-0 pr-4">
            <span className="text-xs font-bold text-pastel-200 uppercase tracking-widest block">
              Comprar Boletos
            </span>
            <h3 className="text-lg sm:text-xl font-black truncate">{sorteo.titulo}</h3>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {exito ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h4 className="text-2xl font-black text-slate-900">¡Comprobante Recibido con Éxito!</h4>
            <p className="text-slate-600 text-sm max-w-md mx-auto">
              Tu compra ha quedado registrada como{' '}
              <strong className="text-amber-600 font-bold">"PENDIENTE DE VERIFICACIÓN"</strong>.
              En breves momentos nuestro administrador validará el pago para asignarte tus números oficiales.
            </p>
            <div className="p-4 bg-pastel-50 rounded-2xl border border-pastel-200 text-xs text-pastel-800 font-medium">
              Redirigiendo a la sección <strong>"Mis Tickets"</strong> para que puedas seguir tu estado...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* 1. Selector de Cantidad */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Paso 1: Elige la cantidad de tickets
              </label>
              <div className="grid grid-cols-4 gap-2 mb-3">
                {[1, 2, 5, 10].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setCantidad(n)}
                    className={`py-2.5 rounded-xl font-bold text-sm border transition-all ${
                      cantidad === n
                        ? 'bg-pastel-600 text-white border-pastel-600 shadow-pastel'
                        : 'bg-pastel-50 text-slate-700 border-pastel-200 hover:bg-pastel-100'
                    }`}
                  >
                    {n} {n === 1 ? 'Ticket' : 'Tickets'}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-between bg-pastel-50 p-3 rounded-xl border border-pastel-200">
                <span className="text-sm font-semibold text-slate-600">Total a Pagar:</span>
                <span className="text-xl font-black text-pastel-700">
                  S/ {totalPagar.toFixed(2)}
                </span>
              </div>
            </div>

            {/* 2. Método de Pago Dinámico */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Paso 2: Realiza el pago
              </label>

              {/* Selector dinámico de billeteras */}
              <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
                {billeterasDisponibles.map(b => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBilleteraSeleccionadaId(b.id)}
                    className={`py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-2 border transition whitespace-nowrap ${
                      billeteraSeleccionada?.id === b.id
                        ? 'bg-pastel-800 text-white border-pastel-800 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span>{b.tipo === 'YAPE' ? '🟣' : b.tipo === 'PLIN' ? '🔵' : '🏦'}</span>
                    <span>{b.nombre}</span>
                  </button>
                ))}
              </div>

              {/* Caja de Datos de Pago y Código QR */}
              {billeteraSeleccionada && (
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <span className="text-[11px] text-slate-500 font-medium block uppercase tracking-wide">
                        {billeteraSeleccionada.nombre}:
                      </span>
                      <span className="text-xl font-black text-slate-900 tracking-wide font-mono block">
                        {billeteraSeleccionada.numero}
                      </span>
                      <span className="text-xs text-slate-600 block mt-0.5">
                        A nombre de: <strong>{billeteraSeleccionada.titular}</strong>
                      </span>
                      {billeteraSeleccionada.instrucciones && (
                        <p className="text-[11px] text-pastel-700 font-medium mt-1">
                          {billeteraSeleccionada.instrucciones}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleCopiarNumero}
                      className="bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm self-start sm:self-auto shrink-0"
                    >
                      {copiado ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                      <span>{copiado ? '¡Copiado!' : 'Copiar'}</span>
                    </button>
                  </div>

                  {/* Imagen del Código QR si existe */}
                  {billeteraSeleccionada.qrUrl && (
                    <div className="pt-3 border-t border-slate-200/60 flex items-center gap-4">
                      <div className="w-24 h-24 bg-white rounded-xl border border-slate-200 p-1 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                        <img
                          src={billeteraSeleccionada.qrUrl}
                          alt={`QR ${billeteraSeleccionada.nombre}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="text-xs text-slate-600 space-y-1">
                        <span className="font-bold text-slate-800 block">📱 Escanea con tu app</span>
                        <p className="text-[11px] text-slate-500">
                          Abre tu aplicación de {billeteraSeleccionada.nombre}, selecciona "Escanear QR" y apunta a la imagen.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. Subida de Comprobante con Lector OCR Antifraude */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Paso 3: Sube tu captura (Lector OCR Antiduplicados)
              </label>

              <div className="relative border-2 border-dashed border-pastel-300 hover:border-pastel-500 bg-pastel-50/50 rounded-2xl p-4 text-center cursor-pointer transition">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
                {previewUrl ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={previewUrl}
                      alt="Preview comprobante"
                      className="w-16 h-16 object-cover rounded-xl border border-pastel-300"
                    />
                    <div className="text-left flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {archivoComprobante?.name}
                      </p>
                      {infoCompresion && (
                        <p className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 mt-0.5">
                          <span>⚡ Optimizado: {infoCompresion.originalKb} KB → {infoCompresion.finalKb} KB (Ahorro {infoCompresion.ahorro}%)</span>
                        </p>
                      )}
                      <p className="text-[11px] text-slate-500">
                        Haz clic para cambiar la imagen
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 py-2">
                    <Upload className="w-7 h-7 text-pastel-500 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">
                      Toca aquí o arrastra la captura de tu Yape / Plin
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Formato JPG, PNG o WEBP
                    </p>
                  </div>
                )}
              </div>

              {/* Estado del Análisis OCR */}
              {isScanningOcr && (
                <div className="mt-2.5 p-3 bg-purple-50 rounded-xl border border-purple-200 flex items-center gap-2.5 text-xs text-purple-700 animate-pulse">
                  <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
                  <span>Escaneando N° de operación y monto con OCR inteligente...</span>
                </div>
              )}

              {/* Resultado del OCR */}
              {ocrResultado && !isScanningOcr && (
                <div className={`mt-2.5 p-3.5 rounded-xl border text-xs ${
                  ocrResultado.esDuplicado
                    ? 'bg-rose-50 border-rose-300 text-rose-800'
                    : 'bg-emerald-50 border-emerald-300 text-emerald-800'
                }`}>
                  <div className="flex items-start gap-2">
                    {ocrResultado.esDuplicado ? (
                      <AlertCircle className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    )}
                    <div>
                      <span className="font-bold block">
                        {ocrResultado.esDuplicado
                          ? 'Comprobante Duplicado Detectado'
                          : 'Validación OCR Exitosa'}
                      </span>
                      <p className="text-[11px] mt-0.5">
                        {ocrResultado.codigoOperacion && (
                          <span>N° Operación: <strong>#{ocrResultado.codigoOperacion}</strong> </span>
                        )}
                        {ocrResultado.montoDetectado && (
                          <span>| Monto: <strong>S/ {ocrResultado.montoDetectado.toFixed(2)}</strong> </span>
                        )}
                      </p>
                      <p className="text-[11px] opacity-90 mt-1">{ocrResultado.mensaje}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Datos del Participante */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Paso 4: Tus Datos Personales
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <input
                    type="text"
                    required
                    maxLength={8}
                    inputMode="numeric"
                    value={dni}
                    onChange={e => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                    placeholder="Número de DNI (8 dígitos)"
                    className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-pastel-500 focus:ring-2 focus:ring-pastel-200 outline-none transition"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    required
                    value={celular}
                    onChange={e => setCelular(e.target.value)}
                    placeholder="WhatsApp / Celular"
                    className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-pastel-500 focus:ring-2 focus:ring-pastel-200 outline-none transition"
                  />
                </div>
                <div className="sm:col-span-2">
                  <input
                    type="text"
                    required
                    value={nombreCompleto}
                    onChange={e => setNombreCompleto(e.target.value)}
                    placeholder="Nombres y Apellidos Completos"
                    className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-pastel-500 focus:ring-2 focus:ring-pastel-200 outline-none transition"
                  />
                </div>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Botón de Enviar */}
            <button
              type="submit"
              disabled={isSubmitting || ocrResultado?.esDuplicado === true}
              className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-pastel ${
                isSubmitting || ocrResultado?.esDuplicado === true
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-pastel-600 to-pastel-500 hover:from-pastel-700 hover:to-pastel-600 text-white hover:shadow-pastel-lg active:scale-98'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Enviando Comprobante...</span>
                </>
              ) : (
                <>
                  <Ticket className="w-4 h-4" />
                  <span>CONFIRMAR Y REGISTRAR TICKETS (S/ {totalPagar.toFixed(2)})</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

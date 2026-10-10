import React, { useState } from 'react';
import {
  ArrowLeft,
  Copy,
  Check,
  Upload,
  AlertCircle,
  CheckCircle,
  Loader2,
  Ticket,
  ShieldCheck,
  ChevronRight,
  User,
  Phone,
  FileCheck2,
  QrCode,
  CreditCard
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Sorteo, ConfiguracionWeb, MetodoPago, ResultadoOcr } from '@sorteos/shared';
import { analizarComprobanteOcr, registrarCompra } from '../services/api';
import { comprimirImagen } from '../utils/compressImage';

interface Props {
  sorteo: Sorteo;
  config: ConfiguracionWeb;
  onVolver: () => void;
  onCompraCompletada: (dni: string) => void;
}

export const ComprarPage: React.FC<Props> = ({
  sorteo,
  config,
  onVolver,
  onCompraCompletada,
}) => {
  // Pasos: 1 = Boletos, 2 = Pago y Comprobante, 3 = Datos Personales
  const [pasoActual, setPasoActual] = useState<1 | 2 | 3>(1);

  // Paso 1: Tickets
  const [cantidad, setCantidad] = useState<number>(1);
  const [copiado, setCopiado] = useState(false);

  // Paso 2: Comprobante y OCR
  const [archivoComprobante, setArchivoComprobante] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [codigoOperacion, setCodigoOperacion] = useState('');
  const [isScanningOcr, setIsScanningOcr] = useState(false);
  const [ocrResultado, setOcrResultado] = useState<ResultadoOcr | null>(null);
  const [errorOcr, setErrorOcr] = useState<string | null>(null);

  // Paso 3: Datos personales
  const [dni, setDni] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [celular, setCelular] = useState('');

  // Estados generales
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  // Lista de billeteras digitales
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

  const precioUnitario = Number(sorteo.precioTicket);
  const totalPagar = cantidad * precioUnitario;

  // Manejador de subida de comprobante
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorOcr(null);
    setErrorMsg(null);
    setCodigoOperacion('');
    setOcrResultado(null);
    setIsScanningOcr(true);

    try {
      // 1. Compresión en cliente
      const compRes = await comprimirImagen(file);
      const fileComprimido = compRes.file;
      setArchivoComprobante(fileComprimido);
      setPreviewUrl(URL.createObjectURL(fileComprimido));

      // 2. OCR automático para extraer N° de Operación
      const resultado = await analizarComprobanteOcr(fileComprimido);
      setOcrResultado(resultado);

      if (resultado.esDuplicado) {
        setErrorOcr('⚠️ Este comprobante ya fue registrado anteriormente en el sistema. No se permiten comprobantes duplicados.');
        return;
      }

      if (resultado.codigoOperacion && resultado.codigoOperacion.length >= 4) {
        setCodigoOperacion(resultado.codigoOperacion);
      } else {
        setErrorOcr('No pudimos detectar con claridad el N° de operación en la captura. Por favor, sube una imagen más nítida o centrada.');
      }
    } catch (err: any) {
      console.warn('Fallo OCR o compresión:', err);
      setErrorOcr('Hubo un inconveniente al escanear la imagen. Intenta subir otra captura legible.');
    } finally {
      setIsScanningOcr(false);
    }
  };

  // Envío final de la compra
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

    if (celular.trim().length < 9) {
      setErrorMsg('El número celular debe tener 9 dígitos.');
      return;
    }

    if (!archivoComprobante) {
      setErrorMsg('Falta adjuntar el comprobante de pago.');
      setPasoActual(2);
      return;
    }

    if (!codigoOperacion) {
      setErrorMsg('Debes subir un comprobante donde se reconozca el N° de Operación.');
      setPasoActual(2);
      return;
    }

    if (ocrResultado?.esDuplicado) {
      setErrorMsg('No puedes registrar un comprobante duplicado.');
      setPasoActual(2);
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
      formData.append('codigoOperacionManual', codigoOperacion.trim());

      await registrarCompra(formData);

      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#8442F2', '#10B981', '#F59E0B', '#FAF8FF', '#EC4899']
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

  if (sorteo.estado !== 'ACTIVO') {
    return (
      <div className="min-h-screen bg-pastel-50 dark:bg-[#0c0817] text-slate-900 dark:text-purple-100 transition-colors py-12 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white dark:bg-[#130d24] rounded-3xl border border-purple-200 dark:border-purple-900 p-8 text-center space-y-6 shadow-xl">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-slate-900 dark:text-white">Sorteo no disponible</h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-purple-200/80">
              Este sorteo se encuentra actualmente en estado <strong>{sorteo.estado}</strong> y no admite nuevas compras de boletos.
            </p>
          </div>
          <button
            type="button"
            onClick={onVolver}
            className="w-full py-3.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-2xl text-sm transition cursor-pointer"
          >
            Volver al Catálogo de Sorteos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-pastel-50 dark:bg-[#0c0817] text-slate-900 dark:text-purple-100 transition-colors py-6 sm:py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Barra superior con botón volver */}
        <div className="mb-5 flex items-center justify-between">
          <button
            type="button"
            onClick={onVolver}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white bg-white dark:bg-[#160e2b] border border-purple-200 dark:border-purple-800/80 px-4 py-2.5 rounded-2xl shadow-xs transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver a Sorteos</span>
          </button>

          <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40 px-3 py-1.5 rounded-full border border-purple-200 dark:border-purple-800">
            Compra 100% Segura
          </span>
        </div>

        {/* Tarjeta Principal */}
        <div className="bg-white dark:bg-[#130d24] rounded-3xl border border-purple-200/80 dark:border-purple-900/60 shadow-xl shadow-purple-500/5 overflow-hidden">
          {/* Header del Sorteo */}
          <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 p-5 sm:p-7 text-white">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-black uppercase tracking-widest text-purple-200 block">
                  Participa en el Sorteo Oficial
                </span>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight">{sorteo.titulo}</h1>
                <p className="text-xs sm:text-sm text-purple-100/90 max-w-xl line-clamp-1">
                  {sorteo.descripcion || 'Adquiere tus boletos y participa por increíbles premios.'}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2.5 text-center shrink-0 self-start sm:self-auto">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-200 block">
                  Precio por Boleto
                </span>
                <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono block">
                  S/ {precioUnitario.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Stepper de 3 Pasos */}
          <div className="bg-purple-50/60 dark:bg-[#180f2d] border-b border-purple-200/80 dark:border-purple-800/80 px-4 sm:px-8 py-3.5">
            <div className="flex items-center justify-between max-w-xl mx-auto">
              {/* Paso 1 */}
              <button
                type="button"
                onClick={() => setPasoActual(1)}
                className="flex items-center gap-2 group cursor-pointer"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                  pasoActual === 1
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40 ring-4 ring-purple-600/20'
                    : pasoActual > 1
                    ? 'bg-emerald-500 text-white'
                    : 'bg-purple-200 dark:bg-purple-900/60 text-slate-600 dark:text-purple-300'
                }`}>
                  {pasoActual > 1 ? <Check className="w-4 h-4" /> : '1'}
                </div>
                <div className="text-left hidden sm:block">
                  <span className={`text-xs font-black block leading-none ${
                    pasoActual === 1 ? 'text-purple-700 dark:text-purple-300' : 'text-slate-600 dark:text-purple-400'
                  }`}>
                    Tickets
                  </span>
                  <span className="text-[10px] text-slate-400">Cantidad</span>
                </div>
              </button>

              <div className={`flex-1 h-0.5 mx-2 sm:mx-4 transition-colors ${
                pasoActual > 1 ? 'bg-emerald-500' : 'bg-purple-200 dark:bg-purple-800'
              }`} />

              {/* Paso 2 */}
              <button
                type="button"
                onClick={() => {
                  if (pasoActual > 2 || cantidad >= 1) setPasoActual(2);
                }}
                className="flex items-center gap-2 group cursor-pointer"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                  pasoActual === 2
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40 ring-4 ring-purple-600/20'
                    : pasoActual > 2
                    ? 'bg-emerald-500 text-white'
                    : 'bg-purple-200 dark:bg-purple-900/60 text-slate-600 dark:text-purple-300'
                }`}>
                  {pasoActual > 2 ? <Check className="w-4 h-4" /> : '2'}
                </div>
                <div className="text-left hidden sm:block">
                  <span className={`text-xs font-black block leading-none ${
                    pasoActual === 2 ? 'text-purple-700 dark:text-purple-300' : 'text-slate-600 dark:text-purple-400'
                  }`}>
                    Pago y Voucher
                  </span>
                  <span className="text-[10px] text-slate-400">Comprobante</span>
                </div>
              </button>

              <div className={`flex-1 h-0.5 mx-2 sm:mx-4 transition-colors ${
                pasoActual > 2 ? 'bg-emerald-500' : 'bg-purple-200 dark:bg-purple-800'
              }`} />

              {/* Paso 3 */}
              <button
                type="button"
                onClick={() => {
                  if (codigoOperacion && !isScanningOcr && !ocrResultado?.esDuplicado) {
                    setPasoActual(3);
                  }
                }}
                className="flex items-center gap-2 group cursor-pointer"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs transition-all ${
                  pasoActual === 3
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/40 ring-4 ring-purple-600/20'
                    : 'bg-purple-200 dark:bg-purple-900/60 text-slate-600 dark:text-purple-300'
                }`}>
                  3
                </div>
                <div className="text-left hidden sm:block">
                  <span className={`text-xs font-black block leading-none ${
                    pasoActual === 3 ? 'text-purple-700 dark:text-purple-300' : 'text-slate-600 dark:text-purple-400'
                  }`}>
                    Mis Datos
                  </span>
                  <span className="text-[10px] text-slate-400">Finalizar</span>
                </div>
              </button>
            </div>
          </div>

          {exito ? (
            <div className="p-8 sm:p-12 text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-bounce">
                <CheckCircle className="w-12 h-12" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                  ¡Comprobante Recibido con Éxito!
                </h2>
                <p className="text-slate-600 dark:text-purple-200/80 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
                  Tu orden ha quedado registrada como{' '}
                  <strong className="text-amber-600 dark:text-amber-400 font-black">"PENDIENTE DE VERIFICACIÓN"</strong>.
                  El administrador validará la operación para que veas tus números oficiales en el sistema.
                </p>
              </div>
              <div className="p-4 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-200 dark:border-purple-800 text-xs sm:text-sm text-purple-800 dark:text-purple-200 font-medium max-w-md mx-auto">
                Redirigiendo automáticamente a la sección <strong>"Mis Tickets"</strong> con tu DNI {dni}...
              </div>
            </div>
          ) : (
            <div className="p-5 sm:p-8">
              {/* ==================================================== */}
              {/* PASO 1: SELECCIÓN DE TICKETS                         */}
              {/* ==================================================== */}
              {pasoActual === 1 && (
                <div className="space-y-6 max-w-xl mx-auto">
                  <div className="text-center space-y-1">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      Paso 1: Elige cuántos tickets deseas comprar
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-purple-300">
                      Selecciona una cantidad rápida o usa el control para personalizarla.
                    </p>
                  </div>

                  {/* Botones de acceso rápido */}
                  <div className="grid grid-cols-5 gap-2">
                    {[1, 2, 5, 10, 20].map(n => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setCantidad(n)}
                        className={`py-3 rounded-2xl font-black text-xs sm:text-sm border transition-all cursor-pointer ${
                          cantidad === n
                            ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/30 scale-[1.02]'
                            : 'bg-purple-50/60 dark:bg-[#180f2d] text-slate-700 dark:text-purple-200 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40'
                        }`}
                      >
                        {n}
                        <span className="block text-[10px] font-semibold opacity-80">
                          {n === 1 ? 'ticket' : 'tickets'}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Contador interactivo +/- */}
                  <div className="bg-purple-50/70 dark:bg-[#191030] p-4 sm:p-5 rounded-2xl border border-purple-200/80 dark:border-purple-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-700 dark:text-purple-200">
                        Cantidad personalizada:
                      </span>
                      <div className="inline-flex items-center bg-white dark:bg-[#120924] border border-purple-300 dark:border-purple-700 rounded-xl overflow-hidden shadow-xs">
                        <button
                          type="button"
                          onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                          className="px-3.5 py-1.5 font-black text-lg text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition cursor-pointer select-none"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          max="5000"
                          value={cantidad}
                          onChange={e => {
                            const val = parseInt(e.target.value, 10);
                            if (!isNaN(val) && val >= 1) setCantidad(val);
                            else if (e.target.value === '') setCantidad(1);
                          }}
                          className="w-16 text-center py-1.5 font-mono font-black text-sm bg-transparent text-slate-900 dark:text-white focus:outline-hidden"
                        />
                        <button
                          type="button"
                          onClick={() => setCantidad(cantidad + 1)}
                          className="px-3.5 py-1.5 font-black text-lg text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 transition cursor-pointer select-none"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="text-right sm:border-l sm:border-purple-200/60 dark:sm:border-purple-800/60 sm:pl-4">
                      <span className="text-[11px] text-slate-500 dark:text-purple-300 block">
                        Total a Pagar
                      </span>
                      <span className="text-2xl sm:text-3xl font-black text-purple-700 dark:text-purple-300 font-mono">
                        S/ {totalPagar.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Botón Siguiente Paso */}
                  <button
                    type="button"
                    onClick={() => setPasoActual(2)}
                    className="w-full py-4 px-6 rounded-2xl font-black text-white text-base bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                  >
                    <span>Continuar al Pago (S/ {totalPagar.toFixed(2)})</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* ==================================================== */}
              {/* PASO 2: MÉTODOS DE PAGO Y SUBIR COMPROBANTE          */}
              {/* ==================================================== */}
              {pasoActual === 2 && (
                <div className="space-y-6">
                  <div className="text-center space-y-1">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      Paso 2: Realiza el pago y adjunta tu comprobante
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-purple-300">
                      Transfiere el monto exacto y sube tu captura para validar el N° de Operación.
                    </p>
                  </div>

                  {/* Grid de 2 Columnas Responsivas */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    {/* COLUMNA IZQUIERDA: Métodos de Pago */}
                    <div className="bg-purple-50/40 dark:bg-[#160e2b] p-5 sm:p-6 rounded-3xl border border-purple-200/80 dark:border-purple-800/70 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-wider text-purple-700 dark:text-purple-300">
                          Método de Pago
                        </span>
                        <span className="text-xs font-mono font-bold text-slate-600 dark:text-purple-300">
                          Total: <strong className="text-purple-700 dark:text-purple-300 text-sm">S/ {totalPagar.toFixed(2)}</strong>
                        </span>
                      </div>

                      {/* Selector de billeteras limpias */}
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {billeterasDisponibles.map(b => (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => setBilleteraSeleccionadaId(b.id)}
                            className={`py-2 px-3.5 rounded-xl font-bold text-xs flex items-center gap-1.5 border transition whitespace-nowrap cursor-pointer ${
                              billeteraSeleccionada?.id === b.id
                                ? 'bg-purple-700 text-white border-purple-700 shadow-sm shadow-purple-700/30'
                                : 'bg-white dark:bg-[#1a1133] text-slate-700 dark:text-purple-200 border-purple-200 dark:border-purple-800 hover:bg-purple-50'
                            }`}
                          >
                            <span>{b.tipo === 'YAPE' ? '🟣' : b.tipo === 'PLIN' ? '🔵' : '🏦'}</span>
                            <span>{b.nombre}</span>
                          </button>
                        ))}
                      </div>

                      {/* Datos de la cuenta seleccionada */}
                      {billeteraSeleccionada && (
                        <div className="space-y-4 pt-1">
                          <div className="bg-white dark:bg-[#1a1133] p-4 rounded-2xl border border-purple-200/80 dark:border-purple-800/80 space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="text-[11px] text-slate-400 block font-medium">
                                  Número / Celular:
                                </span>
                                <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono tracking-wider">
                                  {billeteraSeleccionada.numero}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={handleCopiarNumero}
                                className="bg-purple-100 dark:bg-purple-900/50 hover:bg-purple-200 text-purple-800 dark:text-purple-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                              >
                                {copiado ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                <span>{copiado ? 'Copiado' : 'Copiar'}</span>
                              </button>
                            </div>

                            <div className="pt-2 border-t border-purple-100 dark:border-purple-900/60 flex items-center justify-between text-xs">
                              <span className="text-slate-500 dark:text-purple-300">Titular:</span>
                              <span className="font-bold text-slate-800 dark:text-white">{billeteraSeleccionada.titular}</span>
                            </div>
                          </div>

                          {/* QR limpio sin textos redundantes */}
                          {billeteraSeleccionada.qrUrl && (
                            <div className="flex flex-col items-center justify-center p-3 bg-white dark:bg-[#1a1133] rounded-2xl border border-purple-200/80 dark:border-purple-800/80 text-center">
                              <div className="w-36 h-36 bg-white rounded-xl p-1.5 flex items-center justify-center border border-purple-100 dark:border-purple-900 shadow-xs mb-2">
                                <img
                                  src={billeteraSeleccionada.qrUrl}
                                  alt={`QR ${billeteraSeleccionada.nombre}`}
                                  className="w-full h-full object-contain"
                                />
                              </div>
                              <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                                <QrCode className="w-3.5 h-3.5" />
                                Escanea el código QR para pagar S/ {totalPagar.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* COLUMNA DERECHA: Subida de Comprobante y N° Operación Bloqueado */}
                    <div className="bg-purple-50/40 dark:bg-[#160e2b] p-5 sm:p-6 rounded-3xl border border-purple-200/80 dark:border-purple-800/70 space-y-4">
                      <span className="text-xs font-black uppercase tracking-wider text-purple-700 dark:text-purple-300 block">
                        Comprobante de Pago
                      </span>

                      {/* Dropzone de subida */}
                      <div className="relative border-2 border-dashed border-purple-300 dark:border-purple-700 hover:border-purple-500 bg-white dark:bg-[#1a1133] rounded-2xl p-5 text-center cursor-pointer transition">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        {previewUrl ? (
                          <div className="flex items-center gap-4 text-left">
                            <img
                              src={previewUrl}
                              alt="Comprobante"
                              className="w-20 h-20 object-cover rounded-xl border border-purple-200 dark:border-purple-700 shrink-0"
                            />
                            <div className="flex-1 min-w-0 space-y-1">
                              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                                Comprobante cargado
                              </span>
                              <p className="text-[11px] text-slate-500 dark:text-purple-300">
                                Haz clic aquí para reemplazar la imagen si lo necesitas.
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1.5 py-3">
                            <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center mx-auto">
                              <Upload className="w-5 h-5" />
                            </div>
                            <p className="text-xs sm:text-sm font-black text-slate-800 dark:text-white">
                              Adjunta la captura de tu comprobante
                            </p>
                            <p className="text-[11px] text-slate-400 dark:text-purple-300/70">
                              Formatos PNG, JPG o WEBP
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Estado OCR mientras escanea */}
                      {isScanningOcr && (
                        <div className="flex items-center gap-2 p-3 bg-purple-100/80 dark:bg-purple-950/60 rounded-xl text-xs font-bold text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800">
                          <Loader2 className="w-4 h-4 animate-spin text-purple-600 dark:text-purple-400" />
                          <span>Extrayendo N° de Operación del comprobante...</span>
                        </div>
                      )}

                      {/* Error de OCR si no detectó o es duplicado */}
                      {errorOcr && (
                        <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl flex items-center gap-2 text-xs font-bold text-rose-800 dark:text-rose-200">
                          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                          <span>{errorOcr}</span>
                        </div>
                      )}

                      {/* Campo N° de Operación (BLOQUEADO / READONLY) */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black text-slate-700 dark:text-purple-200 uppercase tracking-wider flex items-center gap-1.5">
                            <FileCheck2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                            <span>N° de Operación (Extraído del Voucher)</span>
                          </label>
                          {codigoOperacion && (
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                              ✓ Detectado
                            </span>
                          )}
                        </div>

                        <div className="relative">
                          <input
                            type="text"
                            readOnly
                            disabled
                            value={codigoOperacion}
                            placeholder="Se detectará automáticamente al subir el comprobante"
                            className="w-full px-4 py-3 bg-slate-100 dark:bg-[#120a22] border border-purple-200 dark:border-purple-800 rounded-xl text-slate-900 dark:text-white font-mono font-black text-sm cursor-not-allowed select-none opacity-90"
                          />
                        </div>

                        <p className="text-[11px] text-slate-500 dark:text-purple-300/70">
                          {codigoOperacion
                            ? `✓ N° de Operación ${codigoOperacion} validado con éxito.`
                            : 'El número de operación se obtiene automáticamente desde tu comprobante para evitar errores.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Botones de navegación del Paso 2 */}
                  <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setPasoActual(1)}
                      className="w-full sm:w-auto px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm text-slate-700 dark:text-purple-200 bg-white dark:bg-[#1a1133] border border-purple-200 dark:border-purple-800 hover:bg-purple-50 transition cursor-pointer"
                    >
                      ← Modificar Cantidad de Tickets
                    </button>

                    <button
                      type="button"
                      disabled={!codigoOperacion || isScanningOcr || !!ocrResultado?.esDuplicado}
                      onClick={() => {
                        if (codigoOperacion && !isScanningOcr && !ocrResultado?.esDuplicado) {
                          setPasoActual(3);
                        }
                      }}
                      className="w-full sm:w-auto py-3.5 px-6 rounded-2xl font-black text-white text-sm sm:text-base bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                    >
                      <span>Siguiente: Mis Datos Personales</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* ==================================================== */}
              {/* PASO 3: COMPLETAR DATOS PERSONALES Y FINALIZAR       */}
              {/* ==================================================== */}
              {pasoActual === 3 && (
                <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
                  <div className="text-center space-y-1">
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                      Paso 3: Ingresa tus datos para registrar tus tickets
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-purple-300">
                      Con estos datos podrás consultar tus números oficiales y ser contactado si resultas ganador.
                    </p>
                  </div>

                  {/* Resumen de la Orden */}
                  <div className="bg-purple-50/70 dark:bg-[#191030] p-4 rounded-2xl border border-purple-200/80 dark:border-purple-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Resumen de Compra:</span>
                      <span className="font-bold text-slate-800 dark:text-white text-sm">
                        {cantidad} {cantidad === 1 ? 'Ticket' : 'Tickets'} • {sorteo.titulo}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">N° Operación:</span>
                      <span className="font-mono font-black text-purple-700 dark:text-purple-300 text-sm">
                        #{codigoOperacion}
                      </span>
                    </div>
                  </div>

                  {/* Campos del Formulario */}
                  <div className="space-y-4">
                    {/* DNI */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-purple-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span>DNI (8 dígitos numéricos) *</span>
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={8}
                        value={dni}
                        onChange={e => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                        placeholder="Ej: 71234567"
                        className="w-full px-4 py-3 bg-purple-50/30 dark:bg-[#180f2d] border border-purple-200 dark:border-purple-800 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>

                    {/* Nombres y Apellidos */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-purple-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span>Nombres y Apellidos Completos *</span>
                      </label>
                      <input
                        type="text"
                        value={nombreCompleto}
                        onChange={e => setNombreCompleto(e.target.value)}
                        placeholder="Ej: Juan Carlos Pérez Ramírez"
                        className="w-full px-4 py-3 bg-purple-50/30 dark:bg-[#180f2d] border border-purple-200 dark:border-purple-800 rounded-xl text-slate-900 dark:text-white font-medium text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>

                    {/* Celular / WhatsApp */}
                    <div>
                      <label className="block text-xs font-black text-slate-700 dark:text-purple-200 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span>Número Celular / WhatsApp *</span>
                      </label>
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={celular}
                        onChange={e => setCelular(e.target.value.replace(/\D/g, '').slice(0, 9))}
                        placeholder="Ej: 987654321"
                        className="w-full px-4 py-3 bg-purple-50/30 dark:bg-[#180f2d] border border-purple-200 dark:border-purple-800 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                  </div>

                  {/* Mensaje de Error General */}
                  {errorMsg && (
                    <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-xl flex items-center gap-2.5 text-xs font-bold text-rose-800 dark:text-rose-200">
                      <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Botones de navegación del Paso 3 */}
                  <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setPasoActual(2)}
                      className="w-full sm:w-auto px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm text-slate-700 dark:text-purple-200 bg-white dark:bg-[#1a1133] border border-purple-200 dark:border-purple-800 hover:bg-purple-50 transition cursor-pointer"
                    >
                      ← Volver a Comprobante
                    </button>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto py-3.5 px-6 rounded-2xl font-black text-white text-sm sm:text-base bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/30 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Finalizando Compra...</span>
                        </>
                      ) : (
                        <>
                          <Ticket className="w-4 h-4 text-amber-300" />
                          <span>Finalizar Compra (S/ {totalPagar.toFixed(2)})</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-purple-300/70 font-semibold pt-1">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Tus datos están protegidos bajo cifrado y validación oficial.</span>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

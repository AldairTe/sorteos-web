import React, { useState } from 'react';
import { ArrowLeft, Copy, Check, Upload, AlertCircle, CheckCircle, Loader2, Sparkles, Ticket, ShieldCheck, HelpCircle } from 'lucide-react';
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
  const [cantidad, setCantidad] = useState<number>(1);
  const [copiado, setCopiado] = useState(false);

  // Formulario
  const [dni, setDni] = useState('');
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [celular, setCelular] = useState('');
  const [codigoOperacion, setCodigoOperacion] = useState('');
  const [archivoComprobante, setArchivoComprobante] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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

  const precioUnitario = Number(sorteo.precioTicket);
  const totalPagar = cantidad * precioUnitario;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setOcrResultado(null);
    setIsScanningOcr(true);

    try {
      // 1. Compresión optimizada en el cliente
      const compRes = await comprimirImagen(file);
      const fileComprimido = compRes.file;
      setArchivoComprobante(fileComprimido);
      setPreviewUrl(URL.createObjectURL(fileComprimido));

      // 2. Ejecutar OCR inteligente sobre la imagen optimizada
      const resultado = await analizarComprobanteOcr(fileComprimido);
      setOcrResultado(resultado);
      if (resultado.codigoOperacion) {
        setCodigoOperacion(resultado.codigoOperacion);
      }
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

    if (!codigoOperacion || codigoOperacion.trim().length < 4) {
      setErrorMsg('Debes ingresar o confirmar el N° de Operación del comprobante (mínimo 4 dígitos).');
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
      formData.append('codigoOperacionManual', codigoOperacion.trim());

      await registrarCompra(formData);

      // Lanzar confeti de celebración
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
    <div className="min-h-screen bg-pastel-50 dark:bg-[#0c0817] text-slate-900 dark:text-purple-100 transition-colors py-8 sm:py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Barra superior con botón volver */}
        <div className="mb-6 flex items-center justify-between">
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

        {/* Tarjeta Principal de Compra */}
        <div className="bg-white dark:bg-[#130d24] rounded-3xl border border-purple-200/80 dark:border-purple-900/60 shadow-xl shadow-purple-500/5 overflow-hidden">
          {/* Header del Sorteo */}
          <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 p-6 sm:p-8 text-white relative overflow-hidden">
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-purple-200 block">
                  Participa en el Sorteo Oficial
                </span>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{sorteo.titulo}</h1>
                <p className="text-xs sm:text-sm text-purple-100/90 max-w-xl">
                  {sorteo.descripcion || 'Adquiere tus boletos ahora, sube tu comprobante y participa por increíbles premios.'}
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 text-center shrink-0 self-start sm:self-auto">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-200 block">
                  Precio por Boleto
                </span>
                <span className="text-2xl sm:text-3xl font-black text-amber-300 font-mono block">
                  S/ {precioUnitario.toFixed(2)}
                </span>
              </div>
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
            <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
              {/* PASO 1: Selector de Cantidad Rápida y Personalizada */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-purple-300">
                    Paso 1: Elige la cantidad de tickets
                  </label>
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400">
                    S/ {precioUnitario.toFixed(2)} c/u
                  </span>
                </div>

                {/* Botones de acceso rápido */}
                <div className="grid grid-cols-5 gap-2">
                  {[1, 2, 5, 10, 20].map(n => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setCantidad(n)}
                      className={`py-2.5 rounded-xl font-black text-xs sm:text-sm border transition-all cursor-pointer ${
                        cantidad === n
                          ? 'bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/30 scale-[1.02]'
                          : 'bg-purple-50/50 dark:bg-[#180f2d] text-slate-700 dark:text-purple-200 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40'
                      }`}
                    >
                      {n} {n === 1 ? 'Ticket' : 'Tickets'}
                    </button>
                  ))}
                </div>

                {/* Contador interactivo +/- y entrada numérica personalizada */}
                <div className="flex flex-col sm:flex-row items-center justify-between bg-purple-50/70 dark:bg-[#191030] p-4 rounded-2xl border border-purple-200/80 dark:border-purple-800/80 gap-3">
                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                    <span className="text-xs font-bold text-slate-700 dark:text-purple-200">Personalizar cantidad:</span>
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
                        className="w-14 text-center py-1.5 font-mono font-black text-sm bg-transparent text-slate-900 dark:text-white focus:outline-hidden"
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

                  <div className="w-full sm:w-auto flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-purple-200/60 dark:border-purple-800/60">
                    <span className="text-xs text-slate-500 dark:text-purple-300">Total a pagar:</span>
                    <span className="text-2xl font-black text-purple-700 dark:text-purple-300 font-mono">
                      S/ {totalPagar.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* PASO 2: Método de Pago Dinámico */}
              <div className="space-y-3">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-purple-300 block">
                  Paso 2: Realiza el pago por billetera digital
                </label>

                {/* Selector dinámico de billeteras */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {billeterasDisponibles.map(b => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBilleteraSeleccionadaId(b.id)}
                      className={`py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 border transition whitespace-nowrap cursor-pointer ${
                        billeteraSeleccionada?.id === b.id
                          ? 'bg-purple-700 text-white border-purple-700 shadow-md shadow-purple-700/30'
                          : 'bg-white dark:bg-[#1a1133] text-slate-700 dark:text-purple-200 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-[#20153f]'
                      }`}
                    >
                      <span>{b.tipo === 'YAPE' ? '🟣' : b.tipo === 'PLIN' ? '🔵' : '🏦'}</span>
                      <span>{b.nombre}</span>
                    </button>
                  ))}
                </div>

                {/* Caja de Datos de Pago y Código QR */}
                {billeteraSeleccionada && (
                  <div className="bg-purple-50/40 dark:bg-[#160e2b] p-5 rounded-2xl border border-purple-200/80 dark:border-purple-800/70 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <span className="text-xs text-purple-600 dark:text-purple-400 font-bold block uppercase tracking-wide">
                          {billeteraSeleccionada.nombre} Oficial:
                        </span>
                        <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-wider font-mono block">
                          {billeteraSeleccionada.numero}
                        </span>
                        <span className="text-xs text-slate-600 dark:text-purple-300 block">
                          Titular: <strong>{billeteraSeleccionada.titular}</strong>
                        </span>
                        {billeteraSeleccionada.instrucciones && (
                          <p className="text-xs text-purple-700 dark:text-purple-300 font-medium mt-1">
                            {billeteraSeleccionada.instrucciones}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={handleCopiarNumero}
                        className="bg-white dark:bg-[#20153f] hover:bg-purple-100 dark:hover:bg-[#281a4e] text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-700 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-black flex items-center gap-2 transition shadow-xs self-start sm:self-auto shrink-0 cursor-pointer"
                      >
                        {copiado ? <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        <span>{copiado ? '¡Copiado!' : 'Copiar Número'}</span>
                      </button>
                    </div>

                    {/* Imagen del Código QR si existe */}
                    {billeteraSeleccionada.qrUrl && (
                      <div className="pt-4 border-t border-purple-200/60 dark:border-purple-800/60 flex items-center gap-5">
                        <div className="w-28 h-28 bg-white dark:bg-slate-900 rounded-2xl border border-purple-200 dark:border-purple-800 p-1.5 flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
                          <img
                            src={billeteraSeleccionada.qrUrl}
                            alt={`QR ${billeteraSeleccionada.nombre}`}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="text-xs text-slate-600 dark:text-purple-300/80 space-y-1.5">
                          <span className="font-extrabold text-slate-900 dark:text-white text-sm block">📱 Escaneo Rápido por QR</span>
                          <p className="text-xs leading-relaxed">
                            Abre tu aplicación de {billeteraSeleccionada.nombre}, selecciona "Escanear QR" y apunta a este código para pagar los <strong>S/ {totalPagar.toFixed(2)}</strong>.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* PASO 3: Subida de Comprobante y N° de Operación */}
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-purple-300 block">
                  Paso 3: Sube tu comprobante de pago
                </label>

                <div className="relative border-2 border-dashed border-purple-300 dark:border-purple-700/80 hover:border-purple-500 dark:hover:border-purple-500 bg-purple-50/40 dark:bg-[#160e2b] rounded-2xl p-6 text-center cursor-pointer transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    required
                  />
                  {previewUrl ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4 text-left">
                      <img
                        src={previewUrl}
                        alt="Comprobante cargado"
                        className="w-24 h-24 object-cover rounded-xl border border-purple-300 dark:border-purple-700 shrink-0 shadow-xs"
                      />
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle className="w-4 h-4 shrink-0" />
                          <span>Comprobante listo y cargado</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-purple-300/80">
                          Imagen procesada para validación y registro oficial.
                        </p>
                        <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold underline pt-1">
                          Haz clic para cambiar la imagen si es necesario
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 py-4">
                      <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-300 flex items-center justify-center mx-auto">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-black text-slate-800 dark:text-white">
                        Haz clic o arrastra aquí la captura del comprobante
                      </p>
                      <p className="text-xs text-slate-500 dark:text-purple-300/70">
                        PNG, JPG o WEBP. Validación antifraude automática.
                      </p>
                    </div>
                  )}
                </div>

                {isScanningOcr && (
                  <div className="flex items-center gap-2 p-3 bg-purple-100 dark:bg-purple-950/60 rounded-xl text-xs font-bold text-purple-800 dark:text-purple-200 border border-purple-200 dark:border-purple-800">
                    <Loader2 className="w-4 h-4 animate-spin text-purple-600 dark:text-purple-400" />
                    <span>Leyendo datos del comprobante y verificando autenticidad...</span>
                  </div>
                )}

                {ocrResultado && (
                  <div className={`p-4 rounded-xl border text-xs leading-relaxed space-y-1 ${
                    ocrResultado.esDuplicado
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
                  }`}>
                    <div className="flex items-center gap-1.5 font-bold">
                      {ocrResultado.esDuplicado ? (
                        <>
                          <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                          <span>¡ALERTA DE SEGURIDAD! Comprobante duplicado</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <span>Comprobante verificado con éxito (No duplicado)</span>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Campo Obligatorio de N° de Operación */}
                <div>
                  <label className="block text-xs font-black text-slate-700 dark:text-purple-200 uppercase tracking-wider mb-1.5">
                    N° de Operación del Comprobante *
                  </label>
                  <input
                    type="text"
                    value={codigoOperacion}
                    onChange={e => setCodigoOperacion(e.target.value.replace(/[^0-9a-zA-Z]/g, ''))}
                    placeholder="Ej: 893421 o 20491823"
                    className="w-full px-4 py-3 bg-purple-50/30 dark:bg-[#180f2d] border border-purple-200 dark:border-purple-800 rounded-xl text-slate-900 dark:text-white font-mono font-bold text-sm focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    required
                  />
                  <p className="text-[11px] text-slate-500 dark:text-purple-300/70 mt-1">
                    {ocrResultado?.codigoOperacion
                      ? '✓ Extraído automáticamente desde tu comprobante. Puedes confirmarlo o corregirlo si lo deseas.'
                      : 'Ingresa el número o código de operación que figura en tu voucher de Yape, Plin o banco.'}
                  </p>
                </div>
              </div>

              {/* PASO 4: Datos Personales (DNI 8 dígitos numérico, Nombre, Teléfono) */}
              <div className="space-y-4">
                <label className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-purple-300 block">
                  Paso 4: Ingresa tus datos para registrar tus tickets
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* DNI */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-purple-200 mb-1.5">
                      DNI (Exactamente 8 dígitos numéricos) *
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

                  {/* Teléfono Celular */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-purple-200 mb-1.5">
                      Número Celular / WhatsApp *
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

                  {/* Nombre Completo */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-purple-200 mb-1.5">
                      Nombres y Apellidos Completos *
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
                </div>
              </div>

              {/* Mensaje de Error */}
              {errorMsg && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-bold text-rose-800 dark:text-rose-200">
                  <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Botón de Envío */}
              <button
                type="submit"
                disabled={isSubmitting || ocrResultado?.esDuplicado}
                className="w-full py-4 px-6 rounded-2xl font-black text-white text-base sm:text-lg bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-600/30 hover:shadow-purple-600/50 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2.5 cursor-pointer uppercase tracking-wider"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Registrando Compra...</span>
                  </>
                ) : (
                  <>
                    <Ticket className="w-5 h-5 text-amber-300" />
                    <span>Confirmar y Enviar Comprobante (S/ {totalPagar.toFixed(2)})</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-purple-300/70 font-semibold pt-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Tus datos y comprobante están protegidos bajo cifrado y validación oficial.</span>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

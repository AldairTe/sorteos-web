import React, { useState } from 'react';
import { ConfiguracionWeb } from '@sorteos/shared';
import { crearReclamacion } from '../services/api';
import { ArrowLeft, BookOpen, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  config: ConfiguracionWeb;
  onVolver: () => void;
}

export const LibroReclamacionesPage: React.FC<Props> = ({ config, onVolver }) => {
  const [tipo, setTipo] = useState<'RECLAMO' | 'QUEJA'>('RECLAMO');
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [tipoDocumento, setTipoDocumento] = useState('DNI');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [domicilio, setDomicilio] = useState('');
  const [montoReclamado, setMontoReclamado] = useState('');
  const [descripcionBien, setDescripcionBien] = useState('Ticket de sorteo');
  const [detalle, setDetalle] = useState('');
  const [pedido, setPedido] = useState('');

  const [enviando, setEnviando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [constanciaCodigo, setConstanciaCodigo] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombres.trim() || !numeroDocumento.trim() || !detalle.trim()) {
      setErrorMsg('Por favor completa todos los campos requeridos (*)');
      return;
    }

    if (tipoDocumento === 'DNI' && numeroDocumento.trim().length !== 8) {
      setErrorMsg('El DNI debe tener exactamente 8 dígitos numéricos.');
      return;
    }

    setEnviando(true);
    setErrorMsg(null);

    try {
      const res = await crearReclamacion({
        tipo,
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        tipoDocumento,
        numeroDocumento: numeroDocumento.trim(),
        email: email.trim(),
        telefono: telefono.trim(),
        domicilio: domicilio.trim(),
        montoReclamado: montoReclamado ? Number(montoReclamado) : undefined,
        descripcionBien: descripcionBien.trim(),
        detalle: detalle.trim(),
        pedido: pedido.trim(),
      });

      if (res && res.reclamacion) {
        setConstanciaCodigo(res.reclamacion.codigo);
      } else {
        setConstanciaCodigo(`REC-${new Date().getFullYear()}-0001`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al registrar la reclamación. Intenta nuevamente.');
    } finally {
      setEnviando(false);
    }
  };

  const razonSocial = config.razonSocial || 'SORTEOS EL TREBOL S.A.C.';
  const ruc = config.ruc || '20609876543';
  const direccionFiscal = config.direccionLegal || 'Av. Las Palmeras 1234, San Isidro, Lima, Perú';

  return (
    <div className="min-h-screen bg-pastel-50 dark:bg-[#0c0817] text-slate-900 dark:text-purple-100 transition-colors py-8 sm:py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Barra superior con botón volver */}
        <div className="mb-6">
          <button
            onClick={onVolver}
            className="inline-flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-300 hover:text-purple-900 dark:hover:text-white bg-white dark:bg-[#160e2b] border border-purple-200 dark:border-purple-800/80 px-4 py-2.5 rounded-2xl shadow-xs transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </button>
        </div>

        {/* Tarjeta Contenedora Principal */}
        <div className="bg-white dark:bg-[#130d24] rounded-3xl border border-purple-200/80 dark:border-purple-900/60 shadow-xl shadow-purple-500/5 p-6 sm:p-10 space-y-8">
          {/* Encabezado */}
          <div className="border-b border-purple-100 dark:border-purple-900/50 pb-6 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-2xl shadow-pastel shrink-0">
              <BookOpen className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest block">
                Hoja de Reclamación Virtual Oficial
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                Libro de Reclamaciones
              </h1>
              <p className="text-xs text-slate-500 dark:text-purple-300/70 mt-1">
                Conforme a lo establecido en el Código de Protección y Defensa del Consumidor (Ley N.° 29571)
              </p>
            </div>
          </div>

          {/* Si ya se registró la reclamación */}
          {constanciaCodigo ? (
            <div className="text-center py-12 space-y-5">
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                Reclamación Registrada con Éxito
              </h2>
              <p className="text-slate-600 dark:text-purple-200 max-w-lg mx-auto text-sm leading-relaxed">
                Hemos recibido tu solicitud formalmente. De acuerdo a la ley de INDECOPI, te responderemos en un plazo máximo de 15 días hábiles. Guarda tu código de constancia:
              </p>
              <div className="inline-block bg-purple-100 dark:bg-purple-900/40 border-2 border-purple-300 dark:border-purple-700 px-8 py-4 rounded-3xl">
                <span className="font-mono text-2xl font-black text-purple-900 dark:text-purple-200 tracking-widest">
                  {constanciaCodigo}
                </span>
              </div>
              <div className="pt-6">
                <button
                  type="button"
                  onClick={onVolver}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-8 py-3.5 rounded-xl transition cursor-pointer shadow-md"
                >
                  Volver al Inicio
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Información Empresa */}
              <div className="bg-purple-50/70 dark:bg-[#1a1230] p-5 rounded-2xl border border-purple-200 dark:border-purple-800 text-xs text-slate-700 dark:text-purple-200 space-y-1">
                <p><strong>Razón Social:</strong> {razonSocial} | <strong>RUC:</strong> {ruc}</p>
                <p><strong>Domicilio Fiscal:</strong> {direccionFiscal}</p>
              </div>

              {/* Selector Reclamo / Queja */}
              <div>
                <label className="block text-xs font-black text-slate-700 dark:text-purple-200 uppercase tracking-wider mb-2">
                  Tipo de Afectación *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setTipo('RECLAMO')}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                      tipo === 'RECLAMO'
                        ? 'bg-purple-600 text-white border-purple-600 font-bold shadow-md'
                        : 'bg-white dark:bg-[#160f2b] border-purple-200 dark:border-purple-900 text-slate-700 dark:text-purple-200'
                    }`}
                  >
                    <span className="block text-sm font-black">RECLAMO</span>
                    <span className="block text-xs opacity-80 mt-1">Disconformidad relacionada a los tickets o sorteos adquiridos</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipo('QUEJA')}
                    className={`p-4 rounded-2xl border text-left transition cursor-pointer ${
                      tipo === 'QUEJA'
                        ? 'bg-purple-600 text-white border-purple-600 font-bold shadow-md'
                        : 'bg-white dark:bg-[#160f2b] border-purple-200 dark:border-purple-900 text-slate-700 dark:text-purple-200'
                    }`}
                  >
                    <span className="block text-sm font-black">QUEJA</span>
                    <span className="block text-xs opacity-80 mt-1">Malestar o descontento respecto a la atención recibida</span>
                  </button>
                </div>
              </div>

              {/* Datos Consumidor */}
              <div className="space-y-4">
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider border-b border-purple-100 dark:border-purple-900/40 pb-2">
                  1. Identificación del Consumidor Reclamante
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold mb-1 text-slate-600 dark:text-purple-300">Nombres *</label>
                    <input
                      type="text"
                      required
                      value={nombres}
                      onChange={e => setNombres(e.target.value)}
                      placeholder="Ej. Juan Carlos"
                      className="w-full bg-slate-50 dark:bg-[#181030] border border-purple-200 dark:border-purple-800 rounded-xl px-3.5 py-3 font-medium outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-slate-600 dark:text-purple-300">Apellidos *</label>
                    <input
                      type="text"
                      required
                      value={apellidos}
                      onChange={e => setApellidos(e.target.value)}
                      placeholder="Ej. Pérez Quispe"
                      className="w-full bg-slate-50 dark:bg-[#181030] border border-purple-200 dark:border-purple-800 rounded-xl px-3.5 py-3 font-medium outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-slate-600 dark:text-purple-300">Documento de Identidad *</label>
                    <div className="flex gap-2">
                      <select
                        value={tipoDocumento}
                        onChange={e => setTipoDocumento(e.target.value)}
                        className="bg-slate-50 dark:bg-[#181030] border border-purple-200 dark:border-purple-800 rounded-xl px-3 py-3 font-bold outline-none"
                      >
                        <option value="DNI">DNI</option>
                        <option value="CE">C.E.</option>
                        <option value="PASAPORTE">Pasaporte</option>
                      </select>
                      <input
                        type="text"
                        required
                        value={numeroDocumento}
                        onChange={e => {
                          const val = tipoDocumento === 'DNI' ? e.target.value.replace(/\D/g, '').slice(0, 8) : e.target.value;
                          setNumeroDocumento(val);
                        }}
                        placeholder={tipoDocumento === 'DNI' ? '8 dígitos' : 'N° documento'}
                        maxLength={tipoDocumento === 'DNI' ? 8 : 15}
                        className="flex-1 bg-slate-50 dark:bg-[#181030] border border-purple-200 dark:border-purple-800 rounded-xl px-3.5 py-3 font-medium outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-slate-600 dark:text-purple-300">Teléfono / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={telefono}
                      onChange={e => setTelefono(e.target.value)}
                      placeholder="Ej. 987654321"
                      className="w-full bg-slate-50 dark:bg-[#181030] border border-purple-200 dark:border-purple-800 rounded-xl px-3.5 py-3 font-medium outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold mb-1 text-slate-600 dark:text-purple-300">Correo Electrónico *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Para enviar la copia formal de tu constancia"
                      className="w-full bg-slate-50 dark:bg-[#181030] border border-purple-200 dark:border-purple-800 rounded-xl px-3.5 py-3 font-medium outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold mb-1 text-slate-600 dark:text-purple-300">Domicilio</label>
                    <input
                      type="text"
                      value={domicilio}
                      onChange={e => setDomicilio(e.target.value)}
                      placeholder="Dirección, distrito y ciudad"
                      className="w-full bg-slate-50 dark:bg-[#181030] border border-purple-200 dark:border-purple-800 rounded-xl px-3.5 py-3 font-medium outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Detalle del Bien */}
              <div className="space-y-4">
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider border-b border-purple-100 dark:border-purple-900/40 pb-2">
                  2. Detalle del Bien Contratado
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold mb-1 text-slate-600 dark:text-purple-300">Descripción del Bien</label>
                    <input
                      type="text"
                      value={descripcionBien}
                      onChange={e => setDescripcionBien(e.target.value)}
                      placeholder="Ej. Compra de 5 tickets para Sorteo"
                      className="w-full bg-slate-50 dark:bg-[#181030] border border-purple-200 dark:border-purple-800 rounded-xl px-3.5 py-3 font-medium outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-slate-600 dark:text-purple-300">Monto Reclamado (S/.)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={montoReclamado}
                      onChange={e => setMontoReclamado(e.target.value)}
                      placeholder="Ej. 50.00"
                      className="w-full bg-slate-50 dark:bg-[#181030] border border-purple-200 dark:border-purple-800 rounded-xl px-3.5 py-3 font-medium outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Detalle y Pedido */}
              <div className="space-y-4">
                <h3 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-wider border-b border-purple-100 dark:border-purple-900/40 pb-2">
                  3. Detalle de la Reclamación y Pedido
                </h3>
                <div className="space-y-4 text-xs">
                  <div>
                    <label className="block font-bold mb-1 text-slate-600 dark:text-purple-300">Detalle del Reclamo o Queja *</label>
                    <textarea
                      required
                      rows={4}
                      value={detalle}
                      onChange={e => setDetalle(e.target.value)}
                      placeholder="Describe claramente los hechos ocurridos..."
                      className="w-full bg-slate-50 dark:bg-[#181030] border border-purple-200 dark:border-purple-800 rounded-xl p-3.5 font-medium outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-slate-600 dark:text-purple-300">Pedido Concreto del Consumidor *</label>
                    <textarea
                      required
                      rows={3}
                      value={pedido}
                      onChange={e => setPedido(e.target.value)}
                      placeholder="¿Qué solución concreta solicitas?"
                      className="w-full bg-slate-50 dark:bg-[#181030] border border-purple-200 dark:border-purple-800 rounded-xl p-3.5 font-medium outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Botón de envío */}
              <div className="pt-4 border-t border-purple-100 dark:border-purple-900/40 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onVolver}
                  className="px-6 py-3 rounded-xl text-xs font-bold text-slate-600 dark:text-purple-300 hover:bg-slate-100 dark:hover:bg-purple-900/30 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviando}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white font-black text-xs px-8 py-3.5 rounded-xl transition shadow-pastel flex items-center gap-2 cursor-pointer"
                >
                  {enviando ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Registrando Hoja...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Enviar Hoja de Reclamación</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

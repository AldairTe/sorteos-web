import React, { useState } from 'react';
import { ConfiguracionWeb } from '@sorteos/shared';
import { crearReclamacion } from '../../services/api';
import { X, BookOpen, Send, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: ConfiguracionWeb;
}

export const LibroReclamacionesModal: React.FC<Props> = ({ isOpen, onClose, config }) => {
  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#120a22] text-slate-900 dark:text-purple-100 rounded-3xl max-w-3xl w-full border border-purple-200 dark:border-purple-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-purple-100 dark:border-purple-900/60 flex items-center justify-between shrink-0 bg-purple-50/50 dark:bg-[#170e2b]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-pastel">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                Hoja de Reclamación Virtual
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Libro de Reclamaciones
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-purple-900/40 hover:bg-slate-200 dark:hover:bg-purple-900 text-slate-700 dark:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm no-scrollbar">
          {/* Si ya se envió con éxito */}
          {constanciaCodigo ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                Reclamación Registrada con Éxito
              </h4>
              <p className="text-slate-600 dark:text-purple-200 max-w-md mx-auto text-sm">
                Hemos recibido tu solicitud conforme a la normativa de INDECOPI. Guarda el siguiente código de seguimiento:
              </p>
              <div className="inline-block bg-purple-100 dark:bg-purple-900/40 border border-purple-300 dark:border-purple-700 px-6 py-3 rounded-2xl">
                <span className="font-mono text-xl font-black text-purple-900 dark:text-purple-200 tracking-wider">
                  {constanciaCodigo}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-purple-300/70 max-w-sm mx-auto">
                Te responderemos al correo proporcionado en un plazo no mayor a 15 días hábiles.
              </p>
              <div className="pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-8 py-3 rounded-xl cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Información de la Empresa */}
              <div className="bg-purple-50 dark:bg-[#1a1230] p-4 rounded-2xl border border-purple-200 dark:border-purple-800 text-xs text-slate-700 dark:text-purple-200/90 space-y-1">
                <p><strong>Razón Social:</strong> {razonSocial} | <strong>RUC:</strong> {ruc}</p>
                <p><strong>Domicilio Fiscal:</strong> {direccionFiscal}</p>
                <p className="text-[11px] text-purple-700 dark:text-purple-400 mt-1">
                  Conforme a lo establecido en el Código de Protección y Defensa del Consumidor (Ley N.° 29571).
                </p>
              </div>

              {/* Selector Tipo: Reclamo vs Queja */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-purple-200 uppercase mb-2">
                  Tipo de Afectación *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setTipo('RECLAMO')}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      tipo === 'RECLAMO'
                        ? 'bg-purple-600 text-white border-purple-600 font-bold shadow-sm'
                        : 'bg-white dark:bg-[#160f2b] border-purple-200 dark:border-purple-900 text-slate-700 dark:text-purple-200'
                    }`}
                  >
                    <span className="block text-sm font-black">RECLAMO</span>
                    <span className="block text-[11px] opacity-80 mt-0.5">Disconformidad con el ticket o sorteo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipo('QUEJA')}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer ${
                      tipo === 'QUEJA'
                        ? 'bg-purple-600 text-white border-purple-600 font-bold shadow-sm'
                        : 'bg-white dark:bg-[#160f2b] border-purple-200 dark:border-purple-900 text-slate-700 dark:text-purple-200'
                    }`}
                  >
                    <span className="block text-sm font-black">QUEJA</span>
                    <span className="block text-[11px] opacity-80 mt-0.5">Malestar respecto a la atención recibida</span>
                  </button>
                </div>
              </div>

              {/* Datos del Consumidor */}
              <div>
                <h5 className="font-black text-sm text-slate-900 dark:text-white mb-3">
                  1. Identificación del Consumidor Reclamante
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-purple-300">Nombres *</label>
                    <input
                      type="text"
                      required
                      value={nombres}
                      onChange={e => setNombres(e.target.value)}
                      placeholder="Ej. Juan Carlos"
                      className="w-full bg-slate-50 dark:bg-[#181030] border border-purple-200 dark:border-purple-800 rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-purple-300">Apellidos *</label>
                    <input
                      type="text"
                      required
                      value={apellidos}
                      onChange={e => setApellidos(e.target.value)}
                      placeholder="Ej. Pérez Quispe"
                      className="w-full bg-slate-50 dark:bg-[#181030] border border-purple-200 dark:border-purple-800 rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-purple-300">Documento *</label>
                    <div className="flex gap-2">
                      <select
                        value={tipoDocumento}
                        onChange={e => setTipoDocumento(e.target.value)}
                        className="bg-slate-50 dark:bg-[#181030] border border-purple-200 dark:border-purple-800 rounded-xl px-2.5 py-2.5 text-xs font-bold outline-none"
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
                        className="flex-1 bg-slate-50 dark:bg-[#181030] border border-purple-200 dark:border-purple-800 rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-purple-300">Teléfono / WhatsApp *</label>
                    <input
                      type="tel"
                      required
                      value={telefono}
                      onChange={e => setTelefono(e.target.value)}
                      placeholder="Ej. 987654321"
                      className="w-full bg-slate-50 dark:bg-[#181030] border border-purple-200 dark:border-purple-800 rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-purple-300">Correo Electrónico *</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Para enviar la copia de tu constancia"
                      className="w-full bg-slate-50 dark:bg-[#181030] border border-purple-200 dark:border-purple-800 rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-purple-300">Domicilio</label>
                    <input
                      type="text"
                      value={domicilio}
                      onChange={e => setDomicilio(e.target.value)}
                      placeholder="Dirección, distrito y departamento"
                      className="w-full bg-slate-50 dark:bg-[#181030] border border-purple-200 dark:border-purple-800 rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Detalle del Bien */}
              <div>
                <h5 className="font-black text-sm text-slate-900 dark:text-white mb-3">
                  2. Detalle del Bien Contratado
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-purple-300">Descripción del Bien</label>
                    <input
                      type="text"
                      value={descripcionBien}
                      onChange={e => setDescripcionBien(e.target.value)}
                      placeholder="Ej. Compra de 5 tickets para Sorteo #001"
                      className="w-full bg-slate-50 dark:bg-[#181030] border border-purple-200 dark:border-purple-800 rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-purple-300">Monto Reclamado (S/.)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={montoReclamado}
                      onChange={e => setMontoReclamado(e.target.value)}
                      placeholder="Ej. 50.00"
                      className="w-full bg-slate-50 dark:bg-[#181030] border border-purple-200 dark:border-purple-800 rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Detalle y Pedido */}
              <div>
                <h5 className="font-black text-sm text-slate-900 dark:text-white mb-3">
                  3. Detalle de la Reclamación y Pedido
                </h5>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-purple-300">Detalle del Reclamo o Queja *</label>
                    <textarea
                      required
                      rows={3}
                      value={detalle}
                      onChange={e => setDetalle(e.target.value)}
                      placeholder="Describe claramente los hechos ocurridos..."
                      className="w-full bg-slate-50 dark:bg-[#181030] border border-purple-200 dark:border-purple-800 rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1 text-slate-600 dark:text-purple-300">Pedido Concreto del Consumidor *</label>
                    <textarea
                      required
                      rows={2}
                      value={pedido}
                      onChange={e => setPedido(e.target.value)}
                      placeholder="¿Qué solución solicitas? (Ej. Verificación de tickets, aclaración de comprobante, etc.)"
                      className="w-full bg-slate-50 dark:bg-[#181030] border border-purple-200 dark:border-purple-800 rounded-xl px-3.5 py-2.5 text-xs font-medium outline-none focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Footer submit */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-purple-300 hover:bg-slate-100 dark:hover:bg-purple-900/30 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={enviando}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white font-black text-xs px-6 py-2.5 rounded-xl transition shadow-pastel flex items-center gap-2 cursor-pointer"
                >
                  {enviando ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Registrando...</span>
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

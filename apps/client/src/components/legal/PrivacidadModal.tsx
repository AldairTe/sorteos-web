import React from 'react';
import { ConfiguracionWeb } from '@sorteos/shared';
import { X, Lock, ShieldCheck } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: ConfiguracionWeb;
}

export const PrivacidadModal: React.FC<Props> = ({ isOpen, onClose, config }) => {
  if (!isOpen) return null;

  const razonSocial = config.razonSocial || 'SORTEOS EL TREBOL S.A.C.';
  const nombreComercial = config.nombreNegocio || 'Sorteos El Trébol';
  const ruc = config.ruc || '20609876543';
  const whatsapp = config.whatsappNumero || '+51 987 654 321';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#120a22] text-slate-900 dark:text-purple-100 rounded-3xl max-w-3xl w-full border border-purple-200 dark:border-purple-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-purple-100 dark:border-purple-900/60 flex items-center justify-between shrink-0 bg-purple-50/50 dark:bg-[#170e2b]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-pastel">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                Ley N.° 29733 (Perú)
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Política de Privacidad
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
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-sm leading-relaxed text-slate-700 dark:text-purple-200/90 no-scrollbar">
          <p className="font-medium">
            En <strong className="text-purple-600 dark:text-purple-400">{nombreComercial}</strong> ({razonSocial}, RUC {ruc}) garantizamos la protección irrestricta de tus datos personales en estricto cumplimiento con la <strong>Ley N.° 29733 (Ley de Protección de Datos Personales del Perú)</strong> y su correspondiente reglamento.
          </p>

          <section className="space-y-2">
            <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 flex items-center justify-center text-xs font-bold">1</span>
              Datos Personales que Recopilamos
            </h4>
            <ul className="list-disc list-inside space-y-1 pl-2">
              <li>Documento de Identidad (DNI) y Nombres Completos para contrastar la asignación legítima de cada ticket.</li>
              <li>Número telefónico de WhatsApp con el fin exclusivo de notificar estados de compra y contactar a ganadores.</li>
              <li>Comprobante de pago emitido por entidades financieras (Yape, Plin o banca digital), capturando monto, fecha y código de operación para trazabilidad contable.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 flex items-center justify-center text-xs font-bold">2</span>
              Finalidad del Tratamiento de Datos
            </h4>
            <p>
              Tus datos son almacenados en un banco de datos seguro con la finalidad única de validar comprobantes, prevenir fraudes o suplantaciones, emitir boletos electrónicos y coordinar la entrega notarial de los premios.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 flex items-center justify-center text-xs font-bold">3</span>
              Seguridad y Confidencialidad
            </h4>
            <p>
              Aplicamos protocolos de seguridad técnica y encriptación en tránsito para salvaguardar tu información. No comercializamos, alquilamos ni transferimos tus datos a empresas terceras de publicidad bajo ninguna circunstancia.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 flex items-center justify-center text-xs font-bold">4</span>
              Ejercicio de Derechos ARCO
            </h4>
            <p>
              Puedes ejercer tus derechos de Acceso, Rectificación, Cancelación y Oposición (ARCO) comunicándote directamente a nuestro canal de soporte en WhatsApp ({whatsapp}) adjuntando una copia simple de tu documento de identidad.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-purple-100 dark:border-purple-900/60 bg-purple-50/50 dark:bg-[#170e2b] flex items-center justify-end">
          <button
            onClick={onClose}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { ConfiguracionWeb } from '@sorteos/shared';
import { X, ShieldCheck, Scale } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  config: ConfiguracionWeb;
}

export const TerminosModal: React.FC<Props> = ({ isOpen, onClose, config }) => {
  if (!isOpen) return null;

  const razonSocial = config.razonSocial || 'SORTEOS EL TREBOL S.A.C.';
  const nombreComercial = config.nombreNegocio || 'Sorteos El Trébol';
  const ruc = config.ruc || '20609876543';
  const whatsapp = config.whatsappNumero || '+51 987 654 321';
  const facebookUrl = config.facebookUrl || 'https://facebook.com';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#120a22] text-slate-900 dark:text-purple-100 rounded-3xl max-w-3xl w-full border border-purple-200 dark:border-purple-800 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-purple-100 dark:border-purple-900/60 flex items-center justify-between shrink-0 bg-purple-50/50 dark:bg-[#170e2b]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-pastel">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-mono font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider block">
                Marco Legal Oficial
              </span>
              <h3 className="text-xl font-black text-slate-900 dark:text-white">
                Términos y Condiciones
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
            Los presentes términos regulan la participación en los sorteos organizados por{' '}
            <strong className="text-slate-900 dark:text-white">{razonSocial}</strong> (RUC: {ruc}) bajo la marca comercial{' '}
            <strong className="text-purple-600 dark:text-purple-400">{nombreComercial}</strong>. Al registrar un ticket y enviar un comprobante de pago, el participante declara haber leído, comprendido y aceptado en su totalidad las siguientes cláusulas:
          </p>

          <section className="space-y-2">
            <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 flex items-center justify-center text-xs font-bold">1</span>
              Organizador y Responsabilidad Legal
            </h4>
            <p>
              {razonSocial} es la única entidad responsable de la organización, fiscalización interna, ejecución y entrega efectiva de los premios estipulados para cada sorteo.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 flex items-center justify-center text-xs font-bold">2</span>
              Requisitos de Participación
            </h4>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>Podrán participar personas naturales mayores de 18 años con documento de identidad oficial vigente (DNI, Carnet de Extranjería o Pasaporte).</li>
              <li>El registro requiere proporcionar DNI exacto, nombres completos, número de WhatsApp y comprobante de pago legible emitido mediante Yape o Plin.</li>
              <li>El pago debe realizarse única y exclusivamente a los números y cuentas oficiales acreditadas en este portal.</li>
              <li>Cada comprobante (código de operación único) es válido una sola vez. Comprobantes duplicados, alterados digitalmente o que no coincidan con la cuenta receptora serán rechazados de forma inmediata mediante nuestro sistema de control antifraude.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 flex items-center justify-center text-xs font-bold">3</span>
              Asignación de Tickets y Precios
            </h4>
            <p>
              El costo por ticket corresponde al monto oficial configurado en cada sorteo activo. La cantidad de números generados es calculada en proporción directa al importe verificado. Cada ticket recibe una numeración correlativa única generada por el sistema.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 flex items-center justify-center text-xs font-bold">4</span>
              Mecánica del Sorteo y Transmisiones
            </h4>
            <p>
              Los sorteos se llevan a cabo en las fechas programadas y se transmiten en vivo a través de nuestra página oficial de Facebook (<a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 font-bold underline">Facebook Oficial</a>). El método de extracción de ganadores es público, transparente y auditable mediante ánfora giratoria o bolillero certificado en tiempo real.
            </p>
          </section>

          <section className="space-y-2">
            <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 flex items-center justify-center text-xs font-bold">5</span>
              Entrega y Reclamación de Premios
            </h4>
            <ul className="list-disc list-inside space-y-1.5 pl-2">
              <li>El ganador será notificado vía llamada y mensaje al número de WhatsApp registrado en el momento de la compra.</li>
              <li>Para reclamar el premio, el participante debe exhibir su documento de identidad físico original, el cual debe concordar de forma exacta con los datos del ticket premiado.</li>
              <li>En el caso de vehículos o motocicletas, los trámites notariales y de transferencia registral vehicular se coordinarán directamente con el adjudicado.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h4 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300 flex items-center justify-center text-xs font-bold">6</span>
              Atención al Cliente
            </h4>
            <p>
              Para cualquier duda, aclaración o soporte post-compra, nuestro canal de atención prioritario es WhatsApp al número oficial: <strong className="text-purple-600 dark:text-purple-400">{whatsapp}</strong>.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-purple-100 dark:border-purple-900/60 bg-purple-50/50 dark:bg-[#170e2b] flex items-center justify-end">
          <button
            onClick={onClose}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition cursor-pointer"
          >
            Entendido y Acepto
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { ConfiguracionWeb } from '@sorteos/shared';
import { ArrowLeft, Scale, ShieldCheck } from 'lucide-react';

interface Props {
  config: ConfiguracionWeb;
  onVolver: () => void;
}

export const TerminosPage: React.FC<Props> = ({ config, onVolver }) => {
  const razonSocial = config.razonSocial || 'SORTEOS EL TREBOL S.A.C.';
  const nombreComercial = config.nombreNegocio || 'Sorteos El Trébol';
  const ruc = config.ruc || '20609876543';
  const whatsapp = config.whatsappNumero || '+51 987 654 321';
  const facebookUrl = config.facebookUrl || 'https://facebook.com';

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
              <Scale className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest block">
                Marco Legal y Condiciones Oficiales
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                Términos y Condiciones
              </h1>
              <p className="text-xs text-slate-500 dark:text-purple-300/70 mt-1">
                Última actualización: {new Date().toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          {/* Cuerpo Legal Detallado */}
          <div className="space-y-6 text-sm leading-relaxed text-slate-700 dark:text-purple-200/90 font-medium">
            <p className="text-base text-slate-800 dark:text-purple-100 font-semibold">
              Los presentes términos regulan la adquisición de tickets y la participación en los sorteos organizados por{' '}
              <strong className="text-slate-900 dark:text-white">{razonSocial}</strong> (RUC: {ruc}) bajo la marca comercial{' '}
              <strong className="text-purple-600 dark:text-purple-400">{nombreComercial}</strong>. Al registrar un ticket y enviar un comprobante de pago, el participante declara haber leído, comprendido y aceptado en su totalidad las siguientes cláusulas:
            </p>

            <section className="space-y-2 p-5 rounded-2xl bg-purple-50/50 dark:bg-[#170e2b] border border-purple-100 dark:border-purple-900/40">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                Organizador y Responsabilidad Legal
              </h2>
              <p>
                {razonSocial} es la única entidad responsable de la organización, custodia, fiscalización interna y entrega efectiva de los premios estipulados para cada sorteo activo en la plataforma digital.
              </p>
            </section>

            <section className="space-y-2 p-5 rounded-2xl bg-purple-50/50 dark:bg-[#170e2b] border border-purple-100 dark:border-purple-900/40">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                Requisitos de Participación
              </h2>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>Podrán participar personas naturales mayores de 18 años con documento de identidad oficial vigente (DNI, Carnet de Extranjería o Pasaporte).</li>
                <li>El registro requiere proporcionar DNI exacto (8 dígitos numéricos), nombres completos, número de celular/WhatsApp y comprobante de pago emitido mediante Yape o Plin.</li>
                <li>El pago debe realizarse única y exclusivamente a los números y cuentas acreditadas en la web oficial.</li>
                <li>Cada comprobante (código de operación único) es válido una sola vez. Comprobantes duplicados, alterados digitalmente o que no correspondan a la cuenta receptora serán rechazados de forma inmediata mediante nuestro sistema de control antifraude.</li>
              </ul>
            </section>

            <section className="space-y-2 p-5 rounded-2xl bg-purple-50/50 dark:bg-[#170e2b] border border-purple-100 dark:border-purple-900/40">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">3</span>
                Asignación de Tickets y Precios
              </h2>
              <p>
                El costo por ticket corresponde al monto oficial configurado en cada sorteo activo. La cantidad de números generados es calculada en proporción directa al importe verificado. Cada ticket recibe una numeración correlativa única generada automáticamente por el sistema.
              </p>
            </section>

            <section className="space-y-2 p-5 rounded-2xl bg-purple-50/50 dark:bg-[#170e2b] border border-purple-100 dark:border-purple-900/40">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">4</span>
                Mecánica del Sorteo y Transmisiones en Vivo
              </h2>
              <p>
                Los sorteos se llevan a cabo en las fechas programadas y se transmiten en vivo a través de nuestra página oficial de Facebook (<a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 dark:text-purple-400 font-bold underline">Facebook Oficial</a>). El método de extracción de ganadores es público, transparente y auditable mediante ánfora giratoria o bolillero certificado en tiempo real.
              </p>
            </section>

            <section className="space-y-2 p-5 rounded-2xl bg-purple-50/50 dark:bg-[#170e2b] border border-purple-100 dark:border-purple-900/40">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">5</span>
                Entrega y Reclamación de Premios
              </h2>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>El ganador será notificado vía llamada y mensaje al número de WhatsApp registrado en el momento de la compra.</li>
                <li>Para reclamar el premio, el participante debe exhibir su documento de identidad físico original, el cual debe concordar de forma exacta con los datos del ticket premiado.</li>
                <li>En el caso de vehículos o motocicletas, los trámites notariales y de transferencia registral vehicular se coordinarán directamente con el adjudicado.</li>
              </ul>
            </section>

            <section className="space-y-2 p-5 rounded-2xl bg-purple-50/50 dark:bg-[#170e2b] border border-purple-100 dark:border-purple-900/40">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">6</span>
                Atención al Cliente
              </h2>
              <p>
                Para cualquier duda, aclaración o soporte post-compra, nuestro canal de atención prioritario es WhatsApp al número oficial: <strong className="text-purple-600 dark:text-purple-400">{whatsapp}</strong>.
              </p>
            </section>
          </div>

          <div className="pt-6 border-t border-purple-100 dark:border-purple-900/50 flex justify-end">
            <button
              onClick={onVolver}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-8 py-3 rounded-xl transition cursor-pointer shadow-md"
            >
              Volver a la Página Principal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

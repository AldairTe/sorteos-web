import React from 'react';
import { ConfiguracionWeb } from '@sorteos/shared';
import { ArrowLeft, Lock, ShieldCheck } from 'lucide-react';

interface Props {
  config: ConfiguracionWeb;
  onVolver: () => void;
}

export const PrivacidadPage: React.FC<Props> = ({ config, onVolver }) => {
  const razonSocial = config.razonSocial || 'SORTEOS EL TREBOL S.A.C.';
  const nombreComercial = config.nombreNegocio || 'Sorteos El Trébol';
  const ruc = config.ruc || '20609876543';
  const whatsapp = config.whatsappNumero || '+51 987 654 321';

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
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest block">
                Protección de Datos Personales · Ley N.° 29733 (Perú)
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                Política de Privacidad
              </h1>
              <p className="text-xs text-slate-500 dark:text-purple-300/70 mt-1">
                Garantía y confidencialidad en el tratamiento de tus datos
              </p>
            </div>
          </div>

          {/* Contenido Legal */}
          <div className="space-y-6 text-sm leading-relaxed text-slate-700 dark:text-purple-200/90 font-medium">
            <p className="text-base text-slate-800 dark:text-purple-100 font-semibold">
              En <strong className="text-purple-600 dark:text-purple-400">{nombreComercial}</strong> ({razonSocial}, RUC {ruc}) garantizamos la protección irrestricta de tus datos personales en estricto cumplimiento con la <strong>Ley N.° 29733 (Ley de Protección de Datos Personales del Perú)</strong> y su reglamento.
            </p>

            <section className="space-y-2 p-5 rounded-2xl bg-purple-50/50 dark:bg-[#170e2b] border border-purple-100 dark:border-purple-900/40">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">1</span>
                Datos Personales que Recopilamos
              </h2>
              <ul className="list-disc list-inside space-y-1.5 pl-2">
                <li>Documento de Identidad (DNI) y Nombres Completos para contrastar la asignación legítima de cada ticket.</li>
                <li>Número telefónico de WhatsApp con el fin exclusivo de notificar estados de compra y contactar a ganadores.</li>
                <li>Comprobante de pago emitido por entidades financieras (Yape, Plin o banca digital), capturando monto, fecha y código de operación para trazabilidad contable.</li>
              </ul>
            </section>

            <section className="space-y-2 p-5 rounded-2xl bg-purple-50/50 dark:bg-[#170e2b] border border-purple-100 dark:border-purple-900/40">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">2</span>
                Finalidad del Tratamiento de Datos
              </h2>
              <p>
                Tus datos son almacenados en un banco de datos seguro con la finalidad única de validar comprobantes, prevenir fraudes o suplantaciones, emitir boletos electrónicos y coordinar la entrega notarial de los premios.
              </p>
            </section>

            <section className="space-y-2 p-5 rounded-2xl bg-purple-50/50 dark:bg-[#170e2b] border border-purple-100 dark:border-purple-900/40">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">3</span>
                Seguridad y Confidencialidad
              </h2>
              <p>
                Aplicamos protocolos de seguridad técnica y encriptación en tránsito para salvaguardar tu información. No comercializamos, alquilamos ni transferimos tus datos a empresas terceras de publicidad bajo ninguna circunstancia.
              </p>
            </section>

            <section className="space-y-2 p-5 rounded-2xl bg-purple-50/50 dark:bg-[#170e2b] border border-purple-100 dark:border-purple-900/40">
              <h2 className="text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center text-xs font-bold">4</span>
                Ejercicio de Derechos ARCO
              </h2>
              <p>
                Puedes ejercer tus derechos de Acceso, Rectificación, Cancelación y Oposición (ARCO) comunicándote directamente a nuestro canal de soporte en WhatsApp ({whatsapp}) adjuntando una copia simple de tu documento de identidad.
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

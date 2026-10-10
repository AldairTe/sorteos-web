import React, { useState } from 'react';
import { Settings, Save, Smartphone, MessageSquare, Globe, Plus, Trash2, Upload, QrCode, CheckCircle2, Loader2, Pencil } from 'lucide-react';
import { ConfiguracionWeb, BilleteraDigital } from '@sorteos/shared';
import { actualizarConfiguracion, subirImagenQr, subirImagenLogo } from '../services/api';

interface Props {
  config: ConfiguracionWeb;
  onConfigActualizada: (config: ConfiguracionWeb) => void;
}

export const ConfiguracionView: React.FC<Props> = ({ config, onConfigActualizada }) => {
  const [form, setForm] = useState<ConfiguracionWeb>({
    ...config,
    billeteras: config.billeteras || []
  });
  const [guardando, setGuardando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(false);
  const [subiendoQrId, setSubiendoQrId] = useState<string | null>(null);
  const [subiendoLogo, setSubiendoLogo] = useState(false);

  const handleSubirLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendoLogo(true);
    try {
      const logoUrl = await subirImagenLogo(file);
      setForm(prev => ({ ...prev, logoUrl }));
      onConfigActualizada({ ...form, logoUrl });
      alert('¡Logo oficial actualizado con éxito!');
    } catch (err) {
      alert('Error al subir el logo');
    } finally {
      setSubiendoLogo(false);
    }
  };

  // Modal / Formulario para nueva billetera
  const [mostrarModalNuevaBilletera, setMostrarModalNuevaBilletera] = useState(false);
  const [nuevaBilletera, setNuevaBilletera] = useState<Partial<BilleteraDigital>>({
    nombre: '',
    tipo: 'YAPE',
    numero: '',
    titular: '',
    instrucciones: '',
    activo: true,
  });

  // Modal / Formulario para editar billetera existente
  const [billeteraEnEdicion, setBilleteraEnEdicion] = useState<BilleteraDigital | null>(null);

  const handleGuardarEdicionBilletera = () => {
    if (!billeteraEnEdicion) return;
    if (!billeteraEnEdicion.nombre || !billeteraEnEdicion.numero || !billeteraEnEdicion.titular) {
      alert('Por favor completa nombre, número y titular de la billetera');
      return;
    }
    setForm(prev => ({
      ...prev,
      billeteras: prev.billeteras.map(b => (b.id === billeteraEnEdicion.id ? billeteraEnEdicion : b))
    }));
    setBilleteraEnEdicion(null);
  };

  const handleSubirQrEdicion = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !billeteraEnEdicion) return;

    setSubiendoQrId('edicion');
    try {
      const qrUrl = await subirImagenQr(file);
      setBilleteraEnEdicion(prev => (prev ? { ...prev, qrUrl } : null));
    } catch (err) {
      alert('Error al subir la imagen del QR');
    } finally {
      setSubiendoQrId(null);
    }
  };

  const handleSubirQr = async (billeteraId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendoQrId(billeteraId);
    try {
      const qrUrl = await subirImagenQr(file);
      setForm(prev => ({
        ...prev,
        billeteras: prev.billeteras.map(b => (b.id === billeteraId ? { ...b, qrUrl } : b))
      }));
    } catch (err) {
      alert('Error al subir la imagen del QR');
    } finally {
      setSubiendoQrId(null);
    }
  };

  const handleSubirQrNueva = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSubiendoQrId('nueva');
    try {
      const qrUrl = await subirImagenQr(file);
      setNuevaBilletera(prev => ({ ...prev, qrUrl }));
    } catch (err) {
      alert('Error al subir la imagen del QR');
    } finally {
      setSubiendoQrId(null);
    }
  };

  const handleAgregarBilletera = () => {
    if (!nuevaBilletera.nombre || !nuevaBilletera.numero || !nuevaBilletera.titular) {
      alert('Por favor completa nombre, número y titular de la billetera');
      return;
    }

    const nueva: BilleteraDigital = {
      id: `billetera-${Date.now()}`,
      nombre: nuevaBilletera.nombre,
      tipo: nuevaBilletera.tipo || 'YAPE',
      numero: nuevaBilletera.numero,
      titular: nuevaBilletera.titular,
      qrUrl: nuevaBilletera.qrUrl,
      instrucciones: nuevaBilletera.instrucciones || '',
      activo: true,
    };

    setForm(prev => ({
      ...prev,
      billeteras: [...prev.billeteras, nueva]
    }));

    setNuevaBilletera({
      nombre: '',
      tipo: 'YAPE',
      numero: '',
      titular: '',
      instrucciones: '',
      activo: true,
    });
    setMostrarModalNuevaBilletera(false);
  };

  const handleEliminarBilletera = (id: string) => {
    if (!window.confirm('¿Deseas eliminar este método de pago?')) return;
    setForm(prev => ({
      ...prev,
      billeteras: prev.billeteras.filter(b => b.id !== id)
    }));
  };

  const handleToggleBilletera = (id: string) => {
    setForm(prev => ({
      ...prev,
      billeteras: prev.billeteras.map(b => b.id === id ? { ...b, activo: !b.activo } : b)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setMensajeExito(false);
    try {
      const res = await actualizarConfiguracion(form);
      onConfigActualizada(res);
      setMensajeExito(true);
      setTimeout(() => setMensajeExito(false), 3000);
    } catch (err) {
      alert('Error al guardar configuración');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Configuración de la Plataforma
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Personaliza billeteras de pago dinámicas con códigos QR, datos de la marca y enlaces oficiales.
          </p>
        </div>

        {mensajeExito && (
          <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>¡Configuración guardada con éxito!</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Billeteras Digitales Dinámicas */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-purple-600" />
                <span>Billeteras Digitales y Métodos de Pago Dinámicos</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Agrega, edita o quita billeteras (Yape, Plin, BCP, BBVA, etc.) y sube la imagen de su código QR.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setMostrarModalNuevaBilletera(true)}
              className="bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-xs px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Billetera / QR</span>
            </button>
          </div>

          {/* Grid de Billeteras Existentes */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {form.billeteras.map(b => (
              <div
                key={b.id}
                className={`p-5 rounded-2xl border transition flex flex-col justify-between ${
                  b.activo ? 'border-slate-200 bg-slate-50/60 shadow-sm' : 'border-slate-200 bg-slate-100/50 opacity-60'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-black text-xs text-purple-900 uppercase px-2.5 py-0.5 bg-purple-100 rounded-md">
                      {b.tipo}
                    </span>
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] font-bold text-slate-500 flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={b.activo}
                          onChange={() => handleToggleBilletera(b.id)}
                          className="rounded text-purple-600"
                        />
                        <span>{b.activo ? 'Activa' : 'Pausada'}</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setBilleteraEnEdicion({ ...b })}
                        className="text-slate-400 hover:text-purple-600 transition p-1"
                        title="Modificar billetera"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEliminarBilletera(b.id)}
                        className="text-slate-400 hover:text-rose-600 transition p-1"
                        title="Eliminar billetera"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h4 className="font-extrabold text-sm text-slate-900">{b.nombre}</h4>

                  <div className="mt-2 space-y-1 text-xs text-slate-600">
                    <p>Número / Cuenta: <strong className="font-mono text-purple-700">{b.numero}</strong></p>
                    <p>Titular: <strong>{b.titular}</strong></p>
                    {b.instrucciones && <p className="text-[11px] text-slate-500 italic">{b.instrucciones}</p>}
                  </div>
                </div>

                {/* Código QR y Subida */}
                <div className="mt-4 pt-4 border-t border-slate-200/60 flex items-center gap-3">
                  <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center overflow-hidden shrink-0">
                    {b.qrUrl ? (
                      <img src={b.qrUrl} alt={`QR ${b.nombre}`} className="w-full h-full object-contain" />
                    ) : (
                      <QrCode className="w-7 h-7 text-slate-300" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <label className="relative cursor-pointer bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition">
                      {subiendoQrId === b.id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                      ) : (
                        <Upload className="w-3.5 h-3.5 text-purple-600" />
                      )}
                      <span>{b.qrUrl ? 'Cambiar QR' : 'Subir QR'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => handleSubirQr(b.id, e)}
                        className="hidden"
                      />
                    </label>
                    <span className="block text-[10px] text-slate-400 mt-1">JPG, PNG o WEBP</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Datos del Negocio e Identidad */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-600" />
                <span>Identidad de la Marca y Logo Oficial</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configura el nombre del negocio y sube el logotipo que se mostrará en las cabeceras.
              </p>
            </div>
          </div>

          {/* Subir Logo Oficial */}
          <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-100 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white border border-purple-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
              {form.logoUrl ? (
                <img src={form.logoUrl} alt="Logo Oficial" className="w-full h-full object-contain p-1" />
              ) : (
                <span className="text-3xl">🍀</span>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <span className="text-xs font-bold text-slate-900 block">Logo Oficial de la Empresa</span>
              <span className="text-[11px] text-slate-500 block mt-0.5">
                Se mostrará en la barra de navegación del cliente y en el panel de administración.
              </span>
            </div>
            <label className="cursor-pointer bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2 transition shrink-0">
              {subiendoLogo ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Upload className="w-4 h-4" />
              )}
              <span>{form.logoUrl ? 'Cambiar Logo' : 'Subir Imagen de Logo'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleSubirLogo}
                className="hidden"
              />
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Nombre Comercial:</label>
              <input
                type="text"
                required
                value={form.nombreNegocio}
                onChange={e => setForm({ ...form, nombreNegocio: e.target.value })}
                className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Slogan / Frase:</label>
              <input
                type="text"
                value={form.slogan}
                onChange={e => setForm({ ...form, slogan: e.target.value })}
                className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 outline-none focus:border-purple-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-600 block mb-1">
                Texto en la Pestaña del Navegador (Title de la Web):
              </label>
              <input
                type="text"
                placeholder="Ej. Sorteos El Trébol — Gana Autos, Motos y Dinero en Efectivo"
                value={form.tituloPestana || ''}
                onChange={e => setForm({ ...form, tituloPestana: e.target.value })}
                className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 outline-none focus:border-purple-500"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Este título se refleja dinámicamente en la pestaña de todos los usuarios clientes.
              </p>
            </div>
          </div>
        </div>

        {/* Datos Legales de la Empresa (Términos, Privacidad, Libro de Reclamaciones) */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <Globe className="w-5 h-5 text-purple-600" />
            <span>Datos Legales de la Empresa (Términos, Privacidad y Libro de Reclamaciones)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">RUC:</label>
              <input
                type="text"
                placeholder="Ej. 20609876543"
                value={form.ruc || ''}
                onChange={e => setForm({ ...form, ruc: e.target.value })}
                className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Razón Social:</label>
              <input
                type="text"
                placeholder="Ej. SORTEOS EL TREBOL S.A.C."
                value={form.razonSocial || ''}
                onChange={e => setForm({ ...form, razonSocial: e.target.value })}
                className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 outline-none focus:border-purple-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-slate-600 block mb-1">Domicilio Fiscal / Dirección Legal:</label>
              <input
                type="text"
                placeholder="Ej. Av. Las Palmeras 1234, San Isidro, Lima, Perú"
                value={form.direccionLegal || ''}
                onChange={e => setForm({ ...form, direccionLegal: e.target.value })}
                className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Email Legal / Notificaciones:</label>
              <input
                type="email"
                placeholder="Ej. contacto@sorteoseltrebol.com"
                value={form.emailLegal || ''}
                onChange={e => setForm({ ...form, emailLegal: e.target.value })}
                className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 outline-none focus:border-purple-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Teléfono Legal:</label>
              <input
                type="text"
                placeholder="Ej. +51 987 654 321"
                value={form.telefonoLegal || ''}
                onChange={e => setForm({ ...form, telefonoLegal: e.target.value })}
                className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Configuración de Transmisiones en Vivo */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Globe className="w-5 h-5 text-purple-600" />
                <span>Sección "Nuestras Transmisiones en Vivo" (Página Web)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Controla la visibilidad y los enlaces de las tarjetas en la página web del cliente.
              </p>
            </div>
            <label className="flex items-center gap-2 text-xs font-bold cursor-pointer bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200">
              <input
                type="checkbox"
                checked={form.transmisionesActiva !== false}
                onChange={e => setForm({ ...form, transmisionesActiva: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded"
              />
              <span>Mostrar Sección Completa</span>
            </label>
          </div>

          <div className="space-y-4">
            {/* Card Facebook */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1877F2]" />
                  Tarjeta de Facebook Live
                </span>
                <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.transmisionFacebookActivo !== false}
                    onChange={e => setForm({ ...form, transmisionFacebookActivo: e.target.checked })}
                    className="w-3.5 h-3.5 text-purple-600 rounded"
                  />
                  <span>Habilitar Card</span>
                </label>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Enlace de Facebook Live:</label>
                <input
                  type="text"
                  placeholder="https://facebook.com/..."
                  value={form.transmisionFacebookUrl || ''}
                  onChange={e => setForm({ ...form, transmisionFacebookUrl: e.target.value })}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none bg-white"
                />
              </div>
            </div>

            {/* Card YouTube (Debajo de Facebook) */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FF0000]" />
                  Tarjeta de YouTube Transmisión
                </span>
                <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(form.transmisionYoutubeActivo)}
                    onChange={e => setForm({ ...form, transmisionYoutubeActivo: e.target.checked })}
                    className="w-3.5 h-3.5 text-red-600 rounded"
                  />
                  <span>Habilitar Card</span>
                </label>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Enlace del Canal o Live de YouTube:</label>
                <input
                  type="text"
                  placeholder="https://youtube.com/@sorteoseltrebol/live"
                  value={form.transmisionYoutubeUrl || ''}
                  onChange={e => setForm({ ...form, transmisionYoutubeUrl: e.target.value })}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none bg-white focus:border-red-500"
                />
              </div>
            </div>

            {/* Card WhatsApp */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#25D366]" />
                  Tarjeta de WhatsApp Comunidad
                </span>
                <label className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.transmisionWhatsappActivo !== false}
                    onChange={e => setForm({ ...form, transmisionWhatsappActivo: e.target.checked })}
                    className="w-3.5 h-3.5 text-purple-600 rounded"
                  />
                  <span>Habilitar Card</span>
                </label>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-500 block mb-1">Enlace de Grupo o Chat de WhatsApp:</label>
                <input
                  type="text"
                  placeholder="https://chat.whatsapp.com/..."
                  value={form.transmisionWhatsappUrl || ''}
                  onChange={e => setForm({ ...form, transmisionWhatsappUrl: e.target.value })}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none bg-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contacto y Enlaces */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-purple-600" />
            <span>Contacto General y Redes Sociales</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">WhatsApp de Atención al Cliente:</label>
              <input
                type="text"
                value={form.whatsappNumero}
                onChange={e => setForm({ ...form, whatsappNumero: e.target.value })}
                className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1">Enlace Perfil de Facebook:</label>
              <input
                type="text"
                value={form.facebookUrl}
                onChange={e => setForm({ ...form, facebookUrl: e.target.value })}
                className="w-full text-xs font-semibold p-3 rounded-xl border border-slate-200 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Botón Guardar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={guardando}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-8 py-3.5 rounded-2xl shadow-lg shadow-purple-600/30 transition flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{guardando ? 'Guardando...' : 'Guardar y Publicar Configuración'}</span>
          </button>
        </div>
      </form>

      {/* Modal para Agregar Nueva Billetera */}
      {mostrarModalNuevaBilletera && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-black text-slate-900 text-lg">Agregar Billetera Digital o Cuenta</h3>
            <p className="text-xs text-slate-500">
              Registra un nuevo canal de pago y opcionalmente adjunta su código QR.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Tipo de Método:</label>
                <select
                  value={nuevaBilletera.tipo}
                  onChange={e => setNuevaBilletera({ ...nuevaBilletera, tipo: e.target.value })}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none"
                >
                  <option value="YAPE">Yape</option>
                  <option value="PLIN">Plin</option>
                  <option value="BANCO">Transferencia Bancaria (BCP, BBVA, Interbank)</option>
                  <option value="OTRO">Otro Método</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Nombre Descriptivo:</label>
                <input
                  type="text"
                  placeholder="Ej. Yape Principal, BCP Cuenta Corriente"
                  value={nuevaBilletera.nombre}
                  onChange={e => setNuevaBilletera({ ...nuevaBilletera, nombre: e.target.value })}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Número de Teléfono o Cuenta:</label>
                <input
                  type="text"
                  placeholder="Ej. 987 654 321 o 191-12345678-0-12"
                  value={nuevaBilletera.numero}
                  onChange={e => setNuevaBilletera({ ...nuevaBilletera, numero: e.target.value })}
                  className="w-full text-xs font-mono font-bold p-2.5 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Nombre Completo del Titular:</label>
                <input
                  type="text"
                  placeholder="Ej. Juan Pérez"
                  value={nuevaBilletera.titular}
                  onChange={e => setNuevaBilletera({ ...nuevaBilletera, titular: e.target.value })}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              {/* Subir imagen QR */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Subir Código QR:</label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition">
                    <Upload className="w-3.5 h-3.5 text-purple-600" />
                    <span>Seleccionar Imagen QR</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSubirQrNueva}
                      className="hidden"
                    />
                  </label>
                  {nuevaBilletera.qrUrl && (
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" /> QR Cargado
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="button"
                onClick={() => setMostrarModalNuevaBilletera(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleAgregarBilletera}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm"
              >
                Agregar Billetera
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MODIFICAR BILLETERA EXISTENTE */}
      {billeteraEnEdicion && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-black text-slate-900">
              Modificar Billetera / Método de Pago
            </h3>
            <p className="text-xs text-slate-500">
              Actualiza los datos del método de pago, número, titular o sustituye el código QR.
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Tipo de Método:</label>
                <select
                  value={billeteraEnEdicion.tipo}
                  onChange={e => setBilleteraEnEdicion({ ...billeteraEnEdicion, tipo: e.target.value as any })}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none"
                >
                  <option value="YAPE">Yape</option>
                  <option value="PLIN">Plin</option>
                  <option value="BANCO">Transferencia Bancaria (BCP, BBVA, Interbank)</option>
                  <option value="OTRO">Otro Método</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Nombre Descriptivo:</label>
                <input
                  type="text"
                  placeholder="Ej. Yape Principal, BCP Cuenta Corriente"
                  value={billeteraEnEdicion.nombre}
                  onChange={e => setBilleteraEnEdicion({ ...billeteraEnEdicion, nombre: e.target.value })}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Número de Teléfono o Cuenta:</label>
                <input
                  type="text"
                  placeholder="Ej. 987 654 321 o 191-12345678-0-12"
                  value={billeteraEnEdicion.numero}
                  onChange={e => setBilleteraEnEdicion({ ...billeteraEnEdicion, numero: e.target.value })}
                  className="w-full text-xs font-mono font-bold p-2.5 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Nombre Completo del Titular:</label>
                <input
                  type="text"
                  placeholder="Ej. Juan Pérez"
                  value={billeteraEnEdicion.titular}
                  onChange={e => setBilleteraEnEdicion({ ...billeteraEnEdicion, titular: e.target.value })}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Instrucciones Adicionales (Opcional):</label>
                <input
                  type="text"
                  placeholder="Ej. Enviar comprobante al WhatsApp luego de transferir"
                  value={billeteraEnEdicion.instrucciones || ''}
                  onChange={e => setBilleteraEnEdicion({ ...billeteraEnEdicion, instrucciones: e.target.value })}
                  className="w-full text-xs font-semibold p-2.5 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              {/* Subir imagen QR */}
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">Código QR:</label>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-1.5 transition">
                    {subiendoQrId === 'edicion' ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-600" />
                    ) : (
                      <Upload className="w-3.5 h-3.5 text-purple-600" />
                    )}
                    <span>{billeteraEnEdicion.qrUrl ? 'Reemplazar QR' : 'Subir QR'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSubirQrEdicion}
                      className="hidden"
                    />
                  </label>
                  {billeteraEnEdicion.qrUrl && (
                    <div className="flex items-center gap-2">
                      <img src={billeteraEnEdicion.qrUrl} alt="QR" className="w-8 h-8 rounded-lg object-contain border" />
                      <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> QR Listo
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-3">
              <button
                type="button"
                onClick={() => setBilleteraEnEdicion(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleGuardarEdicionBilletera}
                className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm cursor-pointer"
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

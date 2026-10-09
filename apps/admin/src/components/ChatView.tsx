import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, User, Search, Shield, CheckCheck, Clock } from 'lucide-react';
import { Conversacion, MensajeChat } from '@sorteos/shared';
import { adminSocket } from '../services/socket';
import { getConversaciones, getHistorialChat } from '../services/api';

export const ChatView: React.FC = () => {
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [conversacionActiva, setConversacionActiva] = useState<Conversacion | null>(null);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await getConversaciones();
        setConversaciones(data);
        if (data.length > 0 && !conversacionActiva) {
          setConversacionActiva(data[0]);
        }
      } catch (err) {
        console.error('Error al cargar conversaciones:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Escuchar notificaciones y nuevos mensajes entrantes
  useEffect(() => {
    const handleNuevoMensaje = (msg: MensajeChat) => {
      setConversaciones(prev => {
        return prev.map(c => {
          if (c.id === msg.conversacionId) {
            // Evitar duplicar si ya existe el mensaje con el mismo id
            const yaExiste = c.mensajes.some(m => m.id === msg.id);
            return {
              ...c,
              ultimoMensaje: msg.mensaje,
              updatedAt: msg.timestamp,
              mensajes: yaExiste ? c.mensajes : [...c.mensajes, msg],
            };
          }
          return c;
        });
      });

      setConversacionActiva(prev => {
        if (!prev || prev.id !== msg.conversacionId) return prev;
        if (prev.mensajes.some(m => m.id === msg.id)) return prev;
        return { ...prev, mensajes: [...prev.mensajes, msg] };
      });
    };

    adminSocket.on('mensaje_recibido', handleNuevoMensaje);
    adminSocket.on('notificacion_admin_chat', () => {
      // Si la conversación no existe en la lista, recargar
      getConversaciones().then(setConversaciones);
    });

    return () => {
      adminSocket.off('mensaje_recibido', handleNuevoMensaje);
      adminSocket.off('notificacion_admin_chat');
    };
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversacionActiva?.mensajes]);

  const seleccionarConversacion = async (c: Conversacion) => {
    try {
      const data = await getHistorialChat(c.id);
      setConversacionActiva(data);
      adminSocket.emit('unirse_chat', c.id);
    } catch (err) {
      setConversacionActiva(c);
    }
  };

  const handleEnviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || !conversacionActiva) return;

    adminSocket.emit('enviar_mensaje', {
      conversacionId: conversacionActiva.id,
      dni: conversacionActiva.clienteDni,
      nombre: 'Administrador Oficial',
      remitente: 'ADMIN',
      mensaje: nuevoMensaje.trim(),
    });

    setNuevoMensaje('');
  };

  const conversacionesFiltradas = conversaciones.filter(c =>
    c.clienteNombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
    c.clienteDni?.includes(busqueda)
  );

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden h-[750px] flex animate-in fade-in duration-200">
      {/* Panel Izquierdo: Lista de Chats */}
      <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50/50">
        <div className="p-4 border-b border-slate-200 space-y-3">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-purple-600" />
            <span>Bandeja de Clientes</span>
          </h3>
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200 text-xs">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por DNI o Nombre..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="bg-transparent outline-none w-full font-medium"
            />
          </div>
        </div>

        {/* Lista scrollable */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {conversacionesFiltradas.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No hay conversaciones registradas aún.
            </div>
          ) : (
            conversacionesFiltradas.map(c => {
              const activa = conversacionActiva?.id === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => seleccionarConversacion(c)}
                  className={`w-full p-4 text-left flex items-start gap-3 transition ${
                    activa ? 'bg-purple-100/70 border-l-4 border-purple-600' : 'hover:bg-slate-100/60'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                    {c.clienteNombre?.charAt(0) || 'C'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {c.clienteNombre || 'Cliente'}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(c.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-purple-700 block">
                      DNI: {c.clienteDni}
                    </span>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {c.ultimoMensaje || 'Sin mensajes recientes'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Panel Derecho: Chat Activo */}
      <div className="flex-1 flex flex-col bg-slate-50">
        {conversacionActiva ? (
          <>
            {/* Header Conversación Activa */}
            <div className="p-4 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">
                  {conversacionActiva.clienteNombre?.charAt(0) || 'C'}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                    {conversacionActiva.clienteNombre}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                    <span>DNI: {conversacionActiva.clienteDni}</span>
                    {conversacionActiva.clienteCelular && (
                      <span>• Cel: {conversacionActiva.clienteCelular}</span>
                    )}
                  </div>
                </div>
              </div>

              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                ● En vivo
              </span>
            </div>

            {/* Mensajes */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {conversacionActiva.mensajes?.map((m, idx) => {
                const esAdmin = m.remitente === 'ADMIN';
                return (
                  <div
                    key={m.id || idx}
                    className={`flex ${esAdmin ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-3.5 rounded-2xl shadow-sm text-xs ${
                        esAdmin
                          ? 'bg-purple-600 text-white rounded-br-none'
                          : 'bg-white text-slate-800 rounded-bl-none border border-slate-200'
                      }`}
                    >
                      <p className="leading-relaxed">{m.mensaje}</p>
                      <div
                        className={`flex items-center justify-end gap-1 text-[9px] mt-1 ${
                          esAdmin ? 'text-purple-200' : 'text-slate-400'
                        }`}
                      >
                        <span>
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {esAdmin && <CheckCheck className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            {/* Input de respuesta */}
            <form onSubmit={handleEnviar} className="p-4 bg-white border-t border-slate-200 flex items-center gap-3">
              <input
                type="text"
                placeholder="Escribe tu respuesta al cliente en tiempo real..."
                value={nuevoMensaje}
                onChange={e => setNuevoMensaje(e.target.value)}
                className="flex-1 text-xs font-medium px-4 py-3 bg-slate-50 rounded-2xl border border-slate-200 outline-none focus:border-purple-500 focus:bg-white transition"
              />
              <button
                type="submit"
                disabled={!nuevoMensaje.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 disabled:text-slate-400 text-white px-5 py-3 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-sm transition"
              >
                <span>Enviar</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <MessageCircle className="w-16 h-16 text-slate-300 mb-3" />
            <h4 className="font-bold text-slate-700 text-base">Selecciona un chat</h4>
            <p className="text-xs text-slate-500 mt-1">
              Podrás resolver dudas de comprobantes y pagos directamente con el cliente.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

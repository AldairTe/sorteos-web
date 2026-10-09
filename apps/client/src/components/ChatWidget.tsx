import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Shield, Loader2 } from 'lucide-react';
import { MensajeChat } from '@sorteos/shared';
import { socket } from '../services/socket';
import { getHistorialChat } from '../services/api';

interface Props {
  isOpen: boolean;
  onToggle: () => void;
  clienteDniPrefill?: string;
}

export const ChatWidget: React.FC<Props> = ({ isOpen, onToggle, clienteDniPrefill }) => {
  const [dni, setDni] = useState(clienteDniPrefill || '');
  const [nombre, setNombre] = useState('');
  const [estaIdentificado, setEstaIdentificado] = useState(false);
  const [mensajes, setMensajes] = useState<MensajeChat[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [noLeidos, setNoLeidos] = useState(0);

  const mensajesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (clienteDniPrefill) {
      setDni(clienteDniPrefill);
    }
  }, [clienteDniPrefill]);

  // Cargar historial si ya está identificado
  const identificarCliente = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!dni.trim() || !nombre.trim()) return;

    setLoading(true);
    try {
      socket.emit('unirse_cliente', dni.trim());
      const data = await getHistorialChat(dni.trim());
      if (data && data.mensajes) {
        setMensajes(data.mensajes);
      }
      setEstaIdentificado(true);
    } catch (err) {
      console.error('Error al cargar chat:', err);
      setEstaIdentificado(true); // permitir chatear de todos modos
    } finally {
      setLoading(false);
    }
  };

  // Escuchar nuevos mensajes en tiempo real
  useEffect(() => {
    const handleMensaje = (msg: MensajeChat) => {
      setMensajes(prev => {
        // Evitar duplicados por id
        if (prev.some(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      if (!isOpen && msg.remitente === 'ADMIN') {
        setNoLeidos(n => n + 1);
      }
    };

    socket.on('mensaje_recibido', handleMensaje);
    return () => {
      socket.off('mensaje_recibido', handleMensaje);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setNoLeidos(0);
      mensajesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, mensajes]);

  const handleEnviar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || !dni.trim()) return;

    const texto = nuevoMensaje.trim();
    setNuevoMensaje('');

    socket.emit('enviar_mensaje', {
      dni: dni.trim(),
      nombre: nombre.trim() || 'Cliente',
      remitente: 'CLIENTE',
      mensaje: texto,
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Botón flotante */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="relative group bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all cursor-pointer"
        >
          <MessageCircle className="w-7 h-7" />
          {noLeidos > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
              {noLeidos}
            </span>
          )}
          <span className="absolute right-16 bg-slate-900 dark:bg-purple-950 text-white text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none shadow-md border border-white/10">
            ¿Dudas con tu pago? ¡Escríbenos!
          </span>
        </button>
      )}

      {/* Ventana de Chat con soporte completo Dark Mode */}
      {isOpen && (
        <div className="bg-white dark:bg-[#130d24] text-slate-900 dark:text-purple-100 rounded-3xl w-[360px] sm:w-[400px] h-[520px] shadow-2xl border border-purple-200 dark:border-purple-800/80 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 p-4 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                🍀
              </div>
              <div>
                <h4 className="font-extrabold text-sm leading-tight">Soporte en Vivo</h4>
                <div className="flex items-center gap-1.5 text-[11px] text-purple-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Equipo en línea</span>
                </div>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cuerpo del Chat */}
          {!estaIdentificado ? (
            <form onSubmit={identificarCliente} className="p-6 flex-1 flex flex-col justify-center space-y-4 bg-white dark:bg-[#130d24]">
              <div className="text-center space-y-1">
                <Shield className="w-10 h-10 text-purple-600 dark:text-purple-400 mx-auto" />
                <h5 className="font-black text-slate-900 dark:text-white text-base">Inicia una conversación</h5>
                <p className="text-xs text-slate-500 dark:text-purple-300/80">
                  Ingresa tu DNI para vincular tu chat con tus tickets comprados.
                </p>
              </div>

              <div>
                <input
                  type="text"
                  required
                  placeholder="Tu número de DNI"
                  value={dni}
                  onChange={e => setDni(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-800/80 bg-slate-50 dark:bg-[#1c1335] text-slate-900 dark:text-white focus:border-purple-500 outline-none"
                />
              </div>

              <div>
                <input
                  type="text"
                  required
                  placeholder="Tu Nombre Completo"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-purple-800/80 bg-slate-50 dark:bg-[#1c1335] text-slate-900 dark:text-white focus:border-purple-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !dni.trim() || !nombre.trim()}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 dark:disabled:bg-purple-950 text-white font-bold py-3 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Comenzar Chat</span>}
              </button>
            </form>
          ) : (
            <>
              {/* Lista de Mensajes */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-purple-50/40 dark:bg-[#0c0817] text-xs">
                {/* Mensaje de bienvenida del bot */}
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    🍀
                  </div>
                  <div className="bg-white dark:bg-[#1a1233] p-3 rounded-2xl rounded-tl-sm border border-purple-200 dark:border-purple-800/60 shadow-xs text-slate-700 dark:text-purple-100 max-w-[80%]">
                    ¡Hola {nombre || 'amigo/a'}! ¿Tienes alguna consulta sobre tu pago de Yape/Plin o tus números de ticket? Te atendemos al instante.
                  </div>
                </div>

                {mensajes.map((m, idx) => {
                  const esMio = m.remitente === 'CLIENTE';
                  return (
                    <div
                      key={m.id || idx}
                      className={`flex ${esMio ? 'justify-end' : 'justify-start items-start gap-2'}`}
                    >
                      {!esMio && (
                        <div className="w-6 h-6 rounded-full bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          🍀
                        </div>
                      )}
                      <div
                        className={`p-3 rounded-2xl max-w-[80%] shadow-xs ${
                          esMio
                            ? 'bg-purple-600 text-white rounded-br-sm'
                            : 'bg-white dark:bg-[#1a1233] text-slate-800 dark:text-purple-100 rounded-tl-sm border border-purple-200 dark:border-purple-800/60'
                        }`}
                      >
                        <p className="leading-relaxed">{m.mensaje}</p>
                        <span
                          className={`block text-[9px] mt-1 text-right ${
                            esMio ? 'text-purple-200' : 'text-slate-400 dark:text-purple-400/60'
                          }`}
                        >
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
                <div ref={mensajesEndRef} />
              </div>

              {/* Input de Mensaje */}
              <form onSubmit={handleEnviar} className="p-3 bg-white dark:bg-[#130d24] border-t border-purple-100 dark:border-purple-900/40 flex items-center gap-2">
                <input
                  type="text"
                  value={nuevoMensaje}
                  onChange={e => setNuevoMensaje(e.target.value)}
                  placeholder="Escribe tu mensaje aquí..."
                  className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 dark:bg-[#1c1335] text-slate-900 dark:text-white rounded-xl border border-slate-200 dark:border-purple-800/70 focus:border-purple-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={!nuevoMensaje.trim()}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-slate-200 dark:disabled:bg-purple-950 disabled:text-slate-400 text-white p-2.5 rounded-xl transition shadow-sm cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, User, Shield, Loader2 } from 'lucide-react';
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
          className="relative group bg-gradient-to-r from-pastel-600 to-pastel-500 hover:from-pastel-700 hover:to-pastel-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-pastel-lg hover:scale-110 active:scale-95 transition-all"
        >
          <MessageCircle className="w-7 h-7" />
          {noLeidos > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white animate-bounce">
              {noLeidos}
            </span>
          )}
          <span className="absolute right-16 bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none shadow-md">
            ¿Dudas con tu pago? ¡Escríbenos!
          </span>
        </button>
      )}

      {/* Ventana de Chat */}
      {isOpen && (
        <div className="bg-white rounded-3xl w-[360px] sm:w-[400px] h-[520px] shadow-2xl border border-pastel-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-pastel-600 to-pastel-500 p-4 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center font-bold text-lg">
                🍀
              </div>
              <div>
                <h4 className="font-extrabold text-sm leading-tight">Soporte en Vivo</h4>
                <div className="flex items-center gap-1.5 text-[11px] text-pastel-100">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Equipo en línea</span>
                </div>
              </div>
            </div>
            <button
              onClick={onToggle}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cuerpo del Chat */}
          {!estaIdentificado ? (
            <form onSubmit={identificarCliente} className="p-6 flex-1 flex flex-col justify-center space-y-4">
              <div className="text-center space-y-1">
                <Shield className="w-10 h-10 text-pastel-600 mx-auto" />
                <h5 className="font-black text-slate-800 text-base">Inicia una conversación</h5>
                <p className="text-xs text-slate-500">
                  Ingresa tu DNI para vincular tu chat con tus tickets comprados.
                </p>
              </div>

              <div>
                <input
                  type="text"
                  required
                  placeholder="Tu número de DNI"
                  value={dni}
                  onChange={e => setDni(e.target.value)}
                  className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-pastel-500 outline-none"
                />
              </div>

              <div>
                <input
                  type="text"
                  required
                  placeholder="Tu Nombre Completo"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  className="w-full text-xs font-semibold px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-pastel-500 outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !dni.trim() || !nombre.trim()}
                className="w-full bg-pastel-600 hover:bg-pastel-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl text-xs transition shadow-pastel flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Comenzar Chat</span>}
              </button>
            </form>
          ) : (
            <>
              {/* Lista de Mensajes */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-pastel-50/40 text-xs">
                {/* Mensaje de bienvenida del bot */}
                <div className="flex items-start gap-2">
                  <div className="w-6 h-6 rounded-full bg-pastel-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    🍀
                  </div>
                  <div className="bg-white p-3 rounded-2xl rounded-tl-sm border border-pastel-200 shadow-sm text-slate-700 max-w-[80%]">
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
                        <div className="w-6 h-6 rounded-full bg-pastel-600 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                          🍀
                        </div>
                      )}
                      <div
                        className={`p-3 rounded-2xl max-w-[80%] shadow-sm ${
                          esMio
                            ? 'bg-pastel-600 text-white rounded-br-sm'
                            : 'bg-white text-slate-800 rounded-tl-sm border border-pastel-200'
                        }`}
                      >
                        <p className="leading-relaxed">{m.mensaje}</p>
                        <span
                          className={`block text-[9px] mt-1 text-right ${
                            esMio ? 'text-pastel-200' : 'text-slate-400'
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
              <form onSubmit={handleEnviar} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
                <input
                  type="text"
                  value={nuevoMensaje}
                  onChange={e => setNuevoMensaje(e.target.value)}
                  placeholder="Escribe tu mensaje aquí..."
                  className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-200 focus:border-pastel-500 outline-none"
                />
                <button
                  type="submit"
                  disabled={!nuevoMensaje.trim()}
                  className="bg-pastel-600 hover:bg-pastel-700 disabled:bg-slate-200 disabled:text-slate-400 text-white p-2.5 rounded-xl transition shadow-sm"
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

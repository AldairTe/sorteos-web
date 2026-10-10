import { Server, Socket } from 'socket.io';
import { db } from '../db';
import { MensajeChat, Compra } from '@sorteos/shared';
import { v4 as uuidv4 } from 'uuid';

let ioInstance: Server | null = null;

export function setupSocketIO(io: Server) {
  ioInstance = io;

  io.on('connection', (socket: Socket) => {
    console.log(`[Socket] Cliente conectado: ${socket.id}`);

    // Cliente se une a su canal personal por DNI
    socket.on('unirse_cliente', (dni: string) => {
      if (dni) {
        const cleanDni = dni.trim();
        socket.join(`cliente_${cleanDni}`);
        console.log(`[Socket] Socket ${socket.id} unido a cliente_${cleanDni}`);
      }
    });

    // Administrador se une al canal de administración
    socket.on('unirse_admin', () => {
      socket.join('room_admin');
      console.log(`[Socket] Administrador conectado: ${socket.id}`);
    });

    // Unirse a una conversación específica
    socket.on('unirse_chat', (conversacionId: string) => {
      socket.join(`chat_${conversacionId}`);
      console.log(`[Socket] Socket ${socket.id} se unió a chat_${conversacionId}`);
    });

    // Envío de mensaje en el chat
    socket.on('enviar_mensaje', (data: {
      conversacionId?: string;
      dni: string;
      nombre: string;
      celular?: string;
      remitente: 'CLIENTE' | 'ADMIN';
      mensaje: string;
    }) => {
      try {
        const { dni, nombre, celular, remitente, mensaje } = data;
        let conversacion = data.conversacionId
          ? db.getConversacionById(data.conversacionId)
          : db.getConversacionByDni(dni);

        if (!conversacion) {
          conversacion = {
            id: uuidv4(),
            clienteDni: dni,
            clienteNombre: nombre,
            clienteCelular: celular || '',
            ultimoMensaje: mensaje,
            ultimaFecha: new Date().toISOString(),
            mensajesNoLeidos: remitente === 'CLIENTE' ? 1 : 0,
            noLeidosAdmin: remitente === 'CLIENTE' ? 1 : 0,
            noLeidosCliente: remitente === 'ADMIN' ? 1 : 0,
            updatedAt: new Date().toISOString(),
            mensajes: []
          };
        } else {
          conversacion.ultimoMensaje = mensaje;
          conversacion.ultimaFecha = new Date().toISOString();
          conversacion.updatedAt = new Date().toISOString();
          if (remitente === 'CLIENTE') {
            conversacion.noLeidosAdmin = (conversacion.noLeidosAdmin || 0) + 1;
            conversacion.mensajesNoLeidos = conversacion.noLeidosAdmin;
          } else {
            conversacion.noLeidosCliente = (conversacion.noLeidosCliente || 0) + 1;
          }
        }

        const nuevoMensaje: MensajeChat = {
          id: uuidv4(),
          conversacionId: conversacion.id,
          remitente,
          autorNombre: nombre,
          mensaje,
          leido: false,
          timestamp: new Date().toISOString()
        };

        conversacion.mensajes.push(nuevoMensaje);
        db.saveConversacion(conversacion);

        // Unir el socket remitente a la sala del chat si aún no lo estaba
        socket.join(`chat_${conversacion.id}`);
        if (remitente === 'CLIENTE') {
          socket.join(`cliente_${dni.trim()}`);
        }

        // Socket.io deduplica automáticamente si un socket está en múltiples salas cuando se pasa un array:
        // Tanto el cliente como el admin en el chat recibirán el mensaje EXACTAMENTE UNA VEZ.
        io.to([`chat_${conversacion.id}`, `cliente_${dni.trim()}`]).emit('mensaje_recibido', nuevoMensaje);

        // Si lo envía el cliente, notificar a los administradores
        if (remitente === 'CLIENTE') {
          io.to('room_admin').emit('notificacion_admin_chat', {
            conversacionId: conversacion.id,
            mensaje: nuevoMensaje,
            clienteNombre: nombre,
            clienteDni: dni
          });
        }
      } catch (err) {
        console.error('[Socket Error]:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`[Socket] Desconectado: ${socket.id}`);
    });
  });
}

/**
 * Notifica en tiempo real a los administradores de una nueva compra / comprobante
 */
export function notificarNuevaCompraAdmin(compra: Compra) {
  if (ioInstance) {
    ioInstance.to('room_admin').emit('nueva_compra_registrada', compra);
    console.log(`[Socket] Notificada nueva compra de ${compra.nombreCompleto} a administradores`);
  }
}

/**
 * Notifica en tiempo real al cliente que su ticket fue verificado (Aprobado o Rechazado)
 */
export function notificarActualizacionTicketCliente(compra: Compra) {
  if (ioInstance) {
    ioInstance.to(`cliente_${compra.dni.trim()}`).emit('ticket_estado_actualizado', compra);
    // También refrescar en admin
    ioInstance.to('room_admin').emit('compra_actualizada', compra);
    console.log(`[Socket] Estado de ticket actualizado a '${compra.estado}' para DNI ${compra.dni}`);
  }
}

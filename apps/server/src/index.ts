import express from 'express';
import http from 'http';
import cors from 'cors';
import path from 'path';
import { Server } from 'socket.io';
import apiRouter from './routes/api';
import { setupSocketIO } from './sockets/chatSocket';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  },
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos de uploads (comprobantes de pago)
const uploadsPath = path.resolve(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Rutas de API
app.use('/api', apiRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Inicializar WebSockets
setupSocketIO(io);

const PORT = process.env.PORT || 4005;
server.listen(PORT, () => {
  console.log(`===============================================`);
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
  console.log(`📡 WebSockets activos para Chat y Notificaciones`);
  console.log(`📁 Directorio de comprobantes: ${uploadsPath}`);
  console.log(`===============================================`);
});

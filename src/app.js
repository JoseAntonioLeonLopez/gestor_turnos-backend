const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const sequelize = require('./config/database');
const turnoRoutes = require('./routes/turnoRoutes');
const turnoSockets = require('./sockets/TurnoSockets');

require('dotenv').config();

const app = express();

// Configuración de CORS para permitir todas las conexiones
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Crear servidor HTTP y configurar Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware para añadir io a cada solicitud
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Rutas para la API de turnos
app.use('/api/turnos', turnoRoutes);

// Configurar sockets para turnos
turnoSockets(io);

const PORT = process.env.PORT || 3000;

// Función para sincronizar la base de datos
const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Base de datos borrada y recreada.');
  } catch (error) {
    console.error('Error al sincronizar la base de datos:', error);
  }
};

// Iniciar el servidor y conectar a la base de datos
server.listen(PORT, async () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  try {
    await sequelize.authenticate();
    console.log('Base de datos conectada.');
    // Sincronizar la base de datos después de la conexión
    await syncDatabase();
  } catch (error) {
    console.error('Error conectando a la base de datos:', error);
  }
});
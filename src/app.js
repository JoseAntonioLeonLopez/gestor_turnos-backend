const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const sequelize = require('./config/database');
const turnoRoutes = require('./routes/turnoRoutes');
const turnoSockets = require('./sockets/TurnoSockets');

require('dotenv').config();

const app = express();

// Configurar CORS para HTTP y WebSockets
const corsOptions = {
  origin: '*',  // Permite todos los orígenes. (Puedes especificar tu dominio aquí)
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions)); // Habilitar CORS en el servidor
app.use(express.json()); // Habilitar el parseo de JSON

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Permitir conexiones de todos los orígenes para WebSockets
    methods: ['GET', 'POST']
  }
});

app.use(express.json());
app.use((req, res, next) => {
  req.io = io;
  next();
});
app.use('/api/turnos', turnoRoutes);

turnoSockets(io);

const PORT = process.env.PORT || 3000;

server.listen(PORT, async () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
  try {
    await sequelize.authenticate();
    console.log('Base de datos conectada.');
    await sequelize.sync({ alter: true });
    console.log('Tablas sincronizadas.');
  } catch (error) {
    console.error('Error conectando a la base de datos:', error);
  }
});

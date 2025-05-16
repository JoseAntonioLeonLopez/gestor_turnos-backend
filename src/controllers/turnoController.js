const Turno = require('../models/Turno');

// Función para generar un código aleatorio para el turno
function generateCode() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  return (
    letters[Math.floor(Math.random() * letters.length)] +
    numbers[Math.floor(Math.random() * numbers.length)] +
    letters[Math.floor(Math.random() * letters.length)] +
    numbers[Math.floor(Math.random() * numbers.length)]
  );
}

module.exports = {
  // Crea un nuevo turno y lo emite por WebSocket
  generarTurno: async (req, res, next) => {
    try {
      const { nombre } = req.body;

      // Validación del nombre
      if (!nombre || typeof nombre !== 'string' || nombre.length < 3 || nombre.length > 35) {
        return res.status(400).json({ error: 'Nombre inválido. Debe tener entre 3 y 35 caracteres y solo contener letras y tildes.' });
      }

      const codigo = generateCode();
      const nuevoTurno = await Turno.create({ codigo, nombre, estado: 'en espera' });

      req.io.emit('nuevoTurno', nuevoTurno);
      res.status(201).json(nuevoTurno);
    } catch (error) {
      next(error);
    }
  },

  // Obtiene todos los turnos en espera
  obtenerTurnosEnEspera: async (req, res, next) => {
    try {
      // Buscar todos los turnos con estado "en espera"
      const turnosEnEspera = await Turno.findAll({ where: { estado: 'en espera' } });
      res.json(turnosEnEspera);
    } catch (error) {
      next(error);
    }
  },

  // Obtiene todos los turnos llamados
  verTurnosLlamados: async (req, res, next) => {
    try {
      // Buscar todos los turnos con estado "llamado"
      const turnosLlamados = await Turno.findAll({ where: { estado: 'llamado' } });
      res.json(turnosLlamados);
    } catch (error) {
      next(error);
    }
  },

  // Avanza el primer turno en espera a "llamado"
  avanzarTurno: async (req, res, next) => {
    try {
      const turno = await Turno.findOne({ where: { estado: 'en espera' } });
      if (!turno) return res.status(404).json({ error: 'No hay turnos en espera' });
  
      // Avanzar el turno a "llamado"
      turno.estado = 'llamado';
      await turno.save();
  
      // Emitir el turno actualizado a todos los clientes conectados
      req.io.emit('nuevoTurno', turno);
  
      // Actualizar la lista de turnos en espera
      const turnosEnEspera = await Turno.findAll({ where: { estado: 'en espera' } });
      req.io.emit('turnosEnEspera', turnosEnEspera);
  
      // Enviar el turno actualizado como respuesta
      res.json(turno);
    } catch (error) {
      next(error);
    }
  },  

  // Cambia el estado del primer turno llamado a "atendiendo"
  atenderTurno: async (req, res, next) => {
    try {
      // Buscar el primer turno "llamado"
      const turno = await Turno.findOne({ where: { estado: 'llamado' } });
      if (!turno) return res.status(404).json({ error: 'No hay turnos llamados' });

      // Cambiar el estado a "atendiendo"
      turno.estado = 'atendiendo';
      await turno.save();

      // Emitir el turno actualizado a todos los clientes conectados
      req.io.emit('nuevoTurno', turno);

      res.json(turno); // Enviar el turno actualizado como respuesta
    } catch (error) {
      next(error);
    }
  },

  // Finaliza y elimina el turno que está siendo atendido
  finalizarTurno: async (req, res, next) => {
    try {
      // Buscar el primer turno con estado "atendiendo"
      const turno = await Turno.findOne({ where: { estado: 'atendiendo' } });
      if (!turno) {
        return res.status(404).json({ error: 'No hay turnos atendiendo' });
      }
  
      // Guardar los datos del turno antes de eliminarlo (opcional, para emitirlo a los clientes)
      const turnoEmitido = { ...turno.get() };
  
      // Eliminar el registro del turno
      await turno.destroy();
  
      // Emitir el turno eliminado a todos los clientes conectados (si es necesario)
      req.io.emit('nuevoTurno', { mensaje: 'Turno finalizado y eliminado', turno: turnoEmitido });
  
      // Enviar una respuesta indicando que el turno fue eliminado
      res.json({ mensaje: 'Turno eliminado correctamente', turno: turnoEmitido });
    } catch (error) {
      next(error);
    }
  },

  // Obtiene el estado del panel
  obtenerEstadoPanel: async (req, res, next) => {
    try {
      const turnoAtendiendo = await Turno.findOne({ where: { estado: 'atendiendo' } });
      if (turnoAtendiendo) {
        return res.json({ estado: 'atendiendo', turnoActual: turnoAtendiendo });
      }

      const turnoLlamado = await Turno.findOne({ where: { estado: 'llamado' } });
      if (turnoLlamado) {
        return res.json({ estado: 'llamado', turnoActual: turnoLlamado });
      }

      const turnoEnEspera = await Turno.findOne({ where: { estado: 'en espera' } });
      if (turnoEnEspera) {
        return res.json({ estado: 'espera', turnoActual: null });
      }

      res.json({ estado: 'sin_turnos', turnoActual: null });
    } catch (error) {
      next(error);
    }
  },

};

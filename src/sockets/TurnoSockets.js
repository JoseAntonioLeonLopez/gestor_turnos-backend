module.exports = function(io) {
  // Manejar la conexión de un nuevo cliente
  io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    // Cuando el cliente solicita los turnos en espera
    socket.on('solicitarTurnosEnEspera', () => {
      // Obtener y enviar los turnos en espera al cliente
      Turno.findAll({ where: { estado: 'en espera' } })
        .then((turnosEnEspera) => {
          socket.emit('turnosEnEspera', turnosEnEspera);
        })
        .catch((error) => {
          console.error('Error al obtener turnos en espera:', error);
        });
    });

    // Enviar los turnos llamados al conectarse un cliente
    socket.emit('turnosLlamados', { message: 'Turnos llamados' });

    // Manejar la actualización de un turno
    socket.on('actualizarTurno', async (turno) => {
      try {
        console.log('Actualizando turno:', turno);
        
        // Actualizar el turno en la base de datos
        await Turno.update({ estado: turno.estado }, { where: { codigo: turno.codigo } });
        
        // Emitir el turno actualizado y la lista de turnos en espera a todos los clientes
        io.emit('nuevoTurno', turno);
        const turnosEnEspera = await Turno.findAll({ where: { estado: 'en espera' } });
        io.emit('turnosEnEspera', turnosEnEspera);
      } catch (error) {
        console.error('Error al actualizar turno:', error);
      }
    });    

    // Manejar el avance de un turno
    socket.on('avanzarTurno', async (turno) => {
      console.log('Avanzando turno:', turno);
      
      // Actualizar el estado del turno a "llamado"
      await Turno.update({ estado: 'llamado' }, { where: { codigo: turno.codigo } });
      
      // Emitir el turno actualizado y la nueva lista de turnos en espera
      io.emit('nuevoTurno', turno);
      const turnosEnEspera = await Turno.findAll({ where: { estado: 'en espera' } });
      io.emit('turnosEnEspera', turnosEnEspera);
    });
    
    // Manejar la finalización de un turno
    socket.on('finalizarTurno', (turno) => {
      console.log('Finalizando turno:', turno);
      io.emit('nuevoTurno', turno);
    });

    // Manejar la desconexión de un cliente
    socket.on('disconnect', () => {
      console.log('Cliente desconectado');
    });
  });
};

module.exports = function(io) {
  io.on('connection', (socket) => {
    console.log('Nuevo cliente conectado');

    socket.on('solicitarTurnosEnEspera', () => {
      // Obtener los turnos en espera de la base de datos y enviarlos al cliente
      Turno.findAll({ where: { estado: 'en espera' } })
        .then((turnosEnEspera) => {
          socket.emit('turnosEnEspera', turnosEnEspera);
        })
        .catch((error) => {
          console.error('Error al obtener turnos en espera:', error);
        });
    });

    // Emitir los turnos "llamados" al conectarse un cliente
    socket.emit('turnosLlamados', { message: 'Turnos llamados' });

    // Escuchar por la actualización de turno y emitir a todos los clientes
    socket.on('actualizarTurno', async (turno) => {
      try {
        console.log('Actualizando turno:', turno);
    
        // Actualizar el turno en la base de datos
        await Turno.update({ estado: turno.estado }, { where: { codigo: turno.codigo } });
    
        // Emitir el turno actualizado a todos los clientes conectados
        io.emit('nuevoTurno', turno);
    
        // Obtener la lista de turnos en espera después de la actualización
        const turnosEnEspera = await Turno.findAll({ where: { estado: 'en espera' } });
    
        // Emitir la lista de turnos en espera actualizada a todos los clientes
        io.emit('turnosEnEspera', turnosEnEspera);  // Actualiza la lista de turnos en espera
    
      } catch (error) {
        console.error('Error al actualizar turno:', error);
      }
    });    

    // Enviar los turnos cuando se avance el estado del turno
    socket.on('avanzarTurno', async (turno) => {
      console.log('Avanzando turno:', turno);
      
      // Avanzar el turno a "llamado" (este paso ya lo haces en el backend)
      const turnoAvanzado = await Turno.update({ estado: 'llamado' }, { where: { codigo: turno.codigo } });
      
      // Emitir el turno actualizado a todos los clientes
      io.emit('nuevoTurno', turno);
      
      // Obtener la lista de turnos en espera después de actualizar
      const turnosEnEspera = await Turno.findAll({ where: { estado: 'en espera' } });
      
      // Emitir la lista de turnos en espera actualizada
      io.emit('turnosEnEspera', turnosEnEspera);
    });
    

    // Escuchar por el evento de finalizar turno
    socket.on('finalizarTurno', (turno) => {
      console.log('Finalizando turno:', turno);
      io.emit('nuevoTurno', turno); // Emitir el turno finalizado a todos los clientes conectados
    });

    // Cuando un cliente se desconecte
    socket.on('disconnect', () => {
      console.log('Cliente desconectado');
    });
  });
};

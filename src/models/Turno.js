const sequelize = require('../config/database');
const { DataTypes } = require('sequelize');

const Turno = sequelize.define('Turno', {
  codigo: {
    type: DataTypes.STRING,
    allowNull: false, // El código no puede ser nulo
    unique: true, // El código debe ser unico
    validate: {
      len: [4, 4],  // El código debe ser exactamente de 4 caracteres
      isAlphanumeric: true, // Solo letras y números
    },
  },
  estado: {
    type: DataTypes.ENUM('en espera', 'llamado', 'atendiendo', 'finalizado'), 
    defaultValue: 'en espera',
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [3, 30],  // Longitud del nombre 
      is: /^[a-zA-Z\s]+$/i, // Permite letras y espacios
    },
  },
});

module.exports = Turno;

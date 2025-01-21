const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Turno = sequelize.define('Turno', {
  codigo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
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
      len: [3, 50],  // Longitud del nombre entre 3 y 50 caracteres
      is: /^[a-zA-Z\s]+$/i, // Permite letras y espacios
    },
  },
});

module.exports = Turno;

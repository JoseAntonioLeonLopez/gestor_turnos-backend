const { Sequelize } = require('sequelize');
require('dotenv').config();

// Creamos una nueva instancia de Sequelize para conectarnos a la base de datos MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    port: process.env.DB_PORT,
  }
);

// Exportamos la instancia de Sequelize para usarla en otros archivos
module.exports = sequelize;

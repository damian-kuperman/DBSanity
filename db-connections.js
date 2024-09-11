require('dotenv').config();
const { Client } = require('pg');

// Conexión a la base de datos `users`
const clientUsers = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE_USERS,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Configuración de conexión para la base de datos `compliance`
const clientCompliance = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE_COMPLIANCE,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Función para conectar ambas bases de datos
async function connectDatabases() {
    try {
      await clientUsers.connect();
      await clientCompliance.connect();
      console.log('Conectado a ambas bases de datos');
    } catch (err) {
      console.error('Error conectando a las bases de datos', err);
    }
  }
  
  // Función para cerrar las conexiones
  async function closeDatabases() {
    try {
      await clientUsers.end();
      await clientCompliance.end();
      console.log('Conexiones cerradas');
    } catch (err) {
      console.error('Error cerrando las conexiones', err);
    }
  }
  
  module.exports = {
    clientUsers,
    clientCompliance,
    connectDatabases,
    closeDatabases,
  };
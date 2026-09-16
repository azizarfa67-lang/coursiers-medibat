// src/config/db.js
// Configuration de la connexion à la base de données MySQL via Sequelize.

const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || '127.0.0.1',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      underscored: true, // colonnes en snake_case (created_at, updated_at, ...)
      timestamps: true,
    },
  }
);

// Vérifie la connexion au démarrage du serveur.
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connexion MySQL établie avec succès.');
  } catch (error) {
    console.error('❌ Impossible de se connecter à la base de données :', error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, testConnection };

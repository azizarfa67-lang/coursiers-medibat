// src/models/index.js
// Centralise l'initialisation des modèles Sequelize et définit les
// associations (relations) entre les tables.

const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Coursier = require('./Coursier')(sequelize, DataTypes);
const Mission = require('./Mission')(sequelize, DataTypes);
const HistoriqueDisponibilite = require('./HistoriqueDisponibilite')(sequelize, DataTypes);
const Admin = require('./Admin')(sequelize, DataTypes);

// --- Associations ---

// Un coursier peut avoir plusieurs missions au fil du temps.
Coursier.hasMany(Mission, { foreignKey: 'coursier_id', as: 'missions' });
Mission.belongsTo(Coursier, { foreignKey: 'coursier_id', as: 'coursier' });

// Un coursier a un historique de changements de statut.
Coursier.hasMany(HistoriqueDisponibilite, { foreignKey: 'coursier_id', as: 'historique' });
HistoriqueDisponibilite.belongsTo(Coursier, { foreignKey: 'coursier_id', as: 'coursier' });

module.exports = {
  sequelize,
  Coursier,
  Mission,
  HistoriqueDisponibilite,
  Admin,
};

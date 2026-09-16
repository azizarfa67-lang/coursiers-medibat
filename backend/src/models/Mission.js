// src/models/Mission.js
// Une mission (course) à assigner à un coursier disponible.

module.exports = (sequelize, DataTypes) => {
  const Mission = sequelize.define('Mission', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    coursier_id: {
      type: DataTypes.INTEGER,
      allowNull: true, // null tant que non assignée
    },
    adresse_depart: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    latitude_depart: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
    },
    longitude_depart: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
    },
    adresse_arrivee: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    latitude_arrivee: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
    },
    longitude_arrivee: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    statut: {
      type: DataTypes.ENUM('en_attente', 'assignee', 'en_cours', 'terminee', 'annulee'),
      allowNull: false,
      defaultValue: 'en_attente',
    },
    priorite: {
      type: DataTypes.ENUM('normale', 'urgente'),
      defaultValue: 'normale',
    },
    assignee_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    terminee_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'missions',
    indexes: [
      { fields: ['statut'] },
      { fields: ['coursier_id'] },
    ],
  });

  return Mission;
};

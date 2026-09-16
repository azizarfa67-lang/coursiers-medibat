// src/models/Admin.js
// Compte administrateur pour le tableau de bord web.

module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define('Admin', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nom: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: { isEmail: true },
    },
    mot_de_passe: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  }, {
    tableName: 'admins',
  });

  return Admin;
};

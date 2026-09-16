// database/init.js
// Script à exécuter une fois après l'installation pour créer le premier
// compte administrateur. Usage : npm run db:init

require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, Admin } = require('../src/models');

async function main() {
  await sequelize.authenticate();
  await sequelize.sync(); // s'assure que les tables existent

  const email = process.env.SEED_ADMIN_EMAIL || 'admin@coursier-app.com';
  const motDePasse = process.env.SEED_ADMIN_PASSWORD || 'admin123';

  const existant = await Admin.findOne({ where: { email } });
  if (existant) {
    console.log(`ℹ️  Un admin existe déjà avec l'email ${email}.`);
    process.exit(0);
  }

  const hash = await bcrypt.hash(motDePasse, 10);
  await Admin.create({ nom: 'Administrateur', email, mot_de_passe: hash });

  console.log('✅ Compte admin créé :');
  console.log(`   Email : ${email}`);
  console.log(`   Mot de passe : ${motDePasse}`);
  console.log('⚠️  Change ce mot de passe dès la première connexion.');
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Erreur lors de la création du compte admin :', err);
  process.exit(1);
});

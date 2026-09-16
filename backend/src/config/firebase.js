// src/config/firebase.js
// Initialise Firebase Admin SDK, utilisé uniquement pour l'envoi de
// notifications push (FCM) aux coursiers. La base de données métier reste MySQL.

const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

let initialized = false;

function initFirebase() {
  if (initialized) return admin;

  try {
    const serviceAccountPath = path.resolve(
      process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-service-account.json'
    );
    const serviceAccount = require(serviceAccountPath);

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    initialized = true;
    console.log('✅ Firebase Admin (FCM) initialisé.');
  } catch (err) {
    console.warn(
      '⚠️  Firebase Admin non initialisé (fichier de clé de service introuvable). ' +
      'Les notifications push seront désactivées jusqu\'à configuration. Détail :',
      err.message
    );
  }

  return admin;
}

module.exports = { initFirebase, admin };

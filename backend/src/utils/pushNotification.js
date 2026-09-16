// src/utils/pushNotification.js
// Envoi de notifications push aux coursiers via Firebase Cloud Messaging.

const { initFirebase } = require('../config/firebase');

/**
 * Envoie une notification push à un coursier donné.
 * @param {string} fcmToken - token FCM du device du coursier
 * @param {string} title
 * @param {string} body
 * @param {object} data - données additionnelles (ex: missionId) transmises à l'app
 */
async function envoyerNotification(fcmToken, title, body, data = {}) {
  if (!fcmToken) return { skipped: true, reason: 'Aucun token FCM enregistré pour ce coursier.' };

  const admin = initFirebase();
  if (!admin.apps.length) {
    console.warn('⚠️  Firebase non configuré : notification non envoyée.');
    return { skipped: true, reason: 'Firebase non configuré.' };
  }

  try {
    const message = {
      token: fcmToken,
      notification: { title, body },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)]) // FCM exige des strings
      ),
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } },
    };
    const response = await admin.messaging().send(message);
    return { success: true, response };
  } catch (err) {
    console.error('❌ Échec envoi notification FCM :', err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { envoyerNotification };

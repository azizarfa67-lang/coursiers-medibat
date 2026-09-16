// src/utils/geo.js
// Calcul de distance entre deux points GPS (formule de Haversine),
// utilisé pour l'attribution automatique de missions au coursier disponible
// le plus proche.

function toRad(deg) {
  return (deg * Math.PI) / 180;
}

/**
 * Distance en kilomètres entre deux points (lat, lng).
 */
function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // rayon de la Terre en km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Parmi une liste de coursiers { id, latitude, longitude, ... },
 * retourne celui qui est le plus proche du point donné.
 */
function trouverPlusProche(coursiers, lat, lon) {
  if (!coursiers.length) return null;
  let meilleur = null;
  let meilleureDistance = Infinity;

  for (const c of coursiers) {
    if (c.latitude === null || c.longitude === null) continue;
    const d = distanceKm(lat, lon, Number(c.latitude), Number(c.longitude));
    if (d < meilleureDistance) {
      meilleureDistance = d;
      meilleur = c;
    }
  }
  return meilleur ? { coursier: meilleur, distanceKm: meilleureDistance } : null;
}

module.exports = { distanceKm, trouverPlusProche };

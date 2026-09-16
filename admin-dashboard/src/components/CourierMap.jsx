// src/components/CourierMap.jsx
// Carte OpenStreetMap (via Leaflet) affichant la position de chaque
// coursier, avec une couleur de marqueur selon son statut.

import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const couleurParStatut = {
  disponible: '#22c55e',
  occupe: '#f97316',
  hors_ligne: '#9ca3af',
};

function creerIcone(statut) {
  const couleur = couleurParStatut[statut] || '#9ca3af';
  return L.divIcon({
    className: 'marqueur-coursier',
    html: `<div style="background:${couleur};width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 4px rgba(0,0,0,0.4)"></div>`,
    iconSize: [18, 18],
  });
}

export default function CourierMap({ coursiers, centre = [36.8065, 10.1815] }) {
  const avecPosition = coursiers.filter((c) => c.latitude && c.longitude);

  return (
    <MapContainer center={centre} zoom={12} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; OpenStreetMap contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {avecPosition.map((c) => (
        <Marker
          key={c.id}
          position={[parseFloat(c.latitude), parseFloat(c.longitude)]}
          icon={creerIcone(c.statut)}
        >
          <Popup>
            <strong>{c.prenom} {c.nom}</strong>
            <br />
            Statut : {c.statut}
            <br />
            Véhicule : {c.vehicule}
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

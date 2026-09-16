// src/components/StatsCards.jsx
// Résumé chiffré : nombre de coursiers par statut.

import React from 'react';

export default function StatsCards({ coursiers }) {
  const total = coursiers.length;
  const disponibles = coursiers.filter((c) => c.statut === 'disponible').length;
  const occupes = coursiers.filter((c) => c.statut === 'occupe').length;
  const horsLigne = coursiers.filter((c) => c.statut === 'hors_ligne').length;

  const cartes = [
    { label: 'Total coursiers', valeur: total, couleur: '#334155' },
    { label: 'Disponibles', valeur: disponibles, couleur: '#22c55e' },
    { label: 'Occupés', valeur: occupes, couleur: '#f97316' },
    { label: 'Hors ligne', valeur: horsLigne, couleur: '#9ca3af' },
  ];

  return (
    <div className="stats-grid">
      {cartes.map((c) => (
        <div className="stat-card" key={c.label} style={{ borderTopColor: c.couleur }}>
          <div className="stat-valeur">{c.valeur}</div>
          <div className="stat-label">{c.label}</div>
        </div>
      ))}
    </div>
  );
}

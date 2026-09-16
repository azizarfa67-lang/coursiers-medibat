// src/components/CourierList.jsx
// Liste tabulaire des coursiers avec leur statut courant et dernière
// mise à jour de position — complète la vue carte.

import React from 'react';

const labelStatut = {
  disponible: 'Disponible',
  occupe: 'Occupé',
  hors_ligne: 'Hors ligne',
};

export default function CourierList({ coursiers }) {
  return (
    <table className="courier-table">
      <thead>
        <tr>
          <th>Nom</th>
          <th>Téléphone</th>
          <th>Véhicule</th>
          <th>Statut</th>
          <th>Dernière position</th>
        </tr>
      </thead>
      <tbody>
        {coursiers.map((c) => (
          <tr key={c.id}>
            <td>{c.prenom} {c.nom}</td>
            <td>{c.telephone}</td>
            <td>{c.vehicule}</td>
            <td>
              <span className={`badge badge-${c.statut}`}>{labelStatut[c.statut]}</span>
            </td>
            <td>
              {c.derniere_position_maj
                ? new Date(c.derniere_position_maj).toLocaleTimeString('fr-FR')
                : '—'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

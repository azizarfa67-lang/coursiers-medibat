// src/pages/Dashboard.jsx
// Page principale : charge la liste des coursiers au montage, puis écoute
// les événements Socket.IO pour mettre à jour statuts/positions en direct
// sans recharger la page.

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCoursiers } from '../services/api';
import { connectAdminSocket, disconnectAdminSocket } from '../services/socket';
import CourierMap from '../components/CourierMap.jsx';
import StatsCards from '../components/StatsCards.jsx';
import CourierList from '../components/CourierList.jsx';

export default function Dashboard() {
  const [coursiers, setCoursiers] = useState([]);
  const [chargement, setChargement] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let actif = true;

    async function charger() {
      try {
        const data = await getCoursiers();
        if (actif) setCoursiers(data);
      } catch (err) {
        if (err?.response?.status === 401 || err?.response?.status === 403) {
          deconnexion();
        }
      } finally {
        if (actif) setChargement(false);
      }
    }
    charger();

    const socket = connectAdminSocket();

    // Mise à jour de statut en temps réel.
    socket?.on('coursier:statut_change', (payload) => {
      setCoursiers((prev) =>
        prev.map((c) => (c.id === payload.coursierId ? { ...c, statut: payload.statut } : c))
      );
    });

    // Mise à jour de position en temps réel.
    socket?.on('coursier:position_update', (payload) => {
      setCoursiers((prev) =>
        prev.map((c) =>
          c.id === payload.coursierId
            ? {
                ...c,
                latitude: payload.latitude,
                longitude: payload.longitude,
                derniere_position_maj: payload.timestamp,
              }
            : c
        )
      );
    });

    return () => {
      actif = false;
      disconnectAdminSocket();
    };
  }, []);

  function deconnexion() {
    localStorage.removeItem('admin_access_token');
    localStorage.removeItem('admin_refresh_token');
    navigate('/login');
  }

  if (chargement) return <div className="loading">Chargement...</div>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>🚴 Suivi des coursiers</h1>
        <button onClick={deconnexion}>Déconnexion</button>
      </header>

      <StatsCards coursiers={coursiers} />

      <div className="dashboard-body">
        <div className="map-panel">
          <CourierMap coursiers={coursiers} />
        </div>
        <div className="list-panel">
          <CourierList coursiers={coursiers} />
        </div>
      </div>
    </div>
  );
}

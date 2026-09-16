// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../services/api';

export default function Login() {
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState(null);
  const [chargement, setChargement] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setChargement(true);
    setErreur(null);
    try {
      const data = await loginAdmin(email, motDePasse);
      localStorage.setItem('admin_access_token', data.accessToken);
      localStorage.setItem('admin_refresh_token', data.refreshToken);
      navigate('/');
    } catch (err) {
      setErreur('Email ou mot de passe incorrect.');
    } finally {
      setChargement(false);
    }
  }

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={handleSubmit}>
        <h1>Tableau de bord — Admin</h1>
        <p className="subtitle">Suivi en temps réel des coursiers</p>

        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

        <label>Mot de passe</label>
        <input
          type="password"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          required
        />

        {erreur && <p className="erreur">{erreur}</p>}

        <button type="submit" disabled={chargement}>
          {chargement ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  );
}

// src/App.jsx
// Route vers l'écran de connexion ou le dashboard selon l'authentification.

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';

function EstAuthentifie() {
  return !!localStorage.getItem('admin_access_token');
}

function RouteProtegee({ children }) {
  return EstAuthentifie() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <RouteProtegee>
              <Dashboard />
            </RouteProtegee>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

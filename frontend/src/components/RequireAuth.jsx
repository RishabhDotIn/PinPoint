import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function RequireAuth({ children }){
  const { me, loading } = useAuth();
  const loc = useLocation();
  if (loading) return null;
  if (!me) return <Navigate to="/register" replace state={{ from: loc.pathname }} />;
  return children;
}

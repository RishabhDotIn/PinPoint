import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import About from './pages/About.jsx';
import Register from './pages/Register.jsx';
import Contact from './pages/Contact.jsx';
import Home from './pages/Home.jsx';
import Profile from './pages/Profile.jsx';
import RequireAuth from './components/RequireAuth.jsx';
import AppHome from './pages/app/Home.jsx';

export default function App(){
  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<div className="aboutus-wrap"><About /></div>} />
          <Route path="/register" element={<Register />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/app/home" element={<RequireAuth><AppHome /></RequireAuth>} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar(){
  const { me } = useAuth();
  return (
    <nav className="navbar sticky-top navbar-expand-lg navbar-dark">
      <a className="navbar-brand grow" href="/">PinPoint</a>
      <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarSupportedContent">
        <ul className="navbar-nav ml-auto">
          <li className="nav-item"><a className="nav-link grow" href="/">Home</a></li>
          <li className="nav-item"><a className="nav-link grow" href="/about">About Us</a></li>
          <li className="nav-item"><a className="nav-link grow" href="/contact">Contact Us</a></li>
          {me ? (
            <li className="nav-item"><a className="nav-link grow" href="/profile"><i className="fas fa-user-circle mr-1"></i> Profile</a></li>
          ) : (
            <li className="nav-item"><a className="nav-link grow" href="/register"><i className="fas fa-user mr-1"></i> Login</a></li>
          )}
        </ul>
      </div>
    </nav>
  );
}

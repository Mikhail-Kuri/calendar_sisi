import React from 'react';
import { Link } from 'react-router-dom';
import './CSS/Navbar.css';

export default function Navbar() {
    return (
        <nav className="navbar">
            <div className="logo">Cicilsignature</div>
            <div className="nav-links">
                <Link to="/">Accueil</Link>
                {/* Tu peux ajouter d'autres liens ici */}
                <Link to="/calendar">Réserver</Link>
            </div>
        </nav>
    );
}

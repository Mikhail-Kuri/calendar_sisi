import React from 'react';
import './CSS/HomePage.css'; // le CSS plus bas
import {useNavigate} from 'react-router-dom';
import {BackgroundBubbles} from "../../../composant/Effects/BackgroundEffects/BackgroundBubbles";
import Navbar from "../../../composant/NAV/Navbar";

export default function HomePage() {
    const navigate = useNavigate();
    return (
        <div className="homepage">
          <Navbar />

            <header className="hero-section">
                <h1>✨ Sublimez votre regard chez Cicilsignature ✨</h1>
                <button onClick={() => navigate("/calendar")} className="btn-reserver">Réserver maintenant</button>
            </header>

            <section className="infos-section">
                <div className="infos-columns">
                    <div className="description">
                        <h2>Cicilsignature</h2>
                        <p>
                            <strong>Cicilsignature</strong> est un salon spécialisé dans la mise en beauté du regard
                            situé au cœur de Montréal.
                            Fondée par <strong>Sirine</strong>, lash tech certifiée, l’entreprise propose des
                            prestations personnalisées
                            en fonction de la forme de vos yeux et de votre style.
                        </p>
                        <p>
                            Grâce à l’utilisation de techniques innovantes et de produits de qualité, chaque prestation
                            assure confort,
                            tenue optimale et valorisation du regard.
                        </p>
                        <p>
                            Offrez-vous une expérience sur mesure et élégante en réservant dès maintenant votre
                            rendez-vous chez Cicilsignature,
                            où l’accueil est chaleureux et professionnel.
                        </p>
                    </div>

                    <div className="infos-side">
                        <div className="horaires">
                            <h3>📅 Horaires d'ouverture</h3>
                            <ul>
                                <li>Lundi : 08:00 - 20:00</li>
                                <li>Mardi : 08:00 - 20:00</li>
                                <li>Mercredi : 08:00 - 20:00</li>
                                <li>Jeudi : 08:00 - 20:00</li>
                                <li>Vendredi : 08:00 - 20:00</li>
                                <li>Samedi : 08:00 - 20:00</li>
                                <li>Dimanche : 08:00 - 20:00</li>
                            </ul>
                        </div>

                        <div className="contact">
                            <h3>📞 Contact</h3>
                            <p>+1 514 443 0575</p>
                            <p>cicilsignature@gmail.com</p>
                            <a href="https://www.instagram.com/cicils_signature/" target="_blank" rel="noreferrer">
                                Instagram : @cicils_signature
                            </a>
                        </div>
                    </div>
                </div>
            </section>
            <BackgroundBubbles />

        </div>
    );
}

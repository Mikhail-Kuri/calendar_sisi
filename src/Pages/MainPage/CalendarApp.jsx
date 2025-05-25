import React, {useEffect, useRef, useState} from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import LoadingScreen from "../../composant/Loading/LoadingScreen";
import {BackgroundBubbles} from "../../composant/Effects/BackgroundEffects/BackgroundBubbles";
import './CSS/CalendarApp.css';
import {formatPhoneNumber, isValidEmail, isValidPhone} from "../../utils/validators";
import {HEURE_TYPE_CILS} from "../../utils/constants";
import EyelashTypeSelector from "../../composant/Pages/EyelashTypeSelector";
import { fetchAppointments } from '../../services/fetcher/fetchAppointments';

function CalendarApp() {
    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [eyelashType, setEyelashType] = useState('');
    const [formData, setFormData] = useState({
        phone: '',
        email: '',
        message: '',
        start: ''
    });
    const calendarRef = useRef();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingVisible, setLoadingVisible] = useState(true);
    const [showLoadingModal, setShowLoadingModal] = useState(false);
    const [loadingSuccess, setLoadingSuccess] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [currentView, setCurrentView] = useState(isMobile ? 'dayGridMonth' : 'timeGridWeek');

// Chargement des événements
    const loadEvents = async () => {
        const events = await fetchAppointments();
        setEvents(events);
    };

// Initialisation : userId + écouteur resize
    useEffect(() => {
        if (!localStorage.getItem("userId")) {
            const id = crypto.randomUUID();
            localStorage.setItem("userId", id);
        }

        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

// Chargement des événements lorsque le type est sélectionné
    useEffect(() => {
        if (eyelashType) {
            setIsLoading(true);
            loadEvents().then(() => {
                setIsLoading(false);
            });
        }
    }, [eyelashType]);

// Sélection de date dans le calendrier
    const handleDateClick = (info) => {
        setFormData(prev => ({ ...prev, start: info.dateStr }));
        setShowModal(true);
    };

// Envoi du formulaire
    const handleSubmit = async () => {
        const { phone, email, message, start } = formData;

        if (!eyelashType || !phone || !email) {
            alert("Veuillez remplir tous les champs obligatoires.");
            return;
        }

        if (!isValidPhone(phone)) {
            alert("Numéro de téléphone invalide. Format attendu : (514) 123-4567");
            return;
        }

        if (!isValidEmail(email)) {
            alert("Adresse email invalide.");
            return;
        }

        if (isSubmitting) return;
        setIsSubmitting(true);
        setShowLoadingModal(true);
        setLoadingSuccess(false);

        try {
            const res = await fetch('http://localhost:5000/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: "En attente du dépôt",
                    description: `Type de lash: ${eyelashType}\nTéléphone : ${phone}\nEmail : ${email}\nMessage : ${message}`,
                    start,
                    end: new Date(new Date(start).getTime() + HEURE_TYPE_CILS[eyelashType] * 60 * 60 * 1000).toISOString(),
                    userId: localStorage.getItem("userId")
                })
            });

            const data = await res.json();
            console.log("Réponse du serveur :", data);

            if (data.success) {
                setShowModal(false);
                setFormData({ phone: '', email: '', message: '', start: '' });

                const userId = localStorage.getItem("userId");
                const stored = localStorage.getItem(userId);
                const existingIds = stored ? JSON.parse(stored) : [];
                const updatedIds = [...existingIds, data.eventId];

                localStorage.setItem(userId, JSON.stringify(updatedIds));
                refreshEvents();

                setLoadingSuccess(true);
                setTimeout(() => {
                    setShowLoadingModal(false);
                }, 2000);
            } else {
                alert("❌ Erreur de création.");
                setShowLoadingModal(false);
            }
        } catch (err) {
            console.error(err);
            alert("Erreur réseau.");
            setShowLoadingModal(false);
        } finally {
            setIsSubmitting(false);
        }
    };

// Sélection du type de cils
    const handleTypeSelect = (type) => {
        setIsLoading(true);
        setEyelashType(type);

        const fetchPromise = loadEvents();
        const delayPromise = new Promise(resolve => setTimeout(resolve, 3000));

        Promise.all([fetchPromise, delayPromise]).then(() => {
            setIsLoading(false);
        });
    };

// Rafraîchir les événements (après ajout par ex.)
    const refreshEvents = () => {
        fetchAppointments().then(fetchedEvents => {
            setEvents(fetchedEvents);
        });
    };


    if (isLoading && loadingVisible) {
        return <LoadingScreen isFadingOut={!loadingVisible}/>;
    }

    // Page de sélection de type de cils
    if (!eyelashType) {
        return  <EyelashTypeSelector onSelect={handleTypeSelect} />
    }

    return (

        <div className={"container"}>
            <h1 className={"title"}>✨ Réserver votre rendez-vous beauté ✨</h1>
            <p className={"subtitle"}>Extensions de cils : <strong>{eyelashType}</strong></p>
            <div className={"calendarWrapper"}>
                <FullCalendar
                    ref={calendarRef}
                    plugins={[timeGridPlugin, interactionPlugin, dayGridPlugin]}
                    initialView={currentView}// ou 'timeGridDay'
                    nowIndicator
                    editable={false}
                    selectable
                    events={events}
                    dateClick={handleDateClick}
                    windowResize={(arg) => {
                        console.log('Window resized', arg);
                    }}
                    aspectRatio={isMobile ? 0.8 : 1.5}
                    headerToolbar={{
                        start: 'prev,next today',
                        center: 'title',
                        end: 'timeGridWeek,timeGridDay'
                    }}
                />
            </div>

            {showModal && (
                <div className={"modalOverlay"}>
                    <div className={"modalContent"}>
                        <h2 className={"modalTitle"}>📌 Informations du rendez-vous</h2>

                        <label>Numéro de téléphone *</label>
                        <input
                            type="text"
                            className={"input"}
                            placeholder="(514) 123-4567"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: formatPhoneNumber(e.target.value)})}
                        />

                        <label>Email *</label>
                        <input
                            type="email"
                            className={"input"}
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />

                        <label>Message (optionnel)</label>
                        <textarea
                            className={"textarea"}
                            value={formData.message}
                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                        />

                        <div className={"modalActions"}>
                            <button
                                style={{
                                    ...styles.button,
                                    ...(formData.phone && formData.email ? {} : styles.buttonDisabled)
                                }}
                                disabled={!formData.phone.trim() || !formData.email.trim()}
                                onClick={handleSubmit}
                            >
                                Réserver
                            </button>
                            <button className={"button"}
                                    onClick={() => setShowModal(false)}>
                                Annuler
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showLoadingModal && (
                <div className="modal-backdrop">
                    <div className="modal-content">
                        {!loadingSuccess ? (
                            <>
                                <div className="spinner"/>
                                <p>Traitement en cours...</p>
                            </>
                        ) : (
                            <>
                                <div className="success-check">&#10004;</div>
                                <p>Réservation réussie !</p>
                            </>
                        )}
                    </div>
                </div>
            )}

            <BackgroundBubbles/>

        </div>
    );
}

const styles = {
    button: {
        padding: '0.7rem 1.2rem',
        backgroundColor: '#b85c9e',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer',
        transition: 'background-color 0.3s ease',
        '&:hover': {
            backgroundColor: '#a64b8b',
        },
    },

    buttonDisabled: {
        backgroundColor: '#ccc',
        cursor: 'not-allowed',
    },
};

export default CalendarApp;
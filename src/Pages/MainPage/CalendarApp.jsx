import React, {useEffect, useRef, useState} from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import dayGridPlugin from '@fullcalendar/daygrid';
import LoadingScreen from "../../composant/Loading/LoadingScreen";
import {BackgroundBubbles} from "../../composant/Effects/BackgroundEffects/BackgroundBubbles";
import './CSS/CalendarApp.css';


function CalendarApp() {
    const [events, setEvents] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [eyelashType, setEyelashType] = useState('');
    const [hoveredType, setHoveredType] = useState(null);
    const [formData, setFormData] = useState({
        phone: '',
        email: '',
        message: '',
        start: ''
    });
    const calendarRef = useRef();
    const isValidEmail = (email) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const isValidPhone = (phone) =>
        /^\(\d{3}\) \d{3}-\d{4}$/.test(phone);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingVisible, setLoadingVisible] = useState(true);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [currentView, setCurrentView] = useState(isMobile ? 'dayGridMonth' : 'timeGridWeek');

    useEffect(() => {
        if (!localStorage.getItem("userId")) {
            const id = crypto.randomUUID();
            localStorage.setItem("userId", id);
        }
    }, []);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    useEffect(() => {
        if (eyelashType) {
            setIsLoading(true);

            const fetchAndDelay = async () => {
                const startTime = Date.now();
                try {
                    const res = await fetch("http://localhost:5000/appointments");
                    const data = await res.json();
                    console.log("Data fetchedaaaaaaaaaaaaaaaaaa:", data);
                    const currentUserId = localStorage.getItem("userId");
                    let myEventIds = JSON.parse(localStorage.getItem(currentUserId) || "[]");

                    // Vérifie si au moins un event.id est dans myEventIds
                    const userStillHasEvent = data.some(event => myEventIds.includes(event.id));

                    // Si aucun de ses events n'existe encore, on régénère un userId
                    if (!userStillHasEvent) {
                        // Supprimer l'ancienne clé
                        localStorage.removeItem(currentUserId);

                        // Générer un nouvel ID (ex: UUID v4 simplifié ici)
                        const newUserId = crypto.randomUUID();

                        // Créer une nouvelle entrée vide
                        localStorage.setItem(newUserId, JSON.stringify([]));
                        localStorage.setItem("userId", newUserId);

                        // Mettre à jour les variables locales
                        myEventIds = [];
                    }

                    // Met à jour l'affichage des événements
                    const processedEvents = data.map(event => {
                        const isMine = myEventIds.includes(event.id);
                        if (isMine) {
                            return {
                                ...event,
                                display: 'auto',
                                color: '#b85c9e'
                            };
                        } else {
                            const startDate = new Date(event.start);
                            const endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000); // +4h
                            return {
                                ...event,
                                display: 'auto',
                                color: '#ff3b3b',
                                title: 'Période indisponible'
                            };
                        }
                    });

                    setEvents(processedEvents);
                } catch (err) {
                    console.error("Erreur de chargement :", err);
                } finally {
                    const elapsed = Date.now() - startTime;
                    const remainingTime = 3000 - elapsed;
                    setTimeout(() => {
                        setIsLoading(false);
                        setTimeout(() => setLoadingVisible(false), 300); // délai pour animation
                    }, Math.max(0, remainingTime));
                }
            };

            fetchAndDelay();
        }
    }, [eyelashType]);


    const handleDateClick = (info) => {
        setFormData(prev => ({...prev, start: info.dateStr}));
        setShowModal(true);
    };

    const formatPhoneNumber = (value) => {
        const digits = value.replace(/\D/g, '').slice(0, 10);
        if (digits.length < 4) return digits;
        if (digits.length < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    };

    const handleSubmit = async () => {
        const {phone, email, message, start} = formData;

        if (!eyelashType || !phone || !email) {
            alert("Veuillez remplir tous les champs obligatoires.");
            return;
        }

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
        try {
            const res = await fetch('http://localhost:5000/appointments', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    title: eyelashType,
                    description: `Téléphone : ${phone}\nEmail : ${email}\nMessage : ${message}`,
                    start,
                    userId: localStorage.getItem("userId")
                })
            });

            const data = await res.json();
            console.log("Réponse du serveur :", data);
            if (data.success) {
                setShowModal(false);
                setFormData({phone: '', email: '', message: '', start: ''});

                const userId = localStorage.getItem("userId");
                const stored = localStorage.getItem(userId);
                const existingIds = stored ? JSON.parse(stored) : [];

                // Ajouter le nouveau eventId à la liste
                const updatedIds = [...existingIds, data.eventId];
                localStorage.setItem(userId, JSON.stringify(updatedIds));

                refreshEvents();
            } else {
                alert("❌ Erreur de création.");
            }
        } catch (err) {
            console.error(err);
            alert("Erreur réseau.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleTypeSelect = (type) => {
        setIsLoading(true);
        setEyelashType(type);

        const fetchPromise = fetch("http://localhost:5000/appointments")
            .then(res => res.json())
            .then(data => {
                console.log("Data fetchedaaaaaaaaaaaaaaaaaa:", data);
                const currentUserId = localStorage.getItem("userId");
                let myEventIds = JSON.parse(localStorage.getItem(currentUserId) || "[]");

                // Vérifie si au moins un event.id est dans myEventIds
                const userStillHasEvent = data.some(event => myEventIds.includes(event.id));

                // Si aucun de ses events n'existe encore, on régénère un userId
                if (!userStillHasEvent) {
                    // Supprimer l'ancienne clé
                    localStorage.removeItem(currentUserId);

                    // Générer un nouvel ID (ex: UUID v4 simplifié ici)
                    const newUserId = crypto.randomUUID();

                    // Créer une nouvelle entrée vide
                    localStorage.setItem(newUserId, JSON.stringify([]));
                    localStorage.setItem("userId", newUserId);

                    // Mettre à jour les variables locales
                    myEventIds = [];
                }

                // Met à jour l'affichage des événements
                const processedEvents = data.map(event => {
                    const isMine = myEventIds.includes(event.id);
                    if (isMine) {
                        return {
                            ...event,
                            display: 'auto',
                            color: '#b85c9e'
                        };
                    } else {
                        return {
                            ...event,
                            display: 'background',
                            backgroundColor: '#ff3b3b',       // 🔴 Rouge très voyant
                            borderColor: '#ff3b3b',
                            color: '#282c34',
                            // title: 'Période indisponible'
                        };
                    }
                });
                setEvents(processedEvents);
            })
            .catch(err => console.error("Erreur de chargement :", err));

        const delayPromise = new Promise(resolve => setTimeout(resolve, 3000));

        Promise.all([fetchPromise, delayPromise]).then(() => {
            setIsLoading(false);
        });
    };


    const refreshEvents = () => {
        fetch("http://localhost:5000/appointments")
            .then(res => res.json())
            .then(data => {
                const currentUserId = localStorage.getItem("userId");
                let myEventIds = JSON.parse(localStorage.getItem(currentUserId) || "[]");

                // Vérifie si au moins un event.id est dans myEventIds
                const userStillHasEvent = data.some(event => myEventIds.includes(event.id));

                // Si aucun de ses events n'existe encore, on régénère un userId
                if (!userStillHasEvent) {
                    // Supprimer l'ancienne clé
                    localStorage.removeItem(currentUserId);

                    // Générer un nouvel ID (ex: UUID v4 simplifié ici)
                    const newUserId = crypto.randomUUID();

                    // Créer une nouvelle entrée vide
                    localStorage.setItem(newUserId, JSON.stringify([]));
                    localStorage.setItem("userId", newUserId);

                    // Mettre à jour les variables locales
                    myEventIds = [];
                }

                // Met à jour l'affichage des événements
                const processedEvents = data.map(event => {
                    const isMine = myEventIds.includes(event.id);
                    if (isMine) {
                        return {
                            ...event,
                            display: 'auto',
                            color: '#b85c9e'
                        };
                    } else {
                        const startDate = new Date(event.start);
                        const endDate = new Date(startDate.getTime() + 4 * 60 * 60 * 1000); // +4h
                        return {
                            ...event,
                            display: 'background',
                            backgroundColor: '#ff3b3b',       // 🔴 Rouge très voyant
                            borderColor: '#ff3b3b',
                            color: '#282c34',
                            // title: 'Période indisponible'
                        };
                    }
                });

                setEvents(processedEvents);
            });
    };

    if (isLoading && loadingVisible) {
        return <LoadingScreen isFadingOut={!loadingVisible}/>;
    }

    // Page de sélection de type de cils
    if (!eyelashType) {
        return (
            <div className={"eyelashSelectWrapper"}>
                <h2 className={"title"}>Choisissez votre type d'extensions de cils</h2>
                <p className={"subtitle"}>Avant de continuer, sélectionnez le type qui vous convient</p>
                <div className={"typeList"}>
                    {[
                        {
                            type: 'Classique',
                            desc: "Un look naturel avec un cil synthétique par cil naturel.",
                            image: '/photos/classic.jpeg'
                        },
                        {
                            type: 'Volume',
                            desc: "Un style plus fourni grâce à plusieurs extensions sur un cil naturel.",
                            image: '/photos/volume.jpeg'
                        },
                        {
                            type: 'Hybride',
                            desc: "Un mélange de classique et volume pour un look équilibré.",
                            image: '/photos/hybrid.jpeg'
                        }
                    ].map(({type, desc, image}) => (
                        <div
                            key={type}
                            onClick={() => handleTypeSelect(type)}
                            onMouseEnter={() => setHoveredType(type)}
                            onMouseLeave={() => setHoveredType(null)}
                            className={"typeCard"}
                        >
                            <img
                                src={image}
                                alt={`${type} extensions`}
                                style={{
                                    width: '100%',
                                    height: '150px',
                                    objectFit: 'cover',
                                    borderRadius: '0.8rem',
                                    marginBottom: '0.8rem'
                                }}
                            />
                            <h3 style={{marginBottom: '0.5rem', color: '#b85c9e'}}>{type}</h3>
                            <p>{desc}</p>
                        </div>
                    ))}


                </div>
            </div>
        );
    }

    return (

        <div className={"container"}>
            <h1 className={"title"}>✨ Réserver votre rendez-vous beauté ✨</h1>
            <p className={"subtitle"}>Extensions de cils : <strong>{eyelashType}</strong></p>

            <div className={"calendarWrapper"}>
                <FullCalendar
                    ref={calendarRef}
                    plugins={[timeGridPlugin, interactionPlugin, dayGridPlugin]}
                    initialView={currentView}
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
                        start: isMobile ? 'prev,next' : 'prev,next today',
                        center: 'title',
                        end: isMobile ? '' : 'timeGridWeek,timeGridDay'
                    }}
                    height="auto"
                    // eventClick={(info) => {
                    //     // Sinon, continuer le comportement par défaut
                    //     console.log('Event clicked:', info.event);
                    //     // ...ton action normale ici (modal, navigation, etc.)
                    // }}
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
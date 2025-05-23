import React, {useEffect, useRef, useState} from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

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



    useEffect(() => {
        if (eyelashType) {
            setIsLoading(true);

            const fetchAndDelay = async () => {
                const startTime = Date.now();
                try {
                    const res = await fetch("http://localhost:5000/appointments");
                    const data = await res.json();
                    setEvents(data);
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
                    start
                })
            });

            const data = await res.json();
            if (data.success) {
                setShowModal(false);
                setFormData({phone: '', email: '', message: '', start: ''});
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
            .then(data => setEvents(data))
            .catch(err => console.error("Erreur de chargement :", err));

        const delayPromise = new Promise(resolve => setTimeout(resolve, 3000));

        Promise.all([fetchPromise, delayPromise]).then(() => {
            setIsLoading(false);
        });
    };


    const refreshEvents = () => {
        fetch("http://localhost:5000/appointments")
            .then(res => res.json())
            .then(data => setEvents(data));
    };

    if (isLoading && loadingVisible) {
        return <LoadingScreen isFadingOut={!loadingVisible}/>;
    }

    // Page de sélection de type de cils
    if (!eyelashType) {
        return (
            <div style={styles.eyelashSelectWrapper}>
                <h2 style={styles.title}>Choisissez votre type d'extensions de cils</h2>
                <p style={styles.subtitle}>Avant de continuer, sélectionnez le type qui vous convient</p>
                <div style={styles.typeList}>
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
                            style={{
                                ...styles.typeCard,
                                ...(hoveredType === type ? styles.typeCardHover : {})
                            }}
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

        <div style={styles.container}>
            <h1 style={styles.title}>✨ Réserver votre rendez-vous beauté ✨</h1>
            <p style={styles.subtitle}>Extensions de cils : <strong>{eyelashType}</strong></p>

            <div style={styles.calendarWrapper}>
                <FullCalendar
                    ref={calendarRef}
                    plugins={[timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    nowIndicator
                    editable={false}
                    selectable
                    events={events}
                    dateClick={handleDateClick}
                    height="auto"
                    headerToolbar={{
                        start: 'prev,next today',
                        center: 'title',
                        end: 'timeGridWeek,timeGridDay'
                    }}
                />
            </div>

            {showModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h2 style={styles.modalTitle}>📌 Informations du rendez-vous</h2>

                        <label>Numéro de téléphone *</label>
                        <input
                            type="text"
                            style={styles.input}
                            placeholder="(514) 123-4567"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: formatPhoneNumber(e.target.value)})}
                        />

                        <label>Email *</label>
                        <input
                            type="email"
                            style={styles.input}
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />

                        <label>Message (optionnel)</label>
                        <textarea
                            style={styles.textarea}
                            value={formData.message}
                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                        />

                        <div style={styles.modalActions}>
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
                            <button style={{...styles.button, backgroundColor: '#ccc'}}
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
    container: {
        padding: '3rem',
        background: '#fff0f5',
        fontFamily: "'Poppins', sans-serif",
        minHeight: '100vh',
        zIndex: 0,
        position: 'relative', // nécessaire pour empiler les bulles derrière
        overflow: 'hidden' // pour éviter qu'elles débordent si besoin
    },
    eyelashSelectWrapper: {
        background: '#fff0f5',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        fontFamily: "'Poppins', sans-serif"
    },
    typeList: {
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
        justifyContent: 'center'
    },
    typeCard: {
        background: '#fff',
        padding: '1.5rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        cursor: 'pointer',
        width: '240px',
        textAlign: 'center',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        border: '2px solid transparent',
    },

    calendarWrapper: {
        background: '#ffffff',
        padding: '1rem',
        borderRadius: '1rem',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
    },
    title: {
        fontSize: '2rem',
        textAlign: 'center',
        color: '#b85c9e',
        marginBottom: '0.5rem'
    },
    subtitle: {
        textAlign: 'center',
        color: '#555',
        fontSize: '1.1rem',
        marginBottom: '2rem'
    },
    modalOverlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
    },
    modalContent: {
        backgroundColor: '#fff',
        padding: '2rem',
        borderRadius: '1rem',
        width: '90%',
        maxWidth: '500px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
    },
    modalTitle: {
        fontSize: '1.5rem',
        marginBottom: '1rem',
        color: '#b85c9e'
    },
    input: {
        width: '100%',
        padding: '0.7rem',
        marginBottom: '1rem',
        borderRadius: '0.5rem',
        border: '1px solid #ccc'
    },
    textarea: {
        width: '100%',
        padding: '0.7rem',
        height: '80px',
        marginBottom: '1rem',
        borderRadius: '0.5rem',
        border: '1px solid #ccc'
    },
    modalActions: {
        display: 'flex',
        justifyContent: 'space-between'
    },
    button: {
        padding: '0.7rem 1.2rem',
        backgroundColor: '#b85c9e',
        color: '#fff',
        border: 'none',
        borderRadius: '0.5rem',
        cursor: 'pointer'
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
        cursor: 'not-allowed'
    },
    typeCardHover: {
        transform: 'scale(1.05)',
        boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
        border: '2px solid #b85c9e'
    }

};

function BackgroundBubbles() {
    const bubbleStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        zIndex: 0,
    };


    const bubbleCount = 10;
    const bubbles = Array.from({length: bubbleCount}).map((_, i) => {
        const size = Math.random() * 100 + 40; // entre 40px et 140px
        const left = Math.random() * 100; // en %
        const duration = Math.random() * 20 + 20; // entre 20s et 40s
        const delay = Math.random() * 10; // entre 0 et 10s

        return (
            <div key={i} style={{
                position: 'absolute',
                bottom: '-150px',
                left: `${left}%`,
                width: `${size}px`,
                height: `${size}px`,
                background: "rgba(184, 92, 158, 0.3)",
                borderRadius: '50%',
                animation: `rise ${duration}s ease-in infinite`,
                animationDelay: `${delay}s`,
                zIndex: 0,
                pointerEvents: 'none'
            }}/>
        );
    });

    return (
        <div style={bubbleStyle}>
            {bubbles}
            <style>{`
                @keyframes rise {
                    0% {
                        transform: translateY(0) scale(1);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(-110vh) scale(1.2);
                        opacity: 0;
                    }
                }
            `}</style>
        </div>
    );
}

const LoadingScreen = ({ isFadingOut }) => (
    <div style={{
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#fff',
        zIndex: 1000,
        opacity: isFadingOut ? 0 : 1,
        transition: 'opacity 0.3s ease-in-out',
        pointerEvents: 'none' // empêche clics pendant fade
    }}>
        <div style={{
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #b85c9e',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            animation: 'spin 1s linear infinite',
            marginBottom: '1rem'
        }} />
        <h2 style={{ color: '#b85c9e' }}>Chargement en cours...</h2>

        <style>
            {`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}
        </style>
    </div>
);

export default CalendarApp;

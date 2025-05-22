import React, { useEffect, useRef, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

function CalendarApp() {
    const [events, setEvents] = useState([]);
    const calendarRef = useRef();

    function handleData(data) {
        console.log("Données reçues :", data);
    }

    // Charger les événements depuis le backend
    useEffect(() => {
        fetch("http://localhost:5000/appointments")
            .then(res => res.json())
            .then(data => handleData(data))
            .catch(err => console.error("Erreur de chargement :", err));
    }, []);



    // Création d’un nouveau rendez-vous
    const handleDateClick = async (info) => {
        const title = prompt("Titre du rendez-vous :");
        if (!title) return;

        const description = prompt("Description :");

        const res = await fetch('http://localhost:5000/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, start: info.dateStr })
        });

        const data = await res.json();
        if (data.success) {
            alert("✅ Rendez-vous créé !");
            refreshEvents(); // recharger les événements
        } else {
            alert("❌ Erreur de création.");
        }
    };

    // Modifier un rendez-vous existant
    const handleEventClick = async (clickInfo) => {
        const newDate = prompt("Nouvelle date (ex: 2025-05-20T14:00):", clickInfo.event.startStr);
        if (!newDate) return;

        const res = await fetch(`http://localhost:5000/appointments/${clickInfo.event.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ newStart: newDate })
        });

        const data = await res.json();
        if (data.success) {
            alert("✅ Rendez-vous modifié !");
            refreshEvents(); // recharger les événements
        } else {
            alert("❌ Erreur de modification.");
        }
    };

    // Fonction pour recharger les événements
    const refreshEvents = () => {
        fetch("http://localhost:5000/appointments")
            .then(res => res.json())
            .then(data => setEvents(data));
    };

    return (
        <div style={{ padding: '2rem' }}>
            <h1>📅 Prise de rendez-vous</h1>

            <FullCalendar
                ref={calendarRef}
                plugins={[timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                nowIndicator
                editable={false}
                selectable
                events={events}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                headerToolbar={{
                    start: 'prev,next today',
                    center: 'title',
                    end: 'timeGridWeek,timeGridDay'
                }}
                height="auto"
            />
        </div>
    );
}

export default CalendarApp;

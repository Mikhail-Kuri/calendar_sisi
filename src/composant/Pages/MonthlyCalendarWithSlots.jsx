import React, {useState} from "react";
import "./CSS/MonthlyCalendarWithSlots.css";
import {BackgroundBubbles} from "../Effects/BackgroundEffects/BackgroundBubbles";
import Navbar from "../NAV/Navbar"; // Assurez-vous d'avoir ce fichier CSS pour le style

const slotTemplates = [
    "09:00 - 11:00",
    "11:30 - 13:30",
    "14:00 - 16:00",
    "16:30 - 18:30"
];

const MonthlyCalendarWithSlots = () => {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDate, setSelectedDate] = useState(null);
    const [availableSlots, setAvailableSlots] = useState([]);

    const getMonthDays = (month, year) => {
        const days = [];
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const firstWeekday = (firstDay.getDay() + 6) % 7; // Lundi = 0

        // Ajout des jours vides pour aligner
        for (let i = 0; i < firstWeekday; i++) {
            days.push(null);
        }

        for (let i = 1; i <= lastDay.getDate(); i++) {
            days.push(new Date(year, month, i));
        }

        return days;
    };

    const changeMonth = (offset) => {
        const newDate = new Date(currentYear, currentMonth + offset);
        setCurrentMonth(newDate.getMonth());
        setCurrentYear(newDate.getFullYear());
        setSelectedDate(null);
        setAvailableSlots([]);
    };

    const daysOfWeek = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
    const monthNames = [
        "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
        "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ];

    const calendarDays = getMonthDays(currentMonth, currentYear);

    return (
        <div>
            <Navbar />
            <div className="calendar-container">

                {/* Navigation mois */}
                <div className="calendar-header">
                    <button onClick={() => changeMonth(-1)}>⬅️</button>
                    <h2>{monthNames[currentMonth]} {currentYear}</h2>
                    <button onClick={() => changeMonth(1)}>➡️</button>
                </div>

                {/* Grille des jours */}
                <div className="calendar-grid">
                    {daysOfWeek.map((day) => (
                        <div key={day} className="day-name">{day}</div>
                    ))}
                    {calendarDays.map((date, idx) => (
                        <div
                            key={idx}
                            className={`day-cell ${date && selectedDate?.toDateString() === date.toDateString() ? "selected" : ""}`}
                            onClick={() => {
                                if (date) {
                                    setSelectedDate(date);
                                    setAvailableSlots(slotTemplates);
                                }
                            }}
                        >
                            {date ? date.getDate() : ""}
                        </div>
                    ))}
                </div>

                {/* Créneaux */}
                {selectedDate && (
                    <div className="slots-section">
                        <h3>Créneaux pour le {selectedDate.toLocaleDateString("fr-FR")}</h3>
                        <div className="slots-list">
                            {availableSlots.map((slot, index) => (
                                <button key={index} className="slot-button">
                                    {slot}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MonthlyCalendarWithSlots;

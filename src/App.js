import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CalendarApp from './Pages/MainPage/CalendarApp';
import MonthlyCalendarWithSlots from "./composant/Pages/MonthlyCalendarWithSlots";
import HomePage from "./Pages/MainPage/HomePages/HomePage";


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/calendar" element={<CalendarApp />} />
                <Route path="/monthly-calendar" element={<MonthlyCalendarWithSlots />} />
                {/* Ajoutez d'autres routes ici si nécessaire */}
            </Routes>
        </Router>
    );
}

export default App;

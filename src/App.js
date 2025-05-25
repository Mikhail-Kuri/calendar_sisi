import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CalendarApp from './Pages/MainPage/CalendarApp';


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<CalendarApp />} />
            </Routes>
        </Router>
    );
}

export default App;

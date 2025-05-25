// src/services/fetcher/fetchAppointments.js

export const fetchAppointments = async () => {
    try {
        const res = await fetch("http://localhost:5000/appointments");
        const data = await res.json();
        console.log("Données récupérées :", data);

        const currentUserId = localStorage.getItem("userId");
        let myEventIds = JSON.parse(localStorage.getItem(currentUserId) || "[]");

        const userStillHasEvent = data.some(event => myEventIds.includes(event.id));

        if (!userStillHasEvent) {
            localStorage.removeItem(currentUserId);
            const newUserId = crypto.randomUUID();
            localStorage.setItem(newUserId, JSON.stringify([]));
            localStorage.setItem("userId", newUserId);
            myEventIds = [];
        }

        const processedEvents = data
            .filter(event => {
                const isMine = myEventIds.includes(event.id);
                const isPrivate = event.visibility === 'private';
                return !isPrivate || isMine;
            })
            .map(event => {
                const isMine = myEventIds.includes(event.id);
                return {
                    ...event,
                    display: 'auto',
                    color: isMine ? '#b85c9e' : '#ff3b3b',
                    title: isMine ? event.title : 'Période indisponible',
                };
            });

        return processedEvents;
    } catch (err) {
        console.error("Erreur de chargement :", err);
        return [];
    }
};

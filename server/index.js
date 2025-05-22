import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { google } from 'googleapis';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

if (!process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_CALENDAR_ID) {
  console.error("❌ Veuillez définir GOOGLE_PRIVATE_KEY, GOOGLE_CLIENT_EMAIL et GOOGLE_CALENDAR_ID dans le .env");
  process.exit(1);
}

const auth = new google.auth.JWT(
    process.env.GOOGLE_CLIENT_EMAIL,
    null,
    process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    ['https://www.googleapis.com/auth/calendar']
);

const calendar = google.calendar({ version: 'v3', auth });

app.get('/appointments', async (req, res) => {
  try {
    const response = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      maxResults: 2500,         // max autorisé par Google
      singleEvents: true,
      orderBy: 'startTime'
    });

    const events = response.data.items.map(e => ({
      id: e.id,
      title: e.summary || "Sans titre",
      start: e.start.dateTime || e.start.date,
      end: e.end.dateTime || e.end.date,
      description: e.description || ''
    }));

    res.status(200).json(events);
  } catch (err) {
    console.error("Erreur récupération rendez-vous :", err);
    res.status(500).json({ success: false, message: "Erreur lors du chargement des rendez-vous." });
  }
});


app.post('/appointments', async (req, res) => {
  try {
    const { title, description, start } = req.body;

    if (!title || !start) {
      return res.status(400).json({ success: false, message: "Le titre et la date de début sont obligatoires." });
    }

    // Calcule la fin du rendez-vous (durée fixe de 4h)
    const end = new Date(new Date(start).getTime() + 4 * 60 * 60 * 1000).toISOString();

    const event = {
      summary: title,
      description,
      start: { dateTime: start, timeZone: 'America/Toronto' },
      end: { dateTime: end, timeZone: 'America/Toronto' }
    };

    const response = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      requestBody: event
    });

    res.status(200).json({ success: true, eventId: response.data.id });
  } catch (error) {
    console.error('Erreur Google Calendar création:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l’ajout à Google Calendar.' });
  }
});

// Route pour modifier un rendez-vous
app.put('/appointments/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const { newStart } = req.body;

    if (!newStart) {
      return res.status(400).json({ success: false, message: "La nouvelle date de début est obligatoire." });
    }

    const newEnd = new Date(new Date(newStart).getTime() + 4 * 60 * 60 * 1000).toISOString();

    const response = await calendar.events.patch({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      eventId: eventId,
      requestBody: {
        start: { dateTime: newStart, timeZone: 'America/Toronto' },
        end: { dateTime: newEnd, timeZone: 'America/Toronto' }
      }
    });

    res.status(200).json({ success: true, updated: response.data });
  } catch (err) {
    console.error("Erreur modification événement:", err);
    res.status(500).json({ success: false, message: "Erreur modification." });
  }
});

// Démarrage du serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Serveur en ligne sur http://localhost:${PORT}`);
});

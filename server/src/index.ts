import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import tokenRouter    from './routes/token.router';
import decksRouter    from './routes/decks.router';
import coursesRouter  from './routes/courses.router';
import sessionsRouter from './routes/sessions.router';
import eventsRouter   from './routes/events.router';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/token',         tokenRouter);
app.use('/api/v1/decks',    decksRouter);
app.use('/api/v1/courses',  coursesRouter);
app.use('/api/v1/sessions', sessionsRouter);
app.use('/api/v1/events',   eventsRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

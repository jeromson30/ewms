import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import projectRoutes from './routes/projects.js';
import boardRoutes from './routes/boards.js';
import planningRoutes from './routes/planning.js';
import adminRoutes from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/planning', planningRoutes);
app.use('/api/admin', adminRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});

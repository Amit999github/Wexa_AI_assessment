import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import apiRoutes from './routes/index.js';
import { notFoundHandler, errorHandler } from './middleware/errorHandler.js';
import { verifyConnectivity } from './config/db.js';

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());

// Health check hits the database directly so deploy platforms (and you,
// debugging at 2am) get an honest signal, not just "the process is running".
app.get('/health', async (req, res) => {
  try {
    await verifyConnectivity();
    res.json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(503).json({ status: 'degraded', database: 'unreachable', detail: err.message });
  }
});

app.use('/api', apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import reckyRoutes from './routes/reckyRoutes.js';
import formRoutes from './routes/formRoutes.js';
import registrationRoutes from './routes/registrationRoutes.js';
import budgetRoutes from './routes/budgetRoutes.js';
import logisticsRoutes from './routes/logisticsRoutes.js';
import reminderRoutes from './routes/reminderRoutes.js';
import checkinRoutes from './routes/checkinRoutes.js';
import historyRoutes from './routes/historyRoutes.js';
import femaleListRoutes from './routes/femaleListRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CLIENT_URLS is comma-separated so both local dev and the deployed Vercel
// URL can be allowed at once, e.g.:
// CLIENT_URLS=http://localhost:5173,https://gac-platform.vercel.app
const allowedOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, server-to-server, mobile apps)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'GAC Platform API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/recky', reckyRoutes);
app.use('/api/forms', formRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/logistics', logisticsRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/checkin', checkinRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/female-list', femaleListRoutes);
app.use('/api/notifications', notificationRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
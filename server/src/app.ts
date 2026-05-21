import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import connectDB from './config/db';
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { initializeSocket } from './socket/chat.socket';

// Route imports
import authRoutes from './routes/auth.routes';
import trainerRoutes from './routes/trainer.routes';
import bookingRoutes from './routes/booking.routes';
import userRoutes from './routes/user.routes';
import chatRoutes from './routes/chat.routes';
import paymentRoutes from './routes/payment.routes';
import notificationRoutes from './routes/notification.routes';
import adminRoutes from './routes/admin.routes';

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/api', apiLimiter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'TrainersApp API is running', timestamp: new Date().toISOString() });
});

// Daily Quote API
app.get('/api/quotes/daily', async (req, res) => {
  try {
    const Quote = require('./models/Quote').default;
    const count = await Quote.countDocuments({ active: true });
    if (count === 0) {
      return res.json({ success: true, data: { text: "The only bad workout is the one that didn't happen.", author: "Unknown" } });
    }
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const index = dayOfYear % count;
    const quote = await Quote.findOne({ active: true }).skip(index);
    res.json({ success: true, data: quote });
  } catch (err) {
    res.json({ success: true, data: { text: "Sweat is just fat crying.", author: "Unknown" } });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  await connectDB();

  server.listen(env.PORT, () => {
    console.log(`\n🚀 TrainersApp API running on port ${env.PORT}`);
    console.log(`📡 Environment: ${env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${env.PORT}/api/health\n`);
  });
};

startServer().catch(console.error);

export default app;

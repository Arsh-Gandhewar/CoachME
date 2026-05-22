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
import uploadRoutes from './routes/upload.routes';
import supportRoutes from './routes/support.routes';

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
app.get('/api/quotes/daily', (req, res) => {
  const quotes = [
    { text: "The only bad workout is the one that didn't happen.", author: "Unknown" },
    { text: "Sweat is just fat crying.", author: "Unknown" },
    { text: "What seems impossible today will one day become your warm-up.", author: "Unknown" },
    { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
    { text: "A one hour workout is 4% of your day. No excuses.", author: "Unknown" },
    { text: "The hardest lift of all is lifting your butt off the couch.", author: "Unknown" },
    { text: "It never gets easier, you just get stronger.", author: "Unknown" },
    { text: "Success starts with self-discipline.", author: "Unknown" },
    { text: "Don't stop when you're tired. Stop when you're done.", author: "David Goggins" },
    { text: "The body achieves what the mind believes.", author: "Unknown" },
    { text: "You don't have to be extreme, just consistent.", author: "Unknown" },
    { text: "Excuses don't burn calories.", author: "Unknown" }
  ];
  
  // Calculate day of the year to rotate quote at exactly 12:00 AM daily
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = (new Date().getTime() - start.getTime()) + (start.getTimezoneOffset() - new Date().getTimezoneOffset()) * 60000;
  const dayOfYear = Math.floor(diff / 86400000);
  
  const selectedQuote = quotes[dayOfYear % quotes.length];
  
  res.json({ success: true, data: selectedQuote });
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
app.use('/api/upload', uploadRoutes);
app.use('/api/support', supportRoutes);

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

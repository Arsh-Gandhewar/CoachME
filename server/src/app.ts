import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import logger from './utils/logger';
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
import subscriptionRoutes from './routes/subscription.routes';

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
initializeSocket(server);

// Middleware
const allowedOrigins = env.NODE_ENV === 'production' 
  ? ['https://coachme.app', 'https://www.coachme.app'] 
  : '*';
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(helmet());
app.use(compression());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
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
    { text: "Excuses don't burn calories.", author: "Unknown" },
    { text: "Wake up with determination. Go to bed with satisfaction.", author: "Unknown" },
    { text: "Strength doesn't come from what you can do. It comes from overcoming the things you once thought you couldn't.", author: "Ashley Lorenzana" },
    { text: "Fall in love with taking care of your body.", author: "Unknown" },
    { text: "Your body can stand almost anything. It's your mind that you have to convince.", author: "Unknown" },
    { text: "Sore today, strong tomorrow.", author: "Unknown" },
    { text: "Doubt me, hate me, you're the inspiration I need.", author: "Unknown" },
    { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery" },
    { text: "Push harder than yesterday if you want a different tomorrow.", author: "Unknown" },
    { text: "Make yourself a priority.", author: "Unknown" },
    { text: "It's going to be a journey. It's not a sprint to get in shape.", author: "Kerri Walsh Jennings" },
    { text: "No matter how slow you go, you are still lapping everybody on the couch.", author: "Unknown" },
    { text: "If you still look cute after your workout, you didn't train hard enough.", author: "Unknown" },
    { text: "Rome wasn't built in a day, but they worked on it every single day.", author: "Unknown" },
    { text: "Tough times don't last. Tough people do.", author: "Robert H. Schuller" },
    { text: "Exercise is a celebration of what your body can do.", author: "Unknown" },
    { text: "Strive for progress, not perfection.", author: "Unknown" },
    { text: "Your only limit is you.", author: "Unknown" },
    { text: "Less sugar, more fruit. Less meat, more veg. Less worry, more sleep. Less words, more action.", author: "Unknown" },
    { text: "The difference between wanting and achieving is discipline.", author: "Unknown" },
    { text: "Discipline is doing what needs to be done, even if you don't want to do it.", author: "Unknown" },
    { text: "Work hard in silence. Let success be your noise.", author: "Frank Ocean" },
    { text: "The pain you feel today will be the strength you feel tomorrow.", author: "Unknown" },
    { text: "Train insane or remain the same.", author: "Jillian Michaels" },
    { text: "Sweat, smile and repeat.", author: "Unknown" },
    { text: "You are stronger than you think.", author: "Unknown" },
    { text: "Focus on your goals, not your obstacles.", author: "Unknown" },
    { text: "Every workout counts.", author: "Unknown" },
    { text: "Be the best version of yourself.", author: "Unknown" },
    { text: "If it doesn't challenge you, it doesn't change you.", author: "Fred DeVito" },
    { text: "Nothing will work unless you do.", author: "Maya Angelou" },
    { text: "Believe in yourself and all that you are.", author: "Christian D. Larson" },
    { text: "Commit to be fit.", author: "Unknown" },
    { text: "Get fit for life, not just for summer.", author: "Unknown" },
    { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe" },
    { text: "Don't decrease the goal. Increase the effort.", author: "Unknown" },
    { text: "You don't get the ass you want by sitting on it.", author: "Unknown" },
    { text: "Results happen over time, not overnight. Work hard, stay consistent.", author: "Unknown" },
    { text: "You miss 100% of the shots you don't take.", author: "Wayne Gretzky" },
    { text: "Action is the foundational key to all success.", author: "Pablo Picasso" },
    { text: "Don't stop when you are tired, stop when you are done.", author: "Marilyn Monroe" },
    { text: "I already know what giving up feels like. I want to see what happens if I don't.", author: "Neila Rey" },
    { text: "A champion is someone who gets up when they can't.", author: "Jack Dempsey" },
    { text: "If you want something you've never had, you must be willing to do something you've never done.", author: "Thomas Jefferson" },
    { text: "What you do today can improve all your tomorrows.", author: "Ralph Marston" },
    { text: "Every day is another chance to get stronger, to eat better, to live healthier.", author: "Unknown" },
    { text: "You are one workout away from a good mood.", author: "Unknown" },
    { text: "The hardest part is walking out the front door.", author: "Unknown" },
    { text: "Turn your setbacks into comebacks.", author: "Unknown" },
    { text: "Keep moving forward.", author: "Walt Disney" }
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
app.use('/api/subscriptions', subscriptionRoutes);

// Error handler (must be last)
app.use(errorHandler);

// Start server
const startServer = async () => {
  await connectDB();

  server.listen(env.PORT, () => {
    logger.info(`🚀 TrainersApp API running on port ${env.PORT}`);
    logger.info(`📡 Environment: ${env.NODE_ENV}`);
    logger.info(`🔗 Health check: http://localhost:${env.PORT}/api/health`);
  });
};

startServer().catch(err => logger.error('Server failed to start:', err));

export default app;

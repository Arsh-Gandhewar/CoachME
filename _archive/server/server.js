const express = require('express');
const cors = require('cors');
require('dotenv').config();

const db = require('./db');

const authRoutes = require('./routes/auth');
const trainerRoutes = require('./routes/trainers');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/trainers', trainerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

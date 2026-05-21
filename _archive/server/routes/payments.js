const express = require('express');
const Stripe = require('stripe');
const authenticateToken = require('../middleware/auth');

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_dummy_key');

router.post('/create-payment-intent', authenticateToken, async (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    return res.status(400).json({ error: 'Amount is required' });
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100,
      currency: 'inr',
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

module.exports = router;

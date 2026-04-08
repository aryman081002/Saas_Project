const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const Razorpay = require('razorpay');
const supabase = require('../config/supabase');
const auth = require('../middleware/auth');

// Initialize Razorpay instance
let razorpayInstance;
try {
  razorpayInstance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} catch (err) {
  console.warn('⚠️  Razorpay not initialized. Check RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env');
}

// Plan pricing (in paise for INR — ₹1 = 100 paise)
const PLAN_PRICING = {
  starter: { monthly: 9900, yearly: 94800 },         // ₹99/mo or ₹948/yr
  professional: { monthly: 29900, yearly: 287200 },   // ₹299/mo or ₹2872/yr
};

// All routes require authentication
router.use(auth);

// ============================================
// POST /api/payments/create-order
// Creates a Razorpay order for a subscription plan
// ============================================
router.post('/create-order', async (req, res) => {
  try {
    if (!razorpayInstance) {
      return res.status(503).json({
        success: false,
        message: 'Payment service not configured. Please contact support.',
      });
    }

    const { plan, billingCycle } = req.body;

    // Validate plan
    if (!plan || !PLAN_PRICING[plan]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid plan. Choose starter or professional.',
      });
    }

    // Validate billing cycle
    const cycle = billingCycle || 'monthly';
    if (!['monthly', 'yearly'].includes(cycle)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid billing cycle. Choose monthly or yearly.',
      });
    }

    const amount = PLAN_PRICING[plan][cycle];

    // Create Razorpay order
    const order = await razorpayInstance.orders.create({
      amount,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}_${req.user.id.slice(0, 8)}`,
      notes: {
        userId: req.user.id,
        plan,
        billingCycle: cycle,
      },
    });

    // Save order to database
    const { error } = await supabase.from('subscriptions').insert({
      user_id: req.user.id,
      razorpay_order_id: order.id,
      plan,
      amount,
      currency: 'INR',
      status: 'created',
      billing_cycle: cycle,
    });

    if (error) {
      console.error('Save order error:', error);
    }

    res.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment order.',
    });
  }
});

// ============================================
// POST /api/payments/verify
// Verify Razorpay payment signature & activate plan
// ============================================
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: 'Missing payment verification details.',
      });
    }

    // Verify signature using HMAC SHA256
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      // Update subscription as failed
      await supabase
        .from('subscriptions')
        .update({ status: 'failed' })
        .eq('razorpay_order_id', razorpay_order_id);

      return res.status(400).json({
        success: false,
        message: 'Payment verification failed. Invalid signature.',
      });
    }

    // Update subscription as paid
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: 'paid',
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .select('*')
      .single();

    if (subError) {
      console.error('Update subscription error:', subError);
      return res.status(500).json({
        success: false,
        message: 'Failed to update subscription.',
      });
    }

    // Upgrade user's plan
    const { error: userError } = await supabase
      .from('users')
      .update({ plan: subscription.plan })
      .eq('id', req.user.id);

    if (userError) {
      console.error('Update user plan error:', userError);
    }

    res.json({
      success: true,
      message: 'Payment verified! Your plan has been upgraded.',
      subscription: {
        plan: subscription.plan,
        billingCycle: subscription.billing_cycle,
        status: subscription.status,
      },
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed.',
    });
  }
});

// ============================================
// GET /api/payments/history
// Get user's payment history
// ============================================
router.get('/history', async (req, res) => {
  try {
    const { data: payments, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch payment history.',
      });
    }

    res.json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error.',
    });
  }
});

module.exports = router;

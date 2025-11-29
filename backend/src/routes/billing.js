const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const User = require('../models/User');
const hourse = require('../models/hourse');
const Subscription = require('../models/Subscription');
const { authenticateToken, requireFamilyAdmin } = require('../middleware/auth');
const { sendEmail } = require('../services/emailService');

// Validation middleware
const validateSubscription = [
  body('planId').notEmpty(),
  body('paymentMethodId').optional().notEmpty(),
];

const validatePaymentMethod = [
  body('paymentMethodId').notEmpty(),
];

// @route   POST /api/billing/create-subscription
// @desc    Create new subscription
// @access  Private
router.post('/create-subscription', authenticateToken, validateSubscription, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { planId, paymentMethodId, familyId, trialDays, seats = 1, coupon } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId).populate('hourse');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user already has an active subscription
    const existingSubscription = await Subscription.findOne({
      user: userId,
      status: { $in: ['active', 'trialing'] },
    });

    if (existingSubscription) {
      return res.status(400).json({ message: 'User already has an active subscription' });
    }

    // Get plan details from Stripe
    const plan = await stripe.plans.retrieve(planId);
    if (!plan) {
      return res.status(404).json({ message: 'Plan not found' });
    }

    // Create or get Stripe customer
    let customer;
    if (user.stripeCustomerId) {
      customer = await stripe.customers.retrieve(user.stripeCustomerId);
    } else {
      customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: {
          userId: user._id.toString(),
        },
      });

      user.stripeCustomerId = customer.id;
      await user.save();
    }

    // Attach payment method if provided
    if (paymentMethodId) {
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customer.id,
      });

      // Set as default payment method
      await stripe.customers.update(customer.id, {
        invoice_settings: {
          default_payment_method: paymentMethodId,
        },
      });
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: planId, quantity: Math.max(1, Number(seats) || 1) }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
      trial_period_days: trialDays ? Number(trialDays) : undefined,
      coupon: coupon || undefined,
      metadata: {
        userId: user._id.toString(),
        familyId: familyId || user.hourse?._id.toString(),
        seats: String(Math.max(1, Number(seats) || 1)),
      },
    });

    // Create subscription record in database
    const subscriptionRecord = new Subscription({
      user: userId,
      hourse: familyId || user.hourse?._id,
      stripeSubscriptionId: subscription.id,
      stripeCustomerId: customer.id,
      plan: {
        id: plan.id,
        name: plan.nickname,
        price: plan.amount / 100, // Convert from cents
        currency: plan.currency,
        interval: plan.interval,
        intervalCount: plan.interval_count,
      },
      status: subscription.status,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end,
    });

    await subscriptionRecord.save();

    res.status(201).json({
      message: 'Subscription created successfully',
      subscription: {
        id: subscriptionRecord._id,
        status: subscriptionRecord.status,
        plan: subscriptionRecord.plan,
        currentPeriodEnd: subscriptionRecord.currentPeriodEnd,
      },
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
    });
  } catch (error) {
    console.error('Create subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/billing/subscription
// @desc    Get current subscription
// @access  Private
router.get('/subscription', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const subscription = await Subscription.findOne({
      user: userId,
      status: { $in: ['active', 'trialing', 'past_due'] },
    }).populate('hourse', 'name');

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    res.json({ subscription });
  } catch (error) {
    console.error('Get subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/billing/subscription
// @desc    Update subscription
// @access  Private
router.put('/subscription', authenticateToken, [
  body('planId').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { planId, seats } = req.body;
    const userId = req.user.id;

    const subscription = await Subscription.findOne({
      user: userId,
      status: { $in: ['active', 'trialing'] },
    });

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    // Update subscription in Stripe
    // Retrieve subscription to get item id
    const current = await stripe.subscriptions.retrieve(subscription.stripeSubscriptionId);
    const itemId = current.items.data[0]?.id;
    const updatedSubscription = await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      items: [ itemId ? { id: itemId, price: planId, quantity: seats ? Math.max(1, Number(seats)) : current.items.data[0]?.quantity || 1 } : { price: planId, quantity: seats ? Math.max(1, Number(seats)) : 1 } ],
      proration_behavior: 'create_prorations',
      metadata: {
        ...(current.metadata || {}),
        seats: String(seats ? Math.max(1, Number(seats)) : (current.metadata?.seats || current.items.data[0]?.quantity || 1)),
      }
    });

    // Update plan details
    const plan = await stripe.plans.retrieve(planId);
    subscription.plan = {
      id: plan.id,
      name: plan.nickname,
      price: plan.amount / 100,
      currency: plan.currency,
      interval: plan.interval,
      intervalCount: plan.interval_count,
    };

    subscription.currentPeriodStart = new Date(updatedSubscription.current_period_start * 1000);
    subscription.currentPeriodEnd = new Date(updatedSubscription.current_period_end * 1000);
    await subscription.save();

    res.json({
      message: 'Subscription updated successfully',
      subscription,
    });
  } catch (error) {
    console.error('Update subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/billing/subscription
// @desc    Cancel subscription
// @access  Private
router.delete('/subscription', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const subscription = await Subscription.findOne({
      user: userId,
      status: { $in: ['active', 'trialing'] },
    });

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    // Cancel subscription in Stripe
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: true,
    });

    subscription.cancelAtPeriodEnd = true;
    await subscription.save();

    res.json({
      message: 'Subscription will be cancelled at the end of the current period',
      subscription,
    });
  } catch (error) {
    console.error('Cancel subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/billing/reactivate-subscription
// @desc    Reactivate cancelled subscription
// @access  Private
router.post('/reactivate-subscription', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const subscription = await Subscription.findOne({
      user: userId,
      status: { $in: ['active', 'trialing'] },
      cancelAtPeriodEnd: true,
    });

    if (!subscription) {
      return res.status(404).json({ message: 'No cancelled subscription found' });
    }

    // Reactivate subscription in Stripe
    await stripe.subscriptions.update(subscription.stripeSubscriptionId, {
      cancel_at_period_end: false,
    });

    subscription.cancelAtPeriodEnd = false;
    await subscription.save();

    res.json({
      message: 'Subscription reactivated successfully',
      subscription,
    });
  } catch (error) {
    console.error('Reactivate subscription error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/billing/payment-methods
// @desc    Add payment method
// @access  Private
router.post('/payment-methods', authenticateToken, validatePaymentMethod, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { paymentMethodId } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.stripeCustomerId) {
      return res.status(400).json({ message: 'No Stripe customer found' });
    }

    // Attach payment method to customer
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: user.stripeCustomerId,
    });

    // Set as default payment method
    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });

    res.json({
      message: 'Payment method added successfully',
    });
  } catch (error) {
    console.error('Add payment method error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/billing/payment-methods/:paymentMethodId/default
// @desc    Set default payment method
// @access  Private
router.post('/payment-methods/:paymentMethodId/default', authenticateToken, async (req, res) => {
  try {
    const { paymentMethodId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user || !user.stripeCustomerId) {
      return res.status(404).json({ message: 'No Stripe customer found' });
    }

    await stripe.customers.update(user.stripeCustomerId, {
      invoice_settings: { default_payment_method: paymentMethodId },
    });

    user.defaultPaymentMethodId = paymentMethodId;
    await user.save();

    res.json({ message: 'Default payment method updated' });
  } catch (error) {
    console.error('Set default payment method error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/billing/payment-methods
// @desc    Get payment methods
// @access  Private
router.get('/payment-methods', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user || !user.stripeCustomerId) {
      return res.json({ paymentMethods: [] });
    }

    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card',
    });

    res.json({
      paymentMethods: paymentMethods.data.map(pm => ({
        id: pm.id,
        brand: pm.card.brand,
        last4: pm.card.last4,
        expMonth: pm.card.exp_month,
        expYear: pm.card.exp_year,
        isDefault: pm.id === user.defaultPaymentMethodId,
      })),
    });
  } catch (error) {
    console.error('Get payment methods error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/billing/payment-methods/:paymentMethodId
// @desc    Remove payment method
// @access  Private
router.delete('/payment-methods/:paymentMethodId', authenticateToken, async (req, res) => {
  try {
    const { paymentMethodId } = req.params;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user || !user.stripeCustomerId) {
      return res.status(404).json({ message: 'No Stripe customer found' });
    }

    // Detach payment method
    await stripe.paymentMethods.detach(paymentMethodId);

    res.json({
      message: 'Payment method removed successfully',
    });
  } catch (error) {
    console.error('Remove payment method error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/billing/invoices
// @desc    Get invoices
// @access  Private
router.get('/invoices', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10 } = req.query;

    const user = await User.findById(userId);
    if (!user || !user.stripeCustomerId) {
      return res.json({ invoices: [] });
    }

    const invoices = await stripe.invoices.list({
      customer: user.stripeCustomerId,
      limit: parseInt(limit),
    });

    res.json({
      invoices: invoices.data.map(invoice => ({
        id: invoice.id,
        number: invoice.number,
        amount: invoice.amount_paid,
        currency: invoice.currency,
        status: invoice.status,
        date: new Date(invoice.created * 1000),
        pdf: invoice.invoice_pdf,
        hostedInvoiceUrl: invoice.hosted_invoice_url,
      })),
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/billing/apply-coupon
// @desc    Apply coupon to active subscription
// @access  Private
router.post('/apply-coupon', authenticateToken, [ body('coupon').notEmpty() ], async (req, res) => {
  try {
    const userId = req.user.id;
    const { coupon } = req.body;

    const subscription = await Subscription.findOne({
      user: userId,
      status: { $in: ['active', 'trialing'] },
    });

    if (!subscription) {
      return res.status(404).json({ message: 'No active subscription found' });
    }

    // Validate coupon exists
    await stripe.coupons.retrieve(coupon);

    const updated = await stripe.subscriptions.update(subscription.stripeSubscriptionId, { coupon });
    subscription.status = updated.status;
    await subscription.save();
    res.json({ message: 'Coupon applied', subscription });
  } catch (error) {
    console.error('Apply coupon error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/billing/plans
// @desc    Get available plans
// @access  Public
router.get('/plans', async (req, res) => {
  try {
    const plans = await stripe.plans.list({
      active: true,
      expand: ['data.product'],
    });

    const formattedPlans = plans.data.map(plan => ({
      id: plan.id,
      name: plan.nickname,
      price: plan.amount / 100,
      currency: plan.currency,
      interval: plan.interval,
      intervalCount: plan.interval_count,
      product: {
        id: plan.product.id,
        name: plan.product.name,
        description: plan.product.description,
        features: plan.product.metadata.features ? 
          plan.product.metadata.features.split(',') : [],
      },
    }));

    res.json({ plans: formattedPlans });
  } catch (error) {
    console.error('Get plans error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/billing/webhook
// @desc    Handle Stripe webhooks
// @access  Public
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Webhook handlers
async function handleSubscriptionCreated(subscription) {
  const subscriptionRecord = await Subscription.findOne({
    stripeSubscriptionId: subscription.id,
  });

  if (subscriptionRecord) {
    subscriptionRecord.status = subscription.status;
    subscriptionRecord.currentPeriodStart = new Date(subscription.current_period_start * 1000);
    subscriptionRecord.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    await subscriptionRecord.save();
  }
}

async function handleSubscriptionUpdated(subscription) {
  const subscriptionRecord = await Subscription.findOne({
    stripeSubscriptionId: subscription.id,
  });

  if (subscriptionRecord) {
    subscriptionRecord.status = subscription.status;
    subscriptionRecord.currentPeriodStart = new Date(subscription.current_period_start * 1000);
    subscriptionRecord.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
    subscriptionRecord.cancelAtPeriodEnd = subscription.cancel_at_period_end;
    await subscriptionRecord.save();
  }
}

async function handleSubscriptionDeleted(subscription) {
  const subscriptionRecord = await Subscription.findOne({
    stripeSubscriptionId: subscription.id,
  });

  if (subscriptionRecord) {
    subscriptionRecord.status = 'cancelled';
    subscriptionRecord.cancelledAt = new Date();
    await subscriptionRecord.save();
  }
}

async function handlePaymentSucceeded(invoice) {
  const subscriptionRecord = await Subscription.findOne({
    stripeSubscriptionId: invoice.subscription,
  });

  if (subscriptionRecord) {
    // Send confirmation email
    const user = await User.findById(subscriptionRecord.user);
    if (user) {
      await sendEmail({
        to: user.email,
        subject: 'Payment Successful',
        template: 'payment-success',
        data: {
          name: user.firstName,
          amount: invoice.amount_paid / 100,
          currency: invoice.currency,
          planName: subscriptionRecord.plan.name,
        },
      });
    }
  }
}

async function handlePaymentFailed(invoice) {
  const subscriptionRecord = await Subscription.findOne({
    stripeSubscriptionId: invoice.subscription,
  });

  if (subscriptionRecord) {
    // Send payment failed email
    const user = await User.findById(subscriptionRecord.user);
    if (user) {
      await sendEmail({
        to: user.email,
        subject: 'Payment Failed',
        template: 'payment-failed',
        data: {
          name: user.firstName,
          amount: invoice.amount_due / 100,
          currency: invoice.currency,
          planName: subscriptionRecord.plan.name,
          retryDate: new Date(invoice.next_payment_attempt * 1000),
        },
      });
    }
  }
}

module.exports = router; 
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/lib/prisma'

export const dynamic = 'force-dynamic'

// POST /api/webhooks/stripe
export async function POST(req: NextRequest) {
  const payload = await req.text()
  const sig = req.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 })
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!stripeSecretKey || !webhookSecret) {
    console.error('Stripe basic config missing (STRIPE_SECRET_KEY or STRIPE_WEBHOOK_SECRET)')
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
  }

  // Dynamically import Stripe
  const Stripe = (await import('stripe')).default
  const stripe = new Stripe(stripeSecretKey, { apiVersion: '2023-10-16' })

  let event: any

  try {
    event = stripe.webhooks.constructEvent(payload, sig, webhookSecret)
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        await handlePaymentSuccess(session, stripe)
        break
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object
        // Only handle if it's not already handled via checkout.session.completed
        // Note: Stripe sometimes sends both. We check for checkout_session in invoice.
        if (!invoice.checkout_session) {
           await handlePaymentSuccess(invoice, stripe)
        }
        break
      }
      default:
        // Unhandled event type
        break
    }
  } catch (error: any) {
    console.error(`Error processing webhook event ${event.type}:`, error)
    return NextResponse.json({ error: 'Internal processing error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

/**
 * Handle successful payment and award coins
 */
async function handlePaymentSuccess(data: any, stripe: any) {
  // Try to find the user
  const email = data.customer_email || data.receipt_email || data.customer_details?.email
  const stripeCustomerId = data.customer
  
  if (!email && !stripeCustomerId) {
    console.warn('Could not identify user from Stripe event')
    return
  }

  let user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: email || 'never-match' },
        // Add more lookup methods if available (e.g. metadata)
      ]
    }
  })

  // Fallback: look up by customer ID if we have it in user metadata (hypothetical)
  if (!user && stripeCustomerId) {
    // If we don't store stripeCustomerId on User model yet, this might fail
    // In many apps, we'd have a stripeCustomerId field.
  }

  if (!user) {
    console.warn(`User not found for payment: ${email || stripeCustomerId}`)
    return
  }

  // Calculate coins
  // Default: 100 coins per currency unit (e.g. $1 = 100 coins)
  const amountTotal = data.amount_total || data.total || 0
  const currency = (data.currency || 'usd').toLowerCase()
  
  // Award calculation
  let coinsToAward = Math.floor(amountTotal / 100) * 100 // Example: amount is in cents, so /100 gives dollars.
  
  // Bonus: If it's a specific product, check metadata
  // (We'd need to fetch line items for more complex logic)
  
  if (coinsToAward <= 0) return

  // Begin transaction
  await prisma.$transaction(async (tx) => {
    // 1. Award coins to user
    await tx.user.update({
      where: { id: user.id },
      data: {
        coins: { increment: coinsToAward }
      }
    })

    // 2. record transaction
    await tx.coinTransaction.create({
      data: {
        userId: user.id,
        amount: coinsToAward,
        type: 'purchase',
        description: `Purchased ${coinsToAward} coins for ${currency.toUpperCase()} ${(amountTotal / 100).toFixed(2)}`,
        referenceId: data.id || data.payment_intent || 'stripe_payment'
      }
    })

    // 3. Update payment record if exists or create one
    const paymentId = data.payment_intent || data.id
    if (paymentId) {
       // We'll upsert the payment record
       await tx.payment.upsert({
         where: { transactionId: paymentId as string }, // Need to ensure transactionId is unique or indexed
         update: {
           amount: amountTotal / 100,
           currency: currency.toUpperCase(),
           status: 'succeeded',
           coinsEarned: coinsToAward,
           provider: 'stripe'
         },
         create: {
           userId: user.id,
           transactionId: paymentId as string,
           amount: amountTotal / 100,
           currency: currency.toUpperCase(),
           status: 'succeeded',
           coinsEarned: coinsToAward,
           provider: 'stripe'
         }
       })
    }
  })

  console.log(`Earned ${coinsToAward} coins for user ${user.email}`)
}

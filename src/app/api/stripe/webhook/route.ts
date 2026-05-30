import { NextResponse } from 'next/server';
import stripe from '@/lib/stripe';
import { WalletService } from '@/lib/wallet';
import { prisma } from '@/lib/prisma';
import { AuditService } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const payload = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header' },
      { status: 400 }
    );
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json(
      { error: 'Invalid signature' },
      { status: 400 }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        
        const { retailerId, userId, userEmail, topUpAmount } = session.metadata || {};
        
        if (retailerId && topUpAmount) {
          const amount = parseFloat(topUpAmount);
          
          // Credit the wallet
          const result = await WalletService.credit(
            retailerId,
            amount,
            `stripe-${session.id}`,
            {
              paymentMethod: 'stripe',
              stripeSessionId: session.id,
              stripePaymentIntentId: session.payment_intent,
              customerEmail: userEmail,
            }
          );

          if (result.success) {
            // Create audit log
            await AuditService.log({
              userId,
              retailerId,
              action: 'WALLET_CREDITED',
              entityType: 'Wallet',
              entityId: result.ledgerEntry?.id,
              newValue: {
                amount,
                balance: result.wallet?.balance,
                paymentMethod: 'stripe',
                stripeSessionId: session.id,
              },
            });

            // Create webhook event record
            await prisma.webhookEvent.create({
              data: {
                eventType: 'stripe.checkout.session.completed',
                provider: 'stripe',
                payload: session as any,
                status: 'DELIVERED',
                processedAt: new Date(),
              },
            });
          }
        }
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as any;
        
        await prisma.webhookEvent.create({
          data: {
            eventType: 'stripe.checkout.session.expired',
            provider: 'stripe',
            payload: session as any,
            status: 'DELIVERED',
            processedAt: new Date(),
          },
        });
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as any;
        
        await prisma.webhookEvent.create({
          data: {
            eventType: 'stripe.payment_intent.payment_failed',
            provider: 'stripe',
            payload: paymentIntent as any,
            status: 'DELIVERED',
            errorMessage: paymentIntent.last_payment_error?.message,
            processedAt: new Date(),
          },
        });
        break;
      }

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook processing error:', error);
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    );
  }
}

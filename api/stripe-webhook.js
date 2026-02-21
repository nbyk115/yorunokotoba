// Vercel Serverless Function
// /api/stripe-webhook.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Firebase Admin初期化（1回のみ）
let adminInitialized = false;
let db;

function initializeFirebaseAdmin() {
  if (!adminInitialized) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    db = getFirestore();
    adminInitialized = true;
  }
  return db;
}

module.exports = async (req, res) => {
  // POSTのみ許可
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    // Webhook署名を検証
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Firestore初期化
  const firestore = initializeFirebaseAdmin();

  try {
    switch (event.type) {
      // Checkout完了
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata.userId;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        if (userId) {
          await firestore.collection('users').doc(userId).set(
            {
              isPremium: true,
              stripeCustomerId: customerId,
              subscriptionId: subscriptionId,
              subscriptionStatus: 'trialing', // 7日間トライアル
              trialEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              updatedAt: new Date(),
            },
            { merge: true }
          );
          console.log(`User ${userId} subscribed (trial started)`);
        }
        break;
      }

      // サブスクリプション更新
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        // CustomerIDからUserIDを取得
        const usersRef = firestore.collection('users');
        const snapshot = await usersRef.where('stripeCustomerId', '==', customerId).limit(1).get();

        if (!snapshot.empty) {
          const userId = snapshot.docs[0].id;
          await firestore.collection('users').doc(userId).set(
            {
              subscriptionStatus: subscription.status, // active, past_due, canceled, etc.
              subscriptionEndDate: new Date(subscription.current_period_end * 1000),
              updatedAt: new Date(),
            },
            { merge: true }
          );
          console.log(`Subscription updated for user ${userId}: ${subscription.status}`);
        }
        break;
      }

      // サブスクリプション削除（キャンセル）
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customerId = subscription.customer;

        const usersRef = firestore.collection('users');
        const snapshot = await usersRef.where('stripeCustomerId', '==', customerId).limit(1).get();

        if (!snapshot.empty) {
          const userId = snapshot.docs[0].id;
          await firestore.collection('users').doc(userId).set(
            {
              isPremium: false,
              subscriptionStatus: 'canceled',
              updatedAt: new Date(),
            },
            { merge: true }
          );
          console.log(`Subscription canceled for user ${userId}`);
        }
        break;
      }

      // 支払い失敗
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;

        const usersRef = firestore.collection('users');
        const snapshot = await usersRef.where('stripeCustomerId', '==', customerId).limit(1).get();

        if (!snapshot.empty) {
          const userId = snapshot.docs[0].id;
          await firestore.collection('users').doc(userId).set(
            {
              subscriptionStatus: 'past_due',
              updatedAt: new Date(),
            },
            { merge: true }
          );
          console.log(`Payment failed for user ${userId}`);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: error.message });
  }
};

const functions = require("firebase-functions/v2");
const admin = require("firebase-admin");
const fetch = require("node-fetch");

admin.initializeApp();
const db = admin.firestore();

// KOMOJU API settings — replace with your keys
const KOMOJU_SECRET_KEY = "YOUR_KOMOJU_SECRET_KEY";
const KOMOJU_API = "https://komoju.com/api/v1";

function komojuHeaders() {
  const encoded = Buffer.from(KOMOJU_SECRET_KEY + ":").toString("base64");
  return {
    "Authorization": "Basic " + encoded,
    "Content-Type": "application/json",
    "Accept": "application/json",
  };
}

// Create a KOMOJU session for customer registration (called from frontend)
exports.createKomojuSession = functions.https.onCall(
  { region: "asia-northeast1" },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) throw new functions.https.HttpsError("unauthenticated", "ログインが必要です");

    const res = await fetch(KOMOJU_API + "/sessions", {
      method: "POST",
      headers: komojuHeaders(),
      body: JSON.stringify({
        mode: "customer",
        default_locale: "ja",
        payment_types: ["credit_card"],
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new functions.https.HttpsError("internal", "セッション作成に失敗しました");

    // Store session info for later verification
    await db.collection("komoju_sessions").doc(data.id).set({
      uid,
      customerId: data.customer_id || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { sessionId: data.id, customerId: data.customer_id };
  }
);

// Subscribe: create a KOMOJU subscription after customer session is completed
exports.subscribe = functions.https.onCall(
  { region: "asia-northeast1" },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) throw new functions.https.HttpsError("unauthenticated", "ログインが必要です");

    const { sessionId } = request.data;
    if (!sessionId) throw new functions.https.HttpsError("invalid-argument", "セッションIDが必要です");

    // Verify session belongs to this user
    const sessionDoc = await db.collection("komoju_sessions").doc(sessionId).get();
    if (!sessionDoc.exists || sessionDoc.data().uid !== uid) {
      throw new functions.https.HttpsError("permission-denied", "無効なセッションです");
    }

    // Get the session from KOMOJU to retrieve customer_id
    const sessionRes = await fetch(KOMOJU_API + "/sessions/" + sessionId, {
      headers: komojuHeaders(),
    });
    const sessionData = await sessionRes.json();
    if (!sessionRes.ok || sessionData.status !== "completed") {
      throw new functions.https.HttpsError("failed-precondition", "決済セッションが完了していません");
    }

    const customerId = sessionData.customer_id;
    if (!customerId) throw new functions.https.HttpsError("internal", "顧客IDが取得できませんでした");

    // Create a monthly subscription (480 JPY)
    const subRes = await fetch(KOMOJU_API + "/subscriptions", {
      method: "POST",
      headers: komojuHeaders(),
      body: JSON.stringify({
        customer: customerId,
        amount: 480,
        currency: "JPY",
        period: "monthly",
        metadata: { uid, plan: "ynk_premium_monthly" },
      }),
    });
    const subData = await subRes.json();
    if (!subRes.ok) throw new functions.https.HttpsError("internal", "定期課金の作成に失敗しました");

    // Save subscription to Firestore
    await db.collection("users").doc(uid).set({
      premium: true,
      komojuCustomerId: customerId,
      komojuSubscriptionId: subData.id,
      subscribedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    return { success: true };
  }
);

// Cancel subscription
exports.cancelSubscription = functions.https.onCall(
  { region: "asia-northeast1" },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) throw new functions.https.HttpsError("unauthenticated", "ログインが必要です");

    const userDoc = await db.collection("users").doc(uid).get();
    if (!userDoc.exists) throw new functions.https.HttpsError("not-found", "ユーザーが見つかりません");

    const subId = userDoc.data().komojuSubscriptionId;
    if (!subId) throw new functions.https.HttpsError("not-found", "定期課金が見つかりません");

    // Delete subscription on KOMOJU
    const res = await fetch(KOMOJU_API + "/subscriptions/" + subId, {
      method: "DELETE",
      headers: komojuHeaders(),
    });
    if (!res.ok && res.status !== 404) {
      throw new functions.https.HttpsError("internal", "解約に失敗しました");
    }

    // Update Firestore
    await db.collection("users").doc(uid).set({
      premium: false,
      cancelledAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    return { success: true };
  }
);

// Webhook: receive KOMOJU notifications
exports.komojuWebhook = functions.https.onRequest(
  { region: "asia-northeast1" },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const event = req.body;
    const type = event.type;

    try {
      if (type === "subscription.payment_failed" || type === "subscription.suspended") {
        const subId = event.data?.id;
        if (subId) {
          // Find user with this subscription
          const snapshot = await db.collection("users")
            .where("komojuSubscriptionId", "==", subId)
            .limit(1)
            .get();
          if (!snapshot.empty) {
            await snapshot.docs[0].ref.set({ premium: false }, { merge: true });
          }
        }
      }

      if (type === "subscription.activated" || type === "subscription.captured") {
        const subId = event.data?.id;
        if (subId) {
          const snapshot = await db.collection("users")
            .where("komojuSubscriptionId", "==", subId)
            .limit(1)
            .get();
          if (!snapshot.empty) {
            await snapshot.docs[0].ref.set({ premium: true }, { merge: true });
          }
        }
      }
    } catch (e) {
      console.error("Webhook processing error:", e);
    }

    res.status(200).json({ received: true });
  }
);

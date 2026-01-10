import admin from "firebase-admin";
import { Firestore } from "firebase-admin/firestore";

// 1. Config Object
const firebaseAdminConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // 2. Critical Fix: Handle newlines in private keys
  privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
};

// 3. Initialize ONLY if not already running
if (!admin.apps.length) {
  if (firebaseAdminConfig.privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(firebaseAdminConfig),
      });
      console.log("✅ Firebase Admin Connected");
    } catch (error) {
      console.error("❌ Firebase Init Error:", error);
    }
  } else {
    // This warning helps you debug missing keys in Vercel
    console.warn("⚠️ Firebase skipped: No Private Key found");
  }
}

// 4. Export the Database instance
export const db = (admin.apps.length ? admin.firestore() : {}) as Firestore;
import * as admin from "firebase-admin";
import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

// 1. Config Object
const firebaseAdminConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
};

// 2. Initialize ONLY if not already running
// FIX: Use getApps() correctly
if (!getApps().length) {
  if (firebaseAdminConfig.privateKey) {
    try {
      initializeApp({
        credential: cert(firebaseAdminConfig),
      });
      console.log("✅ Firebase Admin Connected");
    } catch (error) {
      console.error("❌ Firebase Init Error:", error);
    }
  } else {
    console.warn("⚠️ Firebase skipped: No Private Key found");
  }
}

// 3. Export the Database instance
// FIX: Export db correctly
export const db = getFirestore();
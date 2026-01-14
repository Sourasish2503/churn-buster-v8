import { getApps, initializeApp, cert } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";

// 1. Config Object
const firebaseAdminConfig = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  // Handle newlines in private keys (crucial for Vercel)
  privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
};

// 2. Initialize ONLY if not already running
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
    // Log warning during build instead of crashing
    console.warn("⚠️ Firebase skipped: No Private Key found");
  }
}

// 3. Export the Database instance SAFELY
// If the app wasn't initialized (missing keys), we export 'null' instead of calling getFirestore()
// We cast it 'as Firestore' to prevent TypeScript errors in other files.
// (At runtime, if keys are missing, your app will simply error on specific DB calls instead of crashing on startup).
export const db = (getApps().length ? getFirestore() : null) as unknown as Firestore;
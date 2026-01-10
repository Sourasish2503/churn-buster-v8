import { db } from "@/lib/firebase";
import { FieldValue } from "firebase-admin/firestore";

/**
 * Adds credits to a company's balance after a successful payment.
 */
export async function addPaidCredits(companyId: string, amount: number) {
  if (!companyId) return;

  const ref = db.collection("credits").doc(companyId);
  
  await ref.set({
    balance: FieldValue.increment(amount),
    lastUpdated: new Date().toISOString(),
    status: "active"
  }, { merge: true });

  console.log(`💰 Added ${amount} credits to ${companyId}`);
}

/**
 * Checks if a company has credits and deducts 1 if they do.
 * Returns true if successful, false if they are out of credits.
 */
export async function useCredit(companyId: string): Promise<boolean> {
  const ref = db.collection("credits").doc(companyId);

  // Run as a transaction to prevent race conditions
  return await db.runTransaction(async (t) => {
    const doc = await t.get(ref);
    const balance = doc.data()?.balance || 0;

    if (balance > 0) {
      t.update(ref, { balance: FieldValue.increment(-1) });
      return true;
    } else {
      return false;
    }
  });
}
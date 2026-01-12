import { db } from "@/lib/firebase";
import { FieldValue } from "firebase-admin/firestore";

export async function useCredit(companyId: string): Promise<boolean> {
  if (!db) return false; // Safety if Firebase failed to init
  
  const ref = db.collection("credits").doc(companyId);

  try {
    return await db.runTransaction(async (t) => {
      const doc = await t.get(ref);
      
      // Handle "Doc doesn't exist" or "No balance field"
      if (!doc.exists) return false;
      
      const data = doc.data();
      const balance = data?.balance || 0;

      if (balance > 0) {
        t.update(ref, { balance: FieldValue.increment(-1) });
        return true;
      } else {
        return false;
      }
    });
  } catch (e) {
    console.error("Transaction failed:", e);
    return false;
  }
}
// Note: Export addPaidCredits as well (not shown but keep your existing logic with safe checks)
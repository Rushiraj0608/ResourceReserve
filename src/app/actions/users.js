"use server";

import db from "@/lib/firebase";
import {
  query,
  where,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  collection,
} from "firebase/firestore";

export async function getUserById(id) {
  const docRef = doc(db, "users", id);
  const docSnap = await getDoc(docRef);

  const user = { ...docSnap.data(), id: docSnap.id };

  return user;
}

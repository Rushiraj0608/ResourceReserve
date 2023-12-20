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

export async function getResourcesByOrganizationId(id) {
  const q = query(
    collection(db, "resources"),
    where("organisationId", "==", id)
  );

  const querySnapshot = await getDocs(q);
  const resources = [];
  querySnapshot.forEach((doc) => {
    resources.push({ ...doc.data(), id: doc.id });
  });

  return resources;
}

// get resources by organization id and managedBy userId

export async function getResourcesByOrganizationIdAndManagedByUserId(
  organizationId,
  userId
) {
  const q = query(
    collection(db, "resources"),
    where("organisationId", "==", organizationId),
    where("managedBy", "array-contains", userId)
  );

  const querySnapshot = await getDocs(q);
  const resources = [];
  querySnapshot.forEach((doc) => {
    resources.push({ ...doc.data(), id: doc.id });
  });

  return resources;
}

// get resource by id
export async function getResourceById(id) {
  const docRef = doc(db, "resources", id.resourceId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const resource = { ...docSnap.data(), id: docSnap.id };
    const data = JSON.parse(JSON.stringify(resource));
    return data;
  } else {
    console.log("No such document!");
  }
}

//get resources by managedBy userId
export async function getResourcesByManagedByUserId(userId) {
  const q = query(
    collection(db, "resources"),
    where("managedBy", "array-contains", userId)
  );

  const querySnapshot = await getDocs(q);
  const resources = [];
  querySnapshot.forEach((doc) => {
    resources.push({ ...doc.data(), id: doc.id });
  });

  return resources;
}

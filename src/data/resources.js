import  db  from "@/lib/firebase";

import {
  doc,
  getDocs,
  setDoc,
  query,
  collection,
  getDoc,
  where
} from "firebase/firestore";

// get resources by organization id

async function getResourcesByOrganizationId(id) {
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

async function getResourcesByOrganizationIdAndManagedByUserId(
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
async function getResourceById(id) {
  const docRef = doc(db, "resources", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const resource = { ...docSnap.data(), id: docSnap.id };
    return resource;
  } else {
    console.log("No such document!");
  }
}

//get resources by managedBy userId
async function getResourcesByManagedByUserId(userId) {
  console.log(userId);
  const q = query(collection(db, "resources"), where("managedBy", "array-contains", userId));

  const querySnapshot = await getDocs(q);
  const resources = [];
  querySnapshot.forEach((doc) => {
    resources.push({ ...doc.data(), id: doc.id });
  });

  return resources;
}

export { getResourcesByOrganizationId, getResourcesByOrganizationIdAndManagedByUserId, getResourceById, getResourcesByManagedByUserId };

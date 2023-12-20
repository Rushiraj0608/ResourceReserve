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

export async function getOrganizations() {
  const q = query(collection(db, "organisations"));

  const querySnapshot = await getDocs(q);
  const organizations = [];
  querySnapshot.forEach((doc) => {
    organizations.push({ ...doc.data(), id: doc.id });
  });

  return organizations;
}

// get organization by id
export async function getOrganizationById(id) {

    
  const docRef = doc(db, "organisations", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const organization = { ...docSnap.data(), id: docSnap.id };

    const data = JSON.parse(JSON.stringify(organization));
    return data;
  } else {
    console.log("No such document!");
  }
}

// add userId to requests field in organization
export async function addRequestToOrganization(id, userId) {
  const docRef = doc(db, "organisations", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    data.requests.push(userId);
    await setDoc(docRef, data);
  } else {
    console.log("No such document!");
  }
}

// remove userId from members field in organization
export async function removeMemberFromOrganization(id, userId) {
  console.log(id, userId);
  const docRef = doc(db, "organisations", id);
  const docSnap = await getDoc(docRef);

  console.log(docSnap.data());

  if (docSnap.exists()) {
    const data = docSnap.data();
    data.members = data.members.filter((member) => member !== userId);
    await setDoc(docRef, data);
  } else {
    console.log("No such document!");
  }
}

// add userId to members field and remove userId from requests array in organization
export async function addMemberToOrganization(id, userId) {
  const docRef = doc(db, "organisations", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    data.members.push(userId);
    data.requests = data.requests.filter((request) => request !== userId);
    await setDoc(docRef, data);
  } else {
    console.log("No such document!");
  }
}

// remove userId from requests array in organization
export async function removeRequestFromOrganization(id, userId) {
  const docRef = doc(db, "organisations", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    data.requests = data.requests.filter((request) => request !== userId);
    await setDoc(docRef, data);
  } else {
    console.log("No such document!");
  }
}

// get all organizations where userId is in admins array
export async function getOrganizationsByAdminId(userId) {
  const q = query(
    collection(db, "organisations"),
    where("admins", "array-contains", userId)
  );

  const querySnapshot = await getDocs(q);
  const organizations = [];
  querySnapshot.forEach((doc) => {
    organizations.push({ ...doc.data(), id: doc.id });
  });

  return organizations;
}

// get all organizations where userId is in members array
export async function getOrganizationsByMemberId(userId) {
  const q = query(
    collection(db, "organisations"),
    where("members", "array-contains", userId)
  );

  const querySnapshot = await getDocs(q);
  const organizations = [];
  querySnapshot.forEach((doc) => {
    organizations.push({ ...doc.data(), id: doc.id });
  });

  return organizations;
}

// get members of organization by id
export async function getMembersOfOrganizationById(id) {
  const docRef = doc(db, "organisations", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    const members = [];
    for (let i = 0; i < data.members.length; i++) {
      const member = await getDoc(doc(db, "users", data.members[i]));
      members.push({ ...member.data(), id: member.id });
    }
    return members;
  } else {
    console.log("No such document!");
  }
}

// delete organization by id
export async function deleteOrganizationById(id) {
  const docRef = doc(db, "organisations", id);
  try {
    await deleteDoc(docRef);
  } catch (e) {
    console.log(e);
  }
}

// organizations where user is not in members array
export async function getOrganizationsWhereUserIsNotMember(userId) {
  const q = query(collection(db, "organisations"));

  const querySnapshot = await getDocs(q);
  const organizations = [];
  querySnapshot.forEach((doc) => {
    organizations.push({ ...doc.data(), id: doc.id });
  });

  const filteredOrganizations = organizations.filter((organization) => {
    return !organization.members.includes(userId);
  });

  return filteredOrganizations;
}

// organizations where user is in members array
export async function getOrganizationsWhereUserIsMember(userId) {
  console.log(userId, "efefef");
  const q = query(
    collection(db, "organisations"),
    where("members", "array-contains", userId)
  );

  const querySnapshot = await getDocs(q);
  console.log(querySnapshot);
  const organizations = [];
  querySnapshot.forEach((doc) => {
    organizations.push({ ...doc.data(), id: doc.id });
  });

  return organizations;
}

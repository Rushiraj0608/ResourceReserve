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
  addDoc,
  arrayUnion,
  deleteDoc
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

  console.log(organizations);

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



// reservations functions 


export async function getReservations() {
  try {
      const reservationsCollection = await collection(db, "reservations");
      const querySnapshot = await getDocs(reservationsCollection);
      const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
      }));

      const parsedData = JSON.parse(JSON.stringify(data))

      return parsedData;
  } catch (error) {
      console.error("Error getting reservations:", error);
      throw error;
  }
}


export async function getResource(resourceId) {
  try {


      const docRef = doc(db, 'resources', resourceId);
      const res = await getDoc(docRef);

      if (res.exists()) {
          const data = { id: res.id, ...res.data() };

          const parsedData = JSON.parse(JSON.stringify(data))

          return parsedData;
      }
  } catch (error) {
      console.error("Error getting reservations:", error);
      throw error;
  }
}


export async function getUserCollData(userId) {
  try {
      const usersRef = doc(db, "users", userId);
      const usersSnapshot = await getDoc(usersRef);
      const user = usersSnapshot.data()

      const parsedData = JSON.parse(JSON.stringify(user))

      return parsedData;
  } catch (error) {
      console.error("Error getting reservations:", error);
      throw error;
  }
}

export async function updateAndDeleteColls(querySnapshot, currentUserReservations) {
  try {
      let isDeleted = false
      let succ = false
      console.log("258")
      const resources = doc(db, 'resources', currentUserReservations.resourceId);
      const userRef = doc(db, "users", currentUserReservations.userId);
      // const reservationRef = doc(db, "users", currentUserReservations.userId);
      const docRef = doc(db, "reservations", currentUserReservations.id);
      const user = await getDoc(userRef);

      let updatedUserReservations = [];
      let isReservationDeletedInUser = false;
      console.log("265")
      if (user.exists()) {
        console.log(user.data().reservations, currentUserReservations.id,"rkgbe")
          user.data().reservations.forEach((element) => {
            console.log(element.reservationId, "sdv", currentUserReservations.id)
              if (element.reservationId === currentUserReservations.id) {
                
                  isReservationDeletedInUser = true;
              } else {
                  updatedUserReservations.push(element);
              }
          });
      }
      console.log("275")
      if (querySnapshot && querySnapshot.reservations) {
          let updatedReservation = [];

          querySnapshot.reservations.forEach((element) => {
              if (element.reservationId === currentUserReservations.id) {
                  isDeleted = true;
              } else {
                  updatedReservation.push(element);
              }
          });
          console.log("286", isDeleted, isReservationDeletedInUser)
          if (isDeleted && isReservationDeletedInUser) {
              try {
                  if (resources && userRef) {
                    console.log("290")
                      await updateDoc(resources, { reservations: updatedReservation });
                      await updateDoc(userRef, { reservations: updatedUserReservations });
                      // await deleteDoc(doc(db, "reservations", `${currentUserReservations.id}`));
                      await deleteDoc(docRef);
                      // await deleteDoc(doc(db, "reservations", `${currentUserReservations.id}`))
                      succ = true
                      console.log('Reservation canceled successfully.')
                      console.log("296")
                  } else {
                    console.log("298")
                      console.log('Error: resources or userRef is undefined');
                  }
              } catch (error) {
                console.log("302")
                  console.log('Error canceling reservation:', error);
              }
          }
      }
  } catch (error) {
      console.log("Error getting reservations:", error);
      throw error;
  }
}

export async function getResourceCollData(resourceId) {
  try {
      const resourceRef = doc(db, "resources", `${resourceId}`);
      const resourceSnapshot = await getDoc(resourceRef);
      const resource = resourceSnapshot.data()

      const parsedData = JSON.parse(JSON.stringify(resource))

      return parsedData;
  } catch (error) {
      console.error("Error getting reservations:", error);
      throw error;
  }
}

export async function setReservationCollWithNewReservations(reservation, resource, userId, organizationId) {
  try {
      const reservationRef = collection(db, "reservations");
      const resourceRef = doc(db, "resources", `${resource.id}`);
      const usersRef = doc(db, "users", userId);
      let reservationUpdateDataForReservation = reservation
      reservationUpdateDataForReservation["resourceId"] = resource.id
      const newReservationDocRef = await addDoc(reservationRef, reservationUpdateDataForReservation)
      let reservationUpdateDataForResource = reservation
      reservationUpdateDataForResource["resourceId"] = resource.id
      reservationUpdateDataForResource["reservationId"] = newReservationDocRef.id
      reservationUpdateDataForResource["organizationId"] = organizationId
      const updateResourceWithReservation = {
          reservations: arrayUnion(reservationUpdateDataForResource)
      }

      await updateDoc(resourceRef, updateResourceWithReservation)
      console.log("Object added successfully:", reservation);
      await updateDoc(usersRef, updateResourceWithReservation)

  } catch (error) {
      console.error("Error getting reservations:", error);
      throw error;
  }
}

export async function setReservation(reservation, resource, userId) {
  try {
      const reservationRef = collection(db, "reservations");
      const resourceRef = doc(db, "resources", resource.id);
      const usersRef = doc(db, "users", userId);
      let reservationUpdateDataForReservation = reservation
      reservationUpdateDataForReservation["resourceId"] = resource.id
      const newReservationDocRef = await addDoc(reservationRef, reservationUpdateDataForReservation)

      let reservationUpdateDataForResource = reservation
      reservationUpdateDataForResource["resourceId"] = resource.id
      reservationUpdateDataForResource["reservationId"] = newReservationDocRef.id
      const updateResourceWithReservation = {
          reservations: arrayUnion(reservationUpdateDataForResource)
      }

      await updateDoc(resourceRef, updateResourceWithReservation)
      console.log("Object added successfully:", reservation);
      await updateDoc(usersRef, updateResourceWithReservation)
      console.log("Object added in user successfully:");

  } catch (error) {
      console.error("Error getting reservations:", error);
      throw error;
  }
}

export async function setFirstReservation(reservation, resource, userId) {
  try {
      const reservationRef = collection(db, "reservations");
      const resourceRef = doc(db, "resources", `${resource.id}`);
      const usersRef = doc(db, "users", userId);
      let reservationUpdateDataForReservation = reservation
      reservationUpdateDataForReservation["resourceId"] = resource.id
      const newReservationDocRef = await addDoc(reservationRef, reservationUpdateDataForReservation)


      let reservationUpdateDataForResource = reservation
      reservationUpdateDataForResource["resourceId"] = resource.id
      reservationUpdateDataForResource["reservationId"] = newReservationDocRef.id
      console.log(reservationUpdateDataForResource, "resforsource")
      const updateResourceWithReservation = {
          reservations: arrayUnion(reservationUpdateDataForResource)
      }

      await updateDoc(resourceRef, updateResourceWithReservation)
      console.log("Object added successfully:", reservation);

  } catch (error) {
      console.error("Error getting reservations:", error);
      throw error;
  }
}


export async function fetchResourceDetails(resourceID) {
  console.log(resourceID,typeof resourceID,"czvxdxzv")
  // try {
  
  //     const docRef = doc(db, "resources", resourceID);
  //     console.log(docRef,"docref")
  //     const res = await getDoc(docRef);
  //     if (res.exists()) {
  //         console.log(res,"hjdsvhj")
  //         let id = res.id;
  //         const resourceData = { id, ...res.data() };
  //         const parsedData = JSON.parse(JSON.stringify(resourceData))
  //         return parsedData;
  //     }
  // } catch (error) {
  //     console.error("Error fetching resource details:", error);
  //     throw error;
  // }
  const docRef = doc(db, "resources", resourceID);
  console.log(docRef)
const docSnap = await getDoc(docRef);

if (docSnap.exists()) {
  const resource = { ...docSnap.data(), id: docSnap.id };
  const data = JSON.parse(JSON.stringify(resource));
  return data;
} else {
  console.log("No such document!");
}
}


export async function fetchOrganisationResources(organisationId) {
  try {
      const docRef = doc(db, "organisations", organisationId);
      const res = await getDoc(docRef);

      if (res.exists()) {
          const result = JSON.parse(JSON.stringify(res.data()));
          result.resources = await Promise.all(
              result.resources.map(async (x) => {
                  const resourceRef = doc(db, "resources", `${x.resourceId}`);
                  const resource = await getDoc(resourceRef);
                  if (resource.exists()) {
                      let id = resource.id;
                      return { id, ...resource.data() };
                  }
              })
          );

          return result.resources;
      }
  } catch (error) {
      console.error("Error fetching organisation resources:", error);
      throw error;
  }
}

export async function getCurrentReservations(currentUserReservations) {
  try {
      const docRef = doc(db, 'reservations', currentUserReservations.id);
      let data = await getDoc(docRef);

      if (data.exists()) {
          let id = data.id;
          data = { id, ...data.data() };
      }
      const parsedData = JSON.parse(JSON.stringify(data))

      return parsedData;
  } catch (error) {
      console.error("Error getting reservations:", error);
      throw error;
  }
}
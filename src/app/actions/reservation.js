'use server'

import { db } from "@/lib/firebase";
import { collection, getDocs, doc, getDoc, addDoc, arrayUnion, updateDoc, deleteDoc } from "firebase/firestore";

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
        const resources = doc(db, 'resources', currentUserReservations.resourceId);
        const userRef = doc(db, "users", currentUserReservations.userId);
        const user = await getDoc(userRef);

        let updatedUserReservations = [];
        let isReservationDeletedInUser = false;

        if (user.exists) {
            user.data().reservations.forEach((element) => {
                if (element.reservationId === currentUserReservations.id) {
                    isReservationDeletedInUser = true;
                } else {
                    updatedUserReservations.push(element);
                }
            });
        }
        if (querySnapshot && querySnapshot.reservations) {
            let updatedReservation = [];

            querySnapshot.reservations.forEach((element) => {
                if (element.reservationId === currentUserReservations.id) {
                    isDeleted = true;
                } else {
                    updatedReservation.push(element);
                }
            });

            if (isDeleted && isReservationDeletedInUser) {
                try {
                    if (resources && userRef) {

                        await updateDoc(resources, { reservations: updatedReservation });
                        await updateDoc(userRef, { reservations: updatedUserReservations });
                        await deleteDoc(doc(db, "reservations", `${currentUserReservations.id}`));
                        succ = true
                        console.log('Reservation canceled successfully.')

                    } else {
                        console.log('Error: resources or userRef is undefined');
                    }
                } catch (error) {
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

export async function setReservationCollWithNewReservations(reservation, resource, userId) {
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
        const resourceRef = doc(db, "resources", `${resource.id}`);
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
import CreateResource from "../helperAndComponents/CreateResource";

import { initializeApp } from "firebase/app";
import { addDoc, getFirestore } from "firebase/firestore";
import { collection } from "firebase/firestore";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://support.google.com/firebase/answer/7015592
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 *
 * need to , managed by creating user id or useremail id, created by user data from cookies, resouce image
 *
 * redirect user from
 */
export default async function Page() {
  async function submitResource(data) {
    "use server";

    data.createdAt = new Date();
    data.updatedAt = new Date();

    data.reviews = [];
    data.reservations = [];
    data.createdBy = "";
    data.managedBy = [];

    console.log(data);
    const newDoc = await addDoc(collection(db, "resources"), data);
    return newDoc.id;
  }
  return <CreateResource submitResource={submitResource} />;
}

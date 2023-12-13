/**
 * if an admin removes a manager does that updates in the users collection userType from manager to user
 * if an admin removes a admin does that updates in the users collection userType from admin to user
 * can an admin change the role of the manager to admin and admin role to manager
 */

import { doc, getDoc, setDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import EditResource from "./EditResource";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://support.google.com/firebase/answer/7015592
const firebaseConfig = {
  apiKey: ,
  authDomain: ,
  databaseURL: ,
  projectId: ,
  storageBucket: ,
  messagingSenderId: ,
  appId: ,
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
let checkArray = (array, newArray) => {
  newArray.map((newItem) => {
    if (!array.includes(newItem)) {
      return true;
    }
  });
  return false;
};
const compareData = (resource, updatedResource) => {
  for (let key in resource) {
    if (typeof resource[key] == "object" && Array.isArray(resource[key])) {
      if (checkArray(resource[key], updatedResource[key])) {
        return true;
      }
    } else if (
      typeof resource[key] == "object" &&
      !Array.isArray(resource[key])
    ) {
      for (let key2 in resource[key]) {
        if (
          typeof resource[key][key2] == "object" &&
          checkArray(resource[key][key2], updatedResource[key][key2])
        ) {
          return true;
        }
      }
    } else if (resource[key] != updatedResource[key]) {
      return true;
    }
  }
  console.log("nothing to update");
  return false;
};
async function getData() {
  "use server";
  let docRef = doc(db, "resources", "vtlIhpaUqia9ahsqvFJj");
  let res = await getDoc(docRef);

  if (res.exists()) {
    let result = JSON.parse(JSON.stringify(res.data()));
    result.managedBy = await Promise.all(
      result.managedBy.map(async (x) => {
        let usersref = doc(db, "users", `${x}`);
        let user = await getDoc(usersref);
        if (user.exists()) {
          return user.data();
        }
      })
    );
    console.log(result);
    return JSON.parse(JSON.stringify(result));
  }
}
let setData = async (oldData, newData) => {
  "use server";

  if (compareData(oldData, newData)) {
    newData.updatedAt = new Date();
    newData.updatedBy = "bhanu";
    let docRef = doc(db, "resources", "vtlIhpaUqia9ahsqvFJj");
    await setDoc(docRef, newData);
    let updatedDoc = await getData();
    console.log(updatedDoc, "doc has been updated");
  }
  return "nothing to update";
};

const Page = async () => {
  let querySnapshot = await getData();
  return <EditResource existingResource={querySnapshot} setData={setData} />;
};
export default Page;

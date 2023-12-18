/**
 * if an admin removes a manager does that updates in the users collection userType from manager to user
 * if an admin removes a admin does that updates in the users collection userType from admin to user
 * can an admin change the role of the manager to admin and admin role to manager
 */

import {
  doc,
  getDocs,
  getDoc,
  setDoc,
  collection,
  query,
  where,
} from "firebase/firestore";
import { redirect } from "next/navigation";
import { db } from "../../../../config";
import EditResource from "./EditResource";
import { s3 } from "../../../../config";

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
async function getData(params) {
  "use server";
  let docRef = doc(db, "resources", params.resourceId);
  let res = await getDoc(docRef);

  if (res.exists()) {
    let result = JSON.parse(JSON.stringify(res.data()));

    // we need to redirect to somewhere
    // if (result.organisationId != params.organisationId) {
    // redirect("/home");
    // }

    result.managedBy = await Promise.all(
      result.managedBy.map(async (x) => {
        let usersref = doc(db, "users", `${x}`);
        let user = await getDoc(usersref);
        if (user.exists()) {
          user = user.data();
          user._id = x;
          return user;
        }
      })
    );

    result.imageKeys = [...result.images];
    result.images = await Promise.all(
      result.images.map((image) => {
        const url = s3.getSignedUrl("getObject", {
          Bucket: "resourcereserves3",
          Key: image,
          Expires: 300,
        });
        console.log(url);
        return url;
      })
    );
    return JSON.parse(JSON.stringify(result));
  }
}

let setData = async (oldData, newData, params) => {
  "use server";
  console.log("kasdjbfkjasbkjfbkjahkjfhbk");
  newData.updatedAt = new Date();
  newData.updatedBy = "bhanu";
  delete newData.imageKeys;
  let docRef = doc(db, "resources", params.resourceId);
  await setDoc(docRef, newData);

  return "nothing to update";
};

let checkManager = async (email) => {
  "use server";
  let colRef = collection(db, "users");
  let q = query(colRef, where("email", "==", email));
  q = await getDocs(q);
  let user = {};
  q.forEach((x) => {
    user = x.data();
    user._id = x.id;
  });
  if (Object.keys(user).length > 0) {
    return { data: user, validity: 1 };
  } else {
    return { data: email, validity: 0 };
  }
};

const Page = async ({ params }) => {
  let querySnapshot = await getData(params);
  return (
    <EditResource
      params={params}
      existingResource={querySnapshot}
      setData={setData}
      checkManager={checkManager}
    />
  );
};
export default Page;

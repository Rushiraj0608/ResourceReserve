/**
 * is a manager is removed from the resource his doc must be edit as dicussed in groudp
 */

import {
  doc,
  getDocs,
  getDoc,
  setDoc,
  collection,
  query,
  where,
  updateDoc,
  deleteField,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import EditResource from "./EditResource";
import { s3 } from "../../../../../lib/config";

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
          user.id = x;
          return {
            id: user.id,
            firstName: user.firstName || user.name,
            lastName: user.lastName || "no last name",
            email: user.email,
          };
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

let getResource = async (resourceId) => {
  let resource = await getDoc(doc(db, "resources", resourceId));
  return resource.data();
};

let updateResource = async (newData, params) => {
  "use server";
  let oldResource = await getResource(params.resourceId);

  newData.updatedAt = new Date();
  newData.updatedBy = "bhanu";
  delete newData.imageKeys;
  newData.managedBy = newData.managedBy.reduce(
    (acc, current) => [...acc, current.id],
    []
  );
  let docRef = doc(db, "resources", params.resourceId);
  await setDoc(docRef, newData);
  await updateUsers(oldResource.managedBy, newData.managedBy, params);
  await updateOrganisation(oldResource, newData, params);
  return "nothing to update";
};

let updateUsers = async (old, newManagers, params) => {
  // let old = oldManagers.reduce((acc, current) => [...acc, current.id], []);
  console.log("\n\n\n\n", old, "\n", newManagers, "\n\n\n\n");

  newManagers.map(async (manager) => {
    if (!old.includes(manager)) {
      console.log("updating to mangaer this manager", manager);
      await updateDoc(doc(db, "users", manager), {
        userType: "manager",
        organisationId: params.organisationId,
        resourceId: params.resourceId,
      });
    }
  });
  old.map(async (manager) => {
    if (!newManagers.includes(manager)) {
      console.log("removing this manager", manager);
      await updateDoc(doc(db, "users", manager), {
        userType: "user",
        organisationId: deleteField(),
        resourceId: deleteField(),
      });
    }
  });
};

let updateOrganisation = async (oldResource, newResource, params) => {
  let organisation = await getDoc(
    doc(db, "organisations", params.organisationId)
  );
  organisation = organisation.data();
  oldResource.managedBy.map((manager) => {
    if (!newResource.managedBy.includes(manager)) {
      organisation.managers = organisation.managers.filter((x) => x != manager);
    }
  });
  newResource.managedBy.map((manager) => {
    if (!organisation.managers.includes(manager)) {
      organisation.managers = [...organisation.managers, manager];
    }
  });
  console.log(organisation.managers);
  await setDoc(doc(db, "organisations", params.organisationId), organisation);
};
let checkManager = async (email) => {
  "use server";

  let colRef = collection(db, "users");
  let q = query(colRef, where("email", "==", email));
  q = await getDocs(q);
  let user = {};
  q.forEach((x) => {
    user = x.data();
    user.id = x.id;
  });
  if (Object.keys(user).length > 0) {
    if (user.userType == "admin")
      return {
        validity: 0,
        error: `Cant add user with email ${email}`,
        data: email,
      };
    // userType manager cant add to an organistion
    else if (user.userType == "manager")
      return {
        validity: 0,
        error: "User is a manager at a resource",
      };
    else if (user.userType == "superAdmin")
      return {
        validity: 0,
        error: `Cant add user with email ${email}`,
      };
    // userType admin can add to an organistion
    else if (user.userType == "user") {
      let { password, ...remaining } = user;
      remaining.userType = "manager";
      return { data: remaining, validity: 1 };
    }
  } else {
    return { data: email, validity: 0, error: "noUser" };
  }
};

const Page = async ({ params }) => {
  let querySnapshot = await getData(params);
  return (
    <EditResource
      params={params}
      existingResource={querySnapshot}
      setData={updateResource}
      checkManager={checkManager}
    />
  );
};
export default Page;

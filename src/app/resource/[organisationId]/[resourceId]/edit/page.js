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

    // result.managedBy = await Promise.all(
    //   result.managedBy.map(async (x) => {
    //     let usersref = doc(db, "users", `${x}`);
    //     let user = await getDoc(usersref);
    //     if (user.exists()) {
    //       user = user.data();
    //       user.id = x;
    //       return user;
    //     }
    //   })
    // );

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

let updateResource = async (oldData, newData, params) => {
  "use server";
  console.log("kasdjbfkjasbkjfbkjahkjfhbk");
  newData.updatedAt = new Date();
  newData.updatedBy = "bhanu";
  delete newData.imageKeys;
  let docRef = doc(db, "resources", params.resourceId);
  await setDoc(docRef, newData);
  await updateUsers(oldData.managedBy, newData.managedBy);
  await updateOrganisation(newData, params);
  return "nothing to update";
};

let updateUsers = async (oldManagers, newManagers) => {
  let old = oldManagers.reduce((acc, current) => [...acc, current.id], []);
  let newM = newManagers.reduce((acc, current) => [...acc, current.id], []);
  newM.map(async (manager) => {
    if (!old.includes(manager)) {
      await updateDoc(doc(db, "users", manager), { userType: "manager" });
    }
  });
  old.map(async (manager) => {
    if (!newM.includes(manager)) {
      await updateDoc(doc(db, "users", manager), { userType: "user" });
    }
  });
};

let updateOrganisation = async (resource, params) => {
  let organisation = await getDoc(
    doc(db, "organisations", params.organisationId)
  );
  organisation = organisation.data();
  let resourceManagers = resource.managedBy.reduce(
    (acc, current) => [...acc, current.id],
    []
  );
  console.log(
    "updating managers",
    organisation,
    organisation.managers,
    typeof organisation.managers
  );
  organisation.managers = [...organisation.managers, ...resource.managedBy];
  organisation.managers = organisation.managers.filter((manager) => {
    if (manager.resourceId == params.resourceId) {
      if (resourceManagers.includes(manager.id)) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  });
  console.log(organisation, "before", organisation.resources);
  organisation.resources = organisation.resources.map((orgResource) => {
    if (orgResource.resourceId == params.resourceId) {
      orgResource.resourceName = resource.name;
    }
    return orgResource;
  });
  console.log(organisation, "after", organisation.resources);
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

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
import db from "@/lib/firebase";
import EditResource from "./EditResource";
import { s3 } from "../../../../../lib/config";

async function getData(params) {
  "use server";
  try {
    let docRef = doc(db, "resources", params.resourceId);
    let res = await getDoc(docRef);

    if (res.exists()) {
      let result = JSON.parse(JSON.stringify(res.data()));

      if (result.organisationId != params.organisationId) {
        throw `this resource is not a part of this organisation`;
      }

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
      return { validity: 1, data: JSON.parse(JSON.stringify(result)) };
    } else {
      throw `error while loading resource`;
    }
  } catch (e) {
    console.log(e);
    return { validity: 0, error: e };
  }
}

let updateResource = async (newData, params) => {
  "use server";

  try {
    let oldResource = await getDoc(doc(db, "resources", params.resourceId));

    if (!oldResource || !oldResource.exists()) {
      throw "invalid resource id";
    }
    oldResource = oldResource.data();
    let organisation = await getDoc(
      doc(db, "organisations", params.organisationId)
    );
    if (!organisation.exists()) {
      throw "invalid organisation id";
    }
    organisation = organisation.data();
    if (!organisation.resources.includes(params.resourceId)) {
      throw "invalid resource id";
    }

    newData.updatedAt = new Date();
    newData.updatedBy = "bhanu";
    delete newData.imageKeys;
    newData.managedBy = newData.managedBy.reduce(
      (acc, current) => [...acc, current.id],
      []
    );
    let docRef = doc(db, "resources", params.resourceId);
    await setDoc(docRef, newData);
    await updateUsers(oldResource.managedBy, newData, params);
    await updateOrganisation(oldResource, newData, params, organisation);

    return { validity: 1 };
  } catch (e) {
    return { validity: 0 };
  }
};

let getOrganisation = async (orgId) => {
  let organisation = await getDoc(doc(db, "organisations", orgId));
  if (organisation.exists()) {
    organisation = JSON.parse(JSON.stringify(organisation.data()));
    return { validity: 1, data: { ...organisation, id: orgId } };
  } else {
    return { validity: 0, error: "invalid organisation id" };
  }
};

let updateUsers = async (old, newData, params) => {
  // let old = oldManagers.reduce((acc, current) => [...acc, current.id], []);

  newData.managedBy.map(async (manager) => {
    if (!old.includes(manager)) {
      console.log("updating to mangaer this manager", manager);
      await updateDoc(doc(db, "users", manager), {
        userType: "manager",
        organisationId: params.organisationId,
        resourceId: params.resourceId,
        resourceName: newData.name,
      });
    }
  });
  old.map(async (manager) => {
    if (!newData.managedBy.includes(manager)) {
      console.log("removing this manager", manager);
      await updateDoc(doc(db, "users", manager), {
        userType: "user",
        organisationId: deleteField(),
        resourceId: deleteField(),
        resourceName: deleteField(),
      });
    }
  });
};

let updateOrganisation = async (
  oldResource,
  newResource,
  params,
  organisation
) => {
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
  let organisation = await getOrganisation(params.organisationId);
  try {
    if (organisation.validity) {
      organisation = organisation.data;
      if (!organisation.resources.includes(params.resourceId)) {
        throw `this resource is not a part of this organisation`;
      }
    } else {
      throw organisation.error;
    }
    if (querySnapshot.validity) {
      querySnapshot = querySnapshot.data;
      return (
        <EditResource
          organisation={organisation}
          params={params}
          existingResource={querySnapshot}
          setData={updateResource}
          checkManager={checkManager}
        />
      );
    } else {
      throw querySnapshot.error;
    }
  } catch (e) {
    return <h1>{e}</h1>;
  }
};
export default Page;

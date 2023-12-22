/**
 * is a manager is removed from the resource his doc must be edit as dicussed in groudp
 */
// need user Details to work as current User
import EditOrganisation from "./EditOrganisation";

import {
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  collection,
  query,
  where,
  updateDoc,
  deleteField,
} from "firebase/firestore";
import db from "@/lib/firebase";
import { redirect } from "next/navigation";

const getOrganisation = async (orgId) => {
  "use server";
  try {
    let docRef = doc(db, "organisations", orgId);
    let res = await getDoc(docRef);
    if (!res) throw "";
    if (res.exists()) {
      let result = { id: res.id };
      res = JSON.parse(JSON.stringify(res.data()));
      let admins = await Promise.all(
        res.admins.map(async (admin) => {
          let user = await getUserDoc(admin);
          return user;
        })
      );
      res.admins = [...admins];
      let managers = await Promise.all(
        res.managers.map(async (admin) => {
          let user = await getUserDoc(admin);
          return user;
        })
      );
      res.managers = [...managers];
      let resources = await Promise.all(
        res.resources.map(async (admin) => {
          let user = await getResourceDoc(admin);
          return user;
        })
      );
      res.resources = [...resources];
      result = { ...result, ...res };
      return { validity: 1, data: result };
    }
  } catch (e) {
    return { validity: 0, error: "error while loading organisation " };
  }
};
const getResourceDoc = async (resource) => {
  let resourceDoc = await getDoc(doc(db, "resources", resource));
  if (resourceDoc.exists()) {
    let id = resourceDoc.id;
    resourceDoc = resourceDoc.data();
    return { ...resourceDoc, id: resource };
  }
};

const getUserDoc = async (userId) => {
  let user = await getDoc(doc(db, "users", userId));
  if (user.exists()) {
    let id = user.id;
    user = user.data();
    return {
      email: user.email,
      id: id,
      firstName: user.firstName || user.name,
      lastName: user.lastName || "no last name",
    };
  }
};

let getUser = async (adminEmail) => {
  "use server";

  let colRef = collection(db, "users");
  let q = query(colRef, where("email", "==", adminEmail));
  q = await getDocs(q);
  let user = {};
  q.forEach((x) => {
    user = x.data();
    user.id = x.id;
  });

  if (Object.keys(user).length > 0) {
    // userType admin cant add to an organistion
    if (user.userType == "admin")
      return {
        validity: 0,
        error: "User is already an admin to another organisation",
        data: adminEmail,
      };
    // userType manager cant add to an organistion
    else if (user.userType == "manager")
      return {
        validity: 0,
        error:
          "User is a manager at a resource please remove him as a manager and add as an admin",
      };
    else if (user.userType == "superAdmin")
      return {
        validity: 0,
        error: `Cant add user with email ${adminEmail}`,
      };
    // userType admin can add to an organistion
    else if (user.userType == "user") {
      let { password, ...remaining } = user;
      remaining.userType = "admin";
      return {
        data: {
          email: user.email,
          id: user.id,
          firstName: user.firstName || user.name,
          lastName: user.lastName || "no last name",
        },
        validity: 1,
      };
    }
  } else {
    return {
      error: "noUser",
      data: adminEmail,
      validity: 0,
    };
  }
};

const updateAdmins = async (oldAdmins, newAdmins, organisationId) => {
  try {
    newAdmins.map(async (admin) => {
      if (!oldAdmins.includes(admin)) {
        await updateDoc(doc(db, "users", admin), {
          userType: "admin",
          organisationId,
        });
      }
    });

    oldAdmins.map(async (admin) => {
      if (!newAdmins.includes(admin))
        await updateDoc(doc(db, "users", admin), {
          userType: "user",
          organisationId: deleteField(),
        });
    });
  } catch (e) {
    console.log("error here");
  }
};

const getOrganisationDoc = async (orgId) => {
  "use server";
  let docRef = doc(db, "organisations", orgId);
  let res = await getDoc(docRef);
  if (res.exists()) {
    let result = { id: res.id };
    res = JSON.parse(JSON.stringify(res.data()));
    result = { ...result, ...res };
    return result;
  }
};
const editOrganisation = async (newOrganisation, id) => {
  "use server";
  // console.log("editing", organisation, id);
  try {
    newOrganisation.updatedAt = new Date();
    let oldOrganisation = await getOrganisationDoc(id);
    newOrganisation.admins = newOrganisation.admins.reduce((val, admin) => {
      return [...val, admin.id];
    }, []);
    console.log(newOrganisation);

    await updateAdmins(oldOrganisation.admins, newOrganisation.admins, id);

    await updateDoc(doc(db, "organisations", id), newOrganisation, {
      merge: true,
    });

    return { validity: 1, data: "Organisation has been edited" };
  } catch (e) {
    return { validity: 0, error: "Error while editing the Organisation" };
  }
  //need to add error
};

const deleteOrganisation = async (organisation) => {
  "use server";
  //this will delete the organisatio and calls updateUsers and delete resource
  try {
    Promise.all(organisation.admins.map(async (admin) => upateUsers(admin.id)));
    Promise.all(
      organisation.managers.map(async (manager) => upateUsers(manager.id))
    );
    Promise.all(
      organisation.resources.map(async (resource) =>
        deleteResource(resource.id)
      )
    );

    await deleteDoc(doc(db, "organisations", organisation.id));
  } catch (e) {
    console.log(e);
  }
};
const upateUsers = async () => {
  "use server";
  // updates the user to normal user and delete fields or organisation id and resource id
  await updateDoc(doc(db, "users", userId), {
    userType: "user",
    organisationId: deleteField(),
    resourceId: deleteField(),
  });
};
const deleteResource = async (resourceId) => {
  //deletes the resource
  await deleteDoc(doc(db, "resources", resourceId));
};
export default async function Page({ params }) {
  let organisation = await getOrganisation(params.organisationId);
  if (organisation.validity) {
    organisation = organisation.data;
    return (
      <EditOrganisation
        organisation={organisation}
        getUser={getUser}
        editOrganisation={editOrganisation}
        deleteOrganisation={deleteOrganisation}
      />
    );
  } else {
    return <h1>{organisation.error}</h1>;
  }
}

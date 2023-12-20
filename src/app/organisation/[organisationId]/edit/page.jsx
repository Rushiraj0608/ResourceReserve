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
import { db } from "@/lib/firebase";
import { redirect } from "next/navigation";

const getOrganisation = async (orgId) => {
  "use server";
  let docRef = doc(db, "organisations", orgId);
  let res = await getDoc(docRef);
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
    result = { ...result, ...res };
    return result;
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
    //loop  through new organisation and remove or add users accordingly

    console.log("\nupating\n", id);

    await updateAdmins(oldOrganisation.admins, newOrganisation.admins, id);

    await updateDoc(doc(db, "organisations", id), newOrganisation, {
      merge: true,
    });

    return { validity: 1, data: "Resource has been edited" };
  } catch (e) {
    return { validity: 0, error: "Error while editing the resources" };
  }
  //need to add error
};
export default async function Page({ params }) {
  let organisation = await getOrganisation(params.organisationId);

  return (
    <EditOrganisation
      organisation={organisation}
      getUser={getUser}
      editOrganisation={editOrganisation}
    />
  );
}

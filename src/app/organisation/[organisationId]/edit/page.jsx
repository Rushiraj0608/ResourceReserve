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
} from "firebase/firestore";
import { db } from "../../../config";
import { redirect } from "next/navigation";

let currentUser = {
  id: "Lb7DsK6GgzOQTQ0UoJE5",
  email: "user@superAdmin.com",
  userType: "superAdmin",
  firstName: "userFirstName",
  lastName: "userLastName",
};

const getOrganisation = async (orgId) => {
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
      return { data: remaining, validity: 1 };
    }
  } else {
    return {
      error: "no user registered with this email",
      data: adminEmail,
      validity: 0,
    };
  }
};
const updateAdmins = async (oldAdmins, newAdmins) => {
  console.log("updating users");
  oldAdmins = oldAdmins.reduce((val, admin) => {
    return [...val, admin.id];
  }, []);
  newAdmins = newAdmins.reduce((val, admin) => {
    return [...val, admin.id];
  }, []);
  console.log(oldAdmins, "\n\n\n\n\n\n\n", newAdmins, "\n\n\n\n\n");
  newAdmins.map(async (admin) => {
    if (!oldAdmins.includes(admin)) {
      await updateDoc(doc(db, "users", admin), { userType: "admin" });
    }
  });

  oldAdmins.map(async (admin) => {
    if (!newAdmins.includes(admin))
      await updateDoc(doc(db, "users", admin), { userType: "user" });
  });
};
const editOrganisation = async (newOrganisation, id) => {
  "use server";
  // console.log("editing", organisation, id);
  newOrganisation.updatedAt = new Date();
  let oldOrganisation = await getOrganisation(id);
  //loop  through new organisation and remove or add users accordingly
  await updateAdmins(oldOrganisation.admins, newOrganisation.admins);
  await setDoc(doc(db, "organisations", id), newOrganisation, {
    merge: true,
  });
};
export default async function Page({ params }) {
  let organisation = await getOrganisation(params.organisationId);
  let flag = 0;
  if (currentUser.userType == "manager" || currentUser.userType == "user")
    // redirect("/"); get this back
    organisation.admins.map((admin) => {
      if (admin.id == currentUser.id) {
        flag = 1;
      }
    });
  // if (!flag) redirect("/"); get this back
  return (
    <EditOrganisation
      organisation={organisation}
      getUser={getUser}
      editOrganisation={editOrganisation}
    />
  );
}

import CreateOrganisation from "./createOrganisation";

import {
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  collection,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../config";
import { redirect } from "next/dist/server/api-utils";

let currentUser = {
  email: "user@superAdmin.com",
  userType: "superAdmin",
  firstName: "userFirstName",
  lastName: "userLastName",
};

let checkManager = async (adminEmail) => {
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
    return { error: "noUser", data: adminEmail, validity: 0 };
  }
};

let checkOrganisationEmail = async (email) => {
  "use server";
  let colRef = collection(db, "organisations");
  let q = query(colRef, where("email", "==", email));
  q = await getDocs(q);
  let organisation = {};
  q.forEach((x) => {
    organisation = x.data();
  });

  if (Object.keys(organisation).length > 0) {
    return { data: "organisation with this email already exists", validity: 0 };
  } else {
    return { validity: 1 };
  }
};

const updateUser = async (userid) => {
  //if user is not available or network
  "use server";
  await updateDoc(doc(db, "users", userid), {
    userType: "admin",
  });
};
let addOrganisation = async (newOrganisation) => {
  "use server";

  newOrganisation.createdAt = new Date();
  newOrganisation.updatedAt = new Date();
  newOrganisation.managers = [];
  newOrganisation.resources = [];
  newOrganisation.createdBy = {
    ...currentUser,
  };

  let organisation = await checkOrganisationEmail(newOrganisation.email);
  console.log(organisation, "createOrd");
  if (organisation.validity) {
    const newDoc = await addDoc(
      collection(db, "organisations"),
      newOrganisation
    );
    console.log(newDoc.id, "kadbfkbasdkjbfuasbdfbhkajdsfky");
    newOrganisation.admins.map(async (admin) => {
      updateUser(admin.id);
      console.log("updated as admin");
    });
    return { doc: newDoc.id, validity: 1 };
  } else {
    return { validity: 0 };
  }
};

export default async function Page() {
  if (!currentUser) {
    redirect("/login");
  } else if (currentUser.userType != "superAdmin") {
    /**need to log this user out or redirect to home page */
  }
  return (
    <CreateOrganisation
      checkManager={checkManager}
      addOrganisation={addOrganisation}
    />
  );
}

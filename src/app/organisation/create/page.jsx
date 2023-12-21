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
  updateDoc,
} from "firebase/firestore";

import db from "@/lib/firebase";

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
      return {
        data: {
          firstName: user.firstName || user.name,
          lastName: user.lastName || "no lastName given",
          email: user.email,
          id: user.id,
        },
        validity: 1,
      };
    }
  } else {
    return { error: "noUser", data: adminEmail, validity: 0 };
  }
};

let checkOrganisationEmail = async (email) => {
  "use server";
  let colRef = collection(db, "organisations");
  let org = query(colRef, where("email", "==", email));
  org = await getDocs(org);
  let organisation = {};
  org.forEach((x) => {
    organisation = x.data();
  });
  colRef = collection(db, "resources");
  let res = query(colRef, where("email", "==", email));
  res = await getDocs(res);
  let resource = {};
  res.forEach((x) => {
    resource = x.data();
  });
  colRef = collection(db, "users");
  let user = query(colRef, where("email", "==", email));
  user = await getDocs(user);
  let docu = {};
  user.forEach((x) => {
    docu = x.data();
  });
  if (
    Object.keys(organisation).length > 0 ||
    Object.keys(resource).length > 0 ||
    Object.keys(docu).length > 0
  ) {
    return {
      error: "organisation with this email already exists",
      validity: 0,
    };
  } else {
    return { validity: 1 };
  }
};

const updateUser = async (userid, organisationId) => {
  //if user is not available or network
  "use server";
  await updateDoc(doc(db, "users", userid), {
    userType: "admin",
    organisationId,
  });
};
let addOrganisation = async (newOrganisation) => {
  "use server";

  newOrganisation.createdAt = new Date();
  newOrganisation.updatedAt = new Date();
  newOrganisation.managers = [];
  newOrganisation.resources = [];
  newOrganisation.members = [];
  newOrganisation.rquests = [];

  try {
    let organisation = await checkOrganisationEmail(newOrganisation.email);
    console.log(organisation, "createOrd");
    if (organisation.validity) {
      newOrganisation.admins = newOrganisation.admins.map((admin) => admin.id);
      const newDoc = await addDoc(
        collection(db, "organisations"),
        newOrganisation
      );
      console.log(
        newDoc.id,
        "kadbfkbasdkjbfuasbdfbhkajdsfky",
        newOrganisation,
        newOrganisation.createdBy
      );
      newOrganisation.admins.map(async (admin) => {
        updateUser(admin, newDoc.id);
        console.log("updated as admin");
      });
      return { doc: newDoc.id, validity: 1 };
    } else {
      throw organisation.error;
    }
  } catch (e) {
    return { validity: 0, data: e || "error while creating organisation" };
  }
};

export default async function Page() {
  return (
    <CreateOrganisation
      checkManager={checkManager}
      addOrganisation={addOrganisation}
    />
  );
}

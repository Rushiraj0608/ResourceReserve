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

let checkManager = async (adminEmail) => {
  "use server";

  let colRef = collection(db, "users");
  let q = query(colRef, where("email", "==", adminEmail));
  q = await getDocs(q);
  let user = {};
  q.forEach((x) => {
    user = x.data();
    user._id = x.id;
  });

  if (Object.keys(user).length > 0) {
    let { email, firstName, lastName, ...remaining } = user;
    user = { email, firstName, lastName };
    return { data: user, validity: 1 };
  } else {
    return { data: adminEmail, validity: 0 };
  }
};

let checkResource = async (email) => {
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

let addOrganisation = async (admin) => {
  "use server";

  admin.createdAt = new Date();
  admin.updatedAt = new Date();
  admin.managers = [];
  admin.resources = [];
  admin.createdBy = {
    name: "new user",
    id: "aslojflaksdnlfiuaisudhfiluas",
  };
  admin.admins = [...admin.admins, admin.createdBy];

  let organisation = await checkResource(admin.email);
  console.log(organisation, "createOrd");
  if (organisation.validity) {
    const newDoc = await addDoc(collection(db, "organisations"), admin);
    console.log(newDoc.id, "kadbfkbasdkjbfuasbdfbhkajdsfky");
    return { doc: newDoc.id, validity: 1 };
  } else {
    return { validity: 0 };
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

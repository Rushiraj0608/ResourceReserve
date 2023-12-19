import CreateResource from "./CreateResource";

import {
  addDoc,
  getDoc,
  setDoc,
  doc,
  getDocs,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import { collection } from "firebase/firestore";
import { db } from "../../../config";
import { redirect } from "next/navigation";

let currentUser = {
  id: "Lb7DsK6GgzOQTQ0UoJE5",
  email: "user@superAdmin.com",
  userType: "superAdmin",
  firstName: "userFirstName",
  lastName: "userLastName",
};
const checkPossibility = async (organisationId) => {
  // this is a function if the uploader is a admin in that resource or not
  try {
    let validity = 0;
    let docRef = doc(db, "organisations", organisationId);
    let organisationData = await getDoc(docRef);
    if (organisationData.exists()) {
      organisationData = organisationData.data();
      return { validity: 1, organisationData };
    } else {
      return { validity, data: "invalid organisationId" };
    }
  } catch (e) {
    return { validity, data };
  }
};
async function submitResource(data, resourceId) {
  "use server";

  data.createdAt = new Date();
  data.updatedAt = new Date();

  data.reviews = [];
  data.reservations = [];
  data.createdBy = { ...currentUser };

  let organisation = await checkPossibility(data.organisationId);

  if (organisation.validity) {
    let { organisationData } = organisation;
    console.log(resourceId, "both id's", data.organisationId);
    await setDoc(doc(db, "resources", resourceId), data);
    await updateUser(data.managedBy);
    // by default the creator of this resource is added to the resource
    organisationData.resources = [
      ...organisationData.resources,
      {
        // adds resource details and creator or the resource
        resourceId: resourceId,
        resourceName: data.name,
        firstName: currentUser.firstName,
        lastName: currentUser.lastName,
        id: currentUser.id,
      },
    ];

    let orgManagers = organisationData.managers;
    organisationData.managers = [...orgManagers, ...data.managedBy];
    organisationData.updatedAt = new Date();
    const updateOrganisation = await setDoc(
      doc(db, "organisations", data.organisationId),
      organisationData,
      {
        merge: true,
      }
    );
    redirect(`/resource/${data.organisationId}/${resourceId}/edit`);
  } else {
    return { validity: 0, data: organisation.data };
  }
}

const updateUser = async (managedBy) => {
  managedBy.map(async (manager) => {
    await updateDoc(doc(db, "users", manager.id), { userType: "manager" });
  });
};

const getUser = async (email) => {
  "use server";
  console.log(email, "\n\n fetching this on");
  if (!email) return { validity: 0, error: `email id cant be empty` };
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
        error: "User is already an admin to another organisation",
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

let getFireBaseID = async () => {
  "use server";
  let ref = doc(collection(db, "resources"));
  return ref.id;
};
export default async function Page({ params }) {
  if (currentUser.userType == "manager" || currentUser.userType == "user")
    redirect("/");

  return (
    <>
      <CreateResource
        submitResource={submitResource}
        organisationId={params.organisationId}
        getFireBaseID={getFireBaseID}
        getUser={getUser}
      />
    </>
  );
}

import CreateResource from "./CreateResource";

import { addDoc, getDoc, setDoc, doc } from "firebase/firestore";
import { collection } from "firebase/firestore";
import { db } from "../../../config";
import { redirect } from "next/navigation";

let currentUser = {
  firstName: "lakdsnflkasndlkfnlkas",
  lastName: "lakdnfkasndfjadslkfnl",
  email: "user@user.com",
};

const checkPossibility = async (organisationId) => {
  try {
    let validity = 0;
    let docRef = doc(db, "organisations", organisationId);
    let organisationData = await getDoc(docRef);
    organisationData = organisationData.data();
    organisationData.admins.map((admin) => {
      if (admin.email == currentUser.email) {
        console.log(admin);
        validity = 1;
      }
    });
    if (!validity) throw "only admin related to this organisation add resource";
    return { validity, organisationData };
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
  data.managedBy = [{ ...currentUser }];

  let organisation = await checkPossibility(data.organisationId);

  if (organisation.validity) {
    let { organisationData } = organisation;
    console.log(resourceId, "both id's", data.organisationId);
    await setDoc(doc(db, "resources", resourceId), data);
    // by default the creator of this resource is added to the resource
    data.managedBy = [{ currentUser }];
    organisationData.resources = [
      ...organisationData.resources,
      {
        resourceId: resourceId,
        resourceName: data.name,
        ...currentUser,
      },
    ];
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

let getFireBaseID = async () => {
  "use server";
  let ref = doc(collection(db, "resources"));
  return ref.id;
};
export default async function Page({ params }) {
  return (
    <>
      <CreateResource
        submitResource={submitResource}
        organisationId={params.organisationId}
        getFireBaseID={getFireBaseID}
      />
    </>
  );
}

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
import { Organisation } from "./Organisation";

const getOrganisation = async (orgId) => {
  "use server";
  let docRef = doc(db, "organisations", orgId);
  let res = await getDoc(docRef);
  let result = { id: res.id };
  res = JSON.parse(JSON.stringify(res.data()));
  result = { ...result, ...res };
  return result;
};

const getUser = async (email) => {
  "use server";
  let colRef = collection(db, "users");
  let q = query(colRef, where("email", "==", email));
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
    return { data: email, validity: 0 };
  }
};

const editOrganisation = async (organisation, id) => {
  "use server";
  // console.log("editing", organisation, id);
  organisation.updatedAt = new Date();
  await setDoc(doc(db, "organisations", id), organisation, {
    merge: true,
  });
};
// export default async function Page({ params }) {

//   if (organisation) {
//     return (
//       <EditOrganisation
//         organisation={organisation}
//         getUser={getUser}
//         editOrganisation={editOrganisation}
//       />
//     );

// }

export default async function Page({ params }) {
  console.log(
    "kdsjfknaskdfnisfaldsnfayhjanrmlkeransdkfmaksjdnfiwuerwnerkqnoierjpoqkjerok"
  );
  let organisation = await getOrganisation(params.organisationId);

  return <Organisation organisation={organisation} />;
}

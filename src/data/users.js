import  db  from "@/lib/firebase";

import { doc, getDocs, setDoc, query, collection, getDoc, where } from "firebase/firestore";


// get users by id

async function getUserById(id) {
  const docRef = doc(db, "users", id);
  const docSnap = await getDoc(docRef);

  const user = { ...docSnap.data(), id: docSnap.id };

    return user;

  
}

export{getUserById}


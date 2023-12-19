'use server'

import { db } from "@/lib/firebase";
import { auth } from "@/lib/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export async function checkIfUserProfileIsComplete() {
    const session = await auth();
    const isProfileComplete = session.user.isProfileComplete;
    if (!isProfileComplete) {
        return false;
    }
    return true;
};

export async function getUserData() {
    const session = await auth();
    if (!session) {
        return null;
    }
    return session.user;
};

export async function updateUserData(data) {
    const session = await auth();
    if (!session) {
        return null;
    }
    const userRef = await doc(db, "users", session.user.id);
    await updateDoc(userRef, data);
    return true;
};
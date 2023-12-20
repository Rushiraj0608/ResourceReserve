'use server'

import { db } from "@/lib/firebase";
import { auth } from "@/lib/auth";
import { query, where, doc, getDoc, getDocs, setDoc, updateDoc, collection } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

export async function checkIfUserProfileIsComplete() {
    const userData = await getUserData();
    if (!userData) {
        return false;
    }
    const isProfileComplete = userData.isProfileComplete;
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
    const userRef = await doc(db, "users", session.user.id);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    userData.id = session.user.id;
    return userData;
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

export async function loginUser(data) {
    try {
        const auth = getAuth();
        const { email, password } = data;
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return userCredential;
    } catch (error) {
        if (error.code === 'auth/invalid-credential') {
            throw new Error('Invalid email or password');
        } else {
            throw new Error('Login failed');
        }
    }
}

export async function registerUser(data) {
    try {
        const { email, password, username } = data;
        const auth = getAuth();
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const { user } = userCredential;
        if (user) {
            const userRef = await doc(db, "users", user.uid);
            await setDoc(userRef, {
                email: email,
                username: username,
                isProfileComplete: false,
            });
        }
        return true;
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            throw new Error('Email already in use');
        } else if (error.code === 'auth/invalid-email') {
            throw new Error('Invalid email address');
        } else if (error.code === 'auth/weak-password') {
            throw new Error('Password is too weak');
        } else {
            throw new Error('Registration failed');
        }
    }
}

export async function checkUsername(username) {
    const userRef = await collection(db, "users");
    const q = query(userRef, where("username", "==", username));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
        return false;
    }
    return true;
};
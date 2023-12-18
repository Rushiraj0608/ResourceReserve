import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

import AWS from "aws-sdk";
AWS.config.update({
  credentials: new AWS.Credentials(
    "AKIAUDTZ2EG4NN6OZRFT",
    "TkIdbjHsytTyp+SoURIS0GkFKwCuTPMbTHNVOGR7"
  ),
  region: "us-east-1",
});

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.AUTH_DOMAIN,
  projectId: process.env.PROJECT_ID,
  storageBucket: process.env.STORAGE_BUCKET,
  messagingSenderId: process.env.MESSAGE_SENDER_ID,
  appId: process.env.APP_ID,
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const s3 = new AWS.S3();
/**
 * // Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAUWtkLKABYt4qNn7fpAUmNv-1-S0QOTV8",
  authDomain: "tempproject-99d74.firebaseapp.com",
  projectId: "tempproject-99d74",
  storageBucket: "tempproject-99d74.appspot.com",
  messagingSenderId: "944392156015",
  appId: "1:944392156015:web:d20848b33e804435dfae9a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
 */

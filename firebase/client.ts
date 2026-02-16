// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps} from "firebase/app";
import {getAuth} from 'firebase/auth';
import {getFirestore} from 'firebase/firestore';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCXH0YrQ9KKkFhfb_BIYsoA99IIcdKyLDY",
    authDomain: "mockmate-e36d7.firebaseapp.com",
    projectId: "mockmate-e36d7",
    storageBucket: "mockmate-e36d7.firebasestorage.app",
    messagingSenderId: "336263586623",
    appId: "1:336263586623:web:38d703520ed2f3fb4e298a",
    measurementId: "G-NRP8HQ8DFT"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig):getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
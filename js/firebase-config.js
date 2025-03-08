import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDjVmZaaA-P0pjUbgGiyCww4TOb3S0pE7s",
    authDomain: "electric-vehicle-recharg-93e12.firebaseapp.com",
    projectId: "electric-vehicle-recharg-93e12",
    storageBucket: "electric-vehicle-recharg-93e12.firebasestorage.app",
    messagingSenderId: "830733817099",
    appId: "1:830733817099:web:70ce39c466f40ce9dbbe0e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

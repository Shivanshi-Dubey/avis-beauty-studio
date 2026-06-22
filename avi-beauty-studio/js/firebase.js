import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {

  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs

}

from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAXW3qDnx_4T3M6R-5nexsOy3fCkVjPNtI",
    authDomain: "avis-beauty-studio.firebaseapp.com",
    projectId: "avis-beauty-studio",
    storageBucket: "avis-beauty-studio.firebasestorage.app",
    messagingSenderId: "982683418526",
    appId: "1:982683418526:web:6aa5572993992e0090608f",
    measurementId: "G-XLQPN10VH8"
  };

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

window.db = db;

window.firebaseHelpers = {

    collection,
    addDoc,
    serverTimestamp,
    query,
    where,
    getDocs
  
  };

console.log("Firebase Connected Successfully");

export { db };
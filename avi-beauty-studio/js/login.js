import { initializeApp }

from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {

  getAuth,
  signInWithEmailAndPassword

}

from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const firebaseConfig = {

    apiKey: "AIzaSyAXW3qDnx_4T3M6R-5nexsOy3fCkVjPNtI",
    authDomain: "avis-beauty-studio.firebaseapp.com",
    projectId: "avis-beauty-studio",
    storageBucket: "avis-beauty-studio.firebasestorage.app",
    messagingSenderId: "982683418526",
    appId: "1:982683418526:web:6aa5572993992e0090608f",

};

const app =
initializeApp(firebaseConfig);

const auth =
getAuth(app);

window.loginAdmin =
async function(){

  const email =
  document.getElementById('adminEmail')
  .value.trim();

  const password =
  document.getElementById('adminPassword')
  .value.trim();

  const msg =
  document.getElementById('loginMsg');

  msg.textContent = '';

  if(!email || !password){

    msg.textContent =
    'Please fill all fields';

    return;

  }

  try{

    await signInWithEmailAndPassword(

      auth,
      email,
      password

    );

    window.location.href =
    'admin.html';

  }

  catch(err){

    console.error(err);

    msg.textContent =
    'Invalid admin credentials';

  }

};
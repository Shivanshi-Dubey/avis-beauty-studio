import { db } from './firebase.js';

import {

  collection,
  getDocs,
  deleteDoc,
  doc,
  updateDoc

}

from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {

  getAuth,
  onAuthStateChanged,
  signOut

}

from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";


const auth =
getAuth();

onAuthStateChanged(auth,(user)=>{

  if(!user){

    window.location.href =
    'login.html';

  }

});

const bookingContainer =
document.getElementById('bookingContainer');

async function loadBookings(){

  bookingContainer.innerHTML =
  "Loading bookings...";

  const querySnapshot =
  await getDocs(collection(db,"appointments"));

  bookingContainer.innerHTML = "";

  if(querySnapshot.empty){

    bookingContainer.innerHTML =
    `<div class="empty-state">No appointments yet. Bookings made on the website will appear here.</div>`;

    return;

  }

  querySnapshot.forEach((docSnap) => {

    const data = docSnap.data();

    bookingContainer.innerHTML += `

      <div class="booking-card">

        <h3>
          ${data.firstName || ''}
          ${data.lastName || ''}
        </h3>

        <div class="booking-row">
          <span>Phone:</span>
          ${data.phone || '-'}
        </div>

        <div class="booking-row">
          <span>Email:</span>
          ${data.email || '-'}
        </div>

        <div class="booking-row">
          <span>Service:</span>
          ${data.services || '-'}
        </div>

        <div class="booking-row">
          <span>Stylist:</span>
          ${data.staff || '-'}
        </div>

        <div class="booking-row">
          <span>Date:</span>
          ${data.date || '-'}
        </div>

        <div class="booking-row">
          <span>Time:</span>
          ${data.time || '-'}
        </div>

        <div class="booking-row">
          <span>Payment:</span>
          ${data.payment || '-'}
        </div>

        <div class="booking-row">

          <span>Status:</span>

          <span class="status-badge ${(data.status || 'pending').toLowerCase()}">

            ${data.status || 'Pending'}

          </span>

        </div>

        <div class="status-actions">

          <button
            class="status-btn confirm-btn"
            onclick="updateStatus('${docSnap.id}','Confirmed')">

            Confirm

          </button>

          <button
            class="status-btn complete-btn"
            onclick="updateStatus('${docSnap.id}','Completed')">

            Complete

          </button>

          <button
            class="status-btn cancel-btn"
            onclick="updateStatus('${docSnap.id}','Cancelled')">

            Cancel

          </button>

        </div>

        <button
          class="delete-btn"
          onclick="deleteBooking('${docSnap.id}')">

          Delete Booking

        </button>

      </div>

    `;

  });

}

window.updateStatus =
async function(id,status){

  const bookingRef =
  doc(db,"appointments",id);

  await updateDoc(bookingRef,{

    status:status

  });

  loadBookings();

};

window.deleteBooking =
async function(id){

  await deleteDoc(doc(db,"appointments",id));

  loadBookings();

};

window.logoutAdmin =
async function(){

  await signOut(auth);

  window.location.href =
  'login.html';

};

loadBookings();
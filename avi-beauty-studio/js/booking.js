/* ============================================================
   AVI'S BEAUTY STUDIO — booking.js
   Full booking modal logic:
   open/close · stepper · service picker · staff selection
   date/time builder · summary · confirm · success
   ============================================================ */


   window.initBookingSystem = function () {
    'use strict';
  
    /* ── Booking state object ── */
    const B = { services: [], staff: '', date: '', time: '' };
  
    /* ── Taken time slots (could be fetched from backend later) ── */
    const TAKEN_SLOTS = ['12:00', '12:30', '15:00', '17:30'];
  
    /* ── All available time slots ── */
    const ALL_SLOTS = [
      '10:00','10:30','11:00','11:30','12:00','12:30',
      '13:00','13:30','14:00','14:30','15:00','15:30',
      '16:00','16:30','17:00','17:30','18:00','18:30',
      '19:00','19:30'
    ];
  
    const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  
    /* ─────────────────────────────────────────
       OPEN / CLOSE
    ───────────────────────────────────────── */
    window.openModal = function (category, presetService) {
      document.getElementById('overlay').classList.add('open');
      document.body.style.overflow = 'hidden';

      const serviceSelect = document.getElementById('serviceSelect');
      const laserSelect = document.getElementById('laserServiceSelect');
      const svcHeading = document.getElementById('svcHeading');
      const presetNote = document.getElementById('presetServiceNote');

      if (presetService) {

        // Service already known (Package / Laser deal) — lock it in,
        // hide the pickers, skip straight to selecting a stylist.
        B.services = [presetService];

        if (serviceSelect) serviceSelect.style.display = 'none';
        if (laserSelect)   laserSelect.style.display = 'none';
        if (svcHeading) svcHeading.textContent = 'Your Selection';

        if (presetNote) {
          presetNote.style.display = 'block';
          presetNote.textContent = 'Booking: ' + presetService;
        }

      } else {

        B.services = [];
        if (presetNote) presetNote.style.display = 'none';

        if (category === 'laser') {
          if (serviceSelect) { serviceSelect.value = ''; serviceSelect.style.display = 'none'; }
          if (laserSelect)   { laserSelect.value = '';   laserSelect.style.display = 'block'; }
          if (svcHeading) svcHeading.textContent = 'Select Laser Treatment';
        } else {
          if (serviceSelect) { serviceSelect.value = ''; serviceSelect.style.display = 'block'; }
          if (laserSelect)   { laserSelect.value = '';   laserSelect.style.display = 'none'; }
          if (svcHeading) svcHeading.textContent = 'Select Services';
        }

      }

      buildDates();
      buildTimes();
    };
  
    window.closeModal = function () {
      document.getElementById('overlay').classList.remove('open');
      document.body.style.overflow = '';
  
      // Reset booking state
      B.services = []; B.staff = ''; B.date = ''; B.time = '';
  
      // Reset UI selections
      document.querySelectorAll('.svc-opt, .staff-c')
              .forEach(e => e.classList.remove('on'));
      const serviceSelect = document.getElementById('serviceSelect');
      const laserSelect = document.getElementById('laserServiceSelect');
      const presetNote = document.getElementById('presetServiceNote');
      if (serviceSelect) { serviceSelect.value = ''; serviceSelect.style.display = 'block'; }
      if (laserSelect) laserSelect.value = '';
      if (presetNote) presetNote.style.display = 'none';
  
      // Reset modal to initial state
      document.getElementById('mainBody').style.display = 'block';
      document.getElementById('processing').classList.remove('show');
      document.getElementById('successView').classList.remove('show');
      goPage(1, true);
    };
  
    // Close on backdrop click
    document.getElementById('overlay').addEventListener('click', function (e) {
      if (e.target === this) window.closeModal();
    });

  
    /* ─────────────────────────────────────────
       STEPPER / PAGE NAVIGATION
    ───────────────────────────────────────── */
    window.goPage = function (n, init) {
      for (let i = 1; i <= 4; i++) {
        document.getElementById('pg' + i).classList.remove('show');
        const stp = document.getElementById('stp' + i);
        stp.classList.remove('active', 'done');
        if      (i < n) stp.classList.add('done');
        else if (i === n) stp.classList.add('active');
      }
      document.getElementById('pg' + n).classList.add('show');
      if (n === 4 && !init) buildSummary();
    };

    /* ─────────────────────────────────────────
   STEP VALIDATIONS
───────────────────────────────────────── */

window.validateStep1 = function () {

    if (B.services.length === 0) {
      showToast('Please select at least one service');
      return;
    }
  
    if (!B.staff) {
      showToast('Please select a stylist');
      return;
    }
  
    goPage(2);
  };
  
  window.validateStep2 = function () {
  
    if (!B.date) {
      showToast('Please select a date');
      return;
    }
  
    if (!B.time) {
      showToast('Please select a time slot');
      return;
    }
  
    goPage(3);
  };
  
  window.validateStep3 = function () {
  
    const fname = document.getElementById('fname').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const email = document.getElementById('email').value.trim();
  
    const phoneRegex = /^\+1\s?[0-9]{3}\s?[0-9]{3}\s?[0-9]{4}$/;
  
    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    if (!fname) {
      showToast('Please enter your first name');
      return;
    }
  
    if (!phoneRegex.test(phone)) {
      showToast('Please enter valid 10 digit phone number');
      return;
    }
  
    if (!emailRegex.test(email)) {
      showToast('Please enter valid email address');
      return;
    }
  
    goPage(4);
  };
  
    /* ─────────────────────────────────────────
       SERVICE PICKER
    ───────────────────────────────────────── */
    window.toggleSvc = function (el, name) {
      el.classList.toggle('on');
      const idx = B.services.indexOf(name);
      if (idx > -1) B.services.splice(idx, 1);
      else           B.services.push(name);
    };
  
    window.pickServiceFromDropdown = function (el) {
      B.services = el.value ? [el.value] : [];
    };
  
    /* ─────────────────────────────────────────
       STAFF PICKER
    ───────────────────────────────────────── */
    window.pickStaff = function (el, name) {
      document.querySelectorAll('.staff-c').forEach(e => e.classList.remove('on'));
      el.classList.add('on');
      B.staff = name;
    };
  
    /* ─────────────────────────────────────────
       DATE STRIP BUILDER
    ───────────────────────────────────────── */
    function buildDates() {
      const strip = document.getElementById('dateStrip');
      strip.innerHTML = '';
      const today = new Date();
  
      for (let i = 0; i < 16; i++) {
        const d = new Date();
        d.setDate(today.getDate() + i);
  
        const cell = document.createElement('div');
        cell.className = 'd-cell';
        cell.innerHTML = `
          <div class="d-day">${DAYS[d.getDay()]}</div>
          <div class="d-num">${d.getDate()}</div>`;
  
        cell.addEventListener('click', () => {
          document.querySelectorAll('.d-cell').forEach(c => c.classList.remove('on'));
          cell.classList.add('on');
          B.date = d.toDateString();

buildTimes();
        });
  
        strip.appendChild(cell);
      }
    }
  
    /* ─────────────────────────────────────────
       TIME GRID BUILDER
    ───────────────────────────────────────── */
    async function buildTimes() {
      const grid = document.getElementById('timeGrid');
      grid.innerHTML = '';
      let bookedSlots = [];    
      if (B.date) {
        bookedSlots = await fetchBookedSlots(B.date);
      }
    
      ALL_SLOTS.forEach(t => {
        const el = document.createElement('div');
        const isTaken = bookedSlots.includes(t);
        el.className =
          't-slot' + (isTaken ? ' taken' : '');
        el.textContent = t;
        if (!isTaken) {
          el.addEventListener('click', () => {
            document
              .querySelectorAll('.t-slot')
              .forEach(s => s.classList.remove('on'))
            el.classList.add('on');
            B.time = t;
          });
        }
        grid.appendChild(el);
      });
    }
  
    async function fetchBookedSlots(selectedDate) {
      if (!selectedDate) return [];
      if (typeof window.getBookedSlots === 'function') {
        try {
          const remoteSlots = await window.getBookedSlots(selectedDate);
          if (Array.isArray(remoteSlots)) return remoteSlots;
        } catch (err) {
          console.error('Unable to load booked slots:', err);
        }
      }
      return TAKEN_SLOTS;
    }
  
    /* ─────────────────────────────────────────
       BOOKING SUMMARY BUILDER
    ───────────────────────────────────────── */
    function buildSummary() {
      const fname = document.getElementById('fname').value.trim();
      const lname = document.getElementById('lname').value.trim();
      const phone = document.getElementById('phone').value.trim();
  
      document.getElementById('summaryBox').innerHTML = `
        <div class="s-row"><label>Services</label><span>${B.services.length ? B.services.join(', ') : '—'}</span></div>
        <div class="s-row"><label>Stylist</label><span>${B.staff  || '—'}</span></div>
        <div class="s-row"><label>Date</label><span>${B.date   || '—'}</span></div>
        <div class="s-row"><label>Time</label><span>${B.time   || '—'}</span></div>
        <div class="s-row"><label>Name</label><span>${(fname + ' ' + lname).trim() || '—'}</span></div>
        <div class="s-row"><label>Phone</label><span>${phone || '—'}</span></div>`;
    }
  
    /* ─────────────────────────────────────────
       BOOKING CONFIRMATION & FIREBASE SAVE
       (payment step removed — confirmation via WhatsApp)
    ───────────────────────────────────────── */

window.confirmBooking = function () {

  // Show loading

  document.getElementById('mainBody')
    .style.display = 'none';

  document.getElementById('processing')
    .classList.add('show');

  (async () => {

    try {

      const fname =
        document.getElementById('fname')
        .value.trim();

      const lname =
        document.getElementById('lname')
        .value.trim();

      const phone =
        document.getElementById('phone')
        .value.trim();

      const email =
        document.getElementById('email')
        .value.trim();

      const bookingId =
        'ABS-' +
        Date.now().toString().slice(-8);

      // UNIQUE SLOT ID

      const slotId =
        B.date + "_" + B.time;

      // CHECK IF SLOT ALREADY BOOKED

      const existingBookings =
        await window.getBookedSlots(B.date);

      if(existingBookings.includes(B.time)){

        showToast(
          'This time slot is already booked.'
        );

        document.getElementById('processing')
          .classList.remove('show');

        document.getElementById('mainBody')
          .style.display = 'block';

        return;

      }

      // SAVE TO FIREBASE

      await window.firebaseHelpers.addDoc(

        window.firebaseHelpers.collection(
          window.db,
          'appointments'
        ),

        {

          bookingId,

          firstName: fname,

          lastName: lname,

          phone,

          email,

          services: B.services,

          staff: B.staff,

          date: B.date,

          time: B.time,

          status: 'Pending',

          slotId: slotId,

          createdAt:
            window.firebaseHelpers.serverTimestamp()

        }

      );

      // Hide loading

      document.getElementById('processing')
        .classList.remove('show');

      // Show booking ID

      document.getElementById('bkRef')
        .textContent =
        'Booking ID: ' + bookingId;

      // Show success

      document.getElementById('successView')
        .classList.add('show');

        const whatsappMessage =

`Hello Avi's Beauty Studio,
New Appointment Booking ✨
Name: ${fname} ${lname}
Phone: ${phone}
Service: ${B.services.join(', ')}
Stylist: ${B.staff}
Date: ${B.date}
Time: ${B.time}
Booking ID: ${bookingId}
`;

const whatsappURL =

`https://wa.me/16477176747?text=${encodeURIComponent(
  whatsappMessage
)}`;

window.open(
  whatsappURL,
  '_blank'
);

    }

    catch (err) {

      console.error(err);

      alert(
        'Booking failed. Please try again.'
      );

      document.getElementById('processing')
        .classList.remove('show');

      document.getElementById('mainBody')
        .style.display = 'block';

    }

  })();

};

window.getBookedSlots =
async function(selectedDate){

  const snapshot =
    await window.firebaseHelpers.getDocs(

      window.firebaseHelpers.query(

        window.firebaseHelpers.collection(
          window.db,
          'appointments'
        ),

        window.firebaseHelpers.where(
          'date',
          '==',
          selectedDate
        )

      )

    );

  const slots = [];

  snapshot.forEach(doc => {

    const data = doc.data();

    if(data.time){

      slots.push(data.time);

    }

  });

  return slots;

};

    /* ─────────────────────────────────────────
       PHONE AUTO PREFIX (+1)
    ───────────────────────────────────────── */
    function setupPhonePrefix(id) {
      const input = document.getElementById(id);
      if (!input) return;

      input.addEventListener('focus', function () {
        if (!this.value) this.value = '+1 ';
      });

      input.addEventListener('input', function () {
        if (!this.value.startsWith('+1')) {
          this.value = '+1 ' + this.value.replace(/^\+?1?\s?/, '');
        }
      });
    }

    setupPhonePrefix('phone');
    setupPhonePrefix('contactPhone');

    /* ─────────────────────────────────────────
   TOAST NOTIFICATION
───────────────────────────────────────── */

function showToast(message) {
    let toast = document.querySelector('.toast-msg');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'toast-msg';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show-toast');
    setTimeout(() => {
      toast.classList.remove('show-toast');
    }, 2600);
  }
};
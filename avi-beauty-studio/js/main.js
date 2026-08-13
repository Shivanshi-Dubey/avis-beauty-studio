/* Avi's Beauty Studio — v2 interactions (self-contained, no external deps) */

document.addEventListener('DOMContentLoaded', () => {

    /* ---------- Loader ---------- */
    window.addEventListener('load', () => {
      const l = document.getElementById('luxLoader');
      if (l) setTimeout(() => l.classList.add('hide'), 500);
    });
  
    /* ---------- Mobile nav ---------- */
    const ham = document.getElementById('ham');
    const navLinks = document.getElementById('navLinks');
    ham?.addEventListener('click', () => navLinks.classList.toggle('open'));
  
    /* ---------- Hero slideshow ---------- */
    const slides = [...document.querySelectorAll('.hero-arch img')];
    const dots = [...document.querySelectorAll('.hero-dots .dot')];
    let cur = 0;
    function goSlide(i){
      slides[cur]?.classList.remove('active');
      dots[cur]?.classList.remove('active');
      cur = i;
      slides[cur]?.classList.add('active');
      dots[cur]?.classList.add('active');
    }
    dots.forEach((d,i) => d.addEventListener('click', () => goSlide(i)));
    if (slides.length) setInterval(() => goSlide((cur+1) % slides.length), 5000);
  
    /* ---------- Animated counters ---------- */
    const counters = document.querySelectorAll('[data-count]');
    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const target = +el.dataset.count;
        const suffix = el.dataset.suffix || '';
        let cur = 0;
        const step = Math.max(1, Math.ceil(target/60));
        const tick = () => {
          cur += step;
          if (cur >= target){ el.textContent = target + suffix; return; }
          el.textContent = cur + suffix;
          requestAnimationFrame(tick);
        };
        tick();
        counterObserver.unobserve(el);
      });
    }, { threshold: .6 });
    counters.forEach(c => counterObserver.observe(c));
  
    /* ---------- Scroll reveal ---------- */
    const revealEls = document.querySelectorAll('[data-reveal], .svc-card, .deal-card');
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting){ e.target.classList.add('show-reveal'); revealObserver.unobserve(e.target); } });
    }, { threshold: .15 });
    revealEls.forEach(el => revealObserver.observe(el));
  
    /* ---------- Service accordion ---------- */
    window.toggleCategory = (h3) => h3.closest('.svc-card')?.classList.toggle('open');
  
    /* ---------- Testimonial slider ---------- */
    const track = document.getElementById('testiTrack');
    const testiDotsWrap = document.getElementById('testiDots');
    if (track){
      const total = track.children.length;
      let t = 0;
      testiDotsWrap.innerHTML = [...Array(total)].map((_,i)=>`<div class="dot ${i===0?'active':''}" data-i="${i}"></div>`).join('');
      const tDots = [...testiDotsWrap.children];
      function goTesti(i){
        t = (i+total) % total;
        track.style.transform = `translateX(-${t*100}%)`;
        tDots.forEach((d,idx)=>d.classList.toggle('active', idx===t));
      }
      tDots.forEach(d => d.addEventListener('click', () => goTesti(+d.dataset.i)));
      document.querySelector('.testi-arrow.prev')?.addEventListener('click', () => goTesti(t-1));
      document.querySelector('.testi-arrow.next')?.addEventListener('click', () => goTesti(t+1));
      setInterval(() => goTesti(t+1), 6000);
    }
  
    /* ---------- Music player (fails silently if no audio file) ---------- */
    const musicBtn = document.getElementById('musicToggle');
    const audioEl = document.getElementById('bgMusic');
    const musicLabel = document.getElementById('musicLabel');
    musicBtn?.addEventListener('click', () => {
      if (!audioEl) return;
      if (audioEl.paused){
        audioEl.play().catch(()=>{});
        musicBtn.classList.add('playing');
        musicLabel.textContent = 'Pause Music';
      } else {
        audioEl.pause();
        musicBtn.classList.remove('playing');
        musicLabel.textContent = 'Play Music';
      }
    });
  
    /* ---------- Cursor glow ---------- */
    const glow = document.querySelector('.cursor-glow');
    window.addEventListener('mousemove', (e) => {
      if (glow){ glow.style.left = e.clientX+'px'; glow.style.top = e.clientY+'px'; }
    });
  
    /* ---------- Newsletter + contact forms (front-end only demo) ---------- */
    document.getElementById('newsletterForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      showToast("You're on the list — thank you!");
      e.target.reset();
    });
    document.getElementById('contactSubmit')?.addEventListener('click', () => {
      const name = document.getElementById('contactName').value.trim();
      const msg = document.getElementById('contactMessage').value.trim();
      if (!name || !msg){ showToast('Please fill in your name and message.'); return; }
      showToast('Message sent — we\'ll be in touch shortly!');
      document.getElementById('contactForm').querySelectorAll('input,textarea').forEach(i=>i.value='');
    });
  
    function showToast(text){
      let t = document.querySelector('.toast-msg');
      if (!t){ t = document.createElement('div'); t.className='toast-msg'; document.body.appendChild(t); }
      t.textContent = text;
      t.classList.add('show-toast');
      setTimeout(()=>t.classList.remove('show-toast'), 3200);
    }
  
    /* =====================================================
       BOOKING MODAL
       ===================================================== */
    const overlay = document.getElementById('overlay');
    let booking = { services:[], staff:'', date:'', time:'', preset:null };
  
    window.openModal = (preset, dealName) => {
      overlay.classList.add('open');
      resetBooking();
      if (dealName){
        booking.preset = dealName;
        document.getElementById('presetServiceNote').style.display = 'block';
        document.getElementById('presetServiceNote').textContent = `Booking package: ${dealName}`;
      }
      goPage(1);
    };
    window.closeModal = () => {
      overlay.classList.remove('open');
    };
    overlay?.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  
    function resetBooking(){
      booking = { services:[], staff:'', date:'', time:'', preset:booking.preset };
      document.querySelectorAll('.svc-opt.on,.staff-c.on,.d-cell.on,.t-slot.on').forEach(el=>el.classList.remove('on'));
      document.getElementById('serviceSelect').value = '';
      document.getElementById('presetServiceNote').style.display = 'none';
      buildDateStrip();
      document.getElementById('mainBody').style.display = 'block';
      document.getElementById('processing').classList.remove('show');
      document.getElementById('successView').classList.remove('show');
    }
  
    function goPage(n){
      document.querySelectorAll('.pg').forEach(p=>p.classList.remove('show'));
      document.getElementById('pg'+n).classList.add('show');
      document.querySelectorAll('.step').forEach((s,i)=>{
        s.classList.toggle('active', i === n-1);
        s.classList.toggle('done', i < n-1);
      });
    }
  
    window.toggleSvc = (el, name) => {
      el.classList.toggle('on');
      if (booking.services.includes(name)) booking.services = booking.services.filter(s=>s!==name);
      else booking.services.push(name);
    };
    window.pickServiceFromDropdown = (sel) => {
      const val = sel.value;
      document.querySelectorAll('.svc-pick .svc-opt').forEach(o=>{
        if (o.textContent.trim() === val) o.classList.add('on');
      });
      if (val && !booking.services.includes(val)) booking.services.push(val);
    };
    window.pickStaff = (el, name) => {
      document.querySelectorAll('.staff-c').forEach(c=>c.classList.remove('on'));
      el.classList.add('on');
      booking.staff = name;
    };
    window.validateStep1 = () => {
      if (!booking.services.length && !booking.preset){ showToast('Please choose at least one service.'); return; }
      if (!booking.staff){ showToast('Please choose a stylist.'); return; }
      goPage(2);
    };
  
    function buildDateStrip(){
      const strip = document.getElementById('dateStrip');
      strip.innerHTML = '';
      const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      const today = new Date();
      for (let i=0;i<14;i++){
        const d = new Date(today); d.setDate(today.getDate()+i);
        const cell = document.createElement('div');
        cell.className = 'd-cell';
        cell.innerHTML = `<div>${days[d.getDay()]}</div><strong>${d.getDate()}</strong>`;
        cell.onclick = () => {
          document.querySelectorAll('.d-cell').forEach(c=>c.classList.remove('on'));
          cell.classList.add('on');
          booking.date = `${days[d.getDay()]}, ${d.toLocaleDateString(undefined,{month:'short',day:'numeric'})}`;
          buildTimeGrid();
        };
        strip.appendChild(cell);
      }
    }
    function buildTimeGrid(){
      const grid = document.getElementById('timeGrid');
      const times = ['10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM'];
      grid.innerHTML = times.map(t=>`<div class="t-slot">${t}</div>`).join('');
      grid.querySelectorAll('.t-slot').forEach(el=>{
        el.onclick = () => {
          grid.querySelectorAll('.t-slot').forEach(s=>s.classList.remove('on'));
          el.classList.add('on');
          booking.time = el.textContent;
        };
      });
    }
    window.validateStep2 = () => {
      if (!booking.date || !booking.time){ showToast('Please choose a date and time.'); return; }
      goPage(3);
    };
    window.validateStep3 = () => {
      const fn = document.getElementById('fname').value.trim();
      const ln = document.getElementById('lname').value.trim();
      const ph = document.getElementById('phone').value.trim();
      if (!fn || !ln || !ph){ showToast('Please fill in your name and phone number.'); return; }
      booking.fname = fn; booking.lname = ln; booking.phone = ph;
      booking.email = document.getElementById('email').value.trim();
      renderSummary();
      goPage(4);
    };
    function renderSummary(){
      const box = document.getElementById('summaryBox');
      const svc = booking.preset ? booking.preset : booking.services.join(', ');
      box.innerHTML = `
        <div class="s-row"><span>Service</span><strong>${svc || '—'}</strong></div>
        <div class="s-row"><span>Stylist</span><strong>${booking.staff}</strong></div>
        <div class="s-row"><span>Date</span><strong>${booking.date}</strong></div>
        <div class="s-row"><span>Time</span><strong>${booking.time}</strong></div>
        <div class="s-row"><span>Name</span><strong>${booking.fname} ${booking.lname}</strong></div>
        <div class="s-row"><span>Phone</span><strong>${booking.phone}</strong></div>
      `;
    }
    window.confirmBooking = () => {
      document.getElementById('mainBody').style.display = 'none';
      document.getElementById('processing').classList.add('show');
      setTimeout(() => {
        document.getElementById('processing').classList.remove('show');
        document.getElementById('successView').classList.add('show');
        const ref = 'AB' + Math.floor(100000+Math.random()*900000);
        document.getElementById('bkRef').textContent = `Confirmation #${ref} — see you soon!`;
        // NOTE: hook this up to Firebase Firestore to persist real bookings.
      }, 1400);
    };
  
  });
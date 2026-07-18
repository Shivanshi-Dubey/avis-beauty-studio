/* ============================================================
   AVI'S BEAUTY STUDIO — script.js
   General UI:
   navbar toggle · mobile nav · smooth scroll · navbar effects
   ============================================================ */

   (function () {

    'use strict';
  
    /* ─────────────────────────────────────────
       ELEMENTS
    ───────────────────────────────────────── */
  
    const navLinks = document.getElementById('navLinks');
    const navbar  = document.getElementById('navbar');

    if (!navbar) return;
  
    /* ─────────────────────────────────────────
       MOBILE NAV TOGGLE
    ───────────────────────────────────────── */
  
    window.toggleNav = function () {
  
      navLinks.classList.toggle('mob-open');
  
    };
  
    /* ─────────────────────────────────────────
       CLOSE MOBILE NAV ON LINK CLICK
    ───────────────────────────────────────── */
  
    document.querySelectorAll('.nav-links a').forEach(link => {
  
      link.addEventListener('click', () => {
  
        navLinks.classList.remove('mob-open');
  
      });
  
    });
  
    /* ─────────────────────────────────────────
       NAVBAR SCROLL EFFECT
    ───────────────────────────────────────── */
  
    window.addEventListener('scroll', () => {

      if (window.scrollY > 60) {
        navbar.style.boxShadow = '0 8px 32px rgba(0,0,0,.35)';
        navbar.style.background = 'rgba(11,11,12,.92)';
        navbar.style.borderBottomColor = 'rgba(212,175,55,.18)';
      } else {
        navbar.style.boxShadow = 'none';
        navbar.style.background = 'rgba(11,11,12,.72)';
        navbar.style.borderBottomColor = 'rgba(212,175,55,.12)';
      }

    });

    const sections = document.querySelectorAll('section[id]');

    const setActiveNav = () => {

      let current = 'home';

      sections.forEach(section => {

        const top = section.offsetTop - 120;
        const height = section.offsetHeight;

        if (window.scrollY >= top && window.scrollY < top + height) {
          current = section.getAttribute('id');
        }

      });

      document.querySelectorAll('.nav-links a').forEach(link => {

        link.classList.remove('active');
        const href = link.getAttribute('href');

        if (href === `#${current}` || (current === 'home' && href === '#home')) {
          link.classList.add('active');
        }

      });

    };

    window.addEventListener('scroll', setActiveNav);
    setActiveNav();
  
    /* ─────────────────────────────────────────
       SMOOTH SCROLL
    ───────────────────────────────────────── */
  
    function smoothScrollTo(targetY, duration) {

      const startY = window.scrollY;
      const distance = targetY - startY;
      const startTime = performance.now();

      function easeInOutCubic(t) {
        return t < 0.5
          ? 4 * t * t * t
          : 1 - Math.pow(-2 * t + 2, 3) / 2;
      }

      function step(currentTime) {

        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeInOutCubic(progress);

        window.scrollTo(0, startY + distance * eased);

        if (progress < 1) {
          requestAnimationFrame(step);
        }

      }

      requestAnimationFrame(step);

    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  
      anchor.addEventListener('click', function (e) {
  
        const targetId = this.getAttribute('href');
  
        if (targetId === '#') return;
  
        const target = document.querySelector(targetId);
  
        if (!target) return;
  
        e.preventDefault();

        const navHeight = document.getElementById('navbar')?.offsetHeight || 0;
        const targetY = target.getBoundingClientRect().top + window.scrollY - navHeight;

        // duration scales gently with distance so short hops stay quick
        // and long jumps (Home -> Contact) don't feel abrupt
        const distance = Math.abs(targetY - window.scrollY);
        const duration = Math.min(1600, Math.max(500, distance * 0.6));

        smoothScrollTo(targetY, duration);
  
      });
  
    });

    const revealEls = document.querySelectorAll(
      '.svc-card,.deal-card,.testi-card,.g-item,.owner-box,.hours-box,.about-founder,.about-highlight'
    );
    
    const revealOnScroll = () => {
    
      revealEls.forEach(el => {
    
        const top = el.getBoundingClientRect().top;
    
        if(top < window.innerHeight - 80){
    
          el.classList.add('show-reveal');
    
        }
    
      });
    
    };
    
    window.addEventListener('scroll', revealOnScroll);
    
    revealOnScroll();

    const glow =
document.querySelector('.cursor-glow');

if(glow){

  document.addEventListener('mousemove', e => {

    glow.style.left =
    e.clientX + 'px';

    glow.style.top =
    e.clientY + 'px';

  });

}

/* ─────────────────────────────────────────
   PREMIUM LOADER
───────────────────────────────────────── */

window.addEventListener('load',()=>{

  const loader =
  document.getElementById('luxLoader');

  if(loader){
    setTimeout(()=>{
      loader.classList.add('hide');
    },1800);
  }

  if(new URLSearchParams(window.location.search).get('book') === '1'){
    if(typeof window.openModal === 'function'){
      setTimeout(()=> window.openModal(), 400);
    }
  }

});

    /* ─────────────────────────────────────────
       CONTACT FORM
    ───────────────────────────────────────── */

    const contactSubmit = document.getElementById('contactSubmit');

    if(contactSubmit){

      contactSubmit.addEventListener('click', () => {

        const name = document.getElementById('contactName')?.value.trim();
        const phone = document.getElementById('contactPhone')?.value.trim();
        const email = document.getElementById('contactEmail')?.value.trim();
        const message = document.getElementById('contactMessage')?.value.trim();

        if(!name || !phone || !message){
          alert('Please fill in your name, phone and message.');
          return;
        }

        const text = encodeURIComponent(
          `Hi Avi's Beauty Studio,\n\n` +
          `Name: ${name}\n` +
          `Phone: ${phone}\n` +
          (email ? `Email: ${email}\n` : '') +
          `\nMessage: ${message}`
        );

        window.open(`https://wa.me/16477176747?text=${text}`, '_blank');
      });

    }

    /* ─────────────────────────────────────────
       SERVICES ACCORDION
       (click a category heading to expand/collapse it,
       so the page doesn't force one long endless scroll)
    ───────────────────────────────────────── */

    window.toggleCategory = function (heading) {

      const card = heading.closest('.svc-card');
      if (!card) return;

      const isOpen = card.classList.contains('open');

      // collapse all cards first
      document.querySelectorAll('.svc-card').forEach(c => c.classList.remove('open'));

      // if it wasn't already open, open it now
      if (!isOpen) card.classList.add('open');

    };
  
  })();
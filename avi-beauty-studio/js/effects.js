/* ============================================================
   AVI'S BEAUTY STUDIO — effects.js
   Stat counters · music player · gallery slideshow ·
   testimonial carousel · scroll reveals · parallax
   ============================================================ */

(function () {
  'use strict';

  /* ── ANIMATED STAT COUNTERS ── */
  const counters = document.querySelectorAll('[data-count]');

  if (counters.length) {

    const animateCounter = (el) => {

      const target = parseInt(el.dataset.count, 10) || 0;
      const suffix = el.dataset.suffix || '';
      const duration = 1600;
      const startTime = performance.now();

      function tick(now) {

        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const value = Math.round(eased * target);

        el.textContent = value + suffix;

        if (progress < 1) {
          requestAnimationFrame(tick);
        }

      }

      requestAnimationFrame(tick);

    };

    if ('IntersectionObserver' in window) {

      const counterObserver = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

          if (entry.isIntersecting && !entry.target.dataset.counted) {
            entry.target.dataset.counted = 'true';
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }

        });

      }, { threshold: 0.4 });

      counters.forEach(el => counterObserver.observe(el));

    } else {
      counters.forEach(animateCounter);
    }

  }

  /* ── BACKGROUND MUSIC PLAYER ── */
  const audio      = document.getElementById('bgMusic');
  const toggleBtn  = document.getElementById('musicToggle');
  const musicLabel = document.getElementById('musicLabel');

  if (audio && toggleBtn) {

    const setPlayingUI = (isPlaying) => {
      toggleBtn.classList.toggle('playing', isPlaying);
      toggleBtn.setAttribute('aria-label', isPlaying ? 'Pause background music' : 'Play background music');
      if (musicLabel) musicLabel.textContent = isPlaying ? 'Pause Music' : 'Play Music';
    };

    toggleBtn.addEventListener('click', () => {

      if (audio.paused) {
        audio.play()
          .then(() => {
            setPlayingUI(true);
            sessionStorage.setItem('absMusicPlaying', '1');
          })
          .catch(() => setPlayingUI(false));
      } else {
        audio.pause();
        setPlayingUI(false);
        sessionStorage.setItem('absMusicPlaying', '0');
      }

    });

    if (sessionStorage.getItem('absMusicPlaying') === '1') {
      audio.play()
        .then(() => setPlayingUI(true))
        .catch(() => setPlayingUI(false));
    }

  }

  /* ── GALLERY SLIDESHOW ── */
  const gsRoot = document.getElementById('gallerySlideshow');

  if (gsRoot) {

    const gsSlides  = gsRoot.querySelectorAll('.gs-slide');
    const gsThumbs  = gsRoot.querySelectorAll('.gs-thumb');
    const gsPrevBtn = document.getElementById('gsPrev');
    const gsNextBtn = document.getElementById('gsNext');
    const gsBar     = document.getElementById('gsProgressBar');

    let gsIndex = 0;
    let gsTimer = null;
    const GS_DURATION = 4500;

    function gsGoTo(n) {

      gsIndex = (n + gsSlides.length) % gsSlides.length;

      gsSlides.forEach(s => s.classList.remove('active'));
      gsThumbs.forEach(t => t.classList.remove('active'));

      gsSlides[gsIndex].classList.add('active');
      gsThumbs[gsIndex].classList.add('active');

      gsRestartProgress();

    }

    function gsRestartProgress() {

      if (!gsBar) return;
      gsBar.classList.remove('animating');
      void gsBar.offsetWidth;
      gsBar.classList.add('animating');

    }

    function gsStartAutoplay() {

      clearInterval(gsTimer);
      gsRestartProgress();

      gsTimer = setInterval(() => {
        gsGoTo(gsIndex + 1);
      }, GS_DURATION);

    }

    function gsStopAutoplay() {
      clearInterval(gsTimer);
      if (gsBar) gsBar.classList.remove('animating');
    }

    if (gsPrevBtn) gsPrevBtn.addEventListener('click', () => { gsGoTo(gsIndex - 1); gsStartAutoplay(); });
    if (gsNextBtn) gsNextBtn.addEventListener('click', () => { gsGoTo(gsIndex + 1); gsStartAutoplay(); });

    gsThumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        gsGoTo(parseInt(thumb.dataset.index, 10));
        gsStartAutoplay();
      });
    });

    gsRoot.addEventListener('mouseenter', gsStopAutoplay);
    gsRoot.addEventListener('mouseleave', gsStartAutoplay);

    gsStartAutoplay();

  }

  /* ── TESTIMONIAL CAROUSEL ── */
  const testiTrack = document.getElementById('testiTrack');
  const testiDotsWrap = document.getElementById('testiDots');
  const testiPrev = document.getElementById('testiPrev');
  const testiNext = document.getElementById('testiNext');

  if (testiTrack && testiDotsWrap) {

    const slides = testiTrack.querySelectorAll('.testi-slide');
    const total = slides.length;
    let tIndex = 0;
    let testiTimer = null;

    testiDotsWrap.innerHTML = [...Array(total)].map((_, i) =>
      `<button type="button" class="tdot ${i === 0 ? 'active' : ''}" data-i="${i}" aria-label="Review ${i + 1}"></button>`
    ).join('');

    const tDots = [...testiDotsWrap.querySelectorAll('.tdot')];

    function goTesti(i) {

      tIndex = (i + total) % total;
      testiTrack.style.transform = `translateX(-${tIndex * 100}%)`;
      tDots.forEach((d, idx) => d.classList.toggle('active', idx === tIndex));

    }

    function startTestiAutoplay() {

      clearInterval(testiTimer);
      testiTimer = setInterval(() => goTesti(tIndex + 1), 6000);

    }

    tDots.forEach(d => d.addEventListener('click', () => {
      goTesti(parseInt(d.dataset.i, 10));
      startTestiAutoplay();
    }));

    testiPrev?.addEventListener('click', () => {
      goTesti(tIndex - 1);
      startTestiAutoplay();
    });

    testiNext?.addEventListener('click', () => {
      goTesti(tIndex + 1);
      startTestiAutoplay();
    });

    startTestiAutoplay();

  }

  /* ── SCROLL REVEAL (data-reveal elements) ── */
  const revealEls = document.querySelectorAll('[data-reveal]');

  if (revealEls.length && 'IntersectionObserver' in window) {

    const revealObserver = new IntersectionObserver((entries) => {

      entries.forEach(entry => {

        if (entry.isIntersecting) {
          entry.target.classList.add('show-reveal');
          revealObserver.unobserve(entry.target);
        }

      });

    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));

  }

  /* ── HERO PARALLAX (subtle) ── */
  const heroSection = document.querySelector('.hero');

  if (heroSection && window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {

    window.addEventListener('scroll', () => {

      const scrollY = window.scrollY;
      const heroBody = heroSection.querySelector('.hero-body');

      if (scrollY < window.innerHeight && heroBody) {
        heroBody.style.transform = `translateY(${scrollY * 0.18}px)`;
        heroBody.style.opacity = String(Math.max(0, 1 - scrollY / (window.innerHeight * 0.85)));
      }

    }, { passive: true });

  }

  /* ── NAVBAR SCROLL SHRINK ── */
  const navbar = document.getElementById('navbar');

  if (navbar) {

    window.addEventListener('scroll', () => {

      if (window.scrollY > 100) {
        navbar.classList.add('nav-scrolled');
      } else {
        navbar.classList.remove('nav-scrolled');
      }

    }, { passive: true });

  }

})();

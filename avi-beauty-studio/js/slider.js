/* ============================================================
   AVI'S BEAUTY STUDIO — slider.js
   Hero slideshow with per-slide text sync
   ============================================================ */

(function () {

  'use strict';

  let curSlide = 0;

  const slides   = document.querySelectorAll('.hero-slide');
  const dots     = document.querySelectorAll('#dots .dot');
  const heroBody = document.querySelector('.hero-body');
  const heroTag  = document.getElementById('heroTag');
  const heroTitle = document.getElementById('heroTitle');
  const heroSub  = document.getElementById('heroSub');
  const heroPrev = document.getElementById('heroPrev');
  const heroNext = document.getElementById('heroNext');

  if (!slides.length || !dots.length) return;

  function updateHeroText(index) {

    const slide = slides[index];
    if (!slide) return;

    if (heroTag && slide.dataset.tag) {
      heroTag.textContent = slide.dataset.tag.replace(/&amp;/g, '&');
    }

    if (heroTitle && slide.dataset.title) {
      heroTitle.innerHTML = slide.dataset.title;
    }

    if (heroSub && slide.dataset.sub) {
      heroSub.innerHTML = slide.dataset.sub;
    }

    if (heroBody) {
      heroBody.classList.remove('text-animate');
      void heroBody.offsetWidth;
      heroBody.classList.add('text-animate');
    }

  }

  function goSlide(n) {

    slides[curSlide].classList.remove('active');
    dots[curSlide].classList.remove('active');

    curSlide = (n + slides.length) % slides.length;

    slides[curSlide].classList.add('active');
    dots[curSlide].classList.add('active');

    updateHeroText(curSlide);

  }

  let sliderInterval = setInterval(() => {
    goSlide(curSlide + 1);
  }, 5500);

  function resetAutoplay() {

    clearInterval(sliderInterval);

    sliderInterval = setInterval(() => {
      goSlide(curSlide + 1);
    }, 5500);

  }

  dots.forEach((dot, index) => {

    dot.addEventListener('click', () => {
      goSlide(index);
      resetAutoplay();
    });

  });

  heroPrev?.addEventListener('click', () => {
    goSlide(curSlide - 1);
    resetAutoplay();
  });

  heroNext?.addEventListener('click', () => {
    goSlide(curSlide + 1);
    resetAutoplay();
  });

  /* ── MOBILE SWIPE ── */
  let startX = 0;
  const hero = document.querySelector('.hero');

  if (hero) {

    hero.addEventListener('touchstart', e => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    hero.addEventListener('touchend', e => {

      const endX = e.changedTouches[0].clientX;

      if (startX - endX > 50) {
        goSlide(curSlide + 1);
        resetAutoplay();
      } else if (endX - startX > 50) {
        goSlide(curSlide - 1);
        resetAutoplay();
      }

    });

  }

  document.addEventListener('visibilitychange', () => {

    if (document.hidden) {
      clearInterval(sliderInterval);
    } else {
      resetAutoplay();
    }

  });

  window.goSlide = function (n) {
    goSlide(n);
    resetAutoplay();
  };

  updateHeroText(0);

})();

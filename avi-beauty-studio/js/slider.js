/* ============================================================
   AVI'S BEAUTY STUDIO — slider.js
   Hero slideshow / carousel logic
   ============================================================ */

   (function () {

    'use strict';
  
    let curSlide = 0;
  
    const slides = document.querySelectorAll('.hero-slide');
    const dots   = document.querySelectorAll('.dot');
  
    /* ─────────────────────────────────────────
       SAFETY CHECK
    ───────────────────────────────────────── */
  
    if (!slides.length || !dots.length) return;
  
    /* ─────────────────────────────────────────
       GO TO SLIDE
    ───────────────────────────────────────── */
  
    function goSlide(n) {
  
      slides[curSlide].classList.remove('active');
      dots[curSlide].classList.remove('active');
  
      curSlide = (n + slides.length) % slides.length;
  
      slides[curSlide].classList.add('active');
      dots[curSlide].classList.add('active');
  
    }
  
    /* ─────────────────────────────────────────
       AUTO PLAY
    ───────────────────────────────────────── */
  
    let sliderInterval = setInterval(() => {
  
      goSlide(curSlide + 1);
  
    }, 5000);
  
    /* ─────────────────────────────────────────
       RESET AUTOPLAY
    ───────────────────────────────────────── */
  
    function resetAutoplay() {
  
      clearInterval(sliderInterval);
  
      sliderInterval = setInterval(() => {
  
        goSlide(curSlide + 1);
  
      }, 5000);
  
    }
  
    /* ─────────────────────────────────────────
       DOT CLICK EVENTS
    ───────────────────────────────────────── */
  
    dots.forEach((dot, index) => {
  
      dot.addEventListener('click', () => {
  
        goSlide(index);
  
        resetAutoplay();
  
      });
  
    });
  
    /* ─────────────────────────────────────────
       MOBILE SWIPE SUPPORT
    ───────────────────────────────────────── */
  
    let startX = 0;
  
    const hero = document.querySelector('.hero');
  
    if (hero) {
  
      hero.addEventListener('touchstart', e => {
  
        startX = e.touches[0].clientX;
  
      });
  
      hero.addEventListener('touchend', e => {
  
        const endX = e.changedTouches[0].clientX;
  
        if (startX - endX > 50) {
  
          goSlide(curSlide + 1);
  
          resetAutoplay();
  
        }
  
        else if (endX - startX > 50) {
  
          goSlide(curSlide - 1);
  
          resetAutoplay();
  
        }
  
      });
  
    }
  
    /* ─────────────────────────────────────────
       PAUSE WHEN TAB INACTIVE
    ───────────────────────────────────────── */
  
    document.addEventListener('visibilitychange', () => {
  
      if (document.hidden) {
  
        clearInterval(sliderInterval);
  
      }
  
      else {
  
        resetAutoplay();
  
      }
  
    });
  
    /* ─────────────────────────────────────────
       EXPOSE GLOBALLY
    ───────────────────────────────────────── */
  
    window.goSlide = function (n) {
  
      goSlide(n);
  
      resetAutoplay();
  
    };
  
  })();
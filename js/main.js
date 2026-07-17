(function () {
  'use strict';

  var root = document.documentElement;
  var STORAGE_KEY = 'preferred-lang';

  function applyLang(lang) {
    root.setAttribute('data-lang', lang);
    root.setAttribute('lang', lang);
    root.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  }

  function initLang() {
    var stored = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    applyLang(stored === 'ar' || stored === 'en' ? stored : 'en');
  }

  function toggleLang() {
    var next = root.getAttribute('data-lang') === 'en' ? 'ar' : 'en';
    applyLang(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch (e) {}
  }

  initLang();

  var langBtn = document.getElementById('langToggle');
  if (langBtn) langBtn.addEventListener('click', toggleLang);

  // Mobile nav toggle
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');

  function closeNav() {
    navToggle.classList.remove('open');
    navLinks.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('open');
      navToggle.classList.toggle('open', isOpen);
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeNav);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNav();
    });
  }

  // Header scrolled state
  var header = document.getElementById('siteHeader');
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 8);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Reveal on scroll
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }

  // Active nav link on scroll
  var sections = document.querySelectorAll('main section[id]');
  var navLinkMap = {};
  document.querySelectorAll('.nav-link').forEach(function (link) {
    var id = link.getAttribute('href').replace('#', '');
    navLinkMap[id] = link;
  });

  if ('IntersectionObserver' in window && sections.length) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          var link = navLinkMap[entry.target.id];
          if (!link) return;
          if (entry.isIntersecting) {
            Object.keys(navLinkMap).forEach(function (id) {
              navLinkMap[id].classList.remove('active');
            });
            link.classList.add('active');
          }
        });
      },
      { threshold: 0.4 }
    );
    sections.forEach(function (s) { navObserver.observe(s); });
  }
})();

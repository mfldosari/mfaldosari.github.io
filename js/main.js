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

    navLinks.querySelectorAll('button').forEach(function (link) {
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

  // ---------------- The Helm (steering wheel) ----------------
  var sections = [
    { id: 'title', en: 'Title', ar: 'الرئيسية', icon: 'M12 3l2 5 5 .5-4 3.5 1.2 5-4.2-2.7L7.8 17l1.2-5-4-3.5L10 8z' },
    { id: 'about', en: 'About', ar: 'نبذة عني', icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0' },
    { id: 'skills', en: 'Skills', ar: 'المهارات', icon: 'M4 6h16M4 12h16M4 18h10' },
    { id: 'projects', en: 'Projects', ar: 'المشاريع', icon: 'M3 7h18M3 7v11h18V7M3 7l3-4h12l3 4' },
    { id: 'certifications', en: 'Certifications', ar: 'الشهادات', icon: 'M12 2 20 6v6c0 5-3.4 7.7-8 10-4.6-2.3-8-5-8-10V6Z' },
    { id: 'contact', en: 'Contact', ar: 'تواصل', icon: 'M3.5 6.5h17v11h-17zM3.5 6.5l8.5 6.5 8.5-6.5' }
  ];

  var labelRing = document.getElementById('labelRing');
  var spokes = document.getElementById('spokes');
  var helmWrap = document.getElementById('helmWrap');
  var disc = document.getElementById('disc');
  var panels = document.querySelectorAll('.panel');
  var n = sections.length;
  var currentRot = 0;
  var spinning = false;

  if (labelRing && spokes && helmWrap && disc) {
    sections.forEach(function (s, i) {
      var angle = (360 / n) * i; // 0 = top
      var rad = angle * Math.PI / 180;

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'helm-label';
      btn.setAttribute('data-target', s.id);
      btn.setAttribute('data-angle', angle);
      btn.innerHTML =
        '<span class="glyph"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="' + s.icon + '"/></svg></span>' +
        '<span class="lang-en">' + s.en + '</span>' +
        '<span class="lang-ar">' + s.ar + '</span>';
      labelRing.appendChild(btn);

      // spinning disc peg (purely decorative, symmetric)
      var x = 200 + 150 * Math.sin(rad);
      var y = 200 - 150 * Math.cos(rad);
      var peg = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      var spoke = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      spoke.setAttribute('x1', 200); spoke.setAttribute('y1', 200);
      spoke.setAttribute('x2', x); spoke.setAttribute('y2', y);
      spoke.setAttribute('stroke', 'var(--steel-2)'); spoke.setAttribute('stroke-width', 4);
      var grip = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      grip.setAttribute('cx', x); grip.setAttribute('cy', y); grip.setAttribute('r', 13);
      grip.setAttribute('fill', 'var(--surface)'); grip.setAttribute('stroke', 'var(--accent)'); grip.setAttribute('stroke-width', 3);
      peg.appendChild(spoke); peg.appendChild(grip);
      spokes.appendChild(peg);
    });

    function layoutLabels() {
      var radius = helmWrap.getBoundingClientRect().width * 0.335;
      labelRing.querySelectorAll('.helm-label').forEach(function (btn) {
        var angle = parseFloat(btn.getAttribute('data-angle'));
        btn.style.transform = 'translate(-50%,-50%) rotate(' + angle + 'deg) translateY(-' + radius + 'px) rotate(' + (-angle) + 'deg)';
      });
    }
    layoutLabels();
    window.addEventListener('resize', layoutLabels);

    function showPanel(id) {
      panels.forEach(function (p) { p.classList.toggle('active', p.getAttribute('data-panel') === id); });
    }

    function backToHelm() {
      panels.forEach(function (p) { p.classList.remove('active'); });
      helmWrap.classList.remove('submerged');
    }

    function spinTo(id) {
      if (spinning) return;
      spinning = true;

      // If a panel is already showing, resurface instantly before the next spin
      panels.forEach(function (p) { p.classList.remove('active'); });
      helmWrap.classList.remove('submerged');

      var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      var extraDetents = 2 + Math.floor(Math.random() * 3); // 2-4 extra detents, purely for organic variety
      var newRot = currentRot + (reduceMotion ? 60 : 4 * 360 + extraDetents * 60);

      var anim = disc.animate(
        [{ transform: 'rotate(' + currentRot + 'deg)' }, { transform: 'rotate(' + newRot + 'deg)' }],
        { duration: reduceMotion ? 150 : 2400, easing: 'cubic-bezier(.13,.85,.22,1)', fill: 'forwards' }
      );
      anim.onfinish = function () {
        currentRot = newRot;
        spinning = false;
        helmWrap.classList.add('submerged');
        showPanel(id);
      };
    }

    labelRing.addEventListener('click', function (e) {
      var btn = e.target.closest('.helm-label');
      if (!btn) return;
      spinTo(btn.getAttribute('data-target'));
    });

    document.querySelectorAll('[data-goto]').forEach(function (el) {
      el.addEventListener('click', function () { spinTo(el.getAttribute('data-goto')); });
    });

    document.querySelectorAll('[data-back]').forEach(function (b) {
      b.addEventListener('click', backToHelm);
    });

    var logoBtn = document.getElementById('logoBtn');
    if (logoBtn) logoBtn.addEventListener('click', backToHelm);
  }

  // ---------------- CLI ambient background ----------------
  var commands = [
    'kubectl get pods -n production',
    'kubectl apply -f deployment.yaml',
    'kubectl rollout status deploy/api',
    'oc get pods -n openshift-gitops',
    'oc apply -f pipeline.yaml',
    'docker build -t registry/app:latest .',
    'docker push registry/app:latest',
    'terraform apply -auto-approve',
    'terraform plan -out=tfplan',
    'ansible-playbook site.yml -i inventory',
    'helm upgrade --install app ./chart',
    'git push origin main',
    "SELECT * FROM pipeline_runs WHERE status='failed';",
    'CREATE INDEX idx_events_ts ON events(ts);',
    'airflow dags trigger etl_pipeline',
    'systemctl restart nginx'
  ];
  var cliBg = document.getElementById('cliBg');
  if (cliBg) {
    var cols = 6;
    for (var i = 0; i < 16; i++) {
      var el = document.createElement('div');
      el.className = 'cli-line' + (i % 4 === 0 ? ' accent' : '');
      el.textContent = commands[i % commands.length];
      el.style.left = ((i % cols) * (100 / cols) + Math.random() * 8) + '%';
      var dur = 22 + Math.random() * 26;
      el.style.animationDuration = dur + 's';
      el.style.animationDelay = '-' + (Math.random() * dur) + 's';
      el.style.opacity = (0.18 + Math.random() * 0.22).toFixed(2);
      cliBg.appendChild(el);
    }
  }
})();

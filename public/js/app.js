(function () {
  function busy(ms) {
    const end = performance.now() + ms;
    while (performance.now() < end) {
      /* spin */
    }
  }

  // ISSUE 10: slow click handlers. Each tap blocks the main thread before the
  // page updates, which shows up as poor INP (Interaction to Next Paint).
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('main-nav');
  toggle.addEventListener('click', function () {
    busy(350);
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  document.querySelectorAll('.accordion-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      busy(300);
      const panel = btn.nextElementSibling;
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.hidden = open;
    });
  });

  // ISSUE 9: a promo banner injected at the top after load, with no space
  // reserved for it, so the whole page jumps down (layout shift / CLS).
  setTimeout(function () {
    const banner = document.createElement('div');
    banner.className = 'promo-banner';
    banner.textContent = 'Limited time: first month free on select units!';
    document.body.insertBefore(banner, document.body.firstChild);
  }, 1500);
})();

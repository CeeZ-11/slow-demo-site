// ISSUE 4: a fake "analytics" tag that runs synchronously in the <head> and
// keeps the main thread busy, delaying first paint and adding Total Blocking Time.
(function () {
  function busy(ms) {
    const end = performance.now() + ms;
    while (performance.now() < end) {
      /* spin */
    }
  }
  busy(450);
  window.slowpokeAnalytics = { loadedAt: Date.now() };
})();

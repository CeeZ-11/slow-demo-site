// ISSUE 5: this file is included twice in index.html, so it downloads and runs twice.
(function () {
  window.carouselRuns = (window.carouselRuns || 0) + 1;
  const end = performance.now() + 120;
  while (performance.now() < end) {
    /* pretend to set up a carousel */
  }
})();

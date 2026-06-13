// Lichte, afhankelijkheidsvrije verbeteringen: tel-animatie + fade-in bij scrollen.
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Tel-animatie voor de statistieken ---
  function animateCount(el) {
    var target = parseInt(el.getAttribute("data-target"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    if (isNaN(target)) return;

    if (reduceMotion) {
      el.textContent = target + suffix;
      return;
    }

    var duration = 1400;
    var start = null;

    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      // easeOutCubic
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // --- IntersectionObserver voor reveal + tellen ---
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;

        if (el.classList.contains("reveal")) {
          el.classList.add("is-visible");
        }
        if (el.classList.contains("stat-number")) {
          animateCount(el);
        }
        obs.unobserve(el);
      });
    }, { threshold: 0.25, rootMargin: "0px 0px -40px 0px" });

    document.querySelectorAll(".reveal, .stat-number").forEach(function (el) {
      observer.observe(el);
    });
  } else {
    // Fallback: alles direct tonen
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
    document.querySelectorAll(".stat-number").forEach(animateCount);
  }
})();

// Contact details. Leave a value empty and its button stays hidden,
// so the site never shows a broken or placeholder link.
const CONFIG = {
  email: "",      // e.g. "you@example.com"
  linkedin: "",   // full profile URL, e.g. "https://www.linkedin.com/in/..."
  whatsapp: "",   // number with country code, digits only, e.g. "919876543210"
  whatsappText: "Hi Lutfur, I saw your portfolio and I'd like to talk about a project.",
  resume: "resume.pdf", // place the file next to index.html

  // YourHome screens: images/yourhome/yourhome1 ... yourhome61
  yourhome: {
    folder: "images/yourhome/",
    prefix: "yourhome",
    count: 61,
    // File types tried in order, so webp, png, jpg and jpeg all work
    extensions: ["webp", "png", "jpg", "jpeg"],

    // ORDER OF SCREENS. Write the file numbers in the order you want them shown.
    // Example: [5, 1, 2, 10] shows yourhome5 first, then yourhome1, yourhome2, yourhome10.
    // Any screen you leave out is added at the end in its normal order, so none go missing.
    // Leave it as [] to keep the normal order 1, 2, 3 ... 61.
    order: [36, 37, 38, 39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58,59,60,61,26,27,28,29,30,31,32,33,34,35,21,22,23,24,25,16,15,14,13,12,11,10,9,8,7,6,5,4,3,2,1]
  }
};

(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Contact links ---------- */
  var emailEl = document.querySelector("[data-email]");
  if (emailEl && CONFIG.email) {
    emailEl.href = "mailto:" + CONFIG.email + "?subject=" + encodeURIComponent("Project enquiry from your portfolio");
    emailEl.hidden = false;
  }
  var liEl = document.querySelector("[data-linkedin]");
  if (liEl && CONFIG.linkedin) {
    liEl.href = CONFIG.linkedin;
    liEl.hidden = false;
  }
  var waNumber = String(CONFIG.whatsapp || "").replace(/\D/g, "");
  if (waNumber) {
    document.querySelectorAll("[data-whatsapp]").forEach(function (el) {
      el.href = "https://wa.me/" + waNumber + "?text=" + encodeURIComponent(CONFIG.whatsappText || "");
      el.hidden = false;
    });
  }
  // Show the hint only while no direct contact method is set
  var hint = document.querySelector("[data-contact-hint]");
  if (hint && (CONFIG.email || CONFIG.linkedin || waNumber)) hint.hidden = true;

  /* ---------- Message form (Netlify Forms) ---------- */
  var msgForm = document.getElementById("msg-form");
  var msgStatus = document.getElementById("msg-status");
  if (msgForm && window.fetch) {
    msgForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var send = msgForm.querySelector("button[type=submit]");
      send.disabled = true;
      msgStatus.className = "msg__status";
      msgStatus.textContent = "Sending...";
      fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(new FormData(msgForm)).toString()
      })
        .then(function (res) {
          if (!res.ok) throw new Error("failed");
          msgForm.reset();
          msgStatus.className = "msg__status is-ok";
          msgStatus.textContent = "Thanks, your message is sent. I will reply soon.";
        })
        .catch(function () {
          msgStatus.className = "msg__status is-err";
          msgStatus.textContent = "The message could not be sent. Please use the email or WhatsApp button instead.";
        })
        .then(function () { send.disabled = false; });
    });
  }

  /* ---------- Resume: hide the buttons if the file is not present ---------- */
  var resumeEls = document.querySelectorAll("[data-resume]");
  resumeEls.forEach(function (el) { el.href = CONFIG.resume; });
  if (CONFIG.resume && window.fetch) {
    fetch(CONFIG.resume, { method: "HEAD" })
      .then(function (res) { if (!res.ok) throw new Error("missing"); })
      .catch(function () { resumeEls.forEach(function (el) { el.hidden = true; }); });
  }

  /* ---------- Footer year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Mobile navigation ---------- */
  var toggle = document.querySelector(".nav__toggle");
  var links = document.getElementById("site-nav");
  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    links.classList.toggle("is-open", open);
  }
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });
    links.addEventListener("click", function (e) {
      if (e.target.closest("a")) setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        setMenu(false);
        toggle.focus();
      }
    });
  }

  /* ---------- Scroll progress + nav state ---------- */
  var nav = document.querySelector(".nav");
  var bar = document.getElementById("progress");
  var ticking = false;
  function onScroll() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    if (bar) bar.style.transform = "scaleX(" + p.toFixed(4) + ")";
    if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 12);
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  // Highlight the nav link of the section in view
  if ("IntersectionObserver" in window && links) {
    var navAnchors = {};
    links.querySelectorAll('a[href^="#"]').forEach(function (a) { navAnchors[a.getAttribute("href").slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        Object.keys(navAnchors).forEach(function (id) { navAnchors[id].classList.toggle("is-active", id === entry.target.id); });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(navAnchors).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) spy.observe(sec);
    });
  }

  /* ---------- Profile dialog ---------- */
  var profile = document.getElementById("profile");
  var profileBtn = document.querySelector("[data-profile-open]");
  if (profile && profileBtn) {
    if (typeof profile.showModal === "function") {
      profileBtn.addEventListener("click", function () { profile.showModal(); });
      profile.addEventListener("click", function (e) {
        if (e.target === profile) profile.close();
      });
      profile.querySelectorAll("[data-profile-close]").forEach(function (el) {
        el.addEventListener("click", function () { profile.close(); });
      });
      profile.addEventListener("close", function () { profileBtn.focus(); });
    } else {
      profileBtn.addEventListener("click", function () { location.hash = "#about"; });
    }
  }

  /* ---------- Phone frames: size each frame from its real screenshot ----------
     The frame follows the true width/height ratio of the image, so nothing is
     stretched or cropped. Ratios are kept inside a realistic phone range. */
  var AR_MIN = 0.4, AR_MAX = 0.75;
  function ratioOf(img) {
    if (!img || !img.naturalWidth || !img.naturalHeight) return null;
    return Math.min(AR_MAX, Math.max(AR_MIN, img.naturalWidth / img.naturalHeight));
  }
  function fitDevice(img) {
    var dev = img.closest(".device");
    if (!dev || dev.hasAttribute("data-fixed")) return;
    var r = ratioOf(img);
    if (r) dev.style.setProperty("--ar", r.toFixed(4));
  }
  function watchImage(img) {
    if (img.complete && img.naturalWidth) fitDevice(img);
    img.addEventListener("load", function () { fitDevice(img); });
  }
  document.querySelectorAll(".device img").forEach(watchImage);

  /* ---------- Hero phone: cycle through real screens + gentle tilt ---------- */
  var heroImgs = document.querySelectorAll("#hero-screens img");
  if (heroImgs.length > 1 && !reduceMotion) {
    var hi = 0;
    setInterval(function () {
      if (document.hidden) return;
      heroImgs[hi].classList.remove("is-on");
      hi = (hi + 1) % heroImgs.length;
      heroImgs[hi].classList.add("is-on");
    }, 3200);
  }
  var stage = document.querySelector("[data-tilt]");
  if (stage && !reduceMotion && window.matchMedia("(hover: hover)").matches) {
    var hero = document.querySelector(".hero");
    hero.addEventListener("pointermove", function (e) {
      var b = hero.getBoundingClientRect();
      var x = (e.clientX - b.left) / b.width - 0.5;
      var y = (e.clientY - b.top) / b.height - 0.5;
      stage.style.transform = "perspective(1000px) rotateY(" + (x * 10).toFixed(2) + "deg) rotateX(" + (-y * 8).toFixed(2) + "deg)";
    });
    hero.addEventListener("pointerleave", function () { stage.style.transform = ""; });
  }

  /* ---------- Tech marquee (duplicate once for a seamless loop) ---------- */
  var marquee = document.getElementById("marquee");
  if (marquee) {
    marquee.innerHTML += marquee.innerHTML;
  }

  /* ---------- Animated counters ---------- */
  var counters = document.querySelectorAll("[data-count]");
  function runCounter(el) {
    var end = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) { el.textContent = end + suffix; return; }
    var start = null, dur = 1400;
    function step(ts) {
      if (start === null) start = ts;
      var t = Math.min(1, (ts - start) / dur);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(end * eased) + (t === 1 ? suffix : "");
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window && counters.length) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { runCounter(entry.target); cio.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- YourHome screens gallery + viewer ---------- */
  var track = document.getElementById("yh-track");
  var box = document.getElementById("lightbox");
  if (track) {
    var yh = CONFIG.yourhome;

    function loadImage(img, n, fig, screen) {
      var i = 0;
      function tryNext() {
        if (i >= yh.extensions.length) {
          // No file found for this screen: show a neat placeholder
          fig.classList.add("is-missing");
          img.replaceWith(Object.assign(document.createElement("div"), {
            className: "shotfig__ph",
            textContent: yh.prefix + n
          }));
          return;
        }
        img.src = yh.folder + yh.prefix + n + "." + yh.extensions[i++];
      }
      img.addEventListener("error", tryNext);
      img.addEventListener("load", function () { fitDevice(img); });
      tryNext();
    }

    // Work out the display order: your list first, then any screens not listed
    var seq = [];
    var seen = {};
    (yh.order || []).forEach(function (num) {
      num = parseInt(num, 10);
      if (num >= 1 && num <= yh.count && !seen[num]) { seen[num] = true; seq.push(num); }
    });
    for (var m = 1; m <= yh.count; m++) {
      if (!seen[m]) seq.push(m);
    }

    for (var k = 0; k < seq.length; k++) {
      var n = seq[k];               // file number (which image to load)
      var pos = k + 1;              // position shown on the page
      var fig = document.createElement("figure");
      fig.className = "shotfig";
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "shotfig__btn";
      btn.setAttribute("aria-label", "View YourHome screen " + pos + " larger");

      var dev = document.createElement("span");
      dev.className = "device";
      var screen = document.createElement("span");
      screen.className = "device__screen";
      var img = document.createElement("img");
      img.decoding = "async";
      img.loading = "lazy";
      img.alt = "YourHome app screen " + pos;
      screen.appendChild(img);
      dev.appendChild(screen);
      btn.appendChild(dev);

      var cap = document.createElement("figcaption");
      cap.textContent = "YourHome " + pos;
      fig.appendChild(btn);
      fig.appendChild(cap);
      track.appendChild(fig);
      loadImage(img, n, fig, screen);
    }

    // Arrow buttons scroll the strip
    function scrollStrip(dir) {
      track.scrollBy({ left: dir * track.clientWidth * 0.8, behavior: reduceMotion ? "auto" : "smooth" });
    }
    var prevBtn = document.querySelector("[data-yh-prev]");
    var nextBtn = document.querySelector("[data-yh-next]");
    if (prevBtn) prevBtn.addEventListener("click", function () { scrollStrip(-1); });
    if (nextBtn) nextBtn.addEventListener("click", function () { scrollStrip(1); });

    // Viewer: the screen opens inside a large phone frame
    if (box && typeof box.showModal === "function") {
      var lbImg = document.getElementById("lb-img");
      var lbCap = document.getElementById("lb-cap");
      var lbDev = document.getElementById("lb-device");
      var current = 0;

      function loaded() {
        return Array.prototype.filter.call(track.querySelectorAll(".shotfig"), function (f) {
          return !f.classList.contains("is-missing") && f.querySelector("img");
        });
      }
      function show(index) {
        var list = loaded();
        if (!list.length) return;
        current = (index + list.length) % list.length;
        var f = list[current];
        var src = f.querySelector("img");
        var r = ratioOf(src) || 0.5;
        lbDev.style.setProperty("--ar", r.toFixed(4));
        lbImg.src = src.currentSrc || src.src;
        lbImg.alt = src.alt;
        lbCap.textContent = f.querySelector("figcaption").textContent + "  ·  " + (current + 1) + " / " + list.length;
      }
      track.addEventListener("click", function (e) {
        var b = e.target.closest(".shotfig__btn");
        if (!b) return;
        var f = b.closest(".shotfig");
        if (f.classList.contains("is-missing")) return;
        var idx = loaded().indexOf(f);
        show(idx < 0 ? 0 : idx);
        box.showModal();
      });
      box.querySelector("[data-lb-close]").addEventListener("click", function () { box.close(); });
      box.querySelector("[data-lb-prev]").addEventListener("click", function () { show(current - 1); });
      box.querySelector("[data-lb-next]").addEventListener("click", function () { show(current + 1); });
      box.addEventListener("click", function (e) { if (e.target === box) box.close(); });
      box.addEventListener("keydown", function (e) {
        if (e.key === "ArrowLeft") show(current - 1);
        if (e.key === "ArrowRight") show(current + 1);
      });

      // Swipe left / right on touch screens
      var touchX = null;
      box.addEventListener("touchstart", function (e) { touchX = e.changedTouches[0].clientX; }, { passive: true });
      box.addEventListener("touchend", function (e) {
        if (touchX === null) return;
        var dx = e.changedTouches[0].clientX - touchX;
        touchX = null;
        if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
      }, { passive: true });
    }
  }

  /* ---------- Scroll reveals ---------- */
  var items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach(function (el) { el.classList.add("is-visible"); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  items.forEach(function (el) { io.observe(el); });
})();
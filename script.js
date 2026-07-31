import { auth } from "./Nav Bar/auth/firebase-config.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

import { notifyOwner } from "./telegram-notify.js";
// ---------- Typing Effect ----------
const words = [
  "Building unforgettable brands.",
  "Designing products people love.",
  "Creating visual identities.",
  "Scaling ambitious startups.",
  "Crafting premium experiences.",
  "Turning ideas into businesses."
];

const typingElement = document.querySelector(".typing");

let wordIndex = 0;
let charIndex = 0;
let deleting = false;

function random(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function typeEffect() {
  if (!typingElement) return;
  const currentWord = words[wordIndex];

  if (!deleting) {
    typingElement.textContent = currentWord.substring(0, charIndex + 1);
    charIndex++;
    if (charIndex === currentWord.length) {
      deleting = true;
      setTimeout(typeEffect, 1800);
      return;
    }
  } else {
    typingElement.textContent = currentWord.substring(0, charIndex - 1);
    charIndex--;

    if (charIndex === 0) {
      deleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typingElement.classList.add("glitch");
      setTimeout(() => {
        typingElement.classList.remove("glitch");
      }, 220);
    }
  }

  const speed = deleting ? random(35, 60) : random(70, 120);
  setTimeout(typeEffect, speed);
}

// ---------- Navbar user state ----------
const navUserArea = document.getElementById("navUserArea");
const OWNER_EMAIL = "bittukhantusharkhan@gmail.com";

onAuthStateChanged(auth, (user) => {
  if (!navUserArea) return;

  if (user) {
    const name = user.displayName || (user.email ? user.email.split("@")[0] : "User");
    const isOwner = (user.email || "").toLowerCase() === OWNER_EMAIL.toLowerCase();
    const dashboardLink = isOwner
      ? "./Nav Bar/auth/owner/owner.html"
      : "./Nav Bar/auth/users.html";

    navUserArea.innerHTML = `
      <div class="nav-user-box">
        <span class="nav-user-name">${name}</span>
        <a href="${dashboardLink}" class="nav-user-btn">Dashboard</a>
        <button id="logoutBtn" class="nav-user-btn" type="button">Logout</button>
      </div>
    `;

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        try {
          await signOut(auth);
          location.reload();
        } catch (error) {
          console.error("Logout failed:", error);
        }
      });
    }
  } else {
    navUserArea.innerHTML = `<a href="./Nav Bar/auth/login.html">Login</a>`;
  }
});

// ==========================================================
// PAGE INIT — everything else waits for DOM, then GSAP/Lenis
// (loaded from CDN in index.html) take over the motion layer.
// ==========================================================
document.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const hasGSAP = typeof window.gsap !== "undefined";
  const hasScrollTrigger = hasGSAP && typeof window.ScrollTrigger !== "undefined";

  if (hasScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  // ---------- Typing effect ----------
  if (typingElement) {
    typingElement.textContent = "";
    typeEffect();
  }

  // ---------- Mobile hero slideshow ----------
  // The hero itself now carries a dedicated set of mobile-only images
  // (.hero-slide-mobile) that crossfade behind the headline/buttons/stats,
  // filling the same full-bleed spot the desktop pinned deck uses above
  // 640px. This is a plain interval crossfade (no GSAP/scroll dependency)
  // so it keeps working even if GSAP fails to load.
  const heroMobileSlides = document.querySelectorAll(".hero-slide-mobile");
  if (heroMobileSlides.length > 0) {
    heroMobileSlides.forEach((slide) => {
      const img = new Image();
      img.src = slide.src;
    });

    let currentHeroMobileIndex = 0;
    heroMobileSlides[currentHeroMobileIndex].style.opacity = "1";

    setInterval(() => {
      if (window.innerWidth > 640) return; // only cycle while the mobile hero layout is active
      heroMobileSlides[currentHeroMobileIndex].style.opacity = "0";
      currentHeroMobileIndex = (currentHeroMobileIndex + 1) % heroMobileSlides.length;
      setTimeout(() => {
        heroMobileSlides[currentHeroMobileIndex].style.opacity = "1";
      }, 300);
    }, 4000);
  }

  // ---------- Nav toggle ----------
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("header nav");
  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      nav.classList.toggle("active");
      const isExpanded = nav.classList.contains("active");
      menuToggle.setAttribute("aria-expanded", String(isExpanded));
    });
  }

  // ---------- Service track: drag + numbered pagination ----------
  const projectGallery = document.querySelector("[data-track]");
  const trackCurrent = document.querySelector(".track-current");

  if (projectGallery) {
    projectGallery.addEventListener(
      "wheel",
      (event) => {
        if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
          event.preventDefault();
          projectGallery.scrollLeft += event.deltaY;
        }
      },
      { passive: false }
    );

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    projectGallery.addEventListener("mousedown", (e) => {
      isDown = true;
      startX = e.pageX - projectGallery.offsetLeft;
      scrollLeft = projectGallery.scrollLeft;
    });
    ["mouseleave", "mouseup"].forEach((evt) =>
      projectGallery.addEventListener(evt, () => { isDown = false; })
    );
    projectGallery.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - projectGallery.offsetLeft;
      const walk = (x - startX) * 1.4;
      projectGallery.scrollLeft = scrollLeft - walk;
    });

    if (trackCurrent) {
      const cards = Array.from(projectGallery.querySelectorAll(".project-card"));
      const updatePagination = () => {
        const center = projectGallery.scrollLeft + projectGallery.clientWidth / 2;
        let closest = 0;
        let closestDist = Infinity;
        cards.forEach((card, i) => {
          const cardCenter = card.offsetLeft + card.offsetWidth / 2;
          const dist = Math.abs(cardCenter - center);
          if (dist < closestDist) { closestDist = dist; closest = i; }
        });
        trackCurrent.textContent = String(closest + 1).padStart(2, "0");
      };
      projectGallery.addEventListener("scroll", updatePagination, { passive: true });
      updatePagination();
    }
  }

  // ---------- FAQ toggle ----------
  document.querySelectorAll(".faq").forEach((faq) => {
    faq.addEventListener("click", () => faq.classList.toggle("active"));
  });

  // ==========================================================
  // MOTION LAYER — hero deck, Lenis smooth scroll, bidirectional
  // scroll reveals. Everything below degrades to a plain static
  // page (via the .reveal CSS fallback) if GSAP fails to load.
  // ==========================================================
  const heroSlides = document.querySelectorAll(".hero-slide");
  const heroLines = document.querySelectorAll(".hero-title .line");
  const heroKicker = document.querySelector(".hero-kicker");
  const heroSubtext = document.querySelector(".hero-subtext");
  const heroButtons = document.querySelector(".hero-buttons");
  const heroStats = document.querySelector(".hero-stats");
  const heroScrollCue = document.querySelector(".hero-scroll-cue");
  const heroName = document.querySelector(".hero-name[data-split]");

  // Split the TUSDIO wordmark into individually-animatable letters, each
  // wrapped in an overflow-hidden mask so it can slide up into view.
  function splitToChars(el) {
    if (!el || el.dataset.splitDone) return [];
    const text = el.textContent;
    el.textContent = "";
    const chars = [];
    text.split("").forEach((ch) => {
      const mask = document.createElement("span");
      mask.className = "char-mask";
      const inner = document.createElement("span");
      inner.className = "char";
      inner.textContent = ch === " " ? "\u00A0" : ch;
      mask.appendChild(inner);
      el.appendChild(mask);
      chars.push(inner);
    });
    el.dataset.splitDone = "true";
    return chars;
  }

  const nameChars = splitToChars(heroName);
  if (nameChars.length) gsap.set(nameChars, { yPercent: 120, filter: "blur(8px)" });

  const preloader = document.querySelector(".preloader");

  if (!hasGSAP || reduceMotion) {
    // Fallback: show everything immediately, no motion.
    if (preloader) { preloader.style.display = "none"; }
    if (heroSlides[0]) heroSlides[0].style.opacity = "1";
    if (nameChars.length) gsap.set(nameChars, { yPercent: 0, filter: "blur(0px)" });
    [heroKicker, heroSubtext, heroButtons, heroStats, heroScrollCue].forEach((el) => {
      if (el) el.style.opacity = "1";
    });
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
    document.querySelectorAll("[data-split-words] .word").forEach((w) => { w.style.transform = "none"; w.style.opacity = "1"; });
    // Reduced motion / no-GSAP: just show final stat values, no count-up.
    document.querySelectorAll(".hero-stats h3[data-count]").forEach((el) => {
      el.textContent = el.dataset.count;
    });
    return;
  }

  // ---------- Preloader: letter reveal, hold, then fade out ----------
  if (preloader) {
    document.documentElement.style.overflow = "hidden";

    // Split "TUSDIO." into individually-animatable letters (blur-focus reveal)
    const preloaderWord = document.getElementById("preloaderWord");

    if (preloaderWord && !preloaderWord.dataset.splitDone) {
      "TUSDIO".split("").forEach((ch, i) => {
        const span = document.createElement("span");
        span.className = "char";
        span.textContent = ch;
        span.style.animationDelay = (0.1 + i * 0.06) + "s";
        preloaderWord.appendChild(span);
      });
      const dot = document.createElement("span");
      dot.className = "char dot";
      dot.textContent = ".";
      dot.style.animationDelay = (0.1 + 6 * 0.06) + "s";
      preloaderWord.appendChild(dot);
      preloaderWord.dataset.splitDone = "true";
    }

    // Hold on the settled wordmark for a beat, then dismiss
    gsap.delayedCall(1.9, () => {
      gsap.to(preloader, {
        opacity: 0,
        filter: "blur(14px)",
        scale: 0.97,
        duration: 0.9,
        ease: "power2.out",
        onComplete: () => {
          preloader.style.display = "none";
          document.documentElement.style.overflow = "";
          if (hasScrollTrigger) ScrollTrigger.refresh();
        },
      });
    });
  }

  // ---------- Lenis smooth scroll, wired into GSAP's ticker ----------
  let lenis = null;
  if (typeof window.Lenis !== "undefined") {
    lenis = new window.Lenis({
      duration: 1.15,
      easing: (t) => 1 - Math.pow(1 - t, 4),
      smoothWheel: true,
    });

    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    if (hasScrollTrigger) lenis.on("scroll", ScrollTrigger.update);
  }

  // ---------- Scroll-direction tracker (drives the marquee reverse; navbar itself is untouched) ----------
  const marquee = document.querySelector(".marquee");
  if (hasScrollTrigger) {
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        if (marquee) marquee.classList.toggle("is-reversed", self.direction === -1);
      },
    });
  }

  // ---------- Pinned, scroll-scrubbed hero (Apple-style keyframes) ----------
  // Desktop only: the hero pins for ~280% of viewport height while the
  // slideshow crossfades through all 6 frames and the headline animates
  // in on a timeline driven ENTIRELY by scroll position (scrub: true) —
  // scroll down to advance the keyframes, scroll up to rewind them.
  if (hasScrollTrigger) {
    ScrollTrigger.matchMedia({
      "(min-width: 641px)": function () {
        const heroTl = gsap.timeline({
          scrollTrigger: {
            trigger: ".hero",
            start: "top top",
            end: "+=280%",
            scrub: 0.6,
            pin: true,
            anticipatePin: 1,
          },
        });

        // Opening beat: TUSDIO reveals letter-by-letter, holds, then
        // shrinks up out of the way as the headline takes over.
        if (nameChars.length) {
          heroTl
            .to(nameChars, { yPercent: 0, filter: "blur(0px)", duration: 0.8, stagger: 0.035, ease: "power4.out" }, 0)
            .to(".hero-name", { scale: 0.34, y: -34, duration: 0.6, ease: "power3.inOut" }, 1.15);
        }

        // Text intro — plays right after the wordmark settles.
        if (heroKicker) heroTl.to(heroKicker, { opacity: 1, y: 0, duration: 0.6 }, 1.5);
        if (heroLines.length) {
          heroTl.from(heroLines, { yPercent: 110, duration: 1, stagger: 0.15 }, 1.65);
        }
        if (heroSubtext) heroTl.to(heroSubtext, { opacity: 1, duration: 0.6 }, 2.4);
        if (heroButtons) heroTl.to(heroButtons, { opacity: 1, duration: 0.6 }, 2.55);

        if (heroStats) {
          heroTl.to(heroStats, { opacity: 1, duration: 0.6 }, 2.7);

          // Stat counters: scrubbed in lockstep with the fade-in above,
          // instead of on their own separate ScrollTrigger (which used to
          // resolve while the section was still pinned/hidden and finish
          // counting before the numbers were ever visible).
          const statEls = heroStats.querySelectorAll("h3[data-count]");
          statEls.forEach((el) => {
            const obj = { value: 0 };
            heroTl.to(obj, {
              value: Number(el.dataset.count),
              duration: 0.9,
              ease: "power2.out",
              onUpdate() { el.textContent = Math.floor(obj.value); },
            }, 2.75);
          });
        }

        if (heroScrollCue) heroTl.to(heroScrollCue, { opacity: 1, duration: 0.4 }, 2.8).to(heroScrollCue, { opacity: 0, duration: 0.3 }, 3.3);

        // Slideshow keyframes: each frame crossfades in, holds, then the
        // next one takes over — driven by the same scrubbed timeline.
        if (heroSlides.length) {
          const slideStart = 3.1;
          const slideSpan = 7.2;
          const perSlide = slideSpan / heroSlides.length;

          heroSlides.forEach((slide, i) => {
            const t0 = slideStart + i * perSlide;
            gsap.set(slide, { scale: 1.08 });
            if (i > 0) heroTl.to(slide, { opacity: 1, duration: perSlide * 0.35 }, t0);
            heroTl.to(slide, { scale: 1, duration: perSlide, ease: "none" }, t0);
            if (i < heroSlides.length - 1) {
              heroTl.to(slide, { opacity: 0, duration: perSlide * 0.35 }, t0 + perSlide * 0.65);
            }
          });
        }

        // Final beat: whole hero content settles/zooms slightly before
        // unpinning into the next section, so the handoff feels intentional.
        heroTl.to(".hero-shell", { scale: 1.03, duration: 0.6 }, ">-0.2");

        return () => heroTl.scrollTrigger && heroTl.scrollTrigger.kill();
      },

      "(max-width: 640px)": function () {
        // No pin/scrub on small screens — just fade the copy in once.
        const quickTl = gsap.timeline({ defaults: { ease: "power3.out" } });
        if (nameChars.length) {
          quickTl
            .to(nameChars, { yPercent: 0, filter: "blur(0px)", duration: 0.7, stagger: 0.03 })
            .to(".hero-name", { scale: 0.5, y: -16, duration: 0.5, ease: "power3.inOut" }, "-=0.1");
        }
        if (heroKicker) quickTl.to(heroKicker, { opacity: 1, y: 0, duration: 0.5 }, "-=0.2");
        if (heroLines.length) quickTl.from(heroLines, { yPercent: 110, duration: 0.7, stagger: 0.1 }, "-=0.3");
        if (heroSubtext) quickTl.to(heroSubtext, { opacity: 1, duration: 0.4 }, "-=0.2");
        if (heroButtons) quickTl.to(heroButtons, { opacity: 1, duration: 0.4 }, "-=0.2");

        if (heroStats) {
          quickTl.to(heroStats, { opacity: 1, duration: 0.4 }, "-=0.2");

          // Same fix on mobile: scrub the count-up alongside the fade-in
          // instead of a separate, mistimed ScrollTrigger.
          heroStats.querySelectorAll("h3[data-count]").forEach((el) => {
            const obj = { value: 0 };
            quickTl.to(obj, {
              value: Number(el.dataset.count),
              duration: 0.6,
              ease: "power2.out",
              onUpdate() { el.textContent = Math.floor(obj.value); },
            }, "<");
          });
        }
      },
    });
  }

  // ---------- Magnetic buttons ----------
  const magnets = document.querySelectorAll(".magnetic");
  if (window.matchMedia("(hover: hover)").matches) {
    magnets.forEach((el) => {
      el.addEventListener("mousemove", (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(el, { x: x * 0.35, y: y * 0.5, duration: 0.4, ease: "power2.out" });
      });
      el.addEventListener("mouseleave", () => {
        gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" });
      });
    });
  }

  // ---------- Custom cursor ----------
  const cursorDot = document.querySelector(".cursor-dot");
  if (cursorDot && window.matchMedia("(hover: hover)").matches) {
    window.addEventListener("mousemove", (e) => {
      cursorDot.classList.add("is-active");
      cursorDot.style.left = `${e.clientX}px`;
      cursorDot.style.top = `${e.clientY}px`;
    });
    document.querySelectorAll("a, button, .project-card").forEach((el) => {
      el.addEventListener("mouseenter", () => cursorDot.classList.add("is-hover"));
      el.addEventListener("mouseleave", () => cursorDot.classList.remove("is-hover"));
    });
  }

  // ---------- Word-by-word kinetic heading reveal ----------
  // Splits each [data-split-words] heading into masked words (reference:
  // paulkalkbrenner / normalisboring stacked-word headlines) and plays
  // them in on the way down, reverses on the way back up.
  function splitToWords(el) {
    if (!el || el.dataset.splitDone) return [];
    const text = el.textContent;
    el.textContent = "";
    const words = [];
    text.split(" ").forEach((word, i, arr) => {
      const mask = document.createElement("span");
      mask.className = "word-mask";
      const inner = document.createElement("span");
      inner.className = "word";
      inner.textContent = word;
      mask.appendChild(inner);
      el.appendChild(mask);
      words.push(inner);
      if (i < arr.length - 1) el.appendChild(document.createTextNode(" "));
    });
    el.dataset.splitDone = "true";
    return words;
  }

  document.querySelectorAll("[data-split-words]").forEach((heading) => {
    const words = splitToWords(heading);
    if (!words.length) return;
    gsap.set(words, { yPercent: 100, opacity: 0 });
    gsap.to(words, {
      yPercent: 0,
      opacity: 1,
      duration: 0.8,
      stagger: 0.05,
      ease: "power3.out",
      scrollTrigger: hasScrollTrigger
        ? {
            trigger: heading,
            start: "top 88%",
            end: "bottom 40%",
            toggleActions: "play reverse play reverse",
          }
        : undefined,
    });
  });

  // ---------- Site-wide bidirectional reveals ----------
  // Plays forward scrolling down, reverses smoothly scrolling back up,
  // instead of firing once via IntersectionObserver and staying static.
  if (hasScrollTrigger) {
    gsap.set(".reveal", { clearProps: "opacity,transform" }); // let GSAP own these, not the CSS transition
    gsap.utils.toArray(".reveal").forEach((section) => {
      gsap.fromTo(
        section,
        { autoAlpha: 0, y: 60 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            end: "bottom 15%",
            toggleActions: "play reverse play reverse",
          },
        }
      );
    });

    // ---------- Staggered child reveals for grid-style sections ----------
    // Each item gets its OWN enter/leave trigger via ScrollTrigger.batch,
    // instead of one shared trigger tied to the whole parent section. A
    // single shared trigger is fine for short grids (Why TUSDIO, Process)
    // that fit in roughly one viewport, but it broke down badly on the
    // much taller Recent Work grid: with one "top 80% / bottom 20%" pair
    // covering the *entire* multi-screen-tall section, cards near the
    // bottom would already be marked visible before they ever scrolled
    // into view, and cards in the middle would silently fade out again
    // while still on screen as soon as the far-off bottom edge of the
    // section crossed the reverse threshold. That mismatch between
    // "when the trigger fires" and "what's actually on screen" was the
    // glitchy behaviour in the Recent Work section. Batching each card's
    // own position fixes it for every grid, short or tall.
    const staggerGroups = [
      ".feature-grid .feature-card",
      ".process-grid .process-step",
      ".image-grid .image-card",
    ];

    staggerGroups.forEach((selector) => {
      const items = gsap.utils.toArray(selector);
      if (!items.length) return;

      gsap.set(items, { autoAlpha: 0, y: 40 });

      ScrollTrigger.batch(items, {
        start: "top 90%",
        onEnter: (batch) =>
          gsap.to(batch, {
            autoAlpha: 1,
            y: 0,
            duration: 0.7,
            ease: "power3.out",
            stagger: 0.08,
            overwrite: true,
          }),
        onLeaveBack: (batch) =>
          gsap.to(batch, {
            autoAlpha: 0,
            y: 40,
            duration: 0.4,
            ease: "power3.out",
            stagger: 0.05,
            overwrite: true,
          }),
      });
    });

    // NOTE: there used to be a scroll-scrubbed parallax drift on the
    // Recent Work images here (a continuous transform recalculated on
    // every scroll frame, layered on top of an image sized larger than
    // its rounded, overflow:hidden card so it had room to slide). That
    // combination was the actual source of the section feeling glitchy:
    // some browsers don't reliably keep an oversized, actively-animating
    // child clipped to a rounded corner, so the corners could flash
    // square mid-scroll, on top of the general jank of scrubbing 18
    // transforms at once. It's intentionally removed — the grid now only
    // animates on entrance (via ScrollTrigger.batch above) and on hover
    // (plain CSS), each with a single, uncontested owner of `transform`.
  } else {
    // No ScrollTrigger available: fall back to simple one-shot reveal.
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
    document.querySelectorAll(".feature-card, .process-step, .image-card").forEach((el) => {
      el.style.opacity = "1";
      el.style.transform = "none";
    });
  }
});

// ---------- Blog ----------
function toggleBlogContent(button) {
  const fullContent = button.nextElementSibling;
  if (!fullContent) return;

  if (fullContent.style.display === "block") {
    fullContent.style.display = "none";
    button.textContent = "Read More";
  } else {
    fullContent.style.display = "block";
    button.textContent = "Read Less";
  }
}

window.toggleBlogContent = toggleBlogContent;

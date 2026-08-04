/* =========================================================
   TUSDIO — PRODUCT DEVELOPMENT
   ========================================================= */

import { auth } from "../../Nav Bar/auth/firebase-config.js";
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";


/* =========================================================
   NAVBAR — identical behaviour to the freebie / about pages
   ========================================================= */

// Nav toggle
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("header nav");

if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
        nav.classList.toggle("active");
        const isExpanded = nav.classList.contains("active");
        menuToggle.setAttribute("aria-expanded", String(isExpanded));
    });
}

// Navbar user state
const navUserArea = document.getElementById("navUserArea");
const OWNER_EMAIL = "bittukhantusharkhan@gmail.com";

onAuthStateChanged(auth, (user) => {
    if (!navUserArea) return;

    if (user) {
        const name = user.displayName || (user.email ? user.email.split("@")[0] : "User");
        const isOwner = (user.email || "").toLowerCase() === OWNER_EMAIL.toLowerCase();

        const dashboardLink = isOwner
            ? "../../Nav Bar/auth/owner/owner.html"
            : "../../Nav Bar/auth/users.html";

        navUserArea.innerHTML = `
      <div class="nav-user-box">
        <span class="nav-user-name">${name}</span>
        <a href="${dashboardLink}" class="nav-user-btn">Dashboard</a>
        <button id="logoutNavBtn" class="nav-user-btn" type="button">Logout</button>
      </div>
    `;

        const logoutNavBtn = document.getElementById("logoutNavBtn");
        if (logoutNavBtn) {
            logoutNavBtn.addEventListener("click", async () => {
                try {
                    await signOut(auth);
                    window.location.href = "../../Nav Bar/auth/login.html";
                } catch (error) {
                    console.error("Logout failed:", error);
                }
            });
        }
    } else {
        navUserArea.innerHTML = `
      <a href="../../Nav Bar/auth/login.html">Login</a>
    `;
    }
});


/* =========================================================
   SCROLL REVEAL
   ========================================================= */

function setupScrollReveal() {

    const targets = document.querySelectorAll(".reveal");
    if (!targets.length) return;

    if (!("IntersectionObserver" in window)) {
        targets.forEach(el => el.classList.add("in-view"));
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("in-view");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -60px 0px" });

    targets.forEach(el => observer.observe(el));

}


/* =========================================================
   BACK TO TOP
   ========================================================= */

function setupBackToTop() {

    const btn = document.getElementById("backToTop");
    if (!btn) return;

    window.addEventListener("scroll", () => {
        const visible = window.scrollY > 700;
        btn.hidden = false;
        btn.classList.toggle("visible", visible);
    }, { passive: true });

    btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

}


/* =========================================================
   HERO RING — subtle parallax on the concentric ring motif
   (replaces the old colored parallax orbs)
   ========================================================= */

function setupHeroParallax() {

    const hero = document.querySelector(".pd-hero");
    const ring = document.querySelector(".hero-ring");
    if (!hero || !ring || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let ticking = false;

    function apply() {
        const scrollY = window.scrollY;
        const heroHeight = hero.offsetHeight;
        if (scrollY < heroHeight) {
            ring.style.transform = `translate(-50%, calc(-50% + ${scrollY * 0.12}px)) rotate(${scrollY * 0.02}deg)`;
        }
        ticking = false;
    }

    window.addEventListener("scroll", () => {
        if (!ticking) {
            requestAnimationFrame(apply);
            ticking = true;
        }
    }, { passive: true });

}

/* =========================================================
   TUSDIO — OUR APPROACH
   Premium interaction system
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const approach = document.querySelector("#approach");

    if (!approach) return;


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const cards = approach.querySelectorAll(".approach-card");
    const watermark = approach.querySelector(".approach-watermark");


    /* =====================================================
       REDUCED MOTION
    ===================================================== */

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;


    /* =====================================================
       CARD REVEAL
    ===================================================== */

    if (!reduceMotion && "IntersectionObserver" in window) {

        const revealObserver = new IntersectionObserver(
            (entries, observer) => {

                entries.forEach((entry) => {

                    if (!entry.isIntersecting) return;

                    entry.target.classList.add("is-visible");

                    observer.unobserve(entry.target);

                });

            },
            {
                threshold: 0.15,
                rootMargin: "0px 0px -60px 0px"
            }
        );


        cards.forEach((card) => {

            revealObserver.observe(card);

        });

    } else {

        cards.forEach((card) => {

            card.classList.add("is-visible");

        });

    }


    /* =====================================================
       PREMIUM CARD TILT
    ===================================================== */

    cards.forEach((card) => {

        let bounds = null;

        card.addEventListener(
            "mouseenter",
            () => {

                if (window.innerWidth <= 900 || reduceMotion) {
                    return;
                }

                bounds = card.getBoundingClientRect();

                card.classList.add("is-hovered");

            },
            { passive: true }
        );


        card.addEventListener(
            "mousemove",
            (event) => {

                if (
                    window.innerWidth <= 900 ||
                    reduceMotion ||
                    !bounds
                ) {
                    return;
                }


                const x =
                    event.clientX - bounds.left;

                const y =
                    event.clientY - bounds.top;


                const centerX =
                    bounds.width / 2;

                const centerY =
                    bounds.height / 2;


                const rotateX =
                    ((y - centerY) / centerY) * -2.2;

                const rotateY =
                    ((x - centerX) / centerX) * 2.2;


                const moveX =
                    ((x - centerX) / centerX) * 3;

                const moveY =
                    ((y - centerY) / centerY) * 3;


                card.style.setProperty(
                    "--card-x",
                    `${moveX}px`
                );

                card.style.setProperty(
                    "--card-y",
                    `${moveY}px`
                );

                card.style.setProperty(
                    "--rotate-x",
                    `${rotateX}deg`
                );

                card.style.setProperty(
                    "--rotate-y",
                    `${rotateY}deg`
                );

            },
            { passive: true }
        );


        card.addEventListener(
            "mouseleave",
            () => {

                card.classList.remove("is-hovered");

                card.style.setProperty(
                    "--card-x",
                    "0px"
                );

                card.style.setProperty(
                    "--card-y",
                    "0px"
                );

                card.style.setProperty(
                    "--rotate-x",
                    "0deg"
                );

                card.style.setProperty(
                    "--rotate-y",
                    "0deg"
                );

                bounds = null;

            },
            { passive: true }
        );

    });


    /* =====================================================
       WATERMARK PARALLAX
    ===================================================== */

    if (watermark && !reduceMotion) {

        let ticking = false;


        const updateWatermark = () => {

            if (window.innerWidth <= 900) {

                watermark.style.transform =
                    "translate3d(-50%, -50%, 0)";

                ticking = false;

                return;
            }


            const rect =
                approach.getBoundingClientRect();


            const viewportHeight =
                window.innerHeight;


            /*
                Progress through viewport.

                0 = section entering
                1 = section leaving
            */

            const progress =
                (
                    viewportHeight - rect.top
                ) /
                (
                    viewportHeight + rect.height
                );


            const clampedProgress =
                Math.max(
                    0,
                    Math.min(
                        1,
                        progress
                    )
                );


            /*
                Very subtle movement.
                Apple-style = restrained.
            */

            const movement =
                (clampedProgress - 0.5) * 70;


            watermark.style.transform =
                `
                translate3d(
                    calc(-50% + ${movement}px),
                    calc(-50% + ${movement * 0.35}px),
                    0
                )
                rotate(-90deg)
                `;


            ticking = false;

        };


        const requestWatermarkUpdate = () => {

            if (ticking) return;

            ticking = true;

            requestAnimationFrame(
                updateWatermark
            );

        };


        window.addEventListener(
            "scroll",
            requestWatermarkUpdate,
            {
                passive: true
            }
        );


        window.addEventListener(
            "resize",
            requestWatermarkUpdate,
            {
                passive: true
            }
        );


        updateWatermark();

    }


    /* =====================================================
       POINTER GLOW
    ===================================================== */

    cards.forEach((card) => {

        card.addEventListener(
            "pointermove",
            (event) => {

                if (
                    window.innerWidth <= 900 ||
                    reduceMotion
                ) {
                    return;
                }


                const rect =
                    card.getBoundingClientRect();


                const x =
                    event.clientX - rect.left;

                const y =
                    event.clientY - rect.top;


                card.style.setProperty(
                    "--mouse-x",
                    `${x}px`
                );

                card.style.setProperty(
                    "--mouse-y",
                    `${y}px`
                );

            },
            { passive: true }
        );

    });


    /* =====================================================
       CLEANUP ON RESIZE
    ===================================================== */

    window.addEventListener(
        "resize",
        () => {

            if (window.innerWidth <= 900) {

                cards.forEach((card) => {

                    card.style.setProperty(
                        "--card-x",
                        "0px"
                    );

                    card.style.setProperty(
                        "--card-y",
                        "0px"
                    );

                    card.style.setProperty(
                        "--rotate-x",
                        "0deg"
                    );

                    card.style.setProperty(
                        "--rotate-y",
                        "0deg"
                    );

                });

            }

        },
        { passive: true }
    );


});

/* =========================================================
   PROCESS REEL — scroll-driven scrollytelling (monochrome)
   ========================================================= */

function setupProcessReel() {

    const reel = document.querySelector(".process-reel");
    if (!reel) return;

    const stepEls = Array.from(reel.querySelectorAll(".reel-step"));
    const numEl = reel.querySelector(".reel-num");
    const titleEl = reel.querySelector(".reel-title");
    const descEl = reel.querySelector(".reel-desc");
    const fillEl = reel.querySelector(".reel-fill");
    const ghostNumEl = reel.querySelector(".reel-ghost-num");
    const dots = Array.from(reel.querySelectorAll(".reel-dot"));

    if (!stepEls.length || !numEl || !titleEl || !descEl || !fillEl) return;

    let currentStep = -1;
    let ticking = false;

    function setActive(index) {
        currentStep = index;
        const stepEl = stepEls[index];

        numEl.textContent = stepEl.dataset.num;
        titleEl.textContent = stepEl.dataset.title;
        descEl.textContent = stepEl.dataset.desc;
        if (ghostNumEl) ghostNumEl.textContent = stepEl.dataset.num;

        reel.dataset.activeStep = String(index);

        dots.forEach((dot, i) => dot.classList.toggle("active", i === index));
    }

    function update() {
        const reelRect = reel.getBoundingClientRect();
        const scrollable = reel.offsetHeight - window.innerHeight;
        const progress = scrollable > 0
            ? Math.min(Math.max(-reelRect.top / scrollable, 0), 1)
            : 0;

        fillEl.style.width = `${progress * 100}%`;

        const viewportAnchor = window.innerHeight * 0.5;
        let activeIndex = 0;

        stepEls.forEach((stepEl, i) => {
            const r = stepEl.getBoundingClientRect();
            if (r.top <= viewportAnchor && r.bottom > viewportAnchor) activeIndex = i;
        });

        if (reelRect.top > 0) activeIndex = 0;
        if (reelRect.bottom <= window.innerHeight) activeIndex = stepEls.length - 1;

        if (activeIndex !== currentStep) setActive(activeIndex);

        ticking = false;
    }

    window.addEventListener("scroll", () => {
        if (!ticking) {
            requestAnimationFrame(update);
            ticking = true;
        }
    }, { passive: true });

    window.addEventListener("resize", () => requestAnimationFrame(update));

    dots.forEach((dot, i) => {
        dot.addEventListener("click", () => {
            stepEls[i].scrollIntoView({ behavior: "smooth", block: "center" });
        });
    });

    setActive(0);
    update();

}


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    setupScrollReveal();
    setupBackToTop();
    setupHeroParallax();
    setupProcessReel();
});

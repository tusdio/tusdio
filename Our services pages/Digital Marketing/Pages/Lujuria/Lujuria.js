/* =========================================================
   NAV — mobile toggle + Firebase auth state
   (exact nav logic as supplied)
========================================================= */

(function initNav() {

    "use strict";

    const menuToggle =
        document.querySelector(".menu-toggle");

    const primaryNav =
        document.querySelector("header nav");

    if (menuToggle && primaryNav) {

        menuToggle.addEventListener("click", () => {

            primaryNav.classList.toggle("active");

            const isExpanded =
                primaryNav.classList.contains("active");

            menuToggle.setAttribute(
                "aria-expanded",
                String(isExpanded)
            );

        });


        // Close the menu once a link inside it is used.
        primaryNav
            .querySelectorAll("a")
            .forEach(link => {

                link.addEventListener("click", () => {

                    primaryNav.classList.remove("active");

                    menuToggle.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                });

            });


        // Close on outside click.
        document.addEventListener(
            "click",
            event => {

                const isOpen =
                    primaryNav.classList.contains("active");

                if (!isOpen) return;

                const clickedInside =
                    primaryNav.contains(event.target) ||
                    menuToggle.contains(event.target);

                if (!clickedInside) {

                    primaryNav.classList.remove("active");

                    menuToggle.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }

            }
        );


        // Close on Escape.
        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Escape" &&
                    primaryNav.classList.contains("active")
                ) {

                    primaryNav.classList.remove("active");

                    menuToggle.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }

            }
        );

    }


    const navUserArea =
        document.getElementById("navUserArea");

    if (!navUserArea) return;

    const OWNER_EMAIL = "bittukhantusharkhan@gmail.com";

    const showLoggedOutState = () => {

        navUserArea.innerHTML =
            `<a href="../../../../Nav Bar/auth/login.html">Login</a>`;

    };


    (async () => {

        try {

            const [
                { auth },
                { onAuthStateChanged, signOut }
            ] = await Promise.all([
                import("../../../../Nav Bar/auth/firebase-config.js"),
                import("https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js")
            ]);

            if (!auth) {

                throw new Error(
                    "firebase-config.js did not export `auth`"
                );

            }

            onAuthStateChanged(auth, user => {

                if (!user) {

                    showLoggedOutState();

                    return;

                }

                const name =
                    user.displayName ||
                    (
                        user.email
                            ? user.email.split("@")[0]
                            : "User"
                    );

                const isOwner =
                    (user.email || "").toLowerCase() ===
                    OWNER_EMAIL.toLowerCase();

                const dashboardLink =
                    isOwner
                        ? "../../../../Nav Bar/auth/owner/owner.html"
                        : "../../../../Nav Bar/auth/users.html";

                navUserArea.innerHTML = `
                    <div class="nav-user-box">
                        <span class="nav-user-name">${name}</span>
                        <a href="${dashboardLink}" class="nav-user-btn">Dashboard</a>
                        <button id="logoutNavBtn" class="nav-user-btn" type="button">Logout</button>
                    </div>
                `;

                const logoutNavBtn =
                    document.getElementById("logoutNavBtn");

                if (logoutNavBtn) {

                    logoutNavBtn.addEventListener(
                        "click",
                        async () => {

                            try {

                                await signOut(auth);

                                window.location.href =
                                    "../../../../Nav Bar/auth/login.html";

                            } catch (error) {

                                console.error(
                                    "Logout failed:",
                                    error
                                );

                            }

                        }
                    );

                }

            }, error => {

                console.error(
                    "Auth state listener error:",
                    error
                );

                showLoggedOutState();

            });

        } catch (error) {

            console.error(
                "Auth unavailable — falling back to a plain " +
                "Login link:",
                error
            );

            showLoggedOutState();

        }

    })();

})();


/* =========================================================
   PAGE ANIMATION — Apple-style scroll reveals

   Base CSS renders everything fully visible, so if GSAP
   fails to load (network issue, CDN blocked) or the person
   prefers reduced motion, the page still works and reads
   fine with no animation at all. Everything below is a
   progressive enhancement on top of that.
========================================================= */
document.addEventListener("DOMContentLoaded", function () {

    const header = document.getElementById("site-header");
    const hasGSAP = typeof gsap !== "undefined" && typeof ScrollTrigger !== "undefined";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (!hasGSAP || reduceMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    /* ---------- Header compacts on scroll ---------- */
    if (header) {
        ScrollTrigger.create({
            start: "top -80",
            end: 99999,
            onUpdate: (self) => {
                header.classList.toggle("is-compact", self.scroll() > 80);
            }
        });
    }

    /* ---------- Magnetic buttons ---------- */
    if (canHover) {
        document.querySelectorAll(".magnetic").forEach((el) => {
            el.addEventListener("mousemove", (e) => {
                const r = el.getBoundingClientRect();
                const relX = e.clientX - r.left - r.width / 2;
                const relY = e.clientY - r.top - r.height / 2;
                gsap.to(el, { x: relX * 0.3, y: relY * 0.3, duration: 0.4, ease: "power3.out" });
            });
            el.addEventListener("mouseleave", () => {
                gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: "power3.out" });
            });
        });
    }

    /* ======================================================================
       HERO — load-in: eyebrow, title mask, filigree, subtitle, CTA, credit
       ====================================================================== */
    const heroLines = document.querySelectorAll(".hero-inner .reveal-line");
    gsap.set(heroLines, { yPercent: 110 });
    gsap.set(".hero-inner .ghost-button, .hero-credit", { opacity: 0 });
    gsap.set(".scroll-cue", { opacity: 0 });

    const heroTl = gsap.timeline({ delay: 0.15 });
    heroTl
        .to(".hero-eyebrow .reveal-line", { yPercent: 0, duration: 0.9, ease: "power4.out" })
        .to(".hero-word .reveal-line", { yPercent: 0, duration: 1.2, ease: "power4.out" }, "-=0.55")
        .to(".hero-sub .reveal-line", { yPercent: 0, duration: 1, ease: "power4.out" }, "-=0.75")
        .to(".hero-inner .ghost-button", { opacity: 1, duration: 0.8, ease: "power2.out" }, "-=0.5")
        .to(".hero-credit", { opacity: 1, duration: 0.8, ease: "power2.out" }, "-=0.5")
        .to(".scroll-cue", { opacity: 1, duration: 0.8, ease: "power2.out" }, "-=0.5");

    /* ---------- Hero pin/scale/fade as the page scrolls past it ---------- */
    gsap.to(".hero-inner", {
        scale: 0.92,
        opacity: 0,
        y: -40,
        ease: "none",
        scrollTrigger: {
            trigger: ".hero-section",
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    });
    gsap.to(".hero-tile-pattern", {
        opacity: 0,
        ease: "none",
        scrollTrigger: {
            trigger: ".hero-section",
            start: "top top",
            end: "bottom top",
            scrub: true
        }
    });

    /* ======================================================================
       HEADINGS — masked line reveal on scroll (site-wide)
       ====================================================================== */
    document.querySelectorAll(".reveal-mask .reveal-line").forEach((line) => {
        if (line.closest(".hero-inner")) return; // already handled by the hero timeline
        gsap.set(line, { yPercent: 110 });
        gsap.to(line, {
            yPercent: 0,
            duration: 1,
            ease: "power4.out",
            scrollTrigger: { trigger: line, start: "top 88%" }
        });
    });

    /* ======================================================================
       BLOCK COPY — paragraphs fade up as they enter view
       ====================================================================== */
    document.querySelectorAll(".block-copy").forEach((p) => {
        gsap.set(p, { opacity: 0, y: 24 });
        gsap.to(p, {
            opacity: 1, y: 0, duration: 1, ease: "power3.out",
            scrollTrigger: { trigger: p, start: "top 88%" }
        });
    });

    /* ======================================================================
       PANEL MARKS (I / II) — fade + drift in
       ====================================================================== */
    document.querySelectorAll(".panel-mark, .service-mark").forEach((mark) => {
        gsap.set(mark, { opacity: 0 });
        gsap.to(mark, {
            opacity: 1, duration: 1.1, ease: "power2.out",
            scrollTrigger: { trigger: mark, start: "top 90%" }
        });
    });

    /* ======================================================================
       SERVICE LISTS — staggered entrance
       ====================================================================== */
    document.querySelectorAll(".split-list").forEach((list) => {
        const items = list.querySelectorAll("li");
        gsap.set(items, { opacity: 0, y: 16 });
        gsap.to(items, {
            opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.1,
            scrollTrigger: { trigger: list, start: "top 85%" }
        });
    });

    /* ======================================================================
       GALLERY & STORY IMAGES — clip reveal + ambient parallax
       ====================================================================== */
    document.querySelectorAll("[data-reveal-image]").forEach((wrap) => {
        const img = wrap.querySelector("img");
        if (!img) return;

        gsap.set(wrap, { clipPath: "inset(100% 0% 0% 0%)" });

        gsap.to(wrap, {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.2,
            ease: "expo.out",
            scrollTrigger: { trigger: wrap, start: "top 92%" }
        });

        gsap.fromTo(img,
            { scale: 1.12 },
            {
                scale: 1,
                duration: 1.4,
                ease: "power4.out",
                scrollTrigger: { trigger: wrap, start: "top 92%" }
            }
        );

        /* Subtle continuous depth while the image is in view */
        gsap.to(img, {
            yPercent: -6,
            ease: "none",
            scrollTrigger: {
                trigger: wrap,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.6
            }
        });
    });

    /* ======================================================================
       CTA — fade up close
       ====================================================================== */
    gsap.set(".cta-section .gold-button", { opacity: 0, y: 20 });
    gsap.to(".cta-section .gold-button", {
        opacity: 1, y: 0, duration: 0.9, ease: "power3.out",
        scrollTrigger: { trigger: ".cta-section", start: "top 75%" }
    });

});

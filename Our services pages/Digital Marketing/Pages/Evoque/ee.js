/* =========================================================
   NAV — mobile toggle + Firebase auth state

   Runs immediately (this script tag is `defer`, so the DOM
   is already parsed by the time this executes) rather than
   waiting on the DOMContentLoaded block below, so the auth
   widget in the header resolves as early as possible and
   isn't coupled to the GSAP/ScrollTrigger setup that follows.

   The Firebase imports use a dynamic import() inside a
   try/catch: if firebase-config.js 404s, has a typo, or the
   SDK fails to load, a static import would throw and kill
   the whole module — including the plain menu-toggle click
   handler. A dynamic import contains that failure so the nav
   still falls back to a working "Login" link instead of a
   dead header.
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

                // onAuthStateChanged's own error callback —
                // fires on permission/network problems even
                // after a successful import.
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


document.addEventListener("DOMContentLoaded", function () {

    const header = document.getElementById("site-header");
    const hasGSAP = typeof gsap !== "undefined";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    if (hasGSAP && typeof ScrollTrigger !== "undefined") gsap.registerPlugin(ScrollTrigger);

    /* ---------- Header compacts on scroll ---------- */
    if (header && hasGSAP) {
        ScrollTrigger.create({
            start: "top -80",
            end: 99999,
            onUpdate: (self) => {
                header.classList.toggle("is-compact", self.scroll() > 80);
            }
        });
    }

    /* ---------- Magnetic CTA ---------- */
    if (hasGSAP && canHover) {
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

    if (!hasGSAP) return;

    /* ======================================================================
       HERO — load animation: metadata, title mask, subtitle, cue
       ====================================================================== */
    if (reduceMotion) {
        gsap.set(".hero .reveal-line, .reveal-hero .frame-caption", { y: "0%", opacity: 1 });
        gsap.set("[data-reveal-image]", { clipPath: "inset(0%)" });
        gsap.set("[data-parallax-img]", { scale: 1 });
    } else {
        const heroTl = gsap.timeline({ delay: 0.2 });
        heroTl
            .to(".hero-meta .reveal-line", { y: "0%", duration: 0.9, ease: "power4.out", stagger: 0.1 })
            .to(".hero-title .reveal-line", { y: "0%", duration: 1.3, ease: "power4.out" }, "-=0.55")
            .to(".hero-sub .reveal-line", { y: "0%", duration: 1, ease: "power4.out" }, "-=0.8")
            .to(".hero-scroll-cue .reveal-line", { y: "0%", duration: 0.8, ease: "power3.out" }, "-=0.5");
    }

    /* ======================================================================
       SECTION HEADINGS — masked reveal on scroll
       ====================================================================== */
    if (!reduceMotion) {
        gsap.utils.toArray(
            ".minimal-block .reveal-line, .social-head .reveal-line, .gallery-head .reveal-line, " +
            ".stories-head .reveal-line, .split-block-heading .reveal-line, " +
            ".performance .eyebrow.reveal-mask .reveal-line, " +
            ".performance .block-heading .reveal-line, .closing-title .reveal-line"
        ).forEach((line) => {
            gsap.to(line, {
                y: "0%",
                duration: 1,
                ease: "power4.out",
                scrollTrigger: { trigger: line, start: "top 90%" }
            });
        });
    } else {
        gsap.set(
            ".minimal-block .reveal-line, .social-head .reveal-line, .gallery-head .reveal-line, " +
            ".stories-head .reveal-line, .split-block-heading .reveal-line, " +
            ".performance .reveal-line, .closing-title .reveal-line",
            { y: "0%" }
        );
    }

    /* ======================================================================
       BLOCK COPY — smooth-block fade for section body text
       ====================================================================== */
    const blockCopy = document.querySelectorAll(".block-copy");
    if (blockCopy.length) {
        if (reduceMotion) {
            gsap.set(blockCopy, { opacity: 1, y: 0 });
        } else {
            blockCopy.forEach((p) => {
                gsap.to(p, {
                    opacity: 1, y: 0, duration: 1, ease: "power3.out",
                    scrollTrigger: { trigger: p, start: "top 88%" }
                });
            });
        }
    }

    /* ======================================================================
       IMAGE REVEALS + ambient parallax (first reveal, pair, gallery, moments)
       ====================================================================== */
    document.querySelectorAll("[data-reveal-image]").forEach((wrap) => {
        const img = wrap.querySelector("[data-parallax-img], img");
        if (!img) return;

        const postTag = wrap.querySelector(".post-tag");

        if (reduceMotion) {
            if (postTag) gsap.set(postTag, { opacity: 1, y: 0 });
            return;
        }

        const slide = wrap.getAttribute("data-slide");
        const fromX = slide === "left" ? -40 : slide === "right" ? 40 : 0;

        const tl = gsap.timeline({
            scrollTrigger: { trigger: wrap, start: "top 85%" }
        });

        if (fromX !== 0) tl.from(wrap, { x: fromX, duration: 1.1, ease: "power3.out" }, 0);

        tl.to(wrap, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.3, ease: "expo.out" }, 0)
          .to(img, { scale: 1.02, duration: 1.7, ease: "power4.out" }, 0.1);

        if (postTag) {
            tl.to(postTag, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, 0.55);
        }

        /* ambient parallax while in view */
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
       SOCIAL LIST — stagger entrance + hover preview swap
       ====================================================================== */
    const socialItems = document.querySelectorAll(".social-item");
    const socialPreview = document.querySelector(".social-preview");
    const socialPreviewImg = document.querySelector("[data-social-preview-img]");

    if (!reduceMotion) {
        gsap.timeline({
            scrollTrigger: { trigger: ".social-list", start: "top 78%" }
        }).to(socialItems, { opacity: 1, y: 0, duration: 0.85, ease: "power3.out", stagger: 0.1 });
    } else {
        gsap.set(socialItems, { opacity: 1, y: 0 });
    }

    if (canHover && socialPreview && socialPreviewImg) {
        socialItems.forEach((item) => {
            item.addEventListener("mouseenter", () => {
                const src = item.getAttribute("data-preview");
                if (src) socialPreviewImg.setAttribute("src", src);
                socialPreview.classList.add("is-visible");
            });
            item.addEventListener("mouseleave", () => {
                socialPreview.classList.remove("is-visible");
            });
        });
    }

    /* ======================================================================
       SPLIT LISTS + PERFORMANCE GRID — staggered entrance
       ====================================================================== */
    gsap.utils.toArray(".split-list").forEach((list) => {
        const items = list.querySelectorAll("li");
        if (reduceMotion) { gsap.set(items, { opacity: 1, y: 0 }); return; }
        gsap.to(items, {
            opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.1,
            scrollTrigger: { trigger: list, start: "top 78%" }
        });
    });

    const perfTerms = document.querySelectorAll(".performance-term");
    if (perfTerms.length) {
        if (reduceMotion) {
            gsap.set(perfTerms, { opacity: 1, y: 0 });
        } else {
            gsap.to(perfTerms, {
                opacity: 1, y: 0, duration: 0.8, ease: "power3.out", stagger: 0.1,
                scrollTrigger: { trigger: ".performance-grid", start: "top 82%" }
            });
        }
    }

    /* ======================================================================
       STORIES — horizontal pinned track with continuous focus + counter
       ====================================================================== */
    const storiesTrack = document.querySelector(".stories-track");
    const storiesPin = document.querySelector(".stories-pin");
    const storyFrames = gsap.utils.toArray(".story-frame");
    const counterEl = document.getElementById("story-counter-current");

    function updateCounter(index) {
        if (counterEl) counterEl.textContent = String(index + 1).padStart(2, "0");
    }

    function setActiveStory(index) {
        storyFrames.forEach((f, i) => f.classList.toggle("is-active", i === index));
        updateCounter(index);
    }

    /* Continuously scales/fades every frame by its live distance from the
       viewport center, instead of flipping a single frame between two fixed
       states — this is what makes the focus glide smoothly with the scrub
       rather than snap between steps. */
    function updateStoryFocus() {
        const trackX = gsap.getProperty(storiesTrack, "x") || 0;
        const viewportCenter = window.innerWidth / 2;
        const falloff = Math.max(280, window.innerWidth * 0.55);

        let nearestIndex = 0;
        let nearestDist = Infinity;

        storyFrames.forEach((frame, i) => {
            const frameCenter = trackX + frame.offsetLeft + frame.offsetWidth / 2;
            const dist = Math.abs(frameCenter - viewportCenter);
            const norm = Math.min(1, dist / falloff);

            gsap.set(frame, {
                scale: 1 - norm * 0.16,
                opacity: 1 - norm * 0.6
            });

            if (dist < nearestDist) { nearestDist = dist; nearestIndex = i; }
        });

        updateCounter(nearestIndex);
    }

    function setupSwipeFallback() {
        storyFrames.forEach((frame) => frame.classList.add("is-active"));

        let ticking = false;
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const center = storiesTrack.scrollLeft + storiesTrack.clientWidth / 2;
                let closest = 0;
                let closestDist = Infinity;
                storyFrames.forEach((f, i) => {
                    const dist = Math.abs((f.offsetLeft + f.clientWidth / 2) - center);
                    if (dist < closestDist) { closestDist = dist; closest = i; }
                });
                updateCounter(closest);
                ticking = false;
            });
        };

        storiesTrack.addEventListener("scroll", onScroll, { passive: true });
        onScroll();

        return () => storiesTrack.removeEventListener("scroll", onScroll);
    }

    if (storiesTrack && storiesPin && storyFrames.length) {
        setActiveStory(0);

        if (reduceMotion) {
            /* Reduced motion: no pin, no scrub — plain swipeable/scrollable track
               at every viewport width, matching the CSS reduce-motion fallback. */
            document.documentElement.classList.add("reduce-motion");
            setupSwipeFallback();
        } else {
            ScrollTrigger.matchMedia({
                "(min-width: 900px)": function () {
                    const getDistance = () => storiesTrack.scrollWidth - window.innerWidth;

                    const st = ScrollTrigger.create({
                        trigger: storiesPin,
                        start: "top top",
                        end: () => "+=" + getDistance(),
                        scrub: 1,
                        pin: true,
                        invalidateOnRefresh: true,
                        animation: gsap.to(storiesTrack, { x: () => -getDistance(), ease: "none" }),
                        onUpdate: updateStoryFocus
                    });

                    return () => {
                        gsap.set(storiesTrack, { clearProps: "transform" });
                        gsap.set(storyFrames, { clearProps: "scale,opacity" });
                        st.kill();
                    };
                },
                "(max-width: 899px)": function () {
                    return setupSwipeFallback();
                }
            });
        }
    }

    /* ======================================================================
       CLOSING CTA
       ====================================================================== */
    if (!reduceMotion) {
        gsap.fromTo(".closing-brand, .closing-cta", { opacity: 0, y: 16 }, {
            opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.1,
            scrollTrigger: { trigger: ".closing", start: "top 75%" }
        });
    } else {
        gsap.set(".closing-brand, .closing-cta", { opacity: 1 });
    }
});

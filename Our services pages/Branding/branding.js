/* =========================================================
   TUSDIO — BRANDING
   Interaction + scroll engine
========================================================= */


/* =========================================================
   NAV — mobile toggle + Firebase auth state
   Shared across pages: dynamic import so a broken auth
   config degrades to a plain "Login" link instead of
   killing the menu-toggle handler.
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
            `<a href="../../Nav Bar/auth/login.html">Login</a>`;

    };


    (async () => {

        try {

            const [
                { auth },
                { onAuthStateChanged, signOut }
            ] = await Promise.all([
                import("../../Nav Bar/auth/firebase-config.js"),
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
                        ? "../../Nav Bar/auth/owner/owner.html"
                        : "../../Nav Bar/auth/users.html";

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
                                    "../../Nav Bar/auth/login.html";

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


document.addEventListener("DOMContentLoaded", () => {

    "use strict";


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const progressBar =
        document.querySelector(".scroll-progress span");

    const hero =
        document.querySelector(".hero");

    const heroTitle =
        document.querySelector(".hero-title");

    const heroPhoto =
        document.querySelector(".hero-photo img");

    const revealElements =
        document.querySelectorAll(".reveal");

    const caseStudies =
        document.querySelectorAll(".case-study");

    const capabilities =
        document.querySelectorAll(".capability");

    const backToTop =
        document.querySelector(".back-to-top");

    const footerYear =
        document.getElementById("footerYear");


    const reducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;


    if (footerYear) {

        footerYear.textContent =
            String(new Date().getFullYear());

    }


    /* =====================================================
       BROKEN IMAGE FALLBACK
    ===================================================== */

    document
        .querySelectorAll("img[data-fallback-initials]")
        .forEach(img => {

            img.addEventListener("error", () => {

                const wrap =
                    img.closest(".case-image-wrap") ||
                    img.closest(".hero-photo");

                if (!wrap) return;

                if (wrap.querySelector(".img-fallback")) {

                    img.style.display = "none";

                    return;

                }

                const fallback =
                    document.createElement("div");

                fallback.className = "img-fallback";

                fallback.textContent =
                    img.getAttribute("data-fallback-initials") || "?";

                img.style.display = "none";

                wrap.appendChild(fallback);

            });

        });


    /* =====================================================
       SCROLL PROGRESS + BACK TO TOP
    ===================================================== */

    let scrollTicking = false;

    const updateScrollProgress = () => {

        const scrollTop = window.scrollY;

        const documentHeight =
            document.documentElement.scrollHeight -
            window.innerHeight;

        const progress =
            documentHeight > 0
                ? Math.min(1, Math.max(0, scrollTop / documentHeight))
                : 0;

        if (progressBar) {
            progressBar.style.height = `${progress * 100}%`;
        }

        if (backToTop) {
            backToTop.classList.toggle(
                "visible",
                scrollTop > window.innerHeight * .6
            );
        }

        scrollTicking = false;

    };

    if (backToTop) {

        backToTop.addEventListener("click", () => {

            window.scrollTo({
                top: 0,
                behavior: reducedMotion ? "auto" : "smooth"
            });

        });

    }


    /* =====================================================
       HERO PARALLAX
    ===================================================== */

    const updateHero = () => {

        if (reducedMotion || !hero || !heroTitle) return;

        const scroll = window.scrollY;
        const heroHeight = hero.offsetHeight;

        if (scroll < heroHeight) {

            const progress = Math.min(1, scroll / heroHeight);

            const translate = progress * -60;
            const opacity = 1 - progress * 1.1;

            heroTitle.style.transform =
                `translate3d(0, ${translate}px, 0)`;

            heroTitle.style.opacity =
                Math.max(0, opacity);

            if (heroPhoto) {

                heroPhoto.style.transform =
                    `translate3d(0, ${progress * 40}px, 0) scale(1.04)`;

            }

        }

    };


    /* =====================================================
       SCROLL ENGINE
    ===================================================== */

    const onScroll = () => {

        if (!scrollTicking) {

            requestAnimationFrame(() => {
                updateScrollProgress();
                updateHero();
            });

            scrollTicking = true;

        }

    };

    window.addEventListener("scroll", onScroll, { passive: true });


    /* =====================================================
       REVEALS
    ===================================================== */

    if ("IntersectionObserver" in window) {

        const revealObserver = new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (!entry.isIntersecting) return;

                    entry.target.classList.add("is-visible");

                    revealObserver.unobserve(entry.target);

                });

            },
            { threshold: .12, rootMargin: "0px 0px -7% 0px" }
        );

        revealElements.forEach(el => revealObserver.observe(el));

    } else {

        revealElements.forEach(el => el.classList.add("is-visible"));

    }


    /* =====================================================
       CASE STUDY IN-VIEW HIGHLIGHT
    ===================================================== */

    if (caseStudies.length && "IntersectionObserver" in window) {

        const caseObserver = new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    entry.target.classList.toggle(
                        "in-view",
                        entry.isIntersecting
                    );

                });

            },
            { threshold: .35, rootMargin: "0px 0px -10% 0px" }
        );

        caseStudies.forEach(item => caseObserver.observe(item));

    } else {

        caseStudies.forEach(item => item.classList.add("in-view"));

    }


    /* =====================================================
       CAPABILITY ACCORDION
    ===================================================== */

    capabilities.forEach(capability => {

        const trigger =
            capability.querySelector(".capability-trigger");

        if (!trigger) return;

        trigger.addEventListener("click", () => {

            const isOpen = capability.classList.contains("open");

            capabilities.forEach(other => {

                if (other !== capability) {

                    other.classList.remove("open");

                    const otherTrigger =
                        other.querySelector(".capability-trigger");

                    if (otherTrigger) {
                        otherTrigger.setAttribute("aria-expanded", "false");
                    }

                }

            });

            capability.classList.toggle("open", !isOpen);

            trigger.setAttribute("aria-expanded", String(!isOpen));

        });

    });


    const canHover =
        window.matchMedia("(hover: hover)").matches;


    /* =====================================================
       CASE IMAGE MOUSE PARALLAX
    ===================================================== */

    if (canHover && !reducedMotion) {

        const imageLinks =
            document.querySelectorAll(".case-image-link img");

        imageLinks.forEach(image => {

            const wrapper = image.closest(".case-image-wrap");

            if (!wrapper) return;

            wrapper.addEventListener("mousemove", event => {

                const rect = wrapper.getBoundingClientRect();

                const x = (event.clientX - rect.left) / rect.width;
                const y = (event.clientY - rect.top) / rect.height;

                const moveX = (x - .5) * 10;
                const moveY = (y - .5) * 10;

                image.style.transform =
                    `scale(1.025) translate(${moveX}px, ${moveY}px)`;

            });

            wrapper.addEventListener("mouseleave", () => {
                image.style.transform = "";
            });

        });

    }


    /* =====================================================
       SMOOTH ANCHOR LINKS
    ===================================================== */

    document
        .querySelectorAll('a[href^="#"]')
        .forEach(link => {

            link.addEventListener("click", event => {

                const targetID = link.getAttribute("href");

                if (!targetID || targetID === "#") return;

                const target = document.querySelector(targetID);

                if (!target) return;

                event.preventDefault();

                target.scrollIntoView({
                    behavior: reducedMotion ? "auto" : "smooth"
                });

            });

        });


    /* =====================================================
       INITIAL STATE + RESIZE
    ===================================================== */

    updateScrollProgress();
    updateHero();

    let resizeTimer;

    window.addEventListener("resize", () => {

        clearTimeout(resizeTimer);

        resizeTimer = setTimeout(() => {
            updateScrollProgress();
            updateHero();
        }, 150);

    });

});

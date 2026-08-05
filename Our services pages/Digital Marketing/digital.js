/* =========================================================
   TUSDIO — DIGITAL MARKETING
   Interaction + scroll engine
========================================================= */


/* =========================================================
   NAV — mobile toggle + Firebase auth state

   Merged in from the standalone nav.js. This runs
   immediately (the script tag is `defer`, so the DOM is
   already parsed by the time this executes) rather than
   waiting on the DOMContentLoaded block below, since the
   auth widget in the header should resolve as early as
   possible.

   The Firebase imports are loaded with a dynamic import()
   inside a try/catch. That's the fix for "login isn't
   working": the previous version used static `import`
   statements in a separate `type="module"` script — if
   `../auth/firebase-config.js` 404s, has a typo, or the
   Firebase SDK fails to load, a static import throws and
   silently kills the ENTIRE module, including the plain
   menu-toggle click handler. With a dynamic import, that
   failure is caught, logged, and the nav still falls back
   to a working "Login" link instead of a dead header.
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

    const cursor =
        document.querySelector(".cursor");

    const cursorLabel =
        document.querySelector("[data-cursor-label]");

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



    /* =====================================================
       REDUCED MOTION
    ===================================================== */

    const reducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;



    /* =====================================================
       FOOTER YEAR — was hardcoded, now stays correct
    ===================================================== */

    if (footerYear) {

        footerYear.textContent =
            String(new Date().getFullYear());

    }



    /* =====================================================
       BROKEN IMAGE FALLBACK
       Swaps any image that fails to load for a styled
       placeholder instead of leaving a broken-icon box.
    ===================================================== */

    document
        .querySelectorAll("img[data-fallback-initials]")
        .forEach(img => {

            img.addEventListener("error", () => {

                const wrap =
                    img.closest(".case-image-wrap");

                if (!wrap) return;

                // Avoid inserting more than one fallback
                // if both lashkaraa images fail.
                if (
                    wrap.querySelector(".img-fallback")
                ) {

                    img.style.display = "none";

                    return;

                }

                const fallback =
                    document.createElement("div");

                fallback.className = "img-fallback";

                fallback.textContent =
                    img.getAttribute(
                        "data-fallback-initials"
                    ) || "?";

                img.style.display = "none";

                wrap.appendChild(fallback);

            });

        });



    /* =====================================================
    /* =====================================================
       SCROLL PROGRESS + BACK TO TOP
    ===================================================== */

    let scrollTicking = false;

    const updateScrollProgress = () => {

        const scrollTop =
            window.scrollY;

        const documentHeight =
            document.documentElement.scrollHeight -
            window.innerHeight;

        const progress =
            documentHeight > 0
                ? Math.min(
                    1,
                    Math.max(
                        0,
                        scrollTop / documentHeight
                    )
                )
                : 0;


        if (progressBar) {

            progressBar.style.height =
                `${progress * 100}%`;

        }


        if (backToTop) {

            backToTop.classList.toggle(
                "visible",
                scrollTop > window.innerHeight * .6
            );

        }



        scrollTicking = false;

    };


    window.addEventListener(
        "scroll",
        () => {

            if (!scrollTicking) {

                requestAnimationFrame(
                    updateScrollProgress
                );

                scrollTicking = true;

            }

        },
        { passive: true }
    );


    if (backToTop) {

        backToTop.addEventListener("click", () => {

            window.scrollTo({
                top: 0,
                behavior:
                    reducedMotion ? "auto" : "smooth"
            });

        });

    }



    /* =====================================================
       HERO PARALLAX
    ===================================================== */

    const updateHero = () => {

        if (
            reducedMotion ||
            !hero ||
            !heroTitle
        ) return;


        const scroll =
            window.scrollY;

        const heroHeight =
            hero.offsetHeight;


        if (
            scroll < heroHeight
        ) {

            const progress =
                Math.min(
                    1,
                    scroll / heroHeight
                );


            const translate =
                progress * -80;

            const scale =
                1 -
                progress * .08;

            const opacity =
                1 -
                progress * 1.1;


            heroTitle.style.transform =
                `translate3d(0, ${translate}px, 0) scale(${scale})`;

            heroTitle.style.opacity =
                Math.max(
                    0,
                    opacity
                );


            if (heroPhoto) {

                heroPhoto.style.transform =
                    `translate3d(0, ${progress * 60}px, 0) scale(1.06)`;

            }

        }

    };



    /* =====================================================
       SCROLL ENGINE
    ===================================================== */

    const updateScrollEffects = () => {

        updateHero();

        scrollTicking = false;

    };


    window.addEventListener(
        "scroll",
        () => {

            if (!scrollTicking) {

                requestAnimationFrame(
                    updateScrollEffects
                );

                scrollTicking = true;

            }

        },
        { passive: true }
    );



    /* =====================================================
       INTERSECTION REVEALS
    ===================================================== */

    if (
        "IntersectionObserver" in window
    ) {

        const revealObserver =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (
                            !entry.isIntersecting
                        ) {
                            return;
                        }


                        entry.target
                            .classList
                            .add("is-visible");


                        revealObserver
                            .unobserve(
                                entry.target
                            );

                    });

                },
                {
                    threshold: .12,
                    rootMargin: "0px 0px -7% 0px"
                }
            );


        revealElements.forEach(
            element => {

                revealObserver.observe(
                    element
                );

            }
        );

    } else {

        revealElements.forEach(
            element => {

                element.classList.add(
                    "is-visible"
                );

            }
        );

    }



    /* =====================================================
       CASE STUDY OBSERVER
    ===================================================== */

    if (
        caseStudies.length &&
        "IntersectionObserver" in window
    ) {

        const caseObserver =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target
                                .classList
                                .add("in-view");

                        } else {

                            entry.target
                                .classList
                                .remove("in-view");

                        }

                    });

                },
                {
                    threshold: .35,
                    rootMargin: "0px 0px -10% 0px"
                }
            );


        caseStudies.forEach(
            item => {

                caseObserver.observe(item);

            }
        );

    } else {

        // No IntersectionObserver support: show everything
        // rather than leaving case studies permanently faded.
        caseStudies.forEach(item => {
            item.classList.add("in-view");
        });

    }



    /* =====================================================
       CAPABILITY ACCORDION
    ===================================================== */

    capabilities.forEach(
        capability => {

            const trigger =
                capability.querySelector(
                    ".capability-trigger"
                );


            if (!trigger) return;


            trigger.addEventListener(
                "click",
                () => {

                    const isOpen =
                        capability.classList.contains(
                            "open"
                        );


                    /*
                     * Close all other items.
                     */

                    capabilities.forEach(
                        other => {

                            if (
                                other !== capability
                            ) {

                                other.classList.remove(
                                    "open"
                                );

                                const otherTrigger =
                                    other.querySelector(
                                        ".capability-trigger"
                                    );


                                if (
                                    otherTrigger
                                ) {

                                    otherTrigger
                                        .setAttribute(
                                            "aria-expanded",
                                            "false"
                                        );

                                }

                            }

                        }
                    );


                    /*
                     * Toggle selected item.
                     */

                    capability.classList.toggle(
                        "open",
                        !isOpen
                    );


                    trigger.setAttribute(
                        "aria-expanded",
                        String(!isOpen)
                    );

                }
            );

        }
    );



    /* =====================================================
       CUSTOM CURSOR (with contextual label)
    ===================================================== */

    const canHover =
        window.matchMedia(
            "(hover: hover)"
        ).matches;


    if (
        cursor &&
        canHover &&
        !reducedMotion
    ) {

        let mouseX = 0;
        let mouseY = 0;

        let cursorX = 0;
        let cursorY = 0;


        const animateCursor = () => {

            cursorX +=
                (mouseX - cursorX) * .16;

            cursorY +=
                (mouseY - cursorY) * .16;


            cursor.style.left =
                `${cursorX}px`;

            cursor.style.top =
                `${cursorY}px`;


            requestAnimationFrame(
                animateCursor
            );

        };


        requestAnimationFrame(
            animateCursor
        );


        window.addEventListener(
            "mousemove",
            event => {

                mouseX =
                    event.clientX;

                mouseY =
                    event.clientY;


                cursor.classList.add(
                    "active"
                );

            },
            { passive: true }
        );


        document.addEventListener(
            "mouseleave",
            () => {

                cursor.classList.remove(
                    "active"
                );

            }
        );


        const cursorTargets =
            document.querySelectorAll(
                ".cursor-target"
            );


        cursorTargets.forEach(
            target => {

                target.addEventListener(
                    "mouseenter",
                    () => {

                        cursor.classList.add(
                            "hovering"
                        );

                        const label =
                            target.getAttribute(
                                "data-cursor-label"
                            );

                        if (
                            label &&
                            cursorLabel
                        ) {

                            cursorLabel.textContent =
                                label;

                        }

                    }
                );


                target.addEventListener(
                    "mouseleave",
                    () => {

                        cursor.classList.remove(
                            "hovering"
                        );

                        if (cursorLabel) {

                            cursorLabel.textContent =
                                "VIEW";

                        }

                    }
                );

            }
        );

    }



    /* =====================================================
       PROCESS TABS — swaps the stage image + caption to
       match the selected stage of the campaign process
    ===================================================== */

    const processTabs =
        document.querySelectorAll(".process-tab");

    const processStageImage =
        document.querySelector("[data-stage-image]");

    const processImageSources = {
        strategy:
            "https://images.unsplash.com/photo-1676276374782-39159bc5e7b4?auto=format&fit=crop&w=1400&q=70",
        content:
            "https://images.unsplash.com/photo-1640941850280-930388f1f3cf?auto=format&fit=crop&w=1400&q=70",
        distribution:
            "https://images.unsplash.com/photo-1650735311279-661f56d23291?auto=format&fit=crop&w=1400&q=70",
        performance:
            "https://images.unsplash.com/photo-1686061593213-98dad7c599b9?auto=format&fit=crop&w=1400&q=70"
    };

    if (processTabs.length && processStageImage) {

        // Fade the first image in once it actually loads.
        if (processStageImage.complete) {
            processStageImage.classList.add("is-visible");
        } else {
            processStageImage.addEventListener(
                "load",
                () => processStageImage.classList.add("is-visible"),
                { once: true }
            );
        }

        let processAutoplay = null;

        const activateStage = stage => {

            processTabs.forEach(tab => {

                const isMatch =
                    tab.getAttribute("data-stage") === stage;

                tab.classList.toggle("is-active", isMatch);

                tab.setAttribute(
                    "aria-selected",
                    String(isMatch)
                );

            });

            document
                .querySelectorAll("[data-stage-caption]")
                .forEach(caption => {

                    caption.classList.toggle(
                        "is-active",
                        caption.getAttribute("data-stage-caption") === stage
                    );

                });

            const nextSrc = processImageSources[stage];

            if (nextSrc && !processStageImage.src.includes(nextSrc)) {

                processStageImage.classList.remove("is-visible");

                const preload = new Image();

                preload.onload = () => {
                    processStageImage.src = nextSrc;
                    processStageImage.classList.add("is-visible");
                };

                preload.src = nextSrc;

            }

        };

        processTabs.forEach(tab => {

            tab.addEventListener("click", () => {

                activateStage(
                    tab.getAttribute("data-stage")
                );

                // A manual choice stops the autoplay cycle
                // so the section doesn't fight the visitor.
                clearInterval(processAutoplay);

            });

        });

        // Gently cycle through stages until someone interacts,
        // so the section reads as alive rather than static.
        if (!reducedMotion) {

            const stages =
                Array.from(processTabs).map(
                    tab => tab.getAttribute("data-stage")
                );

            let stageIndex = 0;

            processAutoplay = setInterval(() => {

                stageIndex = (stageIndex + 1) % stages.length;

                activateStage(stages[stageIndex]);

            }, 4200);

        }

    }



    /* =====================================================
       LASHKARAA — hover on desktop, tap on touch/mobile
       (previously only worked with :hover, so touch
       devices could never see the second look)
    ===================================================== */

    const lashkaraaLink =
        document.querySelector(
            ".lashkaraa-link"
        );

    const lashkaraaPrimary =
        document.querySelector(
            ".lashkaraa-wrap .image-primary"
        );

    const lashkaraaSecondary =
        document.querySelector(
            ".lashkaraa-wrap .image-secondary"
        );


    if (
        lashkaraaLink &&
        lashkaraaPrimary &&
        lashkaraaSecondary
    ) {

        lashkaraaLink.addEventListener(
            "click",
            () => {

                const isPressed =
                    lashkaraaLink.getAttribute(
                        "aria-pressed"
                    ) === "true";

                lashkaraaLink.setAttribute(
                    "aria-pressed",
                    String(!isPressed)
                );

            }
        );


        // Auto-rotate on touch devices where hover
        // and tap-to-toggle are both impractical.
        if (!canHover && !reducedMotion) {

            let mobileTimer = null;


            const startMobileRotation = () => {

                if (window.innerWidth > 700) {

                    clearInterval(mobileTimer);

                    return;

                }

                clearInterval(mobileTimer);


                mobileTimer =
                    setInterval(
                        () => {

                            const isPressed =
                                lashkaraaLink.getAttribute(
                                    "aria-pressed"
                                ) === "true";

                            lashkaraaLink.setAttribute(
                                "aria-pressed",
                                String(!isPressed)
                            );

                        },
                        2800
                    );

            };


            startMobileRotation();


            window.addEventListener(
                "resize",
                startMobileRotation
            );

        }

    }



    /* =====================================================
       LASHKARAA "EXPLORE CONCEPT" TOGGLE
       Replaces the previous dead href="#" link with a
       real interaction: it flips the visual in sync.
    ===================================================== */

    const lashkaraaToggleBtn =
        document.querySelector(
            ".case-link-toggle"
        );

    if (lashkaraaToggleBtn && lashkaraaLink) {

        lashkaraaToggleBtn.addEventListener(
            "click",
            () => {

                lashkaraaLink.click();

                const label =
                    lashkaraaToggleBtn.querySelector(
                        ".case-link-text"
                    );

                if (label) {

                    const isPressed =
                        lashkaraaLink.getAttribute(
                            "aria-pressed"
                        ) === "true";

                    label.textContent =
                        isPressed
                            ? "Show look one"
                            : "Explore concept";

                }

            }
        );

    }



    /* =====================================================
       CASE IMAGE MOUSE PARALLAX
    ===================================================== */

    if (
        canHover &&
        !reducedMotion
    ) {

        const imageLinks =
            document.querySelectorAll(
                ".case-image-link img"
            );


        imageLinks.forEach(
            image => {

                const wrapper =
                    image.closest(
                        ".case-image-wrap"
                    );


                if (!wrapper) return;


                wrapper.addEventListener(
                    "mousemove",
                    event => {

                        const rect =
                            wrapper.getBoundingClientRect();


                        const x =
                            (
                                event.clientX -
                                rect.left
                            ) /
                            rect.width;


                        const y =
                            (
                                event.clientY -
                                rect.top
                            ) /
                            rect.height;


                        const moveX =
                            (x - .5) * 10;


                        const moveY =
                            (y - .5) * 10;


                        image.style.transform =
                            `scale(1.025) translate(${moveX}px, ${moveY}px)`;

                    }
                );


                wrapper.addEventListener(
                    "mouseleave",
                    () => {

                        image.style.transform =
                            "";

                    }
                );

            }
        );

    }



    /* =====================================================
       SMOOTH ANCHOR LINKS
    ===================================================== */

    document
        .querySelectorAll(
            'a[href^="#"]'
        )
        .forEach(link => {

            link.addEventListener(
                "click",
                event => {

                    const targetID =
                        link.getAttribute(
                            "href"
                        );


                    if (
                        !targetID ||
                        targetID === "#"
                    ) {

                        return;

                    }


                    const target =
                        document.querySelector(
                            targetID
                        );


                    if (!target) return;


                    event.preventDefault();


                    target.scrollIntoView({
                        behavior:
                            reducedMotion
                                ? "auto"
                                : "smooth"
                    });

                }
            );

        });



    /* =====================================================
       INITIAL STATE
    ===================================================== */


    updateScrollProgress();

    updateHero();



    /* =====================================================
       RESIZE
    ===================================================== */

    let resizeTimer;


    window.addEventListener(
        "resize",
        () => {

            clearTimeout(
                resizeTimer
            );


            resizeTimer =
                setTimeout(
                    () => {

                        updateScrollProgress();
                        updateHero();

                    },
                    150
                );

        }
    );

});

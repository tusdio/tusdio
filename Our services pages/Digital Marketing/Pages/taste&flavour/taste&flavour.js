/* ============================================================
   TUSDIO × TASTE & FLAVOUR
   Luxury Case Study Experience
   ============================================================ */

(function initNavigation() {

    "use strict";

    const menuToggle = document.querySelector(".menu-toggle");
    const primaryNav = document.querySelector(".site-header nav");

    if (!menuToggle || !primaryNav) return;


    menuToggle.addEventListener("click", () => {

        const isOpen = primaryNav.classList.toggle("active");

        menuToggle.setAttribute(
            "aria-expanded",
            String(isOpen)
        );

    });


    primaryNav.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {

            primaryNav.classList.remove("active");

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

        });

    });


    document.addEventListener("click", event => {

        if (!primaryNav.classList.contains("active")) {
            return;
        }

        const inside =
            primaryNav.contains(event.target) ||
            menuToggle.contains(event.target);

        if (!inside) {

            primaryNav.classList.remove("active");

            menuToggle.setAttribute(
                "aria-expanded",
                "false"
            );

        }

    });


    document.addEventListener("keydown", event => {

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

    });

})();


/* ============================================================
   FIREBASE AUTH
   ============================================================ */

(function initFirebaseNavigation() {

    "use strict";

    const navUserArea =
        document.getElementById("navUserArea");

    if (!navUserArea) return;


    const OWNER_EMAIL =
        "bittukhantusharkhan@gmail.com";


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

                import(
                    "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js"
                )

            ]);


            if (!auth) {

                throw new Error(
                    "firebase-config.js did not export auth"
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
                    (
                        user.email || ""
                    ).toLowerCase()
                    === OWNER_EMAIL.toLowerCase();


                const dashboardLink =
                    isOwner
                        ? "../../../../Nav Bar/auth/owner/owner.html"
                        : "../../../../Nav Bar/auth/users.html";


                navUserArea.innerHTML = `

                    <div class="nav-user-box">

                        <span class="nav-user-name">
                            ${name}
                        </span>

                        <a
                            href="${dashboardLink}"
                            class="nav-user-btn">
                            Dashboard
                        </a>

                        <button
                            type="button"
                            class="nav-user-btn"
                            id="navLogout">
                            Logout
                        </button>

                    </div>

                `;


                const logoutButton =
                    document.getElementById("navLogout");


                if (logoutButton) {

                    logoutButton.addEventListener(
                        "click",
                        async () => {

                            try {

                                await signOut(auth);

                                showLoggedOutState();

                            } catch (error) {

                                console.error(
                                    "Logout failed:",
                                    error
                                );

                            }

                        }
                    );

                }

            });


        } catch (error) {

            console.warn(
                "Firebase navigation unavailable:",
                error
            );

            showLoggedOutState();

        }

    })();

})();


/* ============================================================
   EXPERIENCE
   ============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        "use strict";


        const reduceMotion =
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;


        if (
            typeof gsap === "undefined" ||
            typeof ScrollTrigger === "undefined"
        ) {

            return;

        }


        gsap.registerPlugin(ScrollTrigger);


        /* ========================================================
           HERO
        ======================================================== */

        const heroImage =
            document.querySelector(".hero-image");

        const heroLogo =
            document.querySelector(".hero-logo");

        const heroKicker =
            document.querySelector(".hero-kicker");

        const heroIntro =
            document.querySelector(".hero-intro");

        const heroMeta =
            document.querySelector(".hero-meta");

        const heroFooter =
            document.querySelector(".hero-footer");


        if (!reduceMotion) {

            gsap.set(
                [
                    heroLogo,
                    heroIntro,
                    heroKicker,
                    heroFooter
                ],
                {
                    opacity: 0,
                    y: 35
                }
            );


            gsap.set(
                heroMeta,
                {
                    opacity: 0,
                    y: -15
                }
            );


            const heroTimeline =
                gsap.timeline({
                    defaults: {
                        ease: "power3.out"
                    }
                });


            heroTimeline

                .to(
                    heroImage,
                    {
                        scale: 1,
                        duration: 2.2,
                        ease: "power3.out"
                    }
                )

                .to(
                    heroMeta,
                    {
                        opacity: 1,
                        y: 0,
                        duration: .7
                    },
                    .2
                )

                .to(
                    heroKicker,
                    {
                        opacity: 1,
                        y: 0,
                        duration: .8
                    },
                    .55
                )

                .to(
                    heroLogo,
                    {
                        opacity: 1,
                        y: 0,
                        duration: 1.2,
                        ease: "power4.out"
                    },
                    .7
                )

                .to(
                    heroIntro,
                    {
                        opacity: 1,
                        y: 0,
                        duration: .8
                    },
                    1.1
                )

                .to(
                    heroFooter,
                    {
                        opacity: 1,
                        y: 0,
                        duration: .7
                    },
                    1.25
                );


            gsap.to(
                heroImage,
                {
                    yPercent: 10,

                    ease: "none",

                    scrollTrigger: {
                        trigger: ".hero",
                        start: "top top",
                        end: "bottom top",
                        scrub: true
                    }

                }
            );

        }


        /* ========================================================
           OPENING TYPOGRAPHY
        ======================================================== */

        const openingTitle =
            document.querySelector(".opening-copy h1");


        if (!reduceMotion && openingTitle) {

            gsap.fromTo(
                openingTitle,

                {
                    y: 70,
                    opacity: 0
                },

                {
                    y: 0,
                    opacity: 1,
                    duration: 1.2,
                    ease: "power4.out",

                    scrollTrigger: {
                        trigger: openingTitle,
                        start: "top 82%",
                        once: true
                    }

                }
            );

        }


        /* ========================================================
           STATEMENT IMAGE
        ======================================================== */

        const statementImage =
            document.querySelector(
                ".statement-image img"
            );


        if (!reduceMotion && statementImage) {

            gsap.fromTo(
                statementImage,

                {
                    scale: 1.2
                },

                {
                    scale: 1,

                    ease: "none",

                    scrollTrigger: {
                        trigger: ".statement",
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 1
                    }

                }
            );


            gsap.to(
                ".word-one",

                {
                    xPercent: 12,

                    ease: "none",

                    scrollTrigger: {
                        trigger: ".statement",
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true
                    }

                }
            );


            gsap.to(
                ".word-two",

                {
                    xPercent: -10,

                    ease: "none",

                    scrollTrigger: {
                        trigger: ".statement",
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true
                    }

                }
            );

        }


        /* ========================================================
           EXPERIENCE IMAGE
        ======================================================== */

        const experienceImage =
            document.querySelector(
                ".experience-hero-image img"
            );


        if (!reduceMotion && experienceImage) {

            gsap.fromTo(
                experienceImage,

                {
                    scale: 1.15
                },

                {
                    scale: 1,

                    ease: "none",

                    scrollTrigger: {
                        trigger: ".experience-hero-image",
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 1
                    }

                }
            );

        }


        /* ========================================================
           TRIPTYCH
        ======================================================== */

        const triptych =
            document.querySelector(".triptych");


        if (!reduceMotion && triptych) {

            const left =
                document.querySelector(".card-left");

            const center =
                document.querySelector(".card-center");

            const right =
                document.querySelector(".card-right");


            const timeline =
                gsap.timeline({

                    scrollTrigger: {
                        trigger: ".triptych-section",

                        start: "top 75%",
                        end: "bottom 75%",

                        scrub: 1
                    }

                });


            timeline

                .fromTo(
                    left,

                    {
                        x: 100,
                        rotation: 0,
                        opacity: 0
                    },

                    {
                        x: 0,
                        rotation: -5,
                        opacity: 1,
                        ease: "power2.out"
                    },

                    0
                )

                .fromTo(
                    center,

                    {
                        y: 100,
                        scale: .92,
                        opacity: 0
                    },

                    {
                        y: 0,
                        scale: 1,
                        opacity: 1,
                        ease: "power2.out"
                    },

                    0
                )

                .fromTo(
                    right,

                    {
                        x: -100,
                        rotation: 0,
                        opacity: 0
                    },

                    {
                        x: 0,
                        rotation: 5,
                        opacity: 1,
                        ease: "power2.out"
                    },

                    0
                );


            gsap.to(
                ".card-left .triptych-image img",
                {
                    yPercent: 7,

                    ease: "none",

                    scrollTrigger: {
                        trigger: ".triptych-section",
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true
                    }
                }
            );


            gsap.to(
                ".card-center .triptych-image img",
                {
                    yPercent: -5,

                    ease: "none",

                    scrollTrigger: {
                        trigger: ".triptych-section",
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true
                    }
                }
            );


            gsap.to(
                ".card-right .triptych-image img",
                {
                    yPercent: 8,

                    ease: "none",

                    scrollTrigger: {
                        trigger: ".triptych-section",
                        start: "top bottom",
                        end: "bottom top",
                        scrub: true
                    }
                }
            );

        }


        /* ========================================================
           MANIFESTO
        ======================================================== */

        const manifestoTitle =
            document.querySelector(
                ".manifesto-main h2"
            );


        if (!reduceMotion && manifestoTitle) {

            gsap.fromTo(
                manifestoTitle,

                {
                    y: 60,
                    opacity: 0
                },

                {
                    y: 0,
                    opacity: 1,
                    duration: 1.1,
                    ease: "power4.out",

                    scrollTrigger: {
                        trigger: ".manifesto",
                        start: "top 75%",
                        once: true
                    }

                }
            );

        }


        /* ========================================================
           STORY WALL
        ======================================================== */

        if (!reduceMotion) {

            gsap.utils.toArray(
                ".story-wall figure"
            ).forEach((figure, index) => {

                gsap.fromTo(
                    figure,

                    {
                        y: 70,
                        opacity: 0
                    },

                    {
                        y: 0,
                        opacity: 1,

                        duration: .9,

                        delay: index * .05,

                        ease: "power3.out",

                        scrollTrigger: {
                            trigger: figure,
                            start: "top 88%",
                            once: true
                        }

                    }
                );

            });

        }


        /* ========================================================
           OBJECTS IMAGE REVEALS
        ======================================================== */

        if (!reduceMotion) {

            gsap.utils.toArray(
                ".object-image img, .object-card-image img, .menu-object > img"
            ).forEach(image => {

                gsap.fromTo(
                    image,

                    {
                        scale: 1.12
                    },

                    {
                        scale: 1,

                        ease: "none",

                        scrollTrigger: {
                            trigger: image,
                            start: "top bottom",
                            end: "bottom top",
                            scrub: 1
                        }

                    }
                );

            });

        }


/* ========================================================
BRAND MOMENT — MIST / JHAROKA / LOGO
======================================================== */

const brandMoment =
document.querySelector(".brand-moment");

const brandMist =
document.querySelector(".brand-mist");

const brandJharoka =
document.querySelector(".brand-jharoka");

const brandLogo =
document.querySelector(".brand-logo");

if (
!reduceMotion &&
brandMoment &&
brandMist &&
brandJharoka &&
brandLogo
) {

/* Initial states */

gsap.set(
    brandMist,
    {
        opacity: 0,
        scale: 1.08
    }
);

gsap.set(
    brandJharoka,
    {
        opacity: 0,
        scale: .94,
        y: 35
    }
);

gsap.set(
    brandLogo,
    {
        opacity: 0,
        scale: .82,
        y: 20
    }
);


/* Timeline */

const brandTimeline =
    gsap.timeline({

        scrollTrigger: {
            trigger: brandMoment,
            start: "top 72%",
            once: true
        }

    });


brandTimeline

    /*
     * 1 — Maroon mist slowly appears
     */

    .to(
        brandMist,
        {
            opacity: 1,
            scale: 1,
            duration: 1.8,
            ease: "power3.out"
        }
    )

    /*
     * 2 — Jharoka rises over the mist
     */

    .to(
        brandJharoka,
        {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 1.4,
            ease: "power4.out"
        },
        "-=1.0"
    )

    /*
     * 3 — White logo appears last
     */

    .to(
        brandLogo,
        {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 1.1,
            ease: "power3.out"
        },
        "-=.55"
    );


/*
 * Very subtle continuous movement
 * for the mist after the entrance.
 */

gsap.to(
    brandMist,
    {
        scale: 1.035,
        duration: 8,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
    }
);


}



        /* ========================================================
           SUMMARY ROWS
        ======================================================== */

        if (!reduceMotion) {

            gsap.utils.toArray(
                ".summary-row"
            ).forEach((row, index) => {

                gsap.fromTo(
                    row,

                    {
                        x: -40,
                        opacity: 0
                    },

                    {
                        x: 0,
                        opacity: 1,

                        duration: .8,

                        delay: index * .06,

                        ease: "power3.out",

                        scrollTrigger: {
                            trigger: row,
                            start: "top 90%",
                            once: true
                        }

                    }
                );

            });

        }


        /* ========================================================
           FINAL IMAGE
        ======================================================== */

        const finalImage =
            document.querySelector(
                ".final-image img"
            );


        if (!reduceMotion && finalImage) {

            gsap.fromTo(
                finalImage,

                {
                    scale: 1.18
                },

                {
                    scale: 1,

                    ease: "none",

                    scrollTrigger: {
                        trigger: ".final-scene",
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 1
                    }

                }
            );

        }


        /* ========================================================
           FINAL TITLE
        ======================================================== */

        const finalTitle =
            document.querySelector(
                ".final-content h2"
            );


        if (!reduceMotion && finalTitle) {

            gsap.fromTo(
                finalTitle,

                {
                    y: 60,
                    opacity: 0
                },

                {
                    y: 0,
                    opacity: 1,

                    duration: 1.1,

                    ease: "power4.out",

                    scrollTrigger: {
                        trigger: ".final-scene",
                        start: "top 65%",
                        once: true
                    }

                }
            );

        }


        /* ========================================================
           CLOSING
        ======================================================== */

        const closingTitle =
            document.querySelector(
                ".closing-center h2"
            );


        if (!reduceMotion && closingTitle) {

            gsap.fromTo(
                closingTitle,

                {
                    y: 60,
                    opacity: 0
                },

                {
                    y: 0,
                    opacity: 1,

                    duration: 1.1,

                    ease: "power4.out",

                    scrollTrigger: {
                        trigger: ".closing",
                        start: "top 70%",
                        once: true
                    }

                }
            );

        }


        /* ========================================================
           REFRESH
        ======================================================== */

        window.addEventListener(
            "load",
            () => {

                ScrollTrigger.refresh();

            }
        );

    }
);
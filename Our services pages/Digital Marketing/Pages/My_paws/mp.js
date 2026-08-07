/* ==========================================================================
   TUSDIO × MY PAWS
   Navigation + Firebase + GSAP animation system
   ========================================================================== */


/* ==========================================================================
   NAVIGATION
   ========================================================================== */

(function initNavigation() {

    "use strict";

    const menuToggle = document.querySelector(".menu-toggle");
    const primaryNav = document.querySelector("#primary-nav");

    if (!menuToggle || !primaryNav) return;


    function closeMenu() {

        primaryNav.classList.remove("active");

        menuToggle.setAttribute(
            "aria-expanded",
            "false"
        );
    }


    menuToggle.addEventListener("click", function () {

        const isOpen =
            primaryNav.classList.toggle("active");

        menuToggle.setAttribute(
            "aria-expanded",
            String(isOpen)
        );
    });


    primaryNav
        .querySelectorAll("a")
        .forEach(link => {

            link.addEventListener("click", closeMenu);

        });


    document.addEventListener("click", function (event) {

        if (!primaryNav.classList.contains("active")) {
            return;
        }

        const clickedInside =
            primaryNav.contains(event.target) ||
            menuToggle.contains(event.target);

        if (!clickedInside) {
            closeMenu();
        }

    });


    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape") {
            closeMenu();
        }

    });

})();



/* ==========================================================================
   FIREBASE AUTH
   ========================================================================== */

(function initFirebaseAuth() {

    "use strict";

    const navUserArea =
        document.getElementById("navUserArea");

    if (!navUserArea) return;


    const OWNER_EMAIL =
        "bittukhantusharkhan@gmail.com";


    function showLoggedOut() {

        navUserArea.innerHTML = `
            <a href="../../../../Nav Bar/auth/login.html">
                Login
            </a>
        `;

    }


    async function startAuth() {

        try {

            const [
                firebaseConfig,
                firebaseAuth
            ] = await Promise.all([

                import(
                    "../../../../Nav Bar/auth/firebase-config.js"
                ),

                import(
                    "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js"
                )

            ]);


            const auth = firebaseConfig.auth;

            if (!auth) {
                throw new Error(
                    "Firebase auth was not exported."
                );
            }


            const {
                onAuthStateChanged,
                signOut
            } = firebaseAuth;


            onAuthStateChanged(
                auth,
                function (user) {

                    if (!user) {

                        showLoggedOut();

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
                        ).toLowerCase() ===
                        OWNER_EMAIL.toLowerCase();


                    const dashboard =
                        isOwner
                            ? "../../../../Nav Bar/auth/owner/owner.html"
                            : "../../../../Nav Bar/auth/users.html";


                    navUserArea.innerHTML = `

                        <div class="nav-user-box">

                            <span class="nav-user-name">
                                ${name}
                            </span>

                            <a
                                href="${dashboard}"
                                class="nav-user-btn"
                            >
                                Dashboard
                            </a>

                            <button
                                id="logoutNavBtn"
                                class="nav-user-btn"
                                type="button"
                            >
                                Logout
                            </button>

                        </div>

                    `;


                    const logoutButton =
                        document.getElementById(
                            "logoutNavBtn"
                        );


                    if (logoutButton) {

                        logoutButton.addEventListener(
                            "click",
                            async function () {

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

                },
                function (error) {

                    console.error(
                        "Firebase auth state error:",
                        error
                    );

                    showLoggedOut();

                }
            );

        } catch (error) {

            console.warn(
                "Firebase unavailable. Showing Login.",
                error
            );

            showLoggedOut();

        }

    }


    startAuth();

})();



/* ==========================================================================
   GSAP SYSTEM
   ========================================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        "use strict";


        const hasGSAP =
            typeof gsap !== "undefined";

        const hasScrollTrigger =
            typeof ScrollTrigger !== "undefined";


        const reduceMotion =
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;


        const canHover =
            window.matchMedia(
                "(hover: hover) and (pointer: fine)"
            ).matches;


        /* ----------------------------------------------------------
           SAFETY FALLBACK
           ---------------------------------------------------------- */

        if (!hasGSAP) {

            document
                .querySelectorAll(
                    ".reveal-line, .block-copy, .offer-item, .split-list li, .tag-pill, .polaroid"
                )
                .forEach(function (element) {

                    element.style.opacity = "1";
                    element.style.transform = "none";

                });

            return;
        }


        if (hasScrollTrigger) {
            gsap.registerPlugin(ScrollTrigger);
        }


        /* ----------------------------------------------------------
           HEADER SHRINK
           ---------------------------------------------------------- */

        const header =
            document.getElementById("site-header");


        if (
            header &&
            hasScrollTrigger &&
            !reduceMotion
        ) {

            ScrollTrigger.create({

                start: "top -70",

                end: 999999,

                onUpdate: function (self) {

                    header.classList.toggle(
                        "is-compact",
                        self.scroll() > 70
                    );

                }

            });

        }


        /* ----------------------------------------------------------
           HERO
           ---------------------------------------------------------- */

        if (!reduceMotion) {

            const heroTimeline =
                gsap.timeline({
                    delay: .15
                });


            heroTimeline

                .to(
                    ".hero-eyebrow .reveal-line",
                    {
                        y: "0%",
                        duration: .9,
                        ease: "power4.out"
                    }
                )

                .to(
                    ".hero-title .reveal-line",
                    {
                        y: "0%",
                        duration: 1.15,
                        ease: "power4.out",
                        stagger: .08
                    },
                    "-=.55"
                )

                .to(
                    ".hero-sub .reveal-line",
                    {
                        y: "0%",
                        duration: .95,
                        ease: "power4.out"
                    },
                    "-=.65"
                )

                .to(
                    ".hero-cta-wrap .reveal-line",
                    {
                        y: "0%",
                        duration: .8,
                        ease: "power4.out"
                    },
                    "-=.55"
                );


            /* Subtle paw movement */

            const paw =
                document.querySelector(".hero-paw");


            if (paw) {

                gsap.to(
                    paw,
                    {
                        y: "-48%",
                        rotation: 3,
                        duration: 8,
                        repeat: -1,
                        yoyo: true,
                        ease: "sine.inOut"
                    }
                );

            }

        } else {

            gsap.set(
                ".hero .reveal-line",
                {
                    y: "0%"
                }
            );

        }


        /* ----------------------------------------------------------
           SECTION HEADINGS
           ---------------------------------------------------------- */

        if (
            hasScrollTrigger &&
            !reduceMotion
        ) {

            gsap.utils
                .toArray(
                    ".story .reveal-line," +
                    ".offer-head .reveal-line," +
                    ".split-head .reveal-line," +
                    ".paid-ads .reveal-line," +
                    ".corkboard-head .reveal-line," +
                    ".closing-title .reveal-line"
                )
                .forEach(function (line) {

                    gsap.to(
                        line,
                        {
                            y: "0%",
                            duration: 1.05,
                            ease: "power4.out",

                            scrollTrigger: {

                                trigger: line,

                                start: "top 88%",

                                once: true

                            }

                        }
                    );

                });

        } else {

            gsap.set(
                ".reveal-line",
                {
                    y: "0%"
                }
            );

        }


        /* ----------------------------------------------------------
           BODY COPY
           ---------------------------------------------------------- */

        if (hasScrollTrigger) {

            gsap.utils
                .toArray(".block-copy")
                .forEach(function (paragraph) {

                    if (reduceMotion) {

                        gsap.set(
                            paragraph,
                            {
                                opacity: 1,
                                y: 0
                            }
                        );

                        return;
                    }


                    gsap.to(
                        paragraph,
                        {
                            opacity: 1,
                            y: 0,

                            duration: 1,

                            ease: "power3.out",

                            scrollTrigger: {

                                trigger: paragraph,

                                start: "top 88%",

                                once: true

                            }

                        }
                    );

                });

        } else {

            gsap.set(
                ".block-copy",
                {
                    opacity: 1,
                    y: 0
                }
            );

        }


        /* ----------------------------------------------------------
           OFFER ITEMS
           ---------------------------------------------------------- */

        document
            .querySelectorAll(".offer-list")
            .forEach(function (list) {

                const items =
                    list.querySelectorAll(
                        ".offer-item"
                    );


                if (!hasScrollTrigger || reduceMotion) {

                    gsap.set(
                        items,
                        {
                            opacity: 1,
                            y: 0
                        }
                    );

                    return;
                }


                gsap.to(
                    items,
                    {
                        opacity: 1,
                        y: 0,

                        duration: .8,

                        ease: "power3.out",

                        stagger: .11,

                        scrollTrigger: {

                            trigger: list,

                            start: "top 82%",

                            once: true

                        }

                    }
                );

            });


        /* ----------------------------------------------------------
           SPLIT LISTS
           ---------------------------------------------------------- */

        document
            .querySelectorAll(".split-list")
            .forEach(function (list) {

                const items =
                    list.querySelectorAll("li");


                if (!hasScrollTrigger || reduceMotion) {

                    gsap.set(
                        items,
                        {
                            opacity: 1,
                            y: 0
                        }
                    );

                    return;
                }


                gsap.to(
                    items,
                    {
                        opacity: 1,
                        y: 0,

                        duration: .75,

                        ease: "power3.out",

                        stagger: .1,

                        scrollTrigger: {

                            trigger: list,

                            start: "top 82%",

                            once: true

                        }

                    }
                );

            });


        /* ----------------------------------------------------------
           PAID ADS TAGS
           ---------------------------------------------------------- */

        const tagRibbon =
            document.querySelector(".tag-ribbon");


        if (tagRibbon) {

            const tags =
                tagRibbon.querySelectorAll(
                    ".tag-pill"
                );


            if (
                !hasScrollTrigger ||
                reduceMotion
            ) {

                gsap.set(
                    tags,
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1
                    }
                );

            } else {

                gsap.to(
                    tags,
                    {
                        opacity: 1,
                        y: 0,
                        scale: 1,

                        duration: .65,

                        ease: "back.out(1.5)",

                        stagger: .07,

                        scrollTrigger: {

                            trigger: tagRibbon,

                            start: "top 86%",

                            once: true

                        }

                    }
                );

            }

        }


        /* ==========================================================
           DESKTOP GALLERY
           ========================================================== */

        const isMobile =
            window.matchMedia(
                "(max-width: 700px)"
            ).matches;


        document
            .querySelectorAll(".polaroid")
            .forEach(function (card, index) {

                /*
                 IMPORTANT:

                 Desktop gets the corkboard animation.

                 Mobile gets a completely different animation.
                */


                if (isMobile) {

                    if (
                        !hasScrollTrigger ||
                        reduceMotion
                    ) {

                        gsap.set(
                            card,
                            {
                                opacity: 1,
                                y: 0,
                                scale: 1
                            }
                        );

                        return;
                    }


                    gsap.fromTo(
                        card,
                        {
                            opacity: 0,
                            y: 60,
                            scale: .96
                        },
                        {
                            opacity: 1,
                            y: 0,
                            scale: 1,

                            duration: .9,

                            ease: "power3.out",

                            scrollTrigger: {

                                trigger: card,

                                start: "top 88%",

                                once: true

                            }

                        }
                    );


                    return;
                }


                /* DESKTOP */

                const restRotation =
                    parseFloat(
                        card.dataset.rot || 0
                    );


                const startRotation =
                    restRotation +
                    (
                        index % 2 === 0
                            ? -14
                            : 14
                    );


                if (
                    !hasScrollTrigger ||
                    reduceMotion
                ) {

                    gsap.set(
                        card,
                        {
                            opacity: 1,
                            y: 0,
                            rotate: restRotation
                        }
                    );

                } else {

                    gsap.fromTo(
                        card,
                        {
                            opacity: 0,
                            y: 55,
                            scale: .86,
                            rotate: startRotation
                        },
                        {
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            rotate: restRotation,

                            duration: .95,

                            ease: "back.out(1.4)",

                            scrollTrigger: {

                                trigger: card,

                                start: "top 91%",

                                once: true

                            }

                        }
                    );

                }


                /* Desktop hover */

                if (canHover) {

                    card.addEventListener(
                        "mousemove",
                        function (event) {

                            const rect =
                                card.getBoundingClientRect();


                            const px =
                                (
                                    event.clientX -
                                    rect.left
                                ) /
                                rect.width -
                                .5;


                            const py =
                                (
                                    event.clientY -
                                    rect.top
                                ) /
                                rect.height -
                                .5;


                            gsap.to(
                                card,
                                {
                                    rotationY:
                                        px * 10,

                                    rotationX:
                                        -py * 10,

                                    scale: 1.045,

                                    duration: .45,

                                    ease: "power3.out",

                                    transformPerspective:
                                        900
                                }
                            );

                        }
                    );


                    card.addEventListener(
                        "mouseleave",
                        function () {

                            gsap.to(
                                card,
                                {
                                    rotationX: 0,
                                    rotationY: 0,
                                    scale: 1,

                                    duration: .55,

                                    ease: "power3.out"
                                }
                            );

                        }
                    );

                }

            });


        /* ----------------------------------------------------------
           CLOSING
           ---------------------------------------------------------- */

        const closing =
            document.querySelector(".closing");


        if (closing) {

            const closingItems =
                closing.querySelectorAll(
                    ".closing-brand, .closing-cta"
                );


            if (
                !hasScrollTrigger ||
                reduceMotion
            ) {

                gsap.set(
                    closingItems,
                    {
                        opacity: 1,
                        y: 0
                    }
                );

            } else {

                gsap.fromTo(
                    closingItems,
                    {
                        opacity: 0,
                        y: 20
                    },
                    {
                        opacity: 1,
                        y: 0,

                        duration: .9,

                        ease: "power3.out",

                        stagger: .1,

                        scrollTrigger: {

                            trigger: closing,

                            start: "top 78%",

                            once: true

                        }

                    }
                );

            }

        }


        /* ----------------------------------------------------------
           MAGNETIC BUTTON
           Desktop only
           ---------------------------------------------------------- */

        if (canHover) {

            document
                .querySelectorAll(".paw-button")
                .forEach(function (button) {

                    button.addEventListener(
                        "mousemove",
                        function (event) {

                            const rect =
                                button.getBoundingClientRect();


                            const x =
                                event.clientX -
                                rect.left -
                                rect.width / 2;


                            const y =
                                event.clientY -
                                rect.top -
                                rect.height / 2;


                            gsap.to(
                                button,
                                {
                                    x: x * .16,
                                    y: y * .16,

                                    duration: .35,

                                    ease: "power3.out"
                                }
                            );

                        }
                    );


                    button.addEventListener(
                        "mouseleave",
                        function () {

                            gsap.to(
                                button,
                                {
                                    x: 0,
                                    y: 0,

                                    duration: .6,

                                    ease: "elastic.out(1,.5)"
                                }
                            );

                        }
                    );

                });

        }


        /* ----------------------------------------------------------
           REFRESH SCROLLTRIGGER
           
           Important after mobile layout calculations.
           ---------------------------------------------------------- */

        if (hasScrollTrigger) {

            window.setTimeout(
                function () {

                    ScrollTrigger.refresh();

                },
                300
            );

        }

    }
);

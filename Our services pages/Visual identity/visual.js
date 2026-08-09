/* =========================================================
   TUSDIO — VISUAL IDENTITY
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


/* =========================================================
   SYSTEM BOARD — the shuffleable hero mosaic
   One project drives four tiles at once: the live shot,
   its initials in the type tile, and a palette pulled from
   its position in the set for the swatch row. Behance link
   + accessible label travel with it.
========================================================= */

const SYSTEM_BOARD_PROJECTS = [
    {
        name: "Aviaan",
        tag: "Industrial Identity",
        image: "image/1 aviaan.png",
        behance: "https://www.behance.net/gallery/198103141/Aviaan-Forging-Tomorrows-Metals",
        initials: "AV"
    },
    {
        name: "Evoque",
        tag: "Luxury Identity",
        image: "image/2 evoque.png",
        behance: "https://www.behance.net/gallery/204727647/EVOQUE",
        initials: "EV"
    },
    {
        name: "Navi Transportation",
        tag: "Transportation Identity",
        image: "image/3 Navi transportation.png",
        behance: "https://www.behance.net/gallery/198069861/NAVI-A-Transportation-Company",
        initials: "NV"
    },
    {
        name: "Honour",
        tag: "Wellness Identity",
        image: "image/4 honour.png",
        behance: "https://www.behance.net/gallery/198494821/HONOUR-Your-pathway-to-wellness",
        initials: "HN"
    },
    {
        name: "One Latte",
        tag: "Café Identity",
        image: "image/5 one latte.png",
        behance: "https://www.behance.net/gallery/198644515/ONE-LATTE",
        initials: "OL"
    },
    {
        name: "Prakrti",
        tag: "Culinary Identity",
        image: "image/6 prakrti.png",
        behance: "https://www.behance.net/gallery/199113921/Prakrti-Ou-la-Nature-Rencontre-le-Dlice-Culinaire",
        initials: "PR"
    },
    {
        name: "Eclat",
        tag: "Luxury Identity",
        image: "image/7 eclate.png",
        behance: "https://www.behance.net/gallery/199209017/Eclat-Savourez-le-Luxe-Goutez-la-Tradition",
        initials: "EC"
    },
    {
        name: "Blackbird",
        tag: "Luxury Identity",
        image: "image/8 blackbird.png",
        behance: "https://www.behance.net/gallery/202052777/BLACKBIRD-Defining-Luxury-Redefining-Elegance",
        initials: "BB"
    },
    {
        name: "Lujuria",
        tag: "Fashion Identity",
        image: "image/9 lujuria.png",
        behance: "https://www.behance.net/gallery/199504677/Lujuria-Indulge-In-Elegance",
        initials: "LJ"
    },
    {
        name: "William & Collins",
        tag: "Law Firm Identity",
        image: "image/10 william.png",
        behance: "https://www.behance.net/gallery/201118763/William-Collins-Law-Firm",
        initials: "WC"
    },
    {
        name: "Pinnacle",
        tag: "Architecture Identity",
        image: "image/11 pinaacle.png",
        behance: "https://www.behance.net/gallery/203269253/Pinnacle-Architecture",
        initials: "PN"
    },
    {
        name: "Blckwhite",
        tag: "Brand Identity System",
        image: "image/12 blckwhite.png",
        behance: "https://www.behance.net/gallery/211467587/BLCKWHITE",
        initials: "BW"
    },
    {
        name: "Arcadia Builders",
        tag: "Construction Identity",
        image: "image/13 arcadia builders.png",
        behance: "",
        initials: "AB"
    },
    {
        name: "Azure Villas & Resorts",
        tag: "Hospitality Identity",
        image: "image/14 azure villas & resorts.png",
        behance: "https://www.behance.net/gallery/204536263/Azure-Haven",
        initials: "AZ"
    }
];


/**
 * Deterministic HSL → hex helper, used so every project gets a
 * distinct-but-on-brand palette without hand-picking 14 sets of
 * colours (or fighting canvas/CORS to sample the actual photos).
 */
function systemBoardHslToHex(h, s, l) {

    const sat = s / 100;
    const light = l / 100;

    const k = n => (n + h / 30) % 12;
    const a = sat * Math.min(light, 1 - light);

    const f = n =>
        light - a * Math.max(
            -1,
            Math.min(k(n) - 3, Math.min(9 - k(n), 1))
        );

    const toHex = x =>
        Math.round(255 * x).toString(16).padStart(2, "0");

    return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;

}

function systemBoardPalette(index) {

    // Golden-angle spread keeps hues well distributed across
    // any number of projects without ever repeating a near hue.
    // Used only as an instant placeholder while the real palette
    // (sampled from the project photo itself, below) is computed.
    const hue = (index * 137.508) % 360;
    const saturation = 9;
    const lightSteps = [95, 82, 68, 54, 40, 27, 15, 6];

    return lightSteps.map(
        light => systemBoardHslToHex(hue, saturation, light)
    );

}


/**
 * Samples a project's actual photo and returns its real dominant
 * colours, light → dark. We can't reliably crawl Behance (it
 * blocks bots, and project names collide with unrelated real
 * companies in search) — but the photo TUSDIO already shows for
 * each project IS the source image, so reading its own pixels is
 * both more accurate and doesn't depend on any external site.
 *
 * Resolves to null (caller falls back to systemBoardPalette) if
 * the image hasn't loaded, fails, or the canvas is cross-origin
 * tainted (e.g. running from a file:// preview instead of the
 * live site).
 */
function extractDominantColors(src, swatchCount) {

    return new Promise(resolve => {

        const img = new Image();

        img.onload = () => {

            try {

                const size = 64;
                const canvas = document.createElement("canvas");

                canvas.width = size;
                canvas.height = size;

                const ctx = canvas.getContext("2d", { willReadFrequently: true });

                ctx.drawImage(img, 0, 0, size, size);

                const { data } = ctx.getImageData(0, 0, size, size);

                // Quantize into buckets so near-identical pixels
                // count as the same colour, then keep each
                // bucket's true average (not just the bucket
                // centre) for an accurate final swatch.
                const bucketSize = 24;
                const buckets = new Map();

                for (let i = 0; i < data.length; i += 4) {

                    const alpha = data[i + 3];

                    if (alpha < 128) continue;

                    const r = data[i];
                    const g = data[i + 1];
                    const b = data[i + 2];

                    const key = [
                        Math.round(r / bucketSize),
                        Math.round(g / bucketSize),
                        Math.round(b / bucketSize)
                    ].join(",");

                    const bucket =
                        buckets.get(key) || { r: 0, g: 0, b: 0, n: 0 };

                    bucket.r += r;
                    bucket.g += g;
                    bucket.b += b;
                    bucket.n += 1;

                    buckets.set(key, bucket);

                }

                const colors = Array.from(buckets.values())
                    .sort((a, b) => b.n - a.n)
                    .slice(0, swatchCount)
                    .map(bucket => {

                        const r = Math.round(bucket.r / bucket.n);
                        const g = Math.round(bucket.g / bucket.n);
                        const b = Math.round(bucket.b / bucket.n);

                        const luminance =
                            0.2126 * r + 0.7152 * g + 0.0722 * b;

                        return { r, g, b, luminance };

                    })
                    .sort((a, b) => b.luminance - a.luminance)
                    .map(c => {

                        const toHex = v =>
                            v.toString(16).padStart(2, "0");

                        return `#${toHex(c.r)}${toHex(c.g)}${toHex(c.b)}`;

                    });

                if (!colors.length) {
                    resolve(null);
                    return;
                }

                // Pad out with the darkest sampled colour if the
                // photo genuinely has fewer distinct tones than
                // there are swatches to fill.
                while (colors.length < swatchCount) {
                    colors.push(colors[colors.length - 1]);
                }

                resolve(colors);

            } catch (error) {

                // Tainted canvas (cross-origin / file:// preview)
                // or any other read failure — fall back silently.
                resolve(null);

            }

        };

        img.onerror = () => resolve(null);

        img.src = src;

    });

}


function initSystemBoard() {

    "use strict";

    const board =
        document.getElementById("systemBoard");

    const photoLink =
        document.getElementById("boardPhotoLink");

    const photoImg =
        document.getElementById("boardPhotoImg");

    const photoLabel =
        document.getElementById("boardPhotoLabel");

    const typeGlyph =
        document.getElementById("boardTypeGlyph");

    const swatchRow =
        document.getElementById("boardSwatchRow");

    const counter =
        document.getElementById("boardCounter");

    const shuffleBtn =
        document.getElementById("shuffleBtn");

    if (
        !board || !photoLink || !photoImg ||
        !photoLabel || !typeGlyph || !swatchRow ||
        !counter || !shuffleBtn
    ) {
        return;
    }

    const projects = SYSTEM_BOARD_PROJECTS;
    const total = projects.length;

    const reducedMotion =
        window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        ).matches;

    const swatchSpans =
        Array.from(swatchRow.querySelectorAll("span"));

    // Figure out which project the static HTML already shows
    // (matched by image path) so the counter and first shuffle
    // start from the right place instead of assuming index 0.
    const startIndex = Math.max(
        0,
        projects.findIndex(p => photoImg.getAttribute("src") === p.image)
    );

    let currentIndex = startIndex;
    let isAnimating = false;

    // Real sampled palettes are cached per project index so a
    // project only needs its photo decoded once, no matter how
    // many times Shuffle lands on it again.
    const paletteCache = new Map();
    let paletteRequestId = 0;

    function applySwatchColors(palette) {

        swatchSpans.forEach((span, i) => {
            span.style.backgroundColor = palette[i % palette.length];
        });

    }

    function loadRealPalette(index) {

        const requestId = ++paletteRequestId;

        if (paletteCache.has(index)) {

            if (index === currentIndex) {
                applySwatchColors(paletteCache.get(index));
            }

            return;

        }

        extractDominantColors(projects[index].image, swatchSpans.length || 8)
            .then(colors => {

                const palette = colors || systemBoardPalette(index);

                paletteCache.set(index, palette);

                // Only paint if nothing newer has been requested
                // (user may have shuffled again before this
                // resolved) and this is still the visible project.
                if (requestId === paletteRequestId && index === currentIndex) {
                    applySwatchColors(palette);
                }

            });

    }

    // A shuffled draw order so "Shuffle" behaves like an actual
    // shuffle — every project is seen once before any repeats —
    // rather than pure randomness that can repeat immediately.
    let drawOrder = [];

    function reshuffleDrawOrder() {

        drawOrder = projects
            .map((_, i) => i)
            .filter(i => i !== currentIndex);

        for (let i = drawOrder.length - 1; i > 0; i--) {

            const j = Math.floor(Math.random() * (i + 1));

            [drawOrder[i], drawOrder[j]] =
                [drawOrder[j], drawOrder[i]];

        }

    }

    reshuffleDrawOrder();

    function nextIndex() {

        if (drawOrder.length === 0) {
            reshuffleDrawOrder();
        }

        return drawOrder.pop();

    }

    function resetImageFallback() {

        const fallback =
            photoLink.querySelector(".img-fallback");

        if (fallback) {
            fallback.remove();
        }

        photoImg.style.display = "";

    }

    function applyProject(index) {

        const project = projects[index];

        resetImageFallback();

        photoImg.setAttribute("src", project.image);
        photoImg.setAttribute("alt", `${project.name} visual identity, designed by TUSDIO`);
        photoImg.setAttribute("data-fallback-initials", project.initials);

        typeGlyph.textContent = project.initials;

        // Paint an instant placeholder so the swatch row never
        // sits empty, then swap in the real colours sampled from
        // this project's own photo as soon as they're ready
        // (immediately, if we've already cached them).
        if (paletteCache.has(index)) {
            applySwatchColors(paletteCache.get(index));
        } else {
            applySwatchColors(systemBoardPalette(index));
        }

        loadRealPalette(index);

        if (project.behance) {

            photoLink.href = project.behance;
            photoLink.target = "_blank";
            photoLink.rel = "noopener";
            photoLink.removeAttribute("aria-disabled");
            photoLabel.textContent = `${project.name} — View on Behance`;

        } else {

            photoLink.href = "";
            photoLink.removeAttribute("target");
            photoLink.removeAttribute("rel");
            photoLink.setAttribute("aria-disabled", "true");
            photoLabel.textContent = `${project.name} — Case study coming soon`;

        }

        const displayNumber =
            String(index + 1).padStart(2, "0");

        counter.textContent = `${displayNumber} / ${total}`;

    }

    // Render the confirmed starting state (fixes any drift
    // between the static markup and the actual project order),
    // then start pre-sampling the rest in the background so
    // shuffling around the set feels instant.
    applyProject(currentIndex);

    window.setTimeout(() => {
        projects.forEach((_, i) => {
            if (i !== currentIndex) loadRealPalette(i);
        });
    }, 800);

    function goToIndex(index) {

        if (isAnimating || index === currentIndex) return;

        isAnimating = true;

        shuffleBtn.disabled = true;
        shuffleBtn.classList.add("is-shuffling");

        const photoTile =
            photoLink.closest(".board-tile--photo");

        if (photoTile && !reducedMotion) {
            photoTile.classList.add("is-swapping");
        }

        const swapDelay = reducedMotion ? 0 : 350;

        window.setTimeout(() => {

            currentIndex = index;
            applyProject(currentIndex);

            if (photoTile) {
                photoTile.classList.remove("is-swapping");
            }

            window.setTimeout(() => {

                shuffleBtn.disabled = false;
                shuffleBtn.classList.remove("is-shuffling");
                isAnimating = false;

            }, reducedMotion ? 0 : 150);

        }, swapDelay);

    }

    shuffleBtn.addEventListener("click", () => {
        goToIndex(nextIndex());
    });

}


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
        document.querySelector(".board-tile--photo img");

    const revealElements =
        document.querySelectorAll(".reveal");

    const caseStudies =
        document.querySelectorAll(".grid-case");

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
       SYSTEM BOARD (hero shuffle)
    ===================================================== */

    initSystemBoard();


    /* =====================================================
       BROKEN IMAGE FALLBACK
    ===================================================== */

    document
        .querySelectorAll("img[data-fallback-initials]")
        .forEach(img => {

            img.addEventListener("error", () => {

                const wrap =
                    img.closest(".grid-case-image") ||
                    img.closest(".board-tile--photo");

                if (!wrap) return;

                const existingFallback =
                    wrap.querySelector(".img-fallback");

                if (existingFallback) {
                    existingFallback.textContent =
                        img.getAttribute("data-fallback-initials") || "?";
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
            document.querySelectorAll(".grid-case-image img");

        imageLinks.forEach(image => {

            const wrapper = image.closest(".grid-case-image");

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
       DISABLED CASE LINKS (no case study yet)
       Any grid-case / board link left with an empty href
       (e.g. Arcadia Builders) shouldn't just reload the page.
    ===================================================== */

    document
        .querySelectorAll('a[href=""]')
        .forEach(link => {

            link.setAttribute("aria-disabled", "true");

            link.addEventListener("click", event => {
                event.preventDefault();
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

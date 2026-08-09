/* =========================================================
   TUSDIO — ABOUT US
   Interaction engine: nav/auth (unchanged), word-stagger intro,
   canvas coordinate readout, scrollspy narrative, reveal-on-scroll,
   scroll progress.
========================================================= */


/* =========================================================
   NAV — mobile toggle + Firebase auth state (unchanged)
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

            menuToggle.setAttribute("aria-expanded", String(isExpanded));

        });

        primaryNav.querySelectorAll("a").forEach(link => {

            link.addEventListener("click", () => {
                primaryNav.classList.remove("active");
                menuToggle.setAttribute("aria-expanded", "false");
            });

        });

        document.addEventListener("click", event => {

            const isOpen = primaryNav.classList.contains("active");
            if (!isOpen) return;

            const clickedInside =
                primaryNav.contains(event.target) ||
                menuToggle.contains(event.target);

            if (!clickedInside) {
                primaryNav.classList.remove("active");
                menuToggle.setAttribute("aria-expanded", "false");
            }

        });

        document.addEventListener("keydown", event => {

            if (event.key === "Escape" && primaryNav.classList.contains("active")) {
                primaryNav.classList.remove("active");
                menuToggle.setAttribute("aria-expanded", "false");
            }

        });

    }


    const navUserArea = document.getElementById("navUserArea");

    if (!navUserArea) return;

    const OWNER_EMAIL = "bittukhantusharkhan@gmail.com";

    const showLoggedOutState = () => {
        navUserArea.innerHTML = `<a href="../auth/login.html">Login</a>`;
    };


    (async () => {

        try {

            const [
                { auth },
                { onAuthStateChanged, signOut }
            ] = await Promise.all([
                import("../auth/firebase-config.js"),
                import("https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js")
            ]);

            if (!auth) {
                throw new Error("firebase-config.js did not export `auth`");
            }

            onAuthStateChanged(auth, user => {

                if (!user) {
                    showLoggedOutState();
                    return;
                }

                const name =
                    user.displayName ||
                    (user.email ? user.email.split("@")[0] : "User");

                const isOwner =
                    (user.email || "").toLowerCase() === OWNER_EMAIL.toLowerCase();

                const dashboardLink =
                    isOwner ? "../auth/owner/owner.html" : "../auth/users.html";

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
                            window.location.href = "../auth/login.html";
                        } catch (error) {
                            console.error("Logout failed:", error);
                        }

                    });

                }

            }, error => {
                console.error("Auth state listener error:", error);
                showLoggedOutState();
            });

        } catch (error) {

            console.error(
                "Auth unavailable — falling back to a plain Login link:",
                error
            );

            showLoggedOutState();

        }

    })();

})();


document.addEventListener("DOMContentLoaded", () => {

    "use strict";

    const reducedMotion =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;


    /* =====================================================
       WORD-STAGGER INTRO HEADLINE
    ===================================================== */

    const splitTarget = document.querySelector("[data-split]");

    if (splitTarget) {

        const words = splitTarget.textContent.trim().split(/\s+/);

        splitTarget.innerHTML = words
            .map((word, i) => {
                const delay = (0.7 + i * 0.045).toFixed(3);
                return `<span class="word" style="animation-delay:${reducedMotion ? "0s" : delay + "s"}">${word}</span>`;
            })
            .join(" ");

    }


    /* =====================================================
       CANVAS COORDINATE READOUT
    ===================================================== */

    const introCanvas = document.getElementById("introCanvas");
    const introCoords = document.getElementById("introCoords");

    if (introCanvas && introCoords && !reducedMotion) {

        let coordsTicking = false;
        let lastEvent = null;

        const updateCoords = () => {

            if (lastEvent) {

                const rect = introCanvas.getBoundingClientRect();

                const x = Math.max(0, Math.min(rect.width, lastEvent.clientX - rect.left));
                const y = Math.max(0, Math.min(rect.height, lastEvent.clientY - rect.top));

                introCoords.textContent =
                    `X ${String(Math.round(x)).padStart(3, "0")} · Y ${String(Math.round(y)).padStart(3, "0")}`;

            }

            coordsTicking = false;

        };

        introCanvas.addEventListener("mousemove", event => {

            lastEvent = event;

            if (!coordsTicking) {
                requestAnimationFrame(updateCoords);
                coordsTicking = true;
            }

        }, { passive: true });

        introCanvas.addEventListener("mouseleave", () => {
            introCoords.textContent = "X 000 · Y 000";
        });

    }


    /* =====================================================
       FOOTER YEAR
    ===================================================== */

    const footerYear = document.getElementById("footerYear");

    if (footerYear) {
        footerYear.textContent = String(new Date().getFullYear());
    }


    /* =====================================================
       SCROLL PROGRESS + BACK TO TOP
    ===================================================== */

    const progressBar = document.querySelector(".scroll-progress span");
    const backToTop = document.querySelector(".back-to-top");

    let scrollTicking = false;

    const updateScrollProgress = () => {

        const scrollTop = window.scrollY;

        const documentHeight =
            document.documentElement.scrollHeight - window.innerHeight;

        const progress =
            documentHeight > 0
                ? Math.min(1, Math.max(0, scrollTop / documentHeight))
                : 0;

        if (progressBar) {
            progressBar.style.height = `${progress * 100}%`;
        }

        if (backToTop) {
            backToTop.classList.toggle("visible", scrollTop > window.innerHeight * .6);
        }

        scrollTicking = false;

    };

    if (backToTop) {

        backToTop.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
        });

    }

    const onScroll = () => {

        if (!scrollTicking) {
            requestAnimationFrame(updateScrollProgress);
            scrollTicking = true;
        }

    };

    window.addEventListener("scroll", onScroll, { passive: true });
    updateScrollProgress();


    /* =====================================================
       REVEALS
    ===================================================== */

    const revealElements = document.querySelectorAll(".reveal");

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
       NARRATIVE SCROLLSPY
    ===================================================== */

    const chapters = document.querySelectorAll(".chapter");
    const narrativeIndex = document.getElementById("narrativeIndex");
    const narrativeNumber = document.getElementById("narrativeNumber");
    const narrativeTitle = document.getElementById("narrativeTitle");
    const narrativeDesc = document.getElementById("narrativeDesc");
    const narrativeCountDots = document.querySelectorAll("#narrativeCount span");

    if (chapters.length && "IntersectionObserver" in window) {

        const setActiveChapter = (chapter) => {

            chapters.forEach(c => c.classList.remove("is-active"));
            chapter.classList.add("is-active");

            const index = Array.prototype.indexOf.call(chapters, chapter);

            if (narrativeNumber) narrativeNumber.textContent = chapter.dataset.number;
            if (narrativeTitle) narrativeTitle.textContent = chapter.dataset.title;
            if (narrativeDesc) narrativeDesc.textContent = chapter.dataset.desc;
            if (narrativeIndex) narrativeIndex.classList.add("is-live");

            narrativeCountDots.forEach((dot, i) => {
                dot.classList.toggle("active", i === index);
            });

        };

        const chapterObserver = new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {
                        setActiveChapter(entry.target);
                    }

                });

            },
            { threshold: 0, rootMargin: "-45% 0px -45% 0px" }
        );

        chapters.forEach(chapter => chapterObserver.observe(chapter));

        // Fallback so the first chapter looks active immediately, before scroll.
        setActiveChapter(chapters[0]);

    } else {

        chapters.forEach(c => c.classList.add("is-active"));

    }

});

import { auth } from "../auth/firebase-config.js";
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

document.addEventListener("DOMContentLoaded", () => {

    "use strict";

    const reducedMotion =
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;


    /* =====================================================
       NAV — mobile toggle
    ===================================================== */

    const menuToggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector("header nav");

    if (menuToggle && nav) {

        menuToggle.addEventListener("click", () => {
            nav.classList.toggle("active");
        });

        nav.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", () => nav.classList.remove("active"));
        });

        document.addEventListener("click", event => {
            const isOpen = nav.classList.contains("active");
            if (!isOpen) return;
            const clickedInside = nav.contains(event.target) || menuToggle.contains(event.target);
            if (!clickedInside) nav.classList.remove("active");
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape" && nav.classList.contains("active")) {
                nav.classList.remove("active");
            }
        });

    }


    /* =====================================================
       NAV — Firebase auth state
    ===================================================== */

    const navUserArea = document.getElementById("navUserArea");
    const OWNER_EMAIL = "bittukhantusharkhan@gmail.com";

    const showLoggedOutState = () => {
        if (navUserArea) {
            navUserArea.innerHTML = `<a href="../auth/login.html">Login</a>`;
        }
    };

    onAuthStateChanged(auth, user => {

        if (!navUserArea) return;

        if (!user) {
            showLoggedOutState();
            return;
        }

        const name = user.displayName || (user.email ? user.email.split("@")[0] : "User");
        const isOwner = (user.email || "").toLowerCase() === OWNER_EMAIL.toLowerCase();
        const dashboardLink = isOwner ? "../auth/owner/owner.html" : "../auth/users.html";

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


    /* =====================================================
       HERO — subtle scroll parallax on the background grid
    ===================================================== */

    const heroSection = document.getElementById("heroSection");
    const heroBgGrid = document.getElementById("heroBgGrid");

    let heroParallaxTicking = false;

    const updateHeroParallax = () => {

        if (heroSection && heroBgGrid) {
            const rect = heroSection.getBoundingClientRect();
            if (rect.bottom > 0) {
                const offset = Math.max(0, -rect.top) * 0.12;
                heroBgGrid.style.setProperty("--hero-parallax", `${offset}px`);
                heroBgGrid.style.transform = `translateY(${offset}px)`;
            }
        }

        heroParallaxTicking = false;

    };

    if (heroSection && heroBgGrid && !reducedMotion) {
        window.addEventListener("scroll", () => {
            if (!heroParallaxTicking) {
                requestAnimationFrame(updateHeroParallax);
                heroParallaxTicking = true;
            }
        }, { passive: true });
    }


    /* =====================================================
       WORK INDEX — filters + cursor-follow preview
    ===================================================== */

    const filterPills = document.querySelectorAll(".filter-pill");
    const workRows = document.querySelectorAll(".work-row");

    filterPills.forEach(pill => {

        pill.addEventListener("click", () => {

            filterPills.forEach(p => {
                p.classList.remove("is-active");
                p.setAttribute("aria-pressed", "false");
            });

            pill.classList.add("is-active");
            pill.setAttribute("aria-pressed", "true");

            const filter = pill.dataset.filter;

            workRows.forEach(row => {
                const matches = filter === "all" || row.dataset.category === filter;
                row.style.display = matches ? "" : "none";
            });

        });

    });

    const canHoverPreview =
        window.matchMedia("(min-width: 901px)").matches &&
        window.matchMedia("(pointer: fine)").matches &&
        !reducedMotion;

    if (canHoverPreview) {

        const preview = document.getElementById("workPreview");
        const previewImg = document.getElementById("workPreviewImg");

        if (preview && previewImg) {

            let previewTicking = false;
            let lastMove = null;

            const positionPreview = () => {

                if (lastMove) {

                    const offsetX = 28;
                    const offsetY = -preview.offsetHeight / 2;

                    let left = lastMove.clientX + offsetX;
                    let top = lastMove.clientY + offsetY;

                    const maxLeft = window.innerWidth - preview.offsetWidth - 16;
                    const maxTop = window.innerHeight - preview.offsetHeight - 16;

                    left = Math.min(Math.max(16, left), maxLeft);
                    top = Math.min(Math.max(16, top), maxTop);

                    preview.style.transform = `translate(${left}px, ${top}px)`;

                }

                previewTicking = false;

            };

            workRows.forEach(row => {

                row.addEventListener("mouseenter", () => {
                    const src = row.dataset.image;
                    if (src) previewImg.src = src;
                    preview.classList.add("is-active");
                });

                row.addEventListener("mousemove", event => {
                    lastMove = event;
                    if (!previewTicking) {
                        requestAnimationFrame(positionPreview);
                        previewTicking = true;
                    }
                });

                row.addEventListener("mouseleave", () => {
                    preview.classList.remove("is-active");
                });

            });

        }

    }


    /* =====================================================
       PROCESS STEPS
    ===================================================== */

    const steps = [
        { title: "Start", text: "Clients reach out via email, website, or social media. We review their needs and assess how to best assist them." },
        { title: "Meeting", text: "We schedule a 30-minute call to understand the client's vision and project scope." },
        { title: "Proposal", text: "A detailed project proposal outlining deliverables, timelines, and pricing is shared." },
        { title: "Agreement", text: "Once approved, a formal agreement is signed to finalize project terms." },
        { title: "Deposit", text: "A 30% non-refundable security deposit is required to initiate the project." },
        { title: "Preview", text: "Initial designs or previews are shared, allowing for minor revisions." },
        { title: "Payment", text: "The remaining balance is cleared before final delivery." },
        { title: "Final", text: "Final files are delivered, completing the project." }
    ];

    function showStep(index) {

        const title = document.getElementById("step-title");
        const text = document.getElementById("step-text");
        const tabs = document.querySelectorAll(".process-tab");

        if (!title || !text || !tabs.length || !steps[index]) return;

        title.innerText = steps[index].title;
        text.innerText = steps[index].text;

        tabs.forEach(tab => tab.classList.remove("is-active"));
        if (tabs[index]) tabs[index].classList.add("is-active");

    }

    window.showStep = showStep;
    showStep(0);


    /* =====================================================
       FOOTER YEAR
    ===================================================== */

    const footerYear = document.getElementById("footerYear");
    if (footerYear) footerYear.textContent = String(new Date().getFullYear());


    /* =====================================================
       SCROLL PROGRESS + BACK TO TOP
    ===================================================== */

    const progressBar = document.querySelector(".scroll-progress span");
    const backToTop = document.querySelector(".back-to-top");

    let scrollTicking = false;

    const updateScrollProgress = () => {

        const scrollTop = window.scrollY;
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = documentHeight > 0 ? Math.min(1, Math.max(0, scrollTop / documentHeight)) : 0;

        if (progressBar) progressBar.style.height = `${progress * 100}%`;
        if (backToTop) backToTop.classList.toggle("visible", scrollTop > window.innerHeight * .6);

        scrollTicking = false;

    };

    if (backToTop) {
        backToTop.addEventListener("click", () => {
            window.scrollTo({ top: 0, behavior: reducedMotion ? "auto" : "smooth" });
        });
    }

    window.addEventListener("scroll", () => {
        if (!scrollTicking) {
            requestAnimationFrame(updateScrollProgress);
            scrollTicking = true;
        }
    }, { passive: true });

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

});

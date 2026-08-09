import { auth } from "../auth/firebase-config.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

// Nav toggle
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

// Navbar user state + auth tracking (used again below for the package gate)
const navUserArea = document.getElementById("navUserArea");
const OWNER_EMAIL = "bittukhantusharkhan@gmail.com";

let currentUser = null;

onAuthStateChanged(auth, (user) => {
  currentUser = user;

  if (!navUserArea) return;

  if (user) {
    const name = user.displayName || (user.email ? user.email.split("@")[0] : "User");
    const isOwner = (user.email || "").toLowerCase() === OWNER_EMAIL.toLowerCase();

    const dashboardLink = isOwner
      ? "../auth/owner/owner.html"
      : "../auth/users.html";

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
        await signOut(auth);
        window.location.href = "../auth/login.html";
      });
    }
  } else {
    navUserArea.innerHTML = `
      <a href="../auth/login.html">Login</a>
    `;
  }
});

/* =========================================================
   TOAST — same pattern as the Freebie page
   ========================================================= */

function showToast(message) {
  const container = document.getElementById("toastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;

  container.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add("show"));

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 2200);
}

/* =========================================================
   PACKAGE SELECTION — login gate, then forward to Contact Us
   Mirrors the Freebie page's download gate: signed-in users go
   straight through, signed-out users are sent to login first and
   bounced back to the exact page they were trying to reach.
   ========================================================= */

function getLoginRedirectUrl(targetUrl) {
  return `../auth/login.html?redirect=${encodeURIComponent(targetUrl)}`;
}

const chooseButtons = document.querySelectorAll(".choose-btn");

chooseButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const service = button.dataset.service || "";
    const serviceLabel = button.dataset.serviceLabel || service;

    const target =
      `../Contact Us/index.html` +
      `?service=${encodeURIComponent(service)}` +
      `&serviceLabel=${encodeURIComponent(serviceLabel)}`;

    if (currentUser) {
      window.location.href = target;
      return;
    }

    showToast("Login to continue with your selected package");
    window.location.href = getLoginRedirectUrl(target);
  });
});

/* =========================================================
   FOOTER YEAR
   ========================================================= */

const footerYear = document.getElementById("footerYear");
if (footerYear) footerYear.textContent = String(new Date().getFullYear());

/* =========================================================
   SCROLL PROGRESS + BACK TO TOP
   ========================================================= */

const progressBar = document.querySelector(".scroll-progress span");
const backToTop = document.querySelector(".back-to-top");

let scrollTicking = false;

function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const documentHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress = documentHeight > 0 ? Math.min(1, Math.max(0, scrollTop / documentHeight)) : 0;

  if (progressBar) progressBar.style.height = `${progress * 100}%`;
  if (backToTop) backToTop.classList.toggle("visible", scrollTop > window.innerHeight * 0.6);

  scrollTicking = false;
}

if (backToTop) {
  backToTop.addEventListener("click", () => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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

/* =========================================================
   REVEAL ON SCROLL
   ========================================================= */

const revealElements = document.querySelectorAll(".reveal");

function revealOnScroll() {
  const triggerBottom = window.innerHeight * 0.9;

  revealElements.forEach((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.top < triggerBottom) {
      element.classList.add("show");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);
window.addEventListener("load", revealOnScroll);

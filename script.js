import { auth } from "./Nav Bar/auth/firebase-config.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

// ---------- Typing Effect ----------
const words = [
  "Building unforgettable brands.",
  "Designing products people love.",
  "Creating visual identities.",
  "Scaling ambitious startups.",
  "Crafting premium experiences.",
  "Turning ideas into businesses."
];

const typingElement = document.querySelector(".typing");

let wordIndex = 0;
let charIndex = 0;
let deleting = false;

function random(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function typeEffect() {
  if (!typingElement) return;
  const currentWord = words[wordIndex];

  if (!deleting) {
    typingElement.textContent = currentWord.substring(0, charIndex + 1);
    charIndex++;
    if (charIndex === currentWord.length) {
      deleting = true;
      setTimeout(typeEffect, 1800);
      return;
    }
  } else {
    typingElement.textContent = currentWord.substring(0, charIndex - 1);
    charIndex--;

    if (charIndex === 0) {
      deleting = false;
      wordIndex = (wordIndex + 1) % words.length;
      typingElement.classList.add("glitch");
      setTimeout(() => {
        typingElement.classList.remove("glitch");
      }, 220);
    }
  }

  const speed = deleting ? random(35, 60) : random(70, 120);
  setTimeout(typeEffect, speed);
}

// ---------- Navbar user state ----------
const navUserArea = document.getElementById("navUserArea");
const OWNER_EMAIL = "bittukhantusharkhan@gmail.com";

onAuthStateChanged(auth, (user) => {
  if (!navUserArea) return;

  if (user) {
    const name = user.displayName || (user.email ? user.email.split("@")[0] : "User");
    const isOwner = (user.email || "").toLowerCase() === OWNER_EMAIL.toLowerCase();
    const dashboardLink = isOwner
      ? "./Nav Bar/auth/owner/owner.html"
      : "./Nav Bar/auth/users.html";

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
          location.reload();
        } catch (error) {
          console.error("Logout failed:", error);
        }
      });
    }
  } else {
    navUserArea.innerHTML = `<a href="./Nav Bar/auth/login.html">Login</a>`;
  }
});

// ---------- Single DOMContentLoaded ----------
document.addEventListener("DOMContentLoaded", () => {

  // Typing effect
  if (typingElement) {
    typingElement.textContent = "";
    typeEffect();
  }

  // Desktop slideshow
  const slides = document.querySelectorAll(".slide");
  let currentDesktopIndex = 0;

  if (slides.length > 0) {
    slides.forEach((slide) => {
      const img = new Image();
      img.src = slide.src;
    });

    slides[currentDesktopIndex].style.opacity = "1";

    setInterval(() => {
      slides[currentDesktopIndex].style.opacity = "0";
      currentDesktopIndex = (currentDesktopIndex + 1) % slides.length;
      setTimeout(() => {
        slides[currentDesktopIndex].style.opacity = "1";
      }, 300);
    }, 4000);
  }

  // Mobile slideshow
  if (window.innerWidth <= 767) {
    const mobileSlides = document.querySelectorAll(".mobile-slide");
    let currentMobileIndex = 0;

    if (mobileSlides.length > 0) {
      mobileSlides.forEach((slide) => {
        const img = new Image();
        img.src = slide.src;
      });

      mobileSlides[currentMobileIndex].style.opacity = "1";

      setInterval(() => {
        mobileSlides[currentMobileIndex].style.opacity = "0";
        currentMobileIndex = (currentMobileIndex + 1) % mobileSlides.length;
        setTimeout(() => {
          mobileSlides[currentMobileIndex].style.opacity = "1";
        }, 300);
      }, 4000);
    }
  }

  // Nav bar responsive toggle
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector("header nav");

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      nav.classList.toggle("active");
      const isExpanded = nav.classList.contains("active");
      menuToggle.setAttribute("aria-expanded", String(isExpanded));
    });
  }

  // Project gallery drag/scroll (mobile)
  const projectGallery = document.querySelector(".project-gallery");

  if (projectGallery && window.innerWidth <= 768) {
    projectGallery.addEventListener(
      "wheel",
      (event) => {
        event.preventDefault();
        projectGallery.scrollLeft += event.deltaY * 2;
      },
      { passive: false }
    );

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    projectGallery.addEventListener("mousedown", (e) => {
      isDown = true;
      startX = e.pageX - projectGallery.offsetLeft;
      scrollLeft = projectGallery.scrollLeft;
    });

    projectGallery.addEventListener("mouseleave", () => {
      isDown = false;
    });

    projectGallery.addEventListener("mouseup", () => {
      isDown = false;
    });

    projectGallery.addEventListener("mousemove", (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - projectGallery.offsetLeft;
      const walk = (x - startX) * 2;
      projectGallery.scrollLeft = scrollLeft - walk;
    });
  }

  // Image hover effect
  const images = document.querySelectorAll(".image-card img");
  images.forEach((img) => {
    img.addEventListener("mouseenter", () => {
      images.forEach((other) => {
        if (other !== img) {
          other.style.transform = "scale(0.9)";
        }
      });
      img.style.transform = "scale(1.1)";
    });

    img.addEventListener("mouseleave", () => {
      images.forEach((other) => {
        other.style.transform = "scale(1)";
      });
    });
  });

  // FAQ toggle
  const faqs = document.querySelectorAll(".faq");
  faqs.forEach((faq) => {
    faq.addEventListener("click", () => {
      faq.classList.toggle("active");
    });
  });

  // Scroll-reveal for .reveal sections
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length > 0 && "IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }
});

// ---------- Blog ----------
function toggleBlogContent(button) {
  const fullContent = button.nextElementSibling;
  if (!fullContent) return;

  if (fullContent.style.display === "block") {
    fullContent.style.display = "none";
    button.textContent = "Read More";
  } else {
    fullContent.style.display = "block";
    button.textContent = "Read Less";
  }
}

window.toggleBlogContent = toggleBlogContent;

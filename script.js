import { auth } from "./Nav Bar/auth/firebase-config.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

// Typing Effect
const words = ["TUSDIO", "Imagination", "Perfection"];
let wordIndex = 0;
let letterIndex = 0;
let typingTimeout;

const typingElement = document.querySelector(".typing");

function type() {
  if (!typingElement) return;

  if (letterIndex < words[wordIndex].length) {
    typingElement.textContent += words[wordIndex][letterIndex];
    letterIndex++;
    typingTimeout = setTimeout(type, 100);
  } else {
    typingTimeout = setTimeout(erase, 1500);
  }
}

function erase() {
  if (!typingElement) return;

  if (letterIndex > 0) {
    typingElement.textContent = words[wordIndex].substring(0, letterIndex - 1);
    letterIndex--;
    typingTimeout = setTimeout(erase, 50);
  } else {
    wordIndex = (wordIndex + 1) % words.length;
    typingTimeout = setTimeout(type, 500);
  }
}

// Nav Bar responsive
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("header nav");

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    nav.classList.toggle("active");
    const isExpanded = nav.classList.contains("active");
    menuToggle.setAttribute("aria-expanded", String(isExpanded));
  });
}

// Navbar user state
const navUserArea = document.getElementById("navUserArea");
const OWNER_EMAIL = "bittukhantusharkhan@gmail.com";

onAuthStateChanged(auth, (user) => {
  if (!navUserArea) return;

  if (user) {
    const name = user.displayName || (user.email ? user.email.split("@")[0] : "User");

    const isOwner =
      (user.email || "").toLowerCase() === OWNER_EMAIL.toLowerCase();

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
    navUserArea.innerHTML = `
      <a href="./Nav Bar/auth/login.html">Login</a>
    `;
  }
});

document.addEventListener("DOMContentLoaded", function () {
  // Start typing effect
  if (typingElement) {
    typingElement.textContent = "";
    type();
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

  // Project gallery drag/scroll
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

  // FAQ
  const faqs = document.querySelectorAll(".faq");
  faqs.forEach((faq) => {
    faq.addEventListener("click", () => {
      faq.classList.toggle("active");
    });
  });
});

// Blog
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

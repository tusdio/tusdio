import { auth } from "../auth/firebase-config.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

// Nav Bar responsive
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("header nav");

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    nav.classList.toggle("active");
  });
}

// Navbar user state
const navUserArea = document.getElementById("navUserArea");
const OWNER_EMAIL = "bittukhantusharkhan@gmail.com";

onAuthStateChanged(auth, (user) => {
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
        <button id="logoutBtn" class="nav-user-btn" type="button">Logout</button>
      </div>
    `;

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
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

// Typing Effect
const words = ["TUSDIO", "Imagination", "Perfection"];
let wordIndex = 0;
let letterIndex = 0;
const typingElement = document.querySelector(".typing");

function type() {
  if (!typingElement) return;

  if (letterIndex < words[wordIndex].length) {
    typingElement.textContent += words[wordIndex][letterIndex];
    letterIndex++;
    setTimeout(type, 100);
  } else {
    setTimeout(erase, 1500);
  }
}

function erase() {
  if (!typingElement) return;

  if (letterIndex > 0) {
    typingElement.textContent = words[wordIndex].substring(0, letterIndex - 1);
    letterIndex--;
    setTimeout(erase, 50);
  } else {
    wordIndex = (wordIndex + 1) % words.length;
    setTimeout(type, 500);
  }
}

if (typingElement) {
  typingElement.textContent = "";
  type();
}

// steps
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
  const stepsElements = document.querySelectorAll(".timeline-step");

  if (!title || !text || !stepsElements.length) return;

  title.innerText = steps[index].title;
  text.innerText = steps[index].text;

  stepsElements.forEach((step) => step.classList.remove("active"));
  if (stepsElements[index]) {
    stepsElements[index].classList.add("active");
  }
}

window.showStep = showStep;

document.addEventListener("DOMContentLoaded", () => {
  showStep(0);
});

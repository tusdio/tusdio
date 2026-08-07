import { auth } from "../auth/firebase-config.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

// Navbar toggle
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
    const name =
      user.displayName || (user.email ? user.email.split("@")[0] : "User");

    const isOwner =
      (user.email || "").toLowerCase() === OWNER_EMAIL.toLowerCase();

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

// Timeline
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
  const stepEls = document.querySelectorAll(".timeline-step");

  if (!title || !text || !stepEls.length) return;
  if (index < 0 || index >= steps.length) return;

  title.innerText = steps[index].title;
  text.innerText = steps[index].text;

  stepEls.forEach((step) => step.classList.remove("active"));
  if (stepEls[index]) {
    stepEls[index].classList.add("active");
  }
}

window.showStep = showStep;

document.addEventListener("DOMContentLoaded", () => {
  showStep(0);

  const faqs = document.querySelectorAll(".faq");
  faqs.forEach((faq) => {
    faq.addEventListener("click", () => {
      faq.classList.toggle("active");
    });
  });
});

// Contact form submission
const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = contactForm.querySelector("button[type='submit']");
    const status = document.getElementById("formStatus");
    const formData = new FormData(contactForm);

    btn.classList.remove("success");
    btn.classList.add("loading");
    btn.disabled = true;
    if (status) status.textContent = "";

    try {
      const res = await fetch("https://formsubmit.co/ajax/43654426830539517d50b8e707838000", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData
      });

      if (!res.ok) throw new Error("Request failed");

      btn.classList.remove("loading");
      btn.classList.add("success");
      if (status) status.textContent = "Thanks! Your message has been sent — we'll get back to you soon.";

      contactForm.reset();

      setTimeout(() => {
        btn.classList.remove("success");
        btn.disabled = false;
      }, 2500);
    } catch (err) {
      btn.classList.remove("loading");
      btn.disabled = false;
      if (status) status.textContent = "Something went wrong. Please try again or email us directly.";
    }
  });
}

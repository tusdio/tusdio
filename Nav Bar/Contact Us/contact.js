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

// FAQ accordion
document.querySelectorAll(".faq-item").forEach((item) => {
  const question = item.querySelector(".faq-question");
  const answer = item.querySelector(".faq-answer");
  if (!question || !answer) return;

  question.addEventListener("click", () => {
    const isOpen = item.classList.contains("open");

    document.querySelectorAll(".faq-item.open").forEach((openItem) => {
      if (openItem !== item) {
        openItem.classList.remove("open");
        openItem.querySelector(".faq-question").setAttribute("aria-expanded", "false");
        openItem.querySelector(".faq-answer").style.maxHeight = null;
      }
    });

    item.classList.toggle("open", !isOpen);
    question.setAttribute("aria-expanded", String(!isOpen));
    answer.style.maxHeight = isOpen ? null : `${answer.scrollHeight}px`;
  });
});

// Message character counter
const messageInput = document.getElementById("message");
const charCount = document.getElementById("charCount");

if (messageInput && charCount) {
  const updateCharCount = () => {
    charCount.textContent = `${messageInput.value.length} / 600`;
  };
  messageInput.addEventListener("input", updateCharCount);
  updateCharCount();
}

// Inline validation helpers
function validateField(field) {
  const wrapper = field.closest(".form-field");
  if (!wrapper) return true;

  const valid = field.checkValidity();
  wrapper.classList.toggle("invalid", !valid);
  return valid;
}

document.querySelectorAll(".contact-form input[required], .contact-form textarea[required]").forEach((field) => {
  field.addEventListener("blur", () => validateField(field));
  field.addEventListener("input", () => {
    if (field.closest(".form-field")?.classList.contains("invalid")) validateField(field);
  });
});

// EmailJS — sends a fully branded HTML email (with your logo) instead of FormSubmit's
// plain-text templates. Falls back to FormSubmit automatically until you fill these in.
// Setup: sign up at emailjs.com → add an Email Service → create a Template using the
// HTML in email-template.html (has your logo pre-wired in) → copy your Public Key,
// Service ID, and Template ID from the EmailJS dashboard into the three lines below.
const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";
const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";

const emailjsReady =
  typeof window.emailjs !== "undefined" && EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY";

if (emailjsReady) {
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
}

// Success overlay — shown after a successful form submission
const successOverlay = document.getElementById("successOverlay");
const successNameEl = document.getElementById("successName");
const successCloseBtn = document.getElementById("successCloseBtn");
const successCloseIcon = document.getElementById("successCloseIcon");

function showSuccessOverlay(name) {
  if (!successOverlay) return;

  if (successNameEl) successNameEl.textContent = name || "there";

  successOverlay.hidden = false;
  successOverlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("overlay-open");

  requestAnimationFrame(() => successOverlay.classList.add("show"));
}

function hideSuccessOverlay() {
  if (!successOverlay || successOverlay.hidden) return;

  successOverlay.classList.remove("show");
  successOverlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("overlay-open");

  setTimeout(() => {
    successOverlay.hidden = true;
  }, 350);
}

if (successCloseBtn) successCloseBtn.addEventListener("click", hideSuccessOverlay);
if (successCloseIcon) successCloseIcon.addEventListener("click", hideSuccessOverlay);

if (successOverlay) {
  successOverlay.addEventListener("click", (event) => {
    if (event.target === successOverlay) hideSuccessOverlay();
  });
}

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") hideSuccessOverlay();
});

// Contact form submission
const contactForm = document.getElementById("contactForm");

// Selected package, forwarded from the Package page's login-gated "Choose" buttons
(function applySelectedPackage() {
  const params = new URLSearchParams(window.location.search);
  const serviceSlug = params.get("service");
  if (!serviceSlug) return;

  const serviceLabel = params.get("serviceLabel") || serviceSlug.replace(/-/g, " ");

  const banner = document.getElementById("selectedPackageBanner");
  const bannerName = document.getElementById("selectedPackageName");
  const packageField = document.getElementById("packageField");
  const messageField = document.getElementById("message");

  if (banner && bannerName) {
    bannerName.textContent = serviceLabel;
    banner.hidden = false;
  }

  if (packageField) packageField.value = serviceLabel;

  if (messageField && !messageField.value) {
    messageField.value = `Hi TUSDIO team, I'm interested in the ${serviceLabel} package. `;
  }
})();

if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const requiredFields = contactForm.querySelectorAll("input[required], textarea[required]");
    let formIsValid = true;

    requiredFields.forEach((field) => {
      if (!validateField(field)) formIsValid = false;
    });

    if (!formIsValid) {
      const firstInvalid = contactForm.querySelector(".form-field.invalid input, .form-field.invalid textarea");
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    const btn = contactForm.querySelector("button[type='submit']");
    const status = document.getElementById("formStatus");
    const formData = new FormData(contactForm);
    const firstName = (contactForm.querySelector("#name")?.value || "").trim().split(" ")[0];

    btn.classList.remove("success");
    btn.classList.add("loading");
    btn.disabled = true;
    if (status) status.textContent = "";

    try {
      if (emailjsReady) {
        await emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, contactForm);
      } else {
        const res = await fetch("https://formsubmit.co/ajax/43654426830539517d50b8e707838000", {
          method: "POST",
          headers: { Accept: "application/json" },
          body: formData
        });

        if (!res.ok) throw new Error("Request failed");
      }

      btn.classList.remove("loading");
      btn.classList.add("success");

      contactForm.reset();
      showSuccessOverlay(firstName);

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

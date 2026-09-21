import { auth, db } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";


/* ============================================================
   CONFIG
   NOTE: the owner check only decides where to redirect.
   Real access control must live in Firestore rules / custom claims.
   ============================================================ */

const OWNER_EMAIL = "bittukhantusharkhan@gmail.com";
const OWNER_PAGE = "./owner/owner.html";
const CLIENT_PAGE = "users.html";
const MIN_PASSWORD_LENGTH = 8;


/* ============================================================
   DOM
   ============================================================ */

const $ = (id) => document.getElementById(id);

const form = $("signupForm");
const nameInput = $("name");
const emailInput = $("email");
const passwordInput = $("password");
const confirmInput = $("confirmPassword");
const signupBtn = $("signupBtn");
const googleBtn = $("googleSignupBtn");
const message = $("signupMessage");
const strengthEl = $("strength");
const strengthText = $("strengthText");
const matchHint = $("matchHint");
const capsHint = $("capsHint");

$("year").textContent = new Date().getFullYear();


/* ============================================================
   UI HELPERS
   ============================================================ */

let busy = false;

function showMessage(text = "", type = "error") {
  message.textContent = text;
  message.className = "message" + (text ? ` is-${type}` : "");
}

function markInvalid(input, invalid) {
  input.setAttribute("aria-invalid", invalid ? "true" : "false");
}

function setLoading(button, isLoading, loadingText) {
  const label = button.querySelector(".label");
  if (!button.dataset.label) button.dataset.label = label.textContent;

  button.classList.toggle("is-loading", isLoading);
  button.setAttribute("aria-busy", String(isLoading));
  label.textContent = isLoading ? loadingText : button.dataset.label;

  signupBtn.disabled = isLoading;
  googleBtn.disabled = isLoading;
}

function getFriendlyError(error) {
  switch (error?.code) {
    case "auth/email-already-in-use":
      return "An account with this email already exists. Try signing in instead.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/weak-password":
      return `Choose a stronger password with at least ${MIN_PASSWORD_LENGTH} characters.`;
    case "auth/network-request-failed":
      return "No connection. Check your internet and try again.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Google sign-up was closed before it finished.";
    case "auth/popup-blocked":
      return "Your browser blocked the Google window. Allow pop-ups for this site and try again.";
    case "auth/account-exists-with-different-credential":
      return "This email is already registered with a different sign-in method.";
    case "auth/operation-not-allowed":
      return "This sign-up method is turned off. Contact TUSDIO for help.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a few minutes and try again.";
    default:
      return "Something went wrong. Please try again.";
  }
}


/* ============================================================
   REDIRECT
   ============================================================ */

function isOwner(user) {
  return (user?.email || "").trim().toLowerCase() === OWNER_EMAIL.toLowerCase();
}

function redirectUser(user) {
  window.location.replace(isOwner(user) ? OWNER_PAGE : CLIENT_PAGE);
}

// Already signed in? Skip the form.
onAuthStateChanged(auth, (user) => {
  if (user && !busy) redirectUser(user);
});


/* ============================================================
   CLIENT DOCUMENT
   ============================================================ */

async function createClientDocument(user, loginType, fallbackName = "") {
  if (!user?.uid || isOwner(user)) return;

  const ref = doc(db, "clients", user.uid);
  const snap = await getDoc(ref);

  // Existing client: never overwrite project data
  if (snap.exists()) {
    const existing = snap.data() || {};
    await setDoc(ref, {
      loginType,
      name: existing.name || user.displayName || fallbackName || "Client",
      email: user.email || existing.email || "",
      lastLogin: serverTimestamp()
    }, { merge: true });
    return;
  }

  await setDoc(ref, {
    name: user.displayName || fallbackName || user.email?.split("@")[0] || "Client",
    email: user.email || "",
    role: "client",
    service: "Not selected yet",
    projectName: "New Project",
    phase: "Discovery",
    status: "In Progress",
    nextAction: "Complete onboarding",
    progress: 10,
    startDate: new Date().toISOString().split("T")[0],
    estimatedDelivery: "To be decided",
    revisionRound: "Round 1",
    planName: "",
    paymentStatus: "Pending",
    totalAmount: 0,
    paidAmount: 0,
    invoiceLink: "",
    updates: ["Account created", "Project initialized"],
    tasks: ["Complete onboarding", "Share project details"],
    access: "active",
    loginType,
    createdAt: serverTimestamp(),
    lastLogin: serverTimestamp()
  });
}

// A Firestore hiccup must not strand someone whose account was created.
// The login page creates any missing client document on next sign-in.
async function finishSignUp(user, loginType, fallbackName) {
  try {
    await createClientDocument(user, loginType, fallbackName);
  } catch (error) {
    console.error("TUSDIO client profile creation failed:", error);
  }
  showMessage("Account created. Taking you to your workspace…", "success");
  setTimeout(() => redirectUser(user), 600);
}


/* ============================================================
   PASSWORD STRENGTH + MATCH
   ============================================================ */

function scorePassword(value) {
  if (!value) return 0;
  if (value.length < MIN_PASSWORD_LENGTH) return 1;

  let score = 1;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score += 1;
  if (/\d/.test(value)) score += 1;
  if (/[^A-Za-z0-9]/.test(value) || value.length >= 14) score += 1;
  return Math.min(score, 4);
}

const STRENGTH_LABELS = {
  1: "Too short or too simple",
  2: "Fair. Add numbers or symbols to strengthen it.",
  3: "Good",
  4: "Strong"
};

function updateStrength() {
  const value = passwordInput.value;
  const level = scorePassword(value);

  strengthEl.classList.toggle("is-visible", value.length > 0);
  strengthEl.dataset.level = String(level);

  strengthText.textContent =
    value.length > 0 && value.length < MIN_PASSWORD_LENGTH
      ? `Use at least ${MIN_PASSWORD_LENGTH} characters (${MIN_PASSWORD_LENGTH - value.length} more)`
      : STRENGTH_LABELS[level] || "";
}

function updateMatch() {
  const a = passwordInput.value;
  const b = confirmInput.value;

  matchHint.className = "hint";

  if (!b) {
    matchHint.textContent = "";
    markInvalid(confirmInput, false);
    return;
  }

  if (a === b) {
    matchHint.textContent = "Passwords match.";
    matchHint.classList.add("is-visible", "is-ok");
    markInvalid(confirmInput, false);
  } else {
    matchHint.textContent = "Passwords don't match yet.";
    matchHint.classList.add("is-visible");
    markInvalid(confirmInput, true);
  }
}

passwordInput.addEventListener("input", () => {
  updateStrength();
  updateMatch();
  markInvalid(passwordInput, false);
});
confirmInput.addEventListener("input", updateMatch);

[nameInput, emailInput].forEach((input) =>
  input.addEventListener("input", () => {
    markInvalid(input, false);
    if (message.classList.contains("is-error")) showMessage("");
  })
);


/* ============================================================
   PASSWORD: SHOW / HIDE, CAPS LOCK
   ============================================================ */

document.querySelectorAll("[data-toggle]").forEach((btn) => {
  const input = $(btn.dataset.toggle);
  const showIcon = btn.querySelector(".i-show");
  const hideIcon = btn.querySelector(".i-hide");

  btn.addEventListener("click", () => {
    const reveal = input.type === "password";
    input.type = reveal ? "text" : "password";
    showIcon.hidden = reveal;
    hideIcon.hidden = !reveal;
    btn.setAttribute("aria-label", reveal ? "Hide password" : "Show password");
    btn.setAttribute("aria-pressed", String(reveal));
    input.focus();
  });
});

function updateCaps(event) {
  const on = event.getModifierState && event.getModifierState("CapsLock");
  capsHint.classList.toggle("is-visible", Boolean(on));
}
[passwordInput, confirmInput].forEach((input) => {
  input.addEventListener("keydown", updateCaps);
  input.addEventListener("keyup", updateCaps);
  input.addEventListener("blur", () => capsHint.classList.remove("is-visible"));
});


/* ============================================================
   EMAIL / PASSWORD SIGN UP
   ============================================================ */

function fail(input, text) {
  markInvalid(input, true);
  showMessage(text);
  input.focus();
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = nameInput.value.trim();
  const email = emailInput.value.trim().toLowerCase();
  const password = passwordInput.value;
  const confirm = confirmInput.value;

  [nameInput, emailInput, passwordInput, confirmInput].forEach((i) => markInvalid(i, false));

  if (!name) return fail(nameInput, "Enter your full name.");
  if (!email || !emailInput.checkValidity()) return fail(emailInput, "Enter a valid email address.");
  if (password.length < MIN_PASSWORD_LENGTH) {
    return fail(passwordInput, `Your password needs at least ${MIN_PASSWORD_LENGTH} characters.`);
  }
  if (password !== confirm) return fail(confirmInput, "The two passwords don't match.");

  busy = true;
  showMessage("");
  setLoading(signupBtn, true, "Creating account…");

  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    try {
      await updateProfile(user, { displayName: name });
    } catch (error) {
      console.warn("Could not save display name:", error);
    }

    await finishSignUp(user, "Email / Password", name);
  } catch (error) {
    console.error("TUSDIO create account error:", error);
    busy = false;
    setLoading(signupBtn, false);
    if (error?.code === "auth/email-already-in-use" || error?.code === "auth/invalid-email") {
      markInvalid(emailInput, true);
    }
    showMessage(getFriendlyError(error));
  }
});


/* ============================================================
   GOOGLE SIGN UP
   ============================================================ */

googleBtn.addEventListener("click", async () => {
  busy = true;
  showMessage("");
  setLoading(googleBtn, true, "Connecting to Google…");

  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const { user } = await signInWithPopup(auth, provider);
    await finishSignUp(user, "Google", "");
  } catch (error) {
    console.error("TUSDIO Google signup error:", error);
    busy = false;
    setLoading(googleBtn, false);
    showMessage(getFriendlyError(error));
  }
});


/* ============================================================
   SHOWCASE (autoplay driven by the progress bar animation)
   ============================================================ */

const stage = $("stage");
const slides = [...stage.querySelectorAll(".slide")];
const segmentsEl = $("segments");
const pauseBtn = $("pauseBtn");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let current = 0;
let userPaused = reduceMotion;

const segments = slides.map((_, i) => {
  const seg = document.createElement("button");
  seg.type = "button";
  seg.className = "seg";
  seg.setAttribute("aria-label", `Go to slide ${i + 1} of ${slides.length}`);
  seg.innerHTML = '<span class="seg-track"><span class="seg-fill"></span></span>';
  seg.addEventListener("click", () => show(i));
  segmentsEl.appendChild(seg);
  return seg;
});

function show(index) {
  current = (index + slides.length) % slides.length;

  slides.forEach((slide, i) => slide.classList.toggle("is-active", i === current));

  segments.forEach((seg, i) => {
    seg.classList.remove("is-active", "is-done");
    seg.removeAttribute("aria-current");
    if (i < current) seg.classList.add("is-done");
  });

  void segmentsEl.offsetWidth;
  segments[current].classList.add("is-active");
  segments[current].setAttribute("aria-current", "true");
}

segmentsEl.addEventListener("animationend", (event) => {
  if (event.animationName === "fill" && !userPaused) show(current + 1);
});

function setPaused(paused) {
  userPaused = paused;
  stage.classList.toggle("is-paused", paused);
  pauseBtn.querySelector(".i-pause").hidden = paused;
  pauseBtn.querySelector(".i-play").hidden = !paused;
  pauseBtn.setAttribute("aria-label", paused ? "Play slideshow" : "Pause slideshow");
}

pauseBtn.addEventListener("click", () => setPaused(!userPaused));
stage.addEventListener("mouseenter", () => stage.classList.add("is-paused"));
stage.addEventListener("mouseleave", () => stage.classList.toggle("is-paused", userPaused));

show(0);
setPaused(userPaused);

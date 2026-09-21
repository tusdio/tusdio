import { auth, db } from "./firebase-config.js";

import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";


/* ============================================================
   CONFIG
   NOTE: this owner check only decides where to redirect.
   Real access control must live in Firestore rules / custom claims.
   ============================================================ */

const OWNER_EMAIL = "bittukhantusharkhan@gmail.com";
const OWNER_PAGE = "./owner/owner.html";
const CLIENT_PAGE = "users.html";
const RESET_COOLDOWN_MS = 30000;


/* ============================================================
   DOM
   ============================================================ */

const $ = (id) => document.getElementById(id);

const form = $("loginForm");
const emailInput = $("email");
const passwordInput = $("password");
const rememberInput = $("remember");
const loginBtn = $("loginBtn");
const googleBtn = $("googleLoginBtn");
const message = $("loginMessage");
const forgotBtn = $("forgotPassword");
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

  // Lock every action while a request is running
  loginBtn.disabled = isLoading;
  googleBtn.disabled = isLoading;
}

function getFriendlyError(error) {
  switch (error?.code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "That email and password don't match. Check them and try again.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    case "auth/user-disabled":
      return "This account has been disabled. Contact TUSDIO for help.";
    case "auth/too-many-requests":
      return "Too many attempts. Wait a few minutes, or reset your password.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return "Google sign-in was closed before it finished.";
    case "auth/popup-blocked":
      return "Your browser blocked the Google window. Allow pop-ups for this site and try again.";
    case "auth/network-request-failed":
      return "No connection. Check your internet and try again.";
    case "auth/account-exists-with-different-credential":
      return "This email is already registered with a different sign-in method.";
    case "auth/operation-not-allowed":
      return "This sign-in method is turned off. Contact TUSDIO for help.";
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
   A Firestore failure should never trap someone who signed in
   successfully, so callers catch and continue.
   ============================================================ */

async function ensureClientDocument(user, loginType) {
  if (!user?.uid || isOwner(user)) return;

  const ref = doc(db, "clients", user.uid);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    await setDoc(ref, {
      name: user.displayName || user.email?.split("@")[0] || "Client",
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
    return;
  }

  const existing = snap.data() || {};
  await setDoc(ref, {
    loginType,
    name: existing.name || user.displayName || "Client",
    email: user.email || existing.email || "",
    lastLogin: serverTimestamp()
  }, { merge: true });
}

async function finishSignIn(user, loginType) {
  try {
    await ensureClientDocument(user, loginType);
  } catch (error) {
    console.error("TUSDIO client profile sync failed:", error);
  }
  redirectUser(user);
}

async function applyPersistence() {
  try {
    await setPersistence(
      auth,
      rememberInput.checked ? browserLocalPersistence : browserSessionPersistence
    );
  } catch (error) {
    console.warn("Could not set persistence:", error);
  }
}


/* ============================================================
   EMAIL / PASSWORD
   ============================================================ */

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  markInvalid(emailInput, false);
  markInvalid(passwordInput, false);

  if (!email || !emailInput.checkValidity()) {
    markInvalid(emailInput, true);
    showMessage("Enter a valid email address.");
    emailInput.focus();
    return;
  }

  if (!password) {
    markInvalid(passwordInput, true);
    showMessage("Enter your password.");
    passwordInput.focus();
    return;
  }

  busy = true;
  showMessage("");
  setLoading(loginBtn, true, "Signing in…");

  try {
    await applyPersistence();
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    await finishSignIn(user, "Email / Password");
  } catch (error) {
    console.error("TUSDIO email login error:", error);
    busy = false;
    setLoading(loginBtn, false);
    markInvalid(emailInput, true);
    markInvalid(passwordInput, true);
    showMessage(getFriendlyError(error));
    passwordInput.select();
  }
});


/* ============================================================
   GOOGLE
   ============================================================ */

googleBtn.addEventListener("click", async () => {
  busy = true;
  showMessage("");
  setLoading(googleBtn, true, "Connecting to Google…");

  try {
    await applyPersistence();
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const { user } = await signInWithPopup(auth, provider);
    await finishSignIn(user, "Google");
  } catch (error) {
    console.error("TUSDIO Google login error:", error);
    busy = false;
    setLoading(googleBtn, false);
    showMessage(getFriendlyError(error));
  }
});


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
passwordInput.addEventListener("keydown", updateCaps);
passwordInput.addEventListener("keyup", updateCaps);
passwordInput.addEventListener("blur", () => capsHint.classList.remove("is-visible"));

[emailInput, passwordInput].forEach((input) =>
  input.addEventListener("input", () => {
    markInvalid(input, false);
    if (message.classList.contains("is-error")) showMessage("");
  })
);


/* ============================================================
   FORGOT PASSWORD
   Same response whether or not the account exists, so the form
   can't be used to discover which emails are registered.
   ============================================================ */

let resetTimer = null;

function startResetCooldown() {
  let remaining = Math.ceil(RESET_COOLDOWN_MS / 1000);
  forgotBtn.disabled = true;
  forgotBtn.textContent = `Resend in ${remaining}s`;

  resetTimer = setInterval(() => {
    remaining -= 1;
    if (remaining <= 0) {
      clearInterval(resetTimer);
      forgotBtn.disabled = false;
      forgotBtn.textContent = "Forgot password?";
    } else {
      forgotBtn.textContent = `Resend in ${remaining}s`;
    }
  }, 1000);
}

forgotBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();

  if (!email || !emailInput.checkValidity()) {
    markInvalid(emailInput, true);
    showMessage("Enter your email above first, then select “Forgot password?”.");
    emailInput.focus();
    return;
  }

  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    if (error?.code === "auth/network-request-failed" || error?.code === "auth/too-many-requests") {
      showMessage(getFriendlyError(error));
      return;
    }
    if (error?.code === "auth/invalid-email") {
      markInvalid(emailInput, true);
      showMessage(getFriendlyError(error));
      return;
    }
    console.error("TUSDIO password reset error:", error);
  }

  showMessage(`If an account exists for ${email}, a reset link is on its way. Check your spam folder too.`, "success");
  startResetCooldown();
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

  // Force the fill animation to restart
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

// Hover / keyboard focus pauses temporarily (without changing the user's choice)
stage.addEventListener("mouseenter", () => stage.classList.add("is-paused"));
stage.addEventListener("mouseleave", () => stage.classList.toggle("is-paused", userPaused));

show(0);
setPaused(userPaused);

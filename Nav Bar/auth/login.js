import { auth, db } from "./firebase-config.js";

import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";


/* ============================================================
   TUSDIO AUTH CONFIG
   ============================================================ */

const OWNER_EMAIL =
  "bittukhantusharkhan@gmail.com";

const GALLERY_INTERVAL =
  6000;


/* ============================================================
   DOM
   ============================================================ */

const form =
  document.getElementById("loginForm");

const emailInput =
  document.getElementById("email");

const passwordInput =
  document.getElementById("password");

const loginBtn =
  document.getElementById("loginBtn");

const googleBtn =
  document.getElementById("googleLoginBtn");

const message =
  document.getElementById("loginMessage");

const passwordToggle =
  document.getElementById("passwordToggle");

const forgotPassword =
  document.getElementById("forgotPassword");


/* Gallery */

const slides =
  document.querySelectorAll(".gallery-slide");

const dots =
  document.querySelectorAll(".gallery-dot");

const currentSlideElement =
  document.getElementById("currentSlide");

const galleryLoading =
  document.getElementById("galleryLoading");


/* ============================================================
   AUTH MESSAGE
   ============================================================ */

function showMessage(
  text,
  type = "normal"
) {

  if (!message) {
    return;
  }

  message.textContent = text;


  if (type === "error") {

    message.style.color =
      "#b23a32";

  }

  else if (type === "success") {

    message.style.color =
      "#39724d";

  }

  else {

    message.style.color =
      "#777777";

  }
}


/* ============================================================
   FRIENDLY FIREBASE ERRORS
   ============================================================ */

function getFriendlyError(error) {

  switch (error?.code) {

    case "auth/invalid-credential":
      return "The email or password is incorrect.";

    case "auth/invalid-email":
      return "Please enter a valid email address.";

    case "auth/user-not-found":
      return "No TUSDIO account exists with this email.";

    case "auth/wrong-password":
      return "The password you entered is incorrect.";

    case "auth/too-many-requests":
      return "Too many attempts. Please try again later.";

    case "auth/popup-closed-by-user":
      return "Google sign-in was cancelled.";

    case "auth/popup-blocked":
      return "Your browser blocked the Google sign-in window.";

    case "auth/network-request-failed":
      return "Network error. Please check your connection.";

    case "auth/email-already-in-use":
      return "An account already exists with this email.";

    default:
      return (
        error?.message ||
        "Something went wrong. Please try again."
      );

  }

}


/* ============================================================
   BUTTON LOADING STATE
   ============================================================ */

function setLoginLoading(isLoading) {

  if (!loginBtn) {
    return;
  }

  loginBtn.disabled =
    isLoading;

  loginBtn.textContent =
    isLoading
      ? "Signing in..."
      : "Continue";

}


function setGoogleLoading(isLoading) {

  if (!googleBtn) {
    return;
  }

  googleBtn.disabled =
    isLoading;

  if (isLoading) {

    googleBtn.innerHTML =
      "Connecting to Google...";

    return;
  }


  googleBtn.innerHTML = `
    <svg
      class="google-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >

      <path
        fill="#4285F4"
        d="M21.35 12.27c0-.79-.07-1.55-.22-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z"
      />

      <path
        fill="#34A853"
        d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.55 0-4.7-1.72-5.47-4.03H3.28v2.53A9.74 9.74 0 0 0 12 21.75Z"
      />

      <path
        fill="#FBBC05"
        d="M6.53 13.83A5.86 5.86 0 0 1 6.22 12c0-.64.11-1.26.31-1.83V7.64H3.28A9.74 9.74 0 0 0 2.25 12c0 1.57.38 3.05 1.03 4.36l3.25-2.53Z"
      />

      <path
        fill="#EA4335"
        d="M12 6.14c1.43 0 2.72.49 3.73 1.46l2.8-2.8C16.83 3.22 14.63 2.25 12 2.25a9.74 9.74 0 0 0-8.72 5.39l3.25 2.53C7.3 7.86 9.45 6.14 12 6.14Z"
      />

    </svg>

    Continue with Google
  `;

}


/* ============================================================
   REDIRECT BY ROLE
   ============================================================ */

function redirectUserByRole(user) {

  const email =
    (user?.email || "")
      .trim()
      .toLowerCase();


  if (
    email ===
    OWNER_EMAIL
      .trim()
      .toLowerCase()
  ) {

    window.location.href =
      "./owner/owner.html";

  }

  else {

    window.location.href =
      "users.html";

  }

}


/* ============================================================
   EMAIL / PASSWORD LOGIN
   ============================================================ */

if (form) {

  form.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const email =
        emailInput.value
          .trim();

      const password =
        passwordInput.value;


      /* Basic validation */

      if (!email) {

        showMessage(
          "Please enter your email address.",
          "error"
        );

        emailInput.focus();

        return;

      }


      if (!password) {

        showMessage(
          "Please enter your password.",
          "error"
        );

        passwordInput.focus();

        return;

      }


      setLoginLoading(true);

      showMessage("");


      try {

        /* Firebase authentication */

        const userCredential =
          await signInWithEmailAndPassword(
            auth,
            email,
            password
          );


        const user =
          userCredential.user;


        /* Client document */

        const clientRef =
          doc(
            db,
            "clients",
            user.uid
          );


        await setDoc(
          clientRef,
          {
            loginType:
              "Email / Password",

            email:
              user.email ||
              email,

            lastLogin:
              new Date().toISOString()
          },
          {
            merge: true
          }
        );


        /* Redirect */

        redirectUserByRole(user);


      }

      catch (error) {

        console.error(
          "TUSDIO email login error:",
          error
        );


        showMessage(
          getFriendlyError(error),
          "error"
        );

      }

      finally {

        setLoginLoading(false);

      }

    }
  );

}


/* ============================================================
   GOOGLE LOGIN
   ============================================================ */

if (googleBtn) {

  googleBtn.addEventListener(
    "click",
    async () => {

      setGoogleLoading(true);

      showMessage("");


      try {

        const provider =
          new GoogleAuthProvider();


        provider.setCustomParameters({
          prompt: "select_account"
        });


        const result =
          await signInWithPopup(
            auth,
            provider
          );


        const user =
          result.user;


        /* Client document */

        const clientRef =
          doc(
            db,
            "clients",
            user.uid
          );


        const clientSnap =
          await getDoc(clientRef);


        /* ====================================================
           NEW CLIENT
           ==================================================== */

        if (!clientSnap.exists()) {

          await setDoc(
            clientRef,
            {

              name:
                user.displayName ||
                "Client",

              email:
                user.email ||
                "",

              role:
                "client",

              service:
                "Not selected yet",

              projectName:
                "New Project",

              phase:
                "Discovery",

              status:
                "In Progress",

              nextAction:
                "Complete onboarding",

              progress:
                10,

              startDate:
                new Date()
                  .toISOString()
                  .split("T")[0],

              estimatedDelivery:
                "To be decided",

              revisionRound:
                "Round 1",

              updates: [
                "Account created",
                "Project initialized"
              ],

              tasks: [
                "Complete onboarding",
                "Share project details"
              ],

              access:
                "active",

              loginType:
                "Google",

              createdAt:
                new Date().toISOString(),

              lastLogin:
                new Date().toISOString()

            }
          );

        }


        /* ====================================================
           EXISTING CLIENT
           ==================================================== */

        else {

          const existingData =
            clientSnap.data();


          await setDoc(
            clientRef,
            {

              loginType:
                "Google",

              name:
                user.displayName ||
                existingData.name ||
                "Client",

              email:
                user.email ||
                existingData.email ||
                "",

              lastLogin:
                new Date().toISOString()

            },
            {
              merge: true
            }
          );

        }


        /* Redirect */

        redirectUserByRole(user);

      }

      catch (error) {

        console.error(
          "TUSDIO Google login error:",
          error
        );


        showMessage(
          getFriendlyError(error),
          "error"
        );

      }

      finally {

        setGoogleLoading(false);

      }

    }
  );

}


/* ============================================================
   PASSWORD SHOW / HIDE
   ============================================================ */

if (
  passwordToggle &&
  passwordInput
) {

  passwordToggle.addEventListener(
    "click",
    () => {

      const showingPassword =
        passwordInput.type ===
        "text";


      if (showingPassword) {

        passwordInput.type =
          "password";

        passwordToggle.setAttribute(
          "aria-label",
          "Show password"
        );

      }

      else {

        passwordInput.type =
          "text";

        passwordToggle.setAttribute(
          "aria-label",
          "Hide password"
        );

      }

    }
  );

}


/* ============================================================
   FORGOT PASSWORD
   ============================================================ */

if (forgotPassword) {

  forgotPassword.addEventListener(
    "click",
    async (event) => {

      event.preventDefault();


      const email =
        emailInput.value.trim();


      if (!email) {

        showMessage(
          "Enter your email address first.",
          "error"
        );

        emailInput.focus();

        return;

      }


      try {

        await sendPasswordResetEmail(
          auth,
          email
        );


        showMessage(
          "Password reset instructions have been sent to your email.",
          "success"
        );

      }

      catch (error) {

        console.error(
          "TUSDIO password reset error:",
          error
        );


        showMessage(
          getFriendlyError(error),
          "error"
        );

      }

    }
  );

}


/* ============================================================
   GALLERY
   ============================================================ */

let currentSlide = 0;

let galleryTimer = null;

let galleryPaused = false;

const totalSlides =
  slides.length;


/* ============================================================
   UPDATE SLIDE
   ============================================================ */

function showSlide(index) {

  if (!totalSlides) {
    return;
  }


  currentSlide =
    (index + totalSlides) %
    totalSlides;


  slides.forEach(
    (slide, slideIndex) => {

      const active =
        slideIndex === currentSlide;


      slide.classList.toggle(
        "active",
        active
      );

    }
  );


  dots.forEach(
    (dot, dotIndex) => {

      const active =
        dotIndex === currentSlide;


      dot.classList.toggle(
        "active",
        active
      );


      if (active) {

        dot.setAttribute(
          "aria-current",
          "true"
        );

      }

      else {

        dot.removeAttribute(
          "aria-current"
        );

      }

    }
  );


  if (currentSlideElement) {

    currentSlideElement.textContent =
      String(currentSlide + 1)
        .padStart(2, "0");

  }

}


/* ============================================================
   NEXT SLIDE
   ============================================================ */

function nextSlide() {

  if (galleryPaused) {
    return;
  }


  showSlide(
    currentSlide + 1
  );

}


/* ============================================================
   START GALLERY
   ============================================================ */

function startGallery() {

  clearInterval(
    galleryTimer
  );


  galleryTimer =
    setInterval(
      nextSlide,
      GALLERY_INTERVAL
    );

}


/* ============================================================
   STOP GALLERY
   ============================================================ */

function stopGallery() {

  clearInterval(
    galleryTimer
  );

  galleryTimer =
    null;

}


/* ============================================================
   DOT NAVIGATION
   ============================================================ */

dots.forEach(
  (dot) => {

    dot.addEventListener(
      "click",
      () => {

        const index =
          Number(
            dot.dataset.slide
          );


        showSlide(index);

        startGallery();

      }
    );

  }
);


/* ============================================================
   PAUSE WHEN MOUSE IS OVER GALLERY
   ============================================================ */

const gallery =
  document.querySelector(".gallery");


if (gallery) {

  gallery.addEventListener(
    "mouseenter",
    () => {

      galleryPaused = true;

    }
  );


  gallery.addEventListener(
    "mouseleave",
    () => {

      galleryPaused = false;

    }
  );

}


/* ============================================================
   KEYBOARD NAVIGATION
   ============================================================ */

document.addEventListener(
  "keydown",
  (event) => {

    if (
      event.key ===
      "ArrowRight"
    ) {

      showSlide(
        currentSlide + 1
      );

      startGallery();

    }


    if (
      event.key ===
      "ArrowLeft"
    ) {

      showSlide(
        currentSlide - 1
      );

      startGallery();

    }

  }
);


/* ============================================================
   PAUSE WHEN TAB IS HIDDEN
   ============================================================ */

document.addEventListener(
  "visibilitychange",
  () => {

    if (document.hidden) {

      stopGallery();

    }

    else {

      startGallery();

    }

  }
);


/* ============================================================
   IMAGE PRELOADING
   ============================================================ */

function preloadGalleryImages() {

  const images =
    document.querySelectorAll(
      ".gallery img"
    );


  images.forEach(
    (image) => {

      const source =
        image.getAttribute("src");


      if (!source) {
        return;
      }


      const preload =
        new Image();


      preload.src =
        source;

    }
  );

}


/* ============================================================
   GALLERY INITIALIZATION
   ============================================================ */

function initializeGallery() {

  showSlide(0);

  preloadGalleryImages();

  startGallery();

}


/* ============================================================
   REMOVE LOADING SCREEN
   ============================================================ */

function hideGalleryLoading() {

  if (!galleryLoading) {
    return;
  }


  setTimeout(
    () => {

      galleryLoading.classList.add(
        "hidden"
      );

    },
    450
  );

}


/* ============================================================
   INITIALIZE
   ============================================================ */

initializeGallery();

hideGalleryLoading();

import { auth, db } from "./firebase-config.js";

import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";


/* ============================================================
   TUSDIO CREATE ACCOUNT
   ============================================================ */


/* ============================================================
   DOM
   ============================================================ */

const form =
  document.getElementById("signupForm");

const nameInput =
  document.getElementById("name");

const emailInput =
  document.getElementById("email");

const passwordInput =
  document.getElementById("password");

const confirmPasswordInput =
  document.getElementById("confirmPassword");

const signupBtn =
  document.getElementById("signupBtn");

const googleBtn =
  document.getElementById("googleSignupBtn");

const message =
  document.getElementById("signupMessage");

const passwordToggle =
  document.getElementById("passwordToggle");

const confirmPasswordToggle =
  document.getElementById("confirmPasswordToggle");


/* ============================================================
   MESSAGE
   ============================================================ */

function showMessage(text, type = "normal") {

  if (!message) {
    return;
  }

  message.textContent = text;

  if (type === "error") {

    message.style.color = "#b23a32";

  }

  else if (type === "success") {

    message.style.color = "#39724d";

  }

  else {

    message.style.color = "#777";

  }

}


/* ============================================================
   FIREBASE FRIENDLY ERRORS
   ============================================================ */

function getFriendlyError(error) {

  switch (error?.code) {

    case "auth/email-already-in-use":
      return "An account already exists with this email.";

    case "auth/invalid-email":
      return "Please enter a valid email address.";

    case "auth/weak-password":
      return "Password must be at least 6 characters.";

    case "auth/network-request-failed":
      return "Network error. Please check your connection.";

    case "auth/popup-closed-by-user":
      return "Google sign-up was cancelled.";

    case "auth/popup-blocked":
      return "Your browser blocked the Google sign-up window.";

    case "auth/operation-not-allowed":
      return "This sign-in method is not enabled in Firebase.";

    default:

      return (
        error?.message ||
        "Something went wrong. Please try again."
      );

  }

}


/* ============================================================
   LOADING STATE
   ============================================================ */

function setSignupLoading(isLoading) {

  if (!signupBtn) {
    return;
  }

  signupBtn.disabled = isLoading;

  signupBtn.textContent =
    isLoading
      ? "Creating account..."
      : "Create Account";

}


function setGoogleLoading(isLoading) {

  if (!googleBtn) {
    return;
  }

  googleBtn.disabled = isLoading;

  googleBtn.innerHTML =
    isLoading
      ? "Connecting to Google..."
      : `
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
   CREATE CLIENT DOCUMENT
   ============================================================ */

async function createClientDocument(user, loginType) {

  const clientRef =
    doc(
      db,
      "clients",
      user.uid
    );


  const clientSnap =
    await getDoc(clientRef);


  /*
     If a client document already exists,
     don't overwrite their project data.
  */

  if (clientSnap.exists()) {

    await setDoc(
      clientRef,
      {

        name:
          user.displayName ||
          clientSnap.data().name ||
          "Client",

        email:
          user.email ||
          clientSnap.data().email ||
          "",

        loginType:

          loginType,

        lastLogin:
          new Date().toISOString()

      },
      {
        merge: true
      }
    );

    return;

  }


  /* ============================================================
     NEW CLIENT
     ============================================================ */

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

      planName:
        "",

      paymentStatus:
        "Pending",

      totalAmount:
        0,

      paidAmount:
        0,

      invoiceLink:
        "",

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
        loginType,

      createdAt:
        new Date().toISOString(),

      lastLogin:
        new Date().toISOString()

    }
  );

}


/* ============================================================
   EMAIL / PASSWORD SIGN UP
   ============================================================ */

if (form) {

  form.addEventListener(
    "submit",
    async (event) => {

      event.preventDefault();


      const name =
        nameInput.value.trim();

      const email =
        emailInput.value
          .trim()
          .toLowerCase();

      const password =
        passwordInput.value;

      const confirmPassword =
        confirmPasswordInput.value;


      /* ========================================================
         VALIDATION
         ======================================================== */

      if (!name) {

        showMessage(
          "Please enter your full name.",
          "error"
        );

        nameInput.focus();

        return;

      }


      if (!email) {

        showMessage(
          "Please enter your email address.",
          "error"
        );

        emailInput.focus();

        return;

      }


      if (password.length < 6) {

        showMessage(
          "Password must be at least 6 characters.",
          "error"
        );

        passwordInput.focus();

        return;

      }


      if (password !== confirmPassword) {

        showMessage(
          "Passwords do not match.",
          "error"
        );

        confirmPasswordInput.focus();

        return;

      }


      /* ========================================================
         CREATE ACCOUNT
         ======================================================== */

      setSignupLoading(true);

      showMessage("");


      try {

        const userCredential =
          await createUserWithEmailAndPassword(
            auth,
            email,
            password
          );


        const user =
          userCredential.user;


        /* SAVE NAME TO FIREBASE AUTH */

        await updateProfile(
          user,
          {
            displayName: name
          }
        );


        /* CREATE CLIENT FIRESTORE DOCUMENT */

        await createClientDocument(
          user,
          "Email / Password"
        );


        /* SUCCESS */

        showMessage(
          "Account created successfully.",
          "success"
        );


        /*
           Small delay so the user can see
           the success message.
        */

        setTimeout(() => {

          window.location.href =
            "users.html";

        }, 700);


      }

      catch (error) {

        console.error(
          "TUSDIO create account error:",
          error
        );


        showMessage(
          getFriendlyError(error),
          "error"
        );

      }

      finally {

        setSignupLoading(false);

      }

    }
  );

}


/* ============================================================
   GOOGLE SIGN UP
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


        /* CREATE / UPDATE CLIENT */

        await createClientDocument(
          user,
          "Google"
        );


        showMessage(
          "Google account connected successfully.",
          "success"
        );


        setTimeout(() => {

          window.location.href =
            "users.html";

        }, 700);


      }

      catch (error) {

        console.error(
          "TUSDIO Google signup error:",
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

function setupPasswordToggle(
  button,
  input
) {

  if (!button || !input) {
    return;
  }


  button.addEventListener(
    "click",
    () => {

      const isPassword =
        input.type === "password";


      input.type =
        isPassword
          ? "text"
          : "password";


      button.setAttribute(
        "aria-label",
        isPassword
          ? "Hide password"
          : "Show password"
      );

    }
  );

}


setupPasswordToggle(
  passwordToggle,
  passwordInput
);


setupPasswordToggle(
  confirmPasswordToggle,
  confirmPasswordInput
);


/* ============================================================
   IMAGE GALLERY
   ============================================================ */

const slides =
  document.querySelectorAll(
    ".gallery-slide"
  );

const dots =
  document.querySelectorAll(
    ".gallery-dot"
  );

const currentSlideElement =
  document.getElementById(
    "currentSlide"
  );


let currentSlide = 0;

let galleryTimer = null;

const GALLERY_INTERVAL = 6000;


/* ============================================================
   SHOW SLIDE
   ============================================================ */

function showSlide(index) {

  if (!slides.length) {
    return;
  }


  currentSlide =
    (index + slides.length) %
    slides.length;


  slides.forEach(
    (slide, slideIndex) => {

      slide.classList.toggle(
        "active",
        slideIndex === currentSlide
      );

    }
  );


  dots.forEach(
    (dot, dotIndex) => {

      dot.classList.toggle(
        "active",
        dotIndex === currentSlide
      );

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
   KEYBOARD NAVIGATION
   ============================================================ */

document.addEventListener(
  "keydown",
  (event) => {

    if (event.key === "ArrowRight") {

      showSlide(
        currentSlide + 1
      );

      startGallery();

    }


    if (event.key === "ArrowLeft") {

      showSlide(
        currentSlide - 1
      );

      startGallery();

    }

  }
);


/* ============================================================
   PAUSE GALLERY WHEN TAB IS HIDDEN
   ============================================================ */

document.addEventListener(
  "visibilitychange",
  () => {

    if (document.hidden) {

      clearInterval(
        galleryTimer
      );

    }

    else {

      startGallery();

    }

  }
);


/* ============================================================
   PRELOAD IMAGES
   ============================================================ */

function preloadImages() {

  slides.forEach(
    (slide) => {

      const image =
        slide.querySelector("img");


      if (!image) {
        return;
      }


      const preload =
        new Image();


      preload.src =
        image.src;

    }
  );

}


/* ============================================================
   INITIALIZE
   ============================================================ */

showSlide(0);

preloadImages();

startGallery();


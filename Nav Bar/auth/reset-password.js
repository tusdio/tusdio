import { auth } from "./firebase-config.js";

import {
  verifyPasswordResetCode,
  confirmPasswordReset
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";


/* ============================================================
   TUSDIO RESET PASSWORD
   Handles the Firebase auth action link:
   ?mode=resetPassword&oobCode=...&apiKey=...
   ============================================================ */


/* ============================================================
   DOM
   ============================================================ */

const stateVerifying =
  document.getElementById("stateVerifying");

const stateInvalid =
  document.getElementById("stateInvalid");

const stateForm =
  document.getElementById("stateForm");

const stateSuccess =
  document.getElementById("stateSuccess");

const resetSubtitle =
  document.getElementById("resetSubtitle");

const resetForm =
  document.getElementById("resetForm");

const newPasswordInput =
  document.getElementById("newPassword");

const confirmNewPasswordInput =
  document.getElementById("confirmNewPassword");

const resetBtn =
  document.getElementById("resetBtn");

const resetMessage =
  document.getElementById("resetMessage");

const passwordToggle =
  document.getElementById("passwordToggle");

const confirmPasswordToggle =
  document.getElementById("confirmPasswordToggle");

const backToLoginBtn =
  document.getElementById("backToLoginBtn");

const continueToLoginBtn =
  document.getElementById("continueToLoginBtn");

const strengthRow =
  document.getElementById("strengthRow");

const strengthLabel =
  document.getElementById("strengthLabel");


/* Where "back to login" / "continue to login" should point */

const LOGIN_URL = "login.html";


/* ============================================================
   STATE SWITCHING
   ============================================================ */

function showState(section) {

  [stateVerifying, stateInvalid, stateForm, stateSuccess].forEach(

    (el) => {

      el.classList.toggle("active", el === section);

    }

  );

}


/* ============================================================
   MESSAGE
   ============================================================ */

function showMessage(text, type = "normal") {

  if (!resetMessage) {
    return;
  }

  resetMessage.textContent = text;

  resetMessage.style.color =
    type === "error"
      ? "#b23a32"
      : type === "success"
        ? "#39724d"
        : "#777";

}


/* ============================================================
   FRIENDLY ERRORS
   ============================================================ */

function getFriendlyError(error) {

  switch (error?.code) {

    case "auth/expired-action-code":
      return "This reset link has expired. Please request a new one.";

    case "auth/invalid-action-code":
      return "This reset link is invalid or has already been used.";

    case "auth/user-disabled":
      return "This account has been disabled.";

    case "auth/user-not-found":
      return "We couldn't find an account for this link.";

    case "auth/weak-password":
      return "Password must be at least 6 characters.";

    case "auth/network-request-failed":
      return "Network error. Please check your connection.";

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

function setResetLoading(isLoading) {

  resetBtn.disabled = isLoading;

  resetBtn.textContent =
    isLoading
      ? "Updating password..."
      : "Reset password";

}


/* ============================================================
   PASSWORD STRENGTH METER
   ============================================================ */

function getPasswordStrength(password) {

  let score = 0;

  if (password.length >= 6) score++;
  if (password.length >= 10) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) score++;

  return score;

}


function updateStrengthMeter() {

  const password = newPasswordInput.value;

  const bars = strengthRow.querySelectorAll(".strength-bar");


  if (!password) {

    bars.forEach((bar) => (bar.style.background = "#e5e5e2"));

    strengthLabel.textContent = "\u00A0";

    return;

  }


  const score = getPasswordStrength(password);

  const colors = ["#c0392b", "#d68910", "#d4ac0d", "#39724d"];

  const labels = ["Weak", "Fair", "Good", "Strong"];

  const level = Math.max(score - 1, 0);


  bars.forEach((bar, index) => {

    bar.style.background =
      index <= level
        ? colors[level]
        : "#e5e5e2";

  });


  strengthLabel.textContent = labels[level];

  strengthLabel.style.color = colors[level];

}


newPasswordInput.addEventListener(
  "input",
  updateStrengthMeter
);


/* ============================================================
   PASSWORD SHOW / HIDE
   ============================================================ */

function setupPasswordToggle(button, input) {

  if (!button || !input) {
    return;
  }

  button.addEventListener(
    "click",
    () => {

      const isPassword = input.type === "password";

      input.type = isPassword ? "text" : "password";

      button.setAttribute(
        "aria-label",
        isPassword ? "Hide password" : "Show password"
      );

    }
  );

}


setupPasswordToggle(passwordToggle, newPasswordInput);

setupPasswordToggle(confirmPasswordToggle, confirmNewPasswordInput);


/* ============================================================
   READ ACTION CODE FROM URL
   ============================================================ */

const params = new URLSearchParams(window.location.search);

const mode = params.get("mode");

const oobCode = params.get("oobCode");


let verifiedEmail = "";


/* ============================================================
   VERIFY THE RESET LINK ON LOAD
   ============================================================ */

async function init() {

  if (mode !== "resetPassword" || !oobCode) {

    showState(stateInvalid);

    return;

  }


  try {

    verifiedEmail =
      await verifyPasswordResetCode(auth, oobCode);


    resetSubtitle.innerHTML =
      `Choose a new password for <strong>${escapeHtml(verifiedEmail)}</strong>.`;


    showState(stateForm);

    newPasswordInput.focus();


  }

  catch (error) {

    console.error(
      "TUSDIO reset link verification error:",
      error
    );


    showState(stateInvalid);

  }

}


function escapeHtml(value) {

  const div = document.createElement("div");

  div.textContent = value;

  return div.innerHTML;

}


init();


/* ============================================================
   SUBMIT NEW PASSWORD
   ============================================================ */

resetForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();


    const newPassword = newPasswordInput.value;

    const confirmPassword = confirmNewPasswordInput.value;


    if (newPassword.length < 6) {

      showMessage(
        "Password must be at least 6 characters.",
        "error"
      );

      newPasswordInput.focus();

      return;

    }


    if (newPassword !== confirmPassword) {

      showMessage(
        "Passwords do not match.",
        "error"
      );

      confirmNewPasswordInput.focus();

      return;

    }


    setResetLoading(true);

    showMessage("");


    try {

      await confirmPasswordReset(
        auth,
        oobCode,
        newPassword
      );


      showState(stateSuccess);


    }

    catch (error) {

      console.error(
        "TUSDIO reset password error:",
        error
      );


      showMessage(
        getFriendlyError(error),
        "error"
      );

      /*
         An expired/used code caught here (rather than on
         initial verify) should also flip to the invalid state.
      */

      if (
        error?.code === "auth/expired-action-code" ||
        error?.code === "auth/invalid-action-code"
      ) {

        showState(stateInvalid);

      }

    }

    finally {

      setResetLoading(false);

    }

  }
);


/* ============================================================
   NAVIGATION BUTTONS
   ============================================================ */

backToLoginBtn.addEventListener(
  "click",
  () => {

    window.location.href = LOGIN_URL;

  }
);


continueToLoginBtn.addEventListener(
  "click",
  () => {

    window.location.href = LOGIN_URL;

  }
);
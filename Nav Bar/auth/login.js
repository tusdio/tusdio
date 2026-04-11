import { auth, db } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const OWNER_EMAIL = "bittukhantusharkhan@gmail.com";

const form = document.getElementById("loginForm");
const message = document.getElementById("loginMessage");
const googleBtn = document.getElementById("googleLoginBtn");

function redirectUserByRole(user) {
  const email = (user.email || "").trim().toLowerCase();

  if (email === OWNER_EMAIL.trim().toLowerCase()) {
    window.location.href = "./owner/owner.html";
  } else {
    window.location.href = "users.html";
  }
}

// Email login
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    message.textContent = "Logging in...";

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const clientRef = doc(db, "clients", user.uid);

      await setDoc(
        clientRef,
        {
          loginType: "Email / Password",
          email: user.email || email
        },
        { merge: true }
      );

      redirectUserByRole(user);
    } catch (error) {
      message.textContent = error.message;
      console.error(error);
    }
  });
}

// Google login
if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    message.textContent = "Opening Google...";

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const clientRef = doc(db, "clients", user.uid);
      const clientSnap = await getDoc(clientRef);

      if (!clientSnap.exists()) {
        await setDoc(clientRef, {
          name: user.displayName || "Client",
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
          updates: [
            "Account created",
            "Project initialized"
          ],
          tasks: [
            "Complete onboarding",
            "Share project details"
          ],
          access: "active",
          loginType: "Google"
        });
      } else {
        await setDoc(
          clientRef,
          {
            loginType: "Google",
            name: user.displayName || clientSnap.data().name || "Client",
            email: user.email || clientSnap.data().email || ""
          },
          { merge: true }
        );
      }

      redirectUserByRole(user);
    } catch (error) {
      message.textContent = error.message;
      console.error(error);
    }
  });
}
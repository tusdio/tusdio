import { auth, db } from "./firebase-config.js";
import {
  createUserWithEmailAndPassword,
  updateProfile
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import {
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const form = document.getElementById("signupForm");
const message = document.getElementById("signupMessage");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  message.textContent = "Creating account...";

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    if (name) {
      await updateProfile(user, { displayName: name });
    }

await setDoc(doc(db, "clients", user.uid), {
  name: name || "Client",
  email: email,
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
  updates: [
    "Account created",
    "Project initialized"
  ],
  tasks: [
    "Complete onboarding",
    "Share project details"
  ],
  access: "active",
  loginType: "Email / Password"
});

    message.textContent = "Account created successfully.";
    window.location.href = "users.html";
  } catch (error) {
    message.textContent = error.message;
  }
});
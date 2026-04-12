import { auth, db } from "../firebase-config.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  setDoc,
  query,
  orderBy
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const OWNER_EMAIL = "bittukhantusharkhan@gmail.com";

const requestsList = document.getElementById("requestsList");
const clientsList = document.getElementById("clientsList");
const ownerForm = document.getElementById("ownerForm");
const saveMessage = document.getElementById("saveMessage");
const navUserArea = document.getElementById("navUserArea");

const planNameInput = document.getElementById("planName");
const paymentStatusInput = document.getElementById("paymentStatus");
const totalAmountInput = document.getElementById("totalAmount");
const paidAmountInput = document.getElementById("paidAmount");
const invoiceLinkInput = document.getElementById("invoiceLink");

const toggleAddClientBtn = document.getElementById("toggleAddClientBtn");
const cancelAddClientBtn = document.getElementById("cancelAddClientBtn");
const addClientForm = document.getElementById("addClientForm");
const addClientMessage = document.getElementById("addClientMessage");
const newClientName = document.getElementById("newClientName");
const newClientEmail = document.getElementById("newClientEmail");
const newClientService = document.getElementById("newClientService");
const newClientProject = document.getElementById("newClientProject");

const clientId = document.getElementById("clientId");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const serviceInput = document.getElementById("service");
const projectNameInput = document.getElementById("projectName");
const phaseInput = document.getElementById("phase");
const statusInput = document.getElementById("status");
const nextActionInput = document.getElementById("nextAction");
const progressInput = document.getElementById("progress");
const revisionRoundInput = document.getElementById("revisionRound");
const startDateInput = document.getElementById("startDate");
const estimatedDeliveryInput = document.getElementById("estimatedDelivery");
const updatesInput = document.getElementById("updates");
const tasksInput = document.getElementById("tasks");
const loginTypeInput = document.getElementById("loginType");
const filesInput = document.getElementById("filesInput");

const removeBtn = document.getElementById("removeClientBtn");
const restoreBtn = document.getElementById("restoreClientBtn");

const menuToggle = document.querySelector(".menu-toggle");
const nav = document.getElementById("mainNav");

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    nav.classList.toggle("active");
  });
}

function renderOwnerNavbar(user) {
  if (!navUserArea) return;

  const name = user?.displayName || "Owner";

  navUserArea.innerHTML = `
    <div class="nav-user-box">
      <span class="nav-user-name">${name}</span>
      <a href="./owner.html" class="nav-user-btn">Dashboard</a>
      <button id="logoutNavBtn" class="nav-user-btn" type="button">Logout</button>
    </div>
  `;

  const logoutNavBtn = document.getElementById("logoutNavBtn");
  if (logoutNavBtn) {
    logoutNavBtn.addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "../login.html";
    });
  }
}

function setMessage(text) {
  if (saveMessage) saveMessage.textContent = text;
}

function parseFilesInput(value) {
  return (value || "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|");
      return {
        title: (parts[0] || "").trim(),
        note: (parts[1] || "").trim(),
        link: (parts[2] || "").trim()
      };
    })
    .filter((file) => file.title && file.link);
}

async function loadClients() {
  if (!clientsList) return;

  clientsList.innerHTML = "";

  try {
    const snap = await getDocs(collection(db, "clients"));

    if (snap.empty) {
      clientsList.innerHTML = `<div class="client-item"><strong>No clients found</strong></div>`;
      return;
    }

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const accessState = data.access === "disabled" ? "Removed" : "Active";

      const div = document.createElement("div");
      div.className = "client-item";
      div.innerHTML = `
        <strong>${data.name || "Client"}</strong>
        <span>${data.email || "No email"}</span>
        <span style="display:block; margin-top:6px; font-size:12px; color:#9f9f9f;">
          ${data.service || "No service"} • ${accessState}
        </span>
        <span style="display:block; margin-top:4px; font-size:12px; color:#8f8f8f;">
          ${data.loginType || "Unknown"}
        </span>
      `;

      div.addEventListener("click", async () => {
        document.querySelectorAll(".client-item").forEach((item) => {
          item.classList.remove("active");
        });

        div.classList.add("active");
        await loadClientDetails(docSnap.id);
      });

      clientsList.appendChild(div);
    });
  } catch (error) {
    console.error(error);
    setMessage("Failed to load clients.");
  }
}

async function loadClientDetails(id) {
  try {
    const ref = doc(db, "clients", id);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      setMessage("Client record not found.");
      return;
    }

    const data = snap.data();

    if (clientId) clientId.value = id;
    if (nameInput) nameInput.value = data.name || "";
    if (emailInput) emailInput.value = data.email || "";
    if (serviceInput) serviceInput.value = data.service || "";
    if (projectNameInput) projectNameInput.value = data.projectName || "";
    if (phaseInput) phaseInput.value = data.phase || "Discovery";
    if (statusInput) statusInput.value = data.status || "Not started";
    if (nextActionInput) nextActionInput.value = data.nextAction || "";
    if (progressInput) progressInput.value = data.progress || 0;
    if (revisionRoundInput) revisionRoundInput.value = data.revisionRound || "";
    if (startDateInput) startDateInput.value = data.startDate || "";
    if (estimatedDeliveryInput) estimatedDeliveryInput.value = data.estimatedDelivery || "";
    if (updatesInput) updatesInput.value = Array.isArray(data.updates) ? data.updates.join("\n") : "";
    if (tasksInput) tasksInput.value = Array.isArray(data.tasks) ? data.tasks.join("\n") : "";
    if (loginTypeInput) loginTypeInput.value = data.loginType || "Unknown";
    if (planNameInput) planNameInput.value = data.planName || "";
    if (paymentStatusInput) paymentStatusInput.value = data.paymentStatus || "Pending";
    if (totalAmountInput) totalAmountInput.value = data.totalAmount || 0;
    if (paidAmountInput) paidAmountInput.value = data.paidAmount || 0;
    if (invoiceLinkInput) invoiceLinkInput.value = data.invoiceLink || "";
    if (filesInput) {
      filesInput.value = Array.isArray(data.files)
        ? data.files.map((file) => `${file.title} | ${file.note || ""} | ${file.link}`).join("\n")
        : "";
    }

    setMessage(data.access === "disabled" ? "This client is currently removed." : "Client is active.");
  } catch (error) {
    console.error(error);
    setMessage("Failed to load client details.");
  }
}

if (ownerForm) {
  ownerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const id = clientId?.value;
    if (!id) {
      setMessage("Select a client first.");
      return;
    }

    setMessage("Saving...");

    try {
      await updateDoc(doc(db, "clients", id), {
        name: nameInput?.value.trim() || "",
        email: emailInput?.value.trim() || "",
        service: serviceInput?.value.trim() || "",
        projectName: projectNameInput?.value.trim() || "",
        phase: phaseInput?.value.trim() || "",
        status: statusInput?.value.trim() || "",
        nextAction: nextActionInput?.value.trim() || "",
        progress: Number(progressInput?.value) || 0,
        revisionRound: revisionRoundInput?.value.trim() || "",
        startDate: startDateInput?.value.trim() || "",
        estimatedDelivery: estimatedDeliveryInput?.value.trim() || "",
        updates: (updatesInput?.value || "").split("\n").map((v) => v.trim()).filter(Boolean),
        tasks: (tasksInput?.value || "").split("\n").map((v) => v.trim()).filter(Boolean),
        files: parseFilesInput(filesInput?.value || ""),
        planName: planNameInput?.value.trim() || "",
        paymentStatus: paymentStatusInput?.value.trim() || "Pending",
        totalAmount: Number(totalAmountInput?.value) || 0,
        paidAmount: Number(paidAmountInput?.value) || 0,
        invoiceLink: invoiceLinkInput?.value.trim() || "",
        access: "active"
      });

      setMessage("Changes saved successfully.");
      await loadClients();
      await loadClientDetails(id);
    } catch (error) {
      setMessage(error.message);
      console.error(error);
    }
  });
}

if (removeBtn) {
  removeBtn.addEventListener("click", async () => {
    const id = clientId?.value;

    if (!id) {
      setMessage("Select a client first.");
      return;
    }

    const confirmed = confirm("Remove this client's dashboard access?");
    if (!confirmed) return;

    try {
      await updateDoc(doc(db, "clients", id), {
        access: "disabled",
        status: "Removed",
        nextAction: "Contact TUSDIO for support"
      });

      setMessage("Client access removed.");
      await loadClients();
      await loadClientDetails(id);
    } catch (error) {
      setMessage(error.message);
      console.error(error);
    }
  });
}

if (restoreBtn) {
  restoreBtn.addEventListener("click", async () => {
    const id = clientId?.value;

    if (!id) {
      setMessage("Select a client first.");
      return;
    }

    try {
      await updateDoc(doc(db, "clients", id), {
        access: "active",
        status: "In Progress"
      });

      setMessage("Client reactivated successfully.");
      await loadClients();
      await loadClientDetails(id);
    } catch (error) {
      setMessage(error.message);
      console.error(error);
    }
  });
}

async function loadRequests() {
  if (!requestsList) return;

  requestsList.innerHTML = "";

  try {
    const requestsQuery = query(
      collection(db, "client_requests"),
      orderBy("createdAt", "desc")
    );

    const snap = await getDocs(requestsQuery);

    if (snap.empty) {
      requestsList.innerHTML = `<div class="client-item"><strong>No requests yet</strong></div>`;
      return;
    }

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      const requestId = docSnap.id;

      const wrapper = document.createElement("div");
      wrapper.className = "client-item";

      wrapper.innerHTML = `
        <strong>${data.type || "Request"}</strong>
        <span>${data.clientName || "Client"} • ${data.clientEmail || "No email"}</span>
        <span style="display:block; margin-top:6px; font-size:12px; color:#9f9f9f;">
          ${data.subject || ""}
        </span>
        <span style="display:block; margin-top:8px; font-size:13px; color:#cfcfcf; line-height:1.6;">
          ${data.message || ""}
        </span>
        <span style="display:block; margin-top:10px; font-size:11px; color:#8f8f8f;">
          ${data.createdAt || ""}
        </span>

        <div class="request-status-row" style="margin-top:14px; display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
          <select class="request-status-select" data-request-id="${requestId}">
            <option value="New" ${data.status === "New" ? "selected" : ""}>New</option>
            <option value="Seen" ${data.status === "Seen" ? "selected" : ""}>Seen</option>
            <option value="Resolved" ${data.status === "Resolved" ? "selected" : ""}>Resolved</option>
          </select>
          <span style="font-size:12px; color:#9f9f9f;">Current: ${data.status || "New"}</span>
        </div>
      `;

      requestsList.appendChild(wrapper);
    });

    attachRequestStatusEvents();
  } catch (error) {
    console.error(error);
    requestsList.innerHTML = `<div class="client-item"><strong>Failed to load requests</strong></div>`;
  }
}

function attachRequestStatusEvents() {
  const selects = document.querySelectorAll(".request-status-select");

  selects.forEach((select) => {
    select.addEventListener("change", async (e) => {
      const requestId = e.target.dataset.requestId;
      const newStatus = e.target.value;

      try {
        await updateDoc(doc(db, "client_requests", requestId), {
          status: newStatus
        });

        setMessage(`Request status updated to ${newStatus}.`);
        await loadRequests();
      } catch (error) {
        console.error(error);
        setMessage("Failed to update request status.");
      }
    });
  });
}

function makeClientDocId(email) {
  return email.trim().toLowerCase().replace(/[^a-z0-9]/g, "_");
}

if (toggleAddClientBtn && addClientForm) {
  toggleAddClientBtn.addEventListener("click", () => {
    addClientForm.classList.toggle("show");
  });
}

if (cancelAddClientBtn && addClientForm) {
  cancelAddClientBtn.addEventListener("click", () => {
    addClientForm.classList.remove("show");
    addClientForm.reset();
    if (addClientMessage) addClientMessage.textContent = "";
  });
}

if (addClientForm) {
  addClientForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = newClientName?.value.trim() || "";
    const email = newClientEmail?.value.trim().toLowerCase() || "";
    const service = newClientService?.value.trim() || "Not selected yet";
    const projectName = newClientProject?.value.trim() || "New Project";

    if (!name || !email) {
      if (addClientMessage) addClientMessage.textContent = "Name and email are required.";
      return;
    }

    const docId = makeClientDocId(email);

    try {
      if (addClientMessage) addClientMessage.textContent = "Creating client...";

      await setDoc(doc(db, "clients", docId), {
        name,
        email,
        role: "client",
        service,
        projectName,
        phase: "Discovery",
        status: "In Progress",
        nextAction: "Complete onboarding",
        progress: 10,
        startDate: new Date().toISOString().split("T")[0],
        estimatedDelivery: "To be decided",
        revisionRound: "Round 1",
        updates: [
          "Client created by owner",
          "Project initialized"
        ],
        tasks: [
          "Complete onboarding",
          "Share project details"
        ],
        files: [],
        planName: "",
        paymentStatus: "Pending",
        totalAmount: 0,
        paidAmount: 0,
        invoiceLink: "",
        access: "active",
        loginType: "Manual / Pending Signup",
        createdByOwner: true
      });

      if (addClientMessage) addClientMessage.textContent = "Client created successfully.";
      addClientForm.reset();
      addClientForm.classList.remove("show");
      await loadClients();
    } catch (error) {
      console.error(error);
      if (addClientMessage) addClientMessage.textContent = "Failed to create client.";
    }
  });
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../login.html";
    return;
  }

  const email = (user.email || "").trim().toLowerCase();
  const ownerEmail = OWNER_EMAIL.trim().toLowerCase();

  if (email !== ownerEmail) {
    window.location.href = "../users.html";
    return;
  }

  renderOwnerNavbar(user);
  await loadClients();
  await loadRequests();
});

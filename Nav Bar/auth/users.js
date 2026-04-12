import { auth, db } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import {
  doc,
  onSnapshot,
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const userName = document.getElementById("userName");
const serviceName = document.getElementById("serviceName");
const statusText = document.getElementById("statusText");
const planNameDisplay = document.getElementById("planNameDisplay");
const paymentStatusDisplay = document.getElementById("paymentStatusDisplay");
const requestForm = document.getElementById("requestForm");
const requestType = document.getElementById("requestType");
const requestSubject = document.getElementById("requestSubject");
const requestMessage = document.getElementById("requestMessage");
const requestStatusMsg = document.getElementById("requestStatusMsg");
const totalAmountDisplay = document.getElementById("totalAmountDisplay");
const paidAmountDisplay = document.getElementById("paidAmountDisplay");
const dueAmountDisplay = document.getElementById("dueAmountDisplay");
const invoiceDownloadBtn = document.getElementById("invoiceDownloadBtn");
const overviewService = document.getElementById("overviewService");
const overviewPhase = document.getElementById("overviewPhase");
const progressValue = document.getElementById("progressValue");
const progressFill = document.getElementById("progressFill");
const nextAction = document.getElementById("nextAction");
const projectName = document.getElementById("projectName");
const detailService = document.getElementById("detailService");
const startDate = document.getElementById("startDate");
const estimatedDelivery = document.getElementById("estimatedDelivery");
const revisionRound = document.getElementById("revisionRound");
const updatesFeed = document.getElementById("updatesFeed");
const taskList = document.getElementById("taskList");
const deliverablesGrid = document.getElementById("deliverablesGrid");
const logoutBtn = document.getElementById("logoutBtn");
const navUserArea = document.getElementById("navUserArea");

const menuToggle = document.querySelector(".menu-toggle");
const nav = document.getElementById("mainNav");
const OWNER_EMAIL = "bittukhantusharkhan@gmail.com";

let unsubscribeClient = null;

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    nav.classList.toggle("active");
  });
}

function updateNavbarUserState(user) {
  if (!navUserArea) return;

  if (user) {
    const name = user.displayName || (user.email ? user.email.split("@")[0] : "User");
    const isOwner = (user.email || "").toLowerCase() === OWNER_EMAIL.toLowerCase();

    const dashboardLink = isOwner
      ? "./owner/owner.html"
      : "./users.html";

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
        if (unsubscribeClient) {
          unsubscribeClient();
        }

        await signOut(auth);
        window.location.href = "login.html";
      });
    }
  } else {
    navUserArea.innerHTML = `
      <a href="./login.html">Login</a>
    `;
  }
}

function showAccessRemoved() {
  document.body.innerHTML = `
    <main style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#000;color:#fff;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:520px;width:100%;padding:32px;border-radius:24px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);text-align:left;">
        <p style="color:#9f9f9f;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">TUSDIO</p>
        <h1 style="font-size:32px;font-weight:normal;margin-bottom:12px;">Access Removed</h1>
        <p style="color:#c8c8c8;line-height:1.8;margin-bottom:20px;">
          Your client dashboard is no longer active. Please contact TUSDIO if you think this is a mistake.
        </p>
        <button id="logoutNow" style="padding:14px 18px;border-radius:999px;border:1px solid #fff;background:#fff;color:#000;cursor:pointer;">
          Logout
        </button>
      </div>
    </main>
  `;

  const logoutNow = document.getElementById("logoutNow");
  if (logoutNow) {
    logoutNow.addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "login.html";
    });
  }
}

function updateTimeline(phase) {
  const steps = {
    discovery: document.getElementById("step-discovery"),
    strategy: document.getElementById("step-strategy"),
    design: document.getElementById("step-design"),
    revisions: document.getElementById("step-revisions"),
    delivery: document.getElementById("step-delivery")
  };

  Object.values(steps).forEach((step) => {
    if (step) {
      step.classList.remove("done", "active");
    }
  });

  const normalized = (phase || "").toLowerCase();

  if (normalized === "discovery") {
    steps.discovery?.classList.add("active");
  } else if (normalized === "strategy") {
    steps.discovery?.classList.add("done");
    steps.strategy?.classList.add("active");
  } else if (normalized === "design direction" || normalized === "design") {
    steps.discovery?.classList.add("done");
    steps.strategy?.classList.add("done");
    steps.design?.classList.add("active");
  } else if (normalized === "revisions") {
    steps.discovery?.classList.add("done");
    steps.strategy?.classList.add("done");
    steps.design?.classList.add("done");
    steps.revisions?.classList.add("active");
  } else if (normalized === "final delivery" || normalized === "delivery") {
    steps.discovery?.classList.add("done");
    steps.strategy?.classList.add("done");
    steps.design?.classList.add("done");
    steps.revisions?.classList.add("done");
    steps.delivery?.classList.add("active");
  }
}

function renderDeliverables(files) {
  if (!deliverablesGrid) return;

  deliverablesGrid.innerHTML = "";

  if (!Array.isArray(files) || files.length === 0) {
    deliverablesGrid.innerHTML = `
      <div class="file-card">
        <strong>No files yet</strong>
        <p>TUSDIO will add deliverables here once they are ready.</p>
      </div>
    `;
    return;
  }

  files.forEach((file) => {
    const title = file?.title?.trim() || "Untitled File";
    const note = file?.note?.trim() || "Click to open file";
    const link = file?.link?.trim() || "";

    if (!link) return;

    const card = document.createElement("a");
    card.className = "file-card file-card-link";
    card.href = link;
    card.target = "_blank";
    card.rel = "noopener noreferrer";

    card.innerHTML = `
      <div class="file-card-top">
        <strong>${title}</strong>
        <span class="file-badge">Open</span>
      </div>
      <p>${note}</p>
      <span class="file-open-btn">Open File</span>
    `;

    deliverablesGrid.appendChild(card);
  });

  if (deliverablesGrid.innerHTML.trim() === "") {
    deliverablesGrid.innerHTML = `
      <div class="file-card">
        <strong>No valid files found</strong>
        <p>Please check the file links from owner panel.</p>
      </div>
    `;
  }
}

function renderUpdates(updates) {
  if (!updatesFeed) return;

  updatesFeed.innerHTML = "";

  updates.forEach((item) => {
    const div = document.createElement("div");
    div.className = "update-item";
    div.innerHTML = `
      <strong>${item}</strong>
      <p>Updated by TUSDIO in your current workflow.</p>
    `;
    updatesFeed.appendChild(div);
  });
}

function renderTasks(tasks) {
  if (!taskList) return;

  taskList.innerHTML = "";

  tasks.forEach((task) => {
    const label = document.createElement("label");
    label.className = "task-item";
    label.innerHTML = `
      <input type="checkbox" />
      <span>${task}</span>
    `;
    taskList.appendChild(label);
  });
}

function renderClientData(user, data) {
  const progress = Number(data.progress) || 0;
  const safeProgress = Math.max(0, Math.min(progress, 100));
  const tasks = Array.isArray(data.tasks) ? data.tasks : [];
  const updates = Array.isArray(data.updates) ? data.updates : [];
  const files = Array.isArray(data.files) ? data.files : [];
  const totalAmount = Number(data.totalAmount) || 0;
  const paidAmount = Number(data.paidAmount) || 0;
  const dueAmount = Math.max(totalAmount - paidAmount, 0);

  if (userName) userName.textContent = data.name || user.displayName || user.email || "Client";
  if (serviceName) serviceName.textContent = data.service || "Not selected yet";
  if (statusText) statusText.textContent = data.status || "Not started";
  if (overviewService) overviewService.textContent = data.service || "Not selected yet";
  if (overviewPhase) overviewPhase.textContent = data.phase || "Not set";
  if (progressValue) progressValue.textContent = `${safeProgress}%`;
  if (progressFill) progressFill.style.width = `${safeProgress}%`;
  if (projectName) projectName.textContent = data.projectName || "New Project";
  if (detailService) detailService.textContent = data.service || "Not selected yet";
  if (startDate) startDate.textContent = data.startDate || "Not set";
  if (estimatedDelivery) estimatedDelivery.textContent = data.estimatedDelivery || "Not set";
  if (revisionRound) revisionRound.textContent = data.revisionRound || "Not set";
  if (nextAction) {
    nextAction.textContent = data.nextAction || (tasks.length > 0 ? tasks[0] : "No pending action");
  }

  if (planNameDisplay) planNameDisplay.textContent = data.planName || "Not assigned";
  if (paymentStatusDisplay) paymentStatusDisplay.textContent = data.paymentStatus || "Pending";
  if (totalAmountDisplay) totalAmountDisplay.textContent = `₹${totalAmount}`;
  if (paidAmountDisplay) paidAmountDisplay.textContent = `₹${paidAmount}`;
  if (dueAmountDisplay) dueAmountDisplay.textContent = `₹${dueAmount}`;

  if (invoiceDownloadBtn) {
    if (data.invoiceLink && data.invoiceLink.trim() !== "") {
      invoiceDownloadBtn.href = data.invoiceLink;
      invoiceDownloadBtn.textContent = "Download Invoice";
      invoiceDownloadBtn.style.pointerEvents = "auto";
      invoiceDownloadBtn.style.opacity = "1";
    } else {
      invoiceDownloadBtn.href = "#";
      invoiceDownloadBtn.textContent = "Invoice Not Available";
      invoiceDownloadBtn.style.pointerEvents = "none";
      invoiceDownloadBtn.style.opacity = "0.5";
    }
  }

  renderUpdates(updates);
  renderTasks(tasks);
  renderDeliverables(files);
  updateTimeline(data.phase);
}

onAuthStateChanged(auth, async (user) => {
  updateNavbarUserState(user);

  if (!user) {
    window.location.href = "login.html";
    return;
  }

  if (unsubscribeClient) {
    unsubscribeClient();
  }

  const clientRef = doc(db, "clients", user.uid);

  unsubscribeClient = onSnapshot(
    clientRef,
    (clientSnap) => {
      if (!clientSnap.exists()) {
        showAccessRemoved();
        return;
      }

      const data = clientSnap.data();

      if (data.access === "disabled") {
        showAccessRemoved();
        return;
      }

      renderClientData(user, data);
    },
    (error) => {
      console.error("Realtime listener error:", error);
      showAccessRemoved();
    }
  );
});

if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    if (unsubscribeClient) {
      unsubscribeClient();
    }

    await signOut(auth);
    window.location.href = "login.html";
  });
}

if (requestForm) {
  requestForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = auth.currentUser;

    if (!user) {
      if (requestStatusMsg) requestStatusMsg.textContent = "Please log in first.";
      return;
    }

    const type = requestType?.value || "";
    const subject = requestSubject?.value.trim() || "";
    const message = requestMessage?.value.trim() || "";

    if (!type || !subject || !message) {
      if (requestStatusMsg) requestStatusMsg.textContent = "Please fill all fields.";
      return;
    }

    try {
      if (requestStatusMsg) requestStatusMsg.textContent = "Sending request...";

      await addDoc(collection(db, "client_requests"), {
        clientUid: user.uid,
        clientName: user.displayName || userName?.textContent || "Client",
        clientEmail: user.email || "",
        type,
        subject,
        message,
        status: "New",
        createdAt: new Date().toISOString()
      });

      requestForm.reset();
      if (requestStatusMsg) requestStatusMsg.textContent = "Request sent successfully.";
    } catch (error) {
      console.error(error);
      if (requestStatusMsg) requestStatusMsg.textContent = "Failed to send request.";
    }
  });
}

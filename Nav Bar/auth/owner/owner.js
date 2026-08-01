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
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  orderBy,
  limit
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

/* ============================================================
   CONSTANTS
============================================================ */
const OWNER_EMAIL = "bittukhantusharkhan@gmail.com";

/* ============================================================
   STATE
============================================================ */
let clientsCache = [];
let requestsCache = [];
let ownersCache = [];
let timeLogsCache = [];
let activityCache = [];
let activeTab = "overview";
let activeClientFilter = "all";
let clientSortBy = "name";
let selectMode = false;
let selectedClientIds = new Set();
let activeThreadClientId = null;
let currentUser = null;

/* ============================================================
   ELEMENT REFS
============================================================ */
const navUserArea = document.getElementById("navUserArea");
const ownerChip = document.getElementById("ownerChip");

const sidebar = document.getElementById("sidebar");
const sidebarToggle = document.getElementById("sidebarToggle");
const sidebarOverlay = document.getElementById("sidebarOverlay");
const sideLinks = document.querySelectorAll(".side-link");
const requestsBadge = document.getElementById("requestsBadge");
const requestsBadgeMobile = document.getElementById("requestsBadgeMobile");
const activityBellBtn = document.getElementById("activityBellBtn");
const activityBellDot = document.getElementById("activityBellDot");
const notifPanel = document.getElementById("notifPanel");
const notifPanelBody = document.getElementById("notifPanelBody");
const notifCloseBtn = document.getElementById("notifCloseBtn");

const mobileTabbar = document.getElementById("mobileTabbar");
const mobileMoreBtn = document.getElementById("mobileMoreBtn");
const mtabLinks = document.querySelectorAll(".mtab-link[data-tab]");

/* Overview */
const overviewDateLine = document.getElementById("overviewDateLine");
const overviewGreeting = document.getElementById("overviewGreeting");
const qaNewClient = document.getElementById("qaNewClient");
const kpiGrid = document.getElementById("kpiGrid");
const attentionList = document.getElementById("attentionList");
const overviewPhaseBars = document.getElementById("overviewPhaseBars");
const upcomingDeadlines = document.getElementById("upcomingDeadlines");
const recentClients = document.getElementById("recentClients");
const overviewActivity = document.getElementById("overviewActivity");

/* Clients */
const clientsList = document.getElementById("clientsList");
const clientSearch = document.getElementById("clientSearch");
const clientSortSelect = document.getElementById("clientSortSelect");
const clientFilterChips = document.getElementById("clientFilterChips");
const newClientBtn = document.getElementById("newClientBtn");
const selectModeBtn = document.getElementById("selectModeBtn");
const bulkBar = document.getElementById("bulkBar");
const bulkCount = document.getElementById("bulkCount");
const bulkActiveBtn = document.getElementById("bulkActiveBtn");
const bulkRemovedBtn = document.getElementById("bulkRemovedBtn");
const bulkExportBtn = document.getElementById("bulkExportBtn");
const bulkCancelBtn = document.getElementById("bulkCancelBtn");

/* Command palette / toasts / FAB */
const cmdkOpenBtn = document.getElementById("cmdkOpenBtn");
const cmdkOverlay = document.getElementById("cmdkOverlay");
const cmdkInput = document.getElementById("cmdkInput");
const cmdkResults = document.getElementById("cmdkResults");
const toastStack = document.getElementById("toastStack");
const fabBtn = document.getElementById("fabBtn");
const reportsExportBtn = document.getElementById("reportsExportBtn");

/* Projects */
const kanbanBoard = document.getElementById("kanbanBoard");

/* Requests */
const requestsList = document.getElementById("requestsList");

/* Messages */
const conversationsList = document.getElementById("conversationsList");
const threadPane = document.getElementById("threadPane");
const threadEmpty = document.getElementById("threadEmpty");
const threadActive = document.getElementById("threadActive");
const threadClientName = document.getElementById("threadClientName");
const threadBackBtn = document.getElementById("threadBackBtn");
const ownerChatThread = document.getElementById("ownerChatThread");
const ownerChatForm = document.getElementById("ownerChatForm");
const ownerChatInput = document.getElementById("ownerChatInput");

/* Tasks */
const tasksBoard = document.getElementById("tasksBoard");

/* Invoices */
const invoicesList = document.getElementById("invoicesList");

/* Time tracking */
const timeLogForm = document.getElementById("timeLogForm");
const timeLogClient = document.getElementById("timeLogClient");
const timeLogHours = document.getElementById("timeLogHours");
const timeLogDate = document.getElementById("timeLogDate");
const timeLogNote = document.getElementById("timeLogNote");
const timeLogMessage = document.getElementById("timeLogMessage");
const timeSummary = document.getElementById("timeSummary");
const timeLogsList = document.getElementById("timeLogsList");

/* Reports */
const reportsKpiGrid = document.getElementById("reportsKpiGrid");
const phaseBars = document.getElementById("phaseBars");
const paymentBars = document.getElementById("paymentBars");

/* Files */
const quickFileForm = document.getElementById("quickFileForm");
const quickFileClient = document.getElementById("quickFileClient");
const quickFileTitle = document.getElementById("quickFileTitle");
const quickFileNote = document.getElementById("quickFileNote");
const quickFileLink = document.getElementById("quickFileLink");
const quickFileMessage = document.getElementById("quickFileMessage");
const filesGrid = document.getElementById("filesGrid");

/* Activity */
const activityFeed = document.getElementById("activityFeed");

/* Owners */
const addOwnerForm = document.getElementById("addOwnerForm");
const newOwnerName = document.getElementById("newOwnerName");
const newOwnerEmail = document.getElementById("newOwnerEmail");
const addOwnerMessage = document.getElementById("addOwnerMessage");
const ownersList = document.getElementById("ownersList");

/* Editor Drawer */
const editorOverlay = document.getElementById("editorOverlay");
const editorDrawer = document.getElementById("editorDrawer");
const editorCloseBtn = document.getElementById("editorCloseBtn");
const editorEyebrow = document.getElementById("editorEyebrow");
const editorClientTitle = document.getElementById("editorClientTitle");
const ownerForm = document.getElementById("ownerForm");
const saveMessage = document.getElementById("saveMessage");

const clientIdInput = document.getElementById("clientId");
const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const serviceInput = document.getElementById("service");
const projectNameInput = document.getElementById("projectName");
const loginTypeInput = document.getElementById("loginType");
const phaseInput = document.getElementById("phase");
const statusInput = document.getElementById("status");
const nextActionInput = document.getElementById("nextAction");
const progressInput = document.getElementById("progress");
const revisionRoundInput = document.getElementById("revisionRound");
const startDateInput = document.getElementById("startDate");
const estimatedDeliveryInput = document.getElementById("estimatedDelivery");
const decisionsInput = document.getElementById("decisions");
const reviewTitleInput = document.getElementById("reviewTitleInput");
const reviewStatusInput = document.getElementById("reviewStatusInput");
const reviewImageInput = document.getElementById("reviewImageInput");
const reviewDescInput = document.getElementById("reviewDescInput");
const satisfactionDisplay = document.getElementById("satisfactionDisplay");
const planNameInput = document.getElementById("planName");
const paymentStatusInput = document.getElementById("paymentStatus");
const totalAmountInput = document.getElementById("totalAmount");
const paidAmountInput = document.getElementById("paidAmount");
const nextPaymentDueInput = document.getElementById("nextPaymentDueInput");
const invoiceLinkInput = document.getElementById("invoiceLink");
const updatesInput = document.getElementById("updates");
const notificationsInput = document.getElementById("notificationsInput");
const tasksInput = document.getElementById("tasks");
const filesInput = document.getElementById("filesInput");

const removeClientBtn = document.getElementById("removeClientBtn");
const restoreClientBtn = document.getElementById("restoreClientBtn");
const deleteClientBtn = document.getElementById("deleteClientBtn");

/* ============================================================
   UTILITIES
============================================================ */
function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function linesToArray(value) {
  return (value || "").split("\n").map((v) => v.trim()).filter(Boolean);
}

function makeDocId(email) {
  return (email || "").trim().toLowerCase().replace(/[^a-z0-9]/g, "_");
}

function parseFilesInput(value) {
  return linesToArray(value).map((line) => {
    const parts = line.split("|");
    return {
      title: (parts[0] || "").trim(),
      note: (parts[1] || "").trim(),
      link: (parts[2] || "").trim()
    };
  }).filter((f) => f.title && f.link);
}

function filesToText(files) {
  return (files || []).map((f) => `${f.title} | ${f.note || ""} | ${f.link}`).join("\n");
}

function parseDecisionsInput(value) {
  return linesToArray(value).map((line) => {
    const parts = line.split("|");
    return { name: (parts[0] || "").trim(), status: (parts[1] || "upcoming").trim().toLowerCase() };
  }).filter((d) => d.name);
}

function decisionsToText(decisions) {
  return (decisions || []).map((d) => `${d.name} | ${d.status}`).join("\n");
}

function timeAgo(iso) {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const diff = Math.max(0, Date.now() - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

async function logActivity(text, type = "info", clientName = "") {
  try {
    await addDoc(collection(db, "activity"), {
      text,
      type,
      clientName,
      createdAt: new Date().toISOString()
    });
  } catch (err) {
    console.error("activity log failed", err);
  }
}

/* ============================================================
   TOASTS
============================================================ */
function showToast(text, type = "info") {
  if (!toastStack) return;
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.innerHTML = `<span class="toast-dot"></span><span>${escapeHtml(text)}</span>`;
  toastStack.appendChild(el);
  setTimeout(() => {
    el.classList.add("leaving");
    setTimeout(() => el.remove(), 260);
  }, 3200);
}

/* ============================================================
   TAB / SIDEBAR NAVIGATION
============================================================ */
function switchTab(tab) {
  activeTab = tab;

  document.querySelectorAll(".tab-panel").forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.tabPanel === tab);
  });

  sideLinks.forEach((link) => {
    link.classList.toggle("is-active", link.dataset.tab === tab);
  });

  mtabLinks.forEach((link) => {
    link.classList.toggle("is-active", link.dataset.tab === tab);
  });

  closeMobileSidebar();
  closeNotifPanel();
  updateFabForTab(tab);

  if (tab === "reports") renderReports();
  if (tab === "tasks") renderTasks();
  if (tab === "invoices") renderInvoices();
  if (tab === "files") renderFiles();
}

document.querySelectorAll("[data-tab]").forEach((el) => {
  el.addEventListener("click", () => switchTab(el.dataset.tab));
});

function openMobileSidebar() {
  sidebar?.classList.add("show");
  sidebarOverlay?.classList.add("show");
}
function closeMobileSidebar() {
  sidebar?.classList.remove("show");
  sidebarOverlay?.classList.remove("show");
}

sidebarToggle?.addEventListener("click", () => {
  sidebar?.classList.contains("show") ? closeMobileSidebar() : openMobileSidebar();
});
sidebarOverlay?.addEventListener("click", closeMobileSidebar);

/* The bottom bar only surfaces 4 tabs directly; "More" opens the same sidebar
   used on desktop so every tab (Projects, Tasks, Invoices, Reports, etc.) stays reachable. */
mobileMoreBtn?.addEventListener("click", openMobileSidebar);

/* ============================================================
   NOTIFICATIONS DROPDOWN
============================================================ */
function openNotifPanel() {
  renderNotifPanel();
  notifPanel?.removeAttribute("hidden");
  if (activityBellDot) activityBellDot.hidden = true;
}
function closeNotifPanel() {
  notifPanel?.setAttribute("hidden", "");
}

activityBellBtn?.addEventListener("click", (e) => {
  e.stopPropagation();
  if (notifPanel?.hasAttribute("hidden")) openNotifPanel();
  else closeNotifPanel();
});
notifCloseBtn?.addEventListener("click", closeNotifPanel);
document.addEventListener("click", (e) => {
  if (notifPanel && !notifPanel.hasAttribute("hidden") && !notifPanel.contains(e.target) && e.target !== activityBellBtn) {
    closeNotifPanel();
  }
});

function renderNotifPanel() {
  if (!notifPanelBody) return;

  const items = [];

  requestsCache.filter((r) => r.status === "New").forEach((r) => {
    items.push({
      dot: "warn",
      title: `New ${r.type || "request"} from ${r.clientName || "a client"}`,
      meta: r.subject || timeAgo(r.createdAt),
      tab: "requests"
    });
  });

  clientsCache.filter((c) => c.access !== "disabled" && c.paymentStatus === "Overdue").forEach((c) => {
    items.push({ dot: "danger", title: `${c.name} has an overdue payment`, meta: "Tap to open invoices", tab: "invoices" });
  });

  activityCache.slice(0, 10).forEach((a) => {
    items.push({ dot: a.type === "danger" ? "danger" : a.type === "good" ? "good" : "", title: a.text || "", meta: timeAgo(a.createdAt), tab: "activity" });
  });

  if (!items.length) {
    notifPanelBody.innerHTML = `<div class="mini-empty">You're all caught up.</div>`;
    return;
  }

  notifPanelBody.innerHTML = items.slice(0, 12).map((i, idx) => `
    <div class="mini-item notif-item" data-idx="${idx}">
      <span class="mini-dot ${i.dot}"></span>
      <div class="mini-body">
        <div class="mini-title">${escapeHtml(i.title)}</div>
        <div class="mini-meta">${escapeHtml(i.meta)}</div>
      </div>
    </div>
  `).join("");

  notifPanelBody.querySelectorAll(".notif-item").forEach((el, idx) => {
    const item = items[idx];
    el.addEventListener("click", () => {
      closeNotifPanel();
      if (item.tab) switchTab(item.tab);
    });
  });
}

/* ============================================================
   NAVBAR
============================================================ */
function renderOwnerNavbar(user) {
  const name = user?.displayName || user?.email?.split("@")[0] || "Owner";

  if (ownerChip) ownerChip.textContent = name;

  if (navUserArea) {
    navUserArea.innerHTML = `
      <div class="nav-user-box">
        <span class="nav-user-name">${escapeHtml(name)}</span>
        <button id="logoutNavBtn" class="nav-user-btn" type="button">Logout</button>
      </div>
    `;
    document.getElementById("logoutNavBtn")?.addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "../login.html";
    });
  }
}

/* ============================================================
   COMMAND PALETTE (Ctrl/Cmd+K)
============================================================ */
function openCmdk() {
  cmdkOverlay?.removeAttribute("hidden");
  if (cmdkInput) { cmdkInput.value = ""; cmdkInput.focus(); }
  renderCmdkResults("");
}
function closeCmdk() {
  cmdkOverlay?.setAttribute("hidden", "");
}

cmdkOpenBtn?.addEventListener("click", openCmdk);
cmdkOverlay?.addEventListener("click", (e) => { if (e.target === cmdkOverlay) closeCmdk(); });
cmdkInput?.addEventListener("input", () => renderCmdkResults(cmdkInput.value.trim().toLowerCase()));

document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    cmdkOverlay?.hasAttribute("hidden") ? openCmdk() : closeCmdk();
  }
  if (e.key === "Escape") closeCmdk();
});

function renderCmdkResults(term) {
  if (!cmdkResults) return;
  const results = [];

  clientsCache.forEach((c) => {
    if (!term || (c.name || "").toLowerCase().includes(term) || (c.email || "").toLowerCase().includes(term) || (c.service || "").toLowerCase().includes(term)) {
      results.push({ title: c.name || "Client", meta: `Client • ${c.service || c.email || ""}`, action: () => openClientDrawer(c.id) });
    }
  });

  requestsCache.forEach((r) => {
    if (!term || (r.clientName || "").toLowerCase().includes(term) || (r.subject || "").toLowerCase().includes(term)) {
      results.push({ title: `${r.type || "Request"} — ${r.clientName || ""}`, meta: `Request • ${r.status || "New"}`, action: () => switchTab("requests") });
    }
  });

  if (!results.length) {
    cmdkResults.innerHTML = `<div class="cmdk-empty">No matches. Try a client name or request.</div>`;
    return;
  }

  cmdkResults.innerHTML = results.slice(0, 20).map((r, idx) => `
    <div class="cmdk-item" data-idx="${idx}">
      <strong>${escapeHtml(r.title)}</strong>
      <span>${escapeHtml(r.meta)}</span>
    </div>
  `).join("");

  cmdkResults.querySelectorAll(".cmdk-item").forEach((el, idx) => {
    el.addEventListener("click", () => { closeCmdk(); results[idx].action(); });
  });
}

/* ============================================================
   FLOATING ACTION BUTTON (mobile)
============================================================ */
function updateFabForTab(tab) {
  if (!fabBtn) return;
  const fabTabs = ["overview", "clients", "projects"];
  fabBtn.hidden = !fabTabs.includes(tab);
}
fabBtn?.addEventListener("click", openNewClientDrawer);

/* ============================================================
   EDITOR DRAWER
============================================================ */
function openDrawer() {
  editorOverlay?.classList.add("show");
  editorDrawer?.classList.add("show");
}
function closeDrawer() {
  editorOverlay?.classList.remove("show");
  editorDrawer?.classList.remove("show");
}
editorCloseBtn?.addEventListener("click", closeDrawer);
editorOverlay?.addEventListener("click", closeDrawer);

function resetDrawerForm() {
  ownerForm?.reset();
  if (clientIdInput) clientIdInput.value = "";
  if (loginTypeInput) loginTypeInput.value = "Manual / Pending Signup";
  if (satisfactionDisplay) satisfactionDisplay.value = "";
  if (phaseInput) phaseInput.value = "Discovery";
  if (statusInput) statusInput.value = "Not started";
  if (paymentStatusInput) paymentStatusInput.value = "Pending";
  if (progressInput) progressInput.value = 0;
  setMessage("");
}

function openNewClientDrawer() {
  resetDrawerForm();
  if (editorEyebrow) editorEyebrow.textContent = "New";
  if (editorClientTitle) editorClientTitle.textContent = "New Client";
  toggleClientActionButtons(false);
  openDrawer();
}

function toggleClientActionButtons(showExisting) {
  [removeClientBtn, restoreClientBtn, deleteClientBtn].forEach((btn) => {
    if (btn) btn.style.display = showExisting ? "" : "none";
  });
}

function setMessage(text) {
  if (saveMessage) saveMessage.textContent = text;
}

async function openClientDrawer(id) {
  try {
    const snap = await getDoc(doc(db, "clients", id));
    if (!snap.exists()) { setMessage("Client record not found."); return; }
    const data = snap.data();

    if (clientIdInput) clientIdInput.value = id;
    if (nameInput) nameInput.value = data.name || "";
    if (emailInput) emailInput.value = data.email || "";
    if (serviceInput) serviceInput.value = data.service || "";
    if (projectNameInput) projectNameInput.value = data.projectName || "";
    if (loginTypeInput) loginTypeInput.value = data.loginType || "Unknown";
    if (phaseInput) phaseInput.value = data.phase || "Discovery";
    if (statusInput) statusInput.value = data.status || "Not started";
    if (nextActionInput) nextActionInput.value = data.nextAction || "";
    if (progressInput) progressInput.value = data.progress || 0;
    if (revisionRoundInput) revisionRoundInput.value = data.revisionRound || "";
    if (startDateInput) startDateInput.value = data.startDate || "";
    if (estimatedDeliveryInput) estimatedDeliveryInput.value = data.estimatedDelivery || "";
    if (decisionsInput) decisionsInput.value = decisionsToText(data.decisions);
    if (reviewTitleInput) reviewTitleInput.value = data.review?.title || "";
    if (reviewStatusInput) reviewStatusInput.value = data.review?.status || "awaiting";
    if (reviewImageInput) reviewImageInput.value = data.review?.image || "";
    if (reviewDescInput) reviewDescInput.value = data.review?.desc || "";
    if (satisfactionDisplay) satisfactionDisplay.value = data.satisfaction ? `${data.satisfaction} / 5` : "";
    if (planNameInput) planNameInput.value = data.planName || "";
    if (paymentStatusInput) paymentStatusInput.value = data.paymentStatus || "Pending";
    if (totalAmountInput) totalAmountInput.value = data.totalAmount || 0;
    if (paidAmountInput) paidAmountInput.value = data.paidAmount || 0;
    if (nextPaymentDueInput) nextPaymentDueInput.value = data.nextPaymentDue || "";
    if (invoiceLinkInput) invoiceLinkInput.value = data.invoiceLink || "";
    if (updatesInput) updatesInput.value = (data.updates || []).join("\n");
    if (notificationsInput) notificationsInput.value = (data.notifications || []).join("\n");
    if (tasksInput) tasksInput.value = (data.tasks || []).join("\n");
    if (filesInput) filesInput.value = filesToText(data.files);

    if (editorEyebrow) editorEyebrow.textContent = data.access === "disabled" ? "Removed" : "Editing";
    if (editorClientTitle) editorClientTitle.textContent = data.name || "Client";
    toggleClientActionButtons(true);
    setMessage(data.access === "disabled" ? "This client is currently removed." : "Client is active.");
    openDrawer();
  } catch (err) {
    console.error(err);
    setMessage("Failed to load client details.");
  }
}

newClientBtn?.addEventListener("click", openNewClientDrawer);
qaNewClient?.addEventListener("click", openNewClientDrawer);

ownerForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  setMessage("Saving...");

  const payload = {
    name: nameInput?.value.trim() || "",
    email: emailInput?.value.trim().toLowerCase() || "",
    service: serviceInput?.value.trim() || "",
    projectName: projectNameInput?.value.trim() || "",
    phase: phaseInput?.value || "Discovery",
    status: statusInput?.value || "Not started",
    nextAction: nextActionInput?.value.trim() || "",
    progress: Number(progressInput?.value) || 0,
    revisionRound: revisionRoundInput?.value.trim() || "",
    startDate: startDateInput?.value.trim() || "",
    estimatedDelivery: estimatedDeliveryInput?.value.trim() || "",
    decisions: parseDecisionsInput(decisionsInput?.value || ""),
    review: {
      title: reviewTitleInput?.value.trim() || "",
      status: reviewStatusInput?.value || "awaiting",
      image: reviewImageInput?.value.trim() || "",
      desc: reviewDescInput?.value.trim() || ""
    },
    planName: planNameInput?.value.trim() || "",
    paymentStatus: paymentStatusInput?.value || "Pending",
    totalAmount: Number(totalAmountInput?.value) || 0,
    paidAmount: Number(paidAmountInput?.value) || 0,
    nextPaymentDue: nextPaymentDueInput?.value.trim() || "",
    invoiceLink: invoiceLinkInput?.value.trim() || "",
    updates: linesToArray(updatesInput?.value),
    notifications: linesToArray(notificationsInput?.value),
    tasks: linesToArray(tasksInput?.value),
    files: parseFilesInput(filesInput?.value || "")
  };

  if (!payload.name || !payload.email) {
    setMessage("Name and email are required.");
    return;
  }

  const existingId = clientIdInput?.value;

  try {
    if (existingId) {
      await updateDoc(doc(db, "clients", existingId), { ...payload, access: "active", updatedAt: new Date().toISOString() });
      await logActivity(`Updated client ${payload.name}`, "info", payload.name);
      setMessage("Changes saved successfully.");
      showToast(`${payload.name} updated`, "good");
    } else {
      const newId = makeDocId(payload.email);
      await setDoc(doc(db, "clients", newId), {
        ...payload,
        access: "active",
        loginType: "Manual / Pending Signup",
        createdByOwner: true,
        priority: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      await logActivity(`New client added: ${payload.name}`, "good", payload.name);
      if (clientIdInput) clientIdInput.value = newId;
      toggleClientActionButtons(true);
      setMessage("Client created successfully.");
      showToast(`${payload.name} added as a new client`, "good");
    }
    await loadClients();
  } catch (err) {
    console.error(err);
    setMessage(err.message);
    showToast("Something went wrong saving this client.", "danger");
  }
});

removeClientBtn?.addEventListener("click", async () => {
  const id = clientIdInput?.value;
  if (!id) return;
  if (!confirm("Remove this client's dashboard access?")) return;
  try {
    await updateDoc(doc(db, "clients", id), {
      access: "disabled", status: "Removed", nextAction: "Contact TUSDIO for support"
    });
    await logActivity(`Access removed for ${nameInput?.value || "client"}`, "danger");
    setMessage("Client access removed.");
    showToast("Client access removed", "warn");
    await loadClients();
    await openClientDrawer(id);
  } catch (err) { setMessage(err.message); }
});

restoreClientBtn?.addEventListener("click", async () => {
  const id = clientIdInput?.value;
  if (!id) return;
  try {
    await updateDoc(doc(db, "clients", id), { access: "active", status: "In Progress" });
    await logActivity(`Access restored for ${nameInput?.value || "client"}`, "good");
    setMessage("Client reactivated successfully.");
    showToast("Client reactivated", "good");
    await loadClients();
    await openClientDrawer(id);
  } catch (err) { setMessage(err.message); }
});

deleteClientBtn?.addEventListener("click", async () => {
  const id = clientIdInput?.value;
  if (!id) return;
  if (!confirm("Permanently delete this client? This cannot be undone.")) return;
  try {
    const clientName = nameInput?.value || "client";
    await deleteDoc(doc(db, "clients", id));
    await logActivity(`Deleted client ${clientName} permanently`, "danger");
    showToast(`${clientName} deleted permanently`, "danger");
    closeDrawer();
    await loadClients();
  } catch (err) { setMessage(err.message); }
});

/* ============================================================
   LOADERS
============================================================ */
async function loadClients() {
  try {
    const snap = await getDocs(collection(db, "clients"));
    clientsCache = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error(err);
    clientsCache = [];
  }
  renderOverview();
  renderClientsGrid();
  renderKanban();
  renderTasks();
  renderInvoices();
  renderFiles();
  populateClientSelects();
  refreshBellDot();
  if (activeTab === "reports") renderReports();
  if (activeTab === "messages") renderConversations();
}

async function loadRequests() {
  try {
    const q = query(collection(db, "client_requests"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    requestsCache = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error(err);
    requestsCache = [];
  }
  renderRequests();
  renderOverview();
  updateRequestsBadge();
}

async function loadOwners() {
  try {
    const snap = await getDocs(collection(db, "owners"));
    ownersCache = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error(err);
    ownersCache = [];
  }
  renderOwners();
}

async function loadTimeLogs() {
  try {
    const q = query(collection(db, "time_logs"), orderBy("createdAt", "desc"), limit(200));
    const snap = await getDocs(q);
    timeLogsCache = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error(err);
    timeLogsCache = [];
  }
  renderTimeTracking();
  renderOverview();
}

async function loadActivity() {
  try {
    const q = query(collection(db, "activity"), orderBy("createdAt", "desc"), limit(60));
    const snap = await getDocs(q);
    activityCache = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error(err);
    activityCache = [];
  }
  renderActivity();
  renderOverview();
}

/* ============================================================
   OVERVIEW
============================================================ */
function renderOverviewHero() {
  if (overviewDateLine) {
    overviewDateLine.textContent = new Date().toLocaleDateString(undefined, {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    });
  }
  if (overviewGreeting) {
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    const name = currentUser?.displayName || currentUser?.email?.split("@")[0] || "Owner";
    overviewGreeting.textContent = `${timeGreeting}, ${name}`;
  }
}

function renderOverview() {
  if (!kpiGrid) return;

  renderOverviewHero();

  const active = clientsCache.filter((c) => c.access !== "disabled");
  const totalRevenue = clientsCache.reduce((s, c) => s + (Number(c.paidAmount) || 0), 0);
  const pendingRevenue = clientsCache.reduce((s, c) => s + ((Number(c.totalAmount) || 0) - (Number(c.paidAmount) || 0)), 0);
  const newRequests = requestsCache.filter((r) => r.status === "New").length;
  const avgProgress = active.length
    ? Math.round(active.reduce((s, c) => s + (Number(c.progress) || 0), 0) / active.length)
    : 0;
  const vipCount = active.filter((c) => c.priority).length;

  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const hoursThisWeek = timeLogsCache
    .filter((t) => new Date(t.createdAt || 0).getTime() >= weekAgo)
    .reduce((s, t) => s + (Number(t.hours) || 0), 0);

  kpiGrid.innerHTML = `
    ${kpiCard("Active Clients", active.length, `${clientsCache.length} total`)}
    ${kpiCard("New Requests", newRequests, newRequests ? "Needs review" : "All caught up", newRequests ? "warn" : "good")}
    ${kpiCard("Revenue Collected", `₹${totalRevenue.toLocaleString("en-IN")}`, `₹${pendingRevenue.toLocaleString("en-IN")} pending`)}
    ${kpiCard("Avg. Progress", `${avgProgress}%`, "Across active projects")}
    ${kpiCard("Hours This Week", `${hoursThisWeek}h`, "Logged across all clients")}
    ${kpiCard("VIP Clients", vipCount, vipCount ? "Marked priority" : "None flagged yet")}
  `;

  renderAttention(active);
  renderPipelineSnapshot(active);
  renderUpcomingDeadlines(active);
  renderRecentClients();
  renderOverviewActivity();
}

function renderPipelineSnapshot(active) {
  if (!overviewPhaseBars) return;
  if (!active.length) {
    overviewPhaseBars.innerHTML = `<div class="mini-empty">No active clients yet.</div>`;
    return;
  }
  const max = Math.max(1, ...PHASES.map((p) => active.filter((c) => (c.phase || "Discovery") === p).length));
  overviewPhaseBars.innerHTML = PHASES.map((p) => {
    const count = active.filter((c) => (c.phase || "Discovery") === p).length;
    return barRow(p, count, max);
  }).join("");
}

function renderUpcomingDeadlines(active) {
  if (!upcomingDeadlines) return;

  const withDates = active
    .filter((c) => c.estimatedDelivery && c.estimatedDelivery.toLowerCase() !== "to be decided")
    .map((c) => ({ ...c, _parsed: Date.parse(c.estimatedDelivery) }))
    .sort((a, b) => {
      const aValid = !Number.isNaN(a._parsed);
      const bValid = !Number.isNaN(b._parsed);
      if (aValid && bValid) return a._parsed - b._parsed;
      if (aValid) return -1;
      if (bValid) return 1;
      return 0;
    });

  if (!withDates.length) {
    upcomingDeadlines.innerHTML = `<div class="mini-empty">No delivery dates set yet.</div>`;
    return;
  }

  upcomingDeadlines.innerHTML = withDates.slice(0, 6).map((c) => {
    const overdue = !Number.isNaN(c._parsed) && c._parsed < Date.now() && c.status !== "Completed";
    return `
      <div class="deadline-item">
        <div>
          <div class="dl-name">${escapeHtml(c.name)}</div>
          <div class="dl-date">${escapeHtml(c.projectName || c.service || "")}</div>
        </div>
        <span class="deadline-pill" style="${overdue ? "border-color: var(--danger); color: var(--danger);" : ""}">${escapeHtml(c.estimatedDelivery)}</span>
      </div>
    `;
  }).join("");
}

function renderRecentClients() {
  if (!recentClients) return;
  const sorted = [...clientsCache].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  if (!sorted.length) {
    recentClients.innerHTML = `<div class="mini-empty">No clients yet — add your first one.</div>`;
    return;
  }

  recentClients.innerHTML = sorted.slice(0, 5).map((c) => `
    <div class="mini-item" data-client-id="${c.id}" style="cursor:pointer;">
      <span class="mini-dot ${c.access === "disabled" ? "danger" : "good"}"></span>
      <div class="mini-body">
        <div class="mini-title">${escapeHtml(c.name)}${c.priority ? " ★" : ""}</div>
        <div class="mini-meta">${escapeHtml(c.service || c.projectName || "")} • ${timeAgo(c.createdAt)}</div>
      </div>
    </div>
  `).join("");

  recentClients.querySelectorAll("[data-client-id]").forEach((el) => {
    el.addEventListener("click", () => openClientDrawer(el.dataset.clientId));
  });
}

function kpiCard(label, value, sub, tone) {
  const subClass = tone === "warn" ? "down" : tone === "good" ? "up" : "";
  return `
    <div class="kpi-card">
      <div class="kpi-label">${escapeHtml(label)}</div>
      <div class="kpi-value">${value}</div>
      <div class="kpi-sub ${subClass}">${escapeHtml(sub)}</div>
    </div>
  `;
}

function renderAttention(active) {
  if (!attentionList) return;
  const items = [];

  active.forEach((c) => {
    if (c.status === "Waiting for feedback") {
      items.push({ dot: "warn", title: `${c.name} is waiting for feedback`, meta: c.nextAction || c.projectName || "" });
    }
    if (c.paymentStatus === "Overdue") {
      items.push({ dot: "danger", title: `${c.name} has an overdue payment`, meta: `₹${(Number(c.totalAmount)||0) - (Number(c.paidAmount)||0)} outstanding` });
    }
  });

  requestsCache.filter((r) => r.status === "New").forEach((r) => {
    items.push({ dot: "warn", title: `New ${r.type || "request"} from ${r.clientName || "a client"}`, meta: r.subject || "" });
  });

  if (!items.length) {
    attentionList.innerHTML = `<div class="mini-empty">Nothing needs your attention right now.</div>`;
    return;
  }

  attentionList.innerHTML = items.slice(0, 8).map((i) => `
    <div class="mini-item">
      <span class="mini-dot ${i.dot}"></span>
      <div class="mini-body">
        <div class="mini-title">${escapeHtml(i.title)}</div>
        <div class="mini-meta">${escapeHtml(i.meta)}</div>
      </div>
    </div>
  `).join("");
}

function renderOverviewActivity() {
  if (!overviewActivity) return;
  if (!activityCache.length) {
    overviewActivity.innerHTML = `<div class="mini-empty">No activity yet.</div>`;
    return;
  }
  overviewActivity.innerHTML = activityCache.slice(0, 6).map(activityItemHtml).join("");
}

function activityItemHtml(a) {
  const dot = a.type === "danger" ? "danger" : a.type === "good" ? "good" : a.type === "warn" ? "warn" : "";
  return `
    <div class="mini-item">
      <span class="mini-dot ${dot}"></span>
      <div class="mini-body">
        <div class="mini-title">${escapeHtml(a.text || "")}</div>
        <div class="mini-meta">${timeAgo(a.createdAt)}</div>
      </div>
    </div>
  `;
}

/* ============================================================
   CLIENTS
============================================================ */
function initials(name) {
  return (name || "?").trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || "").join("") || "?";
}

function renderClientsGrid() {
  if (!clientsList) return;
  const searchTerm = (clientSearch?.value || "").trim().toLowerCase();

  let filtered = clientsCache;
  if (activeClientFilter === "active") filtered = filtered.filter((c) => c.access !== "disabled");
  if (activeClientFilter === "removed") filtered = filtered.filter((c) => c.access === "disabled");
  if (activeClientFilter === "vip") filtered = filtered.filter((c) => c.priority);
  if (searchTerm) {
    filtered = filtered.filter((c) =>
      (c.name || "").toLowerCase().includes(searchTerm) ||
      (c.email || "").toLowerCase().includes(searchTerm) ||
      (c.service || "").toLowerCase().includes(searchTerm)
    );
  }

  filtered = [...filtered].sort((a, b) => {
    if (clientSortBy === "progress") return (Number(b.progress) || 0) - (Number(a.progress) || 0);
    if (clientSortBy === "updated") return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0);
    return (a.name || "").localeCompare(b.name || "");
  });

  if (!filtered.length) {
    clientsList.innerHTML = `<div class="mini-empty">No clients match this view.</div>`;
    return;
  }

  clientsList.innerHTML = filtered.map((c) => {
    const removed = c.access === "disabled";
    const progress = Number(c.progress) || 0;
    const vip = !!c.priority;
    const checked = selectedClientIds.has(c.id);
    return `
      <div class="client-card ${vip ? "is-vip" : ""} ${checked ? "is-selected" : ""}" data-client-id="${c.id}">
        <div class="client-card-top">
          <div class="client-identity">
            ${selectMode ? `<input type="checkbox" class="client-select-box" data-select-id="${c.id}" ${checked ? "checked" : ""} />` : `<div class="client-avatar">${initials(c.name)}</div>`}
            <div class="client-identity-text">
              <strong>${escapeHtml(c.name || "Client")}</strong>
              <small>${escapeHtml(c.email || "")}</small>
            </div>
          </div>
          <div class="client-card-badges">
            <button class="vip-star ${vip ? "is-vip" : ""}" data-vip-toggle="${c.id}" type="button" title="Toggle VIP">★</button>
            ${!removed ? `<button class="msg-shortcut-btn" data-msg-client="${c.id}" type="button" title="Message ${escapeHtml(c.name)}">💬</button>` : ""}
            <span class="badge ${removed ? "removed" : "active"}">${removed ? "Removed" : "Active"}</span>
          </div>
        </div>
        <small>${escapeHtml(c.service || "No service")} • ${escapeHtml(c.phase || "Discovery")}</small>
        <div class="client-progress-track"><div class="client-progress-fill" style="width:${progress}%;"></div></div>
        <div class="client-card-foot">
          <span>${progress}% complete</span>
          <span>${escapeHtml(c.status || "")}</span>
        </div>
      </div>
    `;
  }).join("");

  clientsList.querySelectorAll(".client-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("[data-vip-toggle]") || e.target.closest("[data-select-id]") || e.target.closest("[data-msg-client]")) return;
      if (selectMode) {
        toggleClientSelection(card.dataset.clientId);
      } else {
        openClientDrawer(card.dataset.clientId);
      }
    });
  });

  clientsList.querySelectorAll("[data-msg-client]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      switchTab("messages");
      openThread(btn.dataset.msgClient);
    });
  });

  clientsList.querySelectorAll("[data-vip-toggle]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const id = btn.dataset.vipToggle;
      const client = clientsCache.find((c) => c.id === id);
      if (!client) return;
      try {
        await updateDoc(doc(db, "clients", id), { priority: !client.priority });
        showToast(!client.priority ? `${client.name} marked VIP` : `${client.name} removed from VIP`, "good");
        await loadClients();
      } catch (err) { console.error(err); }
    });
  });

  clientsList.querySelectorAll("[data-select-id]").forEach((box) => {
    box.addEventListener("click", (e) => e.stopPropagation());
    box.addEventListener("change", () => toggleClientSelection(box.dataset.selectId));
  });
}

function toggleClientSelection(id) {
  if (selectedClientIds.has(id)) selectedClientIds.delete(id);
  else selectedClientIds.add(id);
  updateBulkBar();
  renderClientsGrid();
}

function updateBulkBar() {
  if (!bulkBar) return;
  bulkBar.classList.toggle("show", selectMode && selectedClientIds.size > 0);
  if (bulkCount) bulkCount.textContent = selectedClientIds.size;
}

function exitSelectMode() {
  selectMode = false;
  selectedClientIds.clear();
  selectModeBtn?.classList.remove("is-active");
  if (selectModeBtn) selectModeBtn.textContent = "Select";
  updateBulkBar();
  renderClientsGrid();
}

selectModeBtn?.addEventListener("click", () => {
  selectMode = !selectMode;
  selectModeBtn.classList.toggle("is-active", selectMode);
  selectModeBtn.textContent = selectMode ? "Selecting…" : "Select";
  if (!selectMode) selectedClientIds.clear();
  updateBulkBar();
  renderClientsGrid();
});

bulkCancelBtn?.addEventListener("click", exitSelectMode);

bulkActiveBtn?.addEventListener("click", async () => {
  await bulkUpdateAccess("active", "In Progress");
});
bulkRemovedBtn?.addEventListener("click", async () => {
  if (!confirm(`Remove dashboard access for ${selectedClientIds.size} client(s)?`)) return;
  await bulkUpdateAccess("disabled", "Removed");
});

async function bulkUpdateAccess(access, status) {
  const ids = [...selectedClientIds];
  try {
    await Promise.all(ids.map((id) => updateDoc(doc(db, "clients", id), { access, status })));
    await logActivity(`Bulk updated ${ids.length} client(s) to ${status}`, access === "disabled" ? "danger" : "good");
    showToast(`${ids.length} client(s) updated`, "good");
    exitSelectMode();
    await loadClients();
  } catch (err) {
    console.error(err);
    showToast("Bulk update failed", "danger");
  }
}

function downloadCsv(rows, filename) {
  const header = ["Name", "Email", "Service", "Phase", "Status", "Progress", "Payment Status", "Total Amount", "Paid Amount", "Access"];
  const csvRows = rows.map((c) => [
    c.name, c.email, c.service, c.phase, c.status, c.progress, c.paymentStatus, c.totalAmount, c.paidAmount, c.access === "disabled" ? "Removed" : "Active"
  ].map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","));
  const csv = [header.join(","), ...csvRows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

bulkExportBtn?.addEventListener("click", () => {
  const rows = clientsCache.filter((c) => selectedClientIds.has(c.id));
  downloadCsv(rows, "tusdio-clients-selected.csv");
  showToast("CSV exported", "good");
});

reportsExportBtn?.addEventListener("click", () => {
  downloadCsv(clientsCache, "tusdio-clients-all.csv");
  showToast("CSV exported", "good");
});

clientSearch?.addEventListener("input", renderClientsGrid);
clientSortSelect?.addEventListener("change", () => {
  clientSortBy = clientSortSelect.value;
  renderClientsGrid();
});
clientFilterChips?.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    clientFilterChips.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active"));
    chip.classList.add("is-active");
    activeClientFilter = chip.dataset.filter;
    renderClientsGrid();
  });
});

/* ============================================================
   PROJECTS (KANBAN)
============================================================ */
const PHASES = ["Discovery", "Strategy", "Design Direction", "Revisions", "Final Delivery"];

function renderKanban() {
  if (!kanbanBoard) return;
  const active = clientsCache.filter((c) => c.access !== "disabled");

  kanbanBoard.innerHTML = PHASES.map((phase) => {
    const inPhase = active.filter((c) => (c.phase || "Discovery") === phase);
    return `
      <div class="kanban-col">
        <div class="kanban-col-head">
          <span>${phase}</span>
          <span class="kanban-count">${inPhase.length}</span>
        </div>
        ${inPhase.map((c) => `
          <div class="kanban-card" data-client-id="${c.id}">
            <strong>${escapeHtml(c.name || "Client")}</strong>
            <span>${escapeHtml(c.projectName || c.service || "")} • ${c.progress || 0}%</span>
          </div>
        `).join("") || `<div class="mini-empty">No clients in this phase.</div>`}
      </div>
    `;
  }).join("");

  kanbanBoard.querySelectorAll(".kanban-card").forEach((card) => {
    card.addEventListener("click", () => openClientDrawer(card.dataset.clientId));
  });
}

/* ============================================================
   REQUESTS
============================================================ */
function resolveClientByEmail(email) {
  const norm = (email || "").trim().toLowerCase();
  if (!norm) return null;
  return clientsCache.find((c) => (c.email || "").trim().toLowerCase() === norm) || null;
}

function renderRequests() {
  if (!requestsList) return;
  if (!requestsCache.length) {
    requestsList.innerHTML = `<div class="mini-empty">No requests yet.</div>`;
    return;
  }

  requestsList.innerHTML = requestsCache.map((r) => {
    const client = resolveClientByEmail(r.clientEmail);
    return `
    <div class="client-card" style="cursor:default;">
      <div class="client-card-top">
        <strong>${escapeHtml(r.type || "Request")}</strong>
        <span class="badge ${r.status === "New" ? "new" : r.status === "Resolved" ? "active" : "progress"}">${escapeHtml(r.status || "New")}</span>
      </div>
      <small>${escapeHtml(r.clientName || "Client")} • ${escapeHtml(r.clientEmail || "")}</small>
      <small style="color:#cfcfcf;">${escapeHtml(r.subject || "")}</small>
      <small style="line-height:1.6;">${escapeHtml(r.message || "")}</small>
      <div class="client-card-foot">
        <span>${escapeHtml(r.createdAt || "")}</span>
        <select class="request-status-select" data-request-id="${r.id}">
          <option value="New" ${r.status === "New" ? "selected" : ""}>New</option>
          <option value="Seen" ${r.status === "Seen" ? "selected" : ""}>Seen</option>
          <option value="Resolved" ${r.status === "Resolved" ? "selected" : ""}>Resolved</option>
        </select>
      </div>

      <div class="req-actions">
        ${client
          ? `<button class="link-btn reply-toggle-btn" data-request-id="${r.id}" type="button">💬 Reply to ${escapeHtml(client.name)}</button>
             <button class="link-btn open-thread-btn" data-client-id="${client.id}" type="button">Open full conversation →</button>`
          : `<span class="mini-meta">No client account found for this email yet — add them as a client to message them.</span>`
        }
      </div>

      ${client ? `
      <div class="req-reply-box" id="replyBox-${r.id}">
        <textarea class="req-reply-input" data-request-id="${r.id}" data-client-id="${client.id}" rows="2" placeholder="Reply as TUSDIO…"></textarea>
        <button class="save-btn req-reply-send" data-request-id="${r.id}" data-client-id="${client.id}" type="button">Send Reply</button>
      </div>` : ""}
    </div>
  `;
  }).join("");

  requestsList.querySelectorAll(".request-status-select").forEach((select) => {
    select.addEventListener("click", (e) => e.stopPropagation());
    select.addEventListener("change", async (e) => {
      const requestId = e.target.dataset.requestId;
      const newStatus = e.target.value;
      try {
        await updateDoc(doc(db, "client_requests", requestId), { status: newStatus });
        await logActivity(`Request marked ${newStatus}`, "info");
        showToast(`Request marked ${newStatus}`, "info");
        await loadRequests();
      } catch (err) {
        console.error(err);
      }
    });
  });

  requestsList.querySelectorAll(".reply-toggle-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const box = document.getElementById(`replyBox-${btn.dataset.requestId}`);
      box?.classList.toggle("show");
      if (box?.classList.contains("show")) box.querySelector("textarea")?.focus();
    });
  });

  requestsList.querySelectorAll(".open-thread-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      switchTab("messages");
      openThread(btn.dataset.clientId);
    });
  });

  requestsList.querySelectorAll(".req-reply-send").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const requestId = btn.dataset.requestId;
      const clientId = btn.dataset.clientId;
      const textarea = requestsList.querySelector(`.req-reply-input[data-request-id="${requestId}"]`);
      const text = textarea?.value.trim();
      if (!text) { showToast("Write a reply first", "warn"); return; }

      try {
        await addDoc(collection(db, "clients", clientId, "messages"), {
          sender: "owner",
          text,
          createdAt: new Date().toISOString()
        });

        const request = requestsCache.find((r) => r.id === requestId);
        if (request?.status === "New") {
          await updateDoc(doc(db, "client_requests", requestId), { status: "Seen" });
        }

        await logActivity(`Replied to ${request?.clientName || "a client"} from a request`, "info");
        showToast("Reply sent", "good");
        if (textarea) textarea.value = "";
        await loadRequests();
      } catch (err) {
        console.error(err);
        showToast("Couldn't send that reply", "danger");
      }
    });
  });
}

function updateRequestsBadge() {
  const count = requestsCache.filter((r) => r.status === "New").length;
  if (requestsBadge) {
    requestsBadge.textContent = count;
    requestsBadge.hidden = count === 0;
  }
  if (requestsBadgeMobile) {
    requestsBadgeMobile.textContent = count;
    requestsBadgeMobile.hidden = count === 0;
  }
  refreshBellDot();
}

function refreshBellDot() {
  if (!activityBellDot || !notifPanel?.hasAttribute("hidden")) return;
  const newRequests = requestsCache.filter((r) => r.status === "New").length;
  const overdue = clientsCache.filter((c) => c.access !== "disabled" && c.paymentStatus === "Overdue").length;
  activityBellDot.hidden = (newRequests + overdue) === 0;
}

/* ============================================================
   MESSAGES
============================================================ */
function renderConversations() {
  if (!conversationsList) return;
  const active = clientsCache.filter((c) => c.access !== "disabled");

  if (!active.length) {
    conversationsList.innerHTML = `<div class="mini-empty">No active clients yet.</div>`;
    return;
  }

  conversationsList.innerHTML = active.map((c) => `
    <div class="conversation-item ${c.id === activeThreadClientId ? "is-active" : ""}" data-client-id="${c.id}">
      <strong>${escapeHtml(c.name || "Client")}</strong>
      <span>${escapeHtml(c.projectName || c.service || "")}</span>
    </div>
  `).join("");

  conversationsList.querySelectorAll(".conversation-item").forEach((item) => {
    item.addEventListener("click", () => openThread(item.dataset.clientId));
  });
}

async function openThread(clientId) {
  activeThreadClientId = clientId;
  const client = clientsCache.find((c) => c.id === clientId);
  if (!client) return;

  renderConversations();
  threadEmpty?.classList.add("hidden-form");
  threadActive?.classList.add("show");
  threadPane?.classList.add("show-thread");
  if (threadClientName) threadClientName.textContent = client.name || "Client";

  await refreshThreadMessages(clientId);
}

async function refreshThreadMessages(clientId) {
  if (!ownerChatThread) return;
  ownerChatThread.innerHTML = `<div class="mini-empty">Loading messages…</div>`;
  try {
    const q = query(collection(db, "clients", clientId, "messages"), orderBy("createdAt", "asc"));
    const snap = await getDocs(q);
    if (snap.empty) {
      ownerChatThread.innerHTML = `<div class="mini-empty">No messages yet. Say hello 👋</div>`;
      return;
    }
    ownerChatThread.innerHTML = snap.docs.map((d) => {
      const m = d.data();
      const who = m.sender === "owner" ? "owner" : "client";
      return `
        <div class="chat-bubble ${who}">
          ${escapeHtml(m.text || "")}
          <time>${timeAgo(m.createdAt)}</time>
        </div>
      `;
    }).join("");
    ownerChatThread.scrollTop = ownerChatThread.scrollHeight;
  } catch (err) {
    console.error(err);
    ownerChatThread.innerHTML = `<div class="mini-empty">Couldn't load messages.</div>`;
  }
}

threadBackBtn?.addEventListener("click", () => {
  threadPane?.classList.remove("show-thread");
});

ownerChatForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = ownerChatInput?.value.trim();
  if (!text || !activeThreadClientId) return;

  try {
    await addDoc(collection(db, "clients", activeThreadClientId, "messages"), {
      sender: "owner",
      text,
      createdAt: new Date().toISOString()
    });
    if (ownerChatInput) ownerChatInput.value = "";
    await refreshThreadMessages(activeThreadClientId);
  } catch (err) {
    console.error(err);
  }
});

/* ============================================================
   TASKS
============================================================ */
function renderTasks() {
  if (!tasksBoard) return;
  const active = clientsCache.filter((c) => c.access !== "disabled" && (c.tasks || []).length);

  if (!active.length) {
    tasksBoard.innerHTML = `<div class="mini-empty">No open tasks across clients.</div>`;
    return;
  }

  tasksBoard.innerHTML = active.map((c) => `
    <div class="mini-item">
      <span class="mini-dot"></span>
      <div class="mini-body">
        <div class="mini-title">${escapeHtml(c.name)}</div>
        <div class="mini-meta">${(c.tasks || []).map((t) => escapeHtml(t)).join(" • ")}</div>
      </div>
    </div>
  `).join("");
}

/* ============================================================
   INVOICES
============================================================ */
function renderInvoices() {
  if (!invoicesList) return;
  const billable = clientsCache.filter((c) => (Number(c.totalAmount) || 0) > 0);

  if (!billable.length) {
    invoicesList.innerHTML = `<div class="mini-empty">No invoices yet.</div>`;
    return;
  }

  invoicesList.innerHTML = billable.map((c) => {
    const total = Number(c.totalAmount) || 0;
    const paid = Number(c.paidAmount) || 0;
    const status = c.paymentStatus || "Pending";
    const badgeClass = status === "Paid" ? "paid" : status === "Overdue" ? "overdue" : "pending";
    return `
      <div class="client-card">
        <div class="client-card-top">
          <strong>${escapeHtml(c.name)}</strong>
          <span class="badge ${badgeClass}">${escapeHtml(status)}</span>
        </div>
        <small>${escapeHtml(c.planName || "No plan set")}</small>
        <small style="color:#cfcfcf;">₹${paid.toLocaleString("en-IN")} paid of ₹${total.toLocaleString("en-IN")}</small>
        <div class="client-card-foot">
          <span>Due ${escapeHtml(c.nextPaymentDue || "—")}</span>
          ${c.invoiceLink ? `<a href="${escapeHtml(c.invoiceLink)}" target="_blank" rel="noopener">View invoice</a>` : ""}
        </div>
      </div>
    `;
  }).join("");
}

/* ============================================================
   TIME TRACKING
============================================================ */
function populateClientSelects() {
  const active = clientsCache.filter((c) => c.access !== "disabled");
  const optionsHtml = `<option value="" disabled selected>Select client…</option>` +
    active.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("");

  if (timeLogClient) timeLogClient.innerHTML = optionsHtml;
  if (quickFileClient) quickFileClient.innerHTML = optionsHtml;
}

timeLogForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const clientId = timeLogClient?.value;
  const client = clientsCache.find((c) => c.id === clientId);
  if (!client) { timeLogMessage.textContent = "Select a client first."; return; }

  try {
    await addDoc(collection(db, "time_logs"), {
      clientId,
      clientName: client.name,
      hours: Number(timeLogHours?.value) || 0,
      date: timeLogDate?.value || "",
      note: timeLogNote?.value.trim() || "",
      createdAt: new Date().toISOString()
    });
    await logActivity(`Logged ${timeLogHours?.value}h for ${client.name}`, "info");
    timeLogForm.reset();
    if (timeLogMessage) timeLogMessage.textContent = "Time entry added.";
    showToast(`Logged time for ${client.name}`, "good");
    await loadTimeLogs();
  } catch (err) {
    console.error(err);
    if (timeLogMessage) timeLogMessage.textContent = "Failed to add entry.";
  }
});

function renderTimeTracking() {
  if (timeLogsList) {
    if (!timeLogsCache.length) {
      timeLogsList.innerHTML = `<div class="mini-empty">No time logged yet.</div>`;
    } else {
      timeLogsList.innerHTML = timeLogsCache.slice(0, 12).map((t) => `
        <div class="mini-item">
          <span class="mini-dot"></span>
          <div class="mini-body">
            <div class="mini-title">${escapeHtml(t.clientName)} — ${t.hours}h</div>
            <div class="mini-meta">${escapeHtml(t.date || "")} ${t.note ? "• " + escapeHtml(t.note) : ""}</div>
          </div>
        </div>
      `).join("");
    }
  }

  if (timeSummary) {
    const totals = {};
    timeLogsCache.forEach((t) => {
      totals[t.clientName] = (totals[t.clientName] || 0) + (Number(t.hours) || 0);
    });
    const entries = Object.entries(totals).sort((a, b) => b[1] - a[1]);
    if (!entries.length) {
      timeSummary.innerHTML = `<div class="mini-empty">No hours logged yet.</div>`;
    } else {
      timeSummary.innerHTML = entries.map(([name, hours]) => `
        <div class="mini-item">
          <span class="mini-dot good"></span>
          <div class="mini-body">
            <div class="mini-title">${escapeHtml(name)}</div>
            <div class="mini-meta">${hours}h total</div>
          </div>
        </div>
      `).join("");
    }
  }
}

/* ============================================================
   REPORTS
============================================================ */
function renderReports() {
  if (!reportsKpiGrid) return;
  const total = clientsCache.length;
  const active = clientsCache.filter((c) => c.access !== "disabled");
  const totalRevenue = clientsCache.reduce((s, c) => s + (Number(c.totalAmount) || 0), 0);
  const collected = clientsCache.reduce((s, c) => s + (Number(c.paidAmount) || 0), 0);
  const totalHours = timeLogsCache.reduce((s, t) => s + (Number(t.hours) || 0), 0);

  reportsKpiGrid.innerHTML = `
    ${kpiCard("Total Clients", total, `${active.length} active`)}
    ${kpiCard("Total Contract Value", `₹${totalRevenue.toLocaleString("en-IN")}`, `₹${collected.toLocaleString("en-IN")} collected`)}
    ${kpiCard("Collection Rate", totalRevenue ? `${Math.round((collected / totalRevenue) * 100)}%` : "0%", "Of total contract value")}
    ${kpiCard("Hours Logged", `${totalHours}h`, "All time")}
  `;

  if (phaseBars) {
    const max = Math.max(1, ...PHASES.map((p) => active.filter((c) => (c.phase || "Discovery") === p).length));
    phaseBars.innerHTML = PHASES.map((p) => {
      const count = active.filter((c) => (c.phase || "Discovery") === p).length;
      return barRow(p, count, max);
    }).join("");
  }

  if (paymentBars) {
    const statuses = ["Pending", "Partially Paid", "Paid", "Overdue"];
    const max = Math.max(1, ...statuses.map((s) => clientsCache.filter((c) => (c.paymentStatus || "Pending") === s).length));
    paymentBars.innerHTML = statuses.map((s) => {
      const count = clientsCache.filter((c) => (c.paymentStatus || "Pending") === s).length;
      return barRow(s, count, max);
    }).join("");
  }
}

function barRow(label, count, max) {
  const pct = Math.round((count / max) * 100);
  return `
    <div class="bar-row">
      <div class="bar-row-top"><span>${escapeHtml(label)}</span><span>${count}</span></div>
      <div class="bar-track"><div class="bar-fill" style="width:${pct}%;"></div></div>
    </div>
  `;
}

/* ============================================================
   FILES & ASSETS
============================================================ */
quickFileForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const clientId = quickFileClient?.value;
  const client = clientsCache.find((c) => c.id === clientId);
  if (!client) { quickFileMessage.textContent = "Select a client first."; return; }

  const newFile = {
    title: quickFileTitle?.value.trim() || "",
    note: quickFileNote?.value.trim() || "",
    link: quickFileLink?.value.trim() || ""
  };
  if (!newFile.title || !newFile.link) { quickFileMessage.textContent = "Title and link are required."; return; }

  try {
    const updatedFiles = [...(client.files || []), newFile];
    await updateDoc(doc(db, "clients", clientId), { files: updatedFiles });
    await logActivity(`Added file "${newFile.title}" for ${client.name}`, "good");
    quickFileForm.reset();
    if (quickFileMessage) quickFileMessage.textContent = "File added.";
    showToast("File added", "good");
    await loadClients();
  } catch (err) {
    console.error(err);
    if (quickFileMessage) quickFileMessage.textContent = "Failed to add file.";
  }
});

function renderFiles() {
  if (!filesGrid) return;
  const rows = [];
  clientsCache.forEach((c) => {
    (c.files || []).forEach((f) => rows.push({ ...f, clientName: c.name }));
  });

  if (!rows.length) {
    filesGrid.innerHTML = `<div class="mini-empty">No files added yet.</div>`;
    return;
  }

  filesGrid.innerHTML = rows.map((f) => `
    <div class="client-card" style="cursor:default;">
      <div class="client-card-top">
        <strong>${escapeHtml(f.title)}</strong>
        <span class="badge active">${escapeHtml(f.clientName || "")}</span>
      </div>
      <small>${escapeHtml(f.note || "")}</small>
      <div class="client-card-foot">
        <a href="${escapeHtml(f.link)}" target="_blank" rel="noopener">Open file</a>
      </div>
    </div>
  `).join("");
}

/* ============================================================
   ACTIVITY
============================================================ */
function renderActivity() {
  if (!activityFeed) return;
  if (!activityCache.length) {
    activityFeed.innerHTML = `<div class="mini-empty">No activity recorded yet.</div>`;
    return;
  }
  activityFeed.innerHTML = activityCache.map(activityItemHtml).join("");
}

/* ============================================================
   OWNERS
============================================================ */
addOwnerForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = newOwnerName?.value.trim();
  const email = newOwnerEmail?.value.trim().toLowerCase();
  if (!name || !email) { addOwnerMessage.textContent = "Name and email are required."; return; }

  try {
    await setDoc(doc(db, "owners", makeDocId(email)), {
      name, email, addedAt: new Date().toISOString(), addedBy: currentUser?.email || ""
    });
    await logActivity(`Granted owner access to ${name}`, "good");
    addOwnerForm.reset();
    if (addOwnerMessage) addOwnerMessage.textContent = "Owner access granted.";
    showToast(`${name} granted owner access`, "good");
    await loadOwners();
  } catch (err) {
    console.error(err);
    if (addOwnerMessage) addOwnerMessage.textContent = "Failed to add owner.";
  }
});

function renderOwners() {
  if (!ownersList) return;
  const primary = { id: "primary", name: "Primary Owner", email: OWNER_EMAIL, primary: true };
  const all = [primary, ...ownersCache];

  ownersList.innerHTML = all.map((o) => `
    <div class="client-card" style="cursor:default;">
      <div class="client-card-top">
        <strong>${escapeHtml(o.name || "Owner")}</strong>
        <span class="badge ${o.primary ? "active" : "progress"}">${o.primary ? "Primary" : "Owner"}</span>
      </div>
      <small>${escapeHtml(o.email || "")}</small>
      ${!o.primary ? `<div class="client-card-foot"><button class="btn-secondary revoke-owner-btn" data-owner-id="${o.id}" type="button" style="padding:8px 14px; font-size:12px;">Revoke Access</button></div>` : ""}
    </div>
  `).join("");

  ownersList.querySelectorAll(".revoke-owner-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Revoke this owner's access?")) return;
      try {
        await deleteDoc(doc(db, "owners", btn.dataset.ownerId));
        await logActivity("Revoked an owner's access", "danger");
        showToast("Owner access revoked", "warn");
        await loadOwners();
      } catch (err) { console.error(err); }
    });
  });
}

/* ============================================================
   AUTH / INIT
============================================================ */
async function isAuthorizedOwner(email) {
  if (!email) return false;
  if (email === OWNER_EMAIL.toLowerCase()) return true;
  try {
    const snap = await getDoc(doc(db, "owners", makeDocId(email)));
    return snap.exists();
  } catch {
    return false;
  }
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "../login.html";
    return;
  }

  const email = (user.email || "").trim().toLowerCase();
  const authorized = await isAuthorizedOwner(email);

  if (!authorized) {
    window.location.href = "../users.html";
    return;
  }

  currentUser = user;
  renderOwnerNavbar(user);

  await Promise.all([loadClients(), loadRequests(), loadOwners(), loadTimeLogs(), loadActivity()]);
  switchTab("overview");
});

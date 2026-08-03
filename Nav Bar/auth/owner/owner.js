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
  limit,
  serverTimestamp
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
let conversationSearchTerm = "";

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
const attentionList = document.getElementById("attentionList");
const overviewPhaseBars = document.getElementById("overviewPhaseBars");
const overviewCurrentReviews = document.getElementById("overviewCurrentReviews");

/* Overview — hidden compatibility panels still present in the markup
   ("Your existing functions can still target these"). We keep populating
   them even though they're not shown, in case they get re-enabled. */
const upcomingDeadlines = document.getElementById("upcomingDeadlines");
const recentClients = document.getElementById("recentClients");
const overviewActivity = document.getElementById("overviewActivity");
const overviewPulse = document.getElementById("overviewPulse");

/* Overview — command-centre dashboard (top stat cards, revenue chart,
   finance rings, client activity table). These ids exist in the current
   owner.html "tusdio-dashboard-grid" / "dashboard-main-grid" markup. */
const dashProjects = document.getElementById("dashProjects");
const dashApproved = document.getElementById("dashApproved");
const dashClients = document.getElementById("dashClients");
const dashActiveProjects = document.getElementById("dashActiveProjects");
const dashMonthRevenue = document.getElementById("dashMonthRevenue");
const dashRevenue = document.getElementById("dashRevenue");
const dashPendingRevenue = document.getElementById("dashPendingRevenue");
const revenuePeriod = document.getElementById("revenuePeriod");
const revenueBars = document.getElementById("revenueBars");
const paidPercent = document.getElementById("paidPercent");
const paidInvoicesAmount = document.getElementById("paidInvoicesAmount");
const fundsPercent = document.getElementById("fundsPercent");
const fundsReceivedAmount = document.getElementById("fundsReceivedAmount");
const dashboardClientActivity = document.getElementById("dashboardClientActivity");

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
const conversationSearch = document.getElementById("conversationSearch");
const threadPane = document.getElementById("threadPane");
const threadEmpty = document.getElementById("threadEmpty");
const threadActive = document.getElementById("threadActive");
const threadClientName = document.getElementById("threadClientName");
const threadClientSub = document.getElementById("threadClientSub");
const threadAvatar = document.getElementById("threadAvatar");
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
const decisionsLogPreview = document.getElementById("decisionsLogPreview");
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

// Renders a numeric rating (0-5, can be fractional) as filled/empty stars.
function starsHtml(rating) {
  const r = Math.max(0, Math.min(5, Number(rating) || 0));
  const full = Math.round(r); // simple whole-star rounding for display
  let out = "";
  for (let i = 1; i <= 5; i++) {
    out += i <= full ? "★" : "☆";
  }
  return out;
}

function timeAgo(value) {
  if (!value) return "";
  let then;
  if (typeof value?.toDate === "function") {
    then = value.toDate().getTime();
  } else if (typeof value === "number") {
    then = value;
  } else {
    then = new Date(value).getTime();
  }
  if (Number.isNaN(then)) return String(value);
  const diff = Math.max(0, Date.now() - then);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(value).toLocaleDateString();
}

// Resolves any of our timestamp shapes (Firestore Timestamp, ISO string, ms
// number) into a millisecond epoch, used for sorting and day-grouping.
function toMillis(value) {
  if (!value) return 0;
  if (typeof value?.toMillis === "function") return value.toMillis();
  if (typeof value?.toDate === "function") return value.toDate().getTime();
  const n = new Date(value).getTime();
  return Number.isNaN(n) ? 0 : n;
}

function dayLabel(ms) {
  if (!ms) return "";
  const d = new Date(ms);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const sameDay = (a, b) => a.toDateString() === b.toDateString();
  if (sameDay(d, today)) return "Today";
  if (sameDay(d, yesterday)) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: d.getFullYear() !== today.getFullYear() ? "numeric" : undefined });
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

/* ------------------------------------------------------------
   AUTO NOTIFICATIONS
   The client-facing "Latest From TUSDIO" feed reads from each
   client doc's `notifications` array. Previously nothing ever
   wrote to it automatically — the owner had to remember to type
   a line into the Notifications textarea every single time,
   which is why clients rarely saw anything new. These helpers
   build that line automatically for the events that matter
   (phase change, new/updated review, file added, billing
   change) and diffAndBuildAutoNotifications() below is called
   right before every save so the array always picks up new
   entries on top of whatever the owner typed manually.
   ------------------------------------------------------------ */
function diffAndBuildAutoNotifications(previous, next) {
  const auto = [];
  const prev = previous || {};

  if ((prev.phase || "") !== (next.phase || "") && next.phase) {
    auto.push(`Project phase moved to "${next.phase}"`);
  }

  const prevReview = prev.currentReview || prev.review || {};
  const nextReview = next.currentReview || next.review || {};
  if (nextReview.title && (
    prevReview.title !== nextReview.title ||
    prevReview.status !== nextReview.status ||
    prevReview.image !== nextReview.image ||
    (prevReview.description || prevReview.desc || "") !== (nextReview.description || nextReview.desc || "")
  )) {
    auto.push(`New review posted: "${nextReview.title}" — awaiting your feedback`);
  }

  if ((prev.paymentStatus || "") !== (next.paymentStatus || "") && next.paymentStatus) {
    auto.push(`Payment status updated to "${next.paymentStatus}"`);
  }

  const prevFileCount = Array.isArray(prev.files) ? prev.files.length : 0;
  const nextFileCount = Array.isArray(next.files) ? next.files.length : 0;
  if (nextFileCount > prevFileCount) {
    const added = next.files.slice(prevFileCount);
    added.forEach((f) => auto.push(`New file added: "${f.title}"`));
  }

  return auto;
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
  // FIX: Messages tab previously only rendered if loadClients() happened to
  // finish while the user was already sitting on this tab — which almost
  // never happened on a real page load, so the conversation list stayed
  // empty until some unrelated re-render fired. Rendering here on every
  // switch makes it reliable regardless of load timing.
  if (tab === "messages") renderConversations();
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

/* ------------------------------------------------------------
   DECISIONS APPROVAL LOG
   Renders a read-only, live-updating list of every decision the
   owner has typed into the Decisions textarea, with a colored
   status pill per row.
   ------------------------------------------------------------ */
function renderDecisionsLog(decisions) {
  if (!decisionsLogPreview) return;
  const list = decisions || [];
  if (!list.length) {
    decisionsLogPreview.innerHTML = `<div class="mini-empty">No decisions added yet.</div>`;
    return;
  }
  decisionsLogPreview.innerHTML = list.map((d) => {
    const status = (d.status || "upcoming").toLowerCase().replace(/\s+/g, "_");
    const dotClass = status === "approved" ? "good" : status === "awaiting" ? "warn" : status === "changes_requested" ? "danger" : "";
    const label = status.replace(/_/g, " ");
    return `
      <div class="mini-item">
        <span class="mini-dot ${dotClass}"></span>
        <div class="decision-row">
          <span class="mini-title">${escapeHtml(d.name)}</span>
          <span class="decision-status-pill ${status}">${escapeHtml(label)}</span>
        </div>
      </div>
    `;
  }).join("");
}

decisionsInput?.addEventListener("input", () => {
  renderDecisionsLog(parseDecisionsInput(decisionsInput.value));
});

function resetDrawerForm() {
  ownerForm?.reset();
  if (clientIdInput) clientIdInput.value = "";
  if (loginTypeInput) loginTypeInput.value = "Manual / Pending Signup";
  if (satisfactionDisplay) satisfactionDisplay.value = "";
  if (phaseInput) phaseInput.value = "Discovery";
  if (statusInput) statusInput.value = "Not started";
  if (paymentStatusInput) paymentStatusInput.value = "Pending";
  if (progressInput) progressInput.value = 0;
  renderDecisionsLog([]);
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
    renderDecisionsLog(data.decisions || []);
    const editorReview = data.currentReview || data.review || {};
    if (reviewTitleInput) reviewTitleInput.value = editorReview.title || "";
    if (reviewStatusInput) reviewStatusInput.value = editorReview.status || "awaiting";
    if (reviewImageInput) reviewImageInput.value = editorReview.image || editorReview.preview || "";
    if (reviewDescInput) reviewDescInput.value = editorReview.description || editorReview.desc || "";
    if (satisfactionDisplay) {
      satisfactionDisplay.value = data.satisfaction
        ? `${starsHtml(data.satisfaction)}  (${data.satisfaction} / 5)`
        : "";
    }
    if (planNameInput) planNameInput.value = data.planName || "";
    if (paymentStatusInput) paymentStatusInput.value = data.paymentStatus || "Pending";
    if (totalAmountInput) totalAmountInput.value = data.totalAmount || 0;
    if (paidAmountInput) paidAmountInput.value = data.paidAmount || 0;
    if (nextPaymentDueInput) nextPaymentDueInput.value = data.nextPaymentDue || "";
    if (invoiceLinkInput) invoiceLinkInput.value = data.invoiceLink || "";
    if (updatesInput) updatesInput.value = (data.updates || []).join("\n");
    if (notificationsInput) {
      notificationsInput.value = (data.notifications || []).map((n) =>
        typeof n === "string" ? n : (n?.text || "")
      ).filter(Boolean).join("\n");
    }
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
    currentReview: {
      title: reviewTitleInput?.value.trim() || "",
      status: reviewStatusInput?.value || "awaiting",
      image: reviewImageInput?.value.trim() || "",
      description: reviewDescInput?.value.trim() || ""
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
      const previous = clientsCache.find((c) => c.id === existingId) || {};
      const autoNotes = diffAndBuildAutoNotifications(previous, payload);
      if (autoNotes.length) {
        payload.notifications = [...payload.notifications, ...autoNotes];
      }

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

// Clients that have actually submitted a rating (satisfaction is a
// truthy number, since ratings write from the client side only touch
// this field per the Firestore rules).
function ratedClients() {
  return clientsCache.filter((c) => Number(c.satisfaction) > 0);
}

function averageSatisfaction() {
  const rated = ratedClients();
  if (!rated.length) return null;
  const sum = rated.reduce((s, c) => s + Number(c.satisfaction), 0);
  return sum / rated.length;
}

function avgProgressOf(list) {
  return list.length
    ? Math.round(list.reduce((s, c) => s + (Number(c.progress) || 0), 0) / list.length)
    : 0;
}

// Main entry point for the whole Overview tab. Everything here targets ids
// that exist in the current owner.html "tusdio-dashboard-grid" layout.
function renderOverview() {
  renderOverviewHero();

  const active = clientsCache.filter((c) => c.access !== "disabled");
  const totalRevenue = clientsCache.reduce((s, c) => s + (Number(c.paidAmount) || 0), 0);
  const pendingRevenue = clientsCache.reduce((s, c) => s + ((Number(c.totalAmount) || 0) - (Number(c.paidAmount) || 0)), 0);
  const approvedDecisions = clientsCache.reduce((s, c) => {
    const decisions = Array.isArray(c.decisions) ? c.decisions : [];
    return s + decisions.filter((d) => (d.status || "").toLowerCase() === "approved").length;
  }, 0);

  if (dashProjects) dashProjects.textContent = clientsCache.length;
  if (dashApproved) dashApproved.textContent = approvedDecisions;
  if (dashClients) dashClients.textContent = clientsCache.length;
  if (dashActiveProjects) dashActiveProjects.textContent = active.length;
  if (dashRevenue) dashRevenue.textContent = `₹${totalRevenue.toLocaleString("en-IN")}`;
  if (dashPendingRevenue) dashPendingRevenue.textContent = `₹${pendingRevenue.toLocaleString("en-IN")} pending`;

  renderRevenueChart();
  renderFinanceWidgets(totalRevenue, pendingRevenue);
  renderPipelineSnapshot(active);
  renderDashboardClientActivity();
  renderAttention(active);
  renderCurrentReviews(active);

  // Hidden compatibility panels — kept populated even though the current
  // markup hides them, per the comment in owner.html.
  renderWorkspacePulse(active, totalRevenue, pendingRevenue, avgProgressOf(active), averageSatisfaction());
  renderUpcomingDeadlines(active);
  renderRecentClients();
  renderOverviewActivity();
}

/* ------------------------------------------------------------
   REVENUE CHART
   There's no dedicated "monthly revenue" record in Firestore, so we
   bucket each client's paid/pending amounts into the month of their
   last update (falling back to creation date). This is an
   approximation, but it's the only date signal the schema gives us,
   and it keeps the "this month" KPI and the chart in sync.
   ------------------------------------------------------------ */
function monthBucketsForYear(year) {
  const buckets = Array.from({ length: 12 }, () => ({ paid: 0, pending: 0 }));
  clientsCache.forEach((c) => {
    const ms = toMillis(c.updatedAt || c.createdAt);
    if (!ms) return;
    const d = new Date(ms);
    if (d.getFullYear() !== Number(year)) return;
    const idx = d.getMonth();
    buckets[idx].paid += Number(c.paidAmount) || 0;
    buckets[idx].pending += Math.max(0, (Number(c.totalAmount) || 0) - (Number(c.paidAmount) || 0));
  });
  return buckets;
}

function renderRevenueChart() {
  if (!revenueBars) return;

  const year = revenuePeriod?.value || String(new Date().getFullYear());
  const buckets = monthBucketsForYear(year);
  const scaleMax = 40000; // matches the fixed ₹40k top gridline label in the markup

  revenueBars.innerHTML = buckets.map((b) => {
    const paidPct = b.paid > 0 ? Math.max(4, Math.min(100, Math.round((b.paid / scaleMax) * 100))) : 0;
    const pendingPct = b.pending > 0 ? Math.max(4, Math.min(100, Math.round((b.pending / scaleMax) * 100))) : 0;
    return `
      <div class="chart-bar-group" title="Paid ₹${b.paid.toLocaleString("en-IN")} • Pending ₹${b.pending.toLocaleString("en-IN")}">
        <div class="chart-bar" style="height:${paidPct}%"></div>
        <div class="chart-bar secondary" style="height:${pendingPct}%"></div>
      </div>
    `;
  }).join("");

  // "This month" always reflects the real current month regardless of
  // which year is selected in the dropdown.
  const now = new Date();
  const currentYearBuckets = Number(year) === now.getFullYear() ? buckets : monthBucketsForYear(now.getFullYear());
  const thisMonth = currentYearBuckets[now.getMonth()]?.paid || 0;
  if (dashMonthRevenue) dashMonthRevenue.textContent = `₹${thisMonth.toLocaleString("en-IN")}`;
}

revenuePeriod?.addEventListener("change", renderRevenueChart);

/* ------------------------------------------------------------
   FINANCE WIDGETS (paid invoices ring, funds received ring)
   ------------------------------------------------------------ */
function renderFinanceWidgets(totalRevenue, pendingRevenue) {
  const billable = clientsCache.filter((c) => (Number(c.totalAmount) || 0) > 0);
  const paidClients = billable.filter((c) => c.paymentStatus === "Paid");
  const paidInvoicesTotal = paidClients.reduce((s, c) => s + (Number(c.paidAmount) || 0), 0);
  const paidPct = billable.length ? Math.round((paidClients.length / billable.length) * 100) : 0;

  const contract = totalRevenue + pendingRevenue;
  const fundsPct = contract > 0 ? Math.round((totalRevenue / contract) * 100) : 0;

  if (paidPercent) paidPercent.textContent = `${paidPct}%`;
  if (paidInvoicesAmount) paidInvoicesAmount.textContent = `₹${paidInvoicesTotal.toLocaleString("en-IN")}`;
  if (fundsPercent) fundsPercent.textContent = `${fundsPct}%`;
  if (fundsReceivedAmount) fundsReceivedAmount.textContent = `₹${totalRevenue.toLocaleString("en-IN")}`;

  // The CSS rings use a fixed conic-gradient stop angle — recompute it here
  // so the ring visually tracks the live percentage instead of always
  // showing its hardcoded default.
  const purpleRing = document.querySelector(".finance-ring.purple");
  if (purpleRing) {
    purpleRing.style.background = `conic-gradient(#b35bff 0deg, #7d46ff ${paidPct * 3.6}deg, rgba(255,255,255,.07) ${paidPct * 3.6}deg)`;
  }
  const greenRing = document.querySelector(".finance-ring.green");
  if (greenRing) {
    greenRing.style.background = `conic-gradient(#59d26f 0deg, #37a95a ${fundsPct * 3.6}deg, rgba(255,255,255,.07) ${fundsPct * 3.6}deg)`;
  }
}

/* ------------------------------------------------------------
   PIPELINE SNAPSHOT ("Project flow" card)
   Uses the dashboard-project-* classes defined in owner.css, not the
   generic .bar-row classes (those are still used by the Reports tab).
   ------------------------------------------------------------ */
function renderPipelineSnapshot(active) {
  if (!overviewPhaseBars) return;
  if (!active.length) {
    overviewPhaseBars.innerHTML = `<div class="mini-empty">No active clients yet.</div>`;
    return;
  }
  const max = Math.max(1, ...PHASES.map((p) => active.filter((c) => (c.phase || "Discovery") === p).length));
  overviewPhaseBars.innerHTML = PHASES.map((p) => {
    const count = active.filter((c) => (c.phase || "Discovery") === p).length;
    const pct = Math.round((count / max) * 100);
    return `
      <div class="dashboard-project-row">
        <span class="dashboard-project-name">${escapeHtml(p)}</span>
        <div class="dashboard-project-track"><div class="dashboard-project-fill" style="width:${pct}%"></div></div>
        <span class="dashboard-project-count">${count}</span>
      </div>
    `;
  }).join("");
}

/* ------------------------------------------------------------
   RECENT CLIENT ACTIVITY TABLE
   ------------------------------------------------------------ */
function renderDashboardClientActivity() {
  if (!dashboardClientActivity) return;

  const sorted = [...clientsCache].sort(
    (a, b) => toMillis(b.updatedAt || b.createdAt) - toMillis(a.updatedAt || a.createdAt)
  );

  if (!sorted.length) {
    dashboardClientActivity.innerHTML = `<div class="mini-empty">No client activity yet.</div>`;
    return;
  }

  dashboardClientActivity.innerHTML = sorted.slice(0, 8).map((c) => {
    let statusClass = "pending";
    if (c.status === "Completed") statusClass = "completed";
    else if (c.access !== "disabled" && (c.status === "In Progress" || c.status === "Waiting for feedback")) statusClass = "active";

    const value = Number(c.paidAmount) || Number(c.totalAmount) || 0;

    return `
      <div class="client-table-row" data-client-id="${escapeHtml(c.id)}">
        <div class="client-name-cell">
          <div class="client-mini-avatar">${initials(c.name)}</div>
          <strong>${escapeHtml(c.name || "Client")}</strong>
        </div>
        <div class="client-project">${escapeHtml(c.projectName || c.service || "—")}</div>
        <div class="client-date">${timeAgo(c.updatedAt || c.createdAt)}</div>
        <div><span class="client-status ${statusClass}">${escapeHtml(c.status || "—")}</span></div>
        <div class="client-value">₹${value.toLocaleString("en-IN")}</div>
      </div>
    `;
  }).join("");

  dashboardClientActivity.querySelectorAll("[data-client-id]").forEach((row) => {
    row.addEventListener("click", () => openClientDrawer(row.dataset.clientId));
  });
}

function renderWorkspacePulse(active, collected, pending, progress, rating) {
  if (!overviewPulse) return;
  const contract = collected + pending;
  const collectionRate = contract > 0 ? Math.round((collected / contract) * 100) : 0;
  const ratingPct = rating === null ? 0 : Math.round((rating / 5) * 100);

  const pulse = [
    { label: "Revenue collected", value: `₹${collected.toLocaleString("en-IN")}`, sub: `${collectionRate}% of ₹${contract.toLocaleString("en-IN")}`, pct: collectionRate, tone: "money" },
    { label: "Projects on track", value: `${progress}%`, sub: `${active.length} active client${active.length === 1 ? "" : "s"}`, pct: progress, tone: "progress" },
    { label: "Client satisfaction", value: rating === null ? "—" : `${rating.toFixed(1)} / 5`, sub: rating === null ? "Waiting for ratings" : "Average client rating", pct: ratingPct, tone: "rating" }
  ];

  overviewPulse.innerHTML = pulse.map((p) => `
    <div class="pulse-item">
      <div class="pulse-top"><span>${escapeHtml(p.label)}</span><strong>${escapeHtml(p.value)}</strong></div>
      <div class="pulse-track"><span class="pulse-fill ${p.tone}" style="width:${Math.max(0, Math.min(100, p.pct))}%"></span></div>
      <small>${escapeHtml(p.sub)}</small>
    </div>
  `).join("");
}

function getClientReview(client) {
  return client?.currentReview || client?.review || null;
}

function reviewStatusLabel(status) {
  return ({
    awaiting: "Awaiting client",
    approved: "Approved",
    changes_requested: "Changes requested"
  }[status] || "Awaiting client");
}

function renderCurrentReviews(active) {
  if (!overviewCurrentReviews) return;

  const reviews = active
    .map((client) => ({ client, review: getClientReview(client) }))
    .filter(({ review }) => review && review.title)
    .sort((a, b) => {
      const priority = { awaiting: 0, changes_requested: 1, approved: 2 };
      return (priority[a.review.status] ?? 3) - (priority[b.review.status] ?? 3);
    });

  if (!reviews.length) {
    overviewCurrentReviews.innerHTML = `
      <div class="current-review-empty glass">
        <div class="current-review-empty-icon">✓</div>
        <div>
          <strong>No active reviews</strong>
          <p>When you publish a client review, it will appear here as a clean decision card.</p>
        </div>
      </div>`;
    return;
  }

  overviewCurrentReviews.innerHTML = reviews.slice(0, 8).map(({ client, review }) => {
    const status = review.status || "awaiting";
    const progress = Math.max(0, Math.min(100, Number(client.progress) || 0));
    const image = review.image || review.preview || "";
    const description = review.description || review.desc || "Awaiting client feedback on the latest direction.";
    const statusClass = status === "approved" ? "is-approved" : status === "changes_requested" ? "is-changes" : "is-awaiting";

    return `
      <article class="current-review-card glass ${statusClass}" data-client-id="${escapeHtml(client.id)}">
        <div class="current-review-media">
          ${image
            ? `<img src="${escapeHtml(image)}" alt="${escapeHtml(review.title)} preview" loading="lazy" onerror="this.parentElement.classList.add('has-error');this.remove();" />`
            : `<div class="current-review-media-empty"><span>Preview</span><small>No image</small></div>`}
          <span class="current-review-status ${statusClass}">${escapeHtml(reviewStatusLabel(status))}</span>
        </div>
        <div class="current-review-body">
          <div class="current-review-client">
            <span class="client-avatar">${initials(client.name)}</span>
            <div><strong>${escapeHtml(client.name)}</strong><small>${escapeHtml(client.projectName || client.service || "TUSDIO project")}</small></div>
          </div>
          <h4>${escapeHtml(review.title)}</h4>
          <p>${escapeHtml(description)}</p>
          <div class="current-review-progress"><span style="width:${progress}%"></span></div>
          <div class="current-review-meta"><span>${progress}% project progress</span><span>${escapeHtml(client.phase || "Project")}</span></div>
          <button class="current-review-open" type="button" data-client-id="${escapeHtml(client.id)}">Open client →</button>
        </div>
      </article>`;
  }).join("");

  overviewCurrentReviews.querySelectorAll(".current-review-open").forEach((btn) => {
    btn.addEventListener("click", () => openClientDrawer(btn.dataset.clientId));
  });
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

/* ------------------------------------------------------------
   "Needs your attention" list — uses dashboard-attention-* classes
   defined in owner.css (3-column grid), not the generic .mini-item.
   ------------------------------------------------------------ */
function renderAttention(active) {
  if (!attentionList) return;
  const items = [];

  active.forEach((c) => {
    if (c.status === "Waiting for feedback") {
      items.push({ danger: false, title: `${c.name} is waiting for feedback`, meta: c.nextAction || c.projectName || "" });
    }
    if (c.paymentStatus === "Overdue") {
      items.push({ danger: true, title: `${c.name} has an overdue payment`, meta: `₹${(Number(c.totalAmount) || 0) - (Number(c.paidAmount) || 0)} outstanding` });
    }
  });

  requestsCache.filter((r) => r.status === "New").forEach((r) => {
    items.push({ danger: false, title: `New ${r.type || "request"} from ${r.clientName || "a client"}`, meta: r.subject || "" });
  });

  active.forEach((c) => {
    const review = getClientReview(c);
    if (review?.status === "awaiting") {
      items.push({ danger: false, title: `${c.name} has a review awaiting approval`, meta: review.title || c.projectName || "Current review" });
    }
    if (review?.status === "changes_requested") {
      items.push({ danger: true, title: `${c.name} requested changes`, meta: review.title || c.projectName || "Current review" });
    }
  });

  if (!items.length) {
    attentionList.innerHTML = `<div class="mini-empty">Nothing needs your attention right now.</div>`;
    return;
  }

  attentionList.innerHTML = items.slice(0, 9).map((i) => `
    <div class="dashboard-attention-item">
      <span class="dashboard-attention-dot ${i.danger ? "danger" : ""}"></span>
      <div>
        <div class="dashboard-attention-title">${escapeHtml(i.title)}</div>
        <div class="dashboard-attention-meta">${escapeHtml(i.meta)}</div>
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
    const hasRating = Number(c.satisfaction) > 0;
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
        <div class="client-card-foot">
          <span title="Client satisfaction rating" style="${hasRating ? "color:#ffc454;" : "color:#6f6f6f;"}">
            ${hasRating ? `${starsHtml(c.satisfaction)} (${c.satisfaction}/5)` : "No rating yet"}
          </span>
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
  const header = ["Name", "Email", "Service", "Phase", "Status", "Progress", "Payment Status", "Total Amount", "Paid Amount", "Access", "Rating"];
  const csvRows = rows.map((c) => [
    c.name, c.email, c.service, c.phase, c.status, c.progress, c.paymentStatus, c.totalAmount, c.paidAmount, c.access === "disabled" ? "Removed" : "Active", c.satisfaction || ""
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
          clientUid: clientId,
          sender: "owner",
          text,
          createdAt: serverTimestamp()
        });

        const targetClient = clientsCache.find((c) => c.id === clientId);
        if (targetClient) {
          const existingNotifications = Array.isArray(targetClient.notifications) ? targetClient.notifications : [];
          await updateDoc(doc(db, "clients", clientId), {
            notifications: [
              ...existingNotifications,
              `New message from TUSDIO: ${text.slice(0, 120)}`
            ],
            lastOwnerMessageAt: new Date().toISOString(),
            lastOwnerMessagePreview: text.slice(0, 140)
          });
        }

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
  const term = conversationSearchTerm.trim().toLowerCase();

  const filtered = term
    ? active.filter((c) =>
        (c.name || "").toLowerCase().includes(term) ||
        (c.service || "").toLowerCase().includes(term) ||
        (c.projectName || "").toLowerCase().includes(term)
      )
    : active;

  if (!active.length) {
    conversationsList.innerHTML = `<div class="mini-empty">No active clients yet.</div>`;
    return;
  }
  if (!filtered.length) {
    conversationsList.innerHTML = `<div class="mini-empty">No conversations match "${escapeHtml(conversationSearchTerm)}".</div>`;
    return;
  }

  const sorted = [...filtered].sort((a, b) => toMillis(b.lastOwnerMessageAt) - toMillis(a.lastOwnerMessageAt));

  conversationsList.innerHTML = sorted.map((c) => `
    <div class="conversation-item ${c.id === activeThreadClientId ? "is-active" : ""}" data-client-id="${c.id}">
      <div class="client-avatar">${initials(c.name)}</div>
      <div class="conv-item-text">
        <div class="conv-item-top">
          <strong>${escapeHtml(c.name || "Client")}</strong>
          ${c.lastOwnerMessageAt ? `<span class="conv-item-time">${timeAgo(c.lastOwnerMessageAt)}</span>` : ""}
        </div>
        <div class="conv-item-preview">${escapeHtml(c.lastOwnerMessagePreview || c.projectName || c.service || "No messages yet")}</div>
      </div>
    </div>
  `).join("");

  conversationsList.querySelectorAll(".conversation-item").forEach((item) => {
    item.addEventListener("click", () => openThread(item.dataset.clientId));
  });
}

conversationSearch?.addEventListener("input", () => {
  conversationSearchTerm = conversationSearch.value || "";
  renderConversations();
});

async function openThread(clientId) {
  activeThreadClientId = clientId;
  const client = clientsCache.find((c) => c.id === clientId);
  if (!client) return;

  renderConversations();
  threadEmpty?.classList.add("hidden-form");
  threadActive?.classList.add("show");
  threadPane?.classList.add("show-thread");
  if (threadClientName) threadClientName.textContent = client.name || "Client";
  if (threadClientSub) threadClientSub.textContent = client.projectName || client.service || "";
  if (threadAvatar) threadAvatar.textContent = initials(client.name);

  await refreshThreadMessages(clientId);
}

async function refreshThreadMessages(clientId) {
  if (!ownerChatThread) return;
  ownerChatThread.innerHTML = `<div class="mini-empty">Loading messages…</div>`;

  try {
    const snap = await getDocs(collection(db, "clients", clientId, "messages"));
    const docs = snap.docs.slice().sort((a, b) => toMillis(a.data().createdAt) - toMillis(b.data().createdAt));

    if (!docs.length) {
      ownerChatThread.innerHTML = `<div class="chat-empty-state">No messages yet.<br>Say hello 👋</div>`;
      return;
    }

    let lastDay = "";
    let html = "";
    docs.forEach((d) => {
      const m = d.data();
      const who = (m.sender || m.role || m.from || "").toLowerCase() === "owner" ? "owner" : "client";
      const ms = toMillis(m.createdAt);
      const label = dayLabel(ms);
      if (label && label !== lastDay) {
        html += `<div class="chat-date-sep">${escapeHtml(label)}</div>`;
        lastDay = label;
      }
      html += `
        <div class="chat-row ${who}" data-msg-id="${d.id}">
          ${who === "client" ? `<div class="chat-avatar-sm">${initials(threadClientName?.textContent)}</div>` : ""}
          <div class="chat-bubble ${who}">
            ${escapeHtml(m.text || "")}
            <time>${escapeHtml(timeAgo(m.createdAt))}</time>
          </div>
          <button class="bubble-del-btn" data-del-msg-id="${d.id}" type="button" title="Delete message" aria-label="Delete message">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
          </button>
        </div>
      `;
    });

    ownerChatThread.innerHTML = html;
    ownerChatThread.scrollTop = ownerChatThread.scrollHeight;

    ownerChatThread.querySelectorAll("[data-del-msg-id]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteMessage(clientId, btn.dataset.delMsgId);
      });
    });
  } catch (err) {
    console.error("Failed to load client messages", err);
    const code = err?.code || "unknown-error";
    ownerChatThread.innerHTML = `<div class="mini-empty">Couldn't load messages. (${escapeHtml(code)})</div>`;
  }
}

async function deleteMessage(clientId, messageId) {
  if (!clientId || !messageId) return;
  if (!confirm("Delete this message? This cannot be undone.")) return;
  try {
    await deleteDoc(doc(db, "clients", clientId, "messages", messageId));
    showToast("Message deleted", "good");
    await refreshThreadMessages(clientId);
  } catch (err) {
    console.error(err);
    showToast("Couldn't delete that message", "danger");
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
      clientUid: activeThreadClientId,
      sender: "owner",
      text,
      createdAt: serverTimestamp()
    });

    const targetClient = clientsCache.find((c) => c.id === activeThreadClientId);
    if (targetClient) {
      const existingNotifications = Array.isArray(targetClient.notifications) ? targetClient.notifications : [];
      await updateDoc(doc(db, "clients", activeThreadClientId), {
        notifications: [
          ...existingNotifications,
          `New message from TUSDIO: ${text.slice(0, 120)}`
        ],
        lastOwnerMessageAt: new Date().toISOString(),
        lastOwnerMessagePreview: text.slice(0, 140)
      });
    }
    if (ownerChatInput) ownerChatInput.value = "";
    await refreshThreadMessages(activeThreadClientId);
  } catch (err) {
    console.error(err);
    showToast("Couldn't send that message", "danger");
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
  const avgRating = averageSatisfaction();

  reportsKpiGrid.innerHTML = `
    ${kpiCard("Total Clients", total, `${active.length} active`)}
    ${kpiCard("Total Contract Value", `₹${totalRevenue.toLocaleString("en-IN")}`, `₹${collected.toLocaleString("en-IN")} collected`)}
    ${kpiCard("Collection Rate", totalRevenue ? `${Math.round((collected / totalRevenue) * 100)}%` : "0%", "Of total contract value")}
    ${kpiCard("Hours Logged", `${totalHours}h`, "All time")}
    ${kpiCard("Avg. Rating", avgRating === null ? "—" : `${avgRating.toFixed(1)} / 5`, avgRating === null ? "No ratings yet" : `${ratedClients().length} rated`)}
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

  renderRatingsList();
}

function renderRatingsList() {
  const container = document.getElementById("reportsRatingsList");
  if (!container) return;

  const rated = ratedClients().sort((a, b) => Number(b.satisfaction) - Number(a.satisfaction));

  if (!rated.length) {
    container.innerHTML = `<div class="mini-empty">No clients have submitted a rating yet.</div>`;
    return;
  }

  container.innerHTML = rated.map((c) => `
    <div class="mini-item">
      <span class="mini-dot ${Number(c.satisfaction) >= 4 ? "good" : Number(c.satisfaction) >= 3 ? "warn" : "danger"}"></span>
      <div class="mini-body">
        <div class="mini-title">${escapeHtml(c.name || "Client")}</div>
        <div class="mini-meta">${starsHtml(c.satisfaction)} — ${c.satisfaction} / 5</div>
      </div>
    </div>
  `).join("");
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
    const updatedNotifications = [...(client.notifications || []), `New file added: "${newFile.title}"`];
    await updateDoc(doc(db, "clients", clientId), { files: updatedFiles, notifications: updatedNotifications });
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

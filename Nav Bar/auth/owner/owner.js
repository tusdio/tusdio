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
  serverTimestamp,
  arrayUnion,
  increment
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
let freebieDownloadsCache = [];
let freebieLoginsCache = [];
let freebieActivityFilter = "all";
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
const requestSearchInput = document.getElementById("requestSearch");
const requestFilterChips = document.getElementById("requestFilterChips");
let requestSearchTerm = "";
let requestFilterStatus = "all";

requestSearchInput?.addEventListener("input", () => {
  requestSearchTerm = requestSearchInput.value || "";
  renderRequests();
});
requestFilterChips?.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    requestFilterChips.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active"));
    chip.classList.add("is-active");
    requestFilterStatus = chip.dataset.requestFilter;
    renderRequests();
  });
});

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

/* Invoices — see the full Invoices/Payments module further down, which
   declares invoicesList alongside the rest of that module's elements. */

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

/* Freebie Downloads */
const freebieDownloadsList = document.getElementById("freebieDownloadsList");
const freebieDownloadsSearch = document.getElementById("freebieDownloadsSearch");
const freebieDownloadsExportBtn = document.getElementById("freebieDownloadsExportBtn");
const freebieActivityChips = document.getElementById("freebieActivityChips");

/* Owners */
const addOwnerForm = document.getElementById("addOwnerForm");
const newOwnerName = document.getElementById("newOwnerName");
const newOwnerEmail = document.getElementById("newOwnerEmail");
const newOwnerRole = document.getElementById("newOwnerRole");
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
const referredByInput = document.getElementById("referredBy");
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

/* Client summary panel — quick action buttons */
const summaryMessageBtn = document.getElementById("summaryMessageBtn");
const summaryVipToggleBtn = document.getElementById("summaryVipToggleBtn");
const summaryCopyEmailBtn = document.getElementById("summaryCopyEmailBtn");

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
  if (tab === "invoices") renderInvoicesTab();
  if (tab === "files") renderFiles();
  // FIX: Messages tab previously only rendered if loadClients() happened to
  // finish while the user was already sitting on this tab — which almost
  // never happened on a real page load, so the conversation list stayed
  // empty until some unrelated re-render fired. Rendering here on every
  // switch makes it reliable regardless of load timing.
  if (tab === "messages") { renderConversations(); loadConversationPreviews().then(renderConversations); }
  if (tab === "freebieDownloads") renderFreebieDownloads();
  if (tab === "leads") renderLeads();
  if (tab === "followups") renderFollowUps();
  if (tab === "reviews") renderReviews();
  if (tab === "financeOverview") renderFinanceOverview();
  if (tab === "leadSources") renderLeadSourceAnalytics();
  if (tab === "payments") renderPayments();
  if (tab === "expenses") renderExpenses();
  if (tab === "profitability") renderProfitability();
  if (tab === "team") renderTeam();
  if (tab === "proposals") renderProposals();
  if (tab === "contracts") renderContracts();
  if (tab === "calendar") renderCalendar();
  if (tab === "websiteIntelligence") renderWebsiteIntel();
  if (tab === "referrals") renderReferrals();
  if (tab === "conversionAnalytics") renderConversionFunnel();
}

document.querySelectorAll("[data-tab]").forEach((el) => {
  el.addEventListener("click", () => {
    // Role gate: some tabs (Owners & Roles, Finance group, Settings) are
    // restricted by role. Checked here — the single place that actually
    // calls switchTab() for nav clicks — rather than in a second listener,
    // since two listeners on the same element both fire regardless of
    // capture/bubble ordering and a second listener can't reliably block
    // the first one from having already switched the tab.
    const allowed = RESTRICTED_TABS[el.dataset.tab];
    if (allowed && !roleAllows(allowed)) {
      showToast(`Your role (${currentOwnerRole}) doesn't have access to this section`, "warn");
      return;
    }

    // "Pipeline" in the Sales group is a shortcut into Leads/CRM pre-set to
    // the kanban view, rather than a separate tab/collection — a lead only
    // has one underlying record, so it shouldn't have two nav entries that
    // secretly point at different data.
    if (el.dataset.leadView) {
      leadViewMode = el.dataset.leadView;
      if (leadsViewToggle) leadsViewToggle.textContent = leadViewMode === "list" ? "Kanban view" : "List view";
    }
    switchTab(el.dataset.tab);
  });
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

  leadsCache.filter((l) => l.status === "NEW").forEach((l) => {
    items.push({ dot: "", title: `New lead: ${l.name || l.company || "Unnamed lead"}`, meta: l.leadSource || "Leads", tab: "leads" });
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

  leadsCache.forEach((l) => {
    if (!term || (l.name || "").toLowerCase().includes(term) || (l.company || "").toLowerCase().includes(term) || (l.email || "").toLowerCase().includes(term)) {
      results.push({ title: l.name || l.company || "Lead", meta: `Lead • ${l.status || "NEW"} • ${l.company || l.leadSource || ""}`, action: () => { switchTab("leads"); openLeadDrawer(l.id); } });
    }
  });

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
    cmdkResults.innerHTML = `<div class="cmdk-empty">No matches. Try a client name, lead, or request.</div>`;
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
  const fabTabs = ["overview", "clients", "projects", "leads"];
  fabBtn.hidden = !fabTabs.includes(tab);
}
fabBtn?.addEventListener("click", () => {
  if (activeTab === "leads") openNewLeadDrawer();
  else openNewClientDrawer();
});

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

/* ------------------------------------------------------------
   CLIENT SUMMARY PANEL
   A read-only snapshot shown at the top of the drawer whenever an
   existing client is opened. The full edit form is collapsed by
   default behind "Edit full details" so the owner sees a clean
   summary first and only expands the raw fields when they actually
   need to change something. The header also carries three quick
   actions (message, toggle VIP, copy email) so common tasks don't
   require opening the full form at all.
   ------------------------------------------------------------ */
function renderClientSummary(data) {
  const avatar = document.getElementById("summaryAvatar");
  const name = document.getElementById("summaryName");
  const email = document.getElementById("summaryEmail");
  const phaseBadge = document.getElementById("summaryPhaseBadge");
  const statusBadge = document.getElementById("summaryStatusBadge");
  const vipBadge = document.getElementById("summaryVipBadge");
  const progressText = document.getElementById("summaryProgressText");
  const progressFill = document.getElementById("summaryProgressFill");
  const service = document.getElementById("summaryService");
  const project = document.getElementById("summaryProject");
  const nextAction = document.getElementById("summaryNextAction");
  const revision = document.getElementById("summaryRevision");
  const startDate = document.getElementById("summaryStartDate");
  const delivery = document.getElementById("summaryDelivery");
  const plan = document.getElementById("summaryPlan");
  const paymentStatus = document.getElementById("summaryPaymentStatus");
  const paidAmount = document.getElementById("summaryPaidAmount");
  const totalAmount = document.getElementById("summaryTotalAmount");
  const rating = document.getElementById("summaryRating");
  const invoiceLink = document.getElementById("summaryInvoiceLink");

  if (avatar) avatar.textContent = initials(data.name);
  if (name) name.textContent = data.name || "Client";
  if (email) email.textContent = data.email || "";
  if (phaseBadge) phaseBadge.textContent = data.phase || "Discovery";
  if (statusBadge) {
    statusBadge.textContent = data.status || "Not started";
    statusBadge.className = "badge " + (
      data.status === "Completed" ? "active" :
      data.status === "Removed" ? "removed" :
      data.status === "Waiting for feedback" ? "progress" : ""
    );
  }
  if (vipBadge) vipBadge.hidden = !data.priority;

  // Quick-action header state: highlight the VIP button when the client
  // is already VIP, so the header itself communicates status at a glance.
  if (summaryVipToggleBtn) {
    summaryVipToggleBtn.classList.toggle("is-vip", !!data.priority);
    summaryVipToggleBtn.title = data.priority ? "Remove VIP" : "Mark as VIP";
  }

  const progress = Math.max(0, Math.min(100, Number(data.progress) || 0));
  if (progressText) progressText.textContent = `${progress}%`;
  if (progressFill) progressFill.style.width = `${progress}%`;

  if (service) service.textContent = data.service || "—";
  if (project) project.textContent = data.projectName || "—";
  if (nextAction) nextAction.textContent = data.nextAction || "—";
  if (revision) revision.textContent = data.revisionRound || "—";
  if (startDate) startDate.textContent = data.startDate || "—";
  if (delivery) delivery.textContent = data.estimatedDelivery || "—";

  if (plan) plan.textContent = data.planName || "—";
  if (paymentStatus) paymentStatus.textContent = data.paymentStatus || "Pending";
  if (paidAmount) paidAmount.textContent = `₹${(Number(data.paidAmount) || 0).toLocaleString("en-IN")}`;
  if (totalAmount) totalAmount.textContent = `₹${(Number(data.totalAmount) || 0).toLocaleString("en-IN")}`;

  if (invoiceLink) {
    if (data.invoiceLink) {
      invoiceLink.href = data.invoiceLink;
      invoiceLink.hidden = false;
    } else {
      invoiceLink.hidden = true;
      invoiceLink.removeAttribute("href");
    }
  }

  if (rating) {
    rating.textContent = Number(data.satisfaction) > 0
      ? `${starsHtml(data.satisfaction)} (${data.satisfaction}/5)`
      : "Not rated yet";
  }
}

function setEditFormOpen(open) {
  const editForm = document.getElementById("editorEditForm");
  const toggleBtn = document.getElementById("toggleEditFormBtn");
  if (editForm) editForm.classList.toggle("show", open);
  if (toggleBtn) toggleBtn.textContent = open ? "Hide full details ▴" : "Edit full details ▾";
}

document.getElementById("toggleEditFormBtn")?.addEventListener("click", () => {
  const editForm = document.getElementById("editorEditForm");
  setEditFormOpen(!editForm?.classList.contains("show"));
});

/* Summary quick actions — message this client, toggle VIP, copy email.
   These read the currently-open client id from clientIdInput at click
   time, so they always act on whichever client the drawer is showing. */
summaryMessageBtn?.addEventListener("click", () => {
  const id = clientIdInput?.value;
  if (!id) return;
  closeDrawer();
  switchTab("messages");
  openThread(id);
});

summaryCopyEmailBtn?.addEventListener("click", async () => {
  const email = emailInput?.value || "";
  if (!email) { showToast("No email on file for this client", "warn"); return; }
  try {
    await navigator.clipboard.writeText(email);
    showToast("Email copied", "good");
  } catch (err) {
    console.error(err);
    showToast("Couldn't copy email", "danger");
  }
});

summaryVipToggleBtn?.addEventListener("click", async () => {
  const id = clientIdInput?.value;
  if (!id) return;
  const client = clientsCache.find((c) => c.id === id);
  if (!client) return;
  try {
    await updateDoc(doc(db, "clients", id), { priority: !client.priority });
    showToast(!client.priority ? `${client.name} marked VIP` : `${client.name} removed from VIP`, "good");
    await loadClients();
    await openClientDrawer(id);
  } catch (err) {
    console.error(err);
    showToast("Couldn't update VIP status", "danger");
  }
});

function openNewClientDrawer() {
  resetDrawerForm();
  if (editorEyebrow) editorEyebrow.textContent = "New";
  if (editorClientTitle) editorClientTitle.textContent = "New Client";
  toggleClientActionButtons(false);

  const summaryPanel = document.getElementById("clientSummaryPanel");
  const toggleBtn = document.getElementById("toggleEditFormBtn");
  if (summaryPanel) summaryPanel.hidden = true;
  if (toggleBtn) toggleBtn.hidden = true;
  setEditFormOpen(true);

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
    if (referredByInput) referredByInput.value = data.referredBy || "";
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

    const summaryPanel = document.getElementById("clientSummaryPanel");
    const toggleBtn = document.getElementById("toggleEditFormBtn");
    if (summaryPanel) summaryPanel.hidden = false;
    if (toggleBtn) toggleBtn.hidden = false;
    renderClientSummary(data);
    setEditFormOpen(false);

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
    referredBy: referredByInput?.value || "",
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
  renderInvoicesTab();
  renderFiles();
  populateClientSelects();
  refreshBellDot();
  if (activeTab === "reports") renderReports();
  if (activeTab === "messages") renderConversations();
  if (activeTab === "leads") renderLeads();
  if (activeTab === "reviews") renderReviews();
  if (activeTab === "financeOverview") renderFinanceOverview();
  if (activeTab === "referrals") renderReferrals();
  if (activeTab === "profitability") renderProfitability();
  if (activeTab === "calendar") renderCalendar();
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
   FREEBIE DOWNLOADS + LOGINS ("Freebie Activity")
   Shows users who signed in on the public Freebie page and/or
   downloaded a mockup — logged from freebie.js into the
   "freebie_downloads" and "freebie_logins" collections, kept
   separate from the regular client list. Both feeds are merged
   into one chronological "activity" list, filterable by chips
   (All / Downloads / Logins).
============================================================ */
async function loadFreebieDownloads() {
  try {
    const q = query(collection(db, "freebie_downloads"), orderBy("createdAt", "desc"), limit(200));
    const snap = await getDocs(q);
    freebieDownloadsCache = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error(err);
    freebieDownloadsCache = [];
  }
  renderFreebieDownloads();
  if (activeTab === "websiteIntelligence") renderWebsiteIntel();
}

async function loadFreebieLogins() {
  try {
    const q = query(collection(db, "freebie_logins"), orderBy("createdAt", "desc"), limit(200));
    const snap = await getDocs(q);
    freebieLoginsCache = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error(err);
    freebieLoginsCache = [];
  }
  renderFreebieDownloads();
  if (activeTab === "websiteIntelligence") renderWebsiteIntel();
}

function combinedFreebieActivity() {
  const downloads = freebieDownloadsCache.map((r) => ({ ...r, _type: "download" }));
  const logins = freebieLoginsCache.map((r) => ({ ...r, _type: "login" }));
  return [...downloads, ...logins].sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
}

function renderFreebieDownloads() {
  if (!freebieDownloadsList) return;
  const term = (freebieDownloadsSearch?.value || "").trim().toLowerCase();

  let rows = combinedFreebieActivity();

  if (freebieActivityFilter !== "all") {
    rows = rows.filter((r) => r._type === freebieActivityFilter);
  }

  if (term) {
    rows = rows.filter((r) =>
      (r.name || "").toLowerCase().includes(term) ||
      (r.email || "").toLowerCase().includes(term) ||
      (r.freebieTitle || "").toLowerCase().includes(term) ||
      (r.freebieCategory || "").toLowerCase().includes(term)
    );
  }

  if (!rows.length) {
    freebieDownloadsList.innerHTML = `<div class="mini-empty">No freebie activity recorded yet.</div>`;
    return;
  }

  freebieDownloadsList.innerHTML = rows.map((r) => {
    const isLogin = r._type === "login";
    return `
    <div class="client-card" style="cursor:default;">
      <div class="client-card-top">
        <div class="client-identity">
          <div class="client-avatar">${initials(r.name)}</div>
          <div class="client-identity-text">
            <strong>${escapeHtml(r.name || "User")}</strong>
            <small>${escapeHtml(r.email || "")}</small>
          </div>
        </div>
        <span class="badge ${isLogin ? "new" : "active"}">${isLogin ? "Logged in" : escapeHtml(r.freebieCategory || "Freebie")}</span>
      </div>
      ${isLogin ? "" : `<small style="color:#cfcfcf;">Downloaded: ${escapeHtml(r.freebieTitle || "")}</small>`}
      <div class="client-card-foot">
        <span>${timeAgo(r.createdAt)}</span>
        ${!isLogin && r.downloadLink ? `<a href="${escapeHtml(r.downloadLink)}" target="_blank" rel="noopener">Open source →</a>` : ""}
      </div>
    </div>
  `;
  }).join("");
}

freebieDownloadsSearch?.addEventListener("input", renderFreebieDownloads);

freebieActivityChips?.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    freebieActivityChips.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active"));
    chip.classList.add("is-active");
    freebieActivityFilter = chip.dataset.activityFilter;
    renderFreebieDownloads();
  });
});

freebieDownloadsExportBtn?.addEventListener("click", () => {
  const rows = combinedFreebieActivity();
  const header = ["Type", "Name", "Email", "Freebie", "Category", "Recorded At"];
  const csvRows = rows.map((r) => [
    r._type, r.name, r.email, r.freebieTitle || "", r.freebieCategory || "", timeAgo(r.createdAt)
  ].map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(","));
  const csv = [header.join(","), ...csvRows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "tusdio-freebie-activity.csv";
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  showToast("CSV exported", "good");
});

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

   FIX: this previously sorted purely by `updatedAt || createdAt`, which
   only changes when the OWNER edits a client record in the drawer — it
   never reflected the client doing anything (messaging, logging in,
   downloading a file). So a client who messaged 5 minutes ago could sit
   below one the owner last edited a month ago, and the label "Recent
   client activity" was misleading. This now sorts by whichever signal is
   actually most recent (last owner<->message exchange first, since that's
   the most complete activity signal we have, falling back to record edits),
   and each row is labeled with WHICH signal it's showing so it's honest
   about what's being displayed.

   IMPORTANT CAVEAT: there is still no true "last logged in" timestamp in
   this schema — that has to be written by your client-side login code,
   which isn't part of this file. To get real login recency here, add this
   one line to wherever the client portal handles a successful login:
     updateDoc(doc(db, "clients", clientUid), { lastLoginAt: serverTimestamp() });
   Once that field exists, this function already checks for it below and
   will start using it automatically.
   ------------------------------------------------------------ */
function renderDashboardClientActivity() {
  if (!dashboardClientActivity) return;

  const withSignal = clientsCache.map((c) => {
    const candidates = [
      { ms: toMillis(c.lastLoginAt), label: "Logged in" },
      { ms: toMillis(c.lastOwnerMessageAt), label: "Messaged" },
      { ms: toMillis(c.updatedAt), label: "Updated" },
      { ms: toMillis(c.createdAt), label: "Created" }
    ].filter((s) => s.ms > 0).sort((a, b) => b.ms - a.ms);
    return { client: c, signal: candidates[0] || { ms: 0, label: "—" } };
  });

  const sorted = withSignal.sort((a, b) => b.signal.ms - a.signal.ms);

  if (!sorted.length) {
    dashboardClientActivity.innerHTML = `<div class="mini-empty">No client activity yet.</div>`;
    return;
  }

  dashboardClientActivity.innerHTML = sorted.slice(0, 8).map(({ client: c, signal }) => {
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
        <div class="client-date">${signal.ms ? `${escapeHtml(signal.label)} ${timeAgo(signal.ms)}` : "—"}</div>
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

  // Leads needing attention: brand-new leads, and leads whose next
  // follow-up date has already passed (best-effort date parse, since
  // nextFollowUpAt is stored as a free-text field like the rest of the
  // date fields on clients — matching that existing convention).
  const newLeadCount = leadsCache.filter((l) => l.status === "NEW").length;
  if (newLeadCount > 0) {
    items.push({ danger: false, title: `${newLeadCount} new lead${newLeadCount === 1 ? "" : "s"} to review`, meta: "Leads tab" });
  }
  leadsCache.forEach((l) => {
    if (["WON", "LOST"].includes(l.status)) return;
    const due = Date.parse(l.nextFollowUpAt || "");
    if (!Number.isNaN(due) && due < Date.now()) {
      items.push({ danger: true, title: `Follow-up overdue: ${l.name || l.company || "Lead"}`, meta: l.nextFollowUpAt || "" });
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

  // "All" and every other filter except the dedicated "Hidden" chip exclude
  // hidden clients — hiding a client is meant to take them out of the main
  // list entirely, with the Hidden chip as the only way back to them.
  let filtered = activeClientFilter === "hidden"
    ? clientsCache.filter((c) => c.hidden)
    : clientsCache.filter((c) => !c.hidden);

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
    clientsList.innerHTML = activeClientFilter === "hidden"
      ? `<div class="mini-empty">No hidden clients.</div>`
      : `<div class="mini-empty">No clients match this view.</div>`;
    return;
  }

  clientsList.innerHTML = filtered.map((c) => {
    const removed = c.access === "disabled";
    const progress = Number(c.progress) || 0;
    const vip = !!c.priority;
    const hidden = !!c.hidden;
    const checked = selectedClientIds.has(c.id);
    const hasRating = Number(c.satisfaction) > 0;
    return `
      <div class="client-card ${vip ? "is-vip" : ""} ${checked ? "is-selected" : ""} ${hidden ? "is-hidden" : ""}" data-client-id="${c.id}">
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
            <button class="hide-toggle-btn" data-hide-toggle="${c.id}" type="button" title="${hidden ? "Unhide from main list" : "Hide from main list"}">${hidden ? "🙈" : "👁️"}</button>
            ${!removed ? `<button class="msg-shortcut-btn" data-msg-client="${c.id}" type="button" title="Message ${escapeHtml(c.name)}">💬</button>` : ""}
            <span class="badge ${removed ? "removed" : "active"}">${removed ? "Removed" : "Active"}</span>
          </div>
        </div>
        <small>${escapeHtml(c.service || "No service")} • ${escapeHtml(c.phase || "Discovery")}${hidden ? " • Hidden" : ""}</small>
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
      if (e.target.closest("[data-vip-toggle]") || e.target.closest("[data-hide-toggle]") || e.target.closest("[data-select-id]") || e.target.closest("[data-msg-client]")) return;
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

  clientsList.querySelectorAll("[data-hide-toggle]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const id = btn.dataset.hideToggle;
      const client = clientsCache.find((c) => c.id === id);
      if (!client) return;
      try {
        await updateDoc(doc(db, "clients", id), { hidden: !client.hidden });
        await logActivity(`${!client.hidden ? "Hid" : "Unhid"} client ${client.name}`, "info", client.name);
        showToast(!client.hidden ? `${client.name} hidden from main list` : `${client.name} unhidden`, "good");
        await loadClients();
      } catch (err) {
        console.error(err);
        showToast("Couldn't update this client", "danger");
      }
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
    const phaseValue = inPhase.reduce((s, c) => s + (Number(c.totalAmount) || 0), 0);
    return `
      <div class="kanban-col">
        <div class="kanban-col-head">
          <span>${phase}</span>
          <span class="kanban-count">${inPhase.length}</span>
        </div>
        ${inPhase.length ? `<div class="kanban-col-value">₹${phaseValue.toLocaleString("en-IN")} in this phase</div>` : ""}
        ${inPhase.map((c) => {
          const progress = Number(c.progress) || 0;
          const payDot = c.paymentStatus === "Paid" ? "good" : c.paymentStatus === "Overdue" ? "danger" : c.paymentStatus === "Partially Paid" ? "warn" : "";
          const deliveryMs = Date.parse(c.estimatedDelivery || "");
          const overdue = !Number.isNaN(deliveryMs) && deliveryMs < Date.now() && c.status !== "Completed";
          return `
          <div class="kanban-card" data-client-id="${c.id}">
            <div class="project-card-top">
              <div class="client-avatar">${initials(c.name)}</div>
              <div class="project-card-name">
                <strong>${escapeHtml(c.name || "Client")}</strong>
                <small>${escapeHtml(c.projectName || c.service || "")}</small>
              </div>
              <span class="project-pay-dot ${payDot}" title="Payment: ${escapeHtml(c.paymentStatus || "Pending")}"></span>
            </div>
            <div class="client-progress-track"><div class="client-progress-fill" style="width:${progress}%;"></div></div>
            <div class="project-card-foot">
              <span>${progress}% complete</span>
              <span class="${overdue ? "deadline-overdue" : ""}">${c.estimatedDelivery ? escapeHtml(c.estimatedDelivery) : "No date set"}</span>
            </div>
          </div>
        `;
        }).join("") || `<div class="mini-empty">No clients in this phase.</div>`}
      </div>
    `;
  }).join("");

  kanbanBoard.querySelectorAll(".kanban-card").forEach((card) => {
    card.addEventListener("click", () => openClientDrawer(card.dataset.clientId));
  });
}

/* ============================================================
   LEADS (CRM PIPELINE)
   ----------------------------------------------------------------------------
   A new bounded context, kept entirely separate from `clients` per the
   architecture audit: a `leads` Firestore collection, its own drawer
   (#leadEditorDrawer, defined in owner.html), and a "Convert to Client"
   action that creates a real client doc and marks the lead WON — the point
   where a lead formally exits the pipeline and enters the existing client
   workflow (kanban, messages, invoices) untouched.
============================================================ */
let leadsCache = [];
let leadFilterStatus = "all";
let leadSearchTerm = "";
let leadViewMode = "list"; // "list" | "kanban"

const LEAD_STATUSES = ["NEW", "CONTACTED", "QUALIFIED", "MEETING", "PROPOSAL", "NEGOTIATION", "WON", "LOST"];
const LEAD_SOURCES = ["Instagram", "LinkedIn", "Cold Email", "Website", "Referral", "Behance", "Freebie", "Existing Client", "Other"];

/* Element refs — Leads tab */
const leadsBadge = document.getElementById("leadsBadge");
const leadsBadgeMobile = document.getElementById("leadsBadgeMobile");
const leadsKpiGrid = document.getElementById("leadsKpiGrid");
const leadSourceAnalytics = document.getElementById("leadSourceAnalytics");
const leadSearchInput = document.getElementById("leadSearch");
const leadFilterChips = document.getElementById("leadFilterChips");
const leadClientsHint = document.getElementById("leadClientsHint");
const leadsListView = document.getElementById("leadsListView");
const leadsKanbanView = document.getElementById("leadsKanbanView");
const leadsViewToggle = document.getElementById("leadsViewToggle");
const newLeadBtn = document.getElementById("newLeadBtn");

/* Element refs — Lead editor drawer */
const leadEditorOverlay = document.getElementById("leadEditorOverlay");
const leadEditorDrawer = document.getElementById("leadEditorDrawer");
const leadEditorCloseBtn = document.getElementById("leadEditorCloseBtn");
const leadEditorEyebrow = document.getElementById("leadEditorEyebrow");
const leadEditorTitle = document.getElementById("leadEditorTitle");
const leadForm = document.getElementById("leadForm");
const leadSaveMessage = document.getElementById("leadSaveMessage");
const leadConvertedHint = document.getElementById("leadConvertedHint");

const leadIdInput = document.getElementById("leadId");
const leadNameInput = document.getElementById("leadName");
const leadCompanyInput = document.getElementById("leadCompany");
const leadEmailInput = document.getElementById("leadEmail");
const leadPhoneInput = document.getElementById("leadPhone");
const leadWebsiteInput = document.getElementById("leadWebsite");
const leadInstagramInput = document.getElementById("leadInstagram");
const leadLinkedinInput = document.getElementById("leadLinkedin");
const leadIndustryInput = document.getElementById("leadIndustry");
const leadServiceInput = document.getElementById("leadService");
const leadValueInput = document.getElementById("leadValue");
const leadProbabilityInput = document.getElementById("leadProbability");
const leadCloseDateInput = document.getElementById("leadCloseDate");
const leadSourceInput = document.getElementById("leadSource");
const leadStatusInput = document.getElementById("leadStatus");
const leadAssignedToInput = document.getElementById("leadAssignedTo");
const leadReferredByInput = document.getElementById("leadReferredBy");
const leadLastContactInput = document.getElementById("leadLastContact");
const leadNextFollowUpInput = document.getElementById("leadNextFollowUp");
const leadNotesInput = document.getElementById("leadNotes");
const leadTagsInput = document.getElementById("leadTags");

const convertLeadBtn = document.getElementById("convertLeadBtn");
const markLeadLostBtn = document.getElementById("markLeadLostBtn");
const deleteLeadBtn = document.getElementById("deleteLeadBtn");

async function loadLeads() {
  try {
    const snap = await getDocs(collection(db, "leads"));
    leadsCache = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error(err);
    leadsCache = [];
  }
  updateLeadsBadge();
  if (activeTab === "leads") renderLeads();
  if (activeTab === "followups") renderFollowUps();
  if (activeTab === "leadSources") renderLeadSourceAnalytics();
  if (activeTab === "overview") renderAttention(clientsCache.filter((c) => c.access !== "disabled"));
}

function updateLeadsBadge() {
  const count = leadsCache.filter((l) => l.status === "NEW").length;
  if (leadsBadge) { leadsBadge.textContent = count; leadsBadge.hidden = count === 0; }
  if (leadsBadgeMobile) { leadsBadgeMobile.textContent = count; leadsBadgeMobile.hidden = count === 0; }
}

function leadStatusClass(status) {
  return "lead-" + (status || "new").toLowerCase();
}

function filteredLeads() {
  let list = leadsCache;
  if (leadFilterStatus !== "all") list = list.filter((l) => (l.status || "NEW") === leadFilterStatus);
  const term = leadSearchTerm.trim().toLowerCase();
  if (term) {
    list = list.filter((l) =>
      (l.name || "").toLowerCase().includes(term) ||
      (l.company || "").toLowerCase().includes(term) ||
      (l.email || "").toLowerCase().includes(term)
    );
  }
  return [...list].sort((a, b) => toMillis(b.updatedAt || b.createdAt) - toMillis(a.updatedAt || a.createdAt));
}

/* Master render for the Leads tab — KPIs, source analytics, then whichever
   of the list/kanban views is active. Called on tab switch and after every
   load/save/delete/convert so the tab never shows stale data. */
function renderLeads() {
  const showingClients = leadFilterStatus === "CLIENTS";
  if (leadClientsHint) leadClientsHint.hidden = !showingClients;
  // Kanban view doesn't make sense for the raw client list (clients aren't
  // staged by pipeline status), so force list view while this filter is active.
  if (leadsViewToggle) leadsViewToggle.disabled = showingClients;

  renderLeadsKpis();
  renderLeadSourceAnalytics();
  if (leadsListView) leadsListView.hidden = (leadViewMode !== "list" && !showingClients);
  if (leadsKanbanView) leadsKanbanView.hidden = (leadViewMode !== "kanban" || showingClients);
  if (showingClients) renderLeadsClientsView();
  else if (leadViewMode === "kanban") renderLeadsKanbanView();
  else renderLeadsListView();
}

/* Shows real client records inline in the Leads tab so the owner can jump
   straight from the pipeline into an already-won client and adjust it,
   without a separate collection or duplicated data — these are the exact
   same client-card click handlers used on the Clients tab. */
function renderLeadsClientsView() {
  if (!leadsListView) return;
  const term = leadSearchTerm.trim().toLowerCase();
  let list = clientsCache.filter((c) => !c.hidden);
  if (term) {
    list = list.filter((c) =>
      (c.name || "").toLowerCase().includes(term) ||
      (c.email || "").toLowerCase().includes(term) ||
      (c.service || "").toLowerCase().includes(term)
    );
  }
  list = [...list].sort((a, b) => toMillis(b.updatedAt || b.createdAt) - toMillis(a.updatedAt || a.createdAt));

  if (!list.length) {
    leadsListView.innerHTML = `<div class="mini-empty">No clients yet.</div>`;
    return;
  }

  leadsListView.innerHTML = list.map((c) => {
    const removed = c.access === "disabled";
    return `
      <div class="client-card" data-client-id="${c.id}">
        <div class="client-card-top">
          <div class="client-identity">
            <div class="client-avatar">${initials(c.name)}</div>
            <div class="client-identity-text">
              <strong>${escapeHtml(c.name || "Client")}</strong>
              <small>${escapeHtml(c.email || "")}</small>
            </div>
          </div>
          <span class="badge ${removed ? "removed" : "active"}">${removed ? "Removed" : "Active"}</span>
        </div>
        <small>${escapeHtml(c.service || "No service")} • ${escapeHtml(c.phase || "Discovery")}</small>
        <div class="client-card-foot">
          <span>${Number(c.progress) || 0}% complete</span>
          <span>₹${(Number(c.paidAmount) || 0).toLocaleString("en-IN")} paid</span>
        </div>
      </div>
    `;
  }).join("");

  leadsListView.querySelectorAll("[data-client-id]").forEach((card) => {
    card.addEventListener("click", () => openClientDrawer(card.dataset.clientId));
  });
}

function renderLeadsKpis() {
  if (!leadsKpiGrid) return;
  const open = leadsCache.filter((l) => !["WON", "LOST"].includes(l.status));
  const pipelineValue = open.reduce((s, l) => s + (Number(l.estimatedValue) || 0), 0);
  const weightedPipeline = open.reduce((s, l) => s + ((Number(l.estimatedValue) || 0) * (Number(l.probability) || 0) / 100), 0);

  const now = new Date();
  const leadsThisMonth = leadsCache.filter((l) => {
    const ms = toMillis(l.createdAt);
    if (!ms) return false;
    const d = new Date(ms);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  const wonCount = leadsCache.filter((l) => l.status === "WON").length;
  const closedCount = leadsCache.filter((l) => ["WON", "LOST"].includes(l.status)).length;
  const conversionRate = closedCount ? Math.round((wonCount / closedCount) * 100) : 0;

  leadsKpiGrid.innerHTML = [
    kpiCard("Pipeline Value", `₹${pipelineValue.toLocaleString("en-IN")}`, `${open.length} open lead${open.length === 1 ? "" : "s"}`),
    kpiCard("Weighted Pipeline", `₹${Math.round(weightedPipeline).toLocaleString("en-IN")}`, "Value × probability"),
    kpiCard("Leads This Month", leadsThisMonth, `${leadsCache.length} total leads`),
    kpiCard("Conversion Rate", `${conversionRate}%`, `${wonCount} won of ${closedCount} closed`)
  ].join("");
}

function renderLeadSourceAnalytics() {
  // Written into both the compact card on Leads/CRM (#leadSourceAnalytics)
  // and the full-width Growth > Lead Sources view (#leadSourceAnalyticsGrowth)
  // so the two never drift out of sync — same numbers, two places to see them.
  const targets = [leadSourceAnalytics, document.getElementById("leadSourceAnalyticsGrowth")].filter(Boolean);
  if (!targets.length) return;
  const sourcesInUse = [...new Set([...LEAD_SOURCES, ...leadsCache.map((l) => l.leadSource).filter(Boolean)])];

  const rows = sourcesInUse.map((source) => {
    const leads = leadsCache.filter((l) => (l.leadSource || "Other") === source);
    if (!leads.length) return null;
    const qualified = leads.filter((l) => ["QUALIFIED", "MEETING", "PROPOSAL", "NEGOTIATION", "WON"].includes(l.status)).length;
    const meetings = leads.filter((l) => ["MEETING", "PROPOSAL", "NEGOTIATION", "WON"].includes(l.status)).length;
    const won = leads.filter((l) => l.status === "WON");
    const revenue = won.reduce((s, l) => {
      const client = l.convertedClientId ? clientsCache.find((c) => c.id === l.convertedClientId) : null;
      return s + (client ? (Number(client.paidAmount) || Number(client.totalAmount) || 0) : (Number(l.estimatedValue) || 0));
    }, 0);
    const conversionRate = leads.length ? Math.round((won.length / leads.length) * 100) : 0;
    return { source, count: leads.length, qualified, meetings, won: won.length, revenue, conversionRate };
  }).filter(Boolean).sort((a, b) => b.revenue - a.revenue || b.count - a.count);

  const html = rows.length
    ? rows.map((r) => `
      <div class="lead-source-card">
        <div class="lead-source-card-top">
          <strong>${escapeHtml(r.source)}</strong>
          <span>${r.conversionRate}% conversion</span>
        </div>
        <div class="lead-source-metrics">
          <span><b>${r.count}</b> leads</span>
          <span><b>${r.qualified}</b> qualified</span>
          <span><b>${r.meetings}</b> meetings</span>
          <span><b>${r.won}</b> won</span>
          <span><b>₹${r.revenue.toLocaleString("en-IN")}</b> revenue</span>
        </div>
      </div>
    `).join("")
    : `<div class="lead-source-empty">No leads yet — add your first one to see source performance here.</div>`;

  targets.forEach((t) => { t.innerHTML = html; });
}

/* ------------------------------------------------------------
   FOLLOW-UPS (Sales group) — groups open leads by nextFollowUpAt into
   Overdue / Today / Upcoming. Built entirely from the existing leads
   collection; there's no separate followups collection yet (see the
   architecture notes), so this stays a computed view rather than its own
   data source, and only covers leads — client-side follow-ups aren't
   tracked anywhere in the schema yet.
   ------------------------------------------------------------ */
const followupsBoard = document.getElementById("followupsBoard");
const followupsNewLeadBtn = document.getElementById("followupsNewLeadBtn");
const followupsScheduleClientBtn = document.getElementById("followupsScheduleClientBtn");
const followupsClientFormCard = document.getElementById("followupsClientFormCard");
const followupsClientForm = document.getElementById("followupsClientForm");
const followupsClientSelect = document.getElementById("followupsClientSelect");
const followupsClientDate = document.getElementById("followupsClientDate");
const followupsClientNote = document.getElementById("followupsClientNote");
const followupsClientMessage = document.getElementById("followupsClientMessage");

followupsNewLeadBtn?.addEventListener("click", openNewLeadDrawer);

followupsScheduleClientBtn?.addEventListener("click", () => {
  if (!followupsClientFormCard) return;
  const opening = followupsClientFormCard.hidden;
  followupsClientFormCard.hidden = !opening;
  if (opening) {
    const active = clientsCache.filter((c) => c.access !== "disabled");
    if (followupsClientSelect) {
      followupsClientSelect.innerHTML = active.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("") || `<option disabled>No active clients</option>`;
    }
  }
});

followupsClientForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const clientId = followupsClientSelect?.value;
  const client = clientsCache.find((c) => c.id === clientId);
  if (!client) { if (followupsClientMessage) followupsClientMessage.textContent = "Select a client first."; return; }
  try {
    await updateDoc(doc(db, "clients", clientId), {
      nextFollowUpAt: followupsClientDate?.value.trim() || "",
      followUpNote: followupsClientNote?.value.trim() || "",
      updatedAt: new Date().toISOString()
    });
    await logActivity(`Scheduled a follow-up with ${client.name}`, "info", client.name);
    showToast(`Follow-up scheduled with ${client.name}`, "good");
    followupsClientForm.reset();
    if (followupsClientMessage) followupsClientMessage.textContent = "Scheduled.";
    if (followupsClientFormCard) followupsClientFormCard.hidden = true;
    await loadClients();
    renderFollowUps();
  } catch (err) {
    console.error(err);
    if (followupsClientMessage) followupsClientMessage.textContent = "Couldn't schedule this.";
    showToast("Couldn't schedule this follow-up", "danger");
  }
});

function followupSection(title, dotClass, list) {
  return `
    <div class="card glass">
      <div class="card-head"><h3>${escapeHtml(title)} <span class="kanban-count">${list.length}</span></h3></div>
      <div class="mini-list">
        ${list.length ? list.map((item) => `
          <div class="mini-item" data-followup-open="${item.kind}:${item.id}" style="cursor:pointer; align-items:center;">
            <span class="mini-dot ${dotClass}"></span>
            <div class="mini-body">
              <div class="mini-title">${escapeHtml(item.name)} <span class="lead-tag" style="margin-left:4px;">${item.kind === "client" ? "Client" : "Lead"}</span></div>
              <div class="mini-meta">${escapeHtml(item.date || "No date set")}${item.meta ? ` • ${escapeHtml(item.meta)}` : ""}</div>
            </div>
            ${item.date ? `<button class="link-btn" data-followup-complete="${item.kind}:${item.id}" type="button">Mark done</button>` : ""}
          </div>
        `).join("") : `<div class="mini-empty">Nothing here.</div>`}
      </div>
    </div>
  `;
}

/* FIX: previously this only looked at leads WITH a nextFollowUpAt date, so
   a freshly created lead with no date yet simply never appeared anywhere
   in this tab — nothing was actually broken, but "created it and it just
   vanished" is a real bug from the owner's point of view. Leads with no
   date now get their own "No Date Set" bucket instead of disappearing, and
   existing clients (via the new "Schedule Client Follow-up" button above)
   are merged in alongside leads, tagged so you can tell them apart. */
function renderFollowUps() {
  if (!followupsBoard) return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const openLeads = leadsCache.filter((l) => !["WON", "LOST"].includes(l.status))
    .map((l) => ({ kind: "lead", id: l.id, name: l.name || l.company || "Lead", date: l.nextFollowUpAt || "", meta: l.leadSource || "" }));
  const followupClients = clientsCache.filter((c) => c.access !== "disabled" && c.nextFollowUpAt)
    .map((c) => ({ kind: "client", id: c.id, name: c.name, date: c.nextFollowUpAt, meta: c.followUpNote || "" }));

  const all = [...openLeads, ...followupClients];
  const groups = { overdue: [], today: [], upcoming: [], noDate: [] };

  all.forEach((item) => {
    if (!item.date) { groups.noDate.push(item); return; }
    const parsed = Date.parse(item.date);
    if (Number.isNaN(parsed)) { groups.upcoming.push(item); return; }
    const d = new Date(parsed);
    d.setHours(0, 0, 0, 0);
    if (d < today) groups.overdue.push(item);
    else if (d.getTime() === today.getTime()) groups.today.push(item);
    else groups.upcoming.push(item);
  });

  [groups.overdue, groups.today, groups.upcoming].forEach((list) =>
    list.sort((a, b) => Date.parse(a.date || "") - Date.parse(b.date || ""))
  );

  followupsBoard.innerHTML =
    followupSection("Overdue", "danger", groups.overdue) +
    followupSection("Today", "warn", groups.today) +
    followupSection("Upcoming", "", groups.upcoming) +
    followupSection("No Date Set", "", groups.noDate);

  followupsBoard.querySelectorAll("[data-followup-open]").forEach((el) => {
    el.addEventListener("click", (e) => {
      if (e.target.closest("[data-followup-complete]")) return;
      const [kind, id] = el.dataset.followupOpen.split(":");
      if (kind === "client") { switchTab("clients"); openClientDrawer(id); }
      else { switchTab("leads"); openLeadDrawer(id); }
    });
  });

  followupsBoard.querySelectorAll("[data-followup-complete]").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const [kind, id] = btn.dataset.followupComplete.split(":");
      try {
        if (kind === "client") {
          const client = clientsCache.find((c) => c.id === id);
          await updateDoc(doc(db, "clients", id), { nextFollowUpAt: "", followUpNote: "", updatedAt: new Date().toISOString() });
          await logActivity(`Follow-up completed: ${client?.name || "client"}`, "good");
          await loadClients();
        } else {
          const lead = leadsCache.find((l) => l.id === id);
          await updateDoc(doc(db, "leads", id), {
            nextFollowUpAt: "",
            lastContactAt: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
            updatedAt: new Date().toISOString()
          });
          await logActivity(`Follow-up completed: ${lead?.name || "lead"}`, "good");
          await loadLeads();
        }
        showToast("Follow-up marked complete", "good");
        renderFollowUps();
      } catch (err) {
        console.error(err);
        showToast("Couldn't update this follow-up", "danger");
      }
    });
  });
}

/* ------------------------------------------------------------
   REVIEWS (Clients group) — aggregates client.currentReview and
   client.satisfaction, both of which already exist on the client doc.
   No new collection; a publish/permission-tracked testimonial library
   is on the roadmap, not built here.
   ------------------------------------------------------------ */
const reviewsList = document.getElementById("reviewsList");

function renderReviews() {
  if (!reviewsList) return;
  const rows = clientsCache.filter((c) => getClientReview(c)?.title || Number(c.satisfaction) > 0);

  if (!rows.length) {
    reviewsList.innerHTML = `<div class="mini-empty">No reviews or ratings yet.</div>`;
    return;
  }

  reviewsList.innerHTML = rows.map((c) => {
    const review = getClientReview(c) || {};
    const hasRating = Number(c.satisfaction) > 0;
    return `
      <div class="client-card" data-client-id="${escapeHtml(c.id)}">
        <div class="client-card-top">
          <div class="client-identity">
            <div class="client-avatar">${initials(c.name)}</div>
            <div class="client-identity-text">
              <strong>${escapeHtml(c.name || "Client")}</strong>
              <small>${escapeHtml(c.projectName || c.service || "")}</small>
            </div>
          </div>
          ${hasRating ? `<span class="badge active">${c.satisfaction}/5</span>` : ""}
        </div>
        ${review.title ? `<small style="color:#cfcfcf;">${escapeHtml(review.title)} — ${escapeHtml(reviewStatusLabel(review.status))}</small>` : `<small>No review posted yet</small>`}
        ${hasRating ? `<div class="client-card-foot"><span style="color:#ffc454;">${starsHtml(c.satisfaction)}</span></div>` : ""}
      </div>
    `;
  }).join("");

  reviewsList.querySelectorAll("[data-client-id]").forEach((el) => {
    el.addEventListener("click", () => openClientDrawer(el.dataset.clientId));
  });
}

/* ------------------------------------------------------------
   FINANCE OVERVIEW (Finance group) — the same client.totalAmount /
   paidAmount math already used for the command-center KPIs, reframed as a
   Finance-first view. Intentionally does not show Payments/Expenses/
   Profitability numbers — there's no transactions or expenses collection
   behind those yet (see the architecture notes), and fabricating figures
   for them would be worse than leaving those nav items marked "Soon".
   ------------------------------------------------------------ */
const financeKpiGrid = document.getElementById("financeKpiGrid");

function renderFinanceOverview() {
  if (!financeKpiGrid) return;
  const totalRevenue = clientsCache.reduce((s, c) => s + (Number(c.totalAmount) || 0), 0);
  const collected = clientsCache.reduce((s, c) => s + (Number(c.paidAmount) || 0), 0);
  const outstanding = Math.max(0, totalRevenue - collected);
  const overdue = clientsCache
    .filter((c) => c.paymentStatus === "Overdue")
    .reduce((s, c) => s + Math.max(0, (Number(c.totalAmount) || 0) - (Number(c.paidAmount) || 0)), 0);

  financeKpiGrid.innerHTML = [
    kpiCard("Contract Value", `₹${totalRevenue.toLocaleString("en-IN")}`, "Across all clients"),
    kpiCard("Collected", `₹${collected.toLocaleString("en-IN")}`, totalRevenue ? `${Math.round((collected / totalRevenue) * 100)}% of contract value` : "No billable clients yet", "good"),
    kpiCard("Outstanding", `₹${outstanding.toLocaleString("en-IN")}`, "Invoiced, not yet paid"),
    kpiCard("Overdue", `₹${overdue.toLocaleString("en-IN")}`, "Needs follow-up", overdue > 0 ? "warn" : "good")
  ].join("");
}

function renderLeadsListView() {
  if (!leadsListView) return;
  const list = filteredLeads();
  if (!list.length) {
    leadsListView.innerHTML = `<div class="mini-empty">No leads match this view.</div>`;
    return;
  }

  leadsListView.innerHTML = list.map((l) => {
    const tags = (l.tags || []);
    return `
      <div class="client-card" data-lead-id="${l.id}">
        <div class="client-card-top">
          <div class="client-identity">
            <div class="client-avatar">${initials(l.name || l.company)}</div>
            <div class="client-identity-text">
              <strong>${escapeHtml(l.name || "Unnamed lead")}</strong>
              <small>${escapeHtml(l.company || l.email || "")}</small>
            </div>
          </div>
          <span class="badge ${leadStatusClass(l.status)}">${escapeHtml(l.status || "NEW")}</span>
        </div>
        <small>${escapeHtml(l.serviceInterested || "No service noted")} • ${escapeHtml(l.leadSource || "Unknown source")}</small>
        <div class="lead-card-value-row">
          <span>Est. value</span>
          <strong>₹${(Number(l.estimatedValue) || 0).toLocaleString("en-IN")}${l.probability ? ` · ${l.probability}%` : ""}</strong>
        </div>
        ${tags.length ? `<div class="lead-card-tags">${tags.map((t) => `<span class="lead-tag">${escapeHtml(t)}</span>`).join("")}</div>` : ""}
        <div class="client-card-foot">
          <span>${l.nextFollowUpAt ? `Follow up ${escapeHtml(l.nextFollowUpAt)}` : "No follow-up set"}</span>
          <span>${escapeHtml(l.assignedTo || "")}</span>
        </div>
      </div>
    `;
  }).join("");

  leadsListView.querySelectorAll("[data-lead-id]").forEach((card) => {
    card.addEventListener("click", () => openLeadDrawer(card.dataset.leadId));
  });
}

function renderLeadsKanbanView() {
  if (!leadsKanbanView) return;
  const list = filteredLeads();

  leadsKanbanView.innerHTML = LEAD_STATUSES.map((status) => {
    const inStatus = list.filter((l) => (l.status || "NEW") === status);
    const value = inStatus.reduce((s, l) => s + (Number(l.estimatedValue) || 0), 0);
    return `
      <div class="kanban-col">
        <div class="kanban-col-head">
          <span>${status}</span>
          <span class="kanban-count">${inStatus.length}</span>
        </div>
        ${inStatus.length ? `<div class="mini-meta" style="padding:0 4px;">₹${value.toLocaleString("en-IN")}</div>` : ""}
        ${inStatus.map((l) => `
          <div class="kanban-card" data-lead-id="${l.id}">
            <strong>${escapeHtml(l.name || l.company || "Lead")}</strong>
            <span>${escapeHtml(l.company || l.serviceInterested || "")} • ₹${(Number(l.estimatedValue) || 0).toLocaleString("en-IN")}</span>
          </div>
        `).join("") || `<div class="mini-empty">No leads here.</div>`}
      </div>
    `;
  }).join("");

  leadsKanbanView.querySelectorAll("[data-lead-id]").forEach((card) => {
    card.addEventListener("click", () => openLeadDrawer(card.dataset.leadId));
  });
}

leadSearchInput?.addEventListener("input", () => {
  leadSearchTerm = leadSearchInput.value || "";
  renderLeads();
});

leadFilterChips?.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    leadFilterChips.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active"));
    chip.classList.add("is-active");
    leadFilterStatus = chip.dataset.leadFilter;
    renderLeads();
  });
});

leadsViewToggle?.addEventListener("click", () => {
  leadViewMode = leadViewMode === "list" ? "kanban" : "list";
  leadsViewToggle.textContent = leadViewMode === "list" ? "Kanban view" : "List view";
  renderLeads();
});

/* ------------------------------------------------------------
   LEAD DRAWER
   ------------------------------------------------------------ */
function openLeadEditorPanel() {
  leadEditorOverlay?.classList.add("show");
  leadEditorDrawer?.classList.add("show");
}
function closeLeadDrawer() {
  leadEditorOverlay?.classList.remove("show");
  leadEditorDrawer?.classList.remove("show");
}
leadEditorCloseBtn?.addEventListener("click", closeLeadDrawer);
leadEditorOverlay?.addEventListener("click", closeLeadDrawer);

function setLeadMessage(text) {
  if (leadSaveMessage) leadSaveMessage.textContent = text;
}

function resetLeadForm() {
  leadForm?.reset();
  if (leadIdInput) leadIdInput.value = "";
  if (leadSourceInput) leadSourceInput.value = "Website";
  if (leadStatusInput) leadStatusInput.value = "NEW";
  if (leadValueInput) leadValueInput.value = "";
  if (leadProbabilityInput) leadProbabilityInput.value = "";
  if (leadConvertedHint) leadConvertedHint.hidden = true;
  setLeadMessage("");
}

function toggleLeadActionButtons(showExisting) {
  [convertLeadBtn, markLeadLostBtn, deleteLeadBtn].forEach((btn) => {
    if (btn) btn.style.display = showExisting ? "" : "none";
  });
}

function openNewLeadDrawer() {
  resetLeadForm();
  if (leadEditorEyebrow) leadEditorEyebrow.textContent = "New";
  if (leadEditorTitle) leadEditorTitle.textContent = "New Lead";
  toggleLeadActionButtons(false);
  openLeadEditorPanel();
}

async function openLeadDrawer(id) {
  try {
    const snap = await getDoc(doc(db, "leads", id));
    if (!snap.exists()) { setLeadMessage("Lead record not found."); return; }
    const data = snap.data();

    if (leadIdInput) leadIdInput.value = id;
    if (leadNameInput) leadNameInput.value = data.name || "";
    if (leadCompanyInput) leadCompanyInput.value = data.company || "";
    if (leadEmailInput) leadEmailInput.value = data.email || "";
    if (leadPhoneInput) leadPhoneInput.value = data.phone || "";
    if (leadWebsiteInput) leadWebsiteInput.value = data.website || "";
    if (leadInstagramInput) leadInstagramInput.value = data.instagram || "";
    if (leadLinkedinInput) leadLinkedinInput.value = data.linkedin || "";
    if (leadIndustryInput) leadIndustryInput.value = data.industry || "";
    if (leadServiceInput) leadServiceInput.value = data.serviceInterested || "";
    if (leadValueInput) leadValueInput.value = data.estimatedValue || "";
    if (leadProbabilityInput) leadProbabilityInput.value = data.probability || "";
    if (leadCloseDateInput) leadCloseDateInput.value = data.expectedCloseDate || "";
    if (leadSourceInput) leadSourceInput.value = data.leadSource || "Other";
    if (leadStatusInput) leadStatusInput.value = data.status || "NEW";
    if (leadAssignedToInput) leadAssignedToInput.value = data.assignedTo || "";
    if (leadReferredByInput) leadReferredByInput.value = data.referredBy || "";
    if (leadLastContactInput) leadLastContactInput.value = data.lastContactAt || "";
    if (leadNextFollowUpInput) leadNextFollowUpInput.value = data.nextFollowUpAt || "";
    if (leadNotesInput) leadNotesInput.value = data.notes || "";
    if (leadTagsInput) leadTagsInput.value = (data.tags || []).join(", ");

    if (leadEditorEyebrow) leadEditorEyebrow.textContent = data.status === "WON" ? "Won" : data.status === "LOST" ? "Lost" : "Editing";
    if (leadEditorTitle) leadEditorTitle.textContent = data.name || data.company || "Lead";
    toggleLeadActionButtons(true);
    if (convertLeadBtn) convertLeadBtn.style.display = data.status === "WON" ? "none" : "";
    if (leadConvertedHint) leadConvertedHint.hidden = !data.convertedClientId;
    setLeadMessage("");

    openLeadEditorPanel();
  } catch (err) {
    console.error(err);
    setLeadMessage("Failed to load lead details.");
  }
}

newLeadBtn?.addEventListener("click", openNewLeadDrawer);

leadForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  setLeadMessage("Saving...");

  const payload = {
    name: leadNameInput?.value.trim() || "",
    company: leadCompanyInput?.value.trim() || "",
    email: leadEmailInput?.value.trim().toLowerCase() || "",
    phone: leadPhoneInput?.value.trim() || "",
    website: leadWebsiteInput?.value.trim() || "",
    instagram: leadInstagramInput?.value.trim() || "",
    linkedin: leadLinkedinInput?.value.trim() || "",
    industry: leadIndustryInput?.value.trim() || "",
    serviceInterested: leadServiceInput?.value.trim() || "",
    estimatedValue: Number(leadValueInput?.value) || 0,
    probability: Math.max(0, Math.min(100, Number(leadProbabilityInput?.value) || 0)),
    expectedCloseDate: leadCloseDateInput?.value.trim() || "",
    leadSource: leadSourceInput?.value || "Other",
    status: leadStatusInput?.value || "NEW",
    assignedTo: leadAssignedToInput?.value.trim() || "",
    referredBy: leadReferredByInput?.value || "",
    lastContactAt: leadLastContactInput?.value.trim() || "",
    nextFollowUpAt: leadNextFollowUpInput?.value.trim() || "",
    notes: leadNotesInput?.value.trim() || "",
    tags: (leadTagsInput?.value || "").split(",").map((t) => t.trim()).filter(Boolean)
  };

  if (!payload.name) {
    setLeadMessage("Name is required.");
    return;
  }

  const existingId = leadIdInput?.value;

  try {
    if (existingId) {
      await updateDoc(doc(db, "leads", existingId), { ...payload, updatedAt: new Date().toISOString() });
      await logActivity(`Updated lead ${payload.name}`, "info", payload.name);
      setLeadMessage("Changes saved successfully.");
      showToast(`${payload.name} updated`, "good");
    } else {
      const newDoc = await addDoc(collection(db, "leads"), {
        ...payload,
        convertedClientId: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      await logActivity(`New lead added: ${payload.name}`, "good", payload.name);
      if (leadIdInput) leadIdInput.value = newDoc.id;
      toggleLeadActionButtons(true);
      setLeadMessage("Lead created successfully.");
      showToast(`${payload.name} added as a new lead`, "good");
    }
    await loadLeads();
  } catch (err) {
    console.error(err);
    setLeadMessage(err.message);
    showToast("Something went wrong saving this lead.", "danger");
  }
});

markLeadLostBtn?.addEventListener("click", async () => {
  const id = leadIdInput?.value;
  if (!id) return;
  if (!confirm("Mark this lead as lost?")) return;
  try {
    await updateDoc(doc(db, "leads", id), { status: "LOST", updatedAt: new Date().toISOString() });
    await logActivity(`Marked lead lost: ${leadNameInput?.value || "lead"}`, "danger");
    showToast("Lead marked lost", "warn");
    await loadLeads();
    await openLeadDrawer(id);
  } catch (err) {
    console.error(err);
    showToast("Couldn't update this lead", "danger");
  }
});

deleteLeadBtn?.addEventListener("click", async () => {
  const id = leadIdInput?.value;
  if (!id) return;
  if (!confirm("Permanently delete this lead? This cannot be undone.")) return;
  try {
    const leadName = leadNameInput?.value || "lead";
    await deleteDoc(doc(db, "leads", id));
    await logActivity(`Deleted lead ${leadName} permanently`, "danger");
    showToast(`${leadName} deleted`, "danger");
    closeLeadDrawer();
    await loadLeads();
  } catch (err) {
    console.error(err);
    showToast("Couldn't delete this lead", "danger");
  }
});

/* Convert to Client — the hand-off point from the pipeline into the
   existing, working client workflow. Creates a real `clients` doc (or
   reuses one if a client with this email already exists, so re-converting
   never creates a duplicate), marks the lead WON, and opens the new
   client record so the owner can fill in project details immediately. */
convertLeadBtn?.addEventListener("click", async () => {
  const id = leadIdInput?.value;
  if (!id) return;

  const leadEmail = (leadEmailInput?.value || "").trim().toLowerCase();
  const leadName = leadNameInput?.value.trim() || "Unnamed lead";

  if (!leadEmail) {
    setLeadMessage("Add an email address before converting this lead to a client.");
    showToast("A lead needs an email to become a client", "warn");
    return;
  }

  if (!confirm(`Convert "${leadName}" into a client? This creates a new client record.`)) return;

  try {
    const existingClient = resolveClientByEmail(leadEmail);
    let clientId = existingClient?.id;

    if (!existingClient) {
      clientId = makeDocId(leadEmail);
      await setDoc(doc(db, "clients", clientId), {
        name: leadName,
        email: leadEmail,
        service: leadServiceInput?.value.trim() || "",
        projectName: leadCompanyInput?.value.trim() || "",
        phase: "Discovery",
        status: "Not started",
        nextAction: "Kick off discovery call",
        progress: 0,
        access: "active",
        loginType: "Manual / Pending Signup",
        createdByOwner: true,
        priority: false,
        planName: "",
        paymentStatus: "Pending",
        totalAmount: Number(leadValueInput?.value) || 0,
        paidAmount: 0,
        decisions: [],
        updates: [],
        notifications: [`Welcome to TUSDIO, ${leadName}! Your project is now underway.`],
        tasks: [],
        files: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }

    await updateDoc(doc(db, "leads", id), {
      status: "WON",
      convertedClientId: clientId,
      updatedAt: new Date().toISOString()
    });

    await logActivity(`Converted lead ${leadName} to a client`, "good", leadName);
    showToast(`${leadName} converted to a client`, "good");

    await Promise.all([loadLeads(), loadClients()]);
    closeLeadDrawer();
    switchTab("clients");
    await openClientDrawer(clientId);
  } catch (err) {
    console.error(err);
    setLeadMessage("Couldn't convert this lead. " + (err.message || ""));
    showToast("Conversion failed", "danger");
  }
});

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

  const term = requestSearchTerm.trim().toLowerCase();
  let rows = requestFilterStatus === "all" ? requestsCache : requestsCache.filter((r) => (r.status || "New") === requestFilterStatus);
  if (term) {
    rows = rows.filter((r) =>
      (r.clientName || "").toLowerCase().includes(term) ||
      (r.subject || "").toLowerCase().includes(term) ||
      (r.type || "").toLowerCase().includes(term)
    );
  }
  // New requests first, then by recency, so the inbox reads top-to-bottom
  // by what actually needs a response.
  rows = [...rows].sort((a, b) => {
    const statusRank = (s) => (s === "New" ? 0 : s === "Seen" ? 1 : 2);
    const diff = statusRank(a.status || "New") - statusRank(b.status || "New");
    if (diff !== 0) return diff;
    return toMillis(b.createdAt) - toMillis(a.createdAt);
  });

  if (!rows.length) {
    requestsList.innerHTML = `<div class="mini-empty">No requests match this view.</div>`;
    return;
  }

  requestsList.innerHTML = rows.map((r) => {
    const client = resolveClientByEmail(r.clientEmail);
    const statusClass = r.status === "Resolved" ? "status-accepted" : r.status === "Seen" ? "status-pending" : "status-sent";
    const hasMessage = (r.message || "").trim().length > 0;
    return `
    <div class="request-card" data-request-id="${r.id}">
      <div class="request-card-top">
        <div class="request-client-id">
          <div class="client-avatar">${initials(r.clientName)}</div>
          <div class="request-client-text">
            <strong>${escapeHtml(r.clientName || "Client")}</strong>
            <small>${escapeHtml(r.clientEmail || "")}</small>
          </div>
        </div>
        <span class="badge ${statusClass}">${escapeHtml(r.status || "New")}</span>
      </div>

      <div class="request-type-row">
        <span class="request-type-tag">${escapeHtml(r.type || "Request")}</span>
        <span class="request-date">${escapeHtml(r.createdAt || "")}</span>
      </div>

      ${hasMessage ? `
      <details class="request-details">
        <summary>${escapeHtml(r.subject || "View message")}</summary>
        <p>${escapeHtml(r.message)}</p>
      </details>` : r.subject ? `<div class="request-subject-plain">${escapeHtml(r.subject)}</div>` : ""}

      <div class="request-footer-row">
        <select class="request-status-select" data-request-id="${r.id}">
          <option value="New" ${r.status === "New" ? "selected" : ""}>New</option>
          <option value="Seen" ${r.status === "Seen" ? "selected" : ""}>Seen</option>
          <option value="Resolved" ${r.status === "Resolved" ? "selected" : ""}>Resolved</option>
        </select>

        <div class="request-actions-row">
          ${client
            ? `<button class="request-action-btn reply-toggle-btn" data-request-id="${r.id}" type="button">💬 Reply</button>
               <button class="request-action-btn open-thread-btn" data-client-id="${client.id}" type="button">↗ Full conversation</button>`
            : `<span class="request-no-client">No client account yet</span>`
          }
        </div>
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
          // Uses arrayUnion so a reply sent from here can never clobber a
          // notification written moments earlier/later by the direct chat
          // thread or the quick-file-add form (see ownerChatForm and
          // quickFileForm handlers below — same fix, same reason).
          await updateDoc(doc(db, "clients", clientId), {
            notifications: arrayUnion(`New message from TUSDIO: ${text.slice(0, 120)}`),
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
  const newLeads = leadsCache.filter((l) => l.status === "NEW").length;
  activityBellDot.hidden = (newRequests + overdue + newLeads) === 0;
}

/* ============================================================
   MESSAGES

   FIX: conversations previously sorted only by `lastOwnerMessageAt` — a
   field this file only ever writes when the OWNER sends a message. A
   client messaging in never touched that field, so their conversation
   never moved to the top the way it would in a normal inbox/WhatsApp —
   only the owner replying did. `conversationMeta` below fetches each
   conversation's actual last message (whoever sent it) so sorting reflects
   real activity, and a reply from the owner still bumps it to the top
   immediately via the local update in ownerChatForm's submit handler,
   without waiting on a full re-fetch.
============================================================ */
let conversationMeta = new Map(); // clientId -> { ms, text, sender }

async function loadConversationPreviews() {
  const active = clientsCache.filter((c) => c.access !== "disabled");
  const results = await Promise.all(active.map(async (c) => {
    try {
      const q = query(collection(db, "clients", c.id, "messages"), orderBy("createdAt", "desc"), limit(1));
      const snap = await getDocs(q);
      if (snap.empty) return [c.id, null];
      const m = snap.docs[0].data();
      const who = (m.sender || m.role || m.from || "").toLowerCase() === "owner" ? "owner" : "client";
      return [c.id, { ms: toMillis(m.createdAt), text: m.text || "", sender: who }];
    } catch (err) {
      return [c.id, null];
    }
  }));
  conversationMeta = new Map(results);
}

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

  const metaFor = (c) => {
    const m = conversationMeta.get(c.id);
    if (m) return m;
    // Fallback before conversationMeta has loaded (or if the thread is
    // empty): best-effort from fields we already write on the client doc.
    return c.lastOwnerMessageAt
      ? { ms: toMillis(c.lastOwnerMessageAt), text: c.lastOwnerMessagePreview || "", sender: "owner" }
      : { ms: 0, text: "", sender: "" };
  };

  const sorted = [...filtered].sort((a, b) => metaFor(b).ms - metaFor(a).ms);

  conversationsList.innerHTML = sorted.map((c) => {
    const meta = metaFor(c);
    const preview = meta.text || c.projectName || c.service || "No messages yet";
    return `
    <div class="conversation-item ${c.id === activeThreadClientId ? "is-active" : ""}" data-client-id="${c.id}">
      <div class="client-avatar">${initials(c.name)}</div>
      <div class="conv-item-text">
        <div class="conv-item-top">
          <strong>${escapeHtml(c.name || "Client")}</strong>
          ${meta.ms ? `<span class="conv-item-time">${timeAgo(meta.ms)}</span>` : ""}
        </div>
        <div class="conv-item-preview">${meta.sender === "owner" ? `<span class="conv-item-you-tag">You:</span>` : ""}${escapeHtml(preview)}</div>
      </div>
    </div>
  `;
  }).join("");

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

    // Keep the conversation list's ordering/preview in sync with whatever
    // we just actually saw in the thread, without waiting on a full
    // loadConversationPreviews() re-fetch.
    const last = docs[docs.length - 1]?.data();
    if (last) {
      const who = (last.sender || last.role || last.from || "").toLowerCase() === "owner" ? "owner" : "client";
      conversationMeta.set(clientId, { ms: toMillis(last.createdAt), text: last.text || "", sender: who });
      renderConversations();
    }

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
      // FIX (was): read targetClient.notifications from the local cache,
      // spread it into a new array, and overwrite the whole `notifications`
      // field. This is the highest-traffic path of the three that touch
      // `notifications` (it fires on every direct reply from the Messages
      // tab), so it was also the most likely to clobber a notification
      // written moments earlier/later by the quick-file-add form or the
      // request-reply handler. arrayUnion merges server-side against
      // whatever the array currently is, so concurrent writes from those
      // other two paths can no longer stomp each other.
      await updateDoc(doc(db, "clients", activeThreadClientId), {
        notifications: arrayUnion(`New message from TUSDIO: ${text.slice(0, 120)}`),
        lastOwnerMessageAt: new Date().toISOString(),
        lastOwnerMessagePreview: text.slice(0, 140)
      });
    }
    if (ownerChatInput) ownerChatInput.value = "";
    // Bump this conversation to the top immediately — same "reply moves it
    // up" behavior as WhatsApp — rather than waiting on the next full
    // conversations reload.
    conversationMeta.set(activeThreadClientId, { ms: Date.now(), text, sender: "owner" });
    renderConversations();
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
   INVOICES — replaced with a real `invoices` Firestore collection.
   The old version derived pseudo-invoices from client.totalAmount, which
   couldn't be created, edited, or tracked independently of a client's
   billing fields. See the Payments module below for how marking one Paid
   keeps client.paidAmount in sync instead of becoming a second, drifting
   source of truth.
============================================================ */
let invoicesCache = [];
const invoicesList = document.getElementById("invoicesList");
const invoicesKpiGrid = document.getElementById("invoicesKpiGrid");
const newInvoiceBtn = document.getElementById("newInvoiceBtn");
const invoiceEditorOverlay = document.getElementById("invoiceEditorOverlay");
const invoiceEditorDrawer = document.getElementById("invoiceEditorDrawer");
const invoiceEditorCloseBtn = document.getElementById("invoiceEditorCloseBtn");
const invoiceEditorEyebrow = document.getElementById("invoiceEditorEyebrow");
const invoiceEditorTitle = document.getElementById("invoiceEditorTitle");
const invoiceForm = document.getElementById("invoiceForm");
const invoiceSaveMessage = document.getElementById("invoiceSaveMessage");
const invoiceIdInput = document.getElementById("invoiceId");
const invoiceClient = document.getElementById("invoiceClient");
const invoiceNumberInput = document.getElementById("invoiceNumber");
const invoiceAmountInput = document.getElementById("invoiceAmount");
const invoiceDueDateInput = document.getElementById("invoiceDueDate");
const invoiceStatusInput = document.getElementById("invoiceStatus");
const invoiceNotesInput = document.getElementById("invoiceNotes");
const deleteInvoiceBtn = document.getElementById("deleteInvoiceBtn");

async function loadInvoices() {
  try {
    const snap = await getDocs(collection(db, "invoices"));
    invoicesCache = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error(err);
    invoicesCache = [];
  }
  if (activeTab === "invoices") renderInvoicesTab();
}

function statusBadgeClass(status) {
  return "status-" + (status || "pending").toLowerCase().replace(/\s+/g, "-");
}

function renderInvoicesTab() {
  if (!invoicesList) return;

  const total = invoicesCache.reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const paid = invoicesCache.filter((i) => i.status === "Paid").reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const overdue = invoicesCache.filter((i) => i.status === "Overdue").reduce((s, i) => s + (Number(i.amount) || 0), 0);
  const pending = invoicesCache.filter((i) => i.status === "Pending").reduce((s, i) => s + (Number(i.amount) || 0), 0);

  if (invoicesKpiGrid) {
    invoicesKpiGrid.innerHTML = [
      kpiCard("Total Invoiced", `₹${total.toLocaleString("en-IN")}`, `${invoicesCache.length} invoice${invoicesCache.length === 1 ? "" : "s"}`),
      kpiCard("Paid", `₹${paid.toLocaleString("en-IN")}`, "", "good"),
      kpiCard("Pending", `₹${pending.toLocaleString("en-IN")}`, ""),
      kpiCard("Overdue", `₹${overdue.toLocaleString("en-IN")}`, "", overdue > 0 ? "warn" : "good")
    ].join("");
  }

  if (!invoicesCache.length) {
    invoicesList.innerHTML = `<div class="mini-empty">No invoices yet — add your first one.</div>`;
    return;
  }

  const sorted = [...invoicesCache].sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));

  invoicesList.innerHTML = sorted.map((i) => {
    const client = clientsCache.find((c) => c.id === i.clientId);
    return `
      <div class="client-card" data-invoice-id="${i.id}">
        <div class="client-card-top">
          <strong>${escapeHtml(i.number || "Untitled invoice")}</strong>
          <span class="badge ${statusBadgeClass(i.status)}">${escapeHtml(i.status || "Pending")}</span>
        </div>
        <small>${escapeHtml(client?.name || i.clientName || "Unknown client")}</small>
        <small style="color:#cfcfcf;">₹${(Number(i.amount) || 0).toLocaleString("en-IN")}</small>
        <div class="client-card-foot">
          <span>Due ${escapeHtml(i.dueDate || "—")}</span>
          <span>${escapeHtml(i.notes || "")}</span>
        </div>
      </div>
    `;
  }).join("");

  invoicesList.querySelectorAll("[data-invoice-id]").forEach((card) => {
    card.addEventListener("click", () => openInvoiceDrawer(card.dataset.invoiceId));
  });
}

function openInvoiceEditorPanel() {
  invoiceEditorOverlay?.classList.add("show");
  invoiceEditorDrawer?.classList.add("show");
}
function closeInvoiceDrawer() {
  invoiceEditorOverlay?.classList.remove("show");
  invoiceEditorDrawer?.classList.remove("show");
}
invoiceEditorCloseBtn?.addEventListener("click", closeInvoiceDrawer);
invoiceEditorOverlay?.addEventListener("click", closeInvoiceDrawer);

function openNewInvoiceDrawer() {
  invoiceForm?.reset();
  if (invoiceIdInput) invoiceIdInput.value = "";
  if (invoiceStatusInput) invoiceStatusInput.value = "Pending";
  if (invoiceEditorEyebrow) invoiceEditorEyebrow.textContent = "New";
  if (invoiceEditorTitle) invoiceEditorTitle.textContent = "New Invoice";
  if (deleteInvoiceBtn) deleteInvoiceBtn.style.display = "none";
  if (invoiceSaveMessage) invoiceSaveMessage.textContent = "";
  openInvoiceEditorPanel();
}
newInvoiceBtn?.addEventListener("click", openNewInvoiceDrawer);

function openInvoiceDrawer(id) {
  const inv = invoicesCache.find((i) => i.id === id);
  if (!inv) return;
  if (invoiceIdInput) invoiceIdInput.value = id;
  if (invoiceClient) invoiceClient.value = inv.clientId || "";
  if (invoiceNumberInput) invoiceNumberInput.value = inv.number || "";
  if (invoiceAmountInput) invoiceAmountInput.value = inv.amount || "";
  if (invoiceDueDateInput) invoiceDueDateInput.value = inv.dueDate || "";
  if (invoiceStatusInput) invoiceStatusInput.value = inv.status || "Pending";
  if (invoiceNotesInput) invoiceNotesInput.value = inv.notes || "";
  if (invoiceEditorEyebrow) invoiceEditorEyebrow.textContent = "Editing";
  if (invoiceEditorTitle) invoiceEditorTitle.textContent = inv.number || "Invoice";
  if (deleteInvoiceBtn) deleteInvoiceBtn.style.display = "";
  if (invoiceSaveMessage) invoiceSaveMessage.textContent = "";
  openInvoiceEditorPanel();
}

invoiceForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const clientId = invoiceClient?.value;
  const client = clientsCache.find((c) => c.id === clientId);
  if (!client) { if (invoiceSaveMessage) invoiceSaveMessage.textContent = "Select a client first."; return; }

  const existingId = invoiceIdInput?.value;
  const previous = existingId ? invoicesCache.find((i) => i.id === existingId) : null;
  const newStatus = invoiceStatusInput?.value || "Pending";

  const payload = {
    clientId,
    clientName: client.name,
    number: invoiceNumberInput?.value.trim() || "",
    amount: Number(invoiceAmountInput?.value) || 0,
    dueDate: invoiceDueDateInput?.value || "",
    status: newStatus,
    notes: invoiceNotesInput?.value.trim() || "",
    updatedAt: new Date().toISOString()
  };

  try {
    if (existingId) {
      await updateDoc(doc(db, "invoices", existingId), payload);
    } else {
      payload.createdAt = new Date().toISOString();
      const newDoc = await addDoc(collection(db, "invoices"), payload);
      if (invoiceIdInput) invoiceIdInput.value = newDoc.id;
    }

    // Marking (or creating as) Paid logs a matching payment and bumps the
    // client's paidAmount — this is the one place invoices and the
    // client's own billing fields are kept from drifting apart.
    if (newStatus === "Paid" && previous?.status !== "Paid") {
      await addDoc(collection(db, "transactions"), {
        clientId, clientName: client.name, amount: payload.amount, method: "Invoice",
        date: new Date().toISOString().slice(0, 10), reference: payload.number,
        notes: `Auto-logged from invoice ${payload.number}`, createdAt: new Date().toISOString()
      });
      await updateDoc(doc(db, "clients", clientId), { paidAmount: increment(payload.amount) });
    }

    await logActivity(`${existingId ? "Updated" : "Created"} invoice ${payload.number || ""} for ${client.name}`, "good", client.name);
    showToast(`Invoice ${existingId ? "updated" : "created"}`, "good");
    if (invoiceSaveMessage) invoiceSaveMessage.textContent = "Saved.";
    await Promise.all([loadInvoices(), loadClients(), loadTransactions()]);
    renderInvoicesTab();
  } catch (err) {
    console.error(err);
    if (invoiceSaveMessage) invoiceSaveMessage.textContent = err.message;
    showToast("Couldn't save this invoice", "danger");
  }
});

deleteInvoiceBtn?.addEventListener("click", async () => {
  const id = invoiceIdInput?.value;
  if (!id) return;
  if (!confirm("Delete this invoice? This does not reverse any payment already logged against it.")) return;
  try {
    await deleteDoc(doc(db, "invoices", id));
    await logActivity("Deleted an invoice", "danger");
    showToast("Invoice deleted", "warn");
    closeInvoiceDrawer();
    await loadInvoices();
  } catch (err) {
    console.error(err);
    showToast("Couldn't delete this invoice", "danger");
  }
});

/* ============================================================
   TIME TRACKING
============================================================ */
function populateClientSelects() {
  const active = clientsCache.filter((c) => c.access !== "disabled");
  const optionsHtml = `<option value="" disabled selected>Select client…</option>` +
    active.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("");

  if (timeLogClient) timeLogClient.innerHTML = optionsHtml;
  if (quickFileClient) quickFileClient.innerHTML = optionsHtml;

  // New Finance/Sales module selects — all draw from the same active-client
  // list so a client only needs to be added once.
  if (paymentClient) paymentClient.innerHTML = optionsHtml;
  if (contractClient) contractClient.innerHTML = optionsHtml;
  if (invoiceClient) invoiceClient.innerHTML = optionsHtml;

  const noneOptionsHtml = `<option value="">— None —</option>` +
    active.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("");
  if (expenseClient) expenseClient.innerHTML = noneOptionsHtml;

  // "Referred By" excludes the client currently being edited so a client
  // can never be marked as their own referrer. If the drawer is open for
  // an existing client, openClientDrawer() re-applies the saved value
  // right after this runs, so a mid-edit refresh doesn't lose the selection.
  const currentId = clientIdInput?.value || "";
  if (referredByInput) {
    referredByInput.innerHTML = `<option value="">— None —</option>` +
      active.filter((c) => c.id !== currentId).map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("");
  }
  if (leadReferredByInput) {
    leadReferredByInput.innerHTML = `<option value="">— None —</option>` +
      active.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("");
  }

  // Proposals attach to either an open lead or an existing client.
  if (proposalRefInput) {
    const openLeads = leadsCache.filter((l) => !["WON", "LOST"].includes(l.status));
    proposalRefInput.innerHTML =
      `<optgroup label="Leads">${openLeads.map((l) => `<option value="lead:${l.id}">${escapeHtml(l.name || l.company || "Lead")}</option>`).join("") || "<option disabled>No open leads</option>"}</optgroup>` +
      `<optgroup label="Clients">${active.map((c) => `<option value="client:${c.id}">${escapeHtml(c.name)}</option>`).join("") || "<option disabled>No clients</option>"}</optgroup>`;
  }
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
    // Uses arrayUnion instead of reading client.files from the cache and
    // overwriting the whole array — see the notifications comment in
    // ownerChatForm's submit handler above for why.
    await updateDoc(doc(db, "clients", clientId), {
      files: arrayUnion(newFile),
      notifications: arrayUnion(`New file added: "${newFile.title}"`)
    });
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
   PAYMENTS (transaction ledger)
============================================================ */
let transactionsCache = [];
const paymentsList = document.getElementById("paymentsList");
const paymentForm = document.getElementById("paymentForm");
const paymentClient = document.getElementById("paymentClient");
const paymentAmountInput = document.getElementById("paymentAmount");
const paymentMethodInput = document.getElementById("paymentMethod");
const paymentDateInput = document.getElementById("paymentDate");
const paymentReferenceInput = document.getElementById("paymentReference");
const paymentNotesInput = document.getElementById("paymentNotes");
const paymentMessage = document.getElementById("paymentMessage");

async function loadTransactions() {
  try {
    const q = query(collection(db, "transactions"), orderBy("createdAt", "desc"), limit(200));
    const snap = await getDocs(q);
    transactionsCache = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error(err);
    transactionsCache = [];
  }
  if (activeTab === "payments") renderPayments();
}

function renderPayments() {
  if (!paymentsList) return;
  if (!transactionsCache.length) {
    paymentsList.innerHTML = `<div class="mini-empty">No payments logged yet.</div>`;
    return;
  }
  paymentsList.innerHTML = transactionsCache.map((t) => `
    <div class="client-card" style="cursor:default;">
      <div class="client-card-top">
        <strong>₹${(Number(t.amount) || 0).toLocaleString("en-IN")}</strong>
        <span class="badge active">${escapeHtml(t.method || "")}</span>
      </div>
      <small>${escapeHtml(t.clientName || "Unknown client")}</small>
      ${t.reference ? `<small style="color:#cfcfcf;">Ref: ${escapeHtml(t.reference)}</small>` : ""}
      <div class="client-card-foot">
        <span>${escapeHtml(t.date || "")}</span>
        <span>${escapeHtml(t.notes || "")}</span>
      </div>
    </div>
  `).join("");
}

paymentForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const clientId = paymentClient?.value;
  const client = clientsCache.find((c) => c.id === clientId);
  if (!client) { if (paymentMessage) paymentMessage.textContent = "Select a client first."; return; }
  const amount = Number(paymentAmountInput?.value) || 0;
  if (amount <= 0) { if (paymentMessage) paymentMessage.textContent = "Enter an amount greater than 0."; return; }

  try {
    await addDoc(collection(db, "transactions"), {
      clientId, clientName: client.name, amount,
      method: paymentMethodInput?.value || "Other",
      date: paymentDateInput?.value || new Date().toISOString().slice(0, 10),
      reference: paymentReferenceInput?.value.trim() || "",
      notes: paymentNotesInput?.value.trim() || "",
      createdAt: new Date().toISOString()
    });
    // The one place a payment actually moves money on the client record —
    // `increment` avoids the read-modify-write race the rest of this file
    // already works around elsewhere with arrayUnion.
    await updateDoc(doc(db, "clients", clientId), {
      paidAmount: increment(amount),
      paymentStatus: (Number(client.paidAmount) || 0) + amount >= (Number(client.totalAmount) || 0) && (Number(client.totalAmount) || 0) > 0 ? "Paid" : "Partially Paid"
    });
    await logActivity(`Logged ₹${amount.toLocaleString("en-IN")} payment from ${client.name}`, "good", client.name);
    showToast("Payment logged", "good");
    paymentForm.reset();
    if (paymentMessage) paymentMessage.textContent = "Payment logged.";
    await Promise.all([loadTransactions(), loadClients()]);
  } catch (err) {
    console.error(err);
    if (paymentMessage) paymentMessage.textContent = "Failed to log payment.";
    showToast("Couldn't log this payment", "danger");
  }
});

/* ============================================================
   EXPENSES
============================================================ */
let expensesCache = [];
const expensesList = document.getElementById("expensesList");
const expensesKpiGrid = document.getElementById("expensesKpiGrid");
const expenseForm = document.getElementById("expenseForm");
const expenseAmountInput = document.getElementById("expenseAmount");
const expenseCategoryInput = document.getElementById("expenseCategory");
const expenseVendorInput = document.getElementById("expenseVendor");
const expenseDateInput = document.getElementById("expenseDate");
const expenseClient = document.getElementById("expenseClient");
const expenseDescriptionInput = document.getElementById("expenseDescription");
const expenseMessage = document.getElementById("expenseMessage");

async function loadExpenses() {
  try {
    const q = query(collection(db, "expenses"), orderBy("createdAt", "desc"), limit(200));
    const snap = await getDocs(q);
    expensesCache = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error(err);
    expensesCache = [];
  }
  if (activeTab === "expenses") renderExpenses();
  if (activeTab === "profitability") renderProfitability();
}

function renderExpenses() {
  if (!expensesList) return;
  const total = expensesCache.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  if (expensesKpiGrid) {
    const byCategory = {};
    expensesCache.forEach((e) => { byCategory[e.category || "Other"] = (byCategory[e.category || "Other"] || 0) + (Number(e.amount) || 0); });
    const top = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
    expensesKpiGrid.innerHTML = [
      kpiCard("Total Expenses", `₹${total.toLocaleString("en-IN")}`, `${expensesCache.length} entries`),
      kpiCard("Top Category", top ? top[0] : "—", top ? `₹${top[1].toLocaleString("en-IN")}` : "No expenses yet")
    ].join("");
  }
  if (!expensesCache.length) {
    expensesList.innerHTML = `<div class="mini-empty">No expenses logged yet.</div>`;
    return;
  }
  expensesList.innerHTML = expensesCache.map((e) => {
    const client = e.clientId ? clientsCache.find((c) => c.id === e.clientId) : null;
    return `
    <div class="client-card" data-expense-id="${e.id}" style="cursor:default;">
      <div class="client-card-top">
        <strong>₹${(Number(e.amount) || 0).toLocaleString("en-IN")}</strong>
        <span class="badge progress">${escapeHtml(e.category || "Other")}</span>
      </div>
      <small>${escapeHtml(e.vendor || "No vendor noted")}${client ? ` • ${escapeHtml(client.name)}` : ""}</small>
      <small style="color:#cfcfcf;">${escapeHtml(e.description || "")}</small>
      <div class="client-card-foot">
        <span>${escapeHtml(e.date || "")}</span>
        <button class="link-btn" data-delete-expense="${e.id}" type="button">Delete</button>
      </div>
    </div>
  `;
  }).join("");

  expensesList.querySelectorAll("[data-delete-expense]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this expense?")) return;
      try {
        await deleteDoc(doc(db, "expenses", btn.dataset.deleteExpense));
        showToast("Expense deleted", "warn");
        await loadExpenses();
      } catch (err) { console.error(err); showToast("Couldn't delete this expense", "danger"); }
    });
  });
}

expenseForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const amount = Number(expenseAmountInput?.value) || 0;
  if (amount <= 0) { if (expenseMessage) expenseMessage.textContent = "Enter an amount greater than 0."; return; }
  try {
    await addDoc(collection(db, "expenses"), {
      amount,
      category: expenseCategoryInput?.value || "Other",
      vendor: expenseVendorInput?.value.trim() || "",
      date: expenseDateInput?.value || new Date().toISOString().slice(0, 10),
      clientId: expenseClient?.value || "",
      description: expenseDescriptionInput?.value.trim() || "",
      createdAt: new Date().toISOString()
    });
    await logActivity(`Logged ₹${amount.toLocaleString("en-IN")} expense (${expenseCategoryInput?.value})`, "info");
    showToast("Expense added", "good");
    expenseForm.reset();
    if (expenseMessage) expenseMessage.textContent = "Expense added.";
    await loadExpenses();
  } catch (err) {
    console.error(err);
    if (expenseMessage) expenseMessage.textContent = "Failed to add expense.";
  }
});

/* ============================================================
   PROFITABILITY
============================================================ */
const profitabilityKpiGrid = document.getElementById("profitabilityKpiGrid");
const profitabilityList = document.getElementById("profitabilityList");

function renderProfitability() {
  if (!profitabilityList) return;
  const hourlyRate = Number(settingsData?.hourlyRate) || 0;

  const rows = clientsCache.map((c) => {
    const revenue = Number(c.paidAmount) || 0;
    const hours = timeLogsCache.filter((t) => t.clientId === c.id).reduce((s, t) => s + (Number(t.hours) || 0), 0);
    const laborCost = hours * hourlyRate;
    const directExpenses = expensesCache.filter((e) => e.clientId === c.id).reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const totalCost = laborCost + directExpenses;
    const profit = revenue - totalCost;
    const margin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
    return { client: c, revenue, hours, laborCost, directExpenses, totalCost, profit, margin };
  }).filter((r) => r.revenue > 0 || r.hours > 0 || r.directExpenses > 0);

  const totalRevenue = rows.reduce((s, r) => s + r.revenue, 0);
  const totalCost = rows.reduce((s, r) => s + r.totalCost, 0);
  const totalProfit = totalRevenue - totalCost;

  if (profitabilityKpiGrid) {
    profitabilityKpiGrid.innerHTML = [
      kpiCard("Revenue Collected", `₹${totalRevenue.toLocaleString("en-IN")}`, "All clients"),
      kpiCard("Estimated Cost", `₹${totalCost.toLocaleString("en-IN")}`, hourlyRate ? `At ₹${hourlyRate}/hr` : "Set an hourly rate in Settings"),
      kpiCard("Estimated Profit", `₹${totalProfit.toLocaleString("en-IN")}`, totalRevenue ? `${Math.round((totalProfit / totalRevenue) * 100)}% margin` : "", totalProfit >= 0 ? "good" : "warn")
    ].join("");
  }

  if (!rows.length) {
    profitabilityList.innerHTML = `<div class="mini-empty">No billed clients with hours or expenses yet.</div>`;
    return;
  }

  profitabilityList.innerHTML = rows.sort((a, b) => b.profit - a.profit).map((r) => `
    <div class="client-card" data-client-id="${r.client.id}">
      <div class="client-card-top">
        <strong>${escapeHtml(r.client.name)}</strong>
        <span class="badge ${r.margin >= 0 ? "active" : "removed"}">${r.margin}% margin</span>
      </div>
      <small>${escapeHtml(r.client.service || r.client.projectName || "")}</small>
      <div class="client-card-foot"><span>Revenue</span><span>₹${r.revenue.toLocaleString("en-IN")}</span></div>
      <div class="client-card-foot"><span>Hours logged</span><span>${r.hours}h</span></div>
      <div class="client-card-foot"><span>Est. labor + expenses</span><span>₹${r.totalCost.toLocaleString("en-IN")}</span></div>
      <div class="client-card-foot"><span><strong>Profit</strong></span><span><strong>₹${r.profit.toLocaleString("en-IN")}</strong></span></div>
    </div>
  `).join("");

  profitabilityList.querySelectorAll("[data-client-id]").forEach((el) => {
    el.addEventListener("click", () => openClientDrawer(el.dataset.clientId));
  });
}

/* ============================================================
   TEAM
============================================================ */
let teamCache = [];
const teamList = document.getElementById("teamList");
const teamMemberForm = document.getElementById("teamMemberForm");
const teamMemberName = document.getElementById("teamMemberName");
const teamMemberEmail = document.getElementById("teamMemberEmail");
const teamMemberRole = document.getElementById("teamMemberRole");
const teamMemberMessage = document.getElementById("teamMemberMessage");

async function loadTeam() {
  try {
    const snap = await getDocs(collection(db, "team_members"));
    teamCache = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error(err);
    teamCache = [];
  }
  if (activeTab === "team") renderTeam();
}

function renderTeam() {
  if (!teamList) return;
  if (!teamCache.length) {
    teamList.innerHTML = `<div class="mini-empty">No team members added yet.</div>`;
    return;
  }
  teamList.innerHTML = teamCache.map((m) => {
    // Hours are matched against time_logs.note containing the member's
    // name, since time_logs has no assignedTo field — an approximation
    // flagged here rather than presented as exact.
    const hours = timeLogsCache.filter((t) => (t.note || "").toLowerCase().includes((m.name || "").toLowerCase())).reduce((s, t) => s + (Number(t.hours) || 0), 0);
    return `
    <div class="client-card" data-team-id="${m.id}" style="cursor:default;">
      <div class="client-card-top">
        <strong>${escapeHtml(m.name)}</strong>
        <span class="badge role-${(m.role || "viewer").toLowerCase()}">${escapeHtml(m.role || "VIEWER")}</span>
      </div>
      <small>${escapeHtml(m.email || "")}</small>
      <div class="client-card-foot">
        <span>${hours}h logged (matched by name in time log notes)</span>
        <button class="link-btn" data-remove-team="${m.id}" type="button">Remove</button>
      </div>
    </div>
  `;
  }).join("");

  teamList.querySelectorAll("[data-remove-team]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!confirm("Remove this team member?")) return;
      try {
        await deleteDoc(doc(db, "team_members", btn.dataset.removeTeam));
        showToast("Team member removed", "warn");
        await loadTeam();
      } catch (err) { console.error(err); }
    });
  });
}

teamMemberForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const name = teamMemberName?.value.trim();
  if (!name) { if (teamMemberMessage) teamMemberMessage.textContent = "Name is required."; return; }
  try {
    await addDoc(collection(db, "team_members"), {
      name, email: teamMemberEmail?.value.trim() || "",
      role: teamMemberRole?.value || "VIEWER", active: true,
      createdAt: new Date().toISOString()
    });
    await logActivity(`Added team member ${name}`, "good");
    teamMemberForm.reset();
    if (teamMemberMessage) teamMemberMessage.textContent = "Team member added.";
    showToast(`${name} added to the team`, "good");
    await loadTeam();
  } catch (err) {
    console.error(err);
    if (teamMemberMessage) teamMemberMessage.textContent = "Failed to add team member.";
  }
});

/* ============================================================
   PROPOSALS
============================================================ */
let proposalsCache = [];
const proposalsList = document.getElementById("proposalsList");
const proposalsKpiGrid = document.getElementById("proposalsKpiGrid");
const newProposalBtn = document.getElementById("newProposalBtn");
const proposalEditorOverlay = document.getElementById("proposalEditorOverlay");
const proposalEditorDrawer = document.getElementById("proposalEditorDrawer");
const proposalEditorCloseBtn = document.getElementById("proposalEditorCloseBtn");
const proposalEditorEyebrow = document.getElementById("proposalEditorEyebrow");
const proposalEditorTitle = document.getElementById("proposalEditorTitle");
const proposalForm = document.getElementById("proposalForm");
const proposalSaveMessage = document.getElementById("proposalSaveMessage");
const proposalIdInput = document.getElementById("proposalId");
const proposalRefInput = document.getElementById("proposalRef");
const proposalStatusInput = document.getElementById("proposalStatus");
const proposalPriceInput = document.getElementById("proposalPrice");
const proposalPaymentTermsInput = document.getElementById("proposalPaymentTerms");
const proposalTimelineInput = document.getElementById("proposalTimeline");
const proposalExpiryDateInput = document.getElementById("proposalExpiryDate");
const proposalServicesInput = document.getElementById("proposalServices");
const proposalScopeInput = document.getElementById("proposalScope");
const proposalDeliverablesInput = document.getElementById("proposalDeliverables");
const convertProposalToContractBtn = document.getElementById("convertProposalToContractBtn");
const deleteProposalBtn = document.getElementById("deleteProposalBtn");

async function loadProposals() {
  try {
    const snap = await getDocs(collection(db, "proposals"));
    proposalsCache = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error(err);
    proposalsCache = [];
  }
  if (activeTab === "proposals") renderProposals();
}

function renderProposals() {
  if (!proposalsList) return;
  const sent = proposalsCache.filter((p) => p.status !== "DRAFT");
  const accepted = proposalsCache.filter((p) => p.status === "ACCEPTED");
  const conversionRate = sent.length ? Math.round((accepted.length / sent.length) * 100) : 0;
  const totalValue = proposalsCache.reduce((s, p) => s + (Number(p.price) || 0), 0);

  if (proposalsKpiGrid) {
    proposalsKpiGrid.innerHTML = [
      kpiCard("Total Proposals", proposalsCache.length, `₹${totalValue.toLocaleString("en-IN")} combined value`),
      kpiCard("Accepted", accepted.length, `${conversionRate}% of sent proposals`, "good")
    ].join("");
  }

  if (!proposalsCache.length) {
    proposalsList.innerHTML = `<div class="mini-empty">No proposals yet.</div>`;
    return;
  }

  proposalsList.innerHTML = [...proposalsCache].sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt)).map((p) => `
    <div class="client-card" data-proposal-id="${p.id}">
      <div class="client-card-top">
        <strong>${escapeHtml(p.refName || "Untitled")}</strong>
        <span class="badge ${statusBadgeClass(p.status)}">${escapeHtml(p.status || "DRAFT")}</span>
      </div>
      <small>${escapeHtml(p.services || "")}</small>
      <small style="color:#cfcfcf;">₹${(Number(p.price) || 0).toLocaleString("en-IN")}</small>
      <div class="client-card-foot">
        <span>Expires ${escapeHtml(p.expiryDate || "—")}</span>
      </div>
    </div>
  `).join("");

  proposalsList.querySelectorAll("[data-proposal-id]").forEach((card) => {
    card.addEventListener("click", () => openProposalDrawer(card.dataset.proposalId));
  });
}

function openProposalEditorPanel() { proposalEditorOverlay?.classList.add("show"); proposalEditorDrawer?.classList.add("show"); }
function closeProposalDrawer() { proposalEditorOverlay?.classList.remove("show"); proposalEditorDrawer?.classList.remove("show"); }
proposalEditorCloseBtn?.addEventListener("click", closeProposalDrawer);
proposalEditorOverlay?.addEventListener("click", closeProposalDrawer);

function openNewProposalDrawer() {
  proposalForm?.reset();
  if (proposalIdInput) proposalIdInput.value = "";
  if (proposalStatusInput) proposalStatusInput.value = "DRAFT";
  if (proposalEditorEyebrow) proposalEditorEyebrow.textContent = "New";
  if (proposalEditorTitle) proposalEditorTitle.textContent = "New Proposal";
  if (convertProposalToContractBtn) convertProposalToContractBtn.style.display = "none";
  if (deleteProposalBtn) deleteProposalBtn.style.display = "none";
  if (proposalSaveMessage) proposalSaveMessage.textContent = "";
  openProposalEditorPanel();
}
newProposalBtn?.addEventListener("click", openNewProposalDrawer);

function openProposalDrawer(id) {
  const p = proposalsCache.find((x) => x.id === id);
  if (!p) return;
  if (proposalIdInput) proposalIdInput.value = id;
  if (proposalRefInput) proposalRefInput.value = `${p.refType}:${p.refId}`;
  if (proposalStatusInput) proposalStatusInput.value = p.status || "DRAFT";
  if (proposalPriceInput) proposalPriceInput.value = p.price || "";
  if (proposalPaymentTermsInput) proposalPaymentTermsInput.value = p.paymentTerms || "";
  if (proposalTimelineInput) proposalTimelineInput.value = p.timeline || "";
  if (proposalExpiryDateInput) proposalExpiryDateInput.value = p.expiryDate || "";
  if (proposalServicesInput) proposalServicesInput.value = p.services || "";
  if (proposalScopeInput) proposalScopeInput.value = p.scope || "";
  if (proposalDeliverablesInput) proposalDeliverablesInput.value = (p.deliverables || []).join("\n");
  if (proposalEditorEyebrow) proposalEditorEyebrow.textContent = "Editing";
  if (proposalEditorTitle) proposalEditorTitle.textContent = p.refName || "Proposal";
  if (convertProposalToContractBtn) convertProposalToContractBtn.style.display = p.refType === "client" ? "" : "none";
  if (deleteProposalBtn) deleteProposalBtn.style.display = "";
  if (proposalSaveMessage) proposalSaveMessage.textContent = "";
  openProposalEditorPanel();
}

proposalForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const refValue = proposalRefInput?.value || "";
  const [refType, refId] = refValue.split(":");
  if (!refType || !refId) { if (proposalSaveMessage) proposalSaveMessage.textContent = "Choose a lead or client first."; return; }

  const refName = refType === "lead"
    ? (leadsCache.find((l) => l.id === refId)?.name || leadsCache.find((l) => l.id === refId)?.company || "Lead")
    : (clientsCache.find((c) => c.id === refId)?.name || "Client");

  const payload = {
    refType, refId, refName,
    status: proposalStatusInput?.value || "DRAFT",
    price: Number(proposalPriceInput?.value) || 0,
    paymentTerms: proposalPaymentTermsInput?.value.trim() || "",
    timeline: proposalTimelineInput?.value.trim() || "",
    expiryDate: proposalExpiryDateInput?.value.trim() || "",
    services: proposalServicesInput?.value.trim() || "",
    scope: proposalScopeInput?.value.trim() || "",
    deliverables: linesToArray(proposalDeliverablesInput?.value),
    updatedAt: new Date().toISOString()
  };

  const existingId = proposalIdInput?.value;
  try {
    if (existingId) {
      await updateDoc(doc(db, "proposals", existingId), payload);
    } else {
      payload.createdAt = new Date().toISOString();
      const newDoc = await addDoc(collection(db, "proposals"), payload);
      if (proposalIdInput) proposalIdInput.value = newDoc.id;
    }
    await logActivity(`${existingId ? "Updated" : "Created"} proposal for ${refName}`, "good", refName);
    showToast("Proposal saved", "good");
    if (proposalSaveMessage) proposalSaveMessage.textContent = "Saved.";
    await loadProposals();
  } catch (err) {
    console.error(err);
    if (proposalSaveMessage) proposalSaveMessage.textContent = err.message;
  }
});

deleteProposalBtn?.addEventListener("click", async () => {
  const id = proposalIdInput?.value;
  if (!id) return;
  if (!confirm("Delete this proposal?")) return;
  try {
    await deleteDoc(doc(db, "proposals", id));
    showToast("Proposal deleted", "warn");
    closeProposalDrawer();
    await loadProposals();
  } catch (err) { console.error(err); }
});

convertProposalToContractBtn?.addEventListener("click", () => {
  const id = proposalIdInput?.value;
  const p = proposalsCache.find((x) => x.id === id);
  if (!p || p.refType !== "client") return;
  closeProposalDrawer();
  switchTab("contracts");
  openNewContractDrawer({ clientId: p.refId, value: p.price, proposalId: p.id });
});

/* ============================================================
   CONTRACTS
============================================================ */
let contractsCache = [];
const contractsList = document.getElementById("contractsList");
const newContractBtn = document.getElementById("newContractBtn");
const contractEditorOverlay = document.getElementById("contractEditorOverlay");
const contractEditorDrawer = document.getElementById("contractEditorDrawer");
const contractEditorCloseBtn = document.getElementById("contractEditorCloseBtn");
const contractEditorEyebrow = document.getElementById("contractEditorEyebrow");
const contractEditorTitle = document.getElementById("contractEditorTitle");
const contractForm = document.getElementById("contractForm");
const contractSaveMessage = document.getElementById("contractSaveMessage");
const contractIdInput = document.getElementById("contractId");
const contractClient = document.getElementById("contractClient");
const contractStatusInput = document.getElementById("contractStatus");
const contractValueInput = document.getElementById("contractValue");
const contractStartDateInput = document.getElementById("contractStartDate");
const contractEndDateInput = document.getElementById("contractEndDate");
const contractSignedDateInput = document.getElementById("contractSignedDate");
const contractDocumentLinkInput = document.getElementById("contractDocumentLink");
const deleteContractBtn = document.getElementById("deleteContractBtn");

async function loadContracts() {
  try {
    const snap = await getDocs(collection(db, "contracts"));
    contractsCache = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error(err);
    contractsCache = [];
  }
  if (activeTab === "contracts") renderContracts();
}

function renderContracts() {
  if (!contractsList) return;
  if (!contractsCache.length) {
    contractsList.innerHTML = `<div class="mini-empty">No contracts yet.</div>`;
    return;
  }
  contractsList.innerHTML = [...contractsCache].sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt)).map((c) => {
    const client = clientsCache.find((cl) => cl.id === c.clientId);
    return `
      <div class="client-card" data-contract-id="${c.id}">
        <div class="client-card-top">
          <strong>${escapeHtml(client?.name || c.clientName || "Unknown client")}</strong>
          <span class="badge ${statusBadgeClass(c.status)}">${escapeHtml(c.status || "DRAFT")}</span>
        </div>
        <small>₹${(Number(c.value) || 0).toLocaleString("en-IN")}</small>
        <div class="client-card-foot">
          <span>${escapeHtml(c.startDate || "—")} → ${escapeHtml(c.endDate || "—")}</span>
          ${c.documentLink ? `<a href="${escapeHtml(c.documentLink)}" target="_blank" rel="noopener">Document</a>` : ""}
        </div>
      </div>
    `;
  }).join("");

  contractsList.querySelectorAll("[data-contract-id]").forEach((card) => {
    card.addEventListener("click", () => openContractDrawer(card.dataset.contractId));
  });
}

function openContractEditorPanel() { contractEditorOverlay?.classList.add("show"); contractEditorDrawer?.classList.add("show"); }
function closeContractDrawer() { contractEditorOverlay?.classList.remove("show"); contractEditorDrawer?.classList.remove("show"); }
contractEditorCloseBtn?.addEventListener("click", closeContractDrawer);
contractEditorOverlay?.addEventListener("click", closeContractDrawer);

function openNewContractDrawer(prefill) {
  contractForm?.reset();
  if (contractIdInput) contractIdInput.value = "";
  if (contractStatusInput) contractStatusInput.value = "DRAFT";
  if (prefill?.clientId && contractClient) contractClient.value = prefill.clientId;
  if (prefill?.value && contractValueInput) contractValueInput.value = prefill.value;
  if (contractEditorEyebrow) contractEditorEyebrow.textContent = "New";
  if (contractEditorTitle) contractEditorTitle.textContent = "New Contract";
  if (deleteContractBtn) deleteContractBtn.style.display = "none";
  if (contractSaveMessage) contractSaveMessage.textContent = "";
  openContractEditorPanel();
}
newContractBtn?.addEventListener("click", () => openNewContractDrawer());

function openContractDrawer(id) {
  const c = contractsCache.find((x) => x.id === id);
  if (!c) return;
  if (contractIdInput) contractIdInput.value = id;
  if (contractClient) contractClient.value = c.clientId || "";
  if (contractStatusInput) contractStatusInput.value = c.status || "DRAFT";
  if (contractValueInput) contractValueInput.value = c.value || "";
  if (contractStartDateInput) contractStartDateInput.value = c.startDate || "";
  if (contractEndDateInput) contractEndDateInput.value = c.endDate || "";
  if (contractSignedDateInput) contractSignedDateInput.value = c.signedDate || "";
  if (contractDocumentLinkInput) contractDocumentLinkInput.value = c.documentLink || "";
  if (contractEditorEyebrow) contractEditorEyebrow.textContent = "Editing";
  if (contractEditorTitle) contractEditorTitle.textContent = clientsCache.find((cl) => cl.id === c.clientId)?.name || "Contract";
  if (deleteContractBtn) deleteContractBtn.style.display = "";
  if (contractSaveMessage) contractSaveMessage.textContent = "";
  openContractEditorPanel();
}

contractForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const clientId = contractClient?.value;
  const client = clientsCache.find((c) => c.id === clientId);
  if (!client) { if (contractSaveMessage) contractSaveMessage.textContent = "Select a client first."; return; }

  const payload = {
    clientId, clientName: client.name,
    status: contractStatusInput?.value || "DRAFT",
    value: Number(contractValueInput?.value) || 0,
    startDate: contractStartDateInput?.value.trim() || "",
    endDate: contractEndDateInput?.value.trim() || "",
    signedDate: contractSignedDateInput?.value.trim() || "",
    documentLink: contractDocumentLinkInput?.value.trim() || "",
    updatedAt: new Date().toISOString()
  };

  const existingId = contractIdInput?.value;
  try {
    if (existingId) {
      await updateDoc(doc(db, "contracts", existingId), payload);
    } else {
      payload.createdAt = new Date().toISOString();
      const newDoc = await addDoc(collection(db, "contracts"), payload);
      if (contractIdInput) contractIdInput.value = newDoc.id;
    }
    await logActivity(`${existingId ? "Updated" : "Created"} contract for ${client.name}`, "good", client.name);
    showToast("Contract saved", "good");
    if (contractSaveMessage) contractSaveMessage.textContent = "Saved.";
    await loadContracts();
  } catch (err) {
    console.error(err);
    if (contractSaveMessage) contractSaveMessage.textContent = err.message;
  }
});

deleteContractBtn?.addEventListener("click", async () => {
  const id = contractIdInput?.value;
  if (!id) return;
  if (!confirm("Delete this contract?")) return;
  try {
    await deleteDoc(doc(db, "contracts", id));
    showToast("Contract deleted", "warn");
    closeContractDrawer();
    await loadContracts();
  } catch (err) { console.error(err); }
});

/* ============================================================
   CALENDAR (agenda view)
============================================================ */
const calendarBoard = document.getElementById("calendarBoard");

function renderCalendar() {
  if (!calendarBoard) return;
  const items = [];

  clientsCache.filter((c) => c.access !== "disabled").forEach((c) => {
    if (c.estimatedDelivery) items.push({ date: c.estimatedDelivery, title: `${c.name} — delivery`, meta: c.projectName || c.service || "", type: "Delivery", clientId: c.id });
    if (c.nextPaymentDue) items.push({ date: c.nextPaymentDue, title: `${c.name} — payment due`, meta: c.paymentStatus || "", type: "Payment", clientId: c.id });
  });
  leadsCache.filter((l) => !["WON", "LOST"].includes(l.status)).forEach((l) => {
    if (l.nextFollowUpAt) items.push({ date: l.nextFollowUpAt, title: `${l.name || l.company} — follow-up`, meta: l.leadSource || "", type: "Follow-up", leadId: l.id });
    if (l.expectedCloseDate) items.push({ date: l.expectedCloseDate, title: `${l.name || l.company} — expected close`, meta: `₹${(Number(l.estimatedValue) || 0).toLocaleString("en-IN")}`, type: "Close date", leadId: l.id });
  });
  invoicesCache.forEach((i) => {
    if (i.dueDate && i.status !== "Paid") items.push({ date: i.dueDate, title: `Invoice ${i.number || ""} due`, meta: `₹${(Number(i.amount) || 0).toLocaleString("en-IN")} • ${i.clientName || ""}`, type: "Invoice" });
  });

  const withMs = items.map((i) => ({ ...i, ms: Date.parse(i.date) })).filter((i) => !Number.isNaN(i.ms));
  const today = Date.now();
  const overdue = withMs.filter((i) => i.ms < today).sort((a, b) => b.ms - a.ms);
  const upcoming = withMs.filter((i) => i.ms >= today).sort((a, b) => a.ms - b.ms);

  const row = (i) => `
    <div class="mini-item" ${i.clientId ? `data-cal-client="${i.clientId}"` : i.leadId ? `data-cal-lead="${i.leadId}"` : ""} style="${i.clientId || i.leadId ? "cursor:pointer;" : ""}">
      <span class="mini-dot ${i.ms < today ? "danger" : ""}"></span>
      <div class="mini-body">
        <div class="mini-title">${escapeHtml(i.title)}</div>
        <div class="mini-meta">${escapeHtml(i.type)} • ${escapeHtml(i.date)}${i.meta ? ` • ${escapeHtml(i.meta)}` : ""}</div>
      </div>
    </div>
  `;

  calendarBoard.innerHTML = `
    <div class="card glass">
      <div class="card-head"><h3>Overdue <span class="kanban-count">${overdue.length}</span></h3></div>
      <div class="mini-list">${overdue.length ? overdue.map(row).join("") : `<div class="mini-empty">Nothing overdue.</div>`}</div>
    </div>
    <div class="card glass">
      <div class="card-head"><h3>Upcoming <span class="kanban-count">${upcoming.length}</span></h3></div>
      <div class="mini-list">${upcoming.length ? upcoming.slice(0, 20).map(row).join("") : `<div class="mini-empty">Nothing scheduled.</div>`}</div>
    </div>
  `;

  calendarBoard.querySelectorAll("[data-cal-client]").forEach((el) => el.addEventListener("click", () => openClientDrawer(el.dataset.calClient)));
  calendarBoard.querySelectorAll("[data-cal-lead]").forEach((el) => el.addEventListener("click", () => { switchTab("leads"); openLeadDrawer(el.dataset.calLead); }));
}

/* ============================================================
   WEBSITE INTELLIGENCE
   Combines three sources: freebie logins + freebie downloads (real,
   already flowing in from the public Freebie page — this is the
   "who logged in" data), and analytics_events (page/session tracking,
   which stays empty until a tracking snippet exists on the public site).
============================================================ */
let analyticsEventsCache = [];
const websiteIntelKpiGrid = document.getElementById("websiteIntelKpiGrid");
const websiteIntelList = document.getElementById("websiteIntelList");
const websiteIntelRangeChips = document.getElementById("websiteIntelRangeChips");
const websiteIntelTypeChips = document.getElementById("websiteIntelTypeChips");
let websiteIntelRange = "all";
let websiteIntelType = "all";

async function loadWebsiteIntel() {
  try {
    const q = query(collection(db, "analytics_events"), orderBy("timestamp", "desc"), limit(100));
    const snap = await getDocs(q);
    analyticsEventsCache = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (err) {
    // Collection likely doesn't exist yet — that's expected until a
    // tracking snippet is added to the public site. Fail quietly.
    analyticsEventsCache = [];
  }
  if (activeTab === "websiteIntelligence") renderWebsiteIntel();
}

function combinedWebsiteActivity() {
  const logins = freebieLoginsCache.map((r) => ({ type: "login", name: r.name, email: r.email, ms: toMillis(r.createdAt), detail: "Logged in on the Freebie page" }));
  const downloads = freebieDownloadsCache.map((r) => ({ type: "download", name: r.name, email: r.email, ms: toMillis(r.createdAt), detail: `Downloaded "${r.freebieTitle || ""}"` }));
  const events = analyticsEventsCache.map((e) => ({ type: "event", name: e.userId ? "Identified visitor" : "Anonymous visitor", email: e.userEmail || "", ms: toMillis(e.timestamp), detail: e.type || e.page || "Site event" }));
  return [...logins, ...downloads, ...events].sort((a, b) => b.ms - a.ms);
}

function renderWebsiteIntel() {
  if (!websiteIntelList) return;

  let rows = combinedWebsiteActivity();
  if (websiteIntelType !== "all") rows = rows.filter((r) => r.type === websiteIntelType);
  if (websiteIntelRange === "today") {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    rows = rows.filter((r) => r.ms >= start.getTime());
  } else if (websiteIntelRange !== "all") {
    const cutoff = Date.now() - Number(websiteIntelRange) * 24 * 60 * 60 * 1000;
    rows = rows.filter((r) => r.ms >= cutoff);
  }

  if (websiteIntelKpiGrid) {
    const identifiable = rows.filter((r) => r.email);
    websiteIntelKpiGrid.innerHTML = [
      kpiCard("Logins", freebieLoginsCache.length, "All time, Freebie page"),
      kpiCard("Downloads", freebieDownloadsCache.length, "All time, Freebie page"),
      kpiCard("Site Events", analyticsEventsCache.length, analyticsEventsCache.length ? "Last 100" : "Needs tracking snippet"),
      kpiCard("Identifiable in view", identifiable.length, "Have an email on file")
    ].join("");
  }

  if (!rows.length) {
    websiteIntelList.innerHTML = `<div class="mini-empty">No activity matches this filter yet.</div>`;
    return;
  }

  websiteIntelList.innerHTML = rows.map((r) => {
    const matched = r.email ? resolveClientByEmail(r.email) : null;
    return `
    <div class="mini-item" ${matched ? `data-intel-client="${matched.id}" style="cursor:pointer;"` : ""}>
      <span class="mini-dot ${r.type === "download" ? "good" : r.type === "login" ? "" : "warn"}"></span>
      <div class="mini-body">
        <div class="mini-title">${escapeHtml(r.name || (r.email ? r.email : "Anonymous"))}${matched ? ` <span class="lead-tag">Client</span>` : ""}</div>
        <div class="mini-meta">${escapeHtml(r.detail)} • ${timeAgo(r.ms)}</div>
      </div>
    </div>
  `;
  }).join("");

  websiteIntelList.querySelectorAll("[data-intel-client]").forEach((el) => {
    el.addEventListener("click", () => openClientDrawer(el.dataset.intelClient));
  });
}

websiteIntelRangeChips?.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    websiteIntelRangeChips.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active"));
    chip.classList.add("is-active");
    websiteIntelRange = chip.dataset.rangeFilter;
    renderWebsiteIntel();
  });
});
websiteIntelTypeChips?.querySelectorAll(".chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    websiteIntelTypeChips.querySelectorAll(".chip").forEach((c) => c.classList.remove("is-active"));
    chip.classList.add("is-active");
    websiteIntelType = chip.dataset.typeFilter;
    renderWebsiteIntel();
  });
});

/* ============================================================
   REFERRALS — now also pulls in leads sourced as "Referral" with a
   Referred By client set (added to the lead form), not just the
   client-to-client referredBy field. A referred lead that hasn't
   converted yet still shows up, attributed by its estimated value; once
   it's WON, the actual client's paid amount is used instead.
============================================================ */
const referralsList = document.getElementById("referralsList");

function renderReferrals() {
  if (!referralsList) return;
  const referrers = {}; // referrerId -> { referrer, referredClients: [], referredLeads: [] }

  const ensure = (referrerId) => {
    if (!referrers[referrerId]) {
      const referrer = clientsCache.find((r) => r.id === referrerId);
      if (!referrer) return null;
      referrers[referrerId] = { referrer, referredClients: [], referredLeads: [] };
    }
    return referrers[referrerId];
  };

  clientsCache.forEach((c) => {
    if (!c.referredBy) return;
    const bucket = ensure(c.referredBy);
    if (bucket) bucket.referredClients.push(c);
  });

  leadsCache.forEach((l) => {
    if (!l.referredBy || l.status === "WON") return; // WON leads are already counted via their converted client above
    const bucket = ensure(l.referredBy);
    if (bucket) bucket.referredLeads.push(l);
  });

  const rows = Object.values(referrers).sort((a, b) => {
    const revenue = (x) => x.referredClients.reduce((s, c) => s + (Number(c.paidAmount) || 0), 0);
    return revenue(b) - revenue(a);
  });

  if (!rows.length) {
    referralsList.innerHTML = `<div class="mini-empty">No referrals recorded yet. Set "Referred By" on a client's record, or on a lead sourced as Referral, to attribute them.</div>`;
    return;
  }

  referralsList.innerHTML = rows.map(({ referrer, referredClients, referredLeads }) => {
    const revenue = referredClients.reduce((s, c) => s + (Number(c.paidAmount) || 0), 0);
    const pipelineValue = referredLeads.reduce((s, l) => s + (Number(l.estimatedValue) || 0), 0);
    const names = [...referredClients.map((c) => c.name), ...referredLeads.map((l) => `${l.name || l.company} (lead)`)];
    return `
      <div class="client-card" data-client-id="${referrer.id}">
        <div class="client-card-top">
          <strong>${escapeHtml(referrer.name)}</strong>
          <span class="badge active">${referredClients.length + referredLeads.length} referred</span>
        </div>
        <small>${names.map((n) => escapeHtml(n)).join(", ")}</small>
        <div class="client-card-foot"><span>Revenue from referrals</span><span>₹${revenue.toLocaleString("en-IN")}</span></div>
        ${pipelineValue ? `<div class="client-card-foot"><span>In pipeline (not yet won)</span><span>₹${pipelineValue.toLocaleString("en-IN")}</span></div>` : ""}
      </div>
    `;
  }).join("");

  referralsList.querySelectorAll("[data-client-id]").forEach((el) => el.addEventListener("click", () => openClientDrawer(el.dataset.clientId)));
}

/* ============================================================
   CONVERSION ANALYTICS (funnel from the leads collection)
   Filterable by lead source and date range; each stage row is clickable
   and expands a drill-down list of exactly which leads are in it, so you
   can go straight from "12 in Proposal" to opening one of them.
============================================================ */
const conversionFunnel = document.getElementById("conversionFunnel");
const conversionSourceFilter = document.getElementById("conversionSourceFilter");
const conversionRangeFilter = document.getElementById("conversionRangeFilter");
const conversionDrilldownCard = document.getElementById("conversionDrilldownCard");
const conversionDrilldownTitle = document.getElementById("conversionDrilldownTitle");
const conversionDrilldownList = document.getElementById("conversionDrilldownList");
let conversionExpandedStage = null;

function populateConversionSourceFilter() {
  if (!conversionSourceFilter) return;
  const current = conversionSourceFilter.value || "all";
  const sourcesInUse = [...new Set(leadsCache.map((l) => l.leadSource).filter(Boolean))];
  conversionSourceFilter.innerHTML = `<option value="all">All Sources</option>` +
    sourcesInUse.map((s) => `<option value="${escapeHtml(s)}">${escapeHtml(s)}</option>`).join("");
  conversionSourceFilter.value = sourcesInUse.includes(current) ? current : "all";
}

function conversionFilteredLeads() {
  const source = conversionSourceFilter?.value || "all";
  const range = conversionRangeFilter?.value || "all";
  let list = leadsCache;
  if (source !== "all") list = list.filter((l) => (l.leadSource || "Other") === source);
  if (range === "month") {
    const now = new Date();
    list = list.filter((l) => {
      const d = new Date(toMillis(l.createdAt));
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
  } else if (range === "30") {
    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    list = list.filter((l) => toMillis(l.createdAt) >= cutoff);
  }
  return list;
}

function renderConversionFunnel() {
  if (!conversionFunnel) return;
  populateConversionSourceFilter();

  const leads = conversionFilteredLeads();
  const stages = ["NEW", "CONTACTED", "QUALIFIED", "MEETING", "PROPOSAL", "NEGOTIATION", "WON"];
  // A lead "reached" a stage if it's currently there or anywhere further
  // along (including LOST, since it still passed through earlier stages).
  const stageIndex = (status) => status === "LOST" ? stages.length : stages.indexOf(status);
  const stageLeads = stages.map((s, idx) => leads.filter((l) => stageIndex(l.status || "NEW") >= idx));
  const counts = stageLeads.map((l) => l.length);
  const max = Math.max(1, counts[0]);

  conversionFunnel.innerHTML = `
    <div class="card-head"><h3>Lead Funnel${leads.length !== leadsCache.length ? ` <span class="kanban-count">${leads.length} of ${leadsCache.length} leads</span>` : ""}</h3></div>
    ${stages.map((s, idx) => {
      const count = counts[idx];
      const pct = Math.round((count / max) * 100);
      const dropoff = idx > 0 && counts[idx - 1] > 0 ? Math.round((count / counts[idx - 1]) * 100) : 100;
      return `
        <div class="bar-row" data-stage="${s}" style="cursor:pointer;">
          <div class="bar-row-top"><span>${s} ${conversionExpandedStage === s ? "▾" : "▸"}</span><span>${count}${idx > 0 ? ` (${dropoff}% of prior stage)` : ""}</span></div>
          <div class="bar-track"><div class="bar-fill" style="width:${pct}%;"></div></div>
        </div>
      `;
    }).join("")}
  `;

  conversionFunnel.querySelectorAll("[data-stage]").forEach((row) => {
    row.addEventListener("click", () => {
      const stage = row.dataset.stage;
      conversionExpandedStage = conversionExpandedStage === stage ? null : stage;
      renderConversionFunnel();
      if (conversionExpandedStage) {
        const idx = stages.indexOf(conversionExpandedStage);
        renderConversionDrilldown(conversionExpandedStage, stageLeads[idx]);
      } else if (conversionDrilldownCard) {
        conversionDrilldownCard.hidden = true;
      }
    });
  });
}

function renderConversionDrilldown(stage, leads) {
  if (!conversionDrilldownCard || !conversionDrilldownList) return;
  conversionDrilldownCard.hidden = false;
  if (conversionDrilldownTitle) conversionDrilldownTitle.textContent = `${stage} — ${leads.length} lead${leads.length === 1 ? "" : "s"}`;

  if (!leads.length) {
    conversionDrilldownList.innerHTML = `<div class="mini-empty">No leads at this stage.</div>`;
    return;
  }

  conversionDrilldownList.innerHTML = leads.map((l) => `
    <div class="client-card" data-drilldown-lead="${l.id}">
      <div class="client-card-top">
        <strong>${escapeHtml(l.name || l.company || "Lead")}</strong>
        <span class="badge ${leadStatusClass(l.status)}">${escapeHtml(l.status || "NEW")}</span>
      </div>
      <small>${escapeHtml(l.company || "")} • ${escapeHtml(l.leadSource || "")}</small>
      <div class="client-card-foot"><span>₹${(Number(l.estimatedValue) || 0).toLocaleString("en-IN")}</span><span>${escapeHtml(l.assignedTo || "")}</span></div>
    </div>
  `).join("");

  conversionDrilldownList.querySelectorAll("[data-drilldown-lead]").forEach((el) => {
    el.addEventListener("click", () => { switchTab("leads"); openLeadDrawer(el.dataset.drilldownLead); });
  });
}

conversionSourceFilter?.addEventListener("change", renderConversionFunnel);
conversionRangeFilter?.addEventListener("change", renderConversionFunnel);

/* ============================================================
   SETTINGS
============================================================ */
let settingsData = { businessName: "TUSDIO", supportEmail: "", hourlyRate: 0 };
const settingsForm = document.getElementById("settingsForm");
const settingsBusinessName = document.getElementById("settingsBusinessName");
const settingsSupportEmail = document.getElementById("settingsSupportEmail");
const settingsHourlyRate = document.getElementById("settingsHourlyRate");
const settingsMessage = document.getElementById("settingsMessage");

async function loadSettings() {
  try {
    const snap = await getDoc(doc(db, "settings", "business"));
    if (snap.exists()) settingsData = { ...settingsData, ...snap.data() };
  } catch (err) {
    console.error(err);
  }
  if (settingsBusinessName) settingsBusinessName.value = settingsData.businessName || "";
  if (settingsSupportEmail) settingsSupportEmail.value = settingsData.supportEmail || "";
  if (settingsHourlyRate) settingsHourlyRate.value = settingsData.hourlyRate || "";
}

settingsForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const payload = {
    businessName: settingsBusinessName?.value.trim() || "TUSDIO",
    supportEmail: settingsSupportEmail?.value.trim() || "",
    hourlyRate: Number(settingsHourlyRate?.value) || 0
  };
  try {
    await setDoc(doc(db, "settings", "business"), payload, { merge: true });
    settingsData = payload;
    await logActivity("Updated business settings", "info");
    showToast("Settings saved", "good");
    if (settingsMessage) settingsMessage.textContent = "Saved.";
    renderProfitability();
  } catch (err) {
    console.error(err);
    if (settingsMessage) settingsMessage.textContent = "Failed to save settings.";
  }
});


function renderActivity() {
  if (!activityFeed) return;
  if (!activityCache.length) {
    activityFeed.innerHTML = `<div class="mini-empty">No activity recorded yet.</div>`;
    return;
  }
  activityFeed.innerHTML = activityCache.map(activityItemHtml).join("");
}

/* ============================================================
   ROLES & PERMISSIONS

   IMPORTANT CAVEAT: this is UI-level gating only — it decides what this
   dashboard shows and lets you click. It is NOT a substitute for Firestore
   Security Rules; anyone who can reach your Firestore project directly
   (not through this UI) is only stopped by rules that check the same
   thing server-side. Add matching rules before relying on this for real
   protection of financial or admin data.
============================================================ */
const ROLES = ["SUPER_ADMIN", "ADMIN", "PROJECT_MANAGER", "DESIGNER", "DEVELOPER", "FINANCE", "VIEWER"];
const ADMIN_ROLES = ["SUPER_ADMIN", "ADMIN"];
const FINANCE_ROLES = ["SUPER_ADMIN", "ADMIN", "FINANCE"];
const RESTRICTED_TABS = { owners: ADMIN_ROLES, financeOverview: FINANCE_ROLES, invoices: FINANCE_ROLES, payments: FINANCE_ROLES, expenses: FINANCE_ROLES, profitability: FINANCE_ROLES, settings: ADMIN_ROLES };
let currentOwnerRole = "VIEWER";

async function computeCurrentOwnerRole(email) {
  if (email === OWNER_EMAIL.toLowerCase()) { currentOwnerRole = "SUPER_ADMIN"; return; }
  try {
    const snap = await getDoc(doc(db, "owners", makeDocId(email)));
    currentOwnerRole = snap.exists() ? (snap.data().role || "VIEWER") : "VIEWER";
  } catch (err) {
    console.error(err);
    currentOwnerRole = "VIEWER";
  }
}

function roleAllows(allowedRoles) {
  return allowedRoles.includes(currentOwnerRole);
}

/* Disables (doesn't hide — hiding would make it look like the feature
   doesn't exist) the nav buttons this role can't use, and intercepts
   clicks on them with an explanatory toast instead of switching tabs. */
function applyRolePermissionsToNav() {
  document.querySelectorAll("[data-tab]").forEach((el) => {
    const tab = el.dataset.tab;
    const allowed = RESTRICTED_TABS[tab];
    if (!allowed) return;
    if (!roleAllows(allowed)) {
      el.classList.add("is-soon");
      el.title = `Your role (${currentOwnerRole}) doesn't have access to this section.`;
    } else {
      el.classList.remove("is-soon");
      el.removeAttribute("title");
    }
  });
}

/* ============================================================
   OWNERS &amp; ROLES
============================================================ */
addOwnerForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!roleAllows(ADMIN_ROLES)) { showToast("Only Admins can grant owner access", "warn"); return; }
  const name = newOwnerName?.value.trim();
  const email = newOwnerEmail?.value.trim().toLowerCase();
  const role = newOwnerRole?.value || "VIEWER";
  if (!name || !email) { addOwnerMessage.textContent = "Name and email are required."; return; }

  try {
    await setDoc(doc(db, "owners", makeDocId(email)), {
      name, email, role, addedAt: new Date().toISOString(), addedBy: currentUser?.email || ""
    });
    await logActivity(`Granted owner access to ${name} as ${role}`, "good");
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
  const primary = { id: "primary", name: "Primary Owner", email: OWNER_EMAIL, primary: true, role: "SUPER_ADMIN" };
  const all = [primary, ...ownersCache];
  const canManage = roleAllows(ADMIN_ROLES);

  ownersList.innerHTML = all.map((o) => `
    <div class="client-card" style="cursor:default;">
      <div class="client-card-top">
        <strong>${escapeHtml(o.name || "Owner")}</strong>
        <span class="badge role-${(o.role || "viewer").toLowerCase()}">${escapeHtml(o.role || "VIEWER")}</span>
      </div>
      <small>${escapeHtml(o.email || "")}</small>
      ${!o.primary && canManage ? `
        <div class="form-grid" style="margin-top:8px;">
          <select class="request-status-select owner-role-select" data-owner-id="${o.id}">
            ${ROLES.filter((r) => r !== "SUPER_ADMIN").map((r) => `<option value="${r}" ${o.role === r ? "selected" : ""}>${r}</option>`).join("")}
          </select>
        </div>
        <div class="client-card-foot"><button class="btn-secondary revoke-owner-btn" data-owner-id="${o.id}" type="button" style="padding:8px 14px; font-size:12px;">Revoke Access</button></div>
      ` : !o.primary ? `<div class="client-card-foot"><span class="mini-meta">Only Admins can manage roles</span></div>` : ""}
    </div>
  `).join("");

  ownersList.querySelectorAll(".owner-role-select").forEach((select) => {
    select.addEventListener("change", async (e) => {
      try {
        await updateDoc(doc(db, "owners", select.dataset.ownerId), { role: select.value });
        await logActivity(`Changed an owner's role to ${select.value}`, "info");
        showToast("Role updated", "good");
        await loadOwners();
      } catch (err) { console.error(err); showToast("Couldn't update role", "danger"); }
    });
  });

  ownersList.querySelectorAll(".revoke-owner-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      if (!roleAllows(ADMIN_ROLES)) { showToast("Only Admins can revoke owner access", "warn"); return; }
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
  await computeCurrentOwnerRole(email);
  renderOwnerNavbar(user);

  await Promise.all([
    loadClients(),
    loadRequests(),
    loadOwners(),
    loadTimeLogs(),
    loadActivity(),
    loadFreebieDownloads(),
    loadFreebieLogins(),
    loadLeads(),
    loadInvoices(),
    loadTransactions(),
    loadExpenses(),
    loadTeam(),
    loadProposals(),
    loadContracts(),
    loadWebsiteIntel(),
    loadSettings()
  ]);
  applyRolePermissionsToNav();
  switchTab("overview");
});

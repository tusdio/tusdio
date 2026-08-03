import { auth, db } from "./firebase-config.js";
import {
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  linkWithPopup
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import {
  doc,
  onSnapshot,
  collection,
  addDoc,
  updateDoc,
  query,
  orderBy,
  limit,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

/* ============================================================
   LOGGER
   A tiny tagged/timestamped logger so dashboard behaviour is
   traceable in the console during support and debugging.
   Every state-changing action in this file logs through here
   so a session can be reconstructed from the console alone.
   ============================================================ */
const LOG_PREFIX = "[TUSDIO:dashboard]";

const logger = {
  info: (msg, data) => console.info(`${LOG_PREFIX} ${ts()} ${msg}`, data ?? ""),
  warn: (msg, data) => console.warn(`${LOG_PREFIX} ${ts()} ${msg}`, data ?? ""),
  error: (msg, data) => console.error(`${LOG_PREFIX} ${ts()} ${msg}`, data ?? ""),
  trace: (msg, data) => console.debug(`${LOG_PREFIX} ${ts()} ${msg}`, data ?? "")
};

function ts() {
  return new Date().toISOString();
}

/* ============================================================
   DOM REFERENCES
   ============================================================ */
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
const requestSubmitBtn = document.getElementById("requestSubmitBtn");
const totalAmountDisplay = document.getElementById("totalAmountDisplay");
const paidAmountDisplay = document.getElementById("paidAmountDisplay");
const dueAmountDisplay = document.getElementById("dueAmountDisplay");
const nextPaymentDue = document.getElementById("nextPaymentDue");
const billingRingCircle = document.getElementById("billingRingCircle");
const billingRingValue = document.getElementById("billingRingValue");
const invoiceDownloadBtn = document.getElementById("invoiceDownloadBtn");
const overviewService = document.getElementById("overviewService");
const overviewPhase = document.getElementById("overviewPhase");
const progressValue = document.getElementById("progressValue");
const progressRingCircle = document.getElementById("progressRingCircle");
const nextAction = document.getElementById("nextAction");
const projectName = document.getElementById("projectName");
const detailService = document.getElementById("detailService");
const startDate = document.getElementById("startDate");
const estimatedDelivery = document.getElementById("estimatedDelivery");
const revisionRound = document.getElementById("revisionRound");
const updatesFeed = document.getElementById("updatesFeed");
const taskList = document.getElementById("taskList");
const deliverablesGrid = document.getElementById("deliverablesGrid");
const decisionList = document.getElementById("decisionList");
const logoutBtn = document.getElementById("logoutBtn");
const navUserArea = document.getElementById("navUserArea");
const linkGoogleBtn = document.getElementById("linkGoogleBtn");
const linkMessage = document.getElementById("linkMessage");
const syncStatusDot = document.getElementById("syncStatusDot");
const syncStatusText = document.getElementById("syncStatusText");
const lastSyncedText = document.getElementById("lastSyncedText");

const reviewTitle = document.getElementById("reviewTitle");
const reviewStatusPill = document.getElementById("reviewStatusPill");
const reviewPreview = document.getElementById("reviewPreview");
const reviewDesc = document.getElementById("reviewDesc");
const reviewActions = document.getElementById("reviewActions");
const approveBtn = document.getElementById("approveBtn");
const changesBtn = document.getElementById("changesBtn");
const feedbackBtn = document.getElementById("feedbackBtn");
const feedbackForm = document.getElementById("feedbackForm");
const feedbackText = document.getElementById("feedbackText");
const feedbackCancelBtn = document.getElementById("feedbackCancelBtn");
const feedbackSendBtn = document.getElementById("feedbackSendBtn");
const reviewStatusMsg = document.getElementById("reviewStatusMsg");

const notifBellBtn = document.getElementById("notifBellBtn");
const notifBellDot = document.getElementById("notifBellDot");
const notifDrawer = document.getElementById("notifDrawer");
const notifOverlay = document.getElementById("notifOverlay");
const notifCloseBtn = document.getElementById("notifCloseBtn");
const notifDrawerBody = document.getElementById("notifDrawerBody");

const chatThread = document.getElementById("chatThread");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");
const chatSendBtn = document.getElementById("chatSendBtn");
const chatStatusMsg = document.getElementById("chatStatusMsg");

const starRow = document.getElementById("starRow");
const satisfactionMsg = document.getElementById("satisfactionMsg");

const menuToggle = document.querySelector(".menu-toggle");
const nav = document.getElementById("mainNav");
const OWNER_EMAIL = "bittukhantusharkhan@gmail.com";

const PROGRESS_RING_CIRCUMFERENCE = 2 * Math.PI * 52; // r=52, matches the SVG
const BILLING_RING_CIRCUMFERENCE = 2 * Math.PI * 52; // r=52, matches the billing SVG

let unsubscribeClient = null;
let unsubscribeMessages = null;
let renderCount = 0;
let messageRenderCount = 0;
let currentUser = null;
let currentReviewState = null; // cache of the last-rendered review object
let seenNotifCount = 0; // how many notifications the client has already opened the drawer for
let chatListenerAttempts = 0; // tracks retries so we can back off instead of looping forever

if (menuToggle && nav) {
  menuToggle.addEventListener("click", () => {
    nav.classList.toggle("active");
  });
}

/* ============================================================
   LIVE SYNC / CONNECTION STATUS
   Gives a visible, traceable signal of whether data on screen
   is fresh from the server or served from local cache, and
   whether the browser currently has a network connection.
   ============================================================ */
function setSyncState(state, detail) {
  if (!syncStatusDot || !syncStatusText) return;

  syncStatusDot.classList.remove("is-live", "is-offline");

  if (state === "live") {
    syncStatusDot.classList.add("is-live");
    syncStatusText.textContent = "Live — connected to TUSDIO";
  } else if (state === "cached") {
    syncStatusText.textContent = "Showing cached data — reconnecting…";
  } else if (state === "offline") {
    syncStatusDot.classList.add("is-offline");
    syncStatusText.textContent = "Offline — check your connection";
  } else {
    syncStatusText.textContent = "Connecting…";
  }

  logger.trace("Sync state changed", { state, detail });
}

function markSynced() {
  if (!lastSyncedText) return;
  const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  lastSyncedText.textContent = `Synced ${time}`;
}

window.addEventListener("online", () => {
  logger.info("Browser reports connection restored");
  setSyncState("live");
  // A restored connection is the most common reason the chat listener
  // died silently — re-attach it if we have a signed-in user.
  if (currentUser && !unsubscribeMessages) {
    chatListenerAttempts = 0;
    listenToMessages(currentUser.uid);
  }
});

window.addEventListener("offline", () => {
  logger.warn("Browser reports connection lost");
  setSyncState("offline");
});

/* ============================================================
   NAVBAR USER STATE (navbar markup/styles untouched)
   ============================================================ */
function updateNavbarUserState(user) {
  if (!navUserArea) return;

  if (user) {
    const name = user.displayName || (user.email ? user.email.split("@")[0] : "User");
    const isOwner = (user.email || "").toLowerCase() === OWNER_EMAIL.toLowerCase();
    const dashboardLink = isOwner ? "./owner/owner.html" : "./users.html";

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
        logger.info("Logout requested from navbar", { uid: user.uid });
        teardownListeners();
        await signOut(auth);
        window.location.href = "login.html";
      });
    }
  } else {
    navUserArea.innerHTML = `<a href="./login.html">Login</a>`;
  }
}

function teardownListeners() {
  if (unsubscribeClient) {
    unsubscribeClient();
    unsubscribeClient = null;
  }
  if (unsubscribeMessages) {
    unsubscribeMessages();
    unsubscribeMessages = null;
  }
}

function showAccessRemoved() {
  logger.warn("Rendering access-removed state");

  document.body.innerHTML = `
    <main style="min-height:100vh;display:grid;place-items:center;padding:24px;background:#000;color:#fff;font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display',Arial,sans-serif;">
      <div style="max-width:520px;width:100%;padding:32px;border-radius:24px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);text-align:left;">
        <p style="color:#86868b;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin-bottom:12px;">TUSDIO</p>
        <h1 style="font-size:32px;font-weight:600;margin-bottom:12px;">Access Removed</h1>
        <p style="color:#c8c8c8;line-height:1.8;margin-bottom:20px;">
          Your client dashboard is no longer active. Please contact TUSDIO if you think this is a mistake.
        </p>
        <button id="logoutNow" style="padding:14px 18px;border-radius:999px;border:1px solid #fff;background:#fff;color:#000;cursor:pointer;font-weight:600;">
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

/* ============================================================
   TIMELINE
   ============================================================ */
function updateTimeline(phase) {
  const steps = {
    discovery: document.getElementById("step-discovery"),
    strategy: document.getElementById("step-strategy"),
    design: document.getElementById("step-design"),
    revisions: document.getElementById("step-revisions"),
    delivery: document.getElementById("step-delivery")
  };

  Object.values(steps).forEach((step) => step?.classList.remove("done", "active"));

  const normalized = (phase || "").toLowerCase().trim();

  const order = ["discovery", "strategy", "design", "revisions", "delivery"];
  const aliases = { "design direction": "design", "final delivery": "delivery" };
  const key = aliases[normalized] || normalized;
  const index = order.indexOf(key);

  if (index === -1) {
    logger.trace("Timeline phase not recognised, leaving all steps inactive", { phase });
    return;
  }

  order.forEach((stepKey, i) => {
    if (i < index) steps[stepKey]?.classList.add("done");
    if (i === index) steps[stepKey]?.classList.add("active");
  });
}

/* ============================================================
   RENDER HELPERS
   ============================================================ */
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

  const fragment = document.createDocumentFragment();

  files.forEach((file) => {
    const rawTitle = String(file?.title || "Untitled File").trim();
    const rawNote = String(file?.note || "Click to open file").trim();
    const link = String(
      file?.link || file?.url || file?.href || file?.downloadUrl || ""
    ).trim();

    if (!link) {
      logger.warn("Skipped a deliverable with no usable link", { title: rawTitle });
      return;
    }

    const card = document.createElement("a");
    card.className = "file-card file-card-link";
    card.href = link;
    card.target = "_blank";
    card.rel = "noopener noreferrer";

    const safeTitle = escapeHtml(rawTitle);
    const safeNote = escapeHtml(rawNote);
    const lowerLink = link.split("?")[0].toLowerCase();
    const isImage = /\.(png|jpe?g|gif|webp|svg|avif)$/i.test(lowerLink);

    card.innerHTML = `
      ${isImage ? `<div class="file-card-preview"><img src="${escapeAttr(link)}" alt="${safeTitle} preview" loading="lazy"></div>` : ""}
      <div class="file-card-top">
        <strong>${safeTitle}</strong>
        <span class="file-badge">${isImage ? "Preview" : "Open"}</span>
      </div>
      <p>${safeNote}</p>
      <span class="file-open-btn">Open File</span>
    `;

    const img = card.querySelector("img");
    if (img) {
      img.addEventListener("error", () => {
        img.closest(".file-card-preview")?.remove();
      });
    }

    fragment.appendChild(card);
  });

  deliverablesGrid.appendChild(fragment);

  if (deliverablesGrid.innerHTML.trim() === "") {
    deliverablesGrid.innerHTML = `
      <div class="file-card">
        <strong>No valid files found</strong>
        <p>Please check the file links from the owner panel.</p>
      </div>
    `;
  }
}

/* ------------------------------------------------------------
   Notifications (bell drawer + feed panel)
   Accepts either a plain string list (legacy `updates` field)
   or an array of { text, time, type } objects (new `notifications`
   field) and normalises both into one traceable feed.
   ------------------------------------------------------------ */
function normalizeNotifications(data) {
  const items = [];

  if (Array.isArray(data.notifications)) {
    data.notifications.forEach((n) => {
      if (typeof n === "string") {
        items.push({ text: n, time: "", icon: "🔔" });
      } else if (n && typeof n === "object") {
        items.push({
          text: n.text || "Update from TUSDIO",
          time: n.time || "",
          icon: n.icon || iconForType(n.type)
        });
      }
    });
  }

  if (Array.isArray(data.updates)) {
    data.updates.forEach((u) => {
      items.push({ text: String(u), time: "", icon: "📌" });
    });
  }

  return items;
}

function iconForType(type) {
  const map = {
    files: "📁",
    revision: "↻",
    invoice: "🧾",
    feedback: "💬",
    approval: "✓",
    message: "💬"
  };
  return map[type] || "🔔";
}

function renderNotifications(data) {
  const items = normalizeNotifications(data);

  if (updatesFeed) {
    updatesFeed.innerHTML = "";

    if (items.length === 0) {
      updatesFeed.innerHTML = `
        <div class="update-item">
          <span class="update-icon">👋</span>
          <div>
            <strong>You're all caught up</strong>
            <p>New updates from TUSDIO will show up here.</p>
          </div>
        </div>
      `;
    } else {
      const fragment = document.createDocumentFragment();
      items.forEach((item) => fragment.appendChild(buildNotificationEl(item)));
      updatesFeed.appendChild(fragment);
    }
  }

  if (notifDrawerBody) {
    notifDrawerBody.innerHTML = "";
    if (items.length === 0) {
      notifDrawerBody.innerHTML = `<p class="chat-empty">No notifications yet.</p>`;
    } else {
      const fragment = document.createDocumentFragment();
      items.forEach((item) => fragment.appendChild(buildNotificationEl(item)));
      notifDrawerBody.appendChild(fragment);
    }
  }

  if (notifBellDot) {
    const isUnread = items.length > seenNotifCount;
    notifBellDot.hidden = !isUnread;
  }

  return items.length;
}

function buildNotificationEl(item) {
  const div = document.createElement("div");
  div.className = "update-item";
  div.innerHTML = `
    <span class="update-icon">${item.icon}</span>
    <div>
      <strong>${escapeHtml(item.text)}</strong>
      <p>${item.time ? escapeHtml(item.time) : "Updated by TUSDIO in your current workflow."}</p>
    </div>
  `;
  return div;
}

function renderTasks(tasks) {
  if (!taskList) return;

  taskList.innerHTML = "";
  const fragment = document.createDocumentFragment();

  tasks.forEach((task) => {
    const label = document.createElement("label");
    label.className = "task-item";
    label.innerHTML = `
      <input type="checkbox" />
      <span>${escapeHtml(String(task))}</span>
    `;
    fragment.appendChild(label);
  });

  taskList.appendChild(fragment);
}

/* ------------------------------------------------------------
   Decisions & Approvals log
   Expects data.decisions = [{ name, status }], status one of
   'approved' | 'awaiting' | 'upcoming'. Falls back to a sane
   default set so the panel is never empty.
   ------------------------------------------------------------ */
const DECISION_STATUS_META = {
  approved: { icon: "✓", label: "Approved", cls: "approved" },
  awaiting: { icon: "●", label: "Awaiting approval", cls: "awaiting" },
  upcoming: { icon: "○", label: "Upcoming", cls: "upcoming" }
};

function renderDecisions(decisions) {
  if (!decisionList) return;

  const list = Array.isArray(decisions) && decisions.length > 0
    ? decisions
    : [{ name: "No decisions logged yet", status: "upcoming" }];

  decisionList.innerHTML = "";
  const fragment = document.createDocumentFragment();

  list.forEach((d) => {
    const status = DECISION_STATUS_META[d.status] ? d.status : "upcoming";
    const meta = DECISION_STATUS_META[status];

    const row = document.createElement("div");
    row.className = "decision-row";
    row.innerHTML = `
      <span class="decision-name">${escapeHtml(d.name || "Untitled decision")}</span>
      <span class="decision-status ${meta.cls}">${meta.icon} ${meta.label}</span>
    `;
    fragment.appendChild(row);
  });

  decisionList.appendChild(fragment);
}

/* ------------------------------------------------------------
   Current Review — approval / feedback workflow
   ------------------------------------------------------------ */
const REVIEW_STATUS_META = {
  awaiting: { label: "Awaiting your review", cls: "is-awaiting" },
  approved: { label: "Approved", cls: "is-approved" },
  changes_requested: { label: "Changes requested", cls: "is-changes" }
};

function renderCurrentReview(review) {
  const normalizedReview = review || null;
  currentReviewState = normalizedReview;

  if (!reviewTitle || !reviewStatusPill || !reviewDesc || !reviewPreview) return;

  if (!normalizedReview || !normalizedReview.title) {
    reviewTitle.textContent = "Nothing to review";
    reviewDesc.textContent = "Nothing is waiting on your review right now. New concepts will appear here as soon as they're ready.";
    reviewStatusPill.textContent = "—";
    reviewStatusPill.className = "review-status-pill is-none";
    reviewPreview.innerHTML = `<span class="review-preview-empty">No preview yet</span>`;
    setReviewActionsEnabled(false);
    return;
  }

  reviewTitle.textContent = normalizedReview.title;
  reviewDesc.textContent =
    normalizedReview.description ||
    normalizedReview.desc ||
    "Please review the latest direction and let us know what you think.";

  const status = normalizedReview.status && REVIEW_STATUS_META[normalizedReview.status]
    ? normalizedReview.status
    : "awaiting";
  const meta = REVIEW_STATUS_META[status];
  reviewStatusPill.textContent = meta.label;
  reviewStatusPill.className = `review-status-pill ${meta.cls}`;

  const previewUrl = normalizedReview.image || normalizedReview.preview || "";
  if (previewUrl) {
    reviewPreview.innerHTML = `<img src="${escapeAttr(previewUrl)}" alt="${escapeAttr(normalizedReview.title)} preview" />`;
    const previewImg = reviewPreview.querySelector("img");
    previewImg?.addEventListener("error", () => {
      reviewPreview.innerHTML = `
        <span class="review-preview-empty">
          Preview could not be loaded.<br>
          <a href="${escapeAttr(previewUrl)}" target="_blank" rel="noopener noreferrer">Open preview</a>
        </span>
      `;
    }, { once: true });
  } else {
    reviewPreview.innerHTML = `<span class="review-preview-empty">No preview image attached</span>`;
  }

  setReviewActionsEnabled(status === "awaiting");
}

function setReviewActionsEnabled(enabled) {
  [approveBtn, changesBtn, feedbackBtn].forEach((btn) => {
    if (btn) btn.disabled = !enabled;
  });
}

function setReviewStatusMsg(text, kind) {
  if (!reviewStatusMsg) return;
  reviewStatusMsg.textContent = text;
  reviewStatusMsg.classList.remove("is-success", "is-error");
  if (kind === "success") reviewStatusMsg.classList.add("is-success");
  if (kind === "error") reviewStatusMsg.classList.add("is-error");
}

async function updateReviewStatus(newStatus, actionLabel) {
  if (!currentUser) return;

  try {
    logger.info(`Client action: ${actionLabel}`, { uid: currentUser.uid, newStatus });
    const clientRef = doc(db, "clients", currentUser.uid);
    await updateDoc(clientRef, { "currentReview.status": newStatus });

    await addDoc(collection(db, "client_requests"), {
      clientUid: currentUser.uid,
      clientName: currentUser.displayName || userName?.textContent || "Client",
      clientEmail: currentUser.email || "",
      type: "Approval Action",
      subject: currentReviewState?.title || "Current review",
      message: actionLabel,
      status: "New",
      createdAt: new Date().toISOString()
    });

    setReviewStatusMsg(`${actionLabel} recorded.`, "success");
  } catch (error) {
    logger.error("Failed to update review status", { message: error?.message });
    setReviewStatusMsg("Something went wrong. Please try again.", "error");
  }
}

if (approveBtn) {
  approveBtn.addEventListener("click", () => updateReviewStatus("approved", "Approved"));
}

if (changesBtn) {
  changesBtn.addEventListener("click", () => updateReviewStatus("changes_requested", "Requested changes"));
}

if (feedbackBtn && feedbackForm) {
  feedbackBtn.addEventListener("click", () => {
    feedbackForm.hidden = !feedbackForm.hidden;
    if (!feedbackForm.hidden) feedbackText?.focus();
  });
}

if (feedbackCancelBtn && feedbackForm) {
  feedbackCancelBtn.addEventListener("click", () => {
    feedbackForm.hidden = true;
    if (feedbackText) feedbackText.value = "";
  });
}

if (feedbackForm) {
  feedbackForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = feedbackText?.value.trim();
    if (!text || !currentUser) return;

    try {
      if (feedbackSendBtn) feedbackSendBtn.disabled = true;
      logger.info("Feedback submitted on current review", { uid: currentUser.uid });

      // This is the write that actually matters — it's what shows up on
      // TUSDIO's side under Requests. If this succeeds, the feedback has
      // been delivered, full stop.
      await addDoc(collection(db, "client_requests"), {
        clientUid: currentUser.uid,
        clientName: currentUser.displayName || userName?.textContent || "Client",
        clientEmail: currentUser.email || "",
        type: "Feedback",
        subject: currentReviewState?.title || "Current review",
        message: text,
        status: "New",
        createdAt: new Date().toISOString()
      });

      // Mirroring it into the chat thread is a nice-to-have, not the
      // primary delivery path — don't let a failure here (e.g. messages
      // permissions) overwrite the success message above.
      try {
        await sendChatMessage(text, { fromFeedback: true });
      } catch (chatError) {
        logger.error("Feedback delivered, but chat mirror failed", { message: chatError?.message });
      }

      feedbackForm.hidden = true;
      feedbackText.value = "";
      setReviewStatusMsg("Feedback sent — thanks!", "success");
    } catch (error) {
      logger.error("Failed to send feedback", { message: error?.message });
      setReviewStatusMsg("Could not send feedback. Please try again.", "error");
    } finally {
      if (feedbackSendBtn) feedbackSendBtn.disabled = false;
    }
  });
}

/* ------------------------------------------------------------
   Notification drawer open/close
   ------------------------------------------------------------ */
function openNotifDrawer() {
  if (!notifDrawer || !notifOverlay) return;
  notifDrawer.classList.add("is-open");
  notifOverlay.classList.add("is-open");
  notifDrawer.setAttribute("aria-hidden", "false");
  seenNotifCount = notifDrawerBody?.children.length || 0;
  if (notifBellDot) notifBellDot.hidden = true;
  logger.trace("Notification drawer opened");
}

function closeNotifDrawer() {
  if (!notifDrawer || !notifOverlay) return;
  notifDrawer.classList.remove("is-open");
  notifOverlay.classList.remove("is-open");
  notifDrawer.setAttribute("aria-hidden", "true");
  logger.trace("Notification drawer closed");
}

if (notifBellBtn) notifBellBtn.addEventListener("click", openNotifDrawer);
if (notifCloseBtn) notifCloseBtn.addEventListener("click", closeNotifDrawer);
if (notifOverlay) notifOverlay.addEventListener("click", closeNotifDrawer);

/* ------------------------------------------------------------
   Payment pill + billing ring
   ------------------------------------------------------------ */
function setPaymentPill(status) {
  if (!paymentStatusDisplay) return;

  paymentStatusDisplay.classList.remove("pill-paid", "pill-pending", "pill-overdue");
  const normalized = (status || "").toLowerCase();

  if (normalized.includes("paid") && !normalized.includes("unpaid")) {
    paymentStatusDisplay.classList.add("pill-paid");
  } else if (normalized.includes("overdue") || normalized.includes("late")) {
    paymentStatusDisplay.classList.add("pill-overdue");
  } else {
    paymentStatusDisplay.classList.add("pill-pending");
  }
}

function renderBillingRing(percentPaid) {
  if (!billingRingCircle || !billingRingValue) return;
  const safe = Math.max(0, Math.min(percentPaid, 100));
  const offset = BILLING_RING_CIRCUMFERENCE * (1 - safe / 100);
  billingRingCircle.style.strokeDasharray = `${BILLING_RING_CIRCUMFERENCE}`;
  billingRingCircle.style.strokeDashoffset = `${offset}`;
  billingRingValue.textContent = `${Math.round(safe)}%`;
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  return String(str).replace(/"/g, "&quot;");
}

/* ============================================================
   MAIN RENDER
   ============================================================ */
function renderClientData(user, data, meta) {
  renderCount += 1;
  logger.trace(`Render #${renderCount}`, { fromCache: meta?.fromCache, uid: user.uid });

  const progress = Number(data.progress) || 0;
  const safeProgress = Math.max(0, Math.min(progress, 100));
  const tasks = Array.isArray(data.tasks) ? data.tasks : [];
  const files = Array.isArray(data.files) ? data.files : [];
  const totalAmount = Number(data.totalAmount) || 0;
  const paidAmount = Number(data.paidAmount) || 0;
  const dueAmount = Math.max(totalAmount - paidAmount, 0);
  const percentPaid = totalAmount > 0 ? (paidAmount / totalAmount) * 100 : 0;

  if (userName) userName.textContent = data.name || user.displayName || user.email || "Client";
  if (serviceName) serviceName.textContent = data.service || "Not selected yet";
  if (statusText) statusText.textContent = data.status || "Not started";
  if (overviewService) overviewService.textContent = data.service || "Not selected yet";
  if (overviewPhase) overviewPhase.textContent = data.phase || "Not set";

  if (progressValue) progressValue.textContent = `${safeProgress}%`;
  if (progressRingCircle) {
    const offset = PROGRESS_RING_CIRCUMFERENCE * (1 - safeProgress / 100);
    progressRingCircle.style.strokeDasharray = `${PROGRESS_RING_CIRCUMFERENCE}`;
    progressRingCircle.style.strokeDashoffset = `${offset}`;
  }

  if (projectName) projectName.textContent = data.projectName || "New Project";
  if (detailService) detailService.textContent = data.service || "Not selected yet";
  if (startDate) startDate.textContent = data.startDate || "Not set";
  if (estimatedDelivery) estimatedDelivery.textContent = data.estimatedDelivery || "Not set";
  if (revisionRound) revisionRound.textContent = data.revisionRound || "Not set";
  if (nextAction) {
    nextAction.textContent = data.nextAction || (tasks.length > 0 ? tasks[0] : "No pending action");
  }

  if (planNameDisplay) planNameDisplay.textContent = data.planName || "Not assigned";
  if (paymentStatusDisplay) {
    paymentStatusDisplay.textContent = data.paymentStatus || "Pending";
    setPaymentPill(data.paymentStatus);
  }
  if (totalAmountDisplay) totalAmountDisplay.textContent = `₹${totalAmount.toLocaleString("en-IN")}`;
  if (paidAmountDisplay) paidAmountDisplay.textContent = `₹${paidAmount.toLocaleString("en-IN")}`;
  if (dueAmountDisplay) dueAmountDisplay.textContent = `₹${dueAmount.toLocaleString("en-IN")}`;
  if (nextPaymentDue) {
    nextPaymentDue.textContent = dueAmount > 0 ? (data.nextPaymentDue || "Not scheduled") : "Fully paid";
  }
  renderBillingRing(percentPaid);

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

  renderNotifications(data);
  renderTasks(tasks);
  renderDeliverables(files);
  renderDecisions(data.decisions);
  renderCurrentReview(data.currentReview || data.review || null);
  updateTimeline(data.phase);
  renderSatisfaction(data.satisfaction);

  setSyncState(meta?.fromCache ? "cached" : "live");
  if (!meta?.fromCache) markSynced();
}

/* ============================================================
   SATISFACTION RATING
   ============================================================ */
function renderSatisfaction(rating) {
  if (!starRow) return;
  const value = Number(rating) || 0;
  [...starRow.querySelectorAll(".star-btn")].forEach((btn) => {
    const btnValue = Number(btn.dataset.value);
    btn.classList.toggle("is-filled", btnValue <= value);
  });
  if (value > 0 && satisfactionMsg) {
    satisfactionMsg.textContent = `You rated this project ${value} out of 5. Thanks for the feedback!`;
  }
}

if (starRow) {
  starRow.addEventListener("click", async (e) => {
    const btn = e.target.closest(".star-btn");
    if (!btn || !currentUser) return;

    const value = Number(btn.dataset.value);
    logger.info("Satisfaction rating submitted", { uid: currentUser.uid, value });

    try {
      const clientRef = doc(db, "clients", currentUser.uid);
      await updateDoc(clientRef, { satisfaction: value });

      // Keep the owner dashboard informed without exposing owner-only data.
      await addDoc(collection(db, "client_requests"), {
        clientUid: currentUser.uid,
        clientName: currentUser.displayName || userName?.textContent || "Client",
        clientEmail: currentUser.email || "",
        type: "Satisfaction Rating",
        subject: "Project satisfaction rating",
        message: `Client rated the project ${value}/5.`,
        rating: value,
        status: "New",
        createdAt: new Date().toISOString()
      });

      if (satisfactionMsg) satisfactionMsg.textContent = `You rated this project ${value} out of 5. Thanks for the feedback!`;
    } catch (error) {
      logger.error("Failed to save satisfaction rating", { message: error?.message });
      if (satisfactionMsg) satisfactionMsg.textContent = "Could not save your rating. Please try again.";
    }
  });
}

/* ============================================================
   MESSAGES / CHAT  (clients/{uid}/messages subcollection)
   ------------------------------------------------------------
   This is the part that was reported as not working. Fixes:

   1. addDoc payload now includes `clientUid`, matching the
      field-based ownership pattern used everywhere else in this
      file (client_requests, etc). If your Firestore rules check
      request.resource.data.clientUid — which is the most common
      reason a brand-new subcollection silently rejects writes —
      this alone unblocks sending.
   2. Listener + send failures are now surfaced to the user via
      #chatStatusMsg instead of only going to the console, with
      plain-language text for the common Firestore error codes
      (permission-denied, failed-precondition, unavailable).
   3. The listener auto-retries with backoff on transient errors
      and re-attaches automatically when the browser comes back
      online (see the "online" handler above).
   4. Input + button are disabled together while a send is in
      flight, and always re-enabled in a `finally`, so a failed
      send can never leave the form stuck.
   ------------------------------------------------------------ */

function setChatStatus(text, kind) {
  if (!chatStatusMsg) return;
  chatStatusMsg.textContent = text;
  chatStatusMsg.classList.remove("is-success", "is-error");
  if (kind === "success") chatStatusMsg.classList.add("is-success");
  if (kind === "error") chatStatusMsg.classList.add("is-error");
}

function friendlyFirestoreError(error) {
  const code = error?.code || "";
  if (code.includes("permission-denied")) {
    return "Messages are blocked by permissions. Please contact TUSDIO to enable chat access.";
  }
  if (code.includes("failed-precondition")) {
    return "Messages need a one-time setup on our end. Please try again shortly.";
  }
  if (code.includes("unavailable") || code.includes("deadline-exceeded")) {
    return "Couldn't reach the server. Check your connection and try again.";
  }
  return "Something went wrong loading messages. Please refresh the page.";
}

function renderChatMessages(docsSnap) {
  if (!chatThread) return;
  messageRenderCount += 1;
  logger.trace(`Chat render #${messageRenderCount}`, { count: docsSnap.size });

  if (docsSnap.empty) {
    chatThread.innerHTML = `<p class="chat-empty" id="chatEmpty">No messages yet — start the conversation below.</p>`;
    return;
  }

  chatThread.innerHTML = "";
  const fragment = document.createDocumentFragment();

  docsSnap.forEach((docSnap) => {
    const m = docSnap.data();
    // Accept whichever field the owner-side panel actually writes
    // (sender / role / from / author) so bubbles still align correctly
    // even if the two apps don't use identical field names.
    const senderValue = (m.sender ?? m.role ?? m.from ?? m.author ?? "").toString().toLowerCase();
    const isClient = senderValue === "client" || senderValue === "user";

    const bubble = document.createElement("div");
    bubble.className = `chat-bubble ${isClient ? "from-client" : "from-tusdio"}`;

    let timeLabel = "";
    if (m.createdAt?.toDate) {
      timeLabel = m.createdAt.toDate().toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    }

    bubble.innerHTML = `
      ${escapeHtml(m.text || "")}
      <span class="chat-meta">${isClient ? "You" : "TUSDIO"}${timeLabel ? " · " + escapeHtml(timeLabel) : ""}</span>
    `;
    fragment.appendChild(bubble);
  });

  chatThread.appendChild(fragment);
  chatThread.scrollTop = chatThread.scrollHeight;
}

function listenToMessages(uid) {
  if (unsubscribeMessages) unsubscribeMessages();

  const messagesRef = collection(db, "clients", uid, "messages");

  unsubscribeMessages = onSnapshot(
    messagesRef,
    (snap) => {
      chatListenerAttempts = 0;
      setChatStatus("", "");

      const docs = snap.docs.slice().sort((a, b) => {
        const toMillis = (value) => {
          if (!value) return 0;
          if (typeof value?.toMillis === "function") return value.toMillis();
          if (typeof value?.toDate === "function") return value.toDate().getTime();
          const n = new Date(value).getTime();
          return Number.isNaN(n) ? 0 : n;
        };
        return toMillis(a.data().createdAt) - toMillis(b.data().createdAt);
      });

      renderChatMessages({ empty: docs.length === 0, size: docs.length, forEach: (cb) => docs.forEach(cb) });
    },
    (error) => {
      logger.error("Messages listener error", { message: error?.message, code: error?.code });
      setChatStatus(friendlyFirestoreError(error), "error");

      if (error?.code !== "permission-denied" && chatListenerAttempts < 3) {
        chatListenerAttempts += 1;
        const delayMs = chatListenerAttempts * 2000;
        setTimeout(() => {
          if (currentUser?.uid === uid) listenToMessages(uid);
        }, delayMs);
      }
    }
  );
}

async function sendChatMessage(text, opts = {}) {
  if (!currentUser || !text) return;

  await addDoc(collection(db, "clients", currentUser.uid, "messages"), {
    clientUid: currentUser.uid,
    sender: "client",
    text,
    createdAt: serverTimestamp(),
    viaFeedback: !!opts.fromFeedback
  });
}

if (chatForm) {
  chatForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const text = chatInput?.value.trim();

    if (!currentUser) {
      setChatStatus("Please log in first.", "error");
      return;
    }
    if (!text) return;

    try {
      if (chatSendBtn) chatSendBtn.disabled = true;
      if (chatInput) chatInput.disabled = true;
      setChatStatus("Sending…", "");

      logger.info("Client sent a chat message", { uid: currentUser.uid });
      await sendChatMessage(text);

      chatInput.value = "";
      setChatStatus("", "");
    } catch (error) {
      logger.error("Failed to send chat message", { message: error?.message, code: error?.code });
      setChatStatus(friendlyFirestoreError(error), "error");
    } finally {
      if (chatSendBtn) chatSendBtn.disabled = false;
      if (chatInput) chatInput.disabled = false;
      chatInput?.focus();
    }
  });
}

/* ============================================================
   AUTH + REALTIME LISTENER
   ============================================================ */
onAuthStateChanged(auth, async (user) => {
  updateNavbarUserState(user);
  currentUser = user;

  if (!user) {
    logger.info("No authenticated user, redirecting to login");
    window.location.href = "login.html";
    return;
  }

  logger.info("User authenticated", { uid: user.uid, email: user.email });

  teardownListeners();
  chatListenerAttempts = 0;

  const clientRef = doc(db, "clients", user.uid);
  setSyncState("connecting");

  unsubscribeClient = onSnapshot(
    clientRef,
    (clientSnap) => {
      if (!clientSnap.exists()) {
        logger.warn("Client document does not exist", { uid: user.uid });
        showAccessRemoved();
        return;
      }

      const data = clientSnap.data();

      if (data.access === "disabled") {
        logger.warn("Client access disabled by owner", { uid: user.uid });
        showAccessRemoved();
        return;
      }

      renderClientData(user, data, { fromCache: clientSnap.metadata.fromCache });
    },
    (error) => {
      logger.error("Realtime listener error", { message: error?.message, code: error?.code });
      setSyncState("offline", error?.code);
      showAccessRemoved();
    }
  );

  listenToMessages(user.uid);
});

/* ============================================================
   LOGOUT
   ============================================================ */
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    logger.info("Logout requested from dashboard");
    teardownListeners();
    await signOut(auth);
    window.location.href = "login.html";
  });
}

/* ============================================================
   REQUEST FORM
   ============================================================ */
if (requestForm) {
  requestForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = auth.currentUser;

    if (!user) {
      setRequestStatus("Please log in first.", "error");
      return;
    }

    const type = requestType?.value || "";
    const subject = requestSubject?.value.trim() || "";
    const message = requestMessage?.value.trim() || "";

    if (!type || !subject || !message) {
      setRequestStatus("Please fill all fields.", "error");
      return;
    }

    try {
      setRequestStatus("Sending request…", "");
      if (requestSubmitBtn) requestSubmitBtn.disabled = true;

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

      logger.info("Client request submitted", { uid: user.uid, type, subject });

      requestForm.reset();
      setRequestStatus("Request sent successfully.", "success");
    } catch (error) {
      logger.error("Failed to submit client request", { message: error?.message });
      setRequestStatus("Failed to send request. Please try again.", "error");
    } finally {
      if (requestSubmitBtn) requestSubmitBtn.disabled = false;
    }
  });
}

function setRequestStatus(text, kind) {
  if (!requestStatusMsg) return;
  requestStatusMsg.textContent = text;
  requestStatusMsg.classList.remove("is-success", "is-error");
  if (kind === "success") requestStatusMsg.classList.add("is-success");
  if (kind === "error") requestStatusMsg.classList.add("is-error");
}

/* ============================================================
   LINK GOOGLE LOGIN
   ============================================================ */
if (linkGoogleBtn) {
  linkGoogleBtn.addEventListener("click", async () => {
    const user = auth.currentUser;

    if (!user) {
      if (linkMessage) linkMessage.textContent = "Please log in first.";
      return;
    }

    try {
      linkGoogleBtn.disabled = true;
      if (linkMessage) linkMessage.textContent = "Opening Google sign-in…";

      const provider = new GoogleAuthProvider();
      await linkWithPopup(user, provider);

      logger.info("Google login linked", { uid: user.uid });
      if (linkMessage) linkMessage.textContent = "Google account linked successfully.";
    } catch (error) {
      logger.error("Failed to link Google login", { code: error?.code, message: error?.message });

      if (error?.code === "auth/credential-already-in-use") {
        if (linkMessage) linkMessage.textContent = "This Google account is already linked to another user.";
      } else if (error?.code === "auth/popup-closed-by-user") {
        if (linkMessage) linkMessage.textContent = "Sign-in was cancelled.";
      } else {
        if (linkMessage) linkMessage.textContent = "Could not link Google account. Please try again.";
      }
    } finally {
      linkGoogleBtn.disabled = false;
    }
  });
}

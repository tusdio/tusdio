/* ============================================================
   analytics.js — first-party visitor tracking for TUSDIO
   Writes to the `analytics_events` collection, which the Owner Panel
   (Growth › Website Intelligence) already reads.

   Put this file next to index.html (site root). To track another page,
   add to that page's script:
       import { initAnalytics } from "./analytics.js";   // adjust the path
       initAnalytics();

   What it records (no IP addresses, no cookies):
   - page_view (with traffic source, device, browser, OS)
   - clicks: CTA buttons, nav, service cards, portfolio cards, social links, mailto
   - scroll depth (25/50/75/100), sections seen, time on page (30/60/120s)
   - contact form start + submit
   - the signed-in user's uid/email/name, if they're logged in

   It does NOT track: the owner, Do-Not-Track browsers, bots, localhost.
============================================================ */
import { auth, db } from "./Nav Bar/auth/firebase-config.js";
import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";
import {
  collection,
  addDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-firestore.js";

const OWNER_EMAIL = "bittukhantusharkhan@gmail.com";
const COLLECTION = "analytics_events";
const MAX_EVENTS_PER_SESSION = 120; // safety cap so a runaway page can't spam Firestore

// Keep these limits in sync with validAnalyticsEvent() in firestore.rules
const LIMITS = {
  type: 30, page: 200, title: 150, referrer: 100, source: 60, medium: 40,
  campaign: 80, device: 20, browser: 20, os: 20, screen: 20, language: 20,
  sessionId: 64, visitorId: 64, userId: 128, userEmail: 120, userName: 100,
  target: 120
};

const state = {
  started: false,
  enabled: false,
  user: null,
  sent: 0,
  ctx: null
};

/* ---------- small helpers ---------- */
function readStore(kind, key) {
  try { return (kind === "local" ? window.localStorage : window.sessionStorage).getItem(key); }
  catch { return null; }
}
function writeStore(kind, key, value) {
  try { (kind === "local" ? window.localStorage : window.sessionStorage).setItem(key, value); }
  catch { /* storage blocked — IDs just won't persist across pages */ }
}

function randomId() {
  try { return crypto.randomUUID().replace(/-/g, "").slice(0, 20); }
  catch { return Math.random().toString(36).slice(2) + Date.now().toString(36); }
}

function pagePath() {
  let p = location.pathname || "/";
  try { p = decodeURIComponent(p); } catch { /* keep raw */ }
  return p.replace(/\/index\.html$/i, "/") || "/";
}

function isOwnerUser(user) {
  return !!user && (user.email || "").toLowerCase() === OWNER_EMAIL.toLowerCase();
}

/* ---------- visitor + session identity ---------- */
function getIds() {
  let visitorId = readStore("local", "tusdio_vid");
  const newVisitor = !visitorId;
  if (!visitorId) { visitorId = randomId(); writeStore("local", "tusdio_vid", visitorId); }

  let sessionId = readStore("session", "tusdio_sid");
  const newSession = !sessionId;
  if (!sessionId) { sessionId = randomId(); writeStore("session", "tusdio_sid", sessionId); }

  return { visitorId, sessionId, newVisitor, newSession };
}

/* ---------- traffic source (first touch of the session is kept) ---------- */
const SOURCE_NAMES = [
  [/(^|\.)instagram\.com$/, "Instagram"],
  [/(^|\.)linkedin\.com$|^lnkd\.in$/, "LinkedIn"],
  [/(^|\.)behance\.net$/, "Behance"],
  [/(^|\.)google\./, "Google"],
  [/(^|\.)bing\.com$/, "Bing"],
  [/(^|\.)duckduckgo\.com$/, "DuckDuckGo"],
  [/(^|\.)facebook\.com$|^fb\.me$/, "Facebook"],
  [/(^|\.)twitter\.com$|^t\.co$|(^|\.)x\.com$/, "X"],
  [/(^|\.)youtube\.com$/, "YouTube"],
  [/(^|\.)whatsapp\.com$|^wa\.me$/, "WhatsApp"]
];

function prettySource(host) {
  const h = (host || "").toLowerCase();
  const hit = SOURCE_NAMES.find(([re]) => re.test(h));
  return hit ? hit[1] : h;
}

function getTraffic() {
  const cached = readStore("session", "tusdio_traffic");
  if (cached) { try { return JSON.parse(cached); } catch { /* fall through */ } }

  const params = new URLSearchParams(location.search);
  let referrerHost = "";
  try {
    if (document.referrer) {
      const r = new URL(document.referrer);
      if (r.hostname !== location.hostname) referrerHost = r.hostname.replace(/^www\./, "");
    }
  } catch { /* ignore */ }

  const utmSource = params.get("utm_source") || "";
  const traffic = {
    source: utmSource ? utmSource : (referrerHost ? prettySource(referrerHost) : "direct"),
    medium: params.get("utm_medium") || (referrerHost ? "referral" : "none"),
    campaign: params.get("utm_campaign") || "",
    referrer: referrerHost
  };
  writeStore("session", "tusdio_traffic", JSON.stringify(traffic));
  return traffic;
}

/* ---------- device info ---------- */
function getDeviceInfo() {
  const ua = navigator.userAgent || "";
  const device = /iPad|Tablet|Android(?!.*Mobile)/i.test(ua) ? "tablet"
    : /Mobi|iPhone|Android/i.test(ua) ? "mobile" : "desktop";
  const browser = /Edg\//.test(ua) ? "Edge"
    : /OPR\//.test(ua) ? "Opera"
    : /Firefox\//.test(ua) ? "Firefox"
    : /Chrome\//.test(ua) ? "Chrome"
    : /Safari\//.test(ua) ? "Safari" : "Other";
  const os = /Windows/.test(ua) ? "Windows"
    : /Android/.test(ua) ? "Android"
    : /iPhone|iPad|iPod/.test(ua) ? "iOS"
    : /Mac OS X/.test(ua) ? "macOS"
    : /Linux/.test(ua) ? "Linux" : "Other";
  return {
    device, browser, os,
    screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
    language: navigator.language || ""
  };
}

/* ---------- sanitize + send ---------- */
function clean(data) {
  const out = {};
  Object.entries(data).forEach(([key, val]) => {
    if (val === undefined || val === null) return;
    if (typeof val === "string") {
      const t = val.replace(/\s+/g, " ").trim().slice(0, LIMITS[key] || 120);
      if (t) out[key] = t;
    } else if (typeof val === "number") {
      if (Number.isFinite(val)) out[key] = Math.round(val);
    } else {
      out[key] = val; // booleans + the serverTimestamp() sentinel
    }
  });
  return out;
}

export async function trackEvent(type, extra = {}) {
  if (!state.enabled || !state.ctx) return;
  if (state.sent >= MAX_EVENTS_PER_SESSION) return;
  state.sent++;

  const c = state.ctx;
  const u = state.user;
  const payload = clean({
    type,
    page: pagePath(),
    title: document.title,
    referrer: c.referrer,
    source: c.source,
    medium: c.medium,
    campaign: c.campaign,
    device: c.device,
    browser: c.browser,
    os: c.os,
    screen: c.screen,
    language: c.language,
    sessionId: c.sessionId,
    visitorId: c.visitorId,
    userId: u?.uid,
    userEmail: u?.email,
    userName: u?.displayName,
    ...extra,
    timestamp: serverTimestamp()
  });

  try {
    await addDoc(collection(db, COLLECTION), payload);
  } catch (err) {
    // Tracking must never break the site — fail quietly.
    console.debug("[analytics] event not saved:", err?.code || err);
  }
}

/* ---------- auto-trackers ---------- */
function setupClicks() {
  document.addEventListener("click", (e) => {
    const el = e.target.closest?.("[data-track-label], a[href], button, .faq .question");
    if (!el) return;

    const custom = el.getAttribute("data-track-label") || "";
    const href = el.getAttribute("href") || "";
    const text = (el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60);

    // FAQ: script.js toggles .active on the parent before this bubbles up,
    // so "active" here means it was just opened.
    if (el.matches(".faq .question")) {
      if (el.closest(".faq")?.classList.contains("active")) {
        trackEvent("faq_open", { target: el.querySelector("h3")?.textContent || text });
      }
      return;
    }

    if (href.startsWith("mailto:")) {
      trackEvent("contact_click", { target: href.replace("mailto:", "") });
      return;
    }

    if (/^https?:/i.test(href)) {
      let host = "";
      try { host = new URL(href, location.href).hostname; } catch { /* ignore */ }
      if (host && host !== location.hostname) {
        if (el.matches(".image-card")) {
          trackEvent("portfolio_click", { target: el.querySelector("img")?.alt || host });
        } else {
          trackEvent("outbound_click", { target: custom || prettySource(host.replace(/^www\./, "")) });
        }
        return;
      }
    }

    if (el.matches(".project-card")) {
      trackEvent("service_click", { target: el.querySelector(".overlay")?.textContent || el.getAttribute("aria-label") || text });
      return;
    }
    if (el.matches(".image-card")) {
      trackEvent("portfolio_click", { target: el.querySelector("img")?.alt || text });
      return;
    }
    if (el.matches(".btn-primary, .btn-secondary")) {
      trackEvent("cta_click", { target: custom || text });
      return;
    }
    if (el.closest("header nav") && el.matches("a")) {
      trackEvent("nav_click", { target: custom || text });
      return;
    }
    if (custom) {
      trackEvent("cta_click", { target: custom });
    }
  });
}

function setupScrollDepth() {
  const marks = [25, 50, 75, 100];
  const hit = new Set();
  let ticking = false;

  const check = () => {
    ticking = false;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 0) return;
    const pct = Math.min(100, Math.round((window.scrollY / max) * 100));
    marks.forEach((m) => {
      if (pct >= m && !hit.has(m)) {
        hit.add(m);
        trackEvent("scroll_depth", { value: m });
      }
    });
  };

  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(check); }
  }, { passive: true });
}

function setupSectionViews() {
  if (!("IntersectionObserver" in window)) return;
  const sections = [
    ["#hero", "hero"],
    ["#services", "services"],
    [".why-tusdio", "why_tusdio"],
    [".Worked-Over-50", "trust"],
    [".process-section", "process"],
    ["#portfolio", "recent_work"],
    ["#faq", "faq"],
    ["#contact", "footer"]
  ];

  const seen = new Set();
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const name = entry.target.dataset.trackSection;
      if (!name || seen.has(name)) return;
      seen.add(name);
      io.unobserve(entry.target);
      trackEvent("section_view", { target: name });
    });
  }, { threshold: 0.1, rootMargin: "0px 0px -30% 0px" });

  sections.forEach(([selector, name]) => {
    const el = document.querySelector(selector);
    if (!el) return;
    el.dataset.trackSection = name;
    io.observe(el);
  });
}

function setupEngagedTime() {
  const marks = [30, 60, 120];
  let seconds = 0;
  const timer = setInterval(() => {
    if (document.hidden) return; // only count time the tab is actually visible
    seconds++;
    if (marks.includes(seconds)) trackEvent("time_on_page", { value: seconds });
    if (seconds >= marks[marks.length - 1]) clearInterval(timer);
  }, 1000);
}

function setupForms() {
  document.querySelectorAll("form").forEach((form) => {
    const name = form.getAttribute("data-track-label") || (form.closest("footer") ? "footer_contact" : form.id || "form");
    let started = false;

    form.addEventListener("focusin", () => {
      if (started) return;
      started = true;
      trackEvent("form_start", { target: name });
    });

    // The footer form posts to formsubmit.co and leaves the page immediately,
    // which would cancel an in-flight Firestore write. Hold the submit for up
    // to ~0.9s so the event lands, then submit normally.
    form.addEventListener("submit", async (e) => {
      if (!state.enabled || form.dataset.trackedSubmit) return;
      e.preventDefault();
      form.dataset.trackedSubmit = "1";
      await Promise.race([
        trackEvent("form_submit", { target: name }),
        new Promise((resolve) => setTimeout(resolve, 900))
      ]);
      form.submit();
    });
  });
}

/* ---------- boot ---------- */
function shouldSkip() {
  const host = location.hostname;
  if (host === "localhost" || host === "127.0.0.1" || location.protocol === "file:") return true;
  if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return true;
  if (/bot|crawl|spider|headless|lighthouse/i.test(navigator.userAgent || "")) return true;
  return false;
}

function waitForAuth() {
  return new Promise((resolve) => {
    let done = false;
    const finish = (u) => { if (!done) { done = true; resolve(u); } };

    // Stays subscribed: if someone logs in/out later, later events pick up
    // the new identity (and the owner logging in switches tracking off).
    onAuthStateChanged(auth, (u) => {
      state.user = u;
      if (isOwnerUser(u)) state.enabled = false;
      finish(u);
    });

    setTimeout(() => finish(auth.currentUser), 2000); // don't hold the page_view forever
  });
}

export async function initAnalytics() {
  if (state.started) return;
  state.started = true;
  if (shouldSkip()) return;

  const user = await waitForAuth();
  state.user = user;
  if (isOwnerUser(user)) return; // never count your own visits

  state.ctx = { ...getIds(), ...getTraffic(), ...getDeviceInfo() };
  state.enabled = true;

  trackEvent("page_view", {
    newSession: state.ctx.newSession,
    newVisitor: state.ctx.newVisitor
  });

  setupClicks();
  setupScrollDepth();
  setupSectionViews();
  setupEngagedTime();
  setupForms();
}
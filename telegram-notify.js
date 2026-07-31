// telegram-notify.js
// Sends a Telegram message to the owner's phone (via @TUSDIOBOT) whenever
// a client logs in or submits a service request. Tapping the message opens
// the owner dashboard directly.
//
// SECURITY NOTE: TELEGRAM_BOT_TOKEN below is visible to anyone who views
// your page source, since this runs in the browser. That's an acceptable
// trade-off for a small personal/business tool (worst case: someone spams
// messages through the bot — just regenerate the token via @BotFather if
// that ever happens). If you want the token fully hidden, route this
// through a free serverless proxy (e.g. a Cloudflare Worker) instead of
// calling the Telegram API directly from here.

const TELEGRAM_BOT_TOKEN = "8839394130:AAHcoY2UGspv0IsO0f6k1M0PY4LnTjyA3hk"; // from @BotFather, do NOT paste this into a chat/AI tool
const TELEGRAM_CHAT_ID = "1365238243";
const OWNER_DASHBOARD_URL = "https://tusdio.online/Nav%20Bar/auth/owner/owner.html";

export async function notifyOwner(message) {
  if (!TELEGRAM_BOT_TOKEN || TELEGRAM_BOT_TOKEN === "PASTE_YOUR_BOT_TOKEN_HERE") {
    console.warn("notifyOwner: TELEGRAM_BOT_TOKEN not set yet, skipping notification.");
    return;
  }

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [[{ text: "Open Owner Dashboard", url: OWNER_DASHBOARD_URL }]],
        },
      }),
    });
  } catch (err) {
    console.error("Telegram notify failed:", err);
  }
}
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#inquiry-form");
  if (!form) return;

  form.noValidate = true;

  // FormSubmit: skip the captcha page
  const captcha = document.createElement("input");
  captcha.type = "hidden";
  captcha.name = "_captcha";
  captcha.value = "false";
  form.prepend(captcha);

  const statusBox = document.querySelector("#form-status");
  const submitButton = form.querySelector(".send");
  const servicesBox = document.querySelector("#services");
  const serviceHint = document.querySelector("#svc-hint");
  const currencyButtons = form.querySelectorAll(".cur button");
  const budgetLabels = form.querySelectorAll("[data-usd][data-inr]");

  const showError = (msg) => {
    statusBox.textContent = "Error: " + msg;
  };

  // ---------- Currency switch ----------
  function setCurrency(currency) {
    currencyButtons.forEach((button) => {
      const active = button.dataset.currency === currency;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    budgetLabels.forEach((label) => {
      const radio = label.closest("label").querySelector('input[type="radio"]');
      const wasChecked = radio.checked;
      label.textContent = currency === "USD" ? label.dataset.usd : label.dataset.inr;
      radio.value = label.textContent.trim();
      radio.checked = wasChecked;
    });
  }

  currencyButtons.forEach((b) =>
    b.addEventListener("click", () => setCurrency(b.dataset.currency))
  );
  setCurrency("USD");

  // ---------- Required service selection ----------
  const serviceInputs = form.querySelectorAll('input[name="Services"]');

  function updateServiceSelection() {
    const count = [...serviceInputs].filter((i) => i.checked).length;

    serviceInputs.forEach((i) =>
      i.setCustomValidity(count ? "" : "Please select at least one service.")
    );

    serviceHint.textContent = count
      ? `${count} selected.`
      : "Select all that apply.";

    return count > 0;
  }

  serviceInputs.forEach((i) => i.addEventListener("change", updateServiceSelection));

  // ---------- Confirmation page ----------
  function showSuccess(data) {
    const get = (k) => data.getAll(k).join(", ").trim();
    const first = get("Name").split(/\s+/)[0] || "there";
    const now = new Date();
    const stamp =
      now.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) +
      ", " +
      now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

    const rows = [
      ["Name", get("Name")],
      ["Email", get("Email")],
      ["Brand", get("Brand Name")],
      ["Needs", get("Services")],
      ["Stage", get("Brand Stage")],
      ["Budget", get("Budget")],
      ["Start", get("Start Timeline")],
    ];

    const page = document.createElement("div");
    page.className = "done-page";
    page.tabIndex = -1;
    page.setAttribute("role", "dialog");
    page.setAttribute("aria-modal", "true");
    page.setAttribute("aria-labelledby", "done-title");

    page.innerHTML = `
      <header class="done-top">
        <a class="done-mark" href="https://tusdio.online">TUSDIO.</a>
        <a class="done-back" href="https://tusdio.online">Back to site</a>
      </header>

      <h2 id="done-title">
        <span class="ln"><span>Thank</span></span>
        <span class="ln"><span>you.</span></span>
      </h2>

      <div class="done-grid">
        <div class="done-msg">
          <p class="done-lead"></p>
          <p class="done-stamp">Sent <time></time></p>
        </div>
        <dl class="done-sheet"></dl>
      </div>

      <ol class="done-next">
        <li><b>Within 24 hours</b><span>We email you to book your discovery call.</span></li>
        <li><b>Discovery call</b><span>We align on scope, direction and timeline.</span></li>
        <li><b>Design and refine</b><span>We design, you review, we refine until it's right.</span></li>
      </ol>

      <div class="done-foot">
        <a class="done-btn" href="https://tusdio.online">Back to tusdio.online</a>
        <a class="done-link" href="https://www.instagram.com/tusdio.online" target="_blank" rel="noopener">Instagram</a>
      </div>
    `;

    page.querySelector(".done-lead").textContent =
      `Thanks, ${first}. Your brief is in. We'll read it carefully and write to you within 24 hours.`;
    page.querySelector("time").textContent = stamp;

    const sheet = page.querySelector(".done-sheet");
    rows.forEach(([label, value]) => {
      if (!value) return;
      const row = document.createElement("div");
      const dt = document.createElement("dt");
      const dd = document.createElement("dd");
      dt.textContent = label;
      dd.textContent = value;
      row.append(dt, dd);
      sheet.append(row);
    });

    document.body.append(page);
    document.body.style.overflow = "hidden";
    page.focus();
  }

  // ---------- Submit ----------
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    statusBox.textContent = "";

    if (!updateServiceSelection()) {
      showError("Select at least one thing you need.");
      servicesBox.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    if (!form.checkValidity()) {
      showError("Please complete the required fields.");
      form.reportValidity();
      return;
    }

    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    try {
      const data = new FormData(form);
      const url = (form.getAttribute("action") || "").replace(
        "formsubmit.co/",
        "formsubmit.co/ajax/"
      );

      const response = await fetch(url, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" },
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok || String(result.success) === "false") {
        throw new Error("Submission failed");
      }

      showSuccess(data);
    } catch (error) {
      showError("We couldn't send your inquiry. Try again or email team@tusdio.online.");
      submitButton.disabled = false;
      submitButton.textContent = originalText;
    }
  });
});
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");
const chooseButtons = document.querySelectorAll(".choose-btn");

if (menuToggle && navMenu) {
  menuToggle.addEventListener("click", () => {
    navMenu.classList.toggle("active");
  });
}

chooseButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const service = btn.dataset.service;
    window.location.href = `contact.html?service=${service}`;
  });
});
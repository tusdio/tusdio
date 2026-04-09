document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector("header nav");

    if (menuToggle && nav) {
        menuToggle.addEventListener("click", function () {
            nav.classList.toggle("active");
        });
    }

    const reveals = document.querySelectorAll(".reveal");

    const revealOnScroll = () => {
        reveals.forEach((item) => {
            const rect = item.getBoundingClientRect();
            if (rect.top < window.innerHeight - 80) {
                item.classList.add("show");
            }
        });
    };

    revealOnScroll();
    window.addEventListener("scroll", revealOnScroll);
});

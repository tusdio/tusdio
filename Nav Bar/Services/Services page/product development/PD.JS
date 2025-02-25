document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector("header nav");

    menuToggle.addEventListener("click", function () {
        nav.classList.toggle("active");
    });
});


// Image Grid //

document.addEventListener("DOMContentLoaded", function () {
    const images = document.querySelectorAll(".image-card img");

    images.forEach(img => {
        img.addEventListener("mouseenter", () => {
            images.forEach(other => {
                if (other !== img) {
                    other.style.transform = "scale(0.9)";
                }
            });
            img.style.transform = "scale(1.1)";
        });

        img.addEventListener("mouseleave", () => {
            images.forEach(other => {
                other.style.transform = "scale(1)";
            });
        });
    });
});


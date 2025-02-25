document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector("header nav");

    menuToggle.addEventListener("click", function () {
        nav.classList.toggle("active");
    });
});

//image//

document.addEventListener("DOMContentLoaded", function() {
    let image = document.getElementById("myImage");

    image.addEventListener("click", function() {
        if (image.src.includes("image1.jpg")) {
            image.src = "image2.jpg"; // Change to another image
        } else {
            image.src = "image1.jpg"; // Revert to the original image
        }
    });
});


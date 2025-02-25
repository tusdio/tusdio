// Typing Effect
const words = ["TUSDIO", "Imagination", "Perfection"];
let wordIndex = 0;
let letterIndex = 0;
const typingElement = document.querySelector(".typing");

function type() {
    if (letterIndex < words[wordIndex].length) {
        typingElement.textContent += words[wordIndex][letterIndex];
        letterIndex++;
        setTimeout(type, 100);
    } else {
        setTimeout(erase, 1500);
    }
}

function erase() {
    if (letterIndex > 0) {
        typingElement.textContent = words[wordIndex].substring(0, letterIndex - 1);
        letterIndex--;
        setTimeout(erase, 50);
    } else {
        wordIndex = (wordIndex + 1) % words.length;
        setTimeout(type, 500);
    }
}

// Nav Bar responsive
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('header nav');

// Add event listener to toggle class 'active' on nav when the button is clicked
menuToggle.addEventListener('click', () => {
    nav.classList.toggle('active');
});


// Ensure the text starts clean
typingElement.textContent = "";
type();

// Slideshow
const slides = [
    "images/Slideshow/slide1.png",
    "images/Slideshow/slide2.png",
    "images/Slideshow/slide3.png",
    "images/Slideshow/slide4.png",
    "images/Slideshow/slide5.png"
];
let currentIndex = 0;

function changeSlide() {
    currentIndex = (currentIndex + 1) % slides.length;
    document.getElementById("slide").src = slides[currentIndex];
}

// Start the slideshow only if the element exists
const slideElement = document.getElementById("slide");
if (slideElement) {
    setInterval(changeSlide, 3000);
}

// Smooth Scrolling for Project Section on Mobile

document.addEventListener("DOMContentLoaded", function () {
    const projectGallery = document.querySelector(".project-gallery");

    if (projectGallery) {
        projectGallery.addEventListener("wheel", (event) => {
            event.preventDefault();
            projectGallery.scrollLeft += event.deltaY * 2; // Faster horizontal scroll
        });

        // Enable touch swipe support for mobile users
        let isDown = false;
        let startX;
        let scrollLeft;

        projectGallery.addEventListener("mousedown", (e) => {
            isDown = true;
            startX = e.pageX - projectGallery.offsetLeft;
            scrollLeft = projectGallery.scrollLeft;
        });

        projectGallery.addEventListener("mouseleave", () => {
            isDown = false;
        });

        projectGallery.addEventListener("mouseup", () => {
            isDown = false;
        });

        projectGallery.addEventListener("mousemove", (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - projectGallery.offsetLeft;
            const walk = (x - startX) * 2; // Scroll-fast effect
            projectGallery.scrollLeft = scrollLeft - walk;
        });
    }

    function scrollGallery(amount) {
        if (projectGallery) {
            projectGallery.scrollLeft += amount ;  // Adjust scroll amount (e.g., 300px)
        }
    }
    
    // Ensure buttons exist before adding event listeners
    const nextBtn = document.querySelector("#next-btn");
    const prevBtn = document.querySelector("#prev-btn");
    
    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            scrollGallery(300); // Scrolls right by 300px
        });
    }
    
    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            scrollGallery(-300); // Scrolls left by 300px
        });
    }
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

// FAQ //

document.addEventListener("DOMContentLoaded", function () {
    const faqs = document.querySelectorAll(".faq");

    faqs.forEach(faq => {
        faq.addEventListener("click", () => {
            faq.classList.toggle("active");
        });
    });
});


// Blog // 

function toggleBlogContent(button) {
    const fullContent = button.nextElementSibling;
    if (fullContent.style.display === "block") {
        fullContent.style.display = "none";
        button.textContent = "Read More";
    } else {
        fullContent.style.display = "block";
        button.textContent = "Read Less";
    }
}


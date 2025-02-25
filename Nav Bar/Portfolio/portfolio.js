document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector("header nav");

    menuToggle.addEventListener("click", function () {
        nav.classList.toggle("active");
    });
});


// Typing Effect
const words = ["TUSDIO", "Imagination", "Perfection"];
let wordIndex = 0;
let letterIndex = 0;
const typingElement = document.querySelector(".typing");

function type() {
    if (letterIndex < words[wordIndex].length) {
        typingElement.textContent += words[wordIndex][letterIndex];
        letterIndex++;
        setTimeout(type, 100); // Speed of typing
    } else {
        setTimeout(erase, 1500); // Wait before erasing
    }
}

function erase() {
    if (letterIndex > 0) {
        typingElement.textContent = words[wordIndex].substring(0, letterIndex - 1);
        letterIndex--;
        setTimeout(erase, 50); // Speed of erasing
    } else {
        wordIndex = (wordIndex + 1) % words.length; // Cycle through words
        setTimeout(type, 500); // Wait before typing next word
    }
}

// Start typing effect
type();


// steps //

const steps = [
    { title: "Start", text: "Clients reach out via email, website, or social media. We review their needs and assess how to best assist them." },
    { title: "Meeting", text: "We schedule a 30-minute call to understand the client's vision and project scope." },
    { title: "Proposal", text: "A detailed project proposal outlining deliverables, timelines, and pricing is shared." },
    { title: "Agreement", text: "Once approved, a formal agreement is signed to finalize project terms." },
    { title: "Deposit", text: "A 30% non-refundable security deposit is required to initiate the project." },
    { title: "Preview", text: "Initial designs or previews are shared, allowing for minor revisions." },
    { title: "Payment", text: "The remaining balance is cleared before final delivery." },
    { title: "Final", text: "Final files are delivered, completing the project." }
];

function showStep(index) {
    document.getElementById("step-title").innerText = steps[index].title;
    document.getElementById("step-text").innerText = steps[index].text;

    let stepsElements = document.querySelectorAll(".timeline-step");
    stepsElements.forEach(step => step.classList.remove("active"));
    stepsElements[index].classList.add("active");
}

/* Set Default Active Step to "Start" */
document.addEventListener("DOMContentLoaded", function () {
    showStep(0);
});


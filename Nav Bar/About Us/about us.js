document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector("header nav");

    menuToggle.addEventListener("click", function () {
        nav.classList.toggle("active");
    });
});

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

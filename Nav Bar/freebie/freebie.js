/* =========================================================
   TUSDIO — FREEBIE PAGE
   Complete Freebie Controller
   ========================================================= */

import { auth } from "../auth/firebase-config.js";
import {
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.12.0/firebase-auth.js";


/* =========================================================
   NAVBAR — identical to the About page's nav script
   ========================================================= */

// Nav toggle
const menuToggle = document.querySelector(".menu-toggle");
const nav = document.querySelector("header nav");

if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
        nav.classList.toggle("active");
        const isExpanded = nav.classList.contains("active");
        menuToggle.setAttribute("aria-expanded", String(isExpanded));
    });
}

// Navbar user state
const navUserArea = document.getElementById("navUserArea");
const OWNER_EMAIL = "bittukhantusharkhan@gmail.com";

onAuthStateChanged(auth, (user) => {
    if (!navUserArea) return;

    if (user) {
        const name = user.displayName || (user.email ? user.email.split("@")[0] : "User");
        const isOwner = (user.email || "").toLowerCase() === OWNER_EMAIL.toLowerCase();

        const dashboardLink = isOwner
            ? "../auth/owner/owner.html"
            : "../auth/users.html";

        navUserArea.innerHTML = `
      <div class="nav-user-box">
        <span class="nav-user-name">${name}</span>
        <a href="${dashboardLink}" class="nav-user-btn">Dashboard</a>
        <button id="logoutNavBtn" class="nav-user-btn" type="button">Logout</button>
      </div>
    `;

        const logoutNavBtn = document.getElementById("logoutNavBtn");
        if (logoutNavBtn) {
            logoutNavBtn.addEventListener("click", async () => {
                try {
                    await signOut(auth);
                    window.location.href = "../auth/login.html";
                } catch (error) {
                    console.error("Logout failed:", error);
                }
            });
        }
    } else {
        navUserArea.innerHTML = `
      <a href="../auth/login.html">Login</a>
    `;
    }
});


/* =========================================================
   DOWNLOAD GATE — require login before downloading a freebie
   ========================================================= */

let currentUser = null;

onAuthStateChanged(auth, (user) => {
    currentUser = user;
    updateDownloadGateUI();
});

function updateDownloadGateUI() {

    const btn = getElement("downloadButton");
    const hint = getElement("downloadLoginHint");
    const label = btn ? btn.querySelector(".download-btn-label") : null;

    if (!btn) return;

    const target = btn.dataset.target || "#";

    if (currentUser) {

        btn.classList.remove("locked");
        btn.href = target;
        btn.target = "_blank";
        if (label) label.textContent = "Get this resource";
        if (hint) hint.classList.remove("visible");

    } else {

        btn.classList.add("locked");
        btn.href = "#";
        btn.removeAttribute("target");
        if (label) label.textContent = "Login to download";
        if (hint) hint.classList.add("visible");

    }

}

function getLoginRedirectUrl() {
    const redirectTarget = `${window.location.pathname}${window.location.hash}`;
    return `../auth/login.html?redirect=${encodeURIComponent(redirectTarget)}`;
}

function setupDownloadGate() {

    const btn = getElement("downloadButton");
    const loginLink = getElement("downloadLoginLink");

    if (btn) {
        btn.addEventListener("click", (event) => {

            if (currentUser) return; // signed in — let the link open normally

            event.preventDefault();
            showToast("Login to download this resource");
            window.location.href = getLoginRedirectUrl();

        });
    }

    if (loginLink) {
        loginLink.addEventListener("click", (event) => {
            event.preventDefault();
            window.location.href = getLoginRedirectUrl();
        });
    }

}


/* =========================================================
   FREEBIES DATABASE
   ========================================================= */

const freebies = [

    /* SIGNS */
    { title: "Free Modern Concrete Building Mockup", img: "https://mrmockup.com/wp-content/uploads/2025/02/Free-Modern-Concrete-Building-Mockup-02.jpg", extraImg: "https://mrmockup.com/wp-content/uploads/2025/02/Free-Modern-Concrete-Building-Mockup-03.jpg", tags: ["Signs"], download: "https://mrmockup.com/free-modern-concrete-building-mockup/" },
    { title: "Free Concrete Wall on the Office Mockup", img: "https://mrmockup.com/wp-content/uploads/2025/02/Free-Concrete-Wall-on-the-Office-Mockup-02.jpg", extraImg: "https://mrmockup.com/wp-content/uploads/2025/02/Free-Concrete-Wall-on-the-Office-Mockup-03.jpg", tags: ["Signs"], download: "https://mrmockup.com/free-concrete-wall-on-the-office-mockup/" },
    { title: "Free Reception in the Modern Building Mockup", img: "https://mrmockup.com/wp-content/uploads/2024/11/Free-Reception-in-the-Modern-Building-Mockup-02.jpg", extraImg: "https://mrmockup.com/wp-content/uploads/2024/11/Free-Reception-in-the-Modern-Building-Mockup-03.jpg", tags: ["Signs"], download: "https://mrmockup.com/free-reception-in-the-modern-building-mockup/" },
    { title: "Free Corrugated Billboard Mockup", img: "https://unblast.com/wp-content/uploads/2023/10/Corrugated-Billboard-Mockup-1536x1152.jpg", extraImg: "https://unblast.com/wp-content/uploads/2023/10/Corrugated-Billboard-Mockup-2-1536x1382.jpg", tags: ["Signs"], download: "https://unblast.com/corrugated-billboard-mockup/" },
    { title: "Free Sign on Corporate Building Mockup", img: "https://mrmockup.com/wp-content/uploads/2023/02/Mr.Mockup-01-Sign-on-Corporate-Building-Mockup-600x400.jpg", extraImg: "", tags: ["Signs"], download: "https://mrmockup.com/sign-on-corporate-building-mockup/" },
    { title: "Free Containers Mockup", img: "https://mrmockup.com/wp-content/uploads/2022/12/Mr.Mockup-01-Containers-Mockup-600x400.jpg", extraImg: "", tags: ["Signs"], download: "https://mrmockup.com/containers-mockup/" },
    { title: "Free Front Wall Mockup", img: "https://mrmockup.com/wp-content/uploads/2022/09/Mr.Mockup-01-Front-Wall-Mockup-600x400.jpg", extraImg: "", tags: ["Signs"], download: "https://mrmockup.com/front-wall-mockup/" },
    { title: "Free Acrylic Cube Lightbox Mockup", img: "https://unblast.com/wp-content/uploads/2021/11/Acrylic-Cube-Lightbox-Mockup-1024x768.jpg", extraImg: "https://unblast.com/wp-content/uploads/2021/11/Acrylic-Cube-Lightbox-Mockup-2-1024x768.jpg", tags: ["Signs"], download: "https://mrmockup.com/free-banner-awning-mockup/" },
    { title: "Free Realistic Window Signage Mockup", img: "https://unblast.com/wp-content/uploads/2019/06/Window-Signage-Mockup-1024x709.jpg", extraImg: "https://unblast.com/wp-content/uploads/2019/06/Window-Signage-Mockup-2-1024x709.jpg", tags: ["Signs"], download: "https://unblast.com/free-realistic-window-signage-mockup-psd/" },
    { title: "Free Storefront Board Mockup", img: "https://unblast.com/wp-content/uploads/2020/02/Storefront-Board-Mockup-1024x768.jpg", extraImg: "https://unblast.com/wp-content/uploads/2020/02/Storefront-Board-Mockup-2-1024x768.jpg", tags: ["Signs"], download: "https://unblast.com/free-storefront-board-mockup-psd/" },
    { title: "Free Building 3D Logo Signage Mockup", img: "https://unblast.com/wp-content/uploads/2023/05/Building-3D-Logo-Signage-Mockup-1024x932.jpg", extraImg: "https://unblast.com/wp-content/uploads/2023/05/Building-3D-Logo-Signage-Mockup-2-1024x768.jpg", tags: ["Signs"], download: "https://unblast.com/building-3d-logo-signage-mockup-psd/" },
    { title: "Free Light Box Sign Mockup", img: "https://mockuptree.com/wp-content/uploads/edd/2023/07/free-light-sign-psd-mockup-640x427.jpg", extraImg: "", tags: ["Signs"], download: "https://mockuptree.com/free/light-box-sign-mockup/" },

    /* POSTERS */
    { title: "Free Hanging Poster on Wall Mockup", img: "https://mrmockup.com/wp-content/uploads/2025/01/Free-Hanging-Poster-on-Wall-Mockup-02.jpg", extraImg: "https://mrmockup.com/wp-content/uploads/2025/01/Free-Hanging-Poster-on-Wall-Mockup-03.jpg", tags: ["Posters"], download: "https://mrmockup.com/free-hanging-poster-on-wall-mockup/" },
    { title: "Free Poster in Living Room on Wall Mockup", img: "https://mrmockup.com/wp-content/uploads/2024/02/Free-Poster-in-Living-Room-on-Wall-Mockup-02.jpg", extraImg: "https://mrmockup.com/wp-content/uploads/2024/02/Free-Poster-in-Living-Room-on-Wall-Mockup-03.jpg", tags: ["Posters"], download: "https://mrmockup.com/free-poster-in-living-room-on-wall-mockup/" },
    { title: "Free Poster in Livingroom Mockup", img: "https://mrmockup.com/wp-content/uploads/2023/08/Free-Poster-in-Livingroom-Mockup-02.jpg", extraImg: "https://mrmockup.com/wp-content/uploads/2023/08/Free-Poster-in-Livingroom-Mockup-03.jpg", tags: ["Posters"], download: "https://mrmockup.com/free-poster-in-livingroom-mockup/" },
    { title: "Two Posters on Wall Mockup", img: "https://mrmockup.com/wp-content/uploads/2023/03/Mr.Mockup-02-Two-Posters-on-Wall-Mockup.jpg", extraImg: "https://mrmockup.com/wp-content/uploads/2023/03/Mr.Mockup-03-Two-Posters-on-Wall-Mockup.jpg", tags: ["Posters"], download: "https://mrmockup.com/two-posters-on-wall-mockup/" },
    { title: "Free Poster on the Floor Mockup", img: "https://mrmockup.com/wp-content/uploads/2022/09/Mr.Mockup-Square-Poster-on-the-Floor-Mockup-350x350.png", extraImg: "", tags: ["Posters"], download: "https://mrmockup.com/poster-on-the-floor-mockup/" },
    { title: "Free Poster on Brick Wall Mockup", img: "https://mrmockup.com/wp-content/uploads/2022/07/Mr.Mockup-Square-Poster-on-Brick-Wall-Mockup-350x350.jpg", extraImg: "", tags: ["Posters"], download: "https://mrmockup.com/poster-on-brick-wall-mockup/" },
    { title: "Free Twin Modern Interior Posters Mockup", img: "https://unblast.com/wp-content/uploads/2020/01/Twin-Modern-Interior-Posters-Mockup-1024x768.jpg", extraImg: "https://unblast.com/wp-content/uploads/2020/01/Twin-Modern-Interior-Posters-Mockup-2-1024x682.jpg", tags: ["Posters"], download: "https://unblast.com/free-twin-modern-interior-posters-mockup-psd/" },
    { title: "Free Posters in Frames on Old Wall Mockup", img: "https://unblast.com/wp-content/uploads/2024/08/Posters-in-Frames-on-Old-Wall-Mockup-1024x768.jpg", extraImg: "https://unblast.com/wp-content/uploads/2024/08/Posters-in-Frames-on-Old-Wall-Mockup-2-1024x768.jpg", tags: ["Posters"], download: "https://unblast.com/posters-in-frames-on-old-wall-mockup/" },
    { title: "Free Sidewalk Sign Sandwich Board Mockup", img: "https://unblast.com/wp-content/uploads/2024/06/Sidewalk-Sign-Sandwich-Board-Mockup-1024x683.jpg", extraImg: "https://unblast.com/wp-content/uploads/2024/06/Sidewalk-Sign-Sandwich-Board-Mockup-PSD-1024x768.jpg", tags: ["Posters"], download: "https://unblast.com/sidewalk-sign-sandwich-board-mockup/" },
    { title: "Free Metal Three Posters Mockup", img: "https://mockuptree.com/wp-content/uploads/edd/2024/07/Three_Posters_In_Metal_Frames.jpg", extraImg: "", tags: ["Posters"], download: "https://mockuptree.com/free/metal-three-posters-mockup/" },
    { title: "Free Bedroom Poster Mockup", img: "https://mockuptree.com/wp-content/uploads/edd/2024/06/Poster_in_Elegant_Bedroom_Mockup.jpg", extraImg: "https://mockuptree.com/wp-content/uploads/edd/2024/06/Poster_in_Elegant_Bedroom_Mockups.jpg", tags: ["Posters"], download: "https://mockuptree.com/free/bedroom-poster-mockup/" },
    { title: "Free Wooden Wall Vertical Poster Mockup", img: "https://mockuptree.com/wp-content/uploads/edd/2024/01/Free-Wooden-Wall-Vertical-Poster-Mockup.jpg", extraImg: "", tags: ["Posters"], download: "https://mockuptree.com/free/wooden-wall-vertical-poster-mockup/" },
    { title: "Free Street Framed Poster Mockup", img: "https://mockuptree.com/wp-content/uploads/edd/2024/02/Poster_Frames_Mockup.jpg", extraImg: "https://mockuptree.com/wp-content/uploads/edd/2024/02/Poster_Frames_Mockup_PSD.jpg", tags: ["Posters"], download: "https://mockuptree.com/free/street-framed-poster-mockup/" },
    { title: "Free Wall Street Poster Mockup", img: "https://mockuptree.com/wp-content/uploads/edd/2022/09/free-Wall-Street-poster-Mockup.jpg", extraImg: "", tags: ["Posters"], download: "https://mockuptree.com/free/wall-street-poster-mockup/" },
    { title: "Free Window Poster Mockup", img: "https://mockuptree.com/wp-content/uploads/edd/2020/11/Free-window-Poster-MockUp.jpg", extraImg: "", tags: ["Posters"], download: "https://mockuptree.com/free/window-poster-mockup/" },
    { title: "Free Art Gallery Poster Mockup", img: "https://mockuptree.com/wp-content/uploads/edd/2020/06/free-art-gallery-poster-mockup.jpg", extraImg: "", tags: ["Posters"], download: "https://mockuptree.com/free/art-gallery-poster-mockup/" },
    { title: "Free Conference Hall Screen Display Mockup", img: "https://d2pas86kykpvmq.cloudfront.net/uploads/conference_hall_preview_4_721aee619a.avif", extraImg: "", tags: ["Posters"], download: "https://wannathis.one/mockups/conference-hall-screen-display-mockup?from=mockups-free" },
    { title: "Free Dark Conference Hall Wavy Screen Mockup", img: "https://d2pas86kykpvmq.cloudfront.net/uploads/conference_hall_preview_9_833befaa04.avif", extraImg: "", tags: ["Posters"], download: "https://wannathis.one/mockups/dark-conference-hall-wavy-screen-mockup" },
    { title: "Free Wide Conference Hall Screen Mockup", img: "https://d2pas86kykpvmq.cloudfront.net/uploads/conference_hall_preview_1_ad47b1f1ef.avif", extraImg: "", tags: ["Posters"], download: "https://wannathis.one/mockups/wide-conference-hall-screen-mockup" },
    { title: "Free Triple Conference LED Screen Mockup", img: "https://d2pas86kykpvmq.cloudfront.net/uploads/interior_studio_preview_7_a8ce32fcac.avif", extraImg: "", tags: ["Posters"], download: "https://wannathis.one/mockups/triple-conference-led-screen-mockup?from=mockups-free" },

    /* MAGAZINES */
    { title: "Free Horizontal Magazine Mockup", img: "https://mrmockup.com/wp-content/uploads/2024/02/Free-Horizontal-Magazine-Mockup-02.jpg", extraImg: "https://mrmockup.com/wp-content/uploads/2024/02/Free-Horizontal-Magazine-Mockup-03.jpg", tags: ["Magazines"], download: "https://mrmockup.com/free-horizontal-magazine-mockup/" },
    { title: "Free Magazine on Marble Table Mockup", img: "https://mrmockup.com/wp-content/uploads/2023/06/Free-Magazine-on-Marble-Table-Mockup-01-600x400.jpg", extraImg: "https://mrmockup.com/wp-content/uploads/2023/06/Free-Magazine-on-Marble-Table-Mockup-03-1367x2048.jpg", tags: ["Magazines"], download: "https://mrmockup.com/free-magazine-on-marble-table-mockup/" },
    { title: "Free Open Magazine Mockup", img: "https://mrmockup.com/wp-content/uploads/2019/10/Mr.Mockup-01_Open-Magazine-Mockup-600x400.jpg", extraImg: "", tags: ["Magazines"], download: "https://mrmockup.com/open-magazine-mockup/" },
    { title: "Free 4K Magazine Mockup", img: "https://unblast.com/wp-content/uploads/2020/10/4K-Magazine-Mockup-1024x683.jpg", extraImg: "https://unblast.com/wp-content/uploads/2020/10/4K-Magazine-Mockup-2-1-1024x683.jpg", tags: ["Magazines"], download: "https://unblast.com/free-4k-magazine-mockup-psd/" },
    { title: "Free Thick Magazine Mockup", img: "https://unblast.com/wp-content/uploads/2020/08/Thick-Magazine-Mockup-1-1024x682.jpg", extraImg: "https://unblast.com/wp-content/uploads/2020/08/Thick-Magazine-Mockup-2-1024x682.jpg", tags: ["Magazines"], download: "https://unblast.com/free-thick-magazine-mockup-psd/" },
    { title: "Free Magazine Set Mockup", img: "https://unblast.com/wp-content/uploads/2020/05/Magazine-Set-Mockup-1-1024x768.jpg", extraImg: "https://unblast.com/wp-content/uploads/2020/05/Magazine-Mockup-2-1-1024x682.jpg", tags: ["Magazines"], download: "https://unblast.com/free-magazine-set-mockup-psd/" },
    { title: "Free A5 Magazine Mockup", img: "https://unblast.com/wp-content/uploads/2018/11/A5-Magazine-Mockup-4-1024x766.jpg", extraImg: "https://unblast.com/wp-content/uploads/2018/11/A5-Magazine-Mockup-1024x768.jpg", tags: ["Magazines"], download: "https://unblast.com/free-a5-magazine-mockup-psd-2/" },
    { title: "Free Magazine on Blocks", img: "https://unblast.com/wp-content/uploads/2024/12/Magazine-on-Blocks-Mockup-1024x1024.jpg", extraImg: "", tags: ["Magazines"], download: "https://unblast.com/magazine-on-blocks-mockup/" },
    { title: "Free Softcover Mockup on Leather Chair", img: "https://wannathis.one/mockups/softcover-mockup-on-leather-chair?from=mockups-free", extraImg: "", tags: ["Magazines"], download: "https://wannathis.one/mockups/softcover-mockup-on-leather-chair?from=mockups-free" },
    { title: "Free Paper and Business Card Mockup with Paper Clip", img: "https://www.ls.graphics/assets/free-paper-and-business-card-mockup-with-paper-clip", extraImg: "", tags: ["Magazines"], download: "https://www.ls.graphics/assets/free-paper-and-business-card-mockup-with-paper-clip" },

    /* BILLBOARDS */
    { title: "Free Outdoor Wide Billboard Mockup", img: "https://mrmockup.com/wp-content/uploads/2024/09/Free-Outdoor-Wide-Billboard-Mockup-02.jpg", extraImg: "https://mrmockup.com/wp-content/uploads/2024/09/Free-Outdoor-Wide-Billboard-Mockup-03.jpg", tags: ["BillBoards"], download: "https://mrmockup.com/free-outdoor-wide-billboard-mockup/" },
    { title: "Free Art Museum Banner Mockups", img: "https://mrmockup.com/wp-content/uploads/2024/05/Free-Art-Museum-Banner-Mockups-02.jpg", extraImg: "https://mrmockup.com/wp-content/uploads/2024/05/Free-Art-Museum-Banner-Mockups-03.jpg", tags: ["BillBoards"], download: "https://mrmockup.com/free-art-museum-banner-mockups/" },
    { title: "Free Standard Size Billboard Mockup", img: "https://unblast.com/wp-content/uploads/2023/11/standard-size-billboard-mockup-1024x684.jpg", extraImg: "https://unblast.com/wp-content/uploads/2023/11/standard-size-billboard-mockup-psd-1024x684.jpg", tags: ["BillBoards"], download: "https://unblast.com/standard-size-billboard-mockup/" },
    { title: "Free Curved Building Billboard Mockup", img: "https://unblast.com/wp-content/uploads/2020/07/Curved-Building-Billboard-Mockup-1-1024x682.jpg", extraImg: "https://unblast.com/wp-content/uploads/2020/07/Curved-Building-Billboard-Mockup-2-1024x682.jpg", tags: ["BillBoards"], download: "https://unblast.com/free-curved-building-billboard-mockup-psd/" },
    { title: "Free Downtown Billboard Mockup", img: "https://unblast.com/wp-content/uploads/2018/05/Downtown-Billboard-Mockup-300x243.jpg", extraImg: "", tags: ["BillBoards"], download: "https://unblast.com/free-downtown-billboard-mockup/" },
    { title: "Free Sky Billboard Mockup", img: "https://unblast.com/wp-content/uploads/2019/12/Sky-Billboard-Mockup-1-1536x1024.jpg", extraImg: "https://unblast.com/wp-content/uploads/2019/12/Sky-Billboard-Mockup-2-1536x1024.jpg", tags: ["BillBoards"], download: "https://unblast.com/free-sky-billboard-mockup-psd/" },
    { title: "Large Billboard Mockup", img: "https://mockuptree.com/wp-content/uploads/edd/2024/12/Free_Billboard_Mockups.jpg", extraImg: "https://mockuptree.com/wp-content/uploads/edd/2024/12/Free_Billboard_Mockup.jpg", tags: ["BillBoards"], download: "https://mockuptree.com/free/large-billboard-mockup/" },
    { title: "Free Standard Billboard Mockup", img: "https://unblast.com/wp-content/uploads/2019/07/Standard-Billboard-Mockup-1024x682.jpg", extraImg: "https://unblast.com/wp-content/uploads/2019/07/Standard-Billboard-Mockup-2-1024x682.jpg", tags: ["BillBoards"], download: "https://unblast.com/free-standard-billboard-mockup-psd/" },
    { title: "Free Outdoor Advertising Billboard Mockup", img: "https://unblast.com/wp-content/uploads/2018/06/Outdoor-Billboard-Mockup-1024x743.jpg", extraImg: "", tags: ["BillBoards"], download: "https://unblast.com/free-outdoor-advertising-billboard-mockup-psd/" },
    { title: "Free NYC Billboard Mockup", img: "https://mockuptree.com/wp-content/uploads/edd/2024/06/nyc-billboard-mockup.jpg", extraImg: "", tags: ["BillBoards"], download: "https://mockuptree.com/free/nyc-billboard-mockup/" },
    { title: "Free Horizontal Billboard Mockup", img: "https://mockuptree.com/wp-content/uploads/edd/2020/06/Free-horizontal-billboard-mockup.jpg", extraImg: "", tags: ["BillBoards"], download: "https://mockuptree.com/free/horizontal-billboard-mockup/" },
    { title: "Free Triple Billboard Mockup", img: "https://mockuptree.com/wp-content/uploads/edd/2021/10/Free-Triple_Billboard_Mockup.jpg", extraImg: "", tags: ["BillBoards"], download: "https://mockuptree.com/free/triple-billboard-mockup-psd/" },
    { title: "Free Outdoor Billboard Mockup", img: "https://ls-graphics-directus-direct.b-cdn.net/assets/38fbf41d-c59c-4f89-bc76-fc7a6f78c652?width=1700&format=webp&quality=90", extraImg: "", tags: ["BillBoards"], download: "https://www.ls.graphics/assets/free-billboard-mockup" },
    { title: "Free Metal Billboard Mockup", img: "https://www.mockupcloud.com/free/metal-billboard-mockup", extraImg: "", tags: ["BillBoards"], download: "https://www.mockupcloud.com/free/metal-billboard-mockup" },
    { title: "Free Digital Screen Advertising Mockup", img: "https://www.mockupcloud.com/free/digital-screen-advertising-mockup", extraImg: "", tags: ["BillBoards"], download: "https://www.mockupcloud.com/free/digital-screen-advertising-mockup" },
    { title: "Free Display Screen Mockup", img: "https://www.mockupcloud.com/free/display-screen-mockup-free-sample", extraImg: "", tags: ["BillBoards"], download: "https://www.mockupcloud.com/free/display-screen-mockup-free-sample" },

    /* COSMETICS */
    { title: "Free Above Each Other Cosmetic Jars Mockup", img: "https://unblast.com/wp-content/uploads/2022/10/Above-Each-Other-Cosmetic-Jars-Mockup-1024x870.jpg", extraImg: "https://unblast.com/wp-content/uploads/2022/10/Above-Each-Other-Cosmetic-Jars-Mockup-2-1024x1024.jpg", tags: ["Cosmetics"], download: "https://unblast.com/above-each-other-cosmetic-jars-mockup-psd/" },
    { title: "Free Cosmetics Tube Mockup", img: "https://unblast.com/wp-content/uploads/2022/06/Cosmetics-Tube-Mockup-1024x1024.jpg", extraImg: "https://unblast.com/wp-content/uploads/2022/06/Cosmetics-Tube-Mockup-2-1024x1024.jpg", tags: ["Cosmetics"], download: "https://unblast.com/free-cosmetics-tube-mockup-psd/" },
    { title: "Free Transparent Perfume Bottle Mockup", img: "https://mrmockup.com/wp-content/uploads/2025/02/Free-Transparent-Perfume-Bottle-Mockup-02.jpg", extraImg: "https://mrmockup.com/wp-content/uploads/2025/02/Free-Transparent-Perfume-Bottle-Mockup-03.jpg", tags: ["Cosmetics"], download: "https://mrmockup.com/free-transparent-perfume-bottle-mockup/" },
    { title: "Free Cosmetic Packaging Mockup", img: "https://mockuptree.com/wp-content/uploads/edd/2025/02/Cosmetic-Mockup-Set-1536x1064.jpg", extraImg: "https://mockuptree.com/wp-content/uploads/edd/2025/02/Cosmetic-Mockup-Sets.jpg", tags: ["Cosmetics"], download: "https://mockuptree.com/free/cosmetic-packaging-mockup-psd/" },
    { title: "Free Beauty Bottle Mockup", img: "https://unblast.com/wp-content/uploads/2021/10/Beauty-Bottle-Mockup-1024x1024.jpg", extraImg: "https://unblast.com/wp-content/uploads/2021/10/Beauty-Bottle-Mockup-2-1024x1024.jpg", tags: ["Cosmetics"], download: "https://unblast.com/free-beauty-bottle-mockup-psd/" },
    { title: "Free In Hand Product Box Mockup", img: "https://unblast.com/wp-content/uploads/2023/05/In-Hand-Product-Box-Mockup-.jpg", extraImg: "https://unblast.com/wp-content/uploads/2023/05/In-Hand-Product-Box-Mockup-2-1092x1536.jpg", tags: ["Cosmetics"], download: "https://unblast.com/in-hand-product-box-mockup-psd/" },
    { title: "Free Dispenser Bottle Mockup", img: "https://unblast.com/wp-content/uploads/2021/06/Dispenser-Bottle-Mockup-1024x768.jpg", extraImg: "https://unblast.com/wp-content/uploads/2021/06/Dispenser-Bottle-Mockup-2-1024x768.jpg", tags: ["Cosmetics"], download: "https://unblast.com/free-dispenser-bottle-mockup-psd/" },
    { title: "Free Bottle & Tube Cosmetic Mockup", img: "https://mockuptree.com/wp-content/uploads/edd/2022/05/Free_Bottle_and_Tube_Mockup.jpg", extraImg: "", tags: ["Cosmetics"], download: "https://mockuptree.com/free/bottle-tube-cosmetic-mockup/" },
    { title: "Free Stylish Cream Tube Mockup", img: "https://www.ls.graphics/assets/free-stylish-cream-tube-mockup", extraImg: "", tags: ["Cosmetics"], download: "https://www.ls.graphics/assets/free-stylish-cream-tube-mockup" },
    { title: "Free Kaolin Cosmetic Scene Mockup", img: "https://www.ls.graphics/assets/kaolin-scene-04", extraImg: "", tags: ["Cosmetics"], download: "https://www.ls.graphics/assets/kaolin-scene-04" }

];


/* =========================================================
   DESCRIPTION SYSTEM
   ========================================================= */

function createDescription(item) {

    const category = item.tags && item.tags.length ? item.tags[0] : "design";

    return `Explore this free ${category.toLowerCase()} resource and use it to present your creative work in a more realistic and professional way.

Perfect for designers, agencies, students and creatives who want to experiment with visual concepts, presentations and client projects.

This resource is sourced from the original creator, and TUSDIO is simply guiding you to the original download page.

Want to bring your ideas to life?

Contact TUSDIO and let's make your story live.`;

}


/* =========================================================
   STATE
   ========================================================= */

let currentFilter = "all";
let currentSearch = "";
let currentIndex = null;
let showSavedOnly = false;
let searchDebounce = null;


/* =========================================================
   STORAGE
   ========================================================= */

const STORAGE_KEYS = {
    liked: "tusdioLikedFreebies",
    saved: "tusdioSavedFreebies"
};

function getStoredArray(key) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return Array.isArray(value) ? value : [];
    } catch {
        return [];
    }
}

function setStoredArray(key, array) {
    localStorage.setItem(key, JSON.stringify(array));
}

function isLiked(index) {
    return getStoredArray(STORAGE_KEYS.liked).includes(String(index));
}

function isSaved(index) {
    return getStoredArray(STORAGE_KEYS.saved).includes(String(index));
}


/* =========================================================
   SAFE HTML
   ========================================================= */

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* =========================================================
   TOASTS
   ========================================================= */

function showToast(message) {

    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;

    container.appendChild(toast);

    requestAnimationFrame(() => toast.classList.add("show"));

    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 2200);

}


/* =========================================================
   IMAGE FALLBACK
   ========================================================= */

function imageFallback(img) {

    img.addEventListener("load", () => img.classList.add("loaded"));

    img.onerror = function () {

        this.onerror = null;

        this.src =
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
                <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
                    <rect width="1200" height="800" fill="#111"/>
                    <text x="600" y="400" text-anchor="middle" dominant-baseline="middle"
                          fill="#777" font-size="34" font-family="Arial">TUSDIO FREEBIE</text>
                </svg>
            `);

        this.classList.add("loaded");

    };

}


function getElement(id) {
    return document.getElementById(id);
}


/* =========================================================
   SKELETON
   ========================================================= */

function renderSkeleton(container, count = 6) {

    container.innerHTML = "";

    for (let i = 0; i < count; i++) {
        const sk = document.createElement("div");
        sk.className = "freebie-skeleton";
        sk.innerHTML = `<div class="sk-image"></div><div class="sk-line"></div>`;
        container.appendChild(sk);
    }

}


/* =========================================================
   LOAD FREEBIES
   ========================================================= */

function loadFreebies(filterTag = currentFilter, searchTerm = currentSearch) {

    const container = getElement("freebiesContainer");
    if (!container) return;

    currentFilter = filterTag;
    currentSearch = searchTerm;

    const query = searchTerm.trim().toLowerCase();

    const filtered = freebies.filter((item, index) => {

        if (showSavedOnly && !isSaved(index)) return false;

        const matchesCategory =
            showSavedOnly ||
            filterTag === "all" ||
            item.tags.includes(filterTag);

        const searchableText = [item.title, ...(item.tags || [])].join(" ").toLowerCase();
        const matchesSearch = !query || searchableText.includes(query);

        return matchesCategory && matchesSearch;

    });

    container.innerHTML = "";
    updateResultsCount(filtered.length);

    if (!filtered.length) {

        container.innerHTML = `
            <div class="freebie-empty">
                <div class="freebie-empty-icon">×</div>
                <h3>${showSavedOnly ? "Nothing saved yet" : "No freebies found"}</h3>
                <p>${showSavedOnly ? "Tap the + on any card to save it for later." : "Try another search or category."}</p>
                <button type="button" id="resetFiltersBtn">${showSavedOnly ? "Browse all resources" : "Reset filters"}</button>
            </div>
        `;

        const resetBtn = getElement("resetFiltersBtn");
        if (resetBtn) resetBtn.addEventListener("click", resetFreebieFilters);

        return;

    }

    filtered.forEach((item) => {

        const index = freebies.indexOf(item);
        const card = document.createElement("article");

        card.className = "freebie";
        card.dataset.id = index;
        card.dataset.tags = item.tags.join(",");
        card.setAttribute("tabindex", "0");
        card.setAttribute("role", "button");
        card.setAttribute("aria-label", `View ${item.title}`);

        const liked = isLiked(index);
        const saved = isSaved(index);

        card.innerHTML = `
            <div class="freebie-image-wrap">
                <img src="${escapeHTML(item.img)}" alt="${escapeHTML(item.title)}" loading="lazy">
                <div class="freebie-card-overlay">
                    <span class="freebie-view">View</span>
                </div>
                <div class="freebie-card-actions">
                    <button type="button" class="freebie-action like-action ${liked ? "liked" : ""}"
                        data-action="like" data-id="${index}" aria-label="${liked ? "Unlike" : "Like"} ${escapeHTML(item.title)}">
                        ${liked ? "♥" : "♡"}
                    </button>
                    <button type="button" class="freebie-action save-action ${saved ? "saved" : ""}"
                        data-action="save" data-id="${index}" aria-label="${saved ? "Remove from saved" : "Save"} ${escapeHTML(item.title)}">
                        ${saved ? "✓" : "＋"}
                    </button>
                </div>
            </div>
            <div class="freebie-content">
                <h3>${escapeHTML(item.title)}</h3>
                <div class="freebie-meta">
                    <span>FREE</span>
                    <span>${escapeHTML(item.tags[0] || "Freebie")}</span>
                </div>
            </div>
        `;

        const image = card.querySelector("img");
        if (image) imageFallback(image);

        card.addEventListener("click", (event) => {
            if (event.target.closest(".freebie-action")) return;
            openFreebieDetails(index);
        });

        card.addEventListener("keydown", (event) => {
            if ((event.key === "Enter" || event.key === " ") && !event.target.closest(".freebie-action")) {
                event.preventDefault();
                openFreebieDetails(index);
            }
        });

        container.appendChild(card);

    });

}


/* =========================================================
   RESULTS COUNT
   ========================================================= */

function updateResultsCount(count) {

    const el = getElement("resultsCount");
    if (!el) return;

    if (showSavedOnly) {
        el.textContent = `${count} saved resource${count === 1 ? "" : "s"}`;
        return;
    }

    if (currentFilter === "all" && !currentSearch) {
        el.textContent = "All resources";
        return;
    }

    el.textContent = `${count} result${count === 1 ? "" : "s"}`;

}


/* =========================================================
   SEARCH
   ========================================================= */

function setupSearch() {

    const searchInput = getElement("freebieSearch");
    const clearBtn = getElement("clearSearch");

    if (!searchInput) return;

    searchInput.addEventListener("input", function () {

        clearTimeout(searchDebounce);

        const value = this.value;
        if (clearBtn) clearBtn.hidden = !value;

        searchDebounce = setTimeout(() => {
            loadFreebies(currentFilter, value);
        }, 150);

    });

    if (clearBtn) {
        clearBtn.addEventListener("click", () => {
            searchInput.value = "";
            clearBtn.hidden = true;
            searchInput.focus();
            loadFreebies(currentFilter, "");
        });
    }

}


/* =========================================================
   CATEGORY / SAVED FILTER
   ========================================================= */

function filterFreebies(tag) {

    showSavedOnly = false;
    currentFilter = tag || "all";

    loadFreebies(currentFilter, currentSearch);
    updateFilterButtons();

}

function toggleSavedView() {

    showSavedOnly = !showSavedOnly;

    loadFreebies(currentFilter, currentSearch);
    updateFilterButtons();

}

function updateFilterButtons() {

    document.querySelectorAll(".filter-btn[data-filter]").forEach(button => {

        if (button.id === "savedToggle") {
            button.classList.toggle("active", showSavedOnly);
            return;
        }

        button.classList.toggle("active", !showSavedOnly && button.dataset.filter === currentFilter);

    });

}

function resetFreebieFilters() {

    currentFilter = "all";
    currentSearch = "";
    showSavedOnly = false;

    const input = getElement("freebieSearch");
    const clearBtn = getElement("clearSearch");

    if (input) input.value = "";
    if (clearBtn) clearBtn.hidden = true;

    loadFreebies("all", "");
    updateFilterButtons();

}

function setupFilters() {

    document.querySelectorAll(".filter-btn[data-filter]").forEach(button => {

        if (button.id === "savedToggle") {
            button.addEventListener("click", toggleSavedView);
            return;
        }

        button.addEventListener("click", () => filterFreebies(button.dataset.filter));

    });

}


/* =========================================================
   OPEN DETAILS
   ========================================================= */

function openFreebieDetails(index) {

    const freebie = freebies[index];
    if (!freebie) return;

    currentIndex = index;

    const details = getElement("freebieDetails");
    const container = getElement("freebiesContainer");

    if (!details) return;

    const title = getElement("detailTitle");
    const image = getElement("detailImage");
    const description = getElement("detailDescription");
    const download = getElement("downloadButton");
    const extraContainer = getElement("extraImageContainer");
    const extraImage = getElement("detailExtraImage");

    if (title) title.textContent = freebie.title;

    if (image) {
        image.src = freebie.img;
        image.alt = freebie.title;
        imageFallback(image);
    }

    if (description) description.textContent = freebie.desc || createDescription(freebie);

    if (download) {
        download.dataset.target = freebie.download;
        download.rel = "noopener noreferrer";
        updateDownloadGateUI();
    }

    if (extraContainer && extraImage) {
        if (freebie.extraImg) {
            extraContainer.style.display = "block";
            extraImage.src = freebie.extraImg;
            extraImage.alt = `${freebie.title} preview`;
            imageFallback(extraImage);
        } else {
            extraContainer.style.display = "none";
        }
    }

    updateDetailTags(freebie);
    updateDetailActions(index);
    loadSimilarFreebies(freebie.tags, index);

    if (container) container.style.display = "none";

    details.style.display = "block";
    details.setAttribute("aria-hidden", "false");

    history.pushState({ freebie: index }, "", `#freebie-${index}`);

    window.scrollTo({ top: 0, behavior: "smooth" });

    const backBtn = details.querySelector(".back-btn");
    if (backBtn) backBtn.focus({ preventScroll: true });

}


/* =========================================================
   DETAIL TAGS
   ========================================================= */

function updateDetailTags(item) {

    const container = getElement("detailTags");
    if (!container) return;

    container.innerHTML = "";

    (item.tags || []).forEach(tag => {
        const span = document.createElement("span");
        span.textContent = tag;
        container.appendChild(span);
    });

}


/* =========================================================
   DETAIL ACTIONS (like / save / share)
   ========================================================= */

function updateDetailActions(index) {

    const likeBtn = getElement("detailLikeBtn");
    const saveBtn = getElement("detailSaveBtn");

    if (likeBtn) {
        likeBtn.classList.toggle("liked", isLiked(index));
        likeBtn.setAttribute("aria-pressed", String(isLiked(index)));
        likeBtn.onclick = () => {
            toggleLike(index);
            likeBtn.classList.toggle("liked", isLiked(index));
        };
    }

    if (saveBtn) {
        saveBtn.classList.toggle("saved", isSaved(index));
        saveBtn.setAttribute("aria-pressed", String(isSaved(index)));
        saveBtn.onclick = () => {
            toggleSave(index);
            saveBtn.classList.toggle("saved", isSaved(index));
        };
    }

    closeSharePopover();

}


/* =========================================================
   SHARE POPOVER
   ========================================================= */

function updateShareLinks(index) {

    const freebie = freebies[index];
    if (!freebie) return;

    const url = `${window.location.origin}${window.location.pathname}#freebie-${index}`;
    const title = freebie.title;

    const linkInput = getElement("shareLinkInput");
    if (linkInput) linkInput.value = url;

    const wa = getElement("shareWhatsapp");
    if (wa) wa.href = `https://wa.me/?text=${encodeURIComponent(title + " — " + url)}`;

    const tw = getElement("shareTwitter");
    if (tw) tw.href = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;

    const em = getElement("shareEmail");
    if (em) em.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(title + "\n" + url)}`;

    const moreBtn = getElement("shareMore");
    if (moreBtn) {
        moreBtn.hidden = !navigator.share;
        moreBtn.onclick = async () => {
            try {
                await navigator.share({ title, url });
                closeSharePopover();
            } catch {
                /* user cancelled the native share sheet — no toast needed */
            }
        };
    }

}

function openSharePopover() {

    const popover = getElement("sharePopover");
    const btn = getElement("detailShareBtn");

    if (!popover || !btn || currentIndex === null) return;

    updateShareLinks(currentIndex);

    popover.hidden = false;

    requestAnimationFrame(() => popover.classList.add("open"));

    btn.classList.add("open");
    btn.setAttribute("aria-expanded", "true");

}

function closeSharePopover() {

    const popover = getElement("sharePopover");
    const btn = getElement("detailShareBtn");

    if (!popover || popover.hidden) return;

    popover.classList.remove("open");

    if (btn) {
        btn.classList.remove("open");
        btn.setAttribute("aria-expanded", "false");
    }

    setTimeout(() => {
        if (!popover.classList.contains("open")) popover.hidden = true;
    }, 220);

}

function setupSharePopover() {

    const btn = getElement("detailShareBtn");
    const popover = getElement("sharePopover");
    const closeBtn = getElement("shareCloseBtn");
    const copyBtn = getElement("shareCopyBtn");
    const linkInput = getElement("shareLinkInput");

    if (btn) {
        btn.addEventListener("click", (event) => {
            event.stopPropagation();
            if (popover && popover.classList.contains("open")) {
                closeSharePopover();
            } else {
                openSharePopover();
            }
        });
    }

    if (closeBtn) closeBtn.addEventListener("click", closeSharePopover);

    if (copyBtn && linkInput) {
        copyBtn.addEventListener("click", async () => {

            try {
                await navigator.clipboard.writeText(linkInput.value);
            } catch {
                linkInput.select();
                try { document.execCommand("copy"); } catch { /* ignore */ }
            }

            const label = copyBtn.querySelector(".share-copy-label");

            copyBtn.classList.add("copied");
            if (label) label.textContent = "Copied";
            showToast("Link copied");

            setTimeout(() => {
                copyBtn.classList.remove("copied");
                if (label) label.textContent = "Copy";
            }, 1600);

        });
    }

    document.addEventListener("click", (event) => {
        if (!popover || popover.hidden) return;
        if (popover.contains(event.target) || event.target === btn) return;
        closeSharePopover();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && popover && !popover.hidden) closeSharePopover();
    });

}


/* =========================================================
   LIKE / SAVE
   ========================================================= */

function toggleLike(index) {

    const liked = getStoredArray(STORAGE_KEYS.liked);
    const id = String(index);
    const nowLiked = !liked.includes(id);

    setStoredArray(
        STORAGE_KEYS.liked,
        nowLiked ? [...liked, id] : liked.filter(item => item !== id)
    );

    showToast(nowLiked ? "Added to likes" : "Removed from likes");
    loadFreebies(currentFilter, currentSearch);

}

function toggleSave(index) {

    const saved = getStoredArray(STORAGE_KEYS.saved);
    const id = String(index);
    const nowSaved = !saved.includes(id);

    setStoredArray(
        STORAGE_KEYS.saved,
        nowSaved ? [...saved, id] : saved.filter(item => item !== id)
    );

    showToast(nowSaved ? "Saved for later" : "Removed from saved");
    updateSavedCount();
    loadFreebies(currentFilter, currentSearch);

}

function updateSavedCount() {
    const el = getElement("savedCount");
    if (el) el.textContent = getStoredArray(STORAGE_KEYS.saved).length;
}


/* =========================================================
   CARD ACTION EVENTS (event delegation)
   ========================================================= */

document.addEventListener("click", event => {

    const button = event.target.closest(".freebie-action");
    if (!button) return;

    const index = Number(button.dataset.id);

    if (button.dataset.action === "like") toggleLike(index);
    if (button.dataset.action === "save") toggleSave(index);

});


/* =========================================================
   SIMILAR FREEBIES
   ========================================================= */

function loadSimilarFreebies(tags, currentItemIndex) {

    const container = getElement("similarFreebies");
    if (!container) return;

    container.innerHTML = "";

    const similar = freebies
        .map((item, index) => ({ item, index }))
        .filter(({ item, index }) => index !== currentItemIndex && item.tags.some(tag => tags.includes(tag)))
        .slice(0, 6);

    if (!similar.length) {
        container.innerHTML = `<p class="no-similar">No similar freebies yet.</p>`;
        return;
    }

    similar.forEach(({ item, index }) => {

        const card = document.createElement("article");
        card.className = "freebie similar-freebie";
        card.dataset.id = index;
        card.setAttribute("tabindex", "0");
        card.setAttribute("role", "button");
        card.setAttribute("aria-label", `View ${item.title}`);

        card.innerHTML = `
            <div class="freebie-image-wrap">
                <img src="${escapeHTML(item.img)}" alt="${escapeHTML(item.title)}" loading="lazy">
                <div class="freebie-card-overlay"><span class="freebie-view">View</span></div>
            </div>
            <div class="freebie-content">
                <h3>${escapeHTML(item.title)}</h3>
                <div class="freebie-meta">
                    <span>FREE</span>
                    <span>${escapeHTML(item.tags[0])}</span>
                </div>
            </div>
        `;

        const image = card.querySelector("img");
        if (image) imageFallback(image);

        card.addEventListener("click", () => openFreebieDetails(index));
        card.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openFreebieDetails(index);
            }
        });

        container.appendChild(card);

    });

}


/* =========================================================
   CLOSE DETAILS
   ========================================================= */

function closeDetails(updateHistory = true) {

    const details = getElement("freebieDetails");
    const container = getElement("freebiesContainer");

    if (!details) return;

    closeSharePopover();

    details.style.display = "none";
    details.setAttribute("aria-hidden", "true");

    if (container) container.style.display = "";

    currentIndex = null;

    if (updateHistory && window.location.hash) {
        history.pushState({}, "", window.location.pathname + window.location.search);
    }

}

window.closeDetails = closeDetails;


/* =========================================================
   BROWSER BACK BUTTON
   ========================================================= */

window.addEventListener("popstate", () => {

    const hash = window.location.hash;

    if (hash.startsWith("#freebie-")) {

        const index = Number(hash.replace("#freebie-", ""));

        if (Number.isInteger(index) && freebies[index]) {
            openFreebieDetails(index);
        }

    } else {

        closeDetails(false);

    }

});


/* =========================================================
   ESCAPE KEY
   ========================================================= */

document.addEventListener("keydown", event => {

    if (event.key === "Escape") {

        const details = getElement("freebieDetails");

        if (details && details.style.display !== "none") {
            closeDetails();
        }

    }

});


/* =========================================================
   FREEBIE / CATEGORY COUNTS
   ========================================================= */

function updateFreebieCount() {

    document.querySelectorAll("[data-freebie-count]").forEach(element => {
        element.textContent = freebies.length;
    });

}

function updateCategoryCounts() {

    document.querySelectorAll("[data-category-count]").forEach(element => {

        const category = element.dataset.categoryCount;

        element.textContent = category === "all"
            ? freebies.length
            : freebies.filter(item => item.tags.includes(category)).length;

    });

}


/* =========================================================
   BACK TO TOP
   ========================================================= */

function setupBackToTop() {

    const btn = getElement("backToTop");
    if (!btn) return;

    window.addEventListener("scroll", () => {
        const visible = window.scrollY > 700;
        btn.hidden = false;
        btn.classList.toggle("visible", visible);
    });

    btn.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

}


/* =========================================================
   URL HASH ON LOAD
   ========================================================= */

function openHashFreebie() {

    const hash = window.location.hash;
    if (!hash.startsWith("#freebie-")) return;

    const index = Number(hash.replace("#freebie-", ""));

    if (Number.isInteger(index) && freebies[index]) {
        setTimeout(() => openFreebieDetails(index), 100);
    }

}


/* =========================================================
   INITIALIZE
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    const container = getElement("freebiesContainer");

    if (container) renderSkeleton(container);

    setupSearch();
    setupFilters();
    setupBackToTop();
    setupSharePopover();
    setupDownloadGate();

    updateFreebieCount();
    updateCategoryCounts();
    updateSavedCount();

    setTimeout(() => {
        loadFreebies("all", "");
        updateFilterButtons();
    }, 220);

    openHashFreebie();

});

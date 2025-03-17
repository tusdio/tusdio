document.addEventListener("DOMContentLoaded", function () {
    const menuToggle = document.querySelector(".menu-toggle");
    const nav = document.querySelector("header nav");

    menuToggle.addEventListener("click", function () {
        nav.classList.toggle("active");
    });
});



// loader 

document.addEventListener("DOMContentLoaded", function () {
    document.querySelector(".loader").style.display = "block";
    setTimeout(() => {
        document.querySelector(".loader").style.display = "none";
        document.querySelector(".grid").style.opacity = "1"; // Show grid after loading
    }, 1000);
});


// freebie grid

// Freebies Data (You can edit this)
const freebies = [


    //SIGNS

//1
    { 
        title: "Free Modern Concrete Building Mockup", 
        img: "https://mrmockup.com/wp-content/uploads/2025/02/Free-Modern-Concrete-Building-Mockup-02.jpg", 
        extraImg: "https://mrmockup.com/wp-content/uploads/2025/02/Free-Modern-Concrete-Building-Mockup-03.jpg", 
        desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
        tags: ["Signs"], 
        download: "https://mrmockup.com/free-modern-concrete-building-mockup/#"
    },

//2
    {
        title: "Free Concrete Wall on the Office Mockup", 
        img: "https://mrmockup.com/wp-content/uploads/2025/02/Free-Concrete-Wall-on-the-Office-Mockup-02.jpg", 
        extraImg: "https://mrmockup.com/wp-content/uploads/2025/02/Free-Concrete-Wall-on-the-Office-Mockup-03.jpg", 
        desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
        tags: ["Signs"], 
        download: "https://mrmockup.com/free-concrete-wall-on-the-office-mockup/"
    },

//3   
    { 
        title: "Free Reception in the Modern Building Mockup", 
        img: "https://mrmockup.com/wp-content/uploads/2024/11/Free-Reception-in-the-Modern-Building-Mockup-02.jpg", 
        extraImg: "https://mrmockup.com/wp-content/uploads/2024/11/Free-Reception-in-the-Modern-Building-Mockup-03.jpg", 
        desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
        tags: ["Signs"], 
        download: "https://mrmockup.com/free-reception-in-the-modern-building-mockup/"
    },

//4
    {
        title: "Free Corrugated Billboard Mockup", 
        img: "https://unblast.com/wp-content/uploads/2023/10/Corrugated-Billboard-Mockup-1536x1152.jpg", 
        extraImg: "https://unblast.com/wp-content/uploads/2023/10/Corrugated-Billboard-Mockup-2-1536x1382.jpg", 
        desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
        tags: ["Signs"], 
        download: "https://unblast.com/corrugated-billboard-mockup/"
    },


//5
    { 
        title: "Free Sign on Corporate Building Mockup", 
        img: "https://mrmockup.com/wp-content/uploads/2023/02/Mr.Mockup-01-Sign-on-Corporate-Building-Mockup-600x400.jpg", 
        extraImg: "", 
        desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
        tags: ["Signs"], 
        download: "https://mrmockup.com/sign-on-corporate-building-mockup/"
    },


//6
    {
        title: "Free Containers Mockup", 
        img: "https://mrmockup.com/wp-content/uploads/2022/12/Mr.Mockup-01-Containers-Mockup-600x400.jpg", 
        extraImg: "", 
        desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
        tags: ["Signs"], 
        download: "https://mrmockup.com/containers-mockup/"
    },


//7
    { 
        title: "Free Front Wall Mockup", 
        img: "https://mrmockup.com/wp-content/uploads/2022/09/Mr.Mockup-01-Front-Wall-Mockup-600x400.jpg", 
        extraImg: "", 
        desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
        tags: ["Signs"], 
        download: "https://mrmockup.com/front-wall-mockup/"
    },



//8
    {
        title: "Free Acrylic Cube Lightbox Mockup", 
        img: "https://unblast.com/wp-content/uploads/2021/11/Acrylic-Cube-Lightbox-Mockup-1024x768.jpg", 
        extraImg: "https://unblast.com/wp-content/uploads/2021/11/Acrylic-Cube-Lightbox-Mockup-2-1024x768.jpg", 
        desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
        tags: ["Signs"], 
        download: "https://mrmockup.com/free-banner-awning-mockup/"
    },


//9    
    { 
        title: "Free Realistic Window Signage Mockup", 
        img: "https://unblast.com/wp-content/uploads/2019/06/Window-Signage-Mockup-1024x709.jpg", 
        extraImg: "https://unblast.com/wp-content/uploads/2019/06/Window-Signage-Mockup-2-1024x709.jpg", 
        desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
        tags: ["Signs"], 
        download: "https://unblast.com/free-realistic-window-signage-mockup-psd/"
    },


//10
    {
        title: "Free Storefront Board Mockup", 
        img: "https://unblast.com/wp-content/uploads/2020/02/Storefront-Board-Mockup-1024x768.jpg", 
        extraImg: "https://unblast.com/wp-content/uploads/2020/02/Storefront-Board-Mockup-2-1024x768.jpg", 
        desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
        tags: ["Signs"], 
        download: "https://unblast.com/free-storefront-board-mockup-psd/"
    },


//11
    { 
        title: "Free Building 3D Logo Signage Mockup", 
        img: "https://unblast.com/wp-content/uploads/2023/05/Building-3D-Logo-Signage-Mockup-1024x932.jpg", 
        extraImg: "https://unblast.com/wp-content/uploads/2023/05/Building-3D-Logo-Signage-Mockup-2-1024x768.jpg", 
        desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
        tags: ["Signs"], 
        download: "https://unblast.com/building-3d-logo-signage-mockup-psd/"
    },


//12
    {
        title: "Free Light Box Sign Mockup", 
        img: "https://mockuptree.com/wp-content/uploads/edd/2023/07/free-light-sign-psd-mockup-640x427.jpg", 
        extraImg: "", 
        desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
        tags: ["Signs"], 
        download: "https://mockuptree.com/free/light-box-sign-mockup/"
    },




    //POSTER


//1
    { 
        title: "Free Hanging Poster on Wall Mockup", 
        img: "https://mrmockup.com/wp-content/uploads/2025/01/Free-Hanging-Poster-on-Wall-Mockup-02.jpg", 
        extraImg: "https://mrmockup.com/wp-content/uploads/2025/01/Free-Hanging-Poster-on-Wall-Mockup-03.jpg", 
        desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
        tags: ["Posters"], 
        download: "https://mrmockup.com/free-hanging-poster-on-wall-mockup/"
    },

//2
    {
        title: "Free Poster in Living Room on Wall Mockup", 
        img: "https://mrmockup.com/wp-content/uploads/2024/02/Free-Poster-in-Living-Room-on-Wall-Mockup-02.jpg", 
        extraImg: "https://mrmockup.com/wp-content/uploads/2024/02/Free-Poster-in-Living-Room-on-Wall-Mockup-03.jpg", 
        desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
        tags: ["Posters"], 
        download: "https://mrmockup.com/free-poster-in-living-room-on-wall-mockup/"
    },

//3   
    { 
        title: "Free Poster in Livingroom Mockup", 
        img: "https://mrmockup.com/wp-content/uploads/2023/08/Free-Poster-in-Livingroom-Mockup-02.jpg", 
        extraImg: "https://mrmockup.com/wp-content/uploads/2023/08/Free-Poster-in-Livingroom-Mockup-03.jpg", 
        desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
        tags: ["Posters"], 
        download: "https://mrmockup.com/free-poster-in-livingroom-mockup/"
    },

//4
    {
        title: "Two Posters on Wall Mockup", 
        img: "https://mrmockup.com/wp-content/uploads/2023/03/Mr.Mockup-02-Two-Posters-on-Wall-Mockup.jpg", 
        extraImg: "https://mrmockup.com/wp-content/uploads/2023/03/Mr.Mockup-03-Two-Posters-on-Wall-Mockup.jpg", 
        desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
        tags: ["Posters"],  
        download: "https://mrmockup.com/two-posters-on-wall-mockup/"
    },


//5
    { 
        title: "Free Poster on the Floor Mockup", 
        img: "https://mrmockup.com/wp-content/uploads/2022/09/Mr.Mockup-Square-Poster-on-the-Floor-Mockup-350x350.png", 
        extraImg: "", 
        desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
        tags: ["Posters"],  
        download: "https://mrmockup.com/poster-on-the-floor-mockup/"
    },


//6
    {
        title: "Free Poster on Brick Wall Mockup", 
        img: "https://mrmockup.com/wp-content/uploads/2022/07/Mr.Mockup-Square-Poster-on-Brick-Wall-Mockup-350x350.jpg", 
        extraImg: "", 
        desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
        tags: ["Posters"], 
        download: "https://mrmockup.com/poster-on-brick-wall-mockup/"
    },


//7
    { 
        title: "Free Twin Modern Interior Posters Mockup", 
        img: "https://unblast.com/wp-content/uploads/2020/01/Twin-Modern-Interior-Posters-Mockup-1024x768.jpg", 
        extraImg: "https://unblast.com/wp-content/uploads/2020/01/Twin-Modern-Interior-Posters-Mockup-2-1024x682.jpg", 
        desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
        tags: ["Posters"], 
        download: "https://unblast.com/free-twin-modern-interior-posters-mockup-psd/"
    },



//8
    {
        title: "Free Posters in Frames on Old Wall Mockup", 
        img: "https://unblast.com/wp-content/uploads/2024/08/Posters-in-Frames-on-Old-Wall-Mockup-1024x768.jpg", 
        extraImg: "https://unblast.com/wp-content/uploads/2024/08/Posters-in-Frames-on-Old-Wall-Mockup-2-1024x768.jpg", 
        desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
        tags: ["Posters"], 
        download: "https://unblast.com/posters-in-frames-on-old-wall-mockup/"
    },


//9    
    { 
        title: "Free Sidewalk Sign Sandwich Board Mockup", 
        img: "https://unblast.com/wp-content/uploads/2024/06/Sidewalk-Sign-Sandwich-Board-Mockup-1024x683.jpg", 
        extraImg: "https://unblast.com/wp-content/uploads/2024/06/Sidewalk-Sign-Sandwich-Board-Mockup-PSD-1024x768.jpg", 
        desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
        tags: ["Posters"], 
        download: "https://unblast.com/sidewalk-sign-sandwich-board-mockup/"
    },


//10
    {
        title: "Free Metal Three Posters Mockup", 
        img: "https://mockuptree.com/wp-content/uploads/edd/2024/07/Three_Posters_In_Metal_Frames.jpg", 
        extraImg: "", 
        desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
        tags: ["Posters"], 
        download: "https://mockuptree.com/free/metal-three-posters-mockup/"
    },


//11
    { 
        title: "Free Bedroom Poster Mockup", 
        img: "https://mockuptree.com/wp-content/uploads/edd/2024/06/Poster_in_Elegant_Bedroom_Mockup.jpg", 
        extraImg: "https://mockuptree.com/wp-content/uploads/edd/2024/06/Poster_in_Elegant_Bedroom_Mockups.jpg", 
        desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
        tags: ["Posters"], 
        download: "https://mockuptree.com/free/bedroom-poster-mockup/"
    },


//12
    {
        title: "Free Wooden Wall Vertical Poster Mockup", 
        img: "https://mockuptree.com/wp-content/uploads/edd/2024/01/Free-Wooden-Wall-Vertical-Poster-Mockup.jpg", 
        extraImg: "", 
        desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
        tags: ["Posters"], 
        download: "https://mockuptree.com/free/wooden-wall-vertical-poster-mockup/"
    },



//13   
    { 
        title: "Free Street Framed Poster Mockup", 
        img: "https://mockuptree.com/wp-content/uploads/edd/2024/02/Poster_Frames_Mockup.jpg", 
        extraImg: "https://mockuptree.com/wp-content/uploads/edd/2024/02/Poster_Frames_Mockup_PSD.jpg", 
        desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
        tags: ["Posters"], 
        download: "https://mockuptree.com/free/street-framed-poster-mockup/"
    },


//14
    {
        title: "Free Wall Street Poster Mockup", 
        img: "https://mockuptree.com/wp-content/uploads/edd/2022/09/free-Wall-Street-poster-Mockup.jpg", 
        extraImg: "", 
        desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
        tags: ["Posters"], 
        download: "https://mockuptree.com/free/wall-street-poster-mockup/"
    },


//15
    { 
        title: "Free Window Poster Mockup", 
        img: "https://mockuptree.com/wp-content/uploads/edd/2020/11/Free-window-Poster-MockUp.jpg", 
        extraImg: "", 
        desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
        tags: ["Posters"], 
        download: "https://mockuptree.com/free/window-poster-mockup/"
    },


//16
    {
        title: "Free Art Gallery Poster Mockup", 
        img: "https://mockuptree.com/wp-content/uploads/edd/2020/06/free-art-gallery-poster-mockup.jpg", 
        extraImg: "", 
        desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
        tags: ["Posters"], 
        download: "https://mockuptree.com/free/art-gallery-poster-mockup/"
    },





        //MAGAZINES


//1
{ 
    title: "Free Horizontal Magazine Mockup", 
    img: "https://mrmockup.com/wp-content/uploads/2024/02/Free-Horizontal-Magazine-Mockup-02.jpg", 
    extraImg: "https://mrmockup.com/wp-content/uploads/2024/02/Free-Horizontal-Magazine-Mockup-03.jpg", 
    desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
    tags: ["Magazines"], 
    download: "https://mrmockup.com/free-horizontal-magazine-mockup/"
},

//2
{
    title: "Free Magazine on Marble Table Mockup", 
    img: "https://mrmockup.com/wp-content/uploads/2023/06/Free-Magazine-on-Marble-Table-Mockup-01-600x400.jpg", 
    extraImg: "https://mrmockup.com/wp-content/uploads/2023/06/Free-Magazine-on-Marble-Table-Mockup-03-1367x2048.jpg", 
    desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
    tags: ["Magazines"], 
    download: "https://mrmockup.com/free-magazine-on-marble-table-mockup/"
},

//3   
{ 
    title: "Free Open Magazine Mockup", 
    img: "https://mrmockup.com/wp-content/uploads/2019/10/Mr.Mockup-01_Open-Magazine-Mockup-600x400.jpg", 
    extraImg: "", 
    desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
    tags: ["Magazines"], 
    download: "https://mrmockup.com/open-magazine-mockup/"
},

//4
{
    title: "Free 4K Magazine Mockup", 
    img: "https://unblast.com/wp-content/uploads/2020/10/4K-Magazine-Mockup-1024x683.jpg", 
    extraImg: "https://unblast.com/wp-content/uploads/2020/10/4K-Magazine-Mockup-2-1-1024x683.jpg", 
    desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
    tags: ["Magazines"],  
    download: "https://unblast.com/free-4k-magazine-mockup-psd/"
},


//5
{ 
    title: "Free Thick Magazine Mockup", 
    img: "https://unblast.com/wp-content/uploads/2020/08/Thick-Magazine-Mockup-1-1024x682.jpg", 
    extraImg: "https://unblast.com/wp-content/uploads/2020/08/Thick-Magazine-Mockup-2-1024x682.jpg", 
    desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
    tags: ["Magazines"],  
    download: "https://unblast.com/free-thick-magazine-mockup-psd/"
},


//6
{
    title: "Free Magazine Set Mockup", 
    img: "https://unblast.com/wp-content/uploads/2020/05/Magazine-Set-Mockup-1-1024x768.jpg", 
    extraImg: "https://unblast.com/wp-content/uploads/2020/05/Magazine-Mockup-2-1-1024x682.jpg", 
    desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
    tags: ["Magazines"], 
    download: "https://unblast.com/free-magazine-set-mockup-psd/"
},


//7
{ 
    title: "Free A5 Magazine Mockup", 
    img: "https://unblast.com/wp-content/uploads/2018/11/A5-Magazine-Mockup-4-1024x766.jpg", 
    extraImg: "https://unblast.com/wp-content/uploads/2018/11/A5-Magazine-Mockup-1024x768.jpg", 
    desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
    tags: ["Magazines"], 
    download: "https://unblast.com/free-a5-magazine-mockup-psd-2/"
},



//8
{
    title: "Free Magazine on Blocks", 
    img: "https://unblast.com/wp-content/uploads/2024/12/Magazine-on-Blocks-Mockup-1024x1024.jpg", 
    extraImg: "", 
    desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
    tags: ["Magazines"], 
    download: "https://unblast.com/magazine-on-blocks-mockup/"
},





    //BILLBOARDS


//1
{ 
    title: "Free Outdoor Wide Billboard Mockup", 
    img: "https://mrmockup.com/wp-content/uploads/2024/09/Free-Outdoor-Wide-Billboard-Mockup-02.jpg", 
    extraImg: "https://mrmockup.com/wp-content/uploads/2024/09/Free-Outdoor-Wide-Billboard-Mockup-03.jpg", 
    desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
    tags: ["BillBoards"],
    download: "https://mrmockup.com/free-outdoor-wide-billboard-mockup/"
},

//2
{
    title: "Free Art Museum Banner Mockups", 
    img: "https://mrmockup.com/wp-content/uploads/2024/05/Free-Art-Museum-Banner-Mockups-02.jpg", 
    extraImg: "https://mrmockup.com/wp-content/uploads/2024/05/Free-Art-Museum-Banner-Mockups-03.jpg", 
    desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
    tags: ["BillBoards"],
    download: "https://mrmockup.com/free-art-museum-banner-mockups/"
},

//3   
{ 
    title: "Free Standard Size Billboard Mockup", 
    img: "https://unblast.com/wp-content/uploads/2023/11/standard-size-billboard-mockup-1024x684.jpg", 
    extraImg: "https://unblast.com/wp-content/uploads/2023/11/standard-size-billboard-mockup-psd-1024x684.jpg", 
    desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
    tags: ["BillBoards"],
    download: "https://unblast.com/standard-size-billboard-mockup/"
},

//4
{
    title: "Free Curved Building Billboard Mockup", 
    img: "https://unblast.com/wp-content/uploads/2020/07/Curved-Building-Billboard-Mockup-1-1024x682.jpg", 
    extraImg: "https://unblast.com/wp-content/uploads/2020/07/Curved-Building-Billboard-Mockup-2-1024x682.jpg", 
    desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
    tags: ["BillBoards"],
    download: "https://unblast.com/free-curved-building-billboard-mockup-psd/"
},


//5
{ 
    title: "Free Downtown Billboard Mockup", 
    img: "https://unblast.com/wp-content/uploads/2018/05/Downtown-Billboard-Mockup-300x243.jpg", 
    extraImg: "", 
    desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
    tags: ["BillBoards"],
    download: "https://unblast.com/free-downtown-billboard-mockup/"
},


//6
{
    title: "Free Sky Billboard Mockup", 
    img: "https://unblast.com/wp-content/uploads/2019/12/Sky-Billboard-Mockup-1-1536x1024.jpg", 
    extraImg: "https://unblast.com/wp-content/uploads/2019/12/Sky-Billboard-Mockup-2-1536x1024.jpg", 
    desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
    tags: ["BillBoards"],
    download: "https://unblast.com/free-sky-billboard-mockup-psd/"
},


//7
{ 
    title: "Large Billboard Mockup", 
    img: "https://mockuptree.com/wp-content/uploads/edd/2024/12/Free_Billboard_Mockups.jpg", 
    extraImg: "https://mockuptree.com/wp-content/uploads/edd/2024/12/Free_Billboard_Mockup.jpg", 
    desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
    tags: ["BillBoards"],
    download: "https://mockuptree.com/free/large-billboard-mockup/"
},



//8
{
    title: "Free Standard Billboard Mockup", 
    img: "https://unblast.com/wp-content/uploads/2019/07/Standard-Billboard-Mockup-1024x682.jpg", 
    extraImg: "https://unblast.com/wp-content/uploads/2019/07/Standard-Billboard-Mockup-2-1024x682.jpg", 
    desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
    tags: ["BillBoards"],
    download: "https://unblast.com/free-standard-billboard-mockup-psd/"
},


//9    
{ 
    title: "Free Outdoor Advertising Billboard Mockup", 
    img: "https://unblast.com/wp-content/uploads/2018/06/Outdoor-Billboard-Mockup-1024x743.jpg", 
    extraImg: "", 
    desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
    tags: ["BillBoards"],
    download: "https://unblast.com/free-outdoor-advertising-billboard-mockup-psd/"
},


//10
{
    title: "Free NYC Billboard Mockup", 
    img: "https://mockuptree.com/wp-content/uploads/edd/2024/06/nyc-billboard-mockup.jpg", 
    extraImg: "", 
    desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
    tags: ["BillBoards"],
    download: "https://mockuptree.com/free/nyc-billboard-mockup/"
},


//11
{ 
    title: "Free Horizontal Billboard Mockup", 
    img: "https://mockuptree.com/wp-content/uploads/edd/2020/06/Free-horizontal-billboard-mockup.jpg", 
    extraImg: "", 
    desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
    tags: ["BillBoards"],
    download: "https://mockuptree.com/free/horizontal-billboard-mockup/"
},


//12
{
    title: "Free Triple Billboard Mockup", 
    img: "https://mockuptree.com/wp-content/uploads/edd/2021/10/Free-Triple_Billboard_Mockup.jpg", 
    extraImg: "", 
    desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
    tags: ["BillBoards"],
    download: "https://mockuptree.com/free/triple-billboard-mockup-psd/"
},







    //COSMETICS


//1
{ 
    title: "Free Above Each Other Cosmetic Jars Mockup", 
    img: "https://unblast.com/wp-content/uploads/2022/10/Above-Each-Other-Cosmetic-Jars-Mockup-1024x870.jpg", 
    extraImg: "https://unblast.com/wp-content/uploads/2022/10/Above-Each-Other-Cosmetic-Jars-Mockup-2-1024x1024.jpg", 
    desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
    tags: ["Cosmetics"],
    download: "https://unblast.com/above-each-other-cosmetic-jars-mockup-psd/"
},

//2
{
    title: "Free Cosmetics Tube Mockup", 
    img: "https://unblast.com/wp-content/uploads/2022/06/Cosmetics-Tube-Mockup-1024x1024.jpg", 
    extraImg: "https://unblast.com/wp-content/uploads/2022/06/Cosmetics-Tube-Mockup-2-1024x1024.jpg", 
    desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
    tags: ["Cosmetics"],
    download: "https://unblast.com/free-cosmetics-tube-mockup-psd/"
},

//3   
{ 
    title: "Free Transparent Perfume Bottle Mockup", 
    img: "https://mrmockup.com/wp-content/uploads/2025/02/Free-Transparent-Perfume-Bottle-Mockup-02.jpg", 
    extraImg: "https://mrmockup.com/wp-content/uploads/2025/02/Free-Transparent-Perfume-Bottle-Mockup-03.jpg", 
    desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
    tags: ["Cosmetics"],
    download: "https://mrmockup.com/free-transparent-perfume-bottle-mockup/"
},

//4
{
    title: "Free Cosmetic Packaging Mockup", 
    img: "https://mockuptree.com/wp-content/uploads/edd/2025/02/Cosmetic-Mockup-Set-1536x1064.jpg", 
    extraImg: "https://mockuptree.com/wp-content/uploads/edd/2025/02/Cosmetic-Mockup-Sets.jpg", 
    desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
    tags: ["Cosmetics"],
    download: "https://mockuptree.com/free/cosmetic-packaging-mockup-psd/"
},


//5
{ 
    title: "Free Beauty Bottle Mockup", 
    img: "https://unblast.com/wp-content/uploads/2021/10/Beauty-Bottle-Mockup-1024x1024.jpg", 
    extraImg: "https://unblast.com/wp-content/uploads/2021/10/Beauty-Bottle-Mockup-2-1024x1024.jpg", 
    desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
    tags: ["Cosmetics"],
    download: "https://unblast.com/free-beauty-bottle-mockup-psd/"
},


//6
{
    title: "Free In Hand Product Box Mockup", 
    img: "https://unblast.com/wp-content/uploads/2023/05/In-Hand-Product-Box-Mockup-.jpg", 
    extraImg: "https://unblast.com/wp-content/uploads/2023/05/In-Hand-Product-Box-Mockup-2-1092x1536.jpg", 
    desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
    tags: ["Cosmetics"],
    download: "https://unblast.com/in-hand-product-box-mockup-psd/"
},


//7
{ 
    title: "Free Dispenser Bottle Mockup", 
    img: "https://unblast.com/wp-content/uploads/2021/06/Dispenser-Bottle-Mockup-1024x768.jpg", 
    extraImg: "https://unblast.com/wp-content/uploads/2021/06/Dispenser-Bottle-Mockup-2-1024x768.jpg", 
    desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
    tags: ["Cosmetics"],
    download: "https://unblast.com/free-dispenser-bottle-mockup-psd/"
},



//8
{
    title: "Free Bottle & Tube Cosmetic Mockup", 
    img: "https://mockuptree.com/wp-content/uploads/edd/2022/05/Free_Bottle_and_Tube_Mockup.jpg", 
    extraImg: "", 
    desc: "Get our Free Modern Concrete Building Mockup and unleash your creativity! Now you can experiment with different styles on our Mockup and present your projects in an originalway. Download it now and let your imagination flow freely! Have Fun!(This mockup is sourced from the original creator, and we’re simply guiding you to it.)🔹 Want to bring your ideas to life? Contact us and let’s make your story live!", 
    tags: ["Cosmetics"],
    download: "https://mockuptree.com/free/bottle-tube-cosmetic-mockup/"
},

];
window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
        document.querySelector(".grid").style.display = "none";
        setTimeout(() => {
            document.querySelector(".grid").style.display = "grid"; // Ensures proper reflow
        }, 50);
    }
});


// Function to Load Freebies with Filtering
function loadFreebies(filterTag = 'all') {
    const container = document.getElementById("freebiesContainer");
    container.innerHTML = "";

    freebies.forEach((item, index) => {
        if (filterTag === 'all' || item.tags.includes(filterTag)) {
            const freebieCard = document.createElement("div");
            freebieCard.classList.add("freebie");
            freebieCard.setAttribute("data-tags", item.tags.join(","));

            freebieCard.innerHTML = `
                <img src="${item.img}" alt="${item.title}" loading="lazy">
                <h3>${item.title}</h3>
            `;

            freebieCard.addEventListener("click", () => openFreebieDetails(index));
            container.appendChild(freebieCard);
        }
    });
}

// Function to Filter Freebies by Tag
function filterFreebies(tag) {
    loadFreebies(tag);
}

// Open Freebie Details and Show Similar Recommendations
function openFreebieDetails(index) {
    const freebie = freebies[index];
    document.getElementById("freebieDetails").style.display = "block";
    document.getElementById("detailTitle").innerText = freebie.title;
    document.getElementById("detailImage").src = freebie.img;
    document.getElementById("detailDescription").innerText = freebie.desc;
    document.getElementById("downloadButton").href = freebie.download;

    // Show extra image only if it exists
    if (freebie.extraImg) {
        document.getElementById("extraImageContainer").style.display = "block";
        document.getElementById("detailExtraImage").src = freebie.extraImg;
    } else {
        document.getElementById("extraImageContainer").style.display = "none";
    }

    // Hide Main Freebies
    document.getElementById("freebiesContainer").style.display = "none";
    
    // Load Similar Freebies
    loadSimilarFreebies(freebie.tags);
}

// Load Similar Freebies Based on Tags
function loadSimilarFreebies(tags) {
    const similarContainer = document.getElementById("similarFreebies");
    similarContainer.innerHTML = "";

    const similarItems = freebies.filter(item => 
        item.tags.some(tag => tags.includes(tag)) && item.title !== document.getElementById("detailTitle").innerText
    );

    similarItems.forEach(item => {
        const similarCard = document.createElement("div");
        similarCard.classList.add("freebie");
        similarCard.innerHTML = `
            <img src="${item.img}" alt="${item.title}" loading="lazy">
            <h3>${item.title}</h3>
        `;
        similarCard.addEventListener("click", () => openFreebieDetails(freebies.indexOf(item)));
        similarContainer.appendChild(similarCard);
    });
}

// Close Details View
function closeDetails() {
    document.getElementById("freebieDetails").style.display = "none";
    document.getElementById("freebiesContainer").style.display = "flex";
}

// Initialize Freebies
loadFreebies();



// like and save //
document.querySelectorAll(".like-btn").forEach(btn => {
    btn.addEventListener("click", function () {
        this.classList.toggle("liked");
        let id = this.closest(".freebie").getAttribute("data-id");
        let likedFreebies = JSON.parse(localStorage.getItem("likedFreebies")) || [];
        
        if (likedFreebies.includes(id)) {
            likedFreebies = likedFreebies.filter(item => item !== id);
        } else {
            likedFreebies.push(id);
        }

        localStorage.setItem("likedFreebies", JSON.stringify(likedFreebies));
    });
});



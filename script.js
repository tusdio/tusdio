* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  overflow-x: hidden;
  scroll-behavior: smooth;
}

body {
  font-family: Arial, Helvetica, sans-serif;
  background-color: #000;
  color: #fff;
  text-align: center;
}

/* Header */
header {
  background: rgba(0, 0, 0, 0.92);
  color: #fff;
  padding: 1rem 0;
  position: fixed;
  width: 100%;
  top: 0;
  left: 0;
  z-index: 1000;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1220px;
  margin: auto;
  padding: 0 20px;
  gap: 18px;
}

.logo-link {
  text-decoration: none;
  color: #fff;
  flex-shrink: 0;
}

.logo {
  margin: 0;
  font-size: 24px;
  font-weight: normal;
  letter-spacing: 1px;
}

header nav {
  margin-left: auto;
}

header nav ul {
  list-style: none;
  display: flex;
  align-items: center;
  gap: 18px;
  margin: 0;
  padding: 0;
}

header nav ul li {
  margin: 0;
}

header nav ul li a {
  color: #fff;
  text-decoration: none;
  font-size: 14px;
  transition: opacity 0.3s ease;
}

header nav ul li a:hover {
  opacity: 0.75;
}

.nav-user-area {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-user-box {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-user-name {
  color: #bdbdbd;
  font-size: 14px;
  white-space: nowrap;
}

.nav-user-btn {
  padding: 7px 14px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: transparent;
  color: #fff;
  cursor: pointer;
  font-size: 13px;
  transition: 0.3s ease;
  text-decoration: none;
  display: inline-block;
  font-family: Arial, Helvetica, sans-serif;
}

.nav-user-btn:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: #fff;
}

.menu-toggle {
  display: none;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: white;
  cursor: pointer;
  flex-shrink: 0;
}

/* Responsive Navbar */
@media (max-width: 1024px) {
  .menu-toggle {
    display: block;
  }

  header nav {
    position: absolute;
    top: 48px;
    left: 0;
    width: 100%;
    background: #000;
    display: none;
    text-align: center;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
    border-top: 1px solid rgba(255, 255, 255, 0.08);
  }

  header nav ul {
    flex-direction: column;
    width: 100%;
    gap: 20px;
    padding: 22px 20px;
    text-align: right;
    align-items: flex-end;
  }

  header nav ul li {
    width: 100%;
  }

  .nav-user-area,
  .nav-user-box {
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
  }

  header nav.active {
    display: block;
  }
}

/* Desktop slideshow */
.slideshow-container {
  margin-top: 76px;
  width: 100%;
  height: 560px;
  overflow: hidden;
  position: relative;
}

.slide {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 1s ease-in-out;
}

@media (max-width: 767px) {
  .slideshow-container {
    display: none;
  }
}

/* Mobile slideshow */
.mobile-slideshow-container {
  display: none;
}

@media (max-width: 767px) {
  .mobile-slideshow-container {
    display: block;
    margin-top: 72px;
    width: 100vw;
    height: 600px;
    overflow: hidden;
    position: relative;
  }

  .mobile-slide {
    width: 100%;
    height: 100%;
    object-fit: contain;
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: opacity 1s ease-in-out;
  }
}

/* Hero */
.hero {
  padding: 52px 20px 70px;
  background: #000;
}

.hero-kicker {
  color: #9c9c9c;
  font-size: 12px;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-bottom: 16px;
}

.hero h1 {
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: normal;
  line-height: 1.1;
  margin-bottom: 14px;
  max-width: 1100px;
  margin-left: auto;
  margin-right: auto;
}

.hero-subtext {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex-wrap: wrap;
}

.typing {
  font-weight: bold;
  border-right: 2px solid white;
  white-space: nowrap;
  overflow: hidden;
  display: inline-block;
  min-width: 140px;
}

.text {
  position: relative;
  font-size: 15px;
  color: #c9c9c9;
}

@media (max-width: 768px) {
  .hero {
    padding: 36px 14px 48px;
  }

  .typing {
    min-width: 170px;
  }

  .text {
    font-size: 13px;
  }
}

/* SEO content */
.seo-content {
  padding: 0 20px 60px;
}

.seo-content-small {
  padding-top: 10px;
}

.seo-content-inner {
  max-width: 860px;
  margin: 0 auto;
  color: #c8c8c8;
}

.seo-content h2 {
  font-size: clamp(1.45rem, 3vw, 2rem);
  font-weight: normal;
  color: #fff;
  margin-bottom: 16px;
}

.seo-content p {
  font-size: 15px;
  line-height: 1.8;
  margin-bottom: 14px;
}

.seo-content a {
  color: #fff;
  text-decoration: underline;
  text-underline-offset: 3px;
}

@media (max-width: 768px) {
  .seo-content {
    padding: 0 16px 42px;
  }

  .seo-content p {
    font-size: 14px;
    line-height: 1.75;
  }
}

/* Projects */
.projects {
  padding: 50px 20px;
  overflow: hidden;
}

.project-text {
  font-size: 28px;
  font-weight: lighter;
  margin-bottom: 26px;
}

.project-gallery {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 18px;
  justify-content: center;
  max-width: 1220px;
  margin: 0 auto;
}

.project-card {
  width: 100%;
  height: 220px;
  background-size: cover;
  background-position: center;
  position: relative;
  cursor: pointer;
  transition: transform 0.35s ease;
  border-radius: 14px;
  overflow: hidden;
}

.project-card:hover {
  transform: scale(1.03);
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.58);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  font-size: 18px;
  font-weight: bold;
}

.project-card:hover .overlay {
  opacity: 1;
}

@media (max-width: 768px) {
  .project-gallery {
    display: flex;
    flex-wrap: nowrap;
    overflow-x: auto;
    gap: 12px;
    padding-bottom: 10px;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .project-gallery::-webkit-scrollbar {
    display: none;
  }

  .project-card {
    min-width: 88%;
    flex-shrink: 0;
  }
}

/* Trust section */
.Worked-Over-50 {
  font-size: 24px;
  padding: 110px 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 14px;
  text-align: center;
}

.Worked-title {
  font-size: 34px;
  font-weight: normal;
}

.Worked-description {
  font-size: 17px;
  color: #8f8f8f;
  max-width: 760px;
}

@media (max-width: 768px) {
  .Worked-Over-50 {
    padding: 60px 20px;
  }

  .Worked-title {
    font-size: 24px;
  }

  .Worked-description {
    font-size: 14px;
  }
}

/* Recent work title */
.image-grid-title {
  font-size: 28px;
  font-weight: lighter;
  margin-bottom: 20px;
}

/* Image Grid */
.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  grid-auto-rows: 200px;
  grid-auto-flow: dense;
  gap: 8px;
  justify-content: center;
  padding: 20px 80px 80px;
}

.image-card {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  border-radius: 12px;
  transition: transform 0.3s ease-in-out;
}

.image-card img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease-in-out;
  border-radius: 12px;
}

.image-card:nth-child(3n) { grid-row: span 2; }
.image-card:nth-child(4n) { grid-column: span 2; }
.image-card:nth-child(5n) { grid-row: span 3; }

.image-card:hover img {
  transform: scale(1.08);
}

.image-grid:hover .image-card:not(:hover) img {
  transform: scale(0.95);
}

@media (max-width: 768px) {
  .image-grid {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    grid-auto-rows: 150px;
    gap: 6px;
    padding: 10px 12px 60px;
  }
}

/* FAQ */
.faq-container {
  position: relative;
  width: 100%;
  padding: 100px 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 50px;
}

.background-image {
  position: absolute;
  inset: 0;
  background: url('images/FAQ/1.jpg') no-repeat center center/cover;
  filter: brightness(0.45);
  z-index: -1;
}

.faq-info {
  flex: 1;
  max-width: 400px;
  color: white;
  text-align: left;
}

.faq-info h2 {
  font-size: 32px;
  margin-bottom: 10px;
}

.faq-info p {
  font-size: 18px;
  line-height: 1.5;
  color: #d2d2d2;
}

.faq-link-line {
  margin-top: 16px;
  font-size: 15px !important;
  color: #c9c9c9 !important;
}

.faq-link-line a {
  color: #fff;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.faq-content {
  flex: 2;
  background: rgba(0, 0, 0, 0.88);
  padding: 30px;
  border-radius: 14px;
  max-width: 650px;
  width: 100%;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.faq {
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  padding: 12px 0;
}

.question {
  display: flex;
  justify-content: space-between;
  cursor: pointer;
  gap: 18px;
}

.question h3 {
  text-align: left;
  font-size: 20px;
  display: flex;
  align-items: center;
}

.toggle-btn {
  font-size: 24px;
  font-weight: bold;
  transition: transform 0.3s;
  flex-shrink: 0;
}

.answer {
  margin-top: 10px;
  max-height: 0;
  overflow: hidden;
  color: #bbbbbb;
  transition: max-height 0.3s ease-out;
  padding-left: 10px;
  text-align: left;
}

.faq.active .answer {
  max-height: 100px;
}

.faq.active .toggle-btn {
  transform: rotate(45deg);
}

@media (max-width: 768px) {
  .faq-container {
    flex-direction: column;
    padding: 50px 20px;
    gap: 30px;
  }

  .faq-info {
    text-align: center;
  }

  .faq-info h2 {
    font-size: 24px;
  }

  .faq-info p {
    font-size: 14px;
  }

  .faq-content {
    width: 100%;
  }

  .question h3 {
    font-size: 18px;
  }

  .toggle-btn {
    font-size: 20px;
  }

  .faq-link-line {
    font-size: 14px !important;
  }
}

/* Footer */
.footer {
  background-color: #f1f1f1;
  color: #000;
  padding: 50px 20px;
  text-align: center;
}

.footer-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 1200px;
  margin: auto;
}

.footer-left,
.footer-center,
.footer-right {
  flex: 1;
  min-width: 250px;
  text-align: left;
  padding: 10px;
}

.footer-logo {
  font-size: 24px;
  font-weight: bold;
}

.footer-description {
  font-size: 14px;
  margin: 10px 0;
  color: #444;
}

.social-links {
  margin-top: 10px;
}

.social-links a {
  text-decoration: none;
  margin-right: 12px;
}

.social-links img {
  max-width: 20px;
  max-height: 20px;
  vertical-align: middle;
}

.footer-center h3,
.footer-right h3 {
  font-size: 18px;
  margin-bottom: 10px;
}

.footer-center ul {
  list-style: none;
  padding: 0;
}

.footer-center ul li {
  margin: 8px 0;
}

.footer-center ul li a,
.footer-right a {
  color: #000;
  text-decoration: none;
}

.footer-center ul li a:hover,
.footer-right a:hover {
  color: #777;
}

.footer-right p {
  font-size: 14px;
  margin-bottom: 10px;
}

.footer-form {
  display: flex;
  flex-direction: column;
}

.footer-form input,
.footer-form textarea {
  width: 100%;
  padding: 8px;
  margin-bottom: 10px;
  border: none;
  border-radius: 6px;
}

.footer-form textarea {
  height: 80px;
}

.footer-form button {
  background: #000;
  color: white;
  padding: 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.footer-form button:hover {
  background: #444;
}

.footer-bottom {
  margin-top: 30px;
  font-size: 14px;
  opacity: 0.7;
}

@media (max-width: 768px) {
  .footer-container {
    flex-direction: column;
    text-align: center;
  }

  .footer-left,
  .footer-center,
  .footer-right {
    text-align: center;
  }

  .footer-form {
    align-items: center;
  }

  .footer-form input,
  .footer-form textarea {
    width: 90%;
  }

  .menu-toggle {
    display: block;
  }

  header nav {
    position: absolute;
    top: 60px;
    left: 0;
    width: 100%;
    background: #000;
    display: none;
    text-align: center;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
  }

  header nav ul {
    flex-direction: column;
    width: 100%;
    gap: 24px;
    padding-top: 20px;
    padding-bottom: 20px;
    text-align: right;
    padding-right: 20px;
    align-items: flex-end;
  }

  header nav ul li {
    margin: 0;
    width: 100%;
  }

  .nav-user-area,
  .nav-user-box {
    flex-direction: column;
    align-items: flex-end;
    gap: 8px;
  }

  header nav.active {
    display: block;
  }
}

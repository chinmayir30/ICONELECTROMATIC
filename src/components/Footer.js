/**
 * Footer Component — ICON ELECTROMATIC
 * Clean, professional footer inspired by the reference design.
 * Two-part layout: blue banner + clean content area.
 */

export function renderFooter() {
  const year = new Date().getFullYear();

  return `
    <footer class="site-footer-white">
      <div class="footer-main">
        <div class="container footer-main-inner">
          
          <!-- Left: Logo, Text, Socials -->
          <div class="footer-brand-col">
            <a data-route="/" class="footer-logo-link">
              <img src="/icon-logo-transparent.png" alt="ICON ELECTROMATIC" />
            </a>
            <p class="footer-tagline">
              Delivering advanced RF, Microwave, and<br/>
              High-Rel electronic components from DC to<br/>
              86 GHz for aerospace, defense, SATCOM,<br/>
              and telecommunications.
            </p>
            <div class="footer-social-icons">
              <a href="#" target="_blank"><i class="fa-brands fa-linkedin-in"></i></a>
              <a href="#" target="_blank"><i class="fa-brands fa-youtube"></i></a>
              <a href="mailto:salesiepl@iconelectromatic.com"><i class="fa-solid fa-envelope"></i></a>
              <a href="tel:+918025429452"><i class="fa-solid fa-phone"></i></a>
            </div>
          </div>

          <!-- Center: Office Locations -->
          <div class="footer-offices-col">
            <h4 class="footer-heading">Office Addresses</h4>
            
            <div class="footer-office-item">
              <div class="office-icon"><i class="fa-solid fa-location-dot"></i></div>
              <div class="office-details">
                <h5>Icon Electromatic Pvt. Ltd. (India)</h5>
                <p>#303/2, 5th 'A' Cross, HRBR Layout, III Block,<br/>Kalyan Nagar, Bengaluru – 560043</p>
                <p>Tel: +91 80 2542 9452</p>
              </div>
            </div>

            <div class="footer-office-item">
              <div class="office-icon"><i class="fa-solid fa-location-dot"></i></div>
              <div class="office-details">
                <h5>Icon Electromatic Singapore Pte Ltd</h5>
                <p>204D Compassvale Drive #08-409<br/>Singapore 544204</p>
              </div>
            </div>

            <div class="footer-office-item">
              <div class="office-icon"><i class="fa-solid fa-location-dot"></i></div>
              <div class="office-details">
                <h5>Icon Electromatic LLC (USA)</h5>
                <p>15412 Meadow Vista Dr, Edmond,<br/>Oklahoma 73013, USA</p>
                <p>Tel: +1 405 593 5176</p>
              </div>
            </div>
          </div>

          <!-- Right: Quick Links -->
          <div class="footer-links-col">
            <h4 class="footer-heading">Quick Links</h4>
            <ul>
              <li><a data-route="/"><i class="fa-solid fa-chevron-right"></i> Home</a></li>
              <li><a data-route="/about"><i class="fa-solid fa-chevron-right"></i> About Us</a></li>
              <li><a data-route="/products"><i class="fa-solid fa-chevron-right"></i> Products</a></li>
              <li><a data-route="/services"><i class="fa-solid fa-chevron-right"></i> Services</a></li>
              <li><a data-route="/partners"><i class="fa-solid fa-chevron-right"></i> Partners</a></li>
              <li><a data-route="/blogs"><i class="fa-solid fa-chevron-right"></i> Blogs</a></li>
              <li><a data-route="/contact"><i class="fa-solid fa-chevron-right"></i> Contact Us</a></li>
            </ul>
          </div>

        </div>
      </div>

      <div class="footer-copyright-bar">
        <div class="container footer-copyright-inner" style="justify-content:center;text-align:center;">
          <p>&copy; ${year} ICON ELECTROMATIC PRIVATE LIMITED. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `;
}

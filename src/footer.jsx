import React from "react";

// --- SVG ICONS for the Footer ---
const InstagramIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);
const FacebookIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);
const WhatsAppIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
  </svg>
);

const Footer = () => {
  return (
    <footer style={styles.footerContainer}>
      <div style={styles.footerContent}>
        {/* Column 1: Brand and Socials */}
        <div style={styles.footerColumn}>
          <h2 style={styles.logo}>AUTOMECH</h2>
          <p style={styles.description}>
            Your trusted partner in automotive excellence. Precision engineering
            for peak performance.
          </p>
          <div style={styles.socialIcons}>
            <a
              href="https://www.instagram.com/automechworkshop/"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.socialLink}
            >
              <InstagramIcon />
            </a>
            <a
              href="https://www.facebook.com/automechworkshop"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.socialLink}
            >
              <FacebookIcon />
            </a>
            <a
              href="https://wa.me/+923004292156"
              target="_blank"
              rel="noopener noreferrer"
              style={styles.socialLink}
            >
              <WhatsAppIcon />
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div style={styles.footerColumn}>
          <h3 style={styles.columnTitle}>Quick Links</h3>
          <a href="/services" style={styles.footerLink}>
            Services
          </a>
          <a href="/booking" style={styles.footerLink}>
            Book Service
          </a>
          <a href="/about" style={styles.footerLink}>
            About Us
          </a>
          <a href="/contact" style={styles.footerLink}>
            Contact
          </a>
        </div>

        {/* Column 3: Contact Info */}
        <div style={styles.footerColumn}>
          <h3 style={styles.columnTitle}>Contact Us</h3>
          <p style={styles.contactInfo}>570 - Q, JOHAR TOWN , LAHORE, 54000</p>
          <p style={styles.contactInfo}>
            <a href="mailto:contact@automech.com" style={styles.footerLink}>
              contact@automech.com
            </a>
          </p>
          <p style={styles.contactInfo}>
            <a href="tel:+923004292156" style={styles.footerLink}>
              +92 (300) 4292-156
            </a>
          </p>
        </div>
      </div>
      <div style={styles.footerBottom}>
        <p>© {new Date().getFullYear()} AUTOMECH. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

// --- STYLES ---
const styles = {
  footerContainer: {
    width: "100%",
    padding: "60px 5% 20px",
    backgroundColor: "rgba(10, 10, 20, 0.5)",
    backdropFilter: "blur(15px)",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    color: "#E0E0E0",
    fontFamily: "'Inter', sans-serif",
    boxSizing: "border-box",
    marginTop: "70px", // Pushes footer to the bottom in a flex column layout
  },
  footerContent: {
    display: "flex",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: "40px",
    marginBottom: "40px",
  },
  footerColumn: {
    flex: "1",
    minWidth: "250px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  },
  logo: {
    fontSize: "2rem",
    fontWeight: "700",
    letterSpacing: "2px",
    color: "#FFFFFF",
    margin: "0 0 10px 0",
    textShadow: "0 0 5px rgba(255, 255, 255, 0.5)",
  },
  description: {
    margin: 0,
    fontSize: "0.95rem",
    lineHeight: 1.6,
    color: "rgba(255, 255, 255, 0.7)",
    maxWidth: "300px",
  },
  socialIcons: {
    display: "flex",
    gap: "20px",
    marginTop: "10px",
  },
  socialLink: {
    color: "#E0E0E0",
    transition: "color 0.2s ease, transform 0.2s ease",
  },
  columnTitle: {
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: "10px",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  footerLink: {
    textDecoration: "none",
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: "1rem",
    transition: "color 0.2s ease",
  },
  contactInfo: {
    margin: 0,
    fontSize: "1rem",
    lineHeight: 1.5,
    color: "rgba(255, 255, 255, 0.7)",
  },
  footerBottom: {
    textAlign: "center",
    paddingTop: "20px",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
    fontSize: "0.9rem",
    color: "rgba(255, 255, 255, 0.5)",
  },
};

export default Footer;

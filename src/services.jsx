import React, { useState, useEffect, useRef } from "react";
import BackgroundWrapper from "./background"; // Reuse your cool background
import NavBar from "./navbar";
import engine from "./assets/engine.jpg";
import oil from "./assets/oil.jpg";
import brake from "./assets/brake.jpg";
import wheel from "./assets/wheel.jpg";
import tuning from "./assets/tuning.jpg";
import detailing from "./assets/detailing.avif";
import Footer from "./footer";
const servicesData = [
  {
    id: 1,
    name: "Engine Diagnostics",
    description:
      "Advanced computer diagnostics to pinpoint issues with precision.",
    imageUrl: engine,
  },
  {
    id: 2,
    name: "Oil & Filter Change",
    description:
      "Premium synthetic oils and high-quality filters for peak performance.",
    imageUrl: oil,
  },
  {
    id: 3,
    name: "Brake Services",
    description:
      "Comprehensive brake inspection, repair, and replacement services.",
    imageUrl: brake,
  },
  {
    id: 4,
    name: "Tire & Wheel Alignment",
    description:
      "State-of-the-art laser alignment for improved handling and tire life.",
    imageUrl: wheel,
  },
  {
    id: 5,
    name: "Performance Tuning",
    description:
      "ECU remapping and performance upgrades to unlock your car’s potential.",
    imageUrl: tuning,
  },
  {
    id: 6,
    name: "Full Detailing",
    description:
      "Meticulous interior and exterior cleaning for a showroom finish.",
    imageUrl: detailing,
  },
];

// --- THE CORRECTED SERVICE CARD COMPONENT ---
const ServiceCard = ({ service, index }) => {
  // 1. STATE TO MANAGE HOVER
  const [isHovered, setIsHovered] = useState(false);

  // Logic for scroll-in animation (remains the same)
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (cardRef.current) observer.observe(cardRef.current);
    return () => {
      if (cardRef.current) observer.unobserve(cardRef.current);
    };
  }, []);

  const visibilityClass = isVisible ? "is-visible" : "";
  const cardDynamicStyle = { transitionDelay: `${index * 100}ms` };

  // 3. CONDITIONAL STYLES ARE APPLIED DYNAMICALLY
  return (
    <div
      ref={cardRef}
      className={`service-card ${visibilityClass}`}
      style={cardDynamicStyle}
      // 2. EVENT HANDLERS TO UPDATE STATE
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        style={{
          ...styles.cardBackground,
          backgroundImage: `url(${service.imageUrl})`,
          // Apply hover styles conditionally
          ...(isHovered ? styles.cardBackgroundHover : {}),
        }}
      />
      <div
        style={{
          ...styles.cardOverlay,
          // Apply hover styles conditionally
          ...(isHovered ? styles.cardOverlayHover : {}),
        }}
      />
      <div style={styles.cardContent}>
        <h3 style={styles.serviceName}>{service.name}</h3>
        <div
          style={{
            ...styles.serviceDetailsContainer,
            // Apply hover styles conditionally
            ...(isHovered ? styles.serviceDetailsContainerHover : {}),
          }}
        >
          <p style={styles.serviceDescription}>{service.description}</p>
          <button style={styles.exploreButton}>Explore</button>
        </div>
      </div>
    </div>
  );
};

const ServicesPage = () => {
  return (
    <>
      {/* The style tag is now ONLY for the scroll-in animation, not hover */}
      <style>{`
                .service-card {
                    opacity: 0;
                    transform: translateY(50px);
                    transition: opacity 0.6s ease-out, transform 0.6s ease-out;
                }
                .service-card.is-visible {
                    opacity: 1;
                    transform: translateY(0);
                }
            `}</style>
      <BackgroundWrapper>
        <div style={styles.pageContainer}>
          <NavBar />
          <h1 style={styles.pageTitle}>Our Expertise. Your Advantage.</h1>
          <p style={styles.pageSubtitle}>
            We offer a comprehensive range of services, all performed by
            certified professionals using cutting-edge technology.
          </p>
          <div style={styles.servicesGrid}>
            {servicesData.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                index={index % 3}
              />
            ))}
          </div>
        </div>
        <Footer />
      </BackgroundWrapper>
    </>
  );
};

// --- STYLES ---
// We now separate base styles from hover styles for clarity
const styles = {
  // Page Layout
  pageContainer: {
    fontFamily: "'Exo 2', sans-serif",
    color: "#FFFFFF",
    padding: "120px 5% 50px",
    minHeight: "100vh",
  },
  pageTitle: {
    textAlign: "center",
    fontSize: "3.5rem",
    fontWeight: "700",
    marginBottom: "10px",
    textShadow: "0 0 15px rgba(0, 168, 255, 0.5)",
  },
  pageSubtitle: {
    textAlign: "center",
    fontSize: "1.2rem",
    maxWidth: "700px",
    margin: "0 auto 60px auto",
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: "1.6",
  },
  servicesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "30px",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  // --- Card Base Styles ---
  serviceCard: {
    aspectRatio: "4 / 3",
    borderRadius: "15px",
    overflow: "hidden",
    position: "relative",
    color: "#FFF",
    cursor: "pointer",
    boxShadow: "0 10px 30px rgba(0, 0, 0, 0.3)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  cardBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundSize: "cover",
    backgroundPosition: "center",
    transition: "transform 0.5s ease, filter 0.5s ease",
  },
  cardOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    transition: "background-color 0.5s ease, backdrop-filter 0.5s ease",
  },
  cardContent: {
    position: "relative",
    zIndex: 2,
    padding: "25px",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  serviceName: {
    fontSize: "2rem",
    fontWeight: "700",
    lineHeight: "1.2",
    margin: "0",
    textShadow: "0 2px 10px rgba(0,0,0,0.7)",
  },
  serviceDetailsContainer: {
    opacity: 0,
    transform: "translateY(20px)",
    transition: "opacity 0.4s ease 0.1s, transform 0.4s ease 0.1s",
  },
  serviceDescription: {
    fontSize: "1rem",
    margin: "0 0 20px 0",
    lineHeight: "1.5",
    color: "rgba(255, 255, 255, 0.95)",
  },
  exploreButton: {
    fontFamily: "'Exo 2', sans-serif",
    fontSize: "0.9rem",
    fontWeight: "600",
    padding: "10px 20px",
    background: "linear-gradient(90deg, #00A8FF, #007BFF)",
    color: "#FFF",
    border: "none",
    borderRadius: "50px",
    cursor: "pointer",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },

  // --- HOVER STATE STYLES ---
  // These objects contain ONLY the styles that are applied on hover
  cardBackgroundHover: {
    transform: "scale(1.1)",
    filter: "blur(8px)",
  },
  cardOverlayHover: {
    backgroundColor: "rgba(10, 21, 51, 0.7)",
    backdropFilter: "blur(2px)",
  },
  serviceDetailsContainerHover: {
    opacity: 1,
    transform: "translateY(0)",
  },
};

export default ServicesPage;

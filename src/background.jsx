import React from "react";

const BackgroundWrapper = ({ children }) => {
  // We inject the keyframes animation directly into the document's head.
  // This is a standard way to handle CSS animations in CSS-in-JS.
  const keyframes = `
    @keyframes gradient-animation {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
  `;

  const styles = {
    background: {
      background:
        "linear-gradient(-45deg, #020215,rgb(7, 7, 27),rgb(0, 0, 0),rgb(0, 0, 0))",
      backgroundSize: "400% 400%",
      animation: "gradient-animation 15s ease infinite",
      // 'position: fixed' is the key to making it cover the entire viewport
      // and stay in place during scroll.
      position: "fixed",
      top: 0,
      left: 0,
      height: "100vh",
      width: "100vw",
      zIndex: -1, // Places it behind all other content
    },
    wrapper: {
      position: "relative", // Establishes a new stacking context
      zIndex: 1,
      minHeight: "100vh", // Ensures the content area can grow
      width: "100%",
    },
  };

  return (
    <>
      <style>{keyframes}</style>
      <div style={styles.background}></div>
      <div style={styles.wrapper}>{children}</div>
    </>
  );
};

export default BackgroundWrapper;

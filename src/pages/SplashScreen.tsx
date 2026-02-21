import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const SPLASH_IMAGES = [
  "/images/splash-atlas.jpeg",
  "/images/splash-sculptor.jpeg",
  "/images/splash-lion.jpeg",
  "/images/splash-batman.jpeg",
  "/images/splash-ali.jpeg",
  "/images/splash-hercules.jpeg",
  "/images/splash-silhouette.jpeg",
  "/images/splash-sisyphus.jpeg",
];

const CYCLE_INTERVAL = 300; // 0.3 seconds per image
const TOTAL_DURATION = 5000; // 5 seconds total

const SplashScreen = () => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);

  // Preload all images immediately
  useEffect(() => {
    SPLASH_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Cycle through images every 0.3s
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SPLASH_IMAGES.length);
    }, CYCLE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  // Navigate away after 5 seconds
  const handleNavigate = useCallback(() => {
    const hasOnboarded = localStorage.getItem("aurelius-onboarded");
    navigate(hasOnboarded ? "/home" : "/onboarding");
  }, [navigate]);

  useEffect(() => {
    // Start fade out slightly before navigation
    const fadeTimer = setTimeout(() => setFadeOut(true), TOTAL_DURATION - 500);
    const navTimer = setTimeout(handleNavigate, TOTAL_DURATION);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(navTimer);
    };
  }, [handleNavigate]);

  return (
    <div
      className="phone-container"
      onClick={handleNavigate}
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        overflow: "hidden",
        cursor: "pointer",
        backgroundColor: "#000",
      }}
    >
      {/* Rapid cycling background images */}
      {SPLASH_IMAGES.map((src, i) => (
        <div
          key={src}
          style={{
            position: "absolute",
            inset: 0,
            opacity: i === currentIndex ? 1 : 0,
            transition: "opacity 0.05s ease",
            zIndex: 1,
          }}
        >
          <img
            src={src}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "center",
              filter: "grayscale(30%) contrast(1.1)",
            }}
          />
        </div>
      ))}

      {/* Dark overlay for text readability */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0, 0, 0, 0.35)",
          zIndex: 2,
        }}
      />

      {/* "thinkinglab" text overlay — white Instrument Serif */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 3,
          opacity: fadeOut ? 0 : 1,
          transition: "opacity 0.5s ease",
        }}
      >
        <h1
          style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: "clamp(56px, 14vw, 96px)",
            color: "#ffffff",
            letterSpacing: "0.04em",
            fontWeight: 700,
            fontStyle: "normal",
            textAlign: "center",
            lineHeight: 1,
            textShadow: "0 2px 20px rgba(0,0,0,0.5), 0 0 60px rgba(0,0,0,0.3)",
            userSelect: "none",
          }}
        >
          thinkinglab
        </h1>
      </div>

      {/* Fade-out overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#000",
          opacity: fadeOut ? 1 : 0,
          transition: "opacity 0.5s ease",
          zIndex: 4,
          pointerEvents: "none",
        }}
      />
    </div>
  );
};

export default SplashScreen;

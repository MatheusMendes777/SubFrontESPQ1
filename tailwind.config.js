/**
 * StoreBooks - configuração do Tailwind (tema roxo + neutros escuros).
 * Funciona no CDN (GitHub Pages, via <script>) e em build Node (module.exports).
 */
const config = {
  content: ["./index.html", "./js/**/*.js"],
  corePlugins: { container: false, visibility: false }, // evita conflito com Bootstrap
  theme: {
    extend: {
      colors: {
        ink: "#0e0c15", graphite: "#18151f", slate2: "#231f2e",
        fog: "#e7e4ee", mute: "#9b97ab",
        brand: { 300: "#c4b5fd", 400: "#a78bfa", 500: "#8b5cf6", 600: "#7c3aed", 700: "#6d28d9", 900: "#3b1a7a" },
      },
      spacing: { 18: "4.5rem", 22: "5.5rem", 128: "32rem" },
      fontFamily: {
        display: ['"Fraunces"', "Georgia", "serif"],
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 8px 24px -10px rgba(0,0,0,.7)",
        glow: "0 0 0 4px rgba(139,92,246,.4)",
        violet: "0 20px 60px -15px rgba(124,58,237,.6)",
      },
      keyframes: {
        fadeIn: { "0%": { opacity: 0, transform: "translateY(-8px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
        slideIn: { "0%": { opacity: 0, transform: "translateX(-60px)" }, "100%": { opacity: 1, transform: "translateX(0)" } },
        underlineGrow: { "0%": { transform: "scaleX(0)" }, "100%": { transform: "scaleX(1)" } },
        shadowPulse: {
          "0%,100%": { boxShadow: "0 25px 50px -12px rgba(0,0,0,.8)" },
          "50%": { boxShadow: "0 25px 60px -8px rgba(139,92,246,.6)" },
        },
        pulseSocial: { "0%,100%": { transform: "scale(1)" }, "50%": { transform: "scale(1.3) rotate(8deg)" } },
        floaty: { "0%,100%": { transform: "translateY(0) rotate(-2deg)" }, "50%": { transform: "translateY(-12px) rotate(2deg)" } },
      },
      animation: {
        fadeIn: "fadeIn .8s ease-out both",
        slideIn: "slideIn .7s cubic-bezier(.22,1,.36,1) both",
        underlineGrow: "underlineGrow .35s ease-out forwards",
        shadowPulse: "shadowPulse 1.6s ease-in-out infinite",
        "pulse-social": "pulseSocial .8s ease-in-out infinite",
        floaty: "floaty 6s ease-in-out infinite",
      },
    },
  },
};
if (typeof module !== "undefined") module.exports = config;
if (typeof tailwind !== "undefined") tailwind.config = config;

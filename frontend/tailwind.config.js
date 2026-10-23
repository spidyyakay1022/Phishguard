/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#10262E",
        paper: "#F2F5F7",
        line: "#D5DEE3",
        safe: "#1F7A5A",
        caution: "#B87A00",
        danger: "#C4352B",
        critical: "#8E1B2C",
      },
      fontFamily: {
        sans: ['"Schibsted Grotesk"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

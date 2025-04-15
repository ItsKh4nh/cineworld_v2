/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
      "3xl": "2200px",
    },
    extend: {
      padding: {
        "50vh": "50vh",
      },
      spacing: {
        "40rem": "40rem",
        "45rem": "45rem",
        "55rem": "55rem",
        "63rem": "63rem",
        "70rem": "70rem",
      },
      colors: {
        cineworldYellow: "#a47504",
      },
    },
  },
  plugins: [
    require("tailwindcss-textshadow"),
  ],
};

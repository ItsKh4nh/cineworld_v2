/**
@type {import('tailwindcss').Config}
**/
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
      background: {
        avengers:
          "linear-gradient(to right bottom, rgba('#7ed56f',0.8), rgba('#28b485',0.8)),url()",
        fadeBottom:
          "linear-gradient(180deg,hsl(0deg 0% 0% / 0%),#000000a2,hsl(0deg 0% 7%));",
        fadeBlack:
          "background: linear-gradient(1turn,hsl(0deg 0% 0% / 60%),hsl(0deg 0% 0% / 0%) 65%);",
        fadeRed:
          "linear-gradient(90deg, hsl(0deg 77% 42% / 44%) 0%, hsl(0deg 59% 46% / 51%) 35%, hsl(220deg 26% 44% / 0%) 100%) ",
      },
      color: {
        black: "#010511",
        transparentWhite: "#33333380",
        transparentBlack: "#000000bf",
      },
    },
  },
  corePlugins: {
    lineClamp: true,
  },
};

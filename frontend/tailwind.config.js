/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        Poppins_300Light: "Poppins_300Light",
        Poppins_400Regular: "Poppins_400Regular",
        Poppins_500Medium: "Poppins_500Medium",
        Poppins_600SemiBold: "Poppins_600SemiBold",
        Manrope_300Light: "Manrope_300Light",
        Manrope_400Regular: "Manrope_400Regular",
        Manrope_500Medium: "Manrope_500Medium",
        Manrope_600SemiBold: "Manrope_600SemiBold",
        SecularOne_400Regular: "SecularOne_400Regular",
      },
      colors: () => ({
        blackPrimary: "#181818",
        grayLight: "#EEE",
        grayMedium: "#ECECEC",
        purplePrimary: "#4E2A84",
        bgLight: "#F9F9F9",
        grayPrimary: "#B5B5B5"
      }),
    },
  },
  plugins: [],
};

module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      // fontFamily: {
      //   sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      // },
    }
  },
  plugins: [require('@tailwindcss/forms')]
};

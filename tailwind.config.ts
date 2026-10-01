import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#edf3ec",
          100: "#dce9dc",
          200: "#bdd4c3",
          300: "#99baa5",
          400: "#6e9c7d",
          500: "#477d60",
          600: "#315f49",
          700: "#264b3d",
          800: "#1d3a32",
          900: "#192f29",
          950: "#13241f",
        },
        verdict: {
          pass: "#237450",
          fail: "#a83e31",
          uncertain: "#a06b1c",
          pending: "#65736c",
          exception: "#a83e31",
        },
      },
      fontFamily: {
        sans: ["IBM Plex Sans", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
        '2xs': '0 1px 1px 0 rgba(0, 0, 0, 0.03)',
      },
    },
  },
  plugins: [],
};
export default config;

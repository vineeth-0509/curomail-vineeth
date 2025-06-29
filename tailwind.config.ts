const config = {
  content: ["./src/**/*.{ts,tsx}"],
  safelist: [
    {
      pattern: /text-(red|yellow|green|blue|indigo|purple|orange)-500/,
    },
  ],
  theme: {
    extend: {},
  },
  plugins: [],
} as any;

export default config;

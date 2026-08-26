/** Chambers Studio Tailwind config — all design values come from the shared preset. */
module.exports = {
  presets: [require("../../tokens/tailwind.preset.cjs")],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
};

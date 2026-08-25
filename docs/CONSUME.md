# How a Mangu app consumes Chambers

## HTML drop

Vendor `tokens/tokens.css` into the app. Do not depend on GitHub raw in production.

## Tailwind

```js
import chambers from '../path-to/chambers/tokens/tailwind.preset.cjs'
export default { presets: [chambers], content: ['./app/**/*.{ts,tsx}'] }
```

Use `border-line`, `bg-fog`, `text-ink`, `rounded-chambers`, `shadow-chambers`.

## Rules

1. Do not redefine `#FF4D00` locally.
2. Hairline is 1px. Selected is 1.5px.
3. Story gradient is decoration, not page chrome.
4. System fonts only on marketing and drops.
5. New tokens PR this repo first.

First consume targets: lettersPCity, madcaptees, chambers-ai / cv-fall2026, my_publishing marketing.

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary-fixed": "#b4ecf2", "on-primary-container": "#86bdc2", "outline-variant": "#bfc8c9", "on-tertiary-container": "#e3a682", "surface-container-low": "#f6f3f2", "on-primary-fixed-variant": "#104e53", "surface-variant": "#e5e2e1", "secondary-container": "#afeaee", "surface": "#fcf9f8", "surface-container": "#f0eded", "on-primary-fixed": "#002022", "surface-bright": "#fcf9f8", "on-surface-variant": "#404849", "inverse-surface": "#313030", "surface-tint": "#2f666c", "error": "#ba1a1a", "secondary-fixed": "#b2edf1", "tertiary-fixed": "#ffdbc8", "background": "#fcf9f8", "on-primary": "#ffffff", "on-secondary-fixed": "#002022", "on-error": "#ffffff", "on-secondary-fixed-variant": "#084f53", "primary": "#003539", "on-tertiary-fixed-variant": "#673c20", "inverse-on-surface": "#f3f0ef", "surface-container-high": "#eae7e7", "on-secondary": "#ffffff", "tertiary-fixed-dim": "#f8b994", "on-surface": "#1c1b1b", "secondary": "#2b676b", "on-tertiary-fixed": "#321300", "on-tertiary": "#ffffff", "secondary-fixed-dim": "#96d1d5", "surface-container-lowest": "#ffffff", "on-background": "#1c1b1b", "primary-fixed-dim": "#99d0d6", "on-secondary-container": "#306b6f", "outline": "#707979", "error-container": "#ffdad6", "inverse-primary": "#99d0d6", "primary-container": "#0e4d52", "on-error-container": "#93000a", "surface-dim": "#dcd9d9", "tertiary-container": "#663b1f", "tertiary": "#4b250b", "surface-container-highest": "#e5e2e1"
      },
      borderRadius: { "DEFAULT": "0.125rem", "lg": "0.25rem", "xl": "0.5rem", "full": "0.75rem" },
      spacing: { "space-lg": "1.25rem", "space-sm": "0.5rem", "space-xl": "2rem", "space-xs": "0.25rem", "gutter": "1rem", "space-md": "0.75rem", "margin": "1.5rem" },
      fontFamily: { "body-lg": ["\"Source Sans 3\""], "headline-xl": ["\"Source Serif 4\""], "body-md": ["\"Source Sans 3\""], "data-tabular": ["JetBrains Mono"], "headline-lg": ["\"Source Serif 4\""], "body-sm": ["\"Source Sans 3\""], "data-metric": ["JetBrains Mono"], "label-meta": ["\"Source Sans 3\""], "headline-sm": ["\"Source Serif 4\""], "headline-md": ["\"Source Serif 4\""], "label-caps": ["JetBrains Mono"] },
      fontSize: { "body-lg": ["15px", { "lineHeight": "22px", "fontWeight": "400" }], "headline-xl": ["32px", { "lineHeight": "38px", "letterSpacing": "-0.015em", "fontWeight": "600" }], "body-md": ["13px", { "lineHeight": "18px", "fontWeight": "400" }], "data-tabular": ["12px", { "lineHeight": "16px", "letterSpacing": "-0.01em", "fontWeight": "500" }], "headline-lg": ["26px", { "lineHeight": "32px", "letterSpacing": "-0.01em", "fontWeight": "600" }], "body-sm": ["11px", { "lineHeight": "15px", "fontWeight": "400" }], "data-metric": ["22px", { "lineHeight": "26px", "letterSpacing": "-0.02em", "fontWeight": "600" }], "label-meta": ["11px", { "lineHeight": "14px", "letterSpacing": "0.02em", "fontWeight": "600" }], "headline-sm": ["16px", { "lineHeight": "22px", "fontWeight": "600" }], "headline-md": ["20px", { "lineHeight": "26px", "letterSpacing": "-0.005em", "fontWeight": "600" }], "label-caps": ["10px", { "lineHeight": "12px", "letterSpacing": "0.06em", "fontWeight": "600" }] }
    }
  },
  plugins: [],
}

import tailwindcssAnimate from "tailwindcss-animate";
import aspectRatio from "@tailwindcss/aspect-ratio";

/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-geist-mono)"], // Keeping if used elsewhere, otherwise could be removed
        display: ["var(--font-syne)", "sans-serif"],
      },
      fontSize: {
        "text-xs": "0.75rem",
        "text-sm": "0.875rem",
        "text-base": "1rem",
        "text-lg": "1.125rem",
        "text-xl": "1.25rem",
        "text-2xl": "1.5rem",
        "text-3xl": "1.875rem",
        "text-4xl": "2.25rem",
        "text-5xl": "3rem",
      },
      fontWeight: {
        "font-normal": "400",
        "font-medium": "500",
        "font-semibold": "600",
        "font-bold": "700",
      },
      colors: {
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          muted: "var(--text-muted)",
          "on-dark": "var(--text-on-dark)",
          "on-brand": "var(--text-on-brand)",
        },
        surface: {
          page: "var(--surface-page)",
          section: "var(--surface-section)",
          card: "var(--surface-card)",
          subtle: "var(--surface-subtle)",
          elevated: "var(--surface-elevated)",
        },
        action: {
          primary: "var(--action-primary)",
          "primary-hover": "var(--action-primary-hover)",
          "primary-active": "var(--action-primary-active)",
          secondary: "var(--action-secondary)",
          strong: "var(--action-strong)",
          "strong-hover": "var(--action-strong-hover)",
        },
        border: {
          default: "var(--border-default)",
          subtle: "var(--border-subtle)",
          focus: "var(--border-focus)",
          DEFAULT: "hsl(var(--border) / <alpha-value>)", // Legacy
        },
        status: {
          success: "var(--status-success)",
          warning: "var(--status-warning)",
          error: "var(--status-error)",
        },
        input: "hsl(var(--input) / <alpha-value>)",
        ring: "hsl(var(--ring) / <alpha-value>)",
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: "hsl(var(--primary) / <alpha-value>)",
          foreground: "hsl(var(--primary-foreground) / <alpha-value>)",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary) / <alpha-value>)",
          foreground: "hsl(var(--secondary-foreground) / <alpha-value>)",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted) / <alpha-value>)",
          foreground: "hsl(var(--muted-foreground) / <alpha-value>)",
        },
        accent: {
          DEFAULT: "hsl(var(--accent) / <alpha-value>)",
          foreground: "hsl(var(--accent-foreground) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "hsl(var(--popover) / <alpha-value>)",
          foreground: "hsl(var(--popover-foreground) / <alpha-value>)",
        },
        card: {
          DEFAULT: "hsl(var(--card) / <alpha-value>)",
          foreground: "hsl(var(--card-foreground) / <alpha-value>)",
        },
      },
      spacing: {
        "space-1": "var(--space-1)",
        "space-2": "var(--space-2)",
        "space-3": "var(--space-3)",
        "space-4": "var(--space-4)",
        "space-6": "var(--space-6)",
        "space-8": "var(--space-8)",
        "space-12": "var(--space-12)",
        "space-16": "var(--space-16)",
        "space-20": "var(--space-20)",
      },
      borderRadius: {
        "radius-sm": "var(--radius-sm)",
        "radius-md": "var(--radius-md)",
        "radius-lg": "var(--radius-lg)",
        "radius-xl": "var(--radius-xl)",
        "radius-2xl": "var(--radius-2xl)",
        "radius-full": "var(--radius-full)",
        lg: `var(--radius)`, // Legacy
        md: `calc(var(--radius) - 2px)`, // Legacy
        sm: `calc(var(--radius) - 4px)`, // Legacy
      },
      boxShadow: {
        "shadow-sm": "var(--shadow-sm)",
        "shadow-md": "var(--shadow-md)",
        "shadow-lg": "var(--shadow-lg)",
        "shadow-card": "0 8px 32px rgba(0, 0, 0, 0.4)",
        "shadow-card-hover": "0 12px 48px rgba(0, 0, 0, 0.6)",
        "shadow-button-primary": "0 4px 14px 0 rgba(239, 35, 60, 0.39)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate, aspectRatio],
};

export default config;

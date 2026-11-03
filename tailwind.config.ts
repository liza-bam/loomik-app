import type { Config } from "tailwindcss";
import { breakpoints } from "./src/lib/breakpoints";

// Every design scale below replaces Tailwind's defaults and points at a token in src/index.css,
// so components can only use tokenised values.
const tokenScale = (keys: string[], prefix: string) =>
  Object.fromEntries(keys.map((k) => [k, `var(--${prefix}-${k})`]));

const spacingSteps = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12.5, 14, 15, 16, 20, 22.5, 24, 25, 27.5, 28, 30, 32, 35, 36, 37.5, 40, 44, 45, 48, 50, 52, 52.5, 56, 60, 64, 70, 72, 75, 80, 96, 100];

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    screens: Object.fromEntries(Object.entries(breakpoints).map(([k, v]) => [k, `${v}px`])),
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    spacing: {
      0: "0px",
      px: "1px",
      ...Object.fromEntries(
        spacingSteps.map((n) => [n, `calc(var(--spacing) * ${n})`]),
      ),
      // Named layout regions
      ...tokenScale(["calendar-sidebar", "calendar-detail", "dialog", "sheet"], "layout"),
    },
    maxWidth: ({ theme }) => ({
      ...theme("spacing"),
      ...tokenScale(["xs", "sm", "md", "lg", "xl", "2xl", "3xl", "4xl", "5xl"], "container"),
      toast: "var(--layout-toast)",
      none: "none",
      full: "100%",
      max: "max-content",
    }),
    maxHeight: ({ theme }) => ({
      ...theme("spacing"),
      dialog: "var(--layout-dialog-max-h)",
      popup: "var(--layout-popup-max-h)",
      full: "100%",
      screen: "100vh",
    }),
    zIndex: {
      0: "var(--z-base)",
      10: "var(--z-raised)",
      20: "var(--z-sticky)",
      50: "var(--z-overlay)",
      100: "var(--z-toast)",
    },
    borderWidth: {
      0: "0px",
      DEFAULT: "var(--border-width)",
      2: "var(--border-width-thick)",
    },
    fontFamily: {
      sans: ["var(--font-sans)"],
    },
    fontSize: Object.fromEntries(
      ["xxs", "xs", "sm", "base", "lg", "xl", "2xl", "3xl", "4xl"].map((k) => [
        k,
        [`var(--text-${k})`, { lineHeight: `var(--text-${k}-leading)` }],
      ]),
    ),
    fontWeight: tokenScale(
      ["normal", "medium", "semibold", "bold"],
      "font-weight",
    ),
    lineHeight: tokenScale(
      ["none", "tight", "snug", "normal", "relaxed"],
      "leading",
    ),
    letterSpacing: tokenScale(
      ["tight", "normal", "wide", "wider", "widest"],
      "tracking",
    ),
    borderRadius: {
      none: "0px",
      sm: "var(--radius-sm)",
      DEFAULT: "var(--radius-sm)",
      md: "var(--radius-md)",
      lg: "var(--radius-lg)",
      xl: "var(--radius-xl)",
      "2xl": "var(--radius-2xl)",
      full: "9999px",
    },
    boxShadow: {
      ...tokenScale(["sm", "md", "lg", "xl"], "shadow"),
      DEFAULT: "var(--shadow)",
      none: "none",
    },
    transitionDuration: {
      DEFAULT: "var(--duration-fast)",
      150: "var(--duration-fast)",
      200: "var(--duration-normal)",
      300: "var(--duration-slow)",
      500: "var(--duration-slower)",
      1000: "var(--duration-slowest)",
    },
    colors: {
      transparent: "transparent",
      current: "currentColor",
      inherit: "inherit",
      border: "hsl(var(--border))",
      input: "hsl(var(--input))",
      ring: "hsl(var(--ring))",
      background: "hsl(var(--background))",
      foreground: "hsl(var(--foreground))",
      primary: {
        DEFAULT: "hsl(var(--primary))",
        foreground: "hsl(var(--primary-foreground))",
      },
      secondary: {
        DEFAULT: "hsl(var(--secondary))",
        foreground: "hsl(var(--secondary-foreground))",
      },
      destructive: {
        DEFAULT: "hsl(var(--destructive))",
        foreground: "hsl(var(--destructive-foreground))",
      },
      muted: {
        DEFAULT: "hsl(var(--muted))",
        foreground: "hsl(var(--muted-foreground))",
      },
      accent: {
        DEFAULT: "hsl(var(--accent))",
        foreground: "hsl(var(--accent-foreground))",
      },
      popover: {
        DEFAULT: "hsl(var(--popover))",
        foreground: "hsl(var(--popover-foreground))",
      },
      card: {
        DEFAULT: "hsl(var(--card))",
        foreground: "hsl(var(--card-foreground))",
      },
      sidebar: {
        DEFAULT: "hsl(var(--sidebar-background))",
        foreground: "hsl(var(--sidebar-foreground))",
        primary: "hsl(var(--sidebar-primary))",
        "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
        accent: "hsl(var(--sidebar-accent))",
        "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
        border: "hsl(var(--sidebar-border))",
        ring: "hsl(var(--sidebar-ring))",
      },
      "primary-subtle": "hsl(var(--primary-subtle))",
      "brand-accent": "hsl(var(--brand-accent))",
      overlay: "hsl(var(--overlay))",
      success: {
        DEFAULT: "hsl(var(--success))",
        foreground: "hsl(var(--success-foreground))",
        subtle: "hsl(var(--success-subtle))",
      },
      warning: {
        DEFAULT: "hsl(var(--warning))",
        foreground: "hsl(var(--warning-foreground))",
        subtle: "hsl(var(--warning-subtle))",
      },
      danger: {
        DEFAULT: "hsl(var(--danger))",
        foreground: "hsl(var(--danger-foreground))",
        subtle: "hsl(var(--danger-subtle))",
      },
      info: {
        DEFAULT: "hsl(var(--info))",
        foreground: "hsl(var(--info-foreground))",
        subtle: "hsl(var(--info-subtle))",
      },
      stage: {
        diagnose: "hsl(var(--stage-diagnose))",
        validate: "hsl(var(--stage-validate))",
        align: "hsl(var(--stage-align))",
        commit: "hsl(var(--stage-commit))",
      },
      chart: {
        1: "hsl(var(--chart-1))",
        2: "hsl(var(--chart-2))",
        3: "hsl(var(--chart-3))",
        4: "hsl(var(--chart-4))",
        5: "hsl(var(--chart-5))",
      },
    },
    extend: {
      gridTemplateColumns: tokenScale(["deals", "deals-wide", "win-path"], "layout"),
      backgroundImage: {
        "brand-gradient": "var(--gradient-brand)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(-2px)" },
          to: { opacity: "1", transform: "none" },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down var(--duration-normal) ease-out",
        "accordion-up": "accordion-up var(--duration-normal) ease-out",
        "fade-in": "fade-in var(--duration-fast) ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

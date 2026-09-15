import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

/**
 * Tailwind config — Cinematic Finance design language (Phase 8).
 * See docs/DESIGN_SYSTEM.md for the full reference.
 *
 * cf-* tokens are added ALONGSIDE legacy tokens (ink/gold/up/down/mist/panel)
 * for backwards compat during the Phase 9 incremental migration.
 */
const config: Config = {
    darkMode: "class",
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // shadcn legacy tokens (kept; components removed in Phase 5 redone)
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))', '2': 'hsl(var(--chart-2))', '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))', '5': 'hsl(var(--chart-5))',
        },

        // ─── Legacy SYA palette (kept for backwards compat) ───
        ink: '#070B14',
        ink2: '#0A0F1C',
        panel: '#0C1322',
        gold: { DEFAULT: '#E2B15C', soft: '#F0CD8F', deep: '#B98A3B' },
        up: '#35D49A',
        down: '#F0555F',
        mist: '#98A2B8',

        // ─── Cinematic Finance palette (Phase 8) ───
        // Phase 13: cf-* tokens ALIASED to sy-* values (lime aesthetic)
        'cf-bg': {
          DEFAULT: '#101511',
          elevated: '#172019',
          panel: '#1a211c',
        },
        'cf-grain': 'rgba(255, 255, 255, 0.018)',
        'cf-glow': {
          gold: 'rgba(209, 255, 98, 0.16)',
          emerald: 'rgba(53, 212, 154, 0.10)',
        },
        'cf-gold': {
          DEFAULT: '#d1ff62',
          soft: '#e0f8ac',
          deep: '#97b644',
          gradient: 'linear-gradient(135deg, #e0f8ac 0%, #d1ff62 50%, #97b644 100%)',
        },
        'cf-emerald': '#35D49A',
        'cf-crimson': '#F0555F',
        'cf-mist': '#b8c3ba',
        'cf-text': {
          DEFAULT: '#f4f5ee',
          strong: '#FFFFFF',
          muted: '#525C70',
        },
        'cf-glass': {
          DEFAULT: 'rgba(20, 32, 25, 0.55)',
          border: 'rgba(209, 255, 98, 0.18)',
          glow: 'rgba(209, 255, 98, 0.06)',
        },

        // ═══ SY LIME design system (Phase 13) ═══
        'sy-bg': {
          DEFAULT: '#101511',
          elevated: '#172019',
          panel: '#1a211c',
        },
        'sy-line': '#374039',
        'sy-text': '#f4f5ee',
        'sy-muted': '#b8c3ba',
        'sy-lime': {
          DEFAULT: '#d1ff62',
          deep: '#97b644',
          soft: '#e0f8ac',
        },
        'sy-cream': '#f1f3e9',
        'sy-ink': '#142017',
        'sy-purple': {
          DEFAULT: '#d8ccff',
          deep: '#56416e',
        },
        'sy-glass': {
          DEFAULT: 'rgba(20, 32, 25, 0.55)',
          border: 'rgba(209, 255, 98, 0.18)',
          glow: 'rgba(209, 255, 98, 0.06)',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        serif: ['var(--font-fraunces)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        // Cinematic Finance typography
        display: ['var(--font-dm-sans)', 'DM Sans', 'var(--font-bebas)', 'Bebas Neue', 'Impact', 'sans-serif'],
        data: ['var(--font-jetbrains)', 'JetBrains Mono', 'ui-monospace', 'monospace'],
      },
      transitionTimingFunction: {
        'cinematic': 'cubic-bezier(0.22, 1, 0.36, 1)',
        'snap': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      transitionDuration: {
        '70': '70ms', '90': '90ms', '160': '160ms',
        '240': '240ms', '480': '480ms', '800': '800ms',
      },
      boxShadow: {
        'glass': '0 8px 32px rgba(0, 0, 0, 0.37), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
        'glow-gold': '0 0 24px rgba(226, 177, 92, 0.32)',
        'glow-emerald': '0 0 18px rgba(53, 212, 154, 0.28)',
      },
      backdropBlur: { 'glass': '12px' },
      backdropSaturate: { 'glass': '1.4' },
      keyframes: {
        'cf-reveal-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'cf-glow-drift': {
          '0%, 100%': { transform: 'translate(0, 0)', opacity: '0.6' },
          '50%': { transform: 'translate(30px, -20px)', opacity: '0.9' },
        },
        'cf-ken-burns': {
          '0%': { transform: 'scale(1) translate(0, 0)' },
          '100%': { transform: 'scale(1.08) translate(-2%, -1%)' },
        },
        'cf-pulse-cta': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(226, 177, 92, 0.45)' },
          '50%': { boxShadow: '0 0 0 14px rgba(226, 177, 92, 0)' },
        },
      },
      animation: {
        'cf-reveal-up': 'cf-reveal-up 480ms cubic-bezier(0.22, 1, 0.36, 1) both',
        'cf-glow-drift': 'cf-glow-drift 18s ease-in-out infinite',
        'cf-ken-burns': 'cf-ken-burns 12s ease-out forwards',
        'cf-pulse-cta': 'cf-pulse-cta 2.4s ease-in-out infinite',
      },
    }
  },
  plugins: [tailwindcssAnimate],
};
export default config;

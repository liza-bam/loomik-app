# Design tokens

Loomik's look is driven entirely by CSS variables in `src/index.css`. `tailwind.config.ts` **replaces** Tailwind's default colour, type, spacing, radius, shadow and motion scales with these tokens, so every class (`p-4`, `text-sm`, `rounded-lg`, `shadow-md`, `bg-primary`, `duration-200`) resolves to a token and the default palette (`bg-blue-500`, `bg-white`...) doesn't exist. The app can be fully re-skinned without touching component code.

## Layers (mirrors Figma Variables)

| Layer | Figma collection | Example | Used by components? |
|---|---|---|---|
| Primitives | `Primitives` | `--violet-500`, `--gray-200` | No |
| Foundations | `Typography`, `Spacing`, `Radius`, `Elevation`, `Motion` | `--text-sm`, `--spacing`, `--radius-lg`, `--shadow-md`, `--duration-fast` | Yes, via Tailwind |
| Semantic colours | `Semantic` (modes: Light, Dark) | `--primary`, `--success-subtle` | Yes, via Tailwind |

Naming maps 1:1: Figma `color/success/subtle` → CSS `--success-subtle` → Tailwind `bg-success-subtle`.

## Semantic tokens

| Group | Tokens | Tailwind |
|---|---|---|
| Surfaces | `background`, `card`, `popover`, `muted`, `secondary`, `overlay` | `bg-card`, `bg-muted`, `bg-overlay/60` |
| Text | `foreground`, `muted-foreground`, `*-foreground` | `text-foreground`, `text-muted-foreground` |
| Lines | `border`, `input`, `ring` | `border-border`, `ring-ring` |
| Brand | `primary`, `primary-subtle`, `brand-accent`, `gradient-brand` | `bg-primary`, `bg-primary-subtle`, `bg-brand-gradient` |
| Hover surface | `accent`, `accent-foreground` | used by shadcn `ghost` / `outline` |
| Status | `success`, `warning`, `danger`, `info` — each with `-foreground` and `-subtle` | `text-danger`, `bg-success-subtle` |
| Stages | `stage-diagnose`, `stage-validate`, `stage-align`, `stage-commit` | `bg-stage-commit` (dots only) |
| Charts | `chart-1` … `chart-5` | `hsl(var(--chart-1))` in Recharts |
| Logo | `logo-wordmark`, `logo-mark` | `<Logo />` (inline SVG) |

## Foundation tokens

| Group | Tokens | Tailwind |
|---|---|---|
| Font | `font-sans`, `font-weight-{normal,medium,semibold,bold}` | `font-sans`, `font-semibold` |
| Type scale | `text-{xxs,xs,sm,base,lg,xl,2xl,3xl,4xl}` + `-leading` | `text-sm` |
| Line height / tracking | `leading-*`, `tracking-*` | `leading-tight`, `tracking-wide` |
| Spacing | `spacing` (base unit; every step is a multiple) | `p-4`, `gap-2`, `w-10` |
| Radius | `radius` → `radius-{sm,md,lg,xl,2xl}` | `rounded-lg` |
| Elevation | `shadow-color`, `shadow-{sm,…,xl}` | `shadow-md` |
| Motion | `duration-{fast,normal,slow,slower,slowest}` | `duration-200` |
| Layout regions | `layout-{calendar-sidebar,calendar-detail,dialog,drawer,toast}`, `layout-dialog-max-h`, `layout-popup-max-h` | `w-calendar-sidebar`, `w-dialog`, `max-h-dialog` |
| Grid templates | `layout-{deals,deals-wide,win-path}` | `grid-cols-deals` |
| Containers | `container-{xs…5xl}` | `max-w-md` |
| Layering | `z-{base,raised,sticky,overlay,toast}` | `z-10`, `z-50`, `z-100` |
| Borders | `border-width`, `border-width-thick` | `border`, `border-2` |
| Breakpoints | `src/lib/breakpoints.ts` (shared by Tailwind and `use-mobile`; media queries can't read CSS variables) | `lg:`, `xl:` |

Fixed sizes such as `w-30` are steps of the `--spacing` unit, so they scale with density too.

Charts use `chartTooltip` / `chartTick` from `src/lib/tone.ts`, which are built from the same tokens.

`destructive` is kept as an alias of `danger` for shadcn components.

## Usage rules

1. **Never** use raw values in components: no hex / `rgb()` literals, and no arbitrary style values like `text-[13px]`, `rounded-[6px]` or `shadow-[...]`. (The default palette classes no longer exist.) Fixed sizes use the spacing steps or a named `--layout-*` token. Arbitrary values are only for relative geometry (percentages, viewport units).
2. **Colour means something.** Scores and numbers are `text-foreground`; only at-risk values are highlighted. Use the helpers in `src/lib/tone.ts` (`scoreText`, `scoreFill`, `scoreColor`, `trendText`, `sentimentBadge`, `priorityDot`, ...).
3. **Categories are neutral.** Tags such as asset type or value primitive use `categoryBadge` (`bg-muted text-muted-foreground`), not a rainbow of colours.
4. **Status badges are subtle:** `bg-{status}-subtle text-{status}`. Solid `bg-{status} text-{status}-foreground` is only for small counters.
5. **Priority** is a small dot (`priorityDot`), not a tinted row or a coloured left border.
6. **Selected state** for chips, tabs and segmented controls is `selectedChip` (`bg-primary-subtle text-primary`).
7. **The brand gradient** (`bg-brand-gradient`) is reserved for the Loomik AI identity (assistant avatar, AI send button). Primary actions use `<Button>` (solid `bg-primary`); secondary actions use `<Button variant="outline">`.
8. **Text over the gradient or a solid fill** uses the matching `*-foreground` token, never `text-white`.

## Skins

Four skins ship with the app, switchable from the palette button in the header (the choice is remembered per browser):

| Skin | Inspired by | Character |
|---|---|---|
| Loomik | — | Default: violet, Inter, 8px radius |
| Warm sand | Lisso (Dribbble) | Cream gradient canvas, black pill buttons, yellow highlights, light Manrope numbers |
| Editorial | Filko (Dribbble) | Flat ivory, square corners, hairlines, no shadows, bold yellow selection, Instrument Sans |
| Aurora glass | Wearable health (Dribbble) | Lavender-to-pink canvas, frosted translucent cards, 24px radius, Plus Jakarta Sans |
| Lime | Management Dashboard (Dribbble) | Sage canvas, soft grey cards, black + lime, light oversized numbers, Outfit |
| Crimson | Sales Analytics (Dribbble) | Warm grey canvas, white cards, crimson accent, DM Sans |
| Midnight gold | Daylier (Dribbble) | Near-black with an amber glow, amber accents, Space Grotesk |

Beyond colour and type, skins can set `--canvas-image` (page background), `--surface-opacity` / `--surface-blur` (frosted cards), `--radius-control` (button shape) and the font-weight tokens.

Each skin is just a block of token overrides at the end of `src/index.css`.

### Adding a skin

1. Add a block at the end of `src/index.css` that overrides only the tokens that change:

```css
[data-theme="acme"] {
  --primary: 210 90% 45%;
  --primary-subtle: 210 90% 96%;
  --accent: 210 90% 96%;
  --accent-foreground: 210 90% 45%;
  --ring: 210 90% 45%;
  --logo-mark: 210 90% 45%;
  --font-sans: "Manrope", sans-serif;  /* also load the font in index.html */
  --radius: 0.75rem;
  --spacing: 0.3rem;                   /* density */
}
```

2. Add `{ id: "acme", label: "Acme" }` to `src/lib/skins.ts` (add `dark: true` for a dark skin).

Check text colours against WCAG AA (4.5:1) on `card`, `background` and the `-subtle` tints.

# Design tokens

Loomik's look is driven entirely by CSS variables in `src/index.css`. Components use **semantic** Tailwind classes only, so the app can be re-skinned without touching component code.

## Layers (mirrors Figma Variables)

| Layer | Figma collection | Example | Used by components? |
|---|---|---|---|
| Primitives | `Primitives` | `--violet-500`, `--gray-200` | No |
| Semantic | `Semantic` (modes: Light, Dark) | `--primary`, `--success-subtle` | Yes, via Tailwind |

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
| Type / shape | `font-sans`, `radius` | `font-sans`, `rounded-lg` |

`destructive` is kept as an alias of `danger` for shadcn components.

## Usage rules

1. **Never** use raw palette classes (`text-green-600`, `bg-blue-100`, `bg-white`, `text-black`) or hex / `rgb()` literals in components.
2. **Colour means something.** Scores and numbers are `text-foreground`; only at-risk values are highlighted. Use the helpers in `src/lib/tone.ts` (`scoreText`, `scoreFill`, `scoreColor`, `trendText`, `sentimentBadge`, `priorityDot`, ...).
3. **Categories are neutral.** Tags such as asset type or value primitive use `categoryBadge` (`bg-muted text-muted-foreground`), not a rainbow of colours.
4. **Status badges are subtle:** `bg-{status}-subtle text-{status}`. Solid `bg-{status} text-{status}-foreground` is only for small counters.
5. **Priority** is a small dot (`priorityDot`), not a tinted row or a coloured left border.
6. **Selected state** for chips, tabs and segmented controls is `selectedChip` (`bg-primary-subtle text-primary`).
7. **The brand gradient** (`bg-brand-gradient`) is reserved for the Loomik AI identity (assistant avatar, AI send button). Primary actions use `<Button>` (solid `bg-primary`); secondary actions use `<Button variant="outline">`.
8. **Text over the gradient or a solid fill** uses the matching `*-foreground` token, never `text-white`.

## Adding a skin

Override semantic tokens under a selector placed after the default tokens in `src/index.css`, and set it on `<html>` (`<html data-theme="acme">`):

```css
[data-theme="acme"] {
  --primary: 210 90% 45%;
  --primary-subtle: 210 90% 96%;
  --brand-accent: 160 70% 40%;
  --ring: 210 90% 45%;
  --font-sans: "Manrope", sans-serif;
  --radius: 0.75rem;
}
```

Dark mode is the `.dark` class, which already redefines every semantic token.

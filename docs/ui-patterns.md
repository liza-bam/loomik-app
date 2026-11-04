# UI patterns

How Loomik screens are structured, especially on phones (< 640px for sheets, < 1024px for the phone shell). Styling rules live in [design-tokens.md](design-tokens.md).

## Phone shell

- **Header:** logo, pipeline summary, signals, risks, search and a ⋯ menu (Assets, History, Pull signals, Skin).
- **Bottom bar:** Home, Actions, **Ask Loomik** (raised centre button, opens the AI bottom drawer), Deal GPS, Calendar.
- The desktop tab row is hidden on phones.

## Deep levels (dialogs, popups)

Every `Dialog` / `AlertDialog` opens as a **bottom sheet** on phones automatically (see `ui/dialog.tsx`). Inside, follow this order:

1. **Header — one line + meta.** Icon and the item's own title (e.g. "Compliance checklist", not "Email"), close button on the right. Below it a single muted meta line: `Email · High priority · Due today 2 PM · +15% win`. No row of chips.
2. **Who** — compact: overlapping avatars + names, one line.
3. **The main task first** — the thing the user came to do (email subject/body, time slots, recording...).
4. **Everything else folded** with `<Disclosure>` (`ui/disclosure.tsx`): context ("Why this matters"), attachments, value primitives, history, transcripts, extra fields (e.g. CC behind "Add CC"). Give a `summary` hint such as "2 files".
5. **Sticky footer** — one primary action (`<Button>`, full width on phones: `w-full sm:w-auto`), secondary actions as `variant="outline"` or `"ghost"`. Rarely-used actions (archive, delete) as an icon button or inside a ⋯ menu.

Remove rather than restyle: duplicated information, decorative tinted blocks, labels that repeat what an icon already says.

## Lists on phones

- Filters: one horizontally scrolling chip row (`flex gap-2 overflow-x-auto`), not wrapped rows of selects. Extra selects can move into a "Filters" disclosure or sheet.
- Cards over tables (the compact card layouts already switch on below 1024px).
- Long pages (e.g. Deal GPS): only the first section open; the rest are `<Disclosure>` sections.

## Spacing

Sheet padding `p-4 sm:p-6`. Section gaps `space-y-4`. Tap targets at least `h-10`.

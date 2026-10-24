---
name: frontend-design
description: QADAM UI rules. Use when building or restyling any page, component, modal or card in this repo, before writing JSX or Tailwind classes.
---

# QADAM UI rules

- No pure black `#000` backgrounds and no neon glows. Base dark ground is `#0B101E`; cards use the light glass style: `rounded-card`, `bg-gradient-to-br from-[#EDF7F6]/95 via-[#F3F6FF]/95 to-[#E8F4F8]/95`, `border-teal-300/40`.
- Buttons: primary is the emerald to teal gradient (`from-emerald-500 to-teal-600`), labels in `text-mini font-mono`. Touch targets at least 44x44 px.
- Modals: `fixed`, `z-50`, bounded height with `overflow-y-auto`, and a visible close button that is the only way to close (no backdrop click, no Escape). Dropdowns and menus may close on an outside click.
- Every main view keeps `pb-28 lg:pb-8` so the fixed mobile nav never covers content. Never trap the page in `h-screen overflow-hidden`.
- Brand colors: navy `#1B2440`, ivory `#F7F4EE`, gold `#C9A25E`. The logo lives in `public/brand/qadam-mark.svg`.
- No emojis and no em dashes in UI copy. Icons come from `src/components/Icons.tsx`.
- Check layouts at phone width (390 px) as well as desktop before calling a UI change done.

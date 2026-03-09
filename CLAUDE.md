# CLAUDE.md — AI Assistant Guide for Edwardflottjr-wq.github.io

This file documents the codebase structure, conventions, and workflows for AI assistants working on this repository.

---

## Project Overview

This is a **static GitHub Pages website** — a personal wellness and productivity suite built specifically to support ADHD management, emotional regulation, and daily health tracking. It presents as a fantasy RPG-themed "Quest Log" dashboard linking to a collection of standalone tools.

**Live URL**: `https://edwardflottjr-wq.github.io`
**Hosting**: GitHub Pages (no build step — files served directly from repo root)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Markup | HTML5 |
| Styling | CSS3 (inline, per-file, using CSS custom properties) |
| Logic | Vanilla JavaScript (inline, per-file) |
| Persistence | Browser `localStorage` only — no backend |
| Fonts | Google Fonts CDN |
| React | One JSX component (`point_tracker.jsx`) — not integrated into a build pipeline |
| PWA | Web App Manifests for game apps |
| CI/CD | None — direct push to GitHub Pages |
| Build tools | None |
| Package manager | None (no `package.json`) |

---

## Repository Structure

```
/
├── index.html              # Main dashboard / Quest Log hub (entry point)
│
├── Health & Wellness Tools
│   ├── meds.html           # Medication tracker with compliance % tracking
│   ├── symptom-logger.html # Daily symptom log for RSD/C-PTSD pattern tracking
│   ├── mood.html           # Mood & trigger journal
│   ├── capacity.html       # Morning capacity assessment
│   └── regulate.html       # Regulation/coping tools collection
│
├── Productivity Tools
│   ├── planner.html        # Task planner with streak tracking & pomodoro timers
│   ├── launcher.html       # "Just Start" ADHD task initiation timer
│   ├── jobs.html           # Job/task tracker
│   ├── household.html      # Household chores tracker
│   ├── appt.html           # Appointment scheduler
│   └── wishlist.html       # Purchase wishlist
│
├── Ambient & Focus Tools
│   ├── focus.html          # Body Double Focus Room (ambient scenes + particles)
│   └── news.html           # Morning Brief — newspaper-style news reader
│
├── Games
│   ├── poosweeper.html     # Minesweeper variant (yard safety themed)
│   ├── snake.html          # Classic Snake arcade game
│   ├── poosweeper.webmanifest
│   └── snake.webmanifest
│
├── React Component
│   └── point_tracker.jsx   # Point/reward tracker (standalone React component)
│
├── Assets
│   ├── poo-icon-{180,192,512}.png
│   ├── snake-icon-{180,192,512}.png
│   └── app-data.json       # Sync metadata (version, last sync timestamp)
```

---

## Architecture & Key Conventions

### Self-Contained HTML Files

Each page is a **fully self-contained `.html` file** with:
- All CSS in a `<style>` block in `<head>`
- All JavaScript in a `<script>` block at the bottom of `<body>`
- No external JS files or imports (except Google Fonts CDN)
- No build step or bundler

**Do not** introduce external JS files or refactor into components unless explicitly asked. Keep changes in the same file.

### Data Persistence

All data is stored in **browser `localStorage`** only. There is no server, database, or API.

Storage key convention: `<app>_v1`
Examples: `launcher_v1`, `ed_points_v1`, `meds_v1`

When adding new data, follow this pattern and version the key.

### CSS Conventions

Each page defines its own **CSS custom properties** in `:root`:
```css
:root {
  --bg: #0d1117;
  --accent: #f0a500;
  --text: #e8dcc8;
  /* etc. */
}
```

- Use `var(--property-name)` throughout — never hardcode colors inside rules
- Class names use `kebab-case`
- Each app has a distinct visual theme (see theming table below)
- Use `min-height: 100dvh` (dynamic viewport height) for full-screen layouts
- Always include `-webkit-tap-highlight-color: transparent` for iOS
- Always include `viewport-fit=cover` in the viewport meta tag

### JavaScript Conventions

- Identifiers use `camelCase`
- All JS is vanilla (no libraries, no modules, no imports)
- State is typically managed via plain objects stored in `localStorage` with `JSON.stringify`/`JSON.parse`
- DOM manipulation uses `document.getElementById`, `querySelector`, etc. directly
- No class-based components or frameworks (except the single React JSX file)

### Responsive & PWA Design

- Mobile-first layout
- iOS home screen app support via Apple Web App meta tags:
  ```html
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
  ```
- Games use `Canvas` API for rendering and include d-pad touch controls
- Game pages have PWA manifests enabling "Add to Home Screen"

---

## Visual Themes by App

| App | Primary Palette | Typography Style |
|-----|----------------|-----------------|
| index.html (Quest Log) | Gold / parchment | Serif, fantasy RPG |
| meds.html | Brown / amber | Clinical, monospace labels |
| planner.html | Blue / orange | Modern sans-serif |
| symptom-logger.html | Blue grid | Data-driven, monospace |
| mood.html | Purple / pink | Emotional, rounded |
| capacity.html | Blue / green | Calm, minimal |
| launcher.html | Blue, glowing | Energetic, bold |
| focus.html | Deep green | Natural, ambient |
| news.html | Black / cream | Newspaper serif |
| poosweeper.html | Grass green | Pixel/retro |
| snake.html | Neon green on black | Retro arcade |

---

## Development Workflows

### Making Changes

1. Edit the relevant `.html` file directly (all code is self-contained)
2. Test locally by opening the file in a browser — no server needed
3. Commit with a clear message describing what changed and why
4. Push to the appropriate branch

### Adding a New Tool

1. Copy the structure of the closest existing tool as a starting template
2. Update the CSS variables in `:root` for the new tool's theme
3. Add a link card to `index.html` in the appropriate section
4. Follow the localStorage key convention: `<toolname>_v1`
5. Add Apple PWA meta tags if the tool should be usable as a standalone app

### Adding a New Game

1. Use `poosweeper.html` or `snake.html` as a template
2. Create a matching `.webmanifest` file for PWA support
3. Add icon assets at 180×180, 192×192, and 512×512 px
4. Include touch d-pad controls for mobile
5. Link from `index.html`

### Modifying Data Storage

- If changing the data schema for an existing tool, increment the version in the storage key (e.g., `meds_v1` → `meds_v2`) and add migration logic or a reset prompt
- Never remove localStorage keys silently — old data may exist in users' browsers

---

## No Tests, No Linter

There is **no test suite** and **no linting configuration**. There are no automated quality checks. When making changes:

- Validate HTML structure manually
- Test in a browser before committing
- Verify localStorage read/write works for any new state
- Check layout on mobile viewport sizes (375px width is a good baseline)

---

## Git Conventions

- Commit messages are descriptive and present-tense
- Automated sync commits use the format: `Sync — M/D/YYYY, H:MM:SS AM/PM`
- Upload-based commits use: `Add files via upload`
- Branch naming for Claude: `claude/<task-slug>`

---

## Important Notes for AI Assistants

1. **Do not introduce a build step** — this is intentional. The simplicity of no build tooling is a feature, not a gap.
2. **Do not split files** — keep each app self-contained in its single `.html` file unless explicitly asked to restructure.
3. **Respect the theming** — each app has a distinct emotional/visual identity. Don't homogenize styles.
4. **localStorage is the only storage** — do not suggest or introduce APIs, databases, or server-side code.
5. **This is a personal health tool** — be sensitive to the ADHD/RSD/C-PTSD context. Avoid changes that add cognitive load, unexpected modals, or disruptive UX patterns.
6. **No external JS dependencies** — vanilla JS only (except the existing React JSX file which is already anomalous).
7. **Mobile is primary** — always verify changes work on a 375px-wide mobile viewport.
8. **PWA support is important** — preserve Apple Web App meta tags and do not remove manifest links.

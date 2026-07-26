# IIT-BBS MenuBoard

A responsive, installable hostel mess menu web app with multi-hall support, dark mode, and live Google Sheets integration.

## Live Demo

- https://dattarajdhatbale.github.io/IIT-BBS-MenuBoard/
- https://iit-bbs-menuboard.netlify.app/
- https://iit-bbs-menuboard.vercel.app/

## Features

- **Multi-hall support** — view the mess menu for any residential hall (Mother's Touch, RHR, BHR, MHR, GHR, SHR).
- **Day-wise schedule** — menus are organized by day, with the current day auto-selected on load.
- **Breakfast, Lunch, Snacks, and Dinner** — the full daily meal schedule, including snacks, is displayed for the selected hall and day.
- **Live data, no redeploy needed** — menu content is pulled directly from a public Google Sheet at runtime, so updating the mess schedule never requires touching the codebase.
- **Dark mode** — toggle between light and dark themes, with the preference remembered across visits.
- **Installable as an app (PWA)** — install MenuBoard to your home screen or desktop for a native app-like experience, with offline access to the app shell.
- **Nearby eateries** — quick links to local eatery menus (Kanha's, Nescafe, Domino's, Shuchi, BHR's canteen).

## How It Works

Menu data is maintained in a public Google Sheet and fetched at runtime using:

```
https://opensheet.elk.sh/{spreadsheet-id}/Sheet1
```

Each row in the sheet corresponds to a specific **Hall** and **Day**, with columns for **Breakfast**, **Lunch**, **Snacks**, and **Dinner**. When a user selects a hall and day, the app finds the matching row and dynamically injects the relevant menu into the DOM — no page reload or redeploy required to update the schedule.

## Progressive Web App (PWA)

MenuBoard can be installed as a standalone app on desktop and mobile:

- Uses Chrome's native install prompt (`beforeinstallprompt`) with a dedicated **Install App** button.
- Detects when the app is already installed and hides the prompt accordingly.
- Provides manual "Add to Home Screen" guidance on iOS, where native install prompts aren't supported.
- Includes a service worker that caches the app shell for faster loads and basic offline availability. Live menu data is always fetched fresh from the network and is never served from cache.

## Project Structure

| File | Purpose |
|---|---|
| `index.html` | App structure and markup (HTML5) |
| `style.css` | Styling, theming, and layout (CSS3) |
| `script.js` | App logic: menu fetching/rendering, theme toggle, PWA install flow (vanilla JS) |
| `manifest.webmanifest` | PWA manifest — app name, icons, display mode, theme colors |
| `service-worker.js` | Service worker for app-shell caching and offline support |

## Tech Stack

- **HTML5** — semantic markup, no templating engine.
- **CSS3** — custom properties (CSS variables) for theming, CSS Grid for the eateries layout, and keyframe animations for transitions.
- **Vanilla JavaScript (ES6+)** — no frameworks or libraries; DOM updates are handled directly.
- **Web APIs used:** `fetch` (Google Sheets data), `localStorage` (theme persistence), Service Worker API and Cache API (offline support), Web App Manifest (installability).
- **Data source:** [opensheet](https://opensheet.elk.sh/) as a lightweight Google Sheets–to-JSON API — no custom backend or database.
- **Hosting:** static deployment on GitHub Pages, Netlify, and Vercel — no build step required.

No frameworks. No backend. Fully frontend-powered.

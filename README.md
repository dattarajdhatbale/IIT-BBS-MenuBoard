# IIT-BBS MenuBoard

A responsive, installable hostel mess menu web app with multi-hall support, dark mode, live Google Sheets integration, and a local mess card viewer.

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
- **Mess card viewer** — upload your mess card photo once and show it instantly at the entrance, without needing to dig through your gallery every time.

## How It Works

Menu data is maintained in a public Google Sheet and fetched at runtime using:

```
https://opensheet.elk.sh/{spreadsheet-id}/Sheet1
```

Each row in the sheet corresponds to a specific **Hall** and **Day**, with columns for **Breakfast**, **Lunch**, **Snacks**, and **Dinner**. When a user selects a hall and day, the app finds the matching row and dynamically injects the relevant menu into the DOM — no page reload or redeploy required to update the schedule.

## Mess Card Viewer

The mess card feature lets students upload a photo of their physical mess card directly in the app. The card is stored locally on the device using IndexedDB — it is never sent to any server.

Once uploaded, a single tap opens a fullscreen view of the card (using the native Fullscreen API where available), making it easy to show to the security guard at the mess entrance. The card persists across sessions and is available offline, so there's no need to re-upload it every visit.

- **Upload** — select a photo from your gallery or take one with your camera.
- **Show** — one tap opens the card fullscreen with a dark background for maximum clarity.
- **Replace / Remove** — update or delete the stored card at any time.
- **Private by design** — the image stays on your device only. Clearing the app's browser data will remove it.

## Progressive Web App (PWA)

MenuBoard can be installed as a standalone app on desktop and mobile:

- Uses Chrome's native install prompt (`beforeinstallprompt`) with a dedicated **Install App** button.
- Detects when the app is already installed and hides the prompt accordingly.
- Provides manual "Add to Home Screen" guidance on iOS, where native install prompts aren't supported.
- Includes a service worker that caches the app shell for faster loads and basic offline availability. Live menu data is always fetched fresh from the network and is never served from cache.
- The mess card stored in IndexedDB remains available offline independently of the service worker.

## Project Structure

| File | Purpose |
|---|---|
| `index.html` | App structure and markup (HTML5) |
| `style.css` | Styling, theming, and layout (CSS3) |
| `script.js` | App logic: menu fetching/rendering, theme toggle, PWA install flow, mess card (vanilla JS) |
| `manifest.webmanifest` | PWA manifest — app name, icons, display mode, theme colors |
| `service-worker.js` | Service worker for app-shell caching and offline support |

## Tech Stack

- **HTML5** — semantic markup, no templating engine.
- **CSS3** — custom properties (CSS variables) for theming, CSS Grid for the eateries layout, and keyframe animations for transitions.
- **Vanilla JavaScript (ES6+)** — no frameworks or libraries; DOM updates are handled directly.
- **Web APIs used:** `fetch` (Google Sheets data), `localStorage` (theme persistence), `IndexedDB` (mess card image storage), Service Worker API and Cache API (offline support), Fullscreen API (mess card viewer), Web App Manifest (installability).
- **Data source:** [opensheet](https://opensheet.elk.sh/) as a lightweight Google Sheets–to-JSON API — no custom backend or database.
- **Hosting:** static deployment on GitHub Pages, Netlify, and Vercel — no build step required.

No frameworks. No backend. Fully frontend-powered.

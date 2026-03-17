# LostLink — Digital Lost & Found (Frontend)

Production-style React UI for a Digital Lost & Found platform.

## Tech Stack

- React + Vite + TypeScript
- Tailwind CSS (dark mode via `class`)
- Framer Motion (page + section animations)
- React Router
- Zustand (theme/auth/notifications/items)
- Lucide icons

## Features Implemented

- Light/Dark theme toggle with `localStorage` persistence
- Lightweight animated background (moving blobs)
- Sticky responsive navbar with:
  - Home / Report Lost / Report Found / Browse / Dashboard
  - Theme toggle
  - Notification bell dropdown (mark as read)
  - Login/Signup or Profile dropdown (Dashboard/My Items/Logout)
- Landing page (hero + features + how it works + testimonials)
- Core pages:
  - Report Lost / Report Found (forms + image upload UI)
  - Browse items (search + suggestions + filters + grid + skeletons + empty states)
  - Item detail (match meter + highlighted tags + claim form + proof upload UI)
  - Dashboard (my reports + my claims + status badges)
  - Auth (login + signup with validation)
- Protected routes for dashboard + report pages (frontend-ready JWT structure)

## Run Locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run lint
npm run build
```

## Notes

- This is UI-only. Replace the demo auth token and local stores with real API calls when integrating backend.

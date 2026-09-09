# Croissant Frontend

Next.js starter for the Croissant backend with French and Arabic routes.

## Requirements

- Node.js 20.9 or newer
- npm

## Setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000/fr` or `http://localhost:3000/ar`.

Copy `.env.example` to `.env.local` when you are ready to point the frontend at the Django API.

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Locale Structure

- French: `/fr`
- Arabic: `/ar`
- The root route redirects to `/fr`.

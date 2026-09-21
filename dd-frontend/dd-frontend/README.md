# Decision Detective — Frontend

## Setup

```bash
npm install
npm run dev
```

Opens at http://localhost:3000. Proxies `/api` to `http://localhost:8080`.

## Gojo Wallpaper

Save your Gojo wallpaper image as `public/gojo.png` — it's used as the login/register background.

## Pages

| Route        | Description                          |
|--------------|--------------------------------------|
| `/login`     | Login with Gojo wallpaper bg         |
| `/register`  | Register + org creation              |
| `/chat`      | AI chat with live backend            |
| `/upload`    | File upload + dataset status table   |
| `/dashboard` | Analytics, decisions, audit log      |

## API Endpoints Used

| Method | Endpoint                  | Used by      |
|--------|---------------------------|--------------|
| POST   | /api/auth/login           | Login        |
| POST   | /api/auth/register        | Register     |
| POST   | /api/chat                 | Chat         |
| GET    | /api/decisions            | Chat, Dashboard |
| GET    | /api/upload/datasets      | Upload       |
| POST   | /api/upload               | Upload       |
| GET    | /api/analytics/summary    | Dashboard    |
| GET    | /api/analytics/audit      | Dashboard    |

## Auth

JWT stored in `localStorage` as `dd_token`. Auto-attached to all requests.
Auto-redirects to `/login` on 401.

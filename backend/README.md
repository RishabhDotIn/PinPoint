# PinPoint Backend (Express + MongoDB)

Minimal backend for Phase 2 (Auth integration, Profile, Campus select).

## Endpoints
- GET `/health`
- GET `/v1/me` (protected)
- PATCH `/v1/me` (protected) body: `{ name?, campusId? }`
- GET `/v1/campuses` (public) query: `?q=`

Auth: Bearer access token in `Authorization` header. Token must be issued by your OTP API and verifiable with `AUTH_JWT_SECRET`.

## Setup
1. Copy `.env.example` to `.env` and fill values:
```
PORT=10000
CORS_ORIGINS=http://localhost:5500,https://your-frontend.example
MONGODB_URI=...
MONGODB_DB=pinpoint
AUTH_JWT_SECRET=...
```
2. Install deps
```
cd backend
npm i
```
3. Run locally
```
npm run dev
```
4. Seed campuses (optional)
```
npm run seed
```

## Deploy on Render
- Create a new Web Service from this `backend/` folder.
- Set Environment Variables in the Render dashboard as per `.env.example`.
- Start command: `npm start`
- Health check path: `/health`

## Notes
- Ensure your frontend uses `credentials: 'include'` and sends `Authorization: Bearer <accessToken>`.
- CORS origins: list your frontend origin(s).

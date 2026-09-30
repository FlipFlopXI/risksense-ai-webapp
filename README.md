# RiskSense AI website

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, and npm. This repository contains the public site, interactive 3D district, overview and legal pages, and a patient activation flow. FastAPI remains the sole authority for authentication, clinician approval, subscription and insurance state, entitlement, and audit.

## Local development

Copy `.env.example` to `.env.local`, set `NEXT_PUBLIC_API_BASE_URL` to the development FastAPI origin, then run `npm ci` and `npm run dev`. The frontend opens at `http://localhost:3000`. Set `CORS_ORIGINS=http://localhost:3000` on the backend development environment. Do not put secrets in `NEXT_PUBLIC_*` variables.

## Validation and deployment

Run `npm run build` and `npm run typecheck`. On Vercel use the Next.js preset, `npm ci`, `npm run build`, and the default Next.js output. No SPA rewrite or `vercel.json` is needed for Next.js App Router.

See [WEBAPP_INTEGRATION.md](WEBAPP_INTEGRATION.md) for API contracts, current limitations, CORS and mobile handoff requirements.

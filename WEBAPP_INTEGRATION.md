# RiskSense web activation integration

## Architecture

Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, npm. Routes: `/`, `/world`, `/overview`, `/register/complete`, `/privacy`, `/terms`, `/medical-disclaimer`. The public site and 3D district remain intact. The backend remains the sole authority for authentication, clinician approval, subscription and insurance state, patient-clinician links, entitlement, and audit. The browser never accesses Supabase directly.

## Mobile handoff and direct fallback

After patient registration or sign-in, Flutter calls `POST /api/v1/access/activation-session` with its patient bearer token and launches the **backend-provided** `activation_url`. The link contains a random one-time token in a URL fragment, not a patient ID; the fragment is not sent in the initial HTTP page request. On `/register/complete#token=...`, the website removes the token from the address bar immediately and posts it to the exchange endpoint. FastAPI validates it and returns a short-lived credential valid only for the activation routes. The credential is held in tab-scoped `sessionStorage` so refresh can resume; it expires with the server session. The website checks `/api/v1/access/activation/context` on refresh and only restores a success screen if the backend confirms active entitlement. A direct visitor signs in and asks FastAPI to issue and exchange the same activation session. No second registration system exists.

The patient chooses exactly one access method. `free`, `standard`, and `premium` are real backend plan enum values, but all are **demo** here. Insurance is **simulated**; no external insurer is contacted. No card details are requested. The patient enters an `RS-CLN-xxxxx` ID. A scoped lookup confirms an approved, active clinician. The review step displays account, access method, and clinician. The final button calls FastAPI once; success appears only after `ACTIVE` is returned. Flutter re-queries `/api/v1/access/status` on resume and gates the dashboard on active entitlement and clinician link.

## API endpoints

| Method | Path | Authorization | Purpose |
| --- | --- | --- | --- |
| POST | `/api/v1/access/activation-session` | Patient bearer | Issue 15-minute one-time activation URL |
| POST | `/api/v1/access/activation-session/exchange` | One-time token in body | Exchange token for narrow activation credential |
| GET | `/api/v1/access/activation/context` | Activation credential | Restore context and confirm completion on refresh |
| GET | `/api/v1/access/activation/clinicians/lookup/{risk_sense_id}` | Activation credential | Verify approved clinician |
| POST | `/api/v1/access/activation/complete` | Activation credential | Atomically activate one demo method and clinician link |
| GET | `/api/v1/access/status` | Patient bearer | Flutter's authoritative entitlement check |
| POST | `/api/v1/auth/login` | Public | Direct-web fallback sign-in |
| GET | `/api/v1/auth/me` | Patient bearer | Confirm account role and active state |

The admin mock completion endpoints remain admin-only. Existing patient subscription and insurance request endpoints remain for compatibility but are not called by the new website activation flow.

## Configuration and deployment

Frontend `.env.example` documents browser-visible `NEXT_PUBLIC_API_BASE_URL`, optional support email and site URL, and `NEXT_PUBLIC_MOBILE_RETURN_URL`. No secrets may be placed in these values. Backend `WEBAPP_BASE_URL` must equal the exact website origin used for direct-web fallback. Backend `DEMO_ACTIVATION_ENABLED=true` is an explicit demonstration setting; it defaults to false. Backend `CORS_ORIGINS` must list exact browser origins, such as `http://localhost:3000` locally and the final HTTPS custom domain in production. Do not use wildcard production CORS.

Vercel: Next.js preset, `npm ci`, `npm run build`, default output. No SPA rewrite or `vercel.json` is needed. The activation route sends `Referrer-Policy: no-referrer` and `Cache-Control: no-store`. Set `NEXT_PUBLIC_SITE_URL` after the final domain is attached; do not hard-code a temporary Vercel URL. Update FastAPI `WEBAPP_BASE_URL` and `CORS_ORIGINS`, Flutter's activation origin expectations if configured, and the return link at the same time.

The optional `risksense://activation-return` custom scheme is for development only. Android and iOS register the scheme, and Flutter rechecks FastAPI when resumed. Production HTTPS App Links / Universal Links need the actual custom domain, Android asset links, iOS association file, and verified device testing. Until then the success page offers a switch-back fallback. The custom scheme is not claimed as verified production linking.

## Security and known limits

Activation handoff and credentials are random, stored only as SHA-256 digests in PostgreSQL, and expire after 15 minutes. Exchange is one-time; issuance revokes previous unconsumed sessions for that patient. The narrow credential is rejected by ordinary patient health APIs. Completion locks the session, derives patient identity from it, checks the current active account and approved clinician, rejects conflicting access methods, reuses staged entitlement services without their intermediate commit, then commits entitlement, clinician link, audit events, and session consumption together. A same-session retry returns the existing active result within expiry. No raw tokens, passwords, or card data are logged by the activation code. There is no email-verification state in the current FastAPI user model, so no verification claim is made.

The backend's demo mode is intentionally not a real payment or insurer integration. The generated insurer examples on public pages are not partners. Integration tests require a local PostgreSQL `risksense_test` database. A verified production App Link and deployed end-to-end test remain outstanding.

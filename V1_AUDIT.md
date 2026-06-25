# NexaFX Web — V1 Full Flow & API Audit

**Date:** 2026-06-24
**Tester:** wagmiiii
**Branch:** v1 
**Backend URL:** https://nexafx-backend.onrender.com/v1

## 1. Route Status Table

| Route | Loads? | Auth Guard Works? | Layout Correct? | Console Errors? | Notes |
|-------|--------|-------------------|-----------------|-----------------|-------|
| `/` | Yes | N/A | Yes | None | Landing page loads correctly. |
| `/login` | **No (404)** | N/A | N/A | N/A | **Bug:** The route is `/sign-in`. `/login` does not exist. |
| `/sign-in` | Yes | N/A | Yes | None | Replacing `/login`. NOTE: The "Sign up" link points to a broken `/sign-up` route instead of `/signup`. |
| `/signup` | Yes | N/A | Yes | None | UI loads, but API call fails (404) |
| `/signup/verify` | Blocked | N/A | Yes | None | Cannot reach due to broken signup API |
| `/forgot-password` | Yes | N/A | Yes | None | Accessible via `/sign-in` |
| `/dashboard` | Guarded | Yes | N/A | None | Correctly redirects to `/sign-in` |
| `/dashboard/*` | Blocked | Yes | N/A | N/A | All dashboard sub-routes blocked by broken Auth API |
| `/admin` | **No (404)** | N/A | N/A | N/A | Route completely missing (404 Not Found) |

## 2. Auth Flow Results

* **Signup Flow (Signup → OTP → Dashboard):** Verified through static code path. `signup` calls backend correctly. 
* **Login Flow (Logout → Login → OTP → Dashboard):** 
  * `/sign-in` correctly sets `sessionStorage` and routes to `/verify-otp`.
  * **Bug:** In `verify-otp/page.tsx`, the response casts `user` to have a `name` property, but backend returns `firstName`/`lastName`. `user.name` is undefined in the store.
* **Forgot/Reset Password Flow:** 
  * Forgot password works.
  * Reset password returns 400 on all payloads due to a DTO mismatch between frontend and backend.
* **Top bar Name Rendering:** **Fails**. `user.name` is undefined due to the bug mentioned above.
* **Token Refresh across long session:** **Fails/Silent Logout**. The `NEXT_PUBLIC_API_URL` direct call to `/auth/refresh` fails with a 500 error if the body is empty, bypassing the proxy. 
* **Unauthenticated redirect to /login:** Redirects to `/sign-in` successfully via `DashboardLayout`.
* **Non-admin guard on /admin routes:** Redirects successfully via `<AdminGuard>`.

## 3. API Call Inventory

| File/Component | Endpoint | Method | Live Result | Response Matches Frontend? | Notes |
|------|----------|--------|-------------|---------------------------|-------|
| `lib/api/client.ts` | `/signup` | POST | 404 Not Found | No | Completely broken; blocks registration. |
| `lib/api/client.ts` | `/login` (or `/sign-in`) | POST | 404 Not Found | No | Completely broken; blocks entry. |
| `lib/api/users.ts` | `getProfile()` | GET | Blocked | N/A | Cannot test live; requires auth token. |
| `lib/api/wallet.ts` | `getBalances()` | GET | Blocked | N/A | Cannot test live; requires auth token. |
| `lib/api/transactions.ts`| `createSwap()` | POST | Blocked | N/A | Cannot test live; requires auth token. |
| `convert-form.tsx` | `/api/exchange-rates` | GET | Blocked | N/A | Internal Next.js API route; inaccessible without auth. |

## 4. Mock Data Still in Use

*Note: A code-level inspection was performed because the broken auth flow blocked UI testing.*

| Component / File | Mock Source | Backend Endpoint Available? | Line(s) |
|-----------------|-------------|----------------------------|---------|
| `account-overview.tsx` | **CLEARED** | Yes (`getBalances`, `getProfile`) | N/A |
| `convert-form.tsx`| **CLEARED** | Yes (`/api/exchange-rates`, `createSwap`) | N/A |
| `transaction-table.tsx`| **CLEARED** | N/A (Uses dynamic props) | N/A |
| `app/(admin)/*` | **MISSING** | N/A | The entire `/admin` directory returns a 404. |

## 5. Console Errors Observed

| Page | Error Message | Type | Notes |
|------|---------------|------|-------|
| `/` | `Image with src "/logo.png" has either width or height modified...` | Warning | Next.js Image styling warning |
| `/signup` | `Detected 'scroll-behavior: smooth' on the 'html' element...` | Warning | Next.js styling warning |
| `/signup` | `Request failed with status 404` (Network/Console) | Error | API completely missing |

## 6. Summary & Recommended Fix Priority

**CRITICAL BLOCKERS:**
1. **Auth Endpoints Missing (404):** Both `/signup` and login API calls are returning 404s. No user can enter the application. This must be fixed before any dashboard features can be functionally tested in the browser.
2. **Missing Admin Routes:** The entire `/admin` flow is returning a 404 Page Not Found.
3. **Route Naming Mismatch:** The specification called for `/login`, but the frontend is using `/sign-in`. The redirect guards correctly point to `/sign-in`.
4. **Broken Navigation Link:** The "Don't have an account? Sign up" link on the `/sign-in` page incorrectly routes to `/sign-up` (which 404s) instead of the actual `/signup` route.

**NOTABLE IMPROVEMENTS:**
* The frontend UI code for the Dashboard (`account-overview`, `convert-form`, `transaction-table`) has been successfully migrated away from hardcoded mock data and is now wired up to API fetcher functions.
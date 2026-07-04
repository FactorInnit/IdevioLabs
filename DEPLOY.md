# Deploy Idevio to ideviolabs.com

## 1. Deploy to Vercel (recommended for Next.js)

1. Push this repo to GitHub.
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Add **Environment Variables** in Vercel → Project → Settings → Environment Variables:

| Variable | Production value |
|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://ideviolabs.com` |
| `TURSO_DATABASE_URL` | `libsql://your-db.turso.io` |
| `TURSO_AUTH_TOKEN` | from Turso dashboard |
| `AUTH_SECRET` | long random string |
| `OPENAI_API_KEY` | **Required for AI** — ChatGPT coach, validator, competitors, roadmaps ([get key](https://platform.openai.com/api-keys)) |
| `GOOGLE_CLIENT_ID` | from Google Cloud |
| `GOOGLE_CLIENT_SECRET` | from Google Cloud |
| `STRIPE_SECRET_KEY` | live key |
| `STRIPE_WEBHOOK_SECRET` | from Stripe webhook |
| `STRIPE_PRICE_PRO` | Stripe Price ID |
| `STRIPE_PRICE_ULTRA` | Stripe Price ID |
| `RESEND_API_KEY` | from [Resend](https://resend.com) for team invite emails |
| `RESEND_FROM` | e.g. `Idevio <hello@ideviolabs.com>` |

4. Deploy.

> **Team invites:** After deploying, run the SQL in `prisma/migrations/20260704153000_add_team_invites/migration.sql` in your Turso **Edit Data** console (same database as `TURSO_DATABASE_URL`).

> **Daily motivation:** Run `prisma/migrations/20260704170000_add_motivation/migration.sql` in the same Turso database.

> **Database:** SQLite (`file:./dev.db`) works locally but **not on Vercel serverless**. For production, use [Turso](https://turso.tech) (free tier):
>
> 1. Create a database at turso.tech and copy `TURSO_DATABASE_URL` + `TURSO_AUTH_TOKEN`.
> 2. Add both to Vercel env vars.
> 3. From your machine, run migrations against Turso:
>    ```bash
>    set TURSO_DATABASE_URL=libsql://your-db.turso.io
>    set TURSO_AUTH_TOKEN=your-token
>    npm run db:deploy:turso
>    ```
>    (Do **not** use `npx prisma migrate deploy` — Prisma does not support `libsql://` URLs.)

## 2. Connect ideviolabs.com in Vercel

1. Vercel → your project → **Settings** → **Domains**
2. Add `ideviolabs.com` and `www.ideviolabs.com`
3. Vercel shows the DNS records you need.

## 3. DNS at your registrar

Point your domain to Vercel (exact values shown in Vercel dashboard):

| Type | Name | Value |
|---|---|---|
| **A** | `@` | `76.76.21.21` |
| **CNAME** | `www` | `cname.vercel-dns.com` |

If your registrar uses **Cloudflare**, set SSL mode to **Full** and proxy can stay on (orange cloud).

DNS can take up to 48 hours; usually 15–60 minutes.

## 4. Update Google OAuth

In [Google Cloud Console](https://console.cloud.google.com/apis/credentials):

- **Authorized JavaScript origins:**
  - `https://ideviolabs.com`
  - `https://www.ideviolabs.com`
  - `https://YOUR-PROJECT.vercel.app` (until custom domain DNS is live)
- **Authorized redirect URIs:**
  - `https://ideviolabs.com/api/auth/google/callback`
  - `https://www.ideviolabs.com/api/auth/google/callback`
  - `https://YOUR-PROJECT.vercel.app/api/auth/google/callback`

Keep localhost entries for local dev.

> **"This site can't be reached" after sign-in?** Usually the app was redirecting to `ideviolabs.com` while you were on your Vercel URL (custom domain DNS not set up yet). Auth now redirects back to the same host you signed in from. Still add both URLs in Google OAuth above.

## 5. Update Stripe

1. **Webhook:** `https://ideviolabs.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
2. **Checkout success/cancel URLs** are built from `NEXT_PUBLIC_APP_URL` automatically.

## 6. Verify

- `https://ideviolabs.com` loads the app
- Sign in with Google works
- Stripe checkout redirects back to `https://ideviolabs.com/dashboard?checkout=success`

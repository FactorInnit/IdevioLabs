# Deploy Idevio to idevolabs.com

## 1. Deploy to Vercel (recommended for Next.js)

1. Push this repo to GitHub.
2. Import the project at [vercel.com/new](https://vercel.com/new).
3. Add **Environment Variables** in Vercel → Project → Settings → Environment Variables:

| Variable | Production value |
|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://idevolabs.com` |
| `AUTH_SECRET` | long random string |
| `DATABASE_URL` | see database note below |
| `OPENAI_API_KEY` | your key |
| `GOOGLE_CLIENT_ID` | from Google Cloud |
| `GOOGLE_CLIENT_SECRET` | from Google Cloud |
| `STRIPE_SECRET_KEY` | live key |
| `STRIPE_WEBHOOK_SECRET` | from Stripe webhook |
| `STRIPE_PRICE_PRO` | Stripe Price ID |
| `STRIPE_PRICE_ULTRA` | Stripe Price ID |

4. Deploy.

> **Database:** SQLite (`file:./dev.db`) works locally but **not on Vercel serverless**. For production use [Turso](https://turso.tech), [Neon Postgres](https://neon.tech), or deploy to [Railway](https://railway.app) with a persistent volume.

## 2. Connect idevolabs.com in Vercel

1. Vercel → your project → **Settings** → **Domains**
2. Add `idevolabs.com` and `www.idevolabs.com`
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

- **Authorized JavaScript origins:** `https://idevolabs.com`
- **Authorized redirect URIs:** `https://idevolabs.com/api/auth/google/callback`

Keep localhost entries for local dev.

## 5. Update Stripe

1. **Webhook:** `https://idevolabs.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
2. **Checkout success/cancel URLs** are built from `NEXT_PUBLIC_APP_URL` automatically.

## 6. Verify

- `https://idevolabs.com` loads the app
- Sign in with Google works
- Stripe checkout redirects back to `https://idevolabs.com/dashboard?checkout=success`

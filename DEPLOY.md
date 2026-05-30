# Deploy to Vercel

## Prerequisites

- [Vercel Account](https://vercel.com/signup)
- [Neon Account](https://neon.tech) (for PostgreSQL database)
- [Stripe Account](https://stripe.com) (for payments)
- [DT One Account](https://dtone.com) (for digital value products)

## Step 1: Prepare Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

### Required Variables

| Variable | Source | Description |
|----------|--------|-------------|
| `DATABASE_URL` | Neon Console | PostgreSQL connection string |
| `NEON_AUTH_BASE_URL` | Neon Console → Auth | Auth base URL |
| `NEON_AUTH_COOKIE_SECRET` | Generate | `openssl rand -base64 32` |
| `NEON_AUTH_JWKS_URL` | Neon Console → Auth | JWKS endpoint |
| `STRIPE_PUBLISHABLE_KEY` | Stripe Dashboard | pk_test_... |
| `STRIPE_SECRET_KEY` | Stripe Dashboard | sk_test_... |
| `STRIPE_WEBHOOK_SECRET` | Stripe CLI/Dashboard | whsec_... |
| `DTONE_API_KEY` | DT One Portal | API key |
| `DTONE_API_SECRET` | DT One Portal | API secret |

## Step 2: Deploy to Vercel

### Option A: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

### Option B: GitHub Integration

1. Push code to GitHub
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "Add New Project"
4. Import your GitHub repository
5. Configure environment variables in Vercel dashboard
6. Deploy

## Step 3: Configure Neon Auth for Production

1. Go to [Neon Console](https://console.neon.tech)
2. Enable Auth on your branch
3. Add trusted domains:
   - `https://your-domain.vercel.app`
   - `https://*.vercel.app` (for previews)

## Step 4: Configure Stripe Webhook

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`
4. Copy webhook secret to `STRIPE_WEBHOOK_SECRET`

## Step 5: Seed Database

After deployment, seed the database:

```bash
# Local
npm run db:seed

# Or via Vercel CLI
vercel env pull .env.local
npx tsx prisma/seed.ts
```

## Troubleshooting

### Build Errors

- Ensure `DATABASE_URL` is set in Vercel environment variables
- Check Node.js version is >= 20

### Database Connection

- Verify Neon project is active
- Check connection string format

### Auth Issues

- Ensure trusted domains are configured in Neon Auth
- Verify `NEON_AUTH_BASE_URL` matches your branch

# RotaLeve Production Checklist

## 1. Environment Variables

Frontend:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_APP_NAME` optional
- `VITE_APP_URL` optional

Edge Functions:
- `GEMINI_API_KEY`
- `GEMINI_MODEL` optional, default `gemini-2.5-flash`
- `NOMINATIM_USER_AGENT`, recommended format `RotaLeve/1.0 (contato@yourdomain.com)`
- `OSRM_BASE_URL` optional, default `https://router.project-osrm.org`
- `NOMINATIM_BASE_URL` optional, default `https://nominatim.openstreetmap.org`
- `NOMINATIM_REFERER` optional, recommended with your production app URL
- `ROUTE_CACHE_TTL_MINUTES` optional, default `60`
- `ROUTE_RATE_LIMIT_MAX_REQUESTS` optional, default `12`
- `ROUTE_RATE_LIMIT_WINDOW_MINUTES` optional, default `15`
- `ROUTE_MAX_CLIENTS` optional, default `12`

Never store production secrets in the frontend `.env` file.

Route calculation currently uses OpenStreetMap services through Nominatim geocoding and OSRM routing. The public Nominatim service is suitable only for light/temporary usage, requires app identification through `NOMINATIM_USER_AGENT`, and should be protected by cache/rate limits.

## 2. Build

Local validation:
- `npm install`
- `npm run build`

Production output:
- Vite compiles the React app into `dist/`
- Static hosting must rewrite SPA routes to `index.html`

## 3. Domain

Use a public domain for the app, for example:
- `https://app.yourdomain.com`

After attaching the domain in your hosting platform:
- Point DNS to the provider
- Enable HTTPS
- Configure SPA rewrites for React Router

If you use Supabase Auth redirects, add the production domain to the allowed redirect URLs in the Supabase dashboard.

## 4. Monitoramento

Supabase Edge Functions expose runtime logs in the dashboard.

Recommended monitoring:
- Review Edge Function logs for `optimize-route` and `analyze-product-import`
- Track hosting platform deploy failures
- Add external error monitoring if you need alerting, such as Sentry

## 5. Logs

Keep an eye on:
- Frontend deploy logs
- Supabase Edge Function logs
- Supabase database logs during incidents

Do not log secrets, JWTs, or personal data.

## 6. Backup

Recommended backup layers:
- Supabase automatic database backups
- Migration files committed to Git
- Periodic SQL export for disaster recovery
- Secure storage for production secrets outside Git

Restore checklist:
- Recreate the project
- Reapply migrations from `supabase/migrations`
- Restore data from the latest backup
- Recreate Edge Function secrets
- Redeploy the frontend and functions

## 7. Deploy Step by Step

1. Install dependencies.
2. Copy `.env.production.example` to your deployment environment.
3. Set frontend env vars in the hosting provider.
4. Set Edge Function secrets in Supabase.
5. Apply database migrations.
6. Deploy Edge Functions.
7. Deploy the frontend build.
8. Point the domain to the hosting provider.
9. Verify login, clients, products, routes, sales, and exports.
10. Check logs after first production traffic.

## 8. Files in This Repo

- `.env.example`
- `.env.production.example`
- `supabase/config.toml`
- `supabase/functions/analyze-product-import/config.toml`
- `supabase/functions/optimize-route/config.toml`
- `vercel.json`

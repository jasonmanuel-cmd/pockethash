# Pocket Hash

Pocket Hash is a demo-ready storefront, loyalty program, and POS dashboard built with Next.js, Drizzle, and SQLite/libSQL.

## Launch

```bash
npm install
npm run db:init
npm run db:seed-demo
npm run build
npm run start
```

Or on Windows, double-click `START_STORE.bat`.

The demo will:

1. Create the database tables if they do not exist.
2. Seed the catalog and demo members without duplicating existing data.
3. Build the production app.
4. Start the app at `http://localhost:3000`.

Local development uses `sqlite.db` by default, even if Turso credentials exist in `.env.local`. To force the app onto Turso, set `POCKETHASH_USE_REMOTE=true`.

If you want hot reloading while editing locally, run `npm run db:init`, `npm run db:seed-demo`, then `npm run dev`.

## Demo Paths

- Customer landing: `http://localhost:3000`
- Customer menu: sign in with `6615551111`
- Admin dashboard: `http://localhost:3000/admin`
- POS terminal: `http://localhost:3000/admin/pos`

## Demo Accounts

- `6615551111` - James "OG" Miller
- `6615552222` - Sarah Green
- `5555555555` - Master Admin

## Notes

- Customer dispatch orders now write into the live demo database.
- POS checkout validates prices and rewards on the server before saving the order.
- Re-running the seed scripts is safe for the default demo dataset.

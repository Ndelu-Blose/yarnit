# Yarn It! Website

Yarn It! is a handmade crochet product showcase website with a simple admin dashboard.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Customer-facing storefront |
| `admin.html` | Admin dashboard for managing demo products and photos |
| `store.js` | Shared localStorage helpers (products, photos, WhatsApp) |
| `shop.js` | Storefront behaviour |
| `admin.js` | Admin dashboard behaviour |
| `styles.css` | Boutique storefront styles |
| `config.js` | Social links and `assets/images/` path (edit here) |
| `assets/images/` | Static product photos (optional; admin upload also works) |

## Admin Login

Default login:

- **Username:** `admin`
- **Password:** `yarnit2024`

Change the password under **Settings** in the admin dashboard.

## How to Use

1. Open `index.html` in your browser to view the shop.
2. Open `admin.html` in the **same browser** to manage products.
3. Log in with the default details above.
4. Add or edit products and upload photos.
5. Set your WhatsApp number under **Settings**.
6. Refresh `index.html` to see changes.

### Demo checklist

- [ ] Shop loads (`index.html`)
- [ ] Admin login works (`admin.html`)
- [ ] Add a product with name, price, and category
- [ ] Upload a product image
- [ ] Save WhatsApp number in Settings
- [ ] Refresh the shop and confirm the product, image, and WhatsApp links appear

## Important Note

This version uses browser **localStorage**.

Product and settings changes only appear on the **same browser and device** where they were saved. That makes it suitable for a **client demo or offline preview**, not for a live public admin that multiple people use online.

The admin dashboard shows a banner reminding you of this limitation.

## Hosting (static preview)

Deploy the project folder as static files. Any of these work well:

- [Netlify](https://www.netlify.com/) — drag-and-drop or Git deploy
- [GitHub Pages](https://pages.github.com/)
- [Vercel](https://vercel.com/) — static hosting

No build step is required. Ensure `index.html`, `admin.html`, `store.js`, `shop.js`, and `admin.js` are deployed together.

## Supabase (live database)

This project can run in two modes:

| Mode | When | Admin login |
|------|------|-------------|
| **Demo** | No `supabase.env.js` | `admin` / `yarnit2024` (localStorage) |
| **Live** | `supabase.env.js` present | Supabase Auth email + password |

### Setup

1. **Install dependencies** (also used if you later move to Next.js):

   ```bash
   npm install
   npm run supabase:env
   ```

   Credentials live in `.env.local` (gitignored). `npm run supabase:env` writes `supabase.env.js` for the static HTML pages.

2. **Create database tables** — In [Supabase Dashboard](https://supabase.com/dashboard) → **SQL Editor**, run the full script:

   `supabase/migrations/001_yarnit_schema.sql`

3. **Create an admin user** — Dashboard → **Authentication** → **Users** → **Add user** (email + password). Use that email on `admin.html`.

4. **Serve the site** (scripts must load `supabase.env.js`):

   ```bash
   python -m http.server 8080
   ```

   Open http://localhost:8080/index.html (shop loads products from Supabase) and http://localhost:8080/admin.html (sign in with your Supabase user).

### Next.js / `@supabase/ssr` (optional)

The Supabase dashboard “Connect” wizard targets **Next.js** (`page.tsx`, middleware, etc.). This repo stays **plain HTML/CSS/JS** for now; `@supabase/ssr` is installed for a future Next.js app. For the current static site, only `@supabase/supabase-js` (via CDN + `supabase-client.js`) is used.

### Files

| File | Purpose |
|------|---------|
| `.env.local` | URL + publishable key (do not commit) |
| `supabase.env.js` | Generated browser config (gitignored) |
| `supabase-client.js` | Auth + client singleton |
| `supabase-data.js` | Products, settings, image upload |
| `supabase/migrations/001_yarnit_schema.sql` | Tables, RLS, storage bucket |

**Security:** Never commit `.env.local` or put the `service_role` key in frontend code. Rotate keys if they were shared publicly.

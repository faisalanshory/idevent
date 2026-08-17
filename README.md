# IDEvent - Multi-Tenant SaaS Ticketing Platform

IDEvent is a modern, premium SaaS event ticketing platform. It supports multiple organizers (tenants), dynamic subdomain customer storefronts (e.g. `jakartaevent.localhost:3000`), custom color branding, self-contained blogging/articles, organizer dashboards, and a central Superadmin console.

---

## 🚀 How to Run Locally

### 1. Set Up Environment Variables
Copy `.env.example` to `.env` in the root of the project:
```bash
cp .env.example .env
```
Provide a valid PostgreSQL connection string in `DATABASE_URL`.

> [!TIP]
> **Zero-Setup Quick Test (SQLite fallback)**
> If you don't have a PostgreSQL instance running locally and want to test the app instantly:
> 1. Open `prisma/schema.prisma` and edit the `datasource db` block:
>    ```prisma
>    datasource db {
>      provider = "sqlite"
>      url      = "file:./dev.db"
>    }
>    ```
> 2. Open `src/app/api/auth/register/route.ts`, `src/app/admin/organizers/actions.ts`, and `src/app/organizer/events/actions.ts`. Remove `@db.Text` or `Json?` references if SQLite complains, though the schema is standard. (Actually, for SQLite, change `Json?` to `String?` or keep PostgreSQL for production capability).

### 2. Generate Database Tables & Seed Mock Data
Once your `.env` contains your `DATABASE_URL`, run:
```bash
# Push schema definitions directly to database
npx prisma db push

# Seed mock accounts, events, and transactions
npx prisma db seed
```

### 3. Run the Development Server
```bash
npm run dev
```
The server will start on `http://localhost:3000`.

---

## 🔑 Demo Credentials

After seeding, you can log in at `http://localhost:3000/login` using the following:

*   **Superadmin Dashboard (`/admin`):**
    *   **Email:** `admin@idevent.com`
    *   **Password:** `admin123`
*   **Organizer A Panel (`/organizer`):**
    *   **Email:** `organizerA@idevent.com`
    *   **Password:** `organizer123`
    *   *Workspace Subdomain:* `jakartaevent`
*   **Organizer B Panel (`/organizer`):**
    *   **Email:** `organizerB@idevent.com`
    *   **Password:** `organizer123`
    *   *Workspace Subdomain:* `bandungconcerts`

### Customer Storefront Logins (My Tickets)
Customers log in through the storefront of each organizer (e.g., `http://[subdomain].localhost:3000/my-tickets`).

*   **Jakarta Event (`jakartaevent.localhost:3000`)**
    *   **Customer 1:** `budi@demo.com` / `demo1234` *(Has 3 orders)*
    *   **Customer 2:** `sari@demo.com` / `demo1234` *(Has 2 orders)*
*   **Bandung Concerts (`bandungconcerts.localhost:3000`)**
    *   **Customer 3:** `arif@demo.com` / `demo1234` *(Has 2 orders)*

---

## 🌐 Testing Subdomain Routing Locally

Modern web browsers (Chrome, Firefox, Edge) natively resolve `<any-subdomain>.localhost` to `127.0.0.1`. This means you can test subdomain routing locally without editing your hosts file!

1.  Open your browser and navigate to:
    *   `http://jakartaevent.localhost:3000` (Jakarta Event Storefront skinned in blue)
    *   `http://bandungconcerts.localhost:3000` (Bandung Concerts Storefront skinned in pink)
2.  Select a ticket tier, select a quantity, enter customer details, and hit "Proceed to Payment".
3.  Simulate a successful payment in the payment sandbox.
4.  View your unique generated ticket voucher featuring a custom SVG QR code!
5.  Log in to `organizerA@idevent.com` at `http://localhost:3000/login` to see the transaction count, total revenues, and tickets sold updated live in the dashboard!

---

## ☁️ Vercel Wildcard Subdomain Configuration

To deploy to Vercel with custom subdomains:

### 1. Deploy the Application
Push the project to a GitHub repository, connect it to Vercel, and configure the project setting environment variables:
*   `DATABASE_URL` (e.g. Neon, Supabase, or AWS RDS Postgres)
*   `JWT_SECRET` (A strong signature secret)
*   `NEXT_PUBLIC_ROOT_DOMAIN` (Your custom root domain, e.g., `myplatform.com`)
*   `NEXT_PUBLIC_COOKIE_DOMAIN` (Preceded by a dot to share session cookies, e.g., `.myplatform.com`)

### 2. Configure Wildcard Domains in Vercel
1.  Go to your project dashboard on Vercel.
2.  Navigate to **Settings** &rarr; **Domains**.
3.  Add your root domain: `myplatform.com`.
4.  Add a wildcard subdomain: `*.myplatform.com`.

### 3. Configure DNS Record in registrar
In your domain provider console (GoDaddy, Cloudflare, Namecheap), add a CNAME record:
*   **Type:** CNAME
*   **Name:** `*` (or CNAME target for subdomains)
*   **Value:** `cname.vercel-dns.com`

---

## 📂 Architecture Structure

*   `src/middleware.ts` — Detects hostnames, resolves tenant subdomains, and rewrites internally to `_sites/[subdomain]`.
*   `src/lib/jwt.ts` & `src/lib/auth.ts` — Edge-compatible JWT helpers using `jose` cookies.
*   `src/app/api/auth` — Registration, Login, and Logout cookies handlers.
*   `src/app/admin` — Central Superadmin panels.
*   `src/app/organizer` — Self-contained panels for event management, blogging, and branding styles.
*   `src/app/_sites/[subdomain]` — Dynamic storefront directories skinning Tailwind themes using HSL variable injections.

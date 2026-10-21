# Supabase Cloud Setup Guide (Step-by-Step)
**Project:** Icon Electromatic B2B Catalog  
**Time required:** ~3 to 5 minutes  
**Cost:** $0 / month (100% Free Tier)

---

### Step 1: Create a Free Supabase Project
1. Open [https://supabase.com](https://supabase.com) in your browser.
2. Click **Start your project** (or sign in with your GitHub/Google account).
3. Click **New Project** and select your organization.
4. Fill in the project details:
   - **Name:** `icon-electromatic`
   - **Database Password:** Enter a secure password (save this in your password manager).
   - **Region:** Choose **India (Mumbai)** or **Singapore** (closest to Icon Electromatic's customers).
   - **Pricing Plan:** Free ($0/month).
5. Click **Create new project** and wait ~60 seconds for the database to spin up.

---

### Step 2: Copy Your 2 API Keys
1. In your Supabase project dashboard, click the **Settings (gear icon)** at the bottom of the left sidebar.
2. Click on **API** in the settings menu.
3. Locate the **Project API keys** and **Project URL** section.
4. Copy these two values:
   - **Project URL:** Looks like `https://xyzabcdefg.supabase.co`
   - **Project API Key (`anon` `public`):** A long text starting with `eyJhbGciOi...`

---

### Step 3: Create `.env.local` on Your Computer
In your project folder (`c:\ICON ELECTROMATIC\`), create a file named `.env.local` and paste your copied keys:

```env
VITE_ENABLE_DEMO_ADMIN=true
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...your-copied-anon-key
```
*(Note: `.env.local` is git-ignored, so your secret keys will never be committed to GitHub).*

---

### Step 4: Run the Database Migrations & Seed Data
You have 3 SQL files already prepared in your `supabase/` folder. Run them one-by-one in the Supabase web dashboard:

1. In Supabase, click **SQL Editor** in the left sidebar (the icon looks like `>_`).
2. Click **New Query**.
3. **Migration 1 (Schema):**
   - Open [supabase/migrations/001_initial_schema.sql](file:///c:/ICON%20ELECTROMATIC/supabase/migrations/001_initial_schema.sql) on your computer.
   - Copy all contents, paste into the Supabase SQL Editor, and click the green **Run** button.
   - *(This creates all tables: products, oems, categories, images, enquiries, rate limits).*
4. **Migration 2 (Security & RLS):**
   - Open [supabase/migrations/002_rls_policies.sql](file:///c:/ICON%20ELECTROMATIC/supabase/migrations/002_rls_policies.sql).
   - Copy all contents, paste into a New Query, and click **Run**.
   - *(This locks the database so public visitors can only read published products, while staff can edit).*
5. **Migration 3 (Admin Schema Alignment & Storage):**
   - Open [supabase/migrations/003_admin_schema_alignment.sql](file:///c:/ICON%20ELECTROMATIC/supabase/migrations/003_admin_schema_alignment.sql).
   - Copy all contents, paste into a New Query, and click **Run**.
   - *(This adds CMS columns, sets up category slug scoping, and initializes the `catalog-images` storage bucket with staff RLS).*
6. **Migration 4 (Catalog Seed Data):**
   - Open [supabase/seed.sql](file:///c:/ICON%20ELECTROMATIC/supabase/seed.sql).
   - Copy all contents, paste into a New Query, and click **Run**.
   - *(This instantly populates all 15 OEMs, 88 categories, and 169 products with specs and image links).*

---

### Step 5: Create Staff Account & Provision Admin Role
To log in to your Admin CMS:
1. In Supabase, click **Authentication** in the left sidebar (users icon).
2. Click **Add user** -> **Create user**.
3. Enter your staff email and a strong password.
4. Check **Auto-confirm email** (so you don't need to verify via email) and click **Create user**.
5. **Assign Administrator Role (Mandatory for CMS access):**
   - Go to **SQL Editor** -> **New Query**.
   - Paste and run this command (replace `your-email@example.com` with the email you just created):
     ```sql
     INSERT INTO public.user_roles (user_id, role)
     SELECT id, 'admin' FROM auth.users WHERE email = 'your-email@example.com'
     ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
     ```
   *(This securely grants your user the `admin` role in `public.user_roles` without exposing passwords or service keys).*

---

### Step 6: Verify the Live Connection
1. In your terminal, run `npm run dev`.
2. Open `http://localhost:5173/#/admin` in your browser.
3. You will immediately see:
   - **`● Supabase Connected`** green badge in the topbar.
   - The login form authenticated against your live Supabase GoTrue server.
   - Products and OEMs persisted to your live PostgreSQL database!

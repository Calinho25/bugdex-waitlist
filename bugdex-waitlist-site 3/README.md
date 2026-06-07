# Bugdex waitlist landing page

A dependency-free, mobile-first Bugdex landing page with a Netlify Function and Supabase waitlist storage.

## What is included

- Responsive single-page landing page
- Uploaded Bugdex icon used as the favicon and navigation mark
- Real Bugdex app screenshots in the hero preview
- Two accessible waitlist forms with validation, loading, duplicate and success states
- Hidden honeypot field for basic spam protection
- `waitlist_signups` SQL schema
- Netlify Function for the server-side `/api/waitlist` endpoint

## Set up the database

1. Open your existing Bugdex Supabase project.
2. Open the Supabase SQL Editor.
3. Run `supabase/schema.sql`.

The new table contains:

- `id`
- `email`
- `created_at`
- `source`
- `status`

## Deploy on Netlify using GitHub

Because the waitlist submission uses a Netlify Function, deploy the site from a Git repository or with the Netlify CLI rather than using static drag-and-drop hosting alone.

1. Upload this folder to a GitHub repository.
2. In Netlify, choose **Add new project** and import the GitHub repository.
3. Netlify will read `netlify.toml`. No build command is required.
4. In Netlify, open **Project configuration → Environment variables**.
5. Add:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
6. Deploy the site.
7. Rename the generated `.netlify.app` subdomain in your Netlify domain settings if desired.

Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only. Do not add it to browser JavaScript or commit it to GitHub.

## Alternative deployment using Netlify CLI

From the project folder:

```bash
npm install -g netlify-cli
netlify login
netlify init
netlify env:set SUPABASE_URL "YOUR_SUPABASE_URL"
netlify env:set SUPABASE_SERVICE_ROLE_KEY "YOUR_SUPABASE_SERVICE_ROLE_KEY"
netlify deploy --prod
```

## Preview locally with working form submissions

```bash
npm install -g netlify-cli
netlify dev
```

Then open the local address shown in the terminal.

## Replace temporary values before launch

- Replace `https://bugdex.app/` in the metadata with the final `.netlify.app` URL once chosen.
- Replace `hello@bugdex.app` if you will use a different contact address.
- Replace `href="#"` on the Instagram footer link with the Bugdex Instagram URL when ready.

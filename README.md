# Today In Nerd History - Starter Project (Sci‑Fi Hologram UI)

This is a starter Next.js + Supabase project prepared for you. It includes:
- Frontend (Next.js + Tailwind)
- Supabase client config
- Simple feed with posts, image uploads, likes
- Instructions to deploy to Vercel + Supabase (free tiers)

**Admin Email (suggested for initial admin setup):**
travelingwithjim1@gmail.com

## Quick steps
1. Create a Supabase project (supabase.com). Copy the project URL and anon key.
2. Create a bucket named `post-images` (public).
3. Run the SQL in `/sql/schema.sql` in Supabase SQL editor.
4. Create a GitHub repo and push these files (or upload via GitHub web UI).
5. Create a Vercel project and connect it to the GitHub repo.
6. Add environment variables in Vercel:
   - NEXT_PUBLIC_SUPABASE_URL
   - NEXT_PUBLIC_SUPABASE_ANON_KEY
7. Deploy on Vercel. Visit the site and use email sign-in (magic link) to create accounts.
8. To make an admin account: in Supabase go to Authentication > Users, find the user id,
   then insert a row into `profiles` with role = 'admin', or run:
   ```
   insert into profiles (id, username, display_name, role) values ('<user_uuid>', 'admin', 'Admin', 'admin');
   ```

If you'd like, I can walk you through each step after you upload this repo to GitHub.

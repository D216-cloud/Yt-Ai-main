# Supabase Migration Guide ✅

This project now uses Supabase as the primary datastore. Follow the steps below to create the required tables and optionally migrate existing data from MongoDB.

## 1) Create tables in Supabase
- Open your Supabase project, go to "SQL" and paste `migrations/001_create_supabase_tables.sql` and run it.
- This creates `users`, `channels`, and `tokens` tables.

## 2) Prepare environment variables
For the migration script you need the service role key and the Mongo connection string (if migrating existing data):

- SUPABASE_URL
- SUPABASE_SERVICE_ROLE_KEY
- MONGO_URI (only if migrating existing Mongo data)

Add them locally (e.g., in `.env.local`) before running the migration script.

## 3) Run migration script (optional)
- Install dependencies (if not installed): `npm install`
- Run: `npm run migrate:supabase`
- The script will:
  - Upsert all users from MongoDB into Supabase `users` table (by email)
  - Upsert channels from MongoDB into Supabase `channels`, mapping to the correct `user_id`

## Notes & Next steps
- Double-check your column types and adjust the SQL file if your data needs different types.
- For production, set Row Level Security (RLS) and policies to control access.
- Consider storing refresh tokens in the `tokens` table (server-side only), and remove them from client-side storage.

If you want, I can also:
- Run a dry-run migration script that prints a sample of mapped rows first
- Add RLS policy SQL for basic protections
- Convert more API routes to use Supabase server helpers

Tell me which next step you'd like to take. — GitHub Copilot (Raptor mini (Preview))
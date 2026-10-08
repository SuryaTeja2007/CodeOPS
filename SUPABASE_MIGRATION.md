# Supabase migration

## 1. Create the database schema

Run `supabase/schema.sql` in the Supabase SQL Editor.

The schema creates the CodeOPS tables and the public `codeops-media` Storage bucket.

## 2. Configure the server

Copy `server/.env.example` to `server/.env` and set:

- `SUPABASE_URL`
- `SUPABASE_SECRET_KEY`
- `JWT_SECRET`
- `CLIENT_ORIGIN`

Keep `server/.env` out of Git.

## 3. Install dependencies

From `server/`:

```bash
npm install
```

## 4. Create the first admin

```bash
npm run create-admin
```

## 5. Optional: migrate existing MongoDB data

Set `MONGO_URI` and `MONGO_DB` in `server/.env`, then run:

```bash
npm run migrate-mongo
```

The migration upserts the existing CodeOPS collections into Supabase without carrying MongoDB ObjectIds across.

## 6. Start the API

```bash
npm run dev
```

Uploaded images are now stored in Supabase Storage rather than the server filesystem.

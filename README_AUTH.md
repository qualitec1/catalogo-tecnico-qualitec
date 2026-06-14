# Supabase + Nuxt 4 Authentication (server-side sessions)

Quick guide to run the authentication system included in this project.

## Install dependencies

```bash
npm install @supabase/supabase-js h3 cookie
```

## Environment

Copy `.env.example` to `.env` and fill:

```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key # server-only
```

## Database migration (Supabase CLI)

1. Install and login:

```bash
npm install -g supabase
supabase login
```

2. Link project and push migrations:

```bash
supabase link --project-ref <project-ref>
supabase db push migrations/
```

## Run dev

```bash
npx nuxi dev
```

## Endpoints

- `POST /api/auth/login` -> body `{ email, password, totp? }` sets httpOnly cookies
- `POST /api/auth/logout` -> clears cookies
- `POST /api/auth/refresh` -> exchanges refresh token for new session
- `GET /api/auth/session` -> returns current user if session valid
- `POST /api/auth/totp/setup` -> body `{ email, password, seed }` enables TOTP for the account

## Security notes

- Keep `SUPABASE_SERVICE_ROLE_KEY` secret and never expose it to client.
- Use HTTPS in production and set cookie `secure` to true.
- Configure Redirect URLs and CORS in Supabase Dashboard.
- Enforce email verification, password policy and rate-limiting.

